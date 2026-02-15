import { useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Bell, Crown, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
    isPro?: boolean;
}

const MobileHeader = ({ isPro = false }: MobileHeaderProps) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-background/80 backdrop-blur-md border-b border-border/40 flex items-center justify-between px-4">
            <Logo className="h-6 w-auto" />

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={toggleTheme}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-muted-foreground" />
                    ) : (
                        <Moon className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="sr-only">Toggle theme</span>
                </Button>
                <div
                    onClick={() => navigate('/profile')}
                    className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer ring-2 shadow-sm transition-all",
                        isPro
                            ? "bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 text-yellow-950 ring-yellow-400/50"
                            : "bg-gradient-to-br from-primary to-primary-dark text-white ring-background"
                    )}
                >
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </div>
            </div>
        </header>
    );
};

export default MobileHeader;
