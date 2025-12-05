import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function FeatureImportance() {
  const { data: features, isLoading } = trpc.analytics.featureImportance.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading feature importance...</p>
        </div>
      </div>
    );
  }

  const topFeatures = features?.slice(0, 15) || [];
  const colors = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
    "#06b6d4", "#6366f1", "#f97316", "#14b8a6", "#a855f7",
    "#ef4444", "#84cc16", "#f43f5e", "#0ea5e9", "#22c55e"
  ];

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
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Feature Importance</h1>
            <p className="text-slate-400">Understanding which features drive model predictions</p>
          </div>

          <Card className="bg-slate-900/50 border-slate-800 mb-6">
            <CardHeader>
              <CardTitle className="text-slate-100">Top 15 Most Important Features</CardTitle>
              <CardDescription className="text-slate-400">
                Features ranked by their contribution to model predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topFeatures} layout="vertical" margin={{ left: 200, right: 20, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis type="category" dataKey="display_name" stroke="#94a3b8" width={180} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                      formatter={(value: any) => [value.toFixed(4), "Importance"]}
                    />
                    <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                      {topFeatures.map((_entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">All Features Ranked</CardTitle>
              <CardDescription className="text-slate-400">
                Complete list of features sorted by importance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features?.map((feature: any, index: number) => (
                  <div key={feature.feature} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg">
                    <div className="text-sm font-semibold text-slate-400 w-8">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">{feature.display_name}</div>
                      <div className="text-xs text-slate-500">{feature.feature}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono text-slate-300">
                        {feature.importance.toFixed(4)}
                      </div>
                      <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${(feature.importance / (features[0]?.importance || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
