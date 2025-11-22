"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TypologyData {
  typology: string;
  candidateA: number;
  candidateB: number;
}

interface TypologyChartProps {
  data: TypologyData[];
  candidateAName: string;
  candidateBName: string;
}

const COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
];

const TYPOLOGY_LABELS: Record<string, string> = {
  continuidad: "Continuidad",
  mejora: "Mejora",
  reforma: "Reforma",
  ruptura: "Ruptura",
  sin_detalle: "Sin detalle",
};

export function TypologyChart({
  data,
  candidateAName,
  candidateBName,
}: TypologyChartProps) {
  // Transform data for pie charts
  const candidateAData = data.map((item) => ({
    name: TYPOLOGY_LABELS[item.typology] || item.typology,
    value: item.candidateA,
  }));

  const candidateBData = data.map((item) => ({
    name: TYPOLOGY_LABELS[item.typology] || item.typology,
    value: item.candidateB,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{candidateAName}</CardTitle>
          <CardDescription>Tipología de propuestas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={candidateAData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {candidateAData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{candidateBName}</CardTitle>
          <CardDescription>Tipología de propuestas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={candidateBData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {candidateBData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

