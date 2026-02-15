import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Clock, Send, CheckCircle, MessageCircle, HelpCircle, Lightbulb, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;

    if (!name || !email || !subject || !message) {
      toast({ title: 'Missing information', description: 'Please fill in all required fields.' });
      return;
    }
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((res) => setTimeout(res, 1000));
      toast({
        title: 'Message sent successfully!',
        description: "We'll get back to you within 24 hours."
      });
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
    } catch (err) {
      toast({ title: 'Something went wrong', description: 'Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  const faqItems = [
    { icon: Clock, question: "How quickly do you respond?", answer: "We typically respond within 24 hours during business days." },
    { icon: Users, question: "Do you offer enterprise solutions?", answer: "Yes! We have special plans for healthcare organizations and large teams." },
    { icon: Lightbulb, question: "Can I suggest new features?", answer: "Absolutely! We love hearing from our users and consider all feature requests." }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 bg-muted/30 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MessageCircle className="w-4 h-4" />
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions, feedback, or partnership ideas? We'd love to hear from you.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Column - Info */}
            <div className="space-y-8">
              {/* Contact Card */}
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
                      <p className="text-sm text-muted-foreground mb-2">Send us a detailed message</p>
                      <p className="font-medium text-primary">foodaliva@gmail.com</p>
                      <p className="text-xs text-muted-foreground mt-1">We respond within 24 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Quick Answers</h3>
                <div className="space-y-3">
                  {faqItems.map((item, index) => (
                    <Card key={index} className="border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <item.icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-medium text-sm text-foreground mb-1">{item.question}</h4>
                            <p className="text-xs text-muted-foreground">{item.answer}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-foreground mb-2">Send us a Message</h2>
                    <p className="text-muted-foreground">Fill out the form below and we'll get back to you.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your name"
                          className="h-11"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          className="h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="feedback">Feature Request</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="What's this about?"
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us how we can help you..."
                        className="min-h-[140px] resize-none"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="h-11 px-8"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4" />
                        We'll respond within 24 hours
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default Contact;
