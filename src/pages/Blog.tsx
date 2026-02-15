import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Newspaper,
    RefreshCw,
    ExternalLink,
    Clock,
    Apple,
    Dumbbell,
    Brain,
    Heart,
    Stethoscope,
    Crown,
    Lock,
    Sparkles,
    TrendingUp,
    BookOpen
} from 'lucide-react';
import { blogService, BlogArticle } from '@/services/blogService';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';
import { cn } from '@/lib/utils';

type CategoryType = BlogArticle['category'] | 'all';

const CATEGORY_CONFIG: Record<BlogArticle['category'], { label: string; icon: React.ElementType; gradient: string; bgColor: string }> = {
    nutrition: {
        label: 'Nutrition',
        icon: Apple,
        gradient: 'from-emerald-500 to-teal-600',
        bgColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
    },
    fitness: {
        label: 'Fitness',
        icon: Dumbbell,
        gradient: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
    },
    'mental-health': {
        label: 'Mental Health',
        icon: Brain,
        gradient: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20'
    },
    wellness: {
        label: 'Wellness',
        icon: Heart,
        gradient: 'from-rose-500 to-pink-600',
        bgColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
    },
    medical: {
        label: 'Medical',
        icon: Stethoscope,
        gradient: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
    },
};

export default function Blog() {
    const { user } = useAuth();
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
    const [isPro, setIsPro] = useState(false);
    const [checkingPro, setCheckingPro] = useState(true);

    // Check Pro status
    useEffect(() => {
        const checkProStatus = async () => {
            if (!user) {
                setCheckingPro(false);
                return;
            }

            try {
                const profile = await profileService.getProfile(user.uid);
                if (profile) {
                    const now = new Date();
                    const isActivePro = profile.plan === 'PRO' &&
                        (!profile.planExpiresAt || new Date(profile.planExpiresAt) > now);
                    setIsPro(isActivePro);
                }
            } catch (error) {
                console.error('Error checking pro status:', error);
            } finally {
                setCheckingPro(false);
            }
        };

        checkProStatus();
    }, [user]);

    const loadArticles = async (forceRefresh = false) => {
        if (!isPro) return;

        try {
            if (forceRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const { articles: fetchedArticles, lastUpdated: updated } = await blogService.getArticles(forceRefresh);
            setArticles(fetchedArticles);
            setLastUpdated(updated);
        } catch (err) {
            console.error('Failed to load articles:', err);
            setError('Failed to load articles. Please try again later.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isPro && !checkingPro) {
            loadArticles();
        } else if (!checkingPro) {
            setLoading(false);
        }
    }, [isPro, checkingPro]);

    const filteredArticles = selectedCategory === 'all'
        ? articles
        : articles.filter(a => a.category === selectedCategory);

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        return `${diffInDays} days ago`;
    };

    // Loading state while checking pro
    if (checkingPro) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20" />
                    <div className="h-4 w-32 bg-muted rounded" />
                </div>
            </div>
        );
    }

    // Pro paywall
    if (!isPro) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="max-w-lg w-full">
                    {/* Premium Card */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 shadow-2xl">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/10 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/20 to-transparent blur-2xl" />

                        <div className="relative z-10">
                            {/* Lock Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                        <Crown className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center">
                                        <Lock className="w-4 h-4 text-amber-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl md:text-3xl font-bold text-center text-white mb-3">
                                Aliva Insights Hub
                            </h1>
                            <p className="text-slate-400 text-center mb-8 text-sm md:text-base">
                                Unlock expert-curated health articles from trusted medical sources
                            </p>

                            {/* Features */}
                            <div className="space-y-4 mb-8">
                                {[
                                    { icon: BookOpen, text: 'Expert articles from Harvard, Mayo Clinic & more' },
                                    { icon: TrendingUp, text: 'Fresh content updated twice weekly' },
                                    { icon: Sparkles, text: 'Curated topics: Nutrition, Fitness, Wellness' },
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-300">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <feature.icon className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <span className="text-sm">{feature.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <Link to="/upgrade">
                                <Button className="w-full h-12 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-600 hover:via-yellow-600 hover:to-orange-600 text-white font-semibold text-base shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-[1.02]">
                                    <Crown className="w-5 h-5 mr-2" />
                                    Upgrade to Pro
                                </Button>
                            </Link>

                            <p className="text-center text-slate-500 text-xs mt-4">
                                Join thousands of health-conscious members
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="container max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Premium Header */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 mb-8 shadow-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-500/10 to-transparent blur-2xl" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
                                    <Newspaper className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white">
                                    Aliva Insights
                                </h1>
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                    <Crown className="w-3 h-3 mr-1" />
                                    PRO
                                </Badge>
                            </div>
                            <p className="text-slate-400 text-sm md:text-base">
                                Expert-curated articles from leading health institutions
                            </p>
                            {lastUpdated && (
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    Updated {formatTimeAgo(lastUpdated)}
                                </p>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadArticles(true)}
                            disabled={refreshing}
                            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white gap-2 self-start md:self-auto"
                        >
                            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
                            {refreshing ? 'Updating...' : 'Refresh'}
                        </Button>
                    </div>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Button
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory('all')}
                        className={cn(
                            "rounded-full transition-all",
                            selectedCategory === 'all' && "shadow-md"
                        )}
                    >
                        All Topics
                    </Button>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                        const Icon = config.icon;
                        const isActive = selectedCategory === key;
                        return (
                            <Button
                                key={key}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(key as CategoryType)}
                                className={cn(
                                    "rounded-full gap-1.5 transition-all",
                                    isActive && `bg-gradient-to-r ${config.gradient} border-0 shadow-md`
                                )}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {config.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="overflow-hidden border-0 shadow-lg bg-card/50 backdrop-blur">
                                <CardContent className="p-6">
                                    <Skeleton className="h-5 w-20 mb-4 rounded-full" />
                                    <Skeleton className="h-6 w-full mb-2" />
                                    <Skeleton className="h-6 w-3/4 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-5/6 mb-6" />
                                    <Skeleton className="h-4 w-24" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Card className="border-destructive/50 bg-destructive/5 shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Newspaper className="w-16 h-16 text-destructive/30 mb-4" />
                            <p className="text-destructive font-medium mb-4">{error}</p>
                            <Button variant="outline" onClick={() => loadArticles()}>
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!loading && !error && filteredArticles.length === 0 && (
                    <Card className="border-dashed border-2 shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Newspaper className="w-16 h-16 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground font-medium mb-2">No articles found</p>
                            <p className="text-sm text-muted-foreground mb-4 text-center">
                                {selectedCategory === 'all'
                                    ? 'Articles are being loaded.'
                                    : `No articles in ${CATEGORY_CONFIG[selectedCategory as BlogArticle['category']]?.label} yet.`}
                            </p>
                            {selectedCategory !== 'all' && (
                                <Button variant="outline" size="sm" onClick={() => setSelectedCategory('all')}>
                                    View All Articles
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Articles Grid */}
                {!loading && !error && filteredArticles.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredArticles.map((article, index) => {
                            const categoryConfig = CATEGORY_CONFIG[article.category];
                            const CategoryIcon = categoryConfig?.icon || Newspaper;

                            return (
                                <Card
                                    key={article.id}
                                    className={cn(
                                        "group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/80 backdrop-blur",
                                        "hover:-translate-y-1"
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Gradient accent top */}
                                    <div className={cn(
                                        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                                        categoryConfig?.gradient || "from-primary to-primary/60"
                                    )} />

                                    <CardContent className="p-6">
                                        {/* Category & Date */}
                                        <div className="flex items-center justify-between mb-4">
                                            <Badge
                                                variant="outline"
                                                className={cn("gap-1.5 text-xs font-medium rounded-full px-3 py-1", categoryConfig?.bgColor)}
                                            >
                                                <CategoryIcon className="w-3 h-3" />
                                                {categoryConfig?.label || article.category}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {formatDate(new Date(article.publishedAt))}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-semibold text-lg leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                            {article.title}
                                        </h3>

                                        {/* Summary */}
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                                            {article.summary}
                                        </p>

                                        {/* Source & Link */}
                                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                            <span className="text-xs text-muted-foreground font-medium truncate max-w-[60%]">
                                                {article.source}
                                            </span>
                                            <a
                                                href={article.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                                            >
                                                Read Article
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Footer Note */}
                {!loading && !error && filteredArticles.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-sm text-muted-foreground">
                            Articles curated from trusted health sources • Updated twice weekly
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
