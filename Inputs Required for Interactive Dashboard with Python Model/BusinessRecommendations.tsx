import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatPercentage } from "@/lib/currency";
import { AlertCircle, Target, TrendingUp, Users, Bell, DollarSign, CheckCircle2, ArrowRight } from "lucide-react";

export default function BusinessRecommendations() {
  const { data: overview, isLoading: overviewLoading } = trpc.dashboard.overview.useQuery();
  const { data: behaviour, isLoading: behaviourLoading } = trpc.dashboard.behaviour.useQuery();

  const isLoading = overviewLoading || behaviourLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (!overview?.success || !behaviour?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load recommendation data</p>
        </div>
      </div>
    );
  }

  const atRiskCount = Math.round((overview.at_risk_percentage / 100) * overview.total_customers);
  const highRiskCount = overview.risk_distribution.high;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Business Recommendations</h1>
          <p className="text-slate-600">Data-driven actions to reduce delinquency and improve customer engagement</p>
        </div>

        {/* Priority Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🎯 Priority Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <CardTitle className="text-red-900">Immediate Intervention Required</CardTitle>
                    <CardDescription className="text-red-700">High-risk customers need urgent attention</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-slate-700">
                    <strong>{highRiskCount.toLocaleString()}</strong> customers ({formatPercentage(overview.risk_distribution.high / overview.total_customers)}) are at high risk of 5-day loan delinquency
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-red-200">
                    <p className="font-semibold text-red-900 mb-2">Recommended Actions:</p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Send proactive SMS reminders 2-3 days before loan due date</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Offer flexible payment extensions for customers with low balance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>Provide incentive recharge bonuses to improve liquidity</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="w-8 h-8 text-orange-600" />
                  <div>
                    <CardTitle className="text-orange-900">Proactive Engagement</CardTitle>
                    <CardDescription className="text-orange-700">Medium-risk customers benefit from early outreach</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-slate-700">
                    <strong>{overview.risk_distribution.medium.toLocaleString()}</strong> customers ({formatPercentage(overview.risk_distribution.medium / overview.total_customers)}) show warning signs
                  </p>
                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                    <p className="font-semibold text-orange-900 mb-2">Recommended Actions:</p>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>Monitor recharge patterns and send personalized offers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>Implement automated balance alerts when below threshold</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>Encourage auto-recharge enrollment for consistent balance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">📊 Strategic Recommendations</h2>
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <CardTitle>Improve Recharge Behaviour</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  Customers with consistent recharge patterns show <strong>60% lower delinquency rates</strong>. Current average: {behaviour.avg_recharge_30d.toFixed(1)} recharges per month.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">Launch Loyalty Program</p>
                    <p className="text-sm text-slate-700">Reward frequent rechargers with bonus credit or data packages</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">Auto-Recharge Incentives</p>
                    <p className="text-sm text-slate-700">Offer 5-10% bonus for enabling automatic recharge</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-2">Recharge Reminders</p>
                    <p className="text-sm text-slate-700">Send timely notifications when balance drops below threshold</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-green-600" />
                  <CardTitle>Segment-Based Interventions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  Different customer segments require tailored approaches. Focus resources where impact is highest.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">High-Value, Low-Risk</p>
                      <p className="text-sm text-slate-700">Maintain with premium support and exclusive offers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Target className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-900">Medium-Value, Medium-Risk</p>
                      <p className="text-sm text-slate-700">Engage with targeted promotions and payment flexibility</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <Target className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-900">Low-Value, High-Risk</p>
                      <p className="text-sm text-slate-700">Implement strict credit limits and prepaid-only options</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                  <CardTitle>Optimize Credit Policies</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">
                  Current delinquency rate of <strong>{overview.delinquency_rate.toFixed(1)}%</strong> can be reduced through smarter credit allocation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="font-semibold text-purple-900 mb-2">Dynamic Credit Limits</p>
                    <p className="text-sm text-slate-700">Adjust loan amounts based on recharge history and balance trends</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-purple-700">
                      <ArrowRight className="w-3 h-3" />
                      <span>Expected impact: 15-20% reduction in delinquency</span>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="font-semibold text-purple-900 mb-2">Risk-Based Pricing</p>
                    <p className="text-sm text-slate-700">Offer better terms to low-risk customers, stricter for high-risk</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-purple-700">
                      <ArrowRight className="w-3 h-3" />
                      <span>Expected impact: Improved portfolio quality</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Implementation Roadmap */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Implementation Roadmap</CardTitle>
            <CardDescription className="text-green-700">Prioritized action plan for next 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold">
                  Week 1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Immediate Interventions</p>
                  <p className="text-sm text-slate-700">Deploy SMS reminders for high-risk customers, set up balance alerts</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold">
                  Week 2-4
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Engagement Programs</p>
                  <p className="text-sm text-slate-700">Launch loyalty program, implement auto-recharge incentives</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-green-400 text-white rounded-lg flex items-center justify-center font-bold">
                  Month 2-3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Policy Optimization</p>
                  <p className="text-sm text-slate-700">Implement dynamic credit limits, refine risk-based pricing</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
