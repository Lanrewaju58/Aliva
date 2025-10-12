import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Database, UserCheck, Settings, Mail, Calendar } from "lucide-react";
import { useState } from "react";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: Shield },
    { id: "collection", title: "Data Collection", icon: Database },
    { id: "usage", title: "Data Usage", icon: Eye },
    { id: "sharing", title: "Data Sharing", icon: Lock },
    { id: "rights", title: "Your Rights", icon: UserCheck },
    { id: "contact", title: "Contact Us", icon: Mail }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Privacy & Security
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Your privacy is fundamental to our mission. We're transparent about what we collect, 
                how we use it, and how you can control it.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last updated: January 2025
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Settings className="w-4 h-4 mr-2" />
                  Easy to understand
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
                          ? "bg-primary text-white shadow-lg"
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
                          <Shield className="w-6 h-6 text-primary" />
                          Our Privacy Commitment
                        </CardTitle>
                        <CardDescription className="text-lg">
                          We believe your health data should be private, secure, and under your control.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-800 mb-2">What We Do</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• Collect only necessary data</li>
                              <li>• Use data to improve your experience</li>
                              <li>• Never sell your personal information</li>
                              <li>• Give you full control over your data</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2">What We Don't Do</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Share data with third parties</li>
                              <li>• Track you across other websites</li>
                              <li>• Use data for advertising</li>
                              <li>• Store data longer than necessary</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Data Collection Section */}
                {activeSection === "collection" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <Database className="w-6 h-6 text-primary" />
                          Information We Collect
                        </CardTitle>
                        <CardDescription>
                          We only collect data that helps us provide better nutrition guidance.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Account Information</h4>
                            <p className="text-sm text-muted-foreground mb-2">Email, name, and profile details you provide</p>
                            <Badge variant="outline">Required for service</Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Health & Dietary Data</h4>
                            <p className="text-sm text-muted-foreground mb-2">Goals, preferences, allergies, and health conditions</p>
                            <Badge variant="outline">Required for personalization</Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Usage Analytics</h4>
                            <p className="text-sm text-muted-foreground mb-2">How you interact with our app to improve features</p>
                            <Badge variant="outline">Optional</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Data Usage Section */}
                {activeSection === "usage" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <Eye className="w-6 h-6 text-primary" />
                          How We Use Your Data
                        </CardTitle>
                        <CardDescription>
                          Your data helps us provide personalized nutrition guidance.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <h4 className="font-semibold mb-2">Personalization</h4>
                            <p className="text-sm text-muted-foreground">Create meal plans and recommendations tailored to your needs</p>
                          </div>
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <h4 className="font-semibold mb-2">Service Improvement</h4>
                            <p className="text-sm text-muted-foreground">Analyze usage patterns to enhance our features</p>
                          </div>
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <h4 className="font-semibold mb-2">Security</h4>
                            <p className="text-sm text-muted-foreground">Protect your account and prevent unauthorized access</p>
                          </div>
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <h4 className="font-semibold mb-2">Communication</h4>
                            <p className="text-sm text-muted-foreground">Send important updates about your account and our service</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Data Sharing Section */}
                {activeSection === "sharing" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <Lock className="w-6 h-6 text-primary" />
                          Data Sharing & Security
                        </CardTitle>
                        <CardDescription>
                          We never sell your data and only share it when absolutely necessary.
                        </CardDescription>
                </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-semibold text-red-800 mb-2">We Never Sell Your Data</h4>
                          <p className="text-sm text-red-700">Your personal information is never sold to third parties for marketing purposes.</p>
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-semibold">Limited Sharing Only When:</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              Required by law or legal process
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              Necessary to protect our rights or safety
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              You explicitly consent to sharing
                            </li>
                  </ul>
                        </div>
                </CardContent>
              </Card>
                  </div>
                )}

                {/* Your Rights Section */}
                {activeSection === "rights" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <UserCheck className="w-6 h-6 text-primary" />
                          Your Privacy Rights
                        </CardTitle>
                        <CardDescription>
                          You have complete control over your personal data.
                        </CardDescription>
                </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Access Your Data</h4>
                            <p className="text-sm text-muted-foreground mb-2">Download a copy of all your personal information</p>
                            <Badge variant="outline">Available in settings</Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Update Information</h4>
                            <p className="text-sm text-muted-foreground mb-2">Modify your profile and preferences anytime</p>
                            <Badge variant="outline">Self-service</Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Delete Account</h4>
                            <p className="text-sm text-muted-foreground mb-2">Permanently remove your account and all data</p>
                            <Badge variant="outline">Irreversible</Badge>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Opt Out</h4>
                            <p className="text-sm text-muted-foreground mb-2">Disable data collection for analytics and personalization</p>
                            <Badge variant="outline">Partial service</Badge>
                          </div>
                        </div>
                </CardContent>
              </Card>
                  </div>
                )}

                {/* Contact Section */}
                {activeSection === "contact" && (
                  <div className="space-y-6">
                    <Card className="border-0 shadow-lg">
                <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3">
                          <Mail className="w-6 h-6 text-primary" />
                          Privacy Questions?
                        </CardTitle>
                        <CardDescription>
                          We're here to help with any privacy concerns or questions.
                        </CardDescription>
                </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <h4 className="font-semibold mb-2">Email Us</h4>
                            <p className="text-sm text-muted-foreground mb-2">privacy@aliva.com</p>
                            <p className="text-xs text-muted-foreground">We respond within 24 hours</p>
                          </div>
                          <div className="p-4 bg-primary/5 rounded-lg">
                            <h4 className="font-semibold mb-2">Data Requests</h4>
                            <p className="text-sm text-muted-foreground mb-2">Use our self-service portal</p>
                            <p className="text-xs text-muted-foreground">Instant access to your data</p>
                          </div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Need Help?</h4>
                          <p className="text-sm text-blue-700">Our privacy team is available to help you understand your rights and exercise them.</p>
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

export default PrivacyPolicy;


