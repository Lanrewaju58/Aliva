import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Security</h1>
            <p className="text-muted-foreground leading-relaxed text-lg">
              We take security seriously. Here’s how we keep your data safe and private.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Data Encryption</CardTitle>
              <CardDescription>In transit and at rest</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We use industry-standard TLS for data in transit and strong encryption for data at rest to protect your information.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Access Controls</CardTitle>
              <CardDescription>Least-privilege by default</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Strict role-based access ensures only authorized processes and personnel can access sensitive systems.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Monitoring & Response</CardTitle>
              <CardDescription>Proactive detection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Continuous monitoring and alerting help us detect anomalies and respond swiftly to potential issues.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <Card>
            <CardHeader>
              <CardTitle>Report a Security Issue</CardTitle>
              <CardDescription>Help us keep Aliva safe for everyone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">
                <p className="text-sm text-muted-foreground">
                  If you’ve discovered a vulnerability, please report it responsibly. We appreciate your help.
                </p>
                <Button onClick={handleReport} disabled={reporting}>{reporting ? 'Submitting…' : 'Report an issue'}</Button>
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


