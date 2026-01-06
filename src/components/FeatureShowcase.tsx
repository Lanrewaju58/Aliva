import { useState } from "react";
import { Monitor, ChevronLeft, ChevronRight } from "lucide-react";

const showcaseItems = [
    {
        id: "dashboard",
        title: "Smart Dashboard",
        description: "Track calories, macros, streaks and daily nutrition at a glance",
        image: "/showcase/dashboard.png",
    },
    {
        id: "meal-planner",
        title: "Weekly Meal Planner",
        description: "Plan your entire week with customizable breakfast, lunch, dinner, and snacks",
        image: "/showcase/meal-planner.png",
    },
    {
        id: "progress",
        title: "Progress Analytics",
        description: "Monitor weight changes, calorie intake charts, and consistency metrics",
        image: "/showcase/progress.png",
    },
    {
        id: "health-metrics",
        title: "Health Metrics",
        description: "Track steps, sleep, calories burned, heart rate, and 7-day averages",
        image: "/showcase/health-metrics.png",
    },
    {
        id: "mindfulness",
        title: "Mindfulness Studio",
        description: "Guided breathing exercises with box breathing and voice guidance",
        image: "/showcase/mindfulness.png",
    },
];

const FeatureShowcase = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev === 0 ? showcaseItems.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev === showcaseItems.length - 1 ? 0 : prev + 1));
    };

    const activeItem = showcaseItems[activeIndex];

    return (
        <section className="py-20 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                        <Monitor className="w-4 h-4" />
                        <span>App Preview</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        See What's Inside
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Explore our powerful features designed to help you achieve your health goals
                    </p>
                </div>

                {/* Showcase Container */}
                <div className="relative">
                    {/* Main Image Display */}
                    <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-3xl p-4 md:p-8 border border-border overflow-hidden">

                        {/* Image Container */}
                        <div className="relative rounded-2xl overflow-hidden bg-[#0a1612] shadow-2xl border border-white/10">
                            <img
                                src={activeItem.image}
                                alt={activeItem.title}
                                className="w-full h-auto block transition-opacity duration-300"
                                style={{ imageRendering: 'auto' }}
                            />
                            {/* Title Badge */}
                            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-lg">
                                <span className="font-semibold text-foreground">{activeItem.title}</span>
                            </div>
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            onClick={handlePrev}
                            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-background/90 backdrop-blur-sm rounded-full border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-background/90 backdrop-blur-sm rounded-full border border-border shadow-lg flex items-center justify-center hover:bg-background transition-colors"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
                        </button>
                    </div>

                    {/* Description */}
                    <div className="text-center mt-6">
                        <p className="text-muted-foreground text-lg">{activeItem.description}</p>
                    </div>

                    {/* Thumbnail Navigation */}
                    <div className="flex justify-center gap-3 mt-8">
                        {showcaseItems.map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveIndex(index)}
                                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${index === activeIndex
                                    ? "border-primary ring-2 ring-primary/20 scale-105"
                                    : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <div className="w-20 h-12 md:w-28 md:h-16 overflow-hidden bg-[#0a1612]">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className={`w-full h-full object-contain transition-all duration-300 ${index === activeIndex ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                                            }`}
                                    />
                                </div>
                                {/* Active indicator */}
                                {index === activeIndex && (
                                    <div className="absolute inset-0 bg-primary/10" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Dots indicator for mobile */}
                    <div className="flex justify-center gap-2 mt-6 md:hidden">
                        {showcaseItems.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeIndex
                                    ? "bg-primary w-6"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureShowcase;
