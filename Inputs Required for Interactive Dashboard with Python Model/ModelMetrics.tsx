import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function ModelMetrics() {
  const { data: metrics, isLoading } = trpc.analytics.modelMetrics.useQuery();
  const { data: stats } = trpc.analytics.datasetStats.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading model metrics...</p>
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
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Model Performance Metrics</h1>
            <p className="text-slate-400">Comprehensive evaluation of the XGBoost classifier</p>
          </div>

          {stats && (
            <Card className="bg-slate-900/50 border-slate-800 mb-6">
              <CardHeader>
                <CardTitle className="text-slate-100">Dataset Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Total Records</div>
                    <div className="text-3xl font-bold text-slate-100">
                      {stats.total_records.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Repaid (Class 1)</div>
                    <div className="text-3xl font-bold text-green-400">
                      {stats.class_distribution.class_1.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {((stats.class_distribution.class_1 / stats.total_records) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-sm text-slate-400 mb-1">Delinquent (Class 0)</div>
                    <div className="text-3xl font-bold text-red-400">
                      {stats.class_distribution.class_0.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {((stats.class_distribution.class_0 / stats.total_records) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {metrics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Accuracy</CardTitle>
                    <CardDescription className="text-slate-400">Overall correctness</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-blue-400">
                      {(metrics.accuracy * 100).toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Precision</CardTitle>
                    <CardDescription className="text-slate-400">Positive prediction accuracy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-400">
                      {(metrics.precision * 100).toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Recall</CardTitle>
                    <CardDescription className="text-slate-400">True positive rate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-purple-400">
                      {(metrics.recall * 100).toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-100">F1 Score</CardTitle>
                    <CardDescription className="text-slate-400">Harmonic mean of precision and recall</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-orange-400">
                      {(metrics.f1_score * 100).toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-slate-100">ROC AUC</CardTitle>
                    <CardDescription className="text-slate-400">Area under ROC curve</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-pink-400">
                      {(metrics.roc_auc * 100).toFixed(2)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100">Confusion Matrix</CardTitle>
                  <CardDescription className="text-slate-400">
                    Classification breakdown across actual vs predicted values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-lg text-center">
                      <div className="text-sm text-slate-400 mb-2">True Negative</div>
                      <div className="text-3xl font-bold text-green-400">
                        {metrics.confusion_matrix.true_negative.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Correctly predicted delinquent</div>
                    </div>

                    <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-lg text-center">
                      <div className="text-sm text-slate-400 mb-2">False Positive</div>
                      <div className="text-3xl font-bold text-red-400">
                        {metrics.confusion_matrix.false_positive.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Predicted repay, actually delinquent</div>
                    </div>

                    <div className="p-6 bg-red-500/10 border-2 border-red-500/30 rounded-lg text-center">
                      <div className="text-sm text-slate-400 mb-2">False Negative</div>
                      <div className="text-3xl font-bold text-red-400">
                        {metrics.confusion_matrix.false_negative.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Predicted delinquent, actually repaid</div>
                    </div>

                    <div className="p-6 bg-green-500/10 border-2 border-green-500/30 rounded-lg text-center">
                      <div className="text-sm text-slate-400 mb-2">True Positive</div>
                      <div className="text-3xl font-bold text-green-400">
                        {metrics.confusion_matrix.true_positive.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Correctly predicted repay</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
