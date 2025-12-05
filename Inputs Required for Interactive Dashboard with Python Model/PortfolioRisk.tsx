import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function PortfolioRisk() {
  const { data: portfolio, isLoading } = trpc.dashboard.portfolio.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading portfolio analysis...</p>
        </div>
      </div>
    );
  }

  if (!portfolio?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load portfolio data</p>
        </div>
      </div>
    );
  }

  const data = portfolio;

  // Prepare risk band data
  const riskBandData = Object.entries(data.risk_bands || {}).map(([band, count]) => ({
    band,
    customers: count,
  }));

  // Prepare probability distribution data
  const probDistData = (data.probability_distribution || []).map((count: number, idx: number) => ({
    range: `${(idx * 10)}-${((idx + 1) * 10)}%`,
    customers: count,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Portfolio Risk Analysis</h1>
          <p className="text-slate-600">Customer segmentation and risk distribution across the portfolio</p>
        </div>

        {/* Risk Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Mean Risk Probability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {(data.mean_probability * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Median Risk Probability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {(data.median_probability * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Risk Std Deviation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {(data.std_probability * 100).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Bands */}
        <Card className="bg-white border-slate-200 mb-6">
          <CardHeader>
            <CardTitle>Risk Band Distribution</CardTitle>
            <CardDescription>Number of customers in each risk probability range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskBandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="band" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Bar dataKey="customers" fill="#3b82f6" name="Customers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Probability Distribution */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle>Probability Distribution</CardTitle>
            <CardDescription>Histogram of delinquency risk probabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={probDistData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Bar dataKey="customers" fill="#10b981" name="Customers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Portfolio Insight:</strong> The distribution shows a bimodal pattern with significant concentration at both low and high risk ends, indicating clear customer segmentation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
