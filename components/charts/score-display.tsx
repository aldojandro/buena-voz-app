"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ScoreDisplayProps {
  candidateAName: string;
  candidateBName: string;
  scoreA: number;
  scoreB: number;
}

export function ScoreDisplay({
  candidateAName,
  candidateBName,
  scoreA,
  scoreB,
}: ScoreDisplayProps) {
  const formatScore = (score: number) => Math.round(score * 100);
  const getScoreLabel = (score: number) => {
    if (score >= 0.7) return "Alto";
    if (score >= 0.5) return "Medio";
    if (score >= 0.3) return "Bajo";
    return "Muy bajo";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{candidateAName}</CardTitle>
          <CardDescription>Puntuación del Plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatScore(scoreA)}%</span>
            <Badge variant="secondary">{getScoreLabel(scoreA)}</Badge>
          </div>
          <Progress value={formatScore(scoreA)} className="h-3" />
          <p className="text-sm text-muted-foreground">
            Nivel de detalle y especificidad de las propuestas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{candidateBName}</CardTitle>
          <CardDescription>Puntuación del Plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{formatScore(scoreB)}%</span>
            <Badge variant="secondary">{getScoreLabel(scoreB)}</Badge>
          </div>
          <Progress value={formatScore(scoreB)} className="h-3" />
          <p className="text-sm text-muted-foreground">
            Nivel de detalle y especificidad de las propuestas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

