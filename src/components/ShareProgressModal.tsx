// src/components/ShareProgressModal.tsx

import { useState, useEffect } from 'react';
import { X, Share2, Check, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { shareService, ShareableProgress, SharePlatform } from '@/services/shareService';
import { cn } from '@/lib/utils';

interface ShareProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    progress: ShareableProgress;
}

const socialPlatforms: { id: SharePlatform; name: string; icon: React.ReactNode; bgColor: string }[] = [
    {
        id: 'twitter',
        name: 'X (Twitter)',
        icon: <span className="font-bold text-lg">𝕏</span>,
        bgColor: 'bg-black hover:bg-gray-800 text-white'
    },
    {
        id: 'facebook',
        name: 'Facebook',
        icon: <span className="font-bold text-lg">f</span>,
        bgColor: 'bg-[#1877F2] hover:bg-[#166FE5] text-white'
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        icon: <span className="text-lg">💬</span>,
        bgColor: 'bg-[#25D366] hover:bg-[#20BD5A] text-white'
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: <span className="font-bold text-sm">in</span>,
        bgColor: 'bg-[#0A66C2] hover:bg-[#0958A8] text-white'
    },
    {
        id: 'copy',
        name: 'Copy Link',
        icon: <Copy className="w-4 h-4" />,
        bgColor: 'bg-muted hover:bg-muted/80 text-foreground'
    },
];

const ShareProgressModal = ({ isOpen, onClose, progress }: ShareProgressModalProps) => {
    const [shareText, setShareText] = useState('');
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState<SharePlatform | null>(null);

    // Dynamic platforms list including native share if available
    const platforms = [
        ...(shareService.canUseNativeShare() ? [{
            id: 'native' as SharePlatform,
            name: 'Share via...',
            icon: <Share2 className="w-5 h-5" />,
            bgColor: 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }] : []),
        ...socialPlatforms
    ];

    useEffect(() => {
        if (isOpen) {
            setShareText(shareService.generateProgressSummary(progress));
            setCopied(false);
        }
    }, [isOpen, progress]);

    const handleShare = async (platform: SharePlatform) => {
        setSharing(platform);

        const text = platform === 'copy'
            ? shareText
            : shareService.generateShareText(progress, 'progress');

        const success = await shareService.share(platform, text);

        if (success && platform === 'copy') {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }

        setSharing(null);

        if (success && platform !== 'copy') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-border/50">
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                                <Share2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-foreground">Share Your Progress</h2>
                                <p className="text-sm text-muted-foreground">Inspire others on their health journey</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress Preview */}
                <div className="p-6 pt-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Preview</h3>
                        <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                                {shareText}
                            </pre>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-3 text-center border border-orange-500/20">
                            <p className="text-xl font-bold text-orange-500">{progress.dailyStreak}</p>
                            <p className="text-xs text-muted-foreground">Day Streak</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-3 text-center border border-green-500/20">
                            <p className="text-xl font-bold text-green-500">{progress.mealsToday.length}</p>
                            <p className="text-xs text-muted-foreground">Meals</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-3 text-center border border-blue-500/20">
                            <p className="text-xl font-bold text-blue-500">{progress.exercisesToday.length}</p>
                            <p className="text-xs text-muted-foreground">Workouts</p>
                        </div>
                    </div>

                    {/* Platform Buttons */}
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Share to</h3>
                    <div className="grid grid-cols-5 gap-2">
                        {platforms.map((platform) => (
                            <button
                                key={platform.id}
                                onClick={() => handleShare(platform.id)}
                                disabled={sharing !== null}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-200",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    platform.bgColor,
                                    "hover:scale-105 active:scale-95"
                                )}
                            >
                                {sharing === platform.id ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : copied && platform.id === 'copy' ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <span className="w-5 h-5 flex items-center justify-center">{platform.icon}</span>
                                )}
                                <span className="text-[10px] font-medium opacity-80 truncate w-full text-center">
                                    {copied && platform.id === 'copy' ? 'Copied!' : platform.name.split(' ')[0]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 pt-0">
                    <p className="text-xs text-center text-muted-foreground">
                        ⭐ Pro members get exclusive sharing features
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareProgressModal;
