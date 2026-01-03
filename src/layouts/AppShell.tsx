import { Outlet } from "react-router-dom";
import Sidebar from "@/components/app/Sidebar";
import BottomNav from "@/components/app/BottomNav";
import MobileHeader from "@/components/app/MobileHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { UserProfile } from "@/types/profile";
import { profileService } from "@/services/profileService";

const AppShell = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (user?.uid) {
            profileService.getProfile(user.uid).then(setProfile);
        }
    }, [user?.uid]);

    const isPro = profile?.plan === 'PRO';

    // Calculate days until expiry
    let daysUntilExpiry = Infinity;
    if (profile?.planExpiresAt) {
        // Handle Firestore Timestamp or Date string
        const expiry = (profile.planExpiresAt as any).toDate ? (profile.planExpiresAt as any).toDate() : new Date(profile.planExpiresAt);
        const now = new Date();
        const diffTime = Math.abs(expiry.getTime() - now.getTime());
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <Sidebar isPro={isPro} daysUntilExpiry={daysUntilExpiry} />

            {/* Mobile Header */}
            <MobileHeader isPro={isPro} />

            {/* Main Content Area */}
            <main className="lg:pl-64 min-h-screen pt-14 pb-20 lg:pt-0 lg:pb-0 transition-all duration-300">
                <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default AppShell;
