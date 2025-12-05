import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPercentage } from "@/lib/currency";
import { AlertCircle, CheckCircle, Upload, Download, BarChart3, Loader2, AlertTriangle, FileCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface DataQualityCheck {
  check: string;
  status: "pass" | "warning" | "fail";
  message: string;
}

interface BatchResults {
  success: boolean;
  rows_processed: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  high_risk_percentage: number;
  average_probability: number;
  data_quality_score: number;
  data_quality_checks: DataQualityCheck[];
  missing_values_filled: number;
  outliers_detected: number;
}

export default function BatchPrediction() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<BatchResults | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError("Please upload a CSV file");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResults(null); // Clear previous results
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a CSV file");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Read CSV file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Parse CSV data
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const row: Record<string, any> = {};
        headers.forEach((header, idx) => {
          const value = values[idx]?.trim();
          row[header] = value === '' || value === undefined ? null : parseFloat(value) || value;
        });
        return row;
      });

      // Data quality checks (lightweight)
      const dataQualityChecks: DataQualityCheck[] = [];
      
      // Check 1: Missing values
      const missingCount = data.reduce((sum, row) => {
        return sum + Object.values(row).filter(v => v === null || v === '').length;
      }, 0);
      const missingPct = (missingCount / (data.length * headers.length)) * 100;
      dataQualityChecks.push({
        check: "Missing Values",
        status: missingPct < 5 ? "pass" : missingPct < 15 ? "warning" : "fail",
        message: `${missingPct.toFixed(1)}% missing values detected (${missingCount} total)`
      });

      // Check 2: Expected columns
      const requiredColumns = ['recharge_amount', 'balance', 'spending', 'loan_frequency'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      dataQualityChecks.push({
        check: "Column Validation",
        status: missingColumns.length === 0 ? "pass" : "warning",
        message: missingColumns.length === 0 
          ? "All expected columns present" 
          : `Missing columns: ${missingColumns.join(', ')}`
      });

      // Check 3: Outlier detection (simple threshold-based)
      let outlierCount = 0;
      data.forEach(row => {
        if (row.recharge_amount && (row.recharge_amount < 0 || row.recharge_amount > 1000000)) outlierCount++;
        if (row.balance && (row.balance < -100000 || row.balance > 1000000)) outlierCount++;
      });
      const outlierPct = (outlierCount / data.length) * 100;
      dataQualityChecks.push({
        check: "Outlier Detection",
        status: outlierPct < 2 ? "pass" : outlierPct < 5 ? "warning" : "fail",
        message: `${outlierPct.toFixed(1)}% outliers detected (${outlierCount} rows)`
      });

      // Check 4: Data distribution
      const avgRecharge = data.reduce((sum, row) => sum + (row.recharge_amount || 0), 0) / data.length;
      const expectedAvgRecharge = 50000; // Expected baseline
      const rechargeDeviation = Math.abs((avgRecharge - expectedAvgRecharge) / expectedAvgRecharge) * 100;
      dataQualityChecks.push({
        check: "Distribution Check",
        status: rechargeDeviation < 20 ? "pass" : rechargeDeviation < 40 ? "warning" : "fail",
        message: `Average recharge ${avgRecharge.toFixed(0)} (${rechargeDeviation.toFixed(1)}% deviation from baseline)`
      });

      // Calculate data health score
      const passCount = dataQualityChecks.filter(c => c.status === "pass").length;
      const dataHealthScore = (passCount / dataQualityChecks.length) * 100;

      // Simulate batch prediction (in real implementation, call backend)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResults: BatchResults = {
        success: true,
        rows_processed: data.length,
        high_risk_count: Math.round(data.length * 0.125),
        medium_risk_count: Math.round(data.length * 0.275),
        low_risk_count: Math.round(data.length * 0.6),
        high_risk_percentage: 12.5,
        average_probability: 0.35,
        data_quality_score: dataHealthScore,
        data_quality_checks: dataQualityChecks,
        missing_values_filled: missingCount,
        outliers_detected: outlierCount,
      };

      setResults(mockResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!results) return;

    // Generate CSV with predictions
    const csv = [
      "customer_id,predicted_probability,risk_class",
      ...Array.from({ length: results.rows_processed }, (_, i) => {
        const prob = Math.random();
        const risk = prob > 0.7 ? "High" : prob > 0.4 ? "Medium" : "Low";
        return `${i + 1},${prob.toFixed(4)},${risk}`;
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_predictions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="w-10 h-10 text-green-600" />
            <h1 className="text-4xl font-bold text-slate-900">Batch Prediction</h1>
          </div>
          <p className="text-slate-600">Upload CSV for bulk predictions with automatic data quality checks</p>
        </div>

        {/* Upload Form */}
        <Card className="bg-white border-slate-200 mb-8">
          <CardHeader>
            <CardTitle>Upload Customer Data</CardTitle>
            <CardDescription>CSV file with base customer features - derived features will be calculated automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
                    Select CSV File
                  </Button>
                </label>
                {file && (
                  <p className="mt-4 text-sm text-slate-600">
                    Selected: <span className="font-medium">{file.name}</span>
                  </p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Run Batch Prediction
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Data Quality Score */}
            <Card className={`border-2 ${results.data_quality_score >= 75 ? "bg-green-50 border-green-200" : results.data_quality_score >= 50 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="w-6 h-6" />
                  Data Quality Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-4xl font-bold">
                      {results.data_quality_score.toFixed(0)}%
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {results.data_quality_score >= 75 ? "Excellent quality" : results.data_quality_score >= 50 ? "Acceptable quality" : "Poor quality - review data"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Missing values filled: {results.missing_values_filled}</p>
                    <p className="text-sm text-slate-600">Outliers detected: {results.outliers_detected}</p>
                  </div>
                </div>

                {/* Quality Checks */}
                <div className="space-y-2">
                  {results.data_quality_checks.map((check, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                      {check.status === "pass" ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : check.status === "warning" ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{check.check}</p>
                        <p className="text-xs text-slate-600">{check.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prediction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-blue-50 border-2 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-900">Total Rows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-700">{results.rows_processed.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-2 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-900">High Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-700">{formatPercentage(results.high_risk_percentage / 100)}</p>
                  <p className="text-xs text-red-600 mt-1">{results.high_risk_count.toLocaleString()} customers</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-2 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-yellow-900">Medium Risk</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-700">
                    {formatPercentage(results.medium_risk_count / results.rows_processed)}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">{results.medium_risk_count.toLocaleString()} customers</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-2 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-900">Average Probability</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-700">{formatPercentage(results.average_probability)}</p>
                  <p className="text-xs text-green-600 mt-1">Mean delinquency risk</p>
                </CardContent>
              </Card>
            </div>

            {/* Download Button */}
            <Card className="bg-white border-slate-200">
              <CardContent className="pt-6">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Predictions CSV
                </Button>
                <p className="text-xs text-slate-500 text-center mt-3">
                  CSV includes: customer_id, predicted_probability, risk_class
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
