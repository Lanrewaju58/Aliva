import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { ArrowRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FooterSection = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/upgrade" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Meal Planner", href: "/meal-planner" }
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" }
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security", href: "/security" }
    ]
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    setEmail("");
  };

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="inline-flex items-center gap-2 mb-6">
              <Logo className="h-8 w-auto transition-colors duration-300" />
            </a>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              Your AI-powered nutrition companion. Get personalized meal plans,
              track your nutrition, and achieve your health goals with intelligent guidance.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <Button type="submit" size="sm" className="h-10 px-4">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Aliva. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="mailto:foodaliva@gmail.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              foodaliva@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;