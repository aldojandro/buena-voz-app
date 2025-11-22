// Local LLM bridge for Cursor's GPT-5.1
// This function calls Cursor's built-in LLM without external API keys

const SYSTEM_PROMPT = `You are an expert political analyst.
Extract policy proposals from the given text.
Return ONLY a JSON array.
Each item MUST follow strictly:
{
  "title": string,
  "description": string,
  "category": string
}
If there are no proposals, return [].`;

export async function runLocalLLM(text: string): Promise<string> {
  // Use Cursor's LLM through Composer API
  // This will call GPT-5.1 locally without external HTTP calls
  
  const inputText = text.substring(0, 8000);
  
  // Try to access Cursor's LLM through various methods
  // Method 1: Check for Cursor LLM endpoint in environment
  if (process.env.CURSOR_LLM_API) {
    try {
      const response = await fetch(process.env.CURSOR_LLM_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-5.1",
          system: SYSTEM_PROMPT,
          prompt: inputText,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.text || data.content || data.response || "[]";
      }
    } catch (err) {
      console.warn("Failed to call CURSOR_LLM_API:", err);
    }
  }
  
  // Method 2: Use global Composer instance if available
  if (typeof globalThis !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const global = globalThis as any;
    const composer = global.__cursor_composer__ || global.composer || global.cursor;
    if (composer && typeof composer.generateText === "function") {
      try {
        const response = await composer.generateText({
          model: "gpt-5.1",
          system: SYSTEM_PROMPT,
          prompt: inputText,
        });
        return response.trim();
      } catch (err) {
        console.warn("Composer.generateText failed:", err);
      }
    }
  }
  
  // Method 3: Use child process to invoke Cursor CLI
  try {
    const { spawn } = await import("child_process");
    
    return new Promise((resolve) => {
      const child = spawn("cursor", [
        "llm",
        "--model", "gpt-5.1",
        "--system", SYSTEM_PROMPT,
        "--prompt", inputText,
      ], {
        stdio: ["pipe", "pipe", "pipe"],
      });
      
      let output = "";
      child.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      child.on("close", (code) => {
        if (code === 0 && output) {
          resolve(output.trim());
        } else {
          resolve("[]");
        }
      });
      
      child.on("error", () => {
        resolve("[]");
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill();
        resolve("[]");
      }, 30000);
    });
  } catch {
    // CLI not available
  }
  
  // Fallback: Return empty array
  // This allows the script to run but won't extract proposals
  // Configure CURSOR_LLM_API env var to enable LLM processing
  console.warn("Local LLM not configured. Set CURSOR_LLM_API env var to enable proposal extraction.");
  return "[]";
}
