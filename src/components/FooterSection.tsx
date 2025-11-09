import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

const FooterSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState<number | null>(null);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const footer = document.querySelector('#footer-section');
    if (footer) observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  const socialButtons = [
    { icon: Mail, label: "Email" }
  ];

  const companyLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" }
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Security", href: "/security" }
  ];

  return (
    <footer id="footer-section" className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-t border-border/50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className={`lg:col-span-1 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <a href="/#home" className="flex items-center space-x-3 mb-6 group">
              <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img
                  src="/logo.svg"
                  alt="Aliva Logo"
                  className="h-10 w-auto shrink-0 group-hover:brightness-110 transition-all duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </a>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your AI-powered nutrition platform for personalized dietary advice, 
              healthy restaurant discovery, and custom meal planning.
            </p>
            <div className="flex space-x-4">
              {socialButtons.map((social, index) => (
                <Button 
                  key={index}
                  variant="ghost" 
                  size="sm" 
                  className={`transition-all duration-300 ${
                    hoveredSocial === index 
                      ? 'text-primary scale-110 -translate-y-1 shadow-lg' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                  onMouseEnter={() => setHoveredSocial(index)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className={`transition-all duration-700 delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
              Company
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </h3>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className={`group flex items-center text-muted-foreground transition-all duration-300 ${
                      hoveredLink === link.name ? 'text-primary translate-x-2' : ''
                    }`}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <span className={`w-0 h-px bg-primary transition-all duration-300 mr-0 ${
                      hoveredLink === link.name ? 'w-4 mr-2' : ''
                    }`} />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className={`transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
              Support
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </h3>
            <ul className="space-y-4">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className={`group flex items-center text-muted-foreground transition-all duration-300 ${
                      hoveredLink === link.name ? 'text-primary translate-x-2' : ''
                    }`}
                    onMouseEnter={() => setHoveredLink(link.name)}
                    onMouseLeave={() => setHoveredLink(null)}
                  >
                    <span className={`w-0 h-px bg-primary transition-all duration-300 mr-0 ${
                      hoveredLink === link.name ? 'w-4 mr-2' : ''
                    }`} />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className={`transition-all duration-700 delay-450 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
              Stay Updated
              <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get the latest nutrition tips and healthy recipes delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
              />
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                →
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`border-t border-border/50 mt-12 pt-8 transition-all duration-700 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground flex items-center gap-2">
              © 2025 Aliva. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </footer>
  );
};

export default FooterSection;