import { notFound } from "next/navigation";
import { fetchComparisonData } from "@/lib/analytics/comparison";
import { detailLevelToScore, normalizeCategoryName } from "@/lib/analytics/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThematicComparisonChart } from "@/components/charts/thematic-comparison-chart";
import { TypologyChart } from "@/components/charts/typology-chart";
import { DetailRadarChart } from "@/components/charts/detail-radar-chart";
import { ScoreDisplay } from "@/components/charts/score-display";

interface PageProps {
  params: {
    candidateA: string;
    candidateB: string;
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { candidateA, candidateB } = params;

  const comparisonData = await fetchComparisonData(candidateA, candidateB);

  if (!comparisonData) {
    notFound();
  }

  const { candidateA: dataA, candidateB: dataB } = comparisonData;

  // Parse candidate metadata
  const metadataA = dataA.candidate.position
    ? JSON.parse(dataA.candidate.position)
    : {};
  const metadataB = dataB.candidate.position
    ? JSON.parse(dataB.candidate.position)
    : {};

  // Prepare thematic comparison data
  const thematicMap = new Map<string, { candidateA: number; candidateB: number }>();
  
  dataA.thematic.forEach((item) => {
    const normalized = normalizeCategoryName(item.category);
    thematicMap.set(normalized, {
      candidateA: item.count,
      candidateB: 0,
    });
  });

  dataB.thematic.forEach((item) => {
    const normalized = normalizeCategoryName(item.category);
    const existing = thematicMap.get(normalized);
    if (existing) {
      existing.candidateB = item.count;
    } else {
      thematicMap.set(normalized, {
        candidateA: 0,
        candidateB: item.count,
      });
    }
  });

  const thematicComparisonData = Array.from(thematicMap.entries())
    .map(([category, counts]) => ({
      category,
      candidateA: counts.candidateA,
      candidateB: counts.candidateB,
    }))
    .sort((a, b) => (b.candidateA + b.candidateB) - (a.candidateA + a.candidateB));

  // Prepare typology comparison data
  const typologyMap = new Map<string, { candidateA: number; candidateB: number }>();

  dataA.typology.forEach((item) => {
    typologyMap.set(item.typology, {
      candidateA: item.count,
      candidateB: 0,
    });
  });

  dataB.typology.forEach((item) => {
    const existing = typologyMap.get(item.typology);
    if (existing) {
      existing.candidateB = item.count;
    } else {
      typologyMap.set(item.typology, {
        candidateA: 0,
        candidateB: item.count,
      });
    }
  });

  const typologyComparisonData = Array.from(typologyMap.entries()).map(
    ([typology, counts]) => ({
      typology,
      candidateA: counts.candidateA,
      candidateB: counts.candidateB,
    })
  );

  // Prepare detail levels data
  const insightsA = dataA.insights;
  const insightsB = dataB.insights;

  const detailLevelsA = insightsA?.detailLevels as Record<string, string[]> | undefined;
  const detailLevelsB = insightsB?.detailLevels as Record<string, string[]> | undefined;

  const detailTopics = new Set<string>();
  if (detailLevelsA) {
    Object.keys(detailLevelsA).forEach((key) => detailTopics.add(key));
  }
  if (detailLevelsB) {
    Object.keys(detailLevelsB).forEach((key) => detailTopics.add(key));
  }

  const detailRadarData = Array.from(detailTopics).map((topic) => {
    const levelA = detailLevelsA?.[topic];
    const levelB = detailLevelsB?.[topic];

    let scoreA = 1;
    let scoreB = 1;

    if (levelA) {
      if (levelA.includes("alto")) scoreA = 5;
      else if (levelA.includes("medio")) scoreA = 3;
    }

    if (levelB) {
      if (levelB.includes("alto")) scoreB = 5;
      else if (levelB.includes("medio")) scoreB = 3;
    }

    return {
      topic: topic.charAt(0).toUpperCase() + topic.slice(1),
      candidateA: scoreA,
      candidateB: scoreB,
    };
  });

  // Get scores
  const scoreA = (insightsA?.score as any)?.final_score || 0;
  const scoreB = (insightsB?.score as any)?.final_score || 0;

  // Get overview data
  const overviewA = insightsA?.overview as any;
  const overviewB = insightsB?.overview as any;

  // Get patterns data
  const patternsA = insightsA?.patterns as any;
  const patternsB = insightsB?.patterns as any;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Comparación de Planes de Gobierno</h1>
        <p className="text-muted-foreground">
          Análisis comparativo de las propuestas y planes de gobierno
        </p>
      </div>

      <Separator />

      {/* Candidate Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{dataA.candidate.name}</CardTitle>
            <CardDescription>{dataA.candidate.party}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Partido:</span>
              <Badge variant="outline">{dataA.candidate.party}</Badge>
            </div>
            {metadataA.ideology && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Ideología:</span>
                <Badge variant="secondary">{metadataA.ideology}</Badge>
              </div>
            )}
            {dataA.document.url && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Documento:</span>
                <a
                  href={dataA.document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver documento
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Año:</span>
              <span className="text-sm">2021</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{dataB.candidate.name}</CardTitle>
            <CardDescription>{dataB.candidate.party}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Partido:</span>
              <Badge variant="outline">{dataB.candidate.party}</Badge>
            </div>
            {metadataB.ideology && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Ideología:</span>
                <Badge variant="secondary">{metadataB.ideology}</Badge>
              </div>
            )}
            {dataB.document.url && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Documento:</span>
                <a
                  href={dataB.document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver documento
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Año:</span>
              <span className="text-sm">2021</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Comparison */}
      <ScoreDisplay
        candidateAName={dataA.candidate.name}
        candidateBName={dataB.candidate.name}
        scoreA={scoreA}
        scoreB={scoreB}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="themes">Temas</TabsTrigger>
          <TabsTrigger value="typologies">Tipologías</TabsTrigger>
          <TabsTrigger value="detail">Detalle</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen - {dataA.candidate.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overviewA?.summary && (
                  <div>
                    <h4 className="font-semibold mb-2">Resumen Ejecutivo</h4>
                    <p className="text-sm text-muted-foreground">
                      {overviewA.summary}
                    </p>
                  </div>
                )}
                {overviewA?.main_topics && Array.isArray(overviewA.main_topics) && (
                  <div>
                    <h4 className="font-semibold mb-2">Temas Principales</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {overviewA.main_topics.slice(0, 5).map((topic: string, idx: number) => (
                        <li key={idx}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen - {dataB.candidate.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {overviewB?.summary && (
                  <div>
                    <h4 className="font-semibold mb-2">Resumen Ejecutivo</h4>
                    <p className="text-sm text-muted-foreground">
                      {overviewB.summary}
                    </p>
                  </div>
                )}
                {overviewB?.main_topics && Array.isArray(overviewB.main_topics) && (
                  <div>
                    <h4 className="font-semibold mb-2">Temas Principales</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {overviewB.main_topics.slice(0, 5).map((topic: string, idx: number) => (
                        <li key={idx}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Themes Tab */}
        <TabsContent value="themes" className="space-y-6">
          <ThematicComparisonChart
            data={thematicComparisonData}
            candidateAName={dataA.candidate.name}
            candidateBName={dataB.candidate.name}
          />

          <Card>
            <CardHeader>
              <CardTitle>Desglose por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead>{dataA.candidate.name}</TableHead>
                    <TableHead>{dataB.candidate.name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {thematicComparisonData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell>{item.candidateA}</TableCell>
                      <TableCell>{item.candidateB}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typologies Tab */}
        <TabsContent value="typologies" className="space-y-6">
          <TypologyChart
            data={typologyComparisonData}
            candidateAName={dataA.candidate.name}
            candidateBName={dataB.candidate.name}
          />

          <Card>
            <CardHeader>
              <CardTitle>Desglose por Tipología</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipología</TableHead>
                    <TableHead>{dataA.candidate.name}</TableHead>
                    <TableHead>{dataB.candidate.name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {typologyComparisonData.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.typology}</TableCell>
                      <TableCell>{item.candidateA}</TableCell>
                      <TableCell>{item.candidateB}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detail Tab */}
        <TabsContent value="detail" className="space-y-6">
          {detailRadarData.length > 0 && (
            <DetailRadarChart
              data={detailRadarData}
              candidateAName={dataA.candidate.name}
              candidateBName={dataB.candidate.name}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Niveles de Detalle - {dataA.candidate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {detailLevelsA && (
                  <div className="space-y-4">
                    {Object.entries(detailLevelsA).map(([level, topics]) => (
                      <div key={level}>
                        <Badge variant="outline" className="mb-2">
                          {level === "alto" ? "Alto" : level === "medio" ? "Medio" : "Bajo"}
                        </Badge>
                        <ul className="list-disc list-inside text-sm text-muted-foreground ml-2">
                          {Array.isArray(topics) &&
                            topics.slice(0, 3).map((topic: string, idx: number) => (
                              <li key={idx}>{topic.substring(0, 150)}...</li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Niveles de Detalle - {dataB.candidate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {detailLevelsB && (
                  <div className="space-y-4">
                    {Object.entries(detailLevelsB).map(([level, topics]) => (
                      <div key={level}>
                        <Badge variant="outline" className="mb-2">
                          {level === "alto" ? "Alto" : level === "medio" ? "Medio" : "Bajo"}
                        </Badge>
                        <ul className="list-disc list-inside text-sm text-muted-foreground ml-2">
                          {Array.isArray(topics) &&
                            topics.slice(0, 3).map((topic: string, idx: number) => (
                              <li key={idx}>{topic.substring(0, 150)}...</li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patrones - {dataA.candidate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {patternsA?.repetitions && Array.isArray(patternsA.repetitions) && (
                    <AccordionItem value="repetitions">
                      <AccordionTrigger>Repeticiones</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {patternsA.repetitions.slice(0, 5).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {patternsA?.tensions && Array.isArray(patternsA.tensions) && (
                    <AccordionItem value="tensions">
                      <AccordionTrigger>Tensiones</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {patternsA.tensions.slice(0, 5).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {patternsA?.consistent_themes && Array.isArray(patternsA.consistent_themes) && (
                    <AccordionItem value="consistent">
                      <AccordionTrigger>Temas Consistentes</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {patternsA.consistent_themes.slice(0, 5).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Patrones - {dataB.candidate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {patternsB?.repetitions && Array.isArray(patternsB.repetitions) && (
                    <AccordionItem value="repetitions">
                      <AccordionTrigger>Repeticiones</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {patternsB.repetitions.slice(0, 5).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {patternsB?.tensions && Array.isArray(patternsB.tensions) && (
                    <AccordionItem value="tensions">
                      <AccordionTrigger>Tensiones</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {patternsB.tensions.slice(0, 5).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {patternsB?.consistent_themes && Array.isArray(patternsB.consistent_themes) && (
                    <AccordionItem value="consistent">
                      <AccordionTrigger>Temas Consistentes</AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {patternsB.consistent_themes.slice(0, 5).map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

