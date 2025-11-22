import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Buena Voz App</CardTitle>
            <CardDescription>Government plan ingestion pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Welcome to your Next.js application with Prisma, Tailwind CSS, and Shadcn UI.
            </p>
            <div className="mt-4">
              <Button>Get Started</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
