import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Search, HelpCircle, MessageCircle } from "lucide-react";

const HelpCenter = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Support
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Help Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick answers to common questions. Still need help? Reach out on the Contact page.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-border">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-2">Frequently Asked Questions</h2>
                <p className="text-sm text-muted-foreground">Get instant answers to common topics</p>
              </div>
              <HelpFaq />
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Card className="border-border bg-muted/30">
              <CardContent className="p-6">
                <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Still need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is here to assist you with any questions.
                </p>
                <Button onClick={() => (window.location.href = '/contact')}>
                  Contact Support
                </Button>
              </CardContent>
            </Card>
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
    { q: "Can I export my data?", a: "Yes, contact us to request a data export, and we'll provide your information securely." },
    { q: "How do I cancel my subscription?", a: "You can cancel your subscription anytime from your profile settings. Your access will continue until the end of your billing period." },
    { q: "Is my health data secure?", a: "Yes, we use industry-standard encryption and security practices to protect all your personal and health information." }
  ];

  const filtered = useMemo(() => {
    return faqs.filter((f) => (f.q + " " + f.a).toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search FAQs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      <Accordion type="single" collapsible className="w-full">
        {filtered.map((f, idx) => (
          <AccordionItem key={idx} value={`item-${idx}`} className="border-border">
            <AccordionTrigger className="text-left hover:no-underline py-4">
              <span className="font-medium text-foreground">{f.q}</span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No results found. Try a different search term.
          </div>
        )}
      </Accordion>
    </div>
  );
}
