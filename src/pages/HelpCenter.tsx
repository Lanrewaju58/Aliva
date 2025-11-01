import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";

const HelpCenter = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-secondary/10 to-background border-b border-border/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Help Center</h1>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Quick answers to common questions. Still need help? Reach out on the Contact page.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Get instant answers to common topics</CardDescription>
            </CardHeader>
            <CardContent>
              <HelpFaq />
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Button onClick={() => (window.location.href = '/contact')}>Still need help? Contact us</Button>
          </div>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};

export default HelpCenter;

function HelpFaq() {
  const [query, setQuery] = useState("");
  const faqs = [
    { q: "How does personalization work?", a: "Aliva tailors recommendations based on your preferences and goals. You can adjust inputs anytime in your profile for better results." },
    { q: "How do you rate restaurants?", a: "We combine menu analysis with nutrition heuristics to highlight healthier options. Filters help you align choices with your targets." },
    { q: "What data do you store?", a: "We store essential data to power your experience and never sell your information. See our Privacy Policy for full details." },
    { q: "Can I export my data?", a: "Yes, contact us to request a data export, and we’ll provide your information securely." },
  ];

  const filtered = useMemo(() => {
    return faqs.filter((f) => (f.q + " " + f.a).toLowerCase().includes(query.toLowerCase()));
  }, [faqs, query]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search FAQs"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2"
      />
      <Accordion type="single" collapsible className="w-full">
        {filtered.map((f, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground p-4">No results found.</div>
        )}
      </Accordion>
    </div>
  );
}


