export function info(message: string) {
  console.log(`ℹ️  ${message}`);
}

export function step(message: string) {
  console.log(`→ ${message}`);
}

export function success(message: string) {
  console.log(`✅ ${message}`);
}

export function error(message: string, err?: unknown) {
  console.error(`❌ ${message}`);
  if (err) {
    console.error(err);
  }
}

