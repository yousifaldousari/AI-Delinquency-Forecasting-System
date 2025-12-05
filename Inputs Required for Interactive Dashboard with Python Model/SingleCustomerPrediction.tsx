import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { formatPercentage, formatIDRCompact } from "@/lib/currency";
import { FeatureTooltip } from "@/components/FeatureTooltip";
import { AlertCircle, CheckCircle, TrendingUp, Loader2, Target } from "lucide-react";

export default function SingleCustomerPrediction() {
  const [formData, setFormData] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: schema, isLoading: schemaLoading } = trpc.prediction.getFeatureSchema.useQuery();
  const { data: featureMap } = trpc.prediction.getFeatureMapping.useQuery();
  const { data: importance } = trpc.prediction.getFeatureImportance.useQuery();
  const predictMutation = trpc.prediction.singlePredict.useMutation();

  if (schemaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
          <p className="mt-4 text-slate-600">Loading feature schema...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    if (value === '') {
      // Remove field if empty (will use median)
      const newData = { ...formData };
      delete newData[field];
      setFormData(newData);
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: parseFloat(value)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const result = await predictMutation.mutateAsync(formData);
      setPrediction(result.prediction);
    } catch (err: any) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (probability: number) => {
    if (probability < 0.33) return "text-green-600";
    if (probability < 0.67) return "text-amber-600";
    return "text-red-600";
  };

  const getRiskBgColor = (probability: number) => {
    if (probability < 0.33) return "bg-green-50 border-green-200";
    if (probability < 0.67) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getRiskLabel = (probability: number) => {
    if (probability < 0.33) return "Low Risk";
    if (probability < 0.67) return "Medium Risk";
    return "High Risk";
  };

  const getFeatureDescription = (field: string): string => {
    if (featureMap && featureMap[field]) {
      return featureMap[field];
    }
    return "Customer behaviour metric used for delinquency prediction";
  };

  const baseInputs = schema?.base_inputs || {};
  
  // Sort features by importance if available
  let sortedFields = Object.keys(baseInputs);
  if (importance && importance.features_by_importance) {
    sortedFields = sortedFields.sort((a, b) => {
      const aIndex = importance.features_by_importance.indexOf(a);
      const bIndex = importance.features_by_importance.indexOf(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }

  // Show top 15 most important features
  const topFields = sortedFields.slice(0, 15);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Single Customer Prediction</h1>
          <p className="text-slate-600">Enter customer data to predict delinquency risk. Missing values will be filled automatically.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Customer Information
                </CardTitle>
                <CardDescription>
                  Enter key customer metrics. Fields are ordered by importance. Leave empty to use median values.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topFields.map((field, index) => (
                      <div key={field} className="relative">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">#{index + 1}</span>
                          {String(baseInputs[field])}
                          <FeatureTooltip description={getFeatureDescription(field)} />
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData[field] || ''}
                          onChange={(e) => handleInputChange(field, e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Auto-filled if empty"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Predicting...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Predict Delinquency Risk
                        </>
                      )}
                    </Button>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Prediction Error</p>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {prediction ? (
              <div className="space-y-4">
                {/* Risk Score Card */}
                <Card className={`border-2 ${getRiskBgColor(prediction.probability)}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">Prediction Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getRiskColor(prediction.probability)} mb-2`}>
                        {formatPercentage(prediction.probability * 100)}
                      </div>
                      <div className={`text-lg font-semibold ${getRiskColor(prediction.probability)}`}>
                        {getRiskLabel(prediction.probability)}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">Probability of Delinquency</p>
                    </div>

                    <div className="pt-4 border-t border-slate-300">
                      <p className="text-sm font-medium text-slate-700 mb-2">Risk Classification:</p>
                      <div className="flex items-center gap-2">
                        {prediction.probability < 0.33 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        )}
                        <span className="text-sm text-slate-600">
                          {prediction.probability < 0.33
                            ? "Customer is likely to repay on time"
                            : prediction.probability < 0.67
                            ? "Customer shows moderate delinquency risk"
                            : "Customer shows high delinquency risk"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Factors Card */}
                <Card className="bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Key Risk Factors
                    </CardTitle>
                    <CardDescription>
                      Top factors influencing this prediction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {importance && importance.features_by_importance && importance.features_by_importance.slice(0, 5).map((feat: string, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                          <span className="text-sm font-medium text-slate-700">{baseInputs[feat] || feat}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Top {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Awaiting Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">
                    Fill in the customer information form and click "Predict Delinquency Risk" to see results.
                  </p>
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <p className="text-xs font-semibold text-slate-700 mb-2">💡 Tip:</p>
                    <p className="text-xs text-slate-600">
                      You don't need to fill all fields. Missing values will be automatically filled with median values from the training data.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
