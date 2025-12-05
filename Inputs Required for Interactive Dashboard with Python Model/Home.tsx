import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Zap, Target, Upload, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">Telecom Delinquency Dashboard</h1>
          </div>
          <p className="text-slate-600 text-lg">Executive-level insights into customer behaviour and 5-day loan delinquency risk</p>
          <p className="text-slate-500 mt-2">Powered by machine learning • Real-time analytics • Data-driven decisions</p>
        </div>

        {/* Prediction Tools */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Prediction Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/single-prediction">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-blue-900">Single Customer Prediction</CardTitle>
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-800">
                    Enter customer data to predict delinquency risk with automatic feature calculation
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>

            <Link href="/batch-prediction">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-lg text-green-900">Batch Prediction</CardTitle>
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-green-800">
                    Upload CSV file for bulk predictions with downloadable results
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/overview">
            <Card className="bg-white border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">Executive Overview</CardTitle>
                  <Zap className="w-6 h-6 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  High-level KPIs, risk distribution, and customer engagement metrics
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/behaviour">
            <Card className="bg-white border-slate-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">Behaviour Insights</CardTitle>
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Spending patterns, recharge trends, and engagement analysis
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai-assistant">
            <Card className="bg-white border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Ask questions and get insights without running new computations
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/model-integrity">
            <Card className="bg-white border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">Model Integrity</CardTitle>
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Low-compute monitoring with drift indicators and cached metrics
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Get Started</h2>
          <p className="text-slate-600 mb-6">
            This executive dashboard provides comprehensive insights into telecom customer behaviour and delinquency risk. 
            Navigate through the sections above to explore detailed analytics, understand risk patterns, and make data-driven decisions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/portfolio-health">
              <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
                <p className="font-semibold text-blue-900 mb-2 text-lg">📊 Data-Driven</p>
                <p className="text-sm text-blue-800">Portfolio-level risk, customer segments, and behaviour trends</p>
              </div>
            </Link>
            <Link href="/business-recommendations">
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg hover:border-green-400 hover:shadow-lg transition-all cursor-pointer">
                <p className="font-semibold text-green-900 mb-2 text-lg">🎯 Actionable</p>
                <p className="text-sm text-green-800">Practical business actions to reduce delinquency and improve engagement</p>
              </div>
            </Link>
            <Link href="/real-time-insights">
              <div className="p-6 bg-purple-50 border border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer">
                <p className="font-semibold text-purple-900 mb-2 text-lg">⚡ Real-Time</p>
                <p className="text-sm text-purple-800">Continuously updated predictions, risk levels, and live analytics</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
