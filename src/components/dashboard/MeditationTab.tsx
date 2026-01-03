import { useState, useEffect } from 'react';
import {
    Play,
    Pause,
    Wind,
    Moon,
    Sparkles,
    Heart,
    Headphones,
    Crown,
    X,
    Clock,
    Star,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { meditationVideoService, MeditationVideo } from '@/services/meditationVideoService';

// Types
type Category = 'All' | 'Sleep' | 'Relaxation' | 'Focus' | 'Healing';

interface Video {
    id: string;
    title: string;
    channel: string;
    duration: string;
    videoId: string;
    category: Category;
    views: string;
    isPro: boolean;
}

// Default videos - empty since admin manages videos via Firestore
const VIDEOS: Video[] = [];

const CATEGORIES: Category[] = ['All', 'Sleep', 'Relaxation', 'Focus', 'Healing'];

// ==================== BOX BREATHING COMPONENT ====================
const BoxBreathing = () => {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
    const [progress, setProgress] = useState(0);
    const [cycles, setCycles] = useState(0);

    const PHASE_DURATION = 4000;
    const TICK_INTERVAL = 50;

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (isActive) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    const increment = (TICK_INTERVAL / PHASE_DURATION) * 100;
                    if (prev + increment >= 100) {
                        setPhase((currentPhase) => {
                            switch (currentPhase) {
                                case 'inhale': return 'hold1';
                                case 'hold1': return 'exhale';
                                case 'exhale': return 'hold2';
                                case 'hold2':
                                    setCycles(c => c + 1);
                                    return 'inhale';
                            }
                        });
                        return 0;
                    }
                    return prev + increment;
                });
            }, TICK_INTERVAL);
        }

        return () => clearInterval(interval);
    }, [isActive]);

    const toggleBreathing = () => {
        if (!isActive) {
            setPhase('inhale');
            setProgress(0);
        }
        setIsActive(!isActive);
    };

    const stopSession = () => {
        setIsActive(false);
        setPhase('inhale');
        setProgress(0);
        setCycles(0);
    };

    const getPhaseLabel = () => {
        switch (phase) {
            case 'inhale': return 'Breathe In';
            case 'hold1': return 'Hold';
            case 'exhale': return 'Breathe Out';
            case 'hold2': return 'Hold';
        }
    };

    // Calculate total progress (0-400) based on phase and progress
    const getTotalProgress = () => {
        switch (phase) {
            case 'inhale': return progress;
            case 'hold1': return 100 + progress;
            case 'exhale': return 200 + progress;
            case 'hold2': return 300 + progress;
        }
    };

    // Calculate dot position around the box perimeter
    const getDotPosition = () => {
        const total = getTotalProgress();
        const boxSize = 160;
        const half = boxSize / 2;

        // Normalize to 0-1 for each edge
        if (total < 100) {
            // Left edge: bottom to top
            const t = total / 100;
            return { x: -half, y: half - (t * boxSize) };
        } else if (total < 200) {
            // Top edge: left to right
            const t = (total - 100) / 100;
            return { x: -half + (t * boxSize), y: -half };
        } else if (total < 300) {
            // Right edge: top to bottom
            const t = (total - 200) / 100;
            return { x: half, y: -half + (t * boxSize) };
        } else {
            // Bottom edge: right to left
            const t = (total - 300) / 100;
            return { x: half - (t * boxSize), y: half };
        }
    };

    const dotPos = getDotPosition();
    const totalProgress = getTotalProgress();

    return (
        <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-8"
            style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #1e1b4b 50%, #0f172a 100%)'
            }}
        >
            {/* Ambient glow effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-80 h-80 rounded-full blur-3xl opacity-30"
                    style={{
                        background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
                        top: '10%',
                        left: '20%',
                        animation: 'pulse 4s ease-in-out infinite'
                    }}
                />
                <div
                    className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
                    style={{
                        background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
                        bottom: '10%',
                        right: '20%',
                        animation: 'pulse 4s ease-in-out infinite 2s'
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

                {/* Left: Info */}
                <div className="flex-1 text-center lg:text-left space-y-4">
                    <Badge className="bg-white/10 text-white/90 border-white/20 hover:bg-white/20 backdrop-blur-sm">
                        <Wind className="w-3 h-3 mr-1" /> Box Breathing
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                        Find Your Center
                    </h2>
                    <p className="text-white/70 max-w-md text-base sm:text-lg">
                        Follow the dot around the square. Each edge represents 4 seconds.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start pt-4">
                        <Button
                            size="lg"
                            onClick={toggleBreathing}
                            className={`rounded-full h-12 sm:h-14 px-6 sm:px-8 font-semibold transition-all duration-300 ${isActive
                                ? 'bg-white/20 hover:bg-white/30 backdrop-blur-md'
                                : 'bg-white hover:bg-white/90 shadow-lg shadow-white/20'
                                }`}
                            style={{ color: isActive ? '#ffffff' : '#1e293b' }}
                        >
                            {isActive ? <Pause className="h-5 w-5 mr-2" style={{ color: 'inherit' }} /> : <Play className="h-5 w-5 mr-2" style={{ color: 'inherit' }} />}
                            {isActive ? 'Pause' : 'Start Session'}
                        </Button>

                        {cycles > 0 && (
                            <>
                                <div className="flex items-center gap-2 text-white/60 bg-white/10 px-3 py-1.5 rounded-full">
                                    <Star className="h-4 w-4 text-amber-400" />
                                    <span className="text-sm">{cycles} {cycles === 1 ? 'cycle' : 'cycles'}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={stopSession}
                                    className="rounded-full text-white/60 hover:text-white hover:bg-white/10"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Stop
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: Box Visualizer */}
                <div className="relative flex-shrink-0 w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72">

                    {/* SVG Box */}
                    <svg
                        viewBox="-100 -100 200 200"
                        className="w-full h-full"
                        style={{ overflow: 'visible' }}
                    >
                        {/* Gradient definitions */}
                        <defs>
                            <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="50%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Background box */}
                        <rect
                            x="-80"
                            y="-80"
                            width="160"
                            height="160"
                            rx="12"
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                        />

                        {/* Progress path that traces the box */}
                        {isActive && (
                            <path
                                d={`M -80 80 L -80 -80 L 80 -80 L 80 80 L -80 80`}
                                fill="none"
                                stroke="url(#boxGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray="640"
                                strokeDashoffset={640 - (totalProgress / 400) * 640}
                                filter="url(#glow)"
                            />
                        )}

                        {/* Moving dot */}
                        {isActive && (
                            <g filter="url(#glow)">
                                {/* Outer glow */}
                                <circle
                                    cx={dotPos.x}
                                    cy={dotPos.y}
                                    r="12"
                                    fill="rgba(168,85,247,0.5)"
                                />
                                {/* Inner dot */}
                                <circle
                                    cx={dotPos.x}
                                    cy={dotPos.y}
                                    r="6"
                                    fill="white"
                                />
                            </g>
                        )}

                        {/* Corner labels */}
                        <text x="-80" y="100" textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="500">Inhale</text>
                        <text x="80" y="-90" textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="500">Hold</text>
                        <text x="80" y="100" textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="500">Exhale</text>
                        <text x="-80" y="-90" textAnchor="start" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="500">Hold</text>
                    </svg>

                    {/* Center text overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <p className={`text-xl sm:text-2xl lg:text-3xl font-semibold transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-50'
                                }`}>
                                {isActive ? getPhaseLabel() : 'Ready'}
                            </p>
                            <p className="text-white/40 text-xs sm:text-sm mt-1">4 seconds</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==================== MAIN COMPONENT ====================
export default function MeditationTab({ isPro = false }: { isPro?: boolean }) {
    const [activeCategory, setActiveCategory] = useState<Category>('All');
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [failedThumbnails, setFailedThumbnails] = useState<Set<string>>(new Set());
    const [videos, setVideos] = useState<Video[]>(VIDEOS);
    const [isLoadingVideos, setIsLoadingVideos] = useState(true);

    // Fetch videos from Firestore
    useEffect(() => {
        const loadVideos = async () => {
            setIsLoadingVideos(true);
            try {
                const firestoreVideos = await meditationVideoService.getVideos();
                if (firestoreVideos.length > 0) {
                    // Map Firestore videos to our Video interface
                    const mappedVideos: Video[] = firestoreVideos.map(v => ({
                        id: v.id,
                        title: v.title,
                        channel: v.channel,
                        duration: v.duration,
                        videoId: v.videoId,
                        category: v.category as Category,
                        views: v.views || '',
                        isPro: v.isPro
                    }));
                    setVideos(mappedVideos);
                } else {
                    // Fall back to default videos if none in Firestore
                    setVideos(VIDEOS);
                }
            } catch (error) {
                console.error('Error loading videos:', error);
                setVideos(VIDEOS);
            } finally {
                setIsLoadingVideos(false);
            }
        };
        loadVideos();
    }, []);

    const filteredVideos = activeCategory === 'All'
        ? videos
        : videos.filter(v => v.category === activeCategory);

    const getThumbnailUrl = (videoId: string) => {
        // Use hqdefault which is more reliable than maxresdefault
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };

    const handleThumbnailError = (videoId: string) => {
        setFailedThumbnails(prev => new Set(prev).add(videoId));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div className="mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Mindfulness Studio</h2>
                <p className="text-muted-foreground mt-1">Curated tools for your mental well-being.</p>
            </div>

            {/* Box Breathing */}
            <BoxBreathing />

            {/* Video Library */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-semibold">Guided Sessions</h3>
                    <Badge variant="outline" className="text-muted-foreground font-normal">
                        {filteredVideos.length} videos
                    </Badge>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar -mx-1 px-1">
                    {CATEGORIES.map((cat) => (
                        <Button
                            key={cat}
                            variant={activeCategory === cat ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveCategory(cat)}
                            className={`rounded-full px-4 sm:px-6 flex-shrink-0 transition-all duration-300 ${activeCategory === cat
                                ? 'bg-primary shadow-md'
                                : 'hover:bg-primary/5'
                                }`}
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredVideos.map((video) => (
                        <div
                            key={video.id}
                            className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer ${video.isPro && !isPro ? 'opacity-80' : ''
                                }`}
                            onClick={() => {
                                if (video.isPro && !isPro) return;
                                setSelectedVideo(video);
                            }}
                        >
                            {/* Thumbnail */}
                            <div className="aspect-video w-full overflow-hidden relative bg-muted">
                                {!failedThumbnails.has(video.videoId) ? (
                                    <img
                                        src={getThumbnailUrl(video.videoId)}
                                        alt={video.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={() => handleThumbnailError(video.videoId)}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                                        <Headphones className="h-12 w-12 text-primary/40" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                {/* Duration Badge */}
                                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                    <Badge className="bg-black/70 text-white border-0 backdrop-blur-sm text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {video.duration}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-primary/90 text-primary-foreground border-0 text-xs">
                                        {video.views}
                                    </Badge>
                                </div>

                                {/* Pro Badge */}
                                {video.isPro && !isPro && (
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg text-xs">
                                            <Crown className="h-3 w-3 mr-1" /> PRO
                                        </Badge>
                                    </div>
                                )}

                                {/* Play Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="rounded-full bg-white/25 p-3 sm:p-4 backdrop-blur-md shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                                        <Play className="h-6 w-6 sm:h-8 sm:w-8 text-white fill-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-3 sm:p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-semibold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">{video.title}</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{video.channel}</p>
                                    </div>
                                    {getCategoryIcon(video.category)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Video Modal */}
            <Dialog open={!!selectedVideo} onOpenChange={(open) => !open && setSelectedVideo(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-none">
                    {selectedVideo && (
                        <>
                            <div className="relative aspect-video w-full">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&rel=0`}
                                    title={selectedVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="absolute inset-0"
                                />
                            </div>
                            <div className="p-3 sm:p-4 bg-card flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-semibold truncate">{selectedVideo.title}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedVideo.channel}</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setSelectedVideo(null)}>
                                    <X className="h-4 w-4 mr-1 sm:mr-2" />
                                    <span className="hidden sm:inline">Close</span>
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function getCategoryIcon(category: Category) {
    const iconClass = "h-4 w-4 flex-shrink-0";
    switch (category) {
        case 'Sleep': return <Moon className={`${iconClass} text-indigo-500`} />;
        case 'Relaxation': return <Wind className={`${iconClass} text-teal-500`} />;
        case 'Healing': return <Heart className={`${iconClass} text-rose-500`} />;
        case 'Focus': return <Sparkles className={`${iconClass} text-amber-500`} />;
        default: return <Headphones className={`${iconClass} text-primary`} />;
    }
}
