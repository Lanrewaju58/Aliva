import Navigation from "@/components/Navigation";
import FooterSection from "@/components/FooterSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle, Users, HelpCircle, Lightbulb } from "lucide-react";
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
        title: 'Message sent successfully! ✅', 
        description: 'We\'ll get back to you within 24 hours.' 
      });
      setFormData({ name: '', email: '', subject: '', category: '', message: '' });
    } catch (err) {
      toast({ title: 'Something went wrong', description: 'Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us a detailed message",
      contact: "hello@aliva.com",
      response: "Within 24 hours"
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak with our support team",
      contact: "+2348023480890",
      response: "Mon-Fri, 9AM-6PM GMT"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "Come say hello in person",
      contact: "123 Health Street, Ikoyi, LA",
      response: "By appointment only"
    }
  ];

  const faqItems = [
    {
      icon: HelpCircle,
      question: "How quickly do you respond?",
      answer: "We typically respond to all inquiries within 24 hours during business days."
    },
    {
      icon: Users,
      question: "Do you offer enterprise solutions?",
      answer: "Yes! We have special plans for healthcare organizations and large teams."
    },
    {
      icon: Lightbulb,
      question: "Can I suggest new features?",
      answer: "Absolutely! We love hearing from our users and consider all feature requests."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <MessageCircle className="w-4 h-4" />
                Get in Touch
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-emerald-800 to-gray-900 bg-clip-text text-transparent">
                Contact Us
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Have questions, feedback, or partnership ideas? We'd love to hear from you and help you on your nutrition journey.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="secondary" className="px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Quick response time
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <Users className="w-4 h-4 mr-2" />
                  Expert support team
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Methods */}
            <div className="lg:col-span-1 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                <div className="space-y-6">
                  {contactMethods.map((method, index) => (
                    <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-emerald-100 rounded-lg">
                            <method.icon className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{method.title}</h3>
                            <p className="text-muted-foreground text-sm mb-2">{method.description}</p>
                            <p className="font-medium text-emerald-600 mb-1">{method.contact}</p>
                            <p className="text-xs text-muted-foreground">{method.response}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Quick Answers</h2>
                <div className="space-y-4">
                  {faqItems.map((item, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <item.icon className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{item.question}</h4>
                            <p className="text-xs text-muted-foreground">{item.answer}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-6">
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <Send className="w-8 h-8 text-emerald-600" />
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          className="h-12"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          className="h-12"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="h-12">
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
                        name="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="What's this about?"
                        className="h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Tell us how we can help you..."
                        className="min-h-[140px] resize-none"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <Button 
                        type="submit" 
                        disabled={submitting}
                        className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white"
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
                      <div className="text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
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


