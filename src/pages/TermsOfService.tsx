import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Scale, Shield, AlertTriangle, Users, Clock, CheckCircle, XCircle, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Scale className="w-4 h-4" />
              Legal Terms
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Clear, fair terms that protect both you and us. Please read these carefully before using Aliva.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Last updated: January 2025</p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{section.title}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${activeSection === section.id ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Welcome to Aliva</h2>
                    <p className="text-muted-foreground mb-6">
                      These terms govern your use of our AI-powered nutrition platform.
                    </p>
                  </div>

                  <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 mb-6">
                    <CardContent className="p-4 flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-300">
                        By using Aliva, you agree to these terms. If you don't agree, please don't use our service.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-3">What We Provide</h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                          <li>• AI-powered nutrition guidance</li>
                          <li>• Personalized meal recommendations</li>
                          <li>• Restaurant discovery features</li>
                          <li>• Health tracking tools</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">Your Responsibilities</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                          <li>• Provide accurate information</li>
                          <li>• Use the service responsibly</li>
                          <li>• Respect other users</li>
                          <li>• Follow applicable laws</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Acceptance Section */}
              {activeSection === "acceptance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
                    <p className="text-muted-foreground mb-6">
                      By using our service, you agree to be bound by these terms.
                    </p>
                  </div>

                  <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 mb-6">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">Agreement to Terms</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        When you create an account or use our service, you automatically agree to these Terms of Service and our Privacy Policy.
                      </p>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className="font-semibold text-foreground mb-4">What This Means:</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>You understand and accept our terms</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>You agree to use the service responsibly</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>You understand our limitations and disclaimers</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>You agree to our data practices as described in our Privacy Policy</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Usage Rights Section */}
              {activeSection === "usage" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Your Usage Rights</h2>
                    <p className="text-muted-foreground mb-6">
                      What you can do with our service.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "Personal Use", desc: "Use Aliva for your personal nutrition and health goals", tag: "✅ Allowed" },
                      { title: "Create Account", desc: "Sign up and create a profile to access personalized features", tag: "✅ Allowed" },
                      { title: "Provide Feedback", desc: "Share your experience to help us improve", tag: "✅ Encouraged" },
                      { title: "Export Data", desc: "Download your personal data anytime", tag: "✅ Your Right" }
                    ].map((item, i) => (
                      <Card key={i} className="border-border">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full shrink-0 ml-4">
                              {item.tag}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Restrictions Section */}
              {activeSection === "restrictions" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Usage Restrictions</h2>
                    <p className="text-muted-foreground mb-6">
                      What you cannot do with our service.
                    </p>
                  </div>

                  <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 mb-6">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">Prohibited Activities</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        The following activities are not allowed and may result in account suspension.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {[
                      { title: "Commercial Use", desc: "Don't use Aliva for commercial purposes without permission" },
                      { title: "Harmful Content", desc: "Don't share harmful, illegal, or inappropriate content" },
                      { title: "System Abuse", desc: "Don't attempt to hack, reverse engineer, or overload our systems" },
                      { title: "False Information", desc: "Don't provide false or misleading information about your health" }
                    ].map((item, i) => (
                      <Card key={i} className="border-red-200 bg-red-50/30 dark:bg-red-950/10 dark:border-red-900/50">
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">{item.title}</h4>
                          <p className="text-sm text-red-700 dark:text-red-300">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimers Section */}
              {activeSection === "disclaimers" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Important Disclaimers</h2>
                    <p className="text-muted-foreground mb-6">
                      Please read these carefully - they're important for your safety.
                    </p>
                  </div>

                  <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900 mb-6">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">⚠️ Not Medical Advice</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Aliva provides general nutrition information and is not a substitute for professional medical advice, diagnosis, or treatment.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {[
                      { title: "Consult Healthcare Providers", desc: "Always consult qualified healthcare professionals for medical decisions" },
                      { title: "Individual Results May Vary", desc: "Nutrition advice affects people differently based on individual circumstances" },
                      { title: "Emergency Situations", desc: "In case of medical emergency, contact emergency services immediately" }
                    ].map((item, i) => (
                      <Card key={i} className="border-border">
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Liability Section */}
              {activeSection === "liability" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
                    <p className="text-muted-foreground mb-6">
                      Our liability is limited as described below.
                    </p>
                  </div>

                  <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 mb-6">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Service Availability</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        We strive for 99.9% uptime but cannot guarantee uninterrupted service. We're not liable for temporary outages.
                      </p>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className="font-semibold text-foreground mb-4">What We're Not Liable For:</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Health outcomes from following our recommendations</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Third-party services or content we link to</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Data loss due to technical issues</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Indirect or consequential damages</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Changes Section */}
              {activeSection === "changes" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
                    <p className="text-muted-foreground mb-6">
                      How we handle updates to these terms.
                    </p>
                  </div>

                  <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900 mb-6">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">We'll Notify You</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        We'll notify you of significant changes via email or in-app notification at least 30 days before they take effect.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="mb-6">
                    <h4 className="font-semibold text-foreground mb-4">Your Options:</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Continue using the service (accepts new terms)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Discontinue use before changes take effect</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Contact us with questions or concerns</span>
                      </li>
                    </ul>
                  </div>

                  <Card className="border-border">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-foreground mb-2">Minor Changes</h4>
                      <p className="text-sm text-muted-foreground">
                        Minor clarifications or corrections may be made without notice, but won't affect your rights or obligations.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default TermsOfService;
