import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Eye, Lock, Database, UserCheck, Mail, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your privacy is fundamental to our mission. We're transparent about what we collect, how we use it, and how you can control it.
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
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Our Privacy Commitment</h2>
                    <p className="text-muted-foreground mb-6">
                      We believe your health data should be private, secure, and under your control. Here's how we protect you.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-3">What We Do</h4>
                        <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                          <li>• Collect only necessary data</li>
                          <li>• Use data to improve your experience</li>
                          <li>• Never sell your personal information</li>
                          <li>• Give you full control over your data</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">What We Don't Do</h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                          <li>• Share data with third parties</li>
                          <li>• Track you across other websites</li>
                          <li>• Use data for advertising</li>
                          <li>• Store data longer than necessary</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Data Collection Section */}
              {activeSection === "collection" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
                    <p className="text-muted-foreground mb-6">
                      We only collect data that helps us provide better nutrition guidance.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "Account Information", desc: "Email, name, and profile details you provide", tag: "Required for service" },
                      { title: "Health & Dietary Data", desc: "Goals, preferences, allergies, and health conditions", tag: "Required for personalization" },
                      { title: "Usage Analytics", desc: "How you interact with our app to improve features", tag: "Optional" }
                    ].map((item, i) => (
                      <Card key={i} className="border-border">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground shrink-0 ml-4">
                              {item.tag}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Usage Section */}
              {activeSection === "usage" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Data</h2>
                    <p className="text-muted-foreground mb-6">
                      Your data helps us provide personalized nutrition guidance.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "Personalization", desc: "Create meal plans and recommendations tailored to your needs" },
                      { title: "Service Improvement", desc: "Analyze usage patterns to enhance our features" },
                      { title: "Security", desc: "Protect your account and prevent unauthorized access" },
                      { title: "Communication", desc: "Send important updates about your account and our service" }
                    ].map((item, i) => (
                      <Card key={i} className="border-border">
                        <CardContent className="p-5">
                          <h4 className="font-semibold text-foreground mb-2">{item.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Data Sharing Section */}
              {activeSection === "sharing" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sharing & Security</h2>
                    <p className="text-muted-foreground mb-6">
                      We never sell your data and only share it when absolutely necessary.
                    </p>
                  </div>

                  <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 mb-6">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">We Never Sell Your Data</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Your personal information is never sold to third parties for marketing purposes.
                      </p>
                    </CardContent>
                  </Card>

                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Limited Sharing Only When:</h4>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Required by law or legal process</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>Necessary to protect our rights or safety</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
                        <span>You explicitly consent to sharing</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Your Rights Section */}
              {activeSection === "rights" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Your Privacy Rights</h2>
                    <p className="text-muted-foreground mb-6">
                      You have complete control over your personal data.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: "Access Your Data", desc: "Download a copy of all your personal information", tag: "Available in settings" },
                      { title: "Update Information", desc: "Modify your profile and preferences anytime", tag: "Self-service" },
                      { title: "Delete Account", desc: "Permanently remove your account and all data", tag: "Irreversible" },
                      { title: "Opt Out", desc: "Disable data collection for analytics and personalization", tag: "Partial service" }
                    ].map((item, i) => (
                      <Card key={i} className="border-border">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground shrink-0 ml-4">
                              {item.tag}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Section */}
              {activeSection === "contact" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-4">Privacy Questions?</h2>
                    <p className="text-muted-foreground mb-6">
                      We're here to help with any privacy concerns or questions.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-border">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-foreground mb-2">Email Us</h4>
                        <p className="text-primary font-medium mb-1">foodaliva@gmail.com</p>
                        <p className="text-xs text-muted-foreground">We respond within 24 hours</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border">
                      <CardContent className="p-5">
                        <h4 className="font-semibold text-foreground mb-2">Data Requests</h4>
                        <p className="text-sm text-muted-foreground mb-1">Use our self-service portal</p>
                        <p className="text-xs text-muted-foreground">Instant access to your data</p>
                      </CardContent>
                    </Card>
                  </div>
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

export default PrivacyPolicy;
