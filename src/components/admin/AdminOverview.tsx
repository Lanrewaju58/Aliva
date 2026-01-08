import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, DollarSign, Crown, UserPlus } from "lucide-react";
import { adminService, AdminUser } from "@/services/adminService";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const AdminOverview = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activePro: 0,
        mrr: 0,
        todaySignups: 0,
    });
    const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
    const [dailyStats, setDailyStats] = useState<{ date: string; count: number; label: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [revenueStats, allUsers] = await Promise.all([
                    adminService.getRevenueStats(),
                    adminService.getAllUsers()
                ]);

                // Get daily user stats for chart
                const dailyUserStats = adminService.getDailyUserStats(allUsers, 14);
                setDailyStats(dailyUserStats);

                // Calculate today's signups
                const todayCount = dailyUserStats.length > 0 ? dailyUserStats[dailyUserStats.length - 1].count : 0;

                setStats({
                    totalUsers: allUsers.length,
                    activePro: revenueStats.activeSubscriptions,
                    mrr: revenueStats.monthlyRecurring,
                    todaySignups: todayCount,
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Today's Signups</CardTitle>
                        <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.todaySignups}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            New users today
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Daily Signups</CardTitle>
                        <CardDescription>User registrations over the last 14 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        className="text-muted-foreground"
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        className="text-muted-foreground"
                                    />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-popover border rounded-lg shadow-lg p-3">
                                                        <p className="text-sm font-medium">{payload[0].payload.label}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {payload[0].value} signup{payload[0].value !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="hsl(var(--primary))"
                                        radius={[4, 4, 0, 0]}
                                        className="fill-primary"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
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
