import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, MessageSquare, Sparkles, Send, Loader2 } from "lucide-react";
import { useState } from "react";

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [conversation, setConversation] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [isAsking, setIsAsking] = useState(false);

  const { data: featureMapping } = trpc.prediction.getFeatureMapping.useQuery();
  const { data: overview } = trpc.dashboard.overview.useQuery();

  const handleAsk = async () => {
    if (!question.trim() || isAsking) return;

    const userQuestion = question.trim();
    setQuestion("");
    setIsAsking(true);

    // Add user message to conversation
    setConversation(prev => [...prev, { role: "user", content: userQuestion }]);

    // Simulate AI response based on question type
    setTimeout(() => {
      let response = "";

      const lowerQ = userQuestion.toLowerCase();

      // Feature explanation
      if (lowerQ.includes("feature") || lowerQ.includes("what is") || lowerQ.includes("explain")) {
        const featureName = extractFeatureName(userQuestion);
        if (featureName && featureMapping) {
          const mapping = featureMapping.find((f: any) => 
            f.feature.toLowerCase().includes(featureName.toLowerCase()) ||
            f.label.toLowerCase().includes(featureName.toLowerCase())
          );
          if (mapping) {
            response = `**${mapping.label}**: ${mapping.description}\n\nThis feature helps predict delinquency risk by measuring ${mapping.label.toLowerCase()}. It's one of the key indicators used by the XGBoost model.`;
          } else {
            response = "I couldn't find that specific feature. Try asking about features like 'recharge amount', 'balance', 'spending', or 'loan frequency'.";
          }
        } else {
          response = "The model uses features like recharge behaviour, balance trends, spending patterns, and loan history to predict 5-day loan delinquency risk. Each feature captures a different aspect of customer financial behaviour.";
        }
      }
      // Risk explanation
      else if (lowerQ.includes("risk") || lowerQ.includes("delinquency") || lowerQ.includes("predict")) {
        response = "The model predicts **5-day loan delinquency risk** using customer behaviour patterns. High-risk customers (>70% probability) show patterns like:\n\n• Low or declining balance\n• Infrequent recharges\n• High loan-to-recharge ratio\n• History of late payments\n\nThe model achieves 95%+ accuracy by analyzing these patterns across 209K+ customer records.";
      }
      // Portfolio summary
      else if (lowerQ.includes("portfolio") || lowerQ.includes("summary") || lowerQ.includes("overview")) {
        if (overview?.success) {
          response = `**Current Portfolio Status:**\n\n• Total Customers: ${overview.total_customers.toLocaleString()}\n• Delinquency Rate: ${overview.delinquency_rate.toFixed(1)}%\n• High-Risk: ${overview.risk_distribution.high.toLocaleString()} customers\n• Medium-Risk: ${overview.risk_distribution.medium.toLocaleString()} customers\n• Low-Risk: ${overview.risk_distribution.low.toLocaleString()} customers\n\nThe portfolio shows ${overview.delinquency_rate > 15 ? "elevated" : "normal"} delinquency levels. Focus interventions on the ${overview.risk_distribution.high.toLocaleString()} high-risk customers.`;
        } else {
          response = "Portfolio data is currently loading. Please try again in a moment.";
        }
      }
      // Model explanation
      else if (lowerQ.includes("model") || lowerQ.includes("how") || lowerQ.includes("work")) {
        response = "The dashboard uses an **XGBoost gradient boosting model** trained on 209K+ telecom customer records. The model:\n\n1. Analyzes 15+ key features (recharge patterns, balance, spending, loans)\n2. Automatically calculates derived features from base inputs\n3. Predicts 5-day loan delinquency probability\n4. Classifies customers into Low/Medium/High risk bands\n\nThe model achieves **F1 Score: 0.85+** and **Accuracy: 95%+**, making it highly reliable for business decisions.";
      }
      // Recommendations
      else if (lowerQ.includes("recommend") || lowerQ.includes("action") || lowerQ.includes("what should")) {
        response = "**Recommended Actions:**\n\n**For High-Risk Customers:**\n• Send proactive SMS reminders 2-3 days before loan due date\n• Offer flexible payment extensions\n• Provide incentive recharge bonuses\n\n**For Medium-Risk Customers:**\n• Monitor recharge patterns\n• Send automated balance alerts\n• Encourage auto-recharge enrollment\n\n**Strategic Initiatives:**\n• Launch loyalty programs for frequent rechargers\n• Implement dynamic credit limits based on behaviour\n• Focus retention efforts on high-value, low-risk segments";
      }
      // Default helpful response
      else {
        response = "I can help you with:\n\n• **Feature explanations** - Ask about specific features like 'recharge amount' or 'balance'\n• **Risk insights** - Learn how the model predicts delinquency\n• **Portfolio summary** - Get current portfolio statistics\n• **Model details** - Understand how predictions work\n• **Recommendations** - Get actionable business advice\n\nWhat would you like to know?";
      }

      setConversation(prev => [...prev, { role: "assistant", content: response }]);
      setIsAsking(false);
    }, 1000);
  };

  const extractFeatureName = (question: string): string | null => {
    const words = question.toLowerCase().split(" ");
    const features = ["recharge", "balance", "spending", "loan", "payment", "frequency", "amount", "ratio"];
    for (const feature of features) {
      if (words.some(w => w.includes(feature))) {
        return feature;
      }
    }
    return null;
  };

  const suggestedQuestions = [
    "What features does the model use?",
    "How does the model predict delinquency risk?",
    "What's the current portfolio status?",
    "What actions should I take for high-risk customers?",
    "Explain the recharge amount feature",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-slate-900">AI Assistant</h1>
          </div>
          <p className="text-slate-600">Ask questions about the model, features, risk insights, and recommendations</p>
        </div>

        {/* Conversation Area */}
        <Card className="bg-white border-slate-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Insights & Explanations
            </CardTitle>
            <CardDescription>Get instant answers without running new computations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6 min-h-[400px] max-h-[500px] overflow-y-auto">
              {conversation.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-6">Ask me anything about the delinquency prediction model</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Try asking:</p>
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuestion(q)}
                        className="block w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-sm text-purple-900 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-900"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">
                        {msg.role === "user" ? "You" : "AI Assistant"}
                      </p>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 rounded-lg bg-slate-100">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex gap-3">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder="Ask a question about the model, features, or recommendations..."
                className="flex-1 min-h-[60px]"
                disabled={isAsking}
              />
              <Button
                onClick={handleAsk}
                disabled={!question.trim() || isAsking}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isAsking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-2">Feature Explanations</h3>
              <p className="text-sm text-blue-800">Understand what each model feature means and how it affects predictions</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-green-900 mb-2">Risk Insights</h3>
              <p className="text-sm text-green-800">Learn how the model identifies high-risk customers and predicts delinquency</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-purple-900 mb-2">Business Actions</h3>
              <p className="text-sm text-purple-800">Get practical recommendations to reduce delinquency and improve engagement</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
