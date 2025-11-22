"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailLevelData {
  topic: string;
  candidateA: number;
  candidateB: number;
}

interface DetailRadarChartProps {
  data: DetailLevelData[];
  candidateAName: string;
  candidateBName: string;
}

export function DetailRadarChart({
  data,
  candidateAName,
  candidateBName,
}: DetailRadarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nivel de Detalle por Tema</CardTitle>
        <CardDescription>
          Comparación del nivel de detalle (escala 1-5) en diferentes temas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="topic"
              tick={{ fontSize: 12 }}
              style={{ fontSize: "12px" }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 5]} />
            <Radar
              name={candidateAName}
              dataKey="candidateA"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Radar
              name={candidateBName}
              dataKey="candidateB"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

