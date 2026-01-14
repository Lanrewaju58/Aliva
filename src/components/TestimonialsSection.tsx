import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Busy Professional",
    content: "Aliva has completely transformed how I approach eating. The AI consultant gives me personalized advice that actually fits my hectic schedule. I've lost 15 pounds and feel more energetic than ever!",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Fitness Enthusiast",
    content: "As someone who's tried every diet app out there, this is different. The restaurant recommendations with nutritional analysis are spot-on, and the meal planning feature saves me hours every week.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Working Mom",
    content: "Finally, a nutrition app that understands real life! The AI helps me find healthy options when I'm dining out with my kids, and the quick recipe suggestions are perfect for busy weeknights.",
    rating: 5,
    avatar: "ER"
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how Aliva is helping people achieve their health goals with personalized AI guidance.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 bg-card"
            >
              {/* Header with avatar */}
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm mr-3">
                  {testimonial.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
                <Quote className="w-6 h-6 text-muted-foreground/30" />
              </div>

              {/* Star Rating */}
              <div className="flex mb-3 gap-0.5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-primary fill-current"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                "{testimonial.content}"
              </p>
            </Card>
          ))}
        </div>

        {/* Bottom Rating */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-primary fill-current" />
              ))}
            </div>
            <span className="text-sm font-medium">
              4.9/5 from 50,000+ users
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;