import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    User,
    Settings,
    LogOut,
    Crown,
    History,
    UtensilsCrossed,
    HelpCircle,
    Stethoscope,
    Newspaper
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
    isPro?: boolean;
    daysUntilExpiry?: number;
}

const Sidebar = ({ isPro = false, daysUntilExpiry = Infinity }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { theme } = useTheme();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/auth');
        } catch (error) {
            console.error('Failed to sign out', error);
        }
    };

    const navItems = [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Meal Planner", href: "/meal-planner", icon: UtensilsCrossed },
        { label: "Aliva Blog", href: "/blog", icon: Newspaper },
        { label: "Progress", href: "/progress", icon: History },
        { label: "Profile", href: "/profile", icon: User },
    ];

    const secondaryItems = [
        { label: "Help Center", href: "/help", icon: HelpCircle },
    ];

    const showUpgrade = !isPro || (isPro && daysUntilExpiry <= 10);

    return (
        <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 border-r bg-card/50 backdrop-blur-xl z-50">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-border/40">
                <Link to="/dashboard">
                    <Logo className="h-8 w-auto" />
                </Link>
            </div>

            {/* Main Nav */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                <div className="space-y-1">
                    <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        Menu
                    </h4>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                )}
                                <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="space-y-1">
                    <h4 className="px-2 text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                        Support
                    </h4>
                    {secondaryItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-border/40 bg-muted/20">
                <div className={cn(
                    "flex items-center gap-3 mb-4 p-2 rounded-lg border shadow-sm transition-all",
                    isPro
                        ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-500/20"
                        : "bg-background border-border/50"
                )}>
                    <div className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs ring-2",
                        isPro
                            ? "bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-yellow-950 ring-yellow-400/50"
                            : "bg-gradient-to-br from-primary to-primary-dark text-white ring-background"
                    )}>
                        {user?.displayName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className={cn("text-sm font-medium truncate", isPro && "text-amber-700 dark:text-amber-400")}>
                                {user?.displayName || 'User'}
                            </p>
                            {isPro && <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>

                {showUpgrade && (
                    <Link to="/upgrade">
                        <div className={cn(
                            "mb-4 p-3 rounded-lg border transition-all group cursor-pointer",
                            isPro
                                ? "bg-red-50 border-red-100 hover:bg-red-100/80"
                                : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:from-amber-500/15 hover:to-orange-500/15"
                        )}>
                            <div className="flex items-center gap-2 mb-1">
                                <Crown className={cn("w-4 h-4", isPro ? "text-red-500" : "text-amber-500")} />
                                <span className={cn(
                                    "text-sm font-semibold",
                                    isPro ? "text-red-600" : "text-amber-600 dark:text-amber-500"
                                )}>
                                    {isPro ? "Plan Expiring Soon" : "Upgrade Plan"}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {isPro ? `Expires in ${daysUntilExpiry} days` : "Get unlimited access to AI features"}
                            </p>
                        </div>
                    </Link>
                )}

                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </aside>
    );
};

export default Sidebar;
