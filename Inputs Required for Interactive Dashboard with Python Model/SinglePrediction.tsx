import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function SinglePrediction() {
  const [formData, setFormData] = useState({
    sim_age_days: 500,
    avg_daily_spend_30d: 1000,
    avg_daily_spend_90d: 1000,
    avg_main_balance_30d: 500,
    avg_main_balance_90d: 500,
    last_rech_date_ma: 5,
    last_rech_date_da: 0,
    last_rech_amt_ma: 1500,
    main_recharge_count_30d: 2,
    main_recharge_frequency_30d: 10,
    total_main_recharge_amt_30d: 3000,
    median_main_recharge_amt_30d: 1500,
    median_prebal_before_recharge_30d: 50,
    main_recharge_count_90d: 5,
    main_recharge_frequency_90d: 15,
    total_main_recharge_amt_90d: 7500,
    median_main_recharge_amt_90d: 1500,
    median_main_prebal_90d: 50,
    data_recharge_count_30d: 0,
    data_recharge_frequency_30d: 0,
    data_recharge_count_90d: 0,
    data_recharge_frequency_90d: 0,
    loan_count_30d: 2,
    total_loan_amt_30d: 12,
    max_loan_amt_30d: 6,
    median_loan_amt_30d_loans30: 0,
    loan_count_90d: 2,
    total_loan_amt_90d: 12,
    max_loan_amt_90d: 6,
    median_loan_amt_90d: 0,
    avg_payback_time_30d: 3,
    avg_payback_time_90d: 3,
    date_day: 15,
    date_month: 7,
  });

  const [result, setResult] = useState<any>(null);
  const [explanation, setExplanation] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const predictMutation = trpc.prediction.single.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Prediction completed successfully!");
    },
    onError: (error) => {
      toast.error(`Prediction failed: ${error.message}`);
    },
  });

  const explainMutation = trpc.prediction.explain.useMutation({
    onSuccess: (data) => {
      setExplanation(data);
      setShowExplanation(true);
      toast.success("Explanation generated!");
    },
    onError: (error) => {
      toast.error(`Explanation failed: ${error.message}`);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setExplanation(null);
    setShowExplanation(false);
    predictMutation.mutate(formData);
  };

  const handleExplain = () => {
    explainMutation.mutate(formData);
  };

  const fields = [
    { name: "sim_age_days", label: "SIM Age (Days)" },
    { name: "avg_daily_spend_30d", label: "Avg Daily Spend (30D)" },
    { name: "avg_daily_spend_90d", label: "Avg Daily Spend (90D)" },
    { name: "avg_main_balance_30d", label: "Avg Main Balance (30D)" },
    { name: "avg_main_balance_90d", label: "Avg Main Balance (90D)" },
    { name: "last_rech_date_ma", label: "Last Recharge Date (Months Ago)" },
    { name: "last_rech_date_da", label: "Last Recharge Date (Days Ago)" },
    { name: "last_rech_amt_ma", label: "Last Recharge Amount" },
    { name: "main_recharge_count_30d", label: "Main Recharge Count (30D)" },
    { name: "main_recharge_frequency_30d", label: "Main Recharge Frequency (30D)" },
    { name: "total_main_recharge_amt_30d", label: "Total Main Recharge Amount (30D)" },
    { name: "median_main_recharge_amt_30d", label: "Median Main Recharge Amount (30D)" },
    { name: "median_prebal_before_recharge_30d", label: "Median Pre-balance Before Recharge (30D)" },
    { name: "main_recharge_count_90d", label: "Main Recharge Count (90D)" },
    { name: "main_recharge_frequency_90d", label: "Main Recharge Frequency (90D)" },
    { name: "total_main_recharge_amt_90d", label: "Total Main Recharge Amount (90D)" },
    { name: "median_main_recharge_amt_90d", label: "Median Main Recharge Amount (90D)" },
    { name: "median_main_prebal_90d", label: "Median Main Pre-balance (90D)" },
    { name: "data_recharge_count_30d", label: "Data Recharge Count (30D)" },
    { name: "data_recharge_frequency_30d", label: "Data Recharge Frequency (30D)" },
    { name: "data_recharge_count_90d", label: "Data Recharge Count (90D)" },
    { name: "data_recharge_frequency_90d", label: "Data Recharge Frequency (90D)" },
    { name: "loan_count_30d", label: "Loan Count (30D)" },
    { name: "total_loan_amt_30d", label: "Total Loan Amount (30D)" },
    { name: "max_loan_amt_30d", label: "Max Loan Amount (30D)" },
    { name: "median_loan_amt_30d_loans30", label: "Median Loan Amount (30D)" },
    { name: "loan_count_90d", label: "Loan Count (90D)" },
    { name: "total_loan_amt_90d", label: "Total Loan Amount (90D)" },
    { name: "max_loan_amt_90d", label: "Max Loan Amount (90D)" },
    { name: "median_loan_amt_90d", label: "Median Loan Amount (90D)" },
    { name: "avg_payback_time_30d", label: "Avg Payback Time (30D)" },
    { name: "avg_payback_time_90d", label: "Avg Payback Time (90D)" },
    { name: "date_day", label: "Date Day" },
    { name: "date_month", label: "Date Month" },
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
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Single Prediction</h1>
            <p className="text-slate-400">Enter customer data to get a delinquency prediction</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100">Customer Features</CardTitle>
                  <CardDescription className="text-slate-400">
                    Fill in all required fields for prediction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fields.map((field) => (
                        <div key={field.name}>
                          <Label htmlFor={field.name} className="text-slate-300">
                            {field.label}
                          </Label>
                          <Input
                            id={field.name}
                            type="number"
                            step="any"
                            value={formData[field.name as keyof typeof formData]}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="bg-slate-800/50 border-slate-700 text-slate-100"
                          />
                        </div>
                      ))}
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={predictMutation.isPending}
                    >
                      {predictMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Predicting...
                        </>
                      ) : (
                        "Get Prediction"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              {result && (
                <Card className="bg-slate-900/50 border-slate-800 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-slate-100">Prediction Result</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 bg-slate-800/50 rounded-lg">
                      <div className="text-sm text-slate-400 mb-2">Prediction</div>
                      <div className={`text-4xl font-bold ${result.prediction === 1 ? "text-green-500" : "text-red-500"}`}>
                        {result.prediction === 1 ? "WILL REPAY" : "DELINQUENT"}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="text-sm text-slate-400 mb-1">Repayment Probability</div>
                        <div className="text-2xl font-semibold text-green-400">
                          {(result.probability_class_1 * 100).toFixed(2)}%
                        </div>
                        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${result.probability_class_1 * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-slate-800/50 rounded-lg">
                        <div className="text-sm text-slate-400 mb-1">Delinquency Probability</div>
                        <div className="text-2xl font-semibold text-red-400">
                          {(result.probability_class_0 * 100).toFixed(2)}%
                        </div>
                        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500"
                            style={{ width: `${result.probability_class_0 * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleExplain}
                      className="w-full bg-purple-600 hover:bg-purple-700 mt-4"
                      disabled={explainMutation.isPending}
                    >
                      {explainMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Explanation...
                        </>
                      ) : (
                        "Explain Prediction (SHAP)"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {showExplanation && explanation && (
            <div className="mt-6 max-w-6xl mx-auto">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-100">Prediction Explanation (SHAP Values)</CardTitle>
                  <CardDescription className="text-slate-400">
                    Feature contributions to the prediction. Positive values push toward repayment, negative toward delinquency.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {explanation.explanations.slice(0, 15).map((exp: any) => (
                      <div key={exp.feature} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-200">{exp.display_name}</div>
                          <div className="text-xs text-slate-500">Value: {exp.value.toFixed(2)}</div>
                        </div>
                        <div className="flex items-center gap-3 w-64">
                          <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden relative">
                            <div
                              className={`h-full absolute ${exp.shap_value >= 0 ? 'bg-green-500 left-1/2' : 'bg-red-500 right-1/2'}`}
                              style={{
                                width: `${Math.min(Math.abs(exp.shap_value) * 100, 50)}%`,
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-0.5 h-full bg-slate-400" />
                            </div>
                          </div>
                          <div className={`text-sm font-mono w-20 text-right ${exp.shap_value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {exp.shap_value >= 0 ? '+' : ''}{exp.shap_value.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-slate-800/30 rounded-lg text-sm text-slate-400">
                    <strong className="text-slate-300">Base value:</strong> {explanation.base_value.toFixed(3)} (model's average prediction)
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
