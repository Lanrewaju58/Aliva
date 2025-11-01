import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Scale, Shield, AlertTriangle, Users, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: FileText },
    { id: "acceptance", title: "Acceptance", icon: CheckCircle },
    { id: "usage", title: "Usage Rights", icon: Users },
    { id: "restrictions", title: "Restrictions", icon: XCircle },
    { id: "disclaimers", title: "Disclaimers", icon: AlertTriangle },
    { id: "liability", title: "Liability", icon: Shield },
    { id: "changes", title: "Changes", icon: Clock }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Scale className="w-4 h-4" />
                Legal Terms
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-amber-800 to-gray-900 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Clear, fair terms that protect both you and us. Please read these carefully before using Aliva.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Last updated: January 2025
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Plain language
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? "bg-amber-500 text-white shadow-lg"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {/* Overview Section */}
                {activeSection === "overview" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <FileText className="w-6 h-6 text-amber-600" />
                          Welcome to Aliva
                        </CardTitle>
                        <CardDescription className="text-lg">
                          These terms govern your use of our AI-powered nutrition platform.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            By using Aliva, you agree to these terms. If you don't agree, please don't use our service.
                          </AlertDescription>
                        </Alert>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-800 mb-2">What We Provide</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• AI-powered nutrition guidance</li>
                              <li>• Personalized meal recommendations</li>
                              <li>• Restaurant discovery features</li>
                              <li>• Health tracking tools</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">Your Responsibilities</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Provide accurate information</li>
                              <li>• Use the service responsibly</li>
                              <li>• Respect other users</li>
                              <li>• Follow applicable laws</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Acceptance Section */}
                {activeSection === "acceptance" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-amber-600" />
                          Acceptance of Terms
                        </CardTitle>
                        <CardDescription>
                          By using our service, you agree to be bound by these terms.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <h4 className="font-semibold text-amber-800 mb-2">Agreement to Terms</h4>
                          <p className="text-sm text-amber-700">
                            When you create an account or use our service, you automatically agree to these Terms of Service and our Privacy Policy.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">What This Means:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              You understand and accept our terms
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              You agree to use the service responsibly
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              You understand our limitations and disclaimers
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              You agree to our data practices as described in our Privacy Policy
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Usage Rights Section */}
                {activeSection === "usage" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <Users className="w-6 h-6 text-amber-600" />
                          Your Usage Rights
                        </CardTitle>
                        <CardDescription>
                          What you can do with our service.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Personal Use</h4>
                            <p className="text-sm text-muted-foreground mb-2">Use Aliva for your personal nutrition and health goals</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700">✅ Allowed</Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Create Account</h4>
                            <p className="text-sm text-muted-foreground mb-2">Sign up and create a profile to access personalized features</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700">✅ Allowed</Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Provide Feedback</h4>
                            <p className="text-sm text-muted-foreground mb-2">Share your experience to help us improve</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700">✅ Encouraged</Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Export Data</h4>
                            <p className="text-sm text-muted-foreground mb-2">Download your personal data anytime</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700">✅ Your Right</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Restrictions Section */}
                {activeSection === "restrictions" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <XCircle className="w-6 h-6 text-amber-600" />
                          Usage Restrictions
                        </CardTitle>
                        <CardDescription>
                          What you cannot do with our service.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">Prohibited Activities</h4>
                          <p className="text-sm text-red-700">The following activities are not allowed and may result in account suspension.</p>
                        </div>
                        <div className="space-y-3">
                          <div className="p-4 border rounded-lg bg-red-50/50">
                            <h4 className="font-semibold text-red-800 mb-2">Commercial Use</h4>
                            <p className="text-sm text-red-700">Don't use Aliva for commercial purposes without permission</p>
                          </div>
                          <div className="p-4 border rounded-lg bg-red-50/50">
                            <h4 className="font-semibold text-red-800 mb-2">Harmful Content</h4>
                            <p className="text-sm text-red-700">Don't share harmful, illegal, or inappropriate content</p>
                          </div>
                          <div className="p-4 border rounded-lg bg-red-50/50">
                            <h4 className="font-semibold text-red-800 mb-2">System Abuse</h4>
                            <p className="text-sm text-red-700">Don't attempt to hack, reverse engineer, or overload our systems</p>
                          </div>
                          <div className="p-4 border rounded-lg bg-red-50/50">
                            <h4 className="font-semibold text-red-800 mb-2">False Information</h4>
                            <p className="text-sm text-red-700">Don't provide false or misleading information about your health</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Disclaimers Section */}
                {activeSection === "disclaimers" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <AlertTriangle className="w-6 h-6 text-amber-600" />
                          Important Disclaimers
                        </CardTitle>
                        <CardDescription>
                          Please read these carefully - they're important for your safety.
                        </CardDescription>
                </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Not Medical Advice</h4>
                          <p className="text-sm text-yellow-700">
                            Aliva provides general nutrition information and is not a substitute for professional medical advice, diagnosis, or treatment.
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Consult Healthcare Providers</h4>
                            <p className="text-sm text-muted-foreground">Always consult qualified healthcare professionals for medical decisions</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Individual Results May Vary</h4>
                            <p className="text-sm text-muted-foreground">Nutrition advice affects people differently based on individual circumstances</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Emergency Situations</h4>
                            <p className="text-sm text-muted-foreground">In case of medical emergency, contact emergency services immediately</p>
                          </div>
                        </div>
                </CardContent>
              </Card>
                  </div>
                )}

                {/* Liability Section */}
                {activeSection === "liability" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <Shield className="w-6 h-6 text-amber-600" />
                          Limitation of Liability
                        </CardTitle>
                        <CardDescription>
                          Our liability is limited as described below.
                        </CardDescription>
                </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Service Availability</h4>
                          <p className="text-sm text-blue-700">
                            We strive for 99.9% uptime but cannot guarantee uninterrupted service. We're not liable for temporary outages.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">What We're Not Liable For:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              Health outcomes from following our recommendations
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              Third-party services or content we link to
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              Data loss due to technical issues
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              Indirect or consequential damages
                            </li>
                          </ul>
                        </div>
                </CardContent>
              </Card>
                  </div>
                )}

                {/* Changes Section */}
                {activeSection === "changes" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <Clock className="w-6 h-6 text-amber-600" />
                          Changes to Terms
                        </CardTitle>
                        <CardDescription>
                          How we handle updates to these terms.
                        </CardDescription>
                </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">We'll Notify You</h4>
                          <p className="text-sm text-green-700">
                            We'll notify you of significant changes via email or in-app notification at least 30 days before they take effect.
                          </p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Your Options:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              Continue using the service (accepts new terms)
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              Discontinue use before changes take effect
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></span>
                              Contact us with questions or concerns
                            </li>
                          </ul>
                        </div>
                        <div className="p-4 bg-muted border rounded-lg">
                          <h4 className="font-semibold mb-2">Minor Changes</h4>
                          <p className="text-sm text-muted-foreground">
                            Minor clarifications or corrections may be made without notice, but won't affect your rights or obligations.
                          </p>
                        </div>
                </CardContent>
              </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default TermsOfService;


