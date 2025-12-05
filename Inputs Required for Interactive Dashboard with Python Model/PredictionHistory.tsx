import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PredictionHistory() {
  const { data: predictions, isLoading } = trpc.prediction.history.useQuery({ limit: 100 });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading prediction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-slate-400 hover:text-slate-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Prediction History</h1>
            <p className="text-slate-400">Your recent predictions and their results</p>
          </div>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Recent Predictions</CardTitle>
              <CardDescription className="text-slate-400">
                {predictions?.length || 0} predictions found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions && predictions.length > 0 ? (
                <div className="rounded-lg border border-slate-800 overflow-hidden">
                  <div className="max-h-[600px] overflow-y-auto">
                    <Table>
                      <TableHeader className="bg-slate-800/50 sticky top-0">
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Date</TableHead>
                          <TableHead className="text-slate-300">Type</TableHead>
                          <TableHead className="text-slate-300">Prediction</TableHead>
                          <TableHead className="text-slate-300">Probability</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {predictions.map((pred) => (
                          <TableRow key={pred.id} className="border-slate-800">
                            <TableCell className="text-slate-300">
                              {new Date(pred.createdAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  pred.predictionType === "single"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                    : "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                }
                              >
                                {pred.predictionType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  pred.prediction === 1
                                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                                    : "bg-red-500/10 text-red-400 border-red-500/30"
                                }
                              >
                                {pred.prediction === 1 ? "WILL REPAY" : "DELINQUENT"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {(parseFloat(pred.probability) * 100).toFixed(2)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-400">No predictions yet. Start making predictions to see your history.</p>
                  <Link href="/predict">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                      Make Your First Prediction
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
