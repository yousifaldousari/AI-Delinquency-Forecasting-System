import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatPercentage } from "@/lib/currency";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function ModelPerformance() {
  const { data: performance, isLoading } = trpc.dashboard.performance.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading model performance...</p>
        </div>
      </div>
    );
  }

  if (!performance?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load performance data</p>
        </div>
      </div>
    );
  }

  const data = performance;
  const cm = data.confusion_matrix;

  // Calculate additional metrics
  const specificity = cm.true_negatives / (cm.true_negatives + cm.false_positives);
  const sensitivity = cm.true_positives / (cm.true_positives + cm.false_negatives);

  const getMetricColor = (value: number) => {
    if (value >= 0.9) return "text-green-600";
    if (value >= 0.8) return "text-blue-600";
    if (value >= 0.7) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Model Performance</h1>
          <p className="text-slate-600">XGBoost classifier trained on telecom delinquency data</p>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">F1 Score</CardTitle>
              <CardDescription className="text-xs">Primary metric</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getMetricColor(data.f1_score)}`}>
                {formatPercentage(data.f1_score)}
              </div>
              <p className="text-xs text-slate-500 mt-2">Balanced precision-recall</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Accuracy</CardTitle>
              <CardDescription className="text-xs">Overall correctness</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getMetricColor(data.accuracy)}`}>
                {formatPercentage(data.accuracy)}
              </div>
              <p className="text-xs text-slate-500 mt-2">Correct predictions</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">AUC-ROC</CardTitle>
              <CardDescription className="text-xs">Discrimination ability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getMetricColor(data.auc)}`}>
                {formatPercentage(data.auc)}
              </div>
              <p className="text-xs text-slate-500 mt-2">Area under curve</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Precision</CardTitle>
              <CardDescription className="text-xs">Positive predictive value</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-4xl font-bold ${getMetricColor(data.precision)}`}>
                {formatPercentage(data.precision)}
              </div>
              <p className="text-xs text-slate-500 mt-2">False positive rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Classification Metrics</CardTitle>
              <CardDescription>Detailed performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Recall (Sensitivity)</span>
                  <span className="text-2xl font-bold text-slate-900">{formatPercentage(sensitivity)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-700 font-medium">Specificity</span>
                  <span className="text-2xl font-bold text-slate-900">{formatPercentage(specificity)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-slate-700 font-medium">Model Type</span>
                  <span className="text-sm font-medium text-blue-700">XGBoost Classifier</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Confusion Matrix</CardTitle>
              <CardDescription>Prediction breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-xs text-green-700 font-medium mb-2">True Negatives</p>
                  <p className="text-3xl font-bold text-green-600">{cm.true_negatives.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-xs text-red-700 font-medium mb-2">False Positives</p>
                  <p className="text-3xl font-bold text-red-600">{cm.false_positives.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-xs text-red-700 font-medium mb-2">False Negatives</p>
                  <p className="text-3xl font-bold text-red-600">{cm.false_negatives.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <p className="text-xs text-green-700 font-medium mb-2">True Positives</p>
                  <p className="text-3xl font-bold text-green-600">{cm.true_positives.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model Summary */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle>Model Summary</CardTitle>
            <CardDescription>Business context and interpretation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">High Discrimination Ability</p>
                    <p className="text-sm text-blue-800 mt-1">AUC-ROC of {formatPercentage(data.auc)} indicates excellent ability to distinguish between delinquent and non-delinquent customers.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Balanced Performance</p>
                    <p className="text-sm text-amber-800 mt-1">F1 Score of {formatPercentage(data.f1_score)} reflects good balance between precision and recall, suitable for business decision-making.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Production Ready</p>
                    <p className="text-sm text-green-800 mt-1">The model demonstrates strong performance metrics and is suitable for deployment in production environments for risk prediction.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
