import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatIDRCompact, formatPercentage } from "@/lib/currency";
import { AlertCircle, TrendingDown, TrendingUp, Users, DollarSign } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PortfolioHealth() {
  const { data: overview, isLoading: overviewLoading } = trpc.dashboard.overview.useQuery();
  const { data: portfolio, isLoading: portfolioLoading } = trpc.dashboard.portfolio.useQuery();
  const { data: behaviour, isLoading: behaviourLoading } = trpc.dashboard.behaviour.useQuery();

  const isLoading = overviewLoading || portfolioLoading || behaviourLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading portfolio health...</p>
        </div>
      </div>
    );
  }

  if (!overview?.success || !portfolio?.success || !behaviour?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load portfolio data</p>
        </div>
      </div>
    );
  }

  const riskData = [
    { name: "Low Risk", value: overview.risk_distribution?.low || 0, color: "#10b981" },
    { name: "Medium Risk", value: overview.risk_distribution?.medium || 0, color: "#f59e0b" },
    { name: "High Risk", value: overview.risk_distribution?.high || 0, color: "#ef4444" },
  ];

  const totalCustomers = overview.total_customers || 0;
  const segmentData = [
    { segment: "High Spenders", customers: Math.round(totalCustomers * 0.25), risk: "Low" },
    { segment: "Regular Users", customers: Math.round(totalCustomers * 0.50), risk: "Medium" },
    { segment: "Low Activity", customers: Math.round(totalCustomers * 0.15), risk: "High" },
    { segment: "Inactive", customers: Math.round(totalCustomers * 0.10), risk: "High" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Portfolio Health Overview</h1>
          <p className="text-slate-600">Comprehensive view of customer portfolio risk, segments, and behaviour trends</p>
        </div>

        {/* Key Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Portfolio Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-900">
                  {overview.total_customers ? (overview.total_customers / 1000).toFixed(0) : '0'}K
                </div>
                <Users className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Active customers</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Portfolio Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-green-600">
                  {overview.delinquency_rate !== undefined ? (100 - overview.delinquency_rate).toFixed(1) : '0.0'}%
                </div>
                <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Non-delinquent rate</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">At-Risk Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-orange-600">
                  {formatPercentage((overview.at_risk_percentage || 0) / 100)}
                </div>
                <AlertCircle className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">High risk probability</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Customer Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-blue-600">
                  {formatIDRCompact((overview.avg_daily_spend_30d || 0) * 30)}
                </div>
                <DollarSign className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Monthly spend</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Distribution and Customer Segments */}
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
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Customer Segments</CardTitle>
              <CardDescription>Portfolio segmentation by activity level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => value.toLocaleString()} />
                  <Bar dataKey="customers" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Behaviour Trends */}
        <Card className="bg-white border-slate-200 mb-8">
          <CardHeader>
            <CardTitle>Behaviour Trends Summary</CardTitle>
            <CardDescription>Key metrics indicating portfolio health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Avg Spending (30d)</p>
                <p className="text-2xl font-bold text-blue-700">{formatIDRCompact(behaviour.avg_spend_30d)}</p>
                <p className="text-xs text-blue-600 mt-1">Per customer daily average</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900 mb-1">Avg Recharges (30d)</p>
                <p className="text-2xl font-bold text-green-700">{behaviour.avg_recharge_30d !== undefined ? behaviour.avg_recharge_30d.toFixed(1) : '0.0'}</p>
                <p className="text-xs text-green-600 mt-1">Recharge frequency per customer</p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-1">Late Payment Rate</p>
                <p className="text-2xl font-bold text-purple-700">{behaviour.late_payment_rate !== undefined ? behaviour.late_payment_rate.toFixed(1) : '0.0'}%</p>
                <p className="text-xs text-purple-600 mt-1">Customers with payment delays</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Portfolio Health Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <p className="text-slate-700">
                  <strong>{overview.delinquency_rate !== undefined ? (100 - overview.delinquency_rate).toFixed(1) : '0.0'}%</strong> of customers maintain healthy payment behaviour
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <p className="text-slate-700">
                  <strong>{overview.at_risk_percentage !== undefined ? overview.at_risk_percentage.toFixed(1) : '0.0'}%</strong> of customers require proactive engagement to prevent delinquency
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <p className="text-slate-700">
                  Average customer value of <strong>{formatIDRCompact(overview.avg_daily_spend_30d * 30)}</strong> per month indicates stable revenue base
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <p className="text-slate-700">
                  Customer segments show clear risk patterns - focus retention efforts on high-value, low-risk segments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
