import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Plot from "react-plotly.js";

export default function BehaviourInsights() {
  const { data: behaviour, isLoading } = trpc.dashboard.behaviour.useQuery();
  const { data: advancedPatterns, isLoading: isLoadingAdvanced } = trpc.dashboard.advancedPatterns.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading behaviour insights...</p>
        </div>
      </div>
    );
  }

  if (!behaviour?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load behaviour data</p>
        </div>
      </div>
    );
  }

  const data = behaviour;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Customer Behaviour Insights</h1>
          <p className="text-slate-600">Payback patterns and loan activity analysis</p>
        </div>

        {/* Payback Behaviour Analysis */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Payback Behaviour Analysis</h2>
          
          {/* Chart 1: Payback90 for Non-Delinquent Users */}
          <Card className="bg-white border-slate-200 mb-6">
            <CardHeader>
              <CardTitle>Distribution of Payback90 for Label = 0</CardTitle>
              <CardDescription>Repayment timeline for non-delinquent customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(data.payback90_label0 || {}).map(([days, count]) => ({
                    days: parseInt(days),
                    count: count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="days" label={{ value: 'Payback90 (days)', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Number of users', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#C5E1A5" stroke="#457B9D" strokeWidth={0.3} name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  <strong>Interpretation:</strong> Most users with no delinquency repay on the same day.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Payback90 for Delinquent Users */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Distribution of Payback90 for Label = 1</CardTitle>
              <CardDescription>Repayment delays for delinquent customers (excluding payback90 = 0)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(data.payback90_label1 || {}).map(([days, count]) => ({
                    days: parseInt(days),
                    count: count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="days" label={{ value: 'Payback90 (days)', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Number of users', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#C5E1A5" name="Users" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  <strong>Interpretation:</strong> Delinquent users tend to repay much later, with a long tail of delayed payments.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Behavioural Patterns */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Advanced Behavioural Patterns</h2>
          
          {isLoadingAdvanced ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading advanced patterns...</p>
            </div>
          ) : advancedPatterns?.success ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Payback90 Grouped Pie (Label 0) */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Payback90 Distribution for Label = 0 (Grouped)</CardTitle>
                  <CardDescription>Repayment timeline for non-delinquent customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={[
                      {
                        type: 'pie',
                        labels: Object.keys(advancedPatterns.payback_label0_grouped),
                        values: Object.values(advancedPatterns.payback_label0_grouped),
                        textposition: 'outside',
                        textinfo: 'percent+label',
                        marker: {
                          colors: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc']
                        }
                      } as any
                    ]}
                    layout={{
                      showlegend: true,
                      height: 500,
                      margin: { t: 80, b: 80, l: 80, r: 80 }
                    } as any}
                    config={{ responsive: true }}
                    style={{ width: '100%' }}
                  />
                </CardContent>
              </Card>

              {/* Chart 2: Payback90 Grouped Pie (Label 1) */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle>Payback90 Distribution for Label = 1 (Grouped)</CardTitle>
                  <CardDescription>Repayment delays for delinquent customers (excluding payback90=0)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={[
                      {
                        type: 'pie',
                        labels: Object.keys(advancedPatterns.payback_label1_grouped),
                        values: Object.values(advancedPatterns.payback_label1_grouped),
                        textposition: 'outside',
                        textinfo: 'percent+label',
                        marker: {
                          colors: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc']
                        }
                      } as any
                    ]}
                    layout={{
                      showlegend: true,
                      height: 500,
                      margin: { t: 80, b: 80, l: 80, r: 80 }
                    } as any}
                    config={{ responsive: true }}
                    style={{ width: '100%' }}
                  />
                </CardContent>
              </Card>

              {/* Chart 3: Loans Over Time Line Chart */}
              <Card className="bg-white border-slate-200 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Number of Loans Taken by User Over Time</CardTitle>
                  <CardDescription>Daily loan activity showing true fluctuations between delinquent and non-delinquent users</CardDescription>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={[
                      {
                        type: 'scatter',
                        mode: 'lines',
                        name: '0',
                        x: advancedPatterns.loan_time_series
                          .filter((d: any) => d.label === 0)
                          .map((d: any) => d.date),
                        y: advancedPatterns.loan_time_series
                          .filter((d: any) => d.label === 0)
                          .map((d: any) => d.cnt_loans30),
                        line: { color: '#6BA3B8' }
                      } as any,
                      {
                        type: 'scatter',
                        mode: 'lines',
                        name: '1',
                        x: advancedPatterns.loan_time_series
                          .filter((d: any) => d.label === 1)
                          .map((d: any) => d.date),
                        y: advancedPatterns.loan_time_series
                          .filter((d: any) => d.label === 1)
                          .map((d: any) => d.cnt_loans30),
                        line: { color: '#FF8A9A' }
                      } as any
                    ] as any}
                    layout={{
                      title: 'Number of Loans Taken by User Over Time',
                      xaxis: { 
                        title: 'Date',
                        type: 'date'
                      },
                      yaxis: { 
                        title: 'Loans Past 30 Days',
                        rangemode: 'tozero'
                      },
                      showlegend: true,
                      height: 400,
                      margin: { t: 60, b: 60, l: 60, r: 20 },
                      hovermode: 'closest',
                      legend: { title: { text: 'Label' } }
                    } as any}
                    config={{ responsive: true }}
                    style={{ width: '100%' }}
                  />
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-900">
                      <strong>Key Insight:</strong> Delinquent users (Label 1) consistently take more loans across all dates, with clear daily fluctuations showing distinct behavioral patterns.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Failed to load advanced patterns</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
