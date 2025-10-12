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
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Loved by Thousands of
            <span className="block bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
              Health-Conscious People
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how Aliva is helping people achieve their health goals with personalized AI guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-0 bg-card/50 backdrop-blur-sm card-hover">
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <Quote className="w-8 h-8 text-primary/20 ml-auto" />
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary fill-current" />
                  ))}
                </div>

                <p className="text-muted-foreground italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-muted-foreground mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-primary fill-current" />
              ))}
            </div>
            <span className="text-lg font-semibold">4.9/5 from 50,000+ users</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;