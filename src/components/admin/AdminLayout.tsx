import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Shield,
    LayoutDashboard,
    Users,
    DollarSign,
    Film,
    Settings,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const AdminLayout = ({ children, activeTab, onTabChange }: AdminLayoutProps) => {
    const { user, signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const menuItems = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "users", label: "Users", icon: Users },
        { id: "revenue", label: "Revenue", icon: DollarSign },
        { id: "content", label: "Content", icon: Film },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-card border-r border-border">
            <div className="p-6 flex items-center gap-3 border-b border-border/50">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-tight">Aliva Admin</h1>
                    <p className="text-xs text-muted-foreground">Management Portal</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onTabChange(item.id);
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <Avatar className="h-9 w-9 border border-border">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                            {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.displayName || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetContent side="left" className="p-0 w-72">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-semibold">Aliva Admin</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {menuItems.find(i => i.id === activeTab)?.label}
                            </h2>
                        </div>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};
