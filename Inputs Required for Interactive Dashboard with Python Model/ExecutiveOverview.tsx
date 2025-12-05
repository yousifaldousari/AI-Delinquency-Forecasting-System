import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatIDR, formatIDRCompact, formatPercentage } from "@/lib/currency";
import { FeatureTooltip } from "@/components/FeatureTooltip";
import { AlertCircle, TrendingDown, TrendingUp, Users, Zap, DollarSign, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function ExecutiveOverview() {
  const { data: overview, isLoading } = trpc.dashboard.overview.useQuery();
  const { data: featureMap } = trpc.prediction.getFeatureMapping.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!overview?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const data = overview;
  const riskData = [
    { name: "Low Risk", value: data.risk_distribution?.low || 0, color: "#10b981" },
    { name: "Medium Risk", value: data.risk_distribution?.medium || 0, color: "#f59e0b" },
    { name: "High Risk", value: data.risk_distribution?.high || 0, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Executive Overview</h1>
          <p className="text-slate-600">High-level KPIs, risk distribution, and customer engagement metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900">
                  {data.total_customers ? data.total_customers.toLocaleString() : '0'}
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Active portfolio</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Delinquency Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-red-600">
                  {formatPercentage((data.delinquency_rate || 0) / 100)}
                </div>
                {(data.delinquency_rate || 0) > 15 ? (
                  <TrendingUp className="w-8 h-8 text-red-500 opacity-50" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-green-500 opacity-50" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">5-day loan delinquency</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">At-Risk Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-orange-600">
                  {formatPercentage(data.at_risk_percentage / 100)}
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">High-risk customers</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Daily Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-600">
                  {formatIDRCompact(data.avg_daily_spend_30d)}
                </div>
                <DollarSign className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Last 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Portfolio breakdown by risk level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Risk Distribution (Bar Chart)</CardTitle>
              <CardDescription>Customer count by risk category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Average Recharge Count</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {data.avg_recharge_count_30d ? data.avg_recharge_count_30d.toFixed(1) : '0.0'}
              </div>
              <p className="text-sm text-slate-500 mt-2">Recharges per customer</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Average Loan Count</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {data.avg_loan_count_30d ? data.avg_loan_count_30d.toFixed(1) : '0.0'}
              </div>
              <p className="text-sm text-slate-500 mt-2">Loans per customer</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Portfolio Health</CardTitle>
              <CardDescription>Overall status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {(data.delinquency_rate || 0) < 10 ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                    <div>
                      <div className="text-lg font-bold text-green-600">Healthy</div>
                      <p className="text-sm text-slate-500">Low delinquency rate</p>
                    </div>
                  </>
                ) : (data.delinquency_rate || 0) < 20 ? (
                  <>
                    <AlertCircle className="w-8 h-8 text-orange-500" />
                    <div>
                      <div className="text-lg font-bold text-orange-600">Moderate</div>
                      <p className="text-sm text-slate-500">Monitor closely</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <div className="text-lg font-bold text-red-600">At Risk</div>
                      <p className="text-sm text-slate-500">Immediate action needed</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-blue-800">
              <p>
                The portfolio consists of <strong>{data.total_customers?.toLocaleString() || '0'}</strong> customers with a delinquency rate of <strong>{formatPercentage((data.delinquency_rate || 0) / 100)}</strong>.
              </p>
              <p>
                Risk distribution shows <strong>{data.risk_distribution?.low?.toLocaleString() || '0'}</strong> low-risk, <strong>{data.risk_distribution?.medium?.toLocaleString() || '0'}</strong> medium-risk, and <strong>{data.risk_distribution?.high?.toLocaleString() || '0'}</strong> high-risk customers.
              </p>
              <p>
                Average customer engagement: <strong>{data.avg_recharge_count_30d?.toFixed(1) || '0.0'}</strong> recharges and <strong>{data.avg_loan_count_30d?.toFixed(1) || '0.0'}</strong> loans per customer in the last 30 days.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
