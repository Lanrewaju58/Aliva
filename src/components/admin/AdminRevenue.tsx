import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminService } from "@/services/adminService";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { DollarSign, TrendingUp, CreditCard } from "lucide-react";

export const AdminRevenue = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        distribution: { name: string; value: number }[];
        stats: { totalRevenue: number; monthlyRecurring: number; activeSubscriptions: number };
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [revenueStats, userStats] = await Promise.all([
                    adminService.getRevenueStats(),
                    adminService.getUserStats()
                ]);

                setData({
                    stats: revenueStats,
                    distribution: [
                        { name: "Free Plan", value: userStats.free },
                        { name: "Pro Plan", value: userStats.pro }
                    ]
                });
            } catch (error) {
                console.error("Error fetching revenue data:", error);
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

    const COLORS = ['#94a3b8', '#eab308']; // Slate-400 for Free, Yellow-500 for Pro

    if (loading) {
        return <Skeleton className="h-[400px] w-full rounded-xl" />;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring (MRR)</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data?.stats.monthlyRecurring || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Est. based on active subs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Annual Run Rate (ARR)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data?.stats.totalRevenue || 0)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Projected yearly revenue</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.stats.activeSubscriptions}</div>
                        <p className="text-xs text-muted-foreground mt-1">Paying customers</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Plan Distribution</CardTitle>
                        <CardDescription>Breakdown of user base by plan type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => [value, 'Users']}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Revenue Forecast</CardTitle>
                        <CardDescription>Projected growth based on current MRR</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center border rounded-lg bg-muted/20">
                            <div className="text-center text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                <p>Detailed historical data not yet available</p>
                                <p className="text-xs mt-1">Collecting transaction history...</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
