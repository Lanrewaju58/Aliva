import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Crown, TrendingUp, Activity, UserPlus } from "lucide-react";
import { adminService, AdminUser } from "@/services/adminService";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminOverview = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activePro: 0,
        mrr: 0,
    });
    const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [revenueStats, allUsers] = await Promise.all([
                    adminService.getRevenueStats(),
                    adminService.getAllUsers()
                ]);

                setStats({
                    totalUsers: allUsers.length,
                    activePro: revenueStats.activeSubscriptions,
                    mrr: revenueStats.monthlyRecurring
                });

                // Get 5 most recent users
                setRecentUsers(allUsers.slice(0, 5));
            } catch (error) {
                console.error("Error fetching overview data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-[400px] rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (MRR)</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.mrr)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Estimated Monthly Recurring Revenue
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscribers</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                            <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePro}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Users on PRO plan
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Total registered accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Activity className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p>Activity chart coming soon</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Signups</CardTitle>
                        <CardDescription>
                            Latest users to join the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user.userId} className="flex items-center gap-4">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                        <span className="font-semibold text-xs text-primary">
                                            {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-none truncate">{user.fullName}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground shrink-0 tabular-nums">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
