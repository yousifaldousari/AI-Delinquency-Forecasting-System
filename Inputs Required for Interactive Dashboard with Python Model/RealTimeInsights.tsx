import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatPercentage } from "@/lib/currency";
import { AlertCircle, Activity, TrendingUp, TrendingDown, Clock, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function RealTimeInsights() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = trpc.dashboard.overview.useQuery();
  const { data: portfolio, isLoading: portfolioLoading, refetch: refetchPortfolio } = trpc.dashboard.portfolio.useQuery();

  useEffect(() => {
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refetchOverview();
      refetchPortfolio();
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchOverview, refetchPortfolio]);

  const isLoading = overviewLoading || portfolioLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading real-time insights...</p>
        </div>
      </div>
    );
  }

  if (!overview?.success || !portfolio?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load real-time data</p>
        </div>
      </div>
    );
  }

  const handleManualRefresh = () => {
    refetchOverview();
    refetchPortfolio();
    setLastUpdated(new Date());
  };

  const riskTrend = (overview.risk_distribution?.high || 0) > 30 ? "increasing" : "stable";
  const delinquencyTrend = (overview.delinquency_rate || 0) > 15 ? "warning" : "normal";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Live Indicator */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-slate-900">Real-Time Insights</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 border border-green-300 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-green-700">LIVE</span>
              </div>
            </div>
            <p className="text-slate-600">Continuously updated predictions and risk analytics</p>
          </div>
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Now</span>
          </button>
        </div>

        {/* Last Updated Banner */}
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 mb-8">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-slate-700">
                  Last updated: <strong>{lastUpdated.toLocaleTimeString()}</strong>
                </span>
              </div>
              <span className="text-sm text-purple-700">Auto-refreshes every 30 seconds</span>
            </div>
          </CardContent>
        </Card>

        {/* Live Risk Metrics */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">⚡ Live Risk Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Current Delinquency Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-slate-900">
                    {(overview.delinquency_rate || 0).toFixed(1)}%
                  </div>
                  {delinquencyTrend === "warning" ? (
                    <TrendingUp className="w-8 h-8 text-red-500 opacity-50" />
                  ) : (
                    <Activity className="w-8 h-8 text-green-500 opacity-50" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {delinquencyTrend === "warning" ? "Above threshold" : "Within normal range"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">High-Risk Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-red-600">
                    {(overview.risk_distribution?.high || 0).toLocaleString()}
                  </div>
                  {riskTrend === "increasing" ? (
                    <TrendingUp className="w-8 h-8 text-red-500 opacity-50" />
                  ) : (
                    <TrendingDown className="w-8 h-8 text-green-500 opacity-50" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {formatPercentage((overview.risk_distribution?.high || 0) / (overview.total_customers || 1))} of portfolio
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Medium-Risk Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-orange-600">
                    {(overview.risk_distribution?.medium || 0).toLocaleString()}
                  </div>
                  <Activity className="w-8 h-8 text-orange-500 opacity-50" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {formatPercentage((overview.risk_distribution?.medium || 0) / (overview.total_customers || 1))} of portfolio
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">Low-Risk Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-green-600">
                    {(overview.risk_distribution?.low || 0).toLocaleString()}
                  </div>
                  <TrendingDown className="w-8 h-8 text-green-500 opacity-50" />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {formatPercentage((overview.risk_distribution?.low || 0) / (overview.total_customers || 1))} of portfolio
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Risk Level Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                High Risk Alert
              </CardTitle>
              <CardDescription className="text-red-700">Immediate attention required</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Customers:</span>
                  <span className="font-bold text-red-900">{(overview.risk_distribution?.high || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Portfolio %:</span>
                  <span className="font-bold text-red-900">
                    {formatPercentage((overview.risk_distribution?.high || 0) / (overview.total_customers || 1))}
                  </span>
                </div>
                <div className="pt-3 border-t border-red-200">
                  <p className="text-xs text-red-800">
                    These customers have &gt;70% probability of 5-day loan delinquency
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Medium Risk Watch
              </CardTitle>
              <CardDescription className="text-orange-700">Proactive monitoring needed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Customers:</span>
                  <span className="font-bold text-orange-900">{(overview.risk_distribution?.medium || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Portfolio %:</span>
                  <span className="font-bold text-orange-900">
                    {formatPercentage((overview.risk_distribution?.medium || 0) / (overview.total_customers || 1))}
                  </span>
                </div>
                <div className="pt-3 border-t border-orange-200">
                  <p className="text-xs text-orange-800">
                    These customers have 30-70% probability of delinquency
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Low Risk Stable
              </CardTitle>
              <CardDescription className="text-green-700">Healthy payment behaviour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Customers:</span>
                  <span className="font-bold text-green-900">{(overview.risk_distribution?.low || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Portfolio %:</span>
                  <span className="font-bold text-green-900">
                    {formatPercentage((overview.risk_distribution?.low || 0) / (overview.total_customers || 1))}
                  </span>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <p className="text-xs text-green-800">
                    These customers have &lt;30% probability of delinquency
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Predictions Status */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle>Prediction System Status</CardTitle>
            <CardDescription>Real-time model performance and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-semibold text-green-900">Model Status</p>
                  <p className="text-sm text-slate-700">Online & Ready</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-semibold text-blue-900">Data Freshness</p>
                  <p className="text-sm text-slate-700">Updated {lastUpdated.toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-semibold text-purple-900">Auto-Refresh</p>
                  <p className="text-sm text-slate-700">Every 30 seconds</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
