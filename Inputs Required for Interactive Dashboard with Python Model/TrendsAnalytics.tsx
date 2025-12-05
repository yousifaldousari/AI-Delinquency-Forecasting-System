import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";

export default function TrendsAnalytics() {
  const { data: trendsData, isLoading: trendsLoading } = trpc.forecasting.trends.useQuery({ periods: 30 });
  const { data: stats, isLoading: statsLoading } = trpc.forecasting.statistics.useQuery();

  if (trendsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading trend analytics...</p>
        </div>
      </div>
    );
  }

  if (!trendsData?.success || !stats?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Failed to load trend data</p>
        </div>
      </div>
    );
  }

  // Combine historical and forecast data for visualization
  const chartData = [
    ...trendsData.historical.map((d: any) => ({
      date: d.date,
      actual: d.delinquency_rate,
      type: 'historical'
    })),
    ...trendsData.forecast.map((d: any) => ({
      date: d.date,
      predicted: d.predicted_rate,
      lower: d.lower_bound,
      upper: d.upper_bound,
      type: 'forecast'
    }))
  ];

  const summary = trendsData.summary;

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

        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Delinquency Trends & Forecasting</h1>
            <p className="text-slate-400">Historical trends and AI-powered predictions using Prophet</p>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Average Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {stats.statistics.avg_delinquency_rate.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Current Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {summary.trend_direction === 'increasing' ? (
                      <>
                        <TrendingUp className="w-5 h-5 text-red-400" />
                        <span className="text-2xl font-bold text-red-400">Rising</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-5 h-5 text-green-400" />
                        <span className="text-2xl font-bold text-green-400">Falling</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Forecast Avg</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">
                    {summary.forecast_avg_rate.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-400">Total Loans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-100">
                    {stats.statistics.total_loans.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Card className="bg-slate-900/50 border-slate-800 mb-6">
            <CardHeader>
              <CardTitle className="text-slate-100">Delinquency Rate Over Time</CardTitle>
              <CardDescription className="text-slate-400">
                Historical data with 30-day forecast and 95% confidence interval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      label={{ value: 'Delinquency Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                      formatter={(value: any) => [value?.toFixed(2) + '%', '']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    
                    {/* Confidence interval */}
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      name="Upper Bound"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="none"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      name="Lower Bound"
                    />
                    
                    {/* Historical data */}
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', r: 3 }}
                      name="Historical Rate"
                    />
                    
                    {/* Forecast */}
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#3b82f6', r: 3 }}
                      name="Forecasted Rate"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Historical Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400">Date Range</span>
                  <span className="text-slate-200 font-medium">
                    {stats.statistics.date_range.start} to {stats.statistics.date_range.end}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400">Total Days</span>
                  <span className="text-slate-200 font-medium">{stats.statistics.total_days}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400">Min Rate</span>
                  <span className="text-green-400 font-medium">{stats.statistics.min_delinquency_rate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400">Max Rate</span>
                  <span className="text-red-400 font-medium">{stats.statistics.max_delinquency_rate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-800/30 rounded-lg">
                  <span className="text-slate-400">Std Deviation</span>
                  <span className="text-slate-200 font-medium">{stats.statistics.std_delinquency_rate.toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100">Forecast Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <div className="text-sm text-slate-400 mb-2">Forecast Period</div>
                  <div className="text-lg font-semibold text-slate-200">
                    {summary.forecast_period_days} days ahead
                  </div>
                </div>
                <div className="p-4 bg-slate-800/30 rounded-lg">
                  <div className="text-sm text-slate-400 mb-2">Expected Change</div>
                  <div className="text-lg font-semibold">
                    {summary.trend_direction === 'increasing' ? (
                      <span className="text-red-400">
                        +{(summary.forecast_avg_rate - summary.current_avg_rate).toFixed(2)}% increase
                      </span>
                    ) : (
                      <span className="text-green-400">
                        {(summary.forecast_avg_rate - summary.current_avg_rate).toFixed(2)}% decrease
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-sm text-blue-300 mb-2">Model Used</div>
                  <div className="text-lg font-semibold text-blue-400">
                    Prophet (Facebook)
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Time series forecasting with seasonality detection
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
