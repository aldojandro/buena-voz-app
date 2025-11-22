"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ThematicData {
  category: string;
  candidateA: number;
  candidateB: number;
}

interface ThematicComparisonChartProps {
  data: ThematicData[];
  candidateAName: string;
  candidateBName: string;
}

export function ThematicComparisonChart({
  data,
  candidateAName,
  candidateBName,
}: ThematicComparisonChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Propuestas por Categoría Temática</CardTitle>
        <CardDescription>
          Comparación del número de propuestas por categoría entre ambos candidatos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="category"
              type="category"
              width={150}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="candidateA"
              fill="#3b82f6"
              name={candidateAName}
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="candidateB"
              fill="#ef4444"
              name={candidateBName}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

