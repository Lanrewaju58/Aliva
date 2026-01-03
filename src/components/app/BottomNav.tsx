import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, History, User, UtensilsCrossed, Plus } from "lucide-react";

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { label: "Home", href: "/dashboard", icon: LayoutDashboard },
        { label: "Meals", href: "/meal-planner", icon: UtensilsCrossed },
        // FAB Middle Button
        { label: "Log", href: "#log", icon: Plus, isFab: true },
        { label: "Progress", href: "/progress", icon: History },
        { label: "Profile", href: "/profile", icon: User },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-safe">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;

                    if (item.isFab) {
                        return (
                            <div key={item.label} className="relative -top-5">
                                <button
                                    onClick={() => {
                                        // Trigger unified add modal (to be implemented)
                                        const event = new CustomEvent('open-quick-log');
                                        window.dispatchEvent(event);
                                    }}
                                    className="h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive && "fill-current")} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
