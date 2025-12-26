import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

const Security = () => {
  const { toast } = useToast();
  const [reporting, setReporting] = useState(false);

  const handleReport = async () => {
    try {
      setReporting(true);
      await new Promise((r) => setTimeout(r, 700));
      toast({ title: 'Thanks for your report', description: 'Our team will review it shortly.' });
    } finally {
      setReporting(false);
    }
  };

  const securityFeatures = [
    {
      icon: Lock,
      title: "Data Encryption",
      description: "In transit and at rest",
      details: "We use industry-standard TLS for data in transit and strong encryption for data at rest to protect your information."
    },
    {
      icon: Shield,
      title: "Access Controls",
      description: "Least-privilege by default",
      details: "Strict role-based access ensures only authorized processes and personnel can access sensitive systems."
    },
    {
      icon: Eye,
      title: "Monitoring & Response",
      description: "Proactive detection",
      details: "Continuous monitoring and alerting help us detect anomalies and respond swiftly to potential issues."
    }
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
              Security
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Security at Aliva
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We take security seriously. Here's how we keep your data safe and private.
            </p>
          </div>
        </section>

        {/* Security Features */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-primary mb-3">{feature.description}</p>
                  <p className="text-sm text-muted-foreground">{feature.details}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Report Section */}
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Report a Security Issue</h3>
                    <p className="text-sm text-muted-foreground">
                      Help us keep Aliva safe for everyone. If you've discovered a vulnerability, please report it responsibly.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleReport}
                  disabled={reporting}
                  className="shrink-0"
                >
                  {reporting ? 'Submitting...' : 'Report Issue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default Security;
