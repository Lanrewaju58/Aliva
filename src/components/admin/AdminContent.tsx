import { useState, useEffect } from 'react';
import {
    meditationVideoService,
    MeditationVideo,
    MeditationVideoInput,
    extractYouTubeId
} from '@/services/meditationVideoService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import {
    Plus,
    Trash2,
    Edit,
    Video,
    ExternalLink,
    Loader2,
    Youtube,
    Crown
} from 'lucide-react';

const CATEGORIES = ['Sleep', 'Relaxation', 'Focus', 'Healing', 'Guided'] as const;

export const AdminContent = () => {
    const { toast } = useToast();
    const [videos, setVideos] = useState<MeditationVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<MeditationVideo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<{
        url: string;
        title: string;
        channel: string;
        duration: string;
        category: typeof CATEGORIES[number];
        views: string;
        isPro: boolean;
    }>({
        url: '',
        title: '',
        channel: '',
        duration: '',
        category: 'Relaxation',
        views: '',
        isPro: false
    });

    // Load videos
    useEffect(() => {
        loadVideos();
    }, []);

    const loadVideos = async () => {
        setIsLoading(true);
        const data = await meditationVideoService.getVideos();
        setVideos(data);
        setIsLoading(false);
    };

    const resetForm = () => {
        setFormData({
            url: '',
            title: '',
            channel: '',
            duration: '',
            category: 'Relaxation',
            views: '',
            isPro: false
        });
    };

    const handleAddVideo = async () => {
        const videoId = extractYouTubeId(formData.url);
        if (!videoId) {
            toast({
                title: 'Invalid URL',
                description: 'Please enter a valid YouTube URL or video ID.',
                variant: 'destructive'
            });
            return;
        }

        if (!formData.title.trim() || !formData.channel.trim() || !formData.duration.trim()) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill in all required fields.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        const newVideo: MeditationVideoInput = {
            videoId,
            title: formData.title.trim(),
            channel: formData.channel.trim(),
            duration: formData.duration.trim(),
            category: formData.category,
            views: formData.views.trim() || undefined,
            isPro: formData.isPro
        };

        const result = await meditationVideoService.addVideo(newVideo);

        if (result) {
            toast({
                title: 'Video Added',
                description: `"${formData.title}" has been added successfully.`
            });
            setIsAddDialogOpen(false);
            resetForm();
            loadVideos();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to add video. Please try again.',
                variant: 'destructive'
            });
        }

        setIsSubmitting(false);
    };

    const handleDeleteVideo = async () => {
        if (!videoToDelete) return;

        setIsSubmitting(true);
        const result = await meditationVideoService.deleteVideo(videoToDelete.id);

        if (result) {
            toast({
                title: 'Video Deleted',
                description: `"${videoToDelete.title}" has been removed.`
            });
            setIsDeleteDialogOpen(false);
            setVideoToDelete(null);
            loadVideos();
        } else {
            toast({
                title: 'Error',
                description: 'Failed to delete video. Please try again.',
                variant: 'destructive'
            });
        }

        setIsSubmitting(false);
    };

    const openDeleteDialog = (video: MeditationVideo) => {
        setVideoToDelete(video);
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Meditation Videos</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage YouTube videos shown in the Mindfulness tab.
                    </p>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                </Button>
            </div>

            {/* Video List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : videos.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                    <Video className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h4 className="font-medium mb-1">No Videos Yet</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                        Add your first meditation video to get started.
                    </p>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Video
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img
                                    src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Youtube className="h-6 w-6 text-white" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium truncate">{video.title}</h4>
                                    {video.isPro && (
                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-0 flex-shrink-0">
                                            <Crown className="h-3 w-3 mr-1" /> PRO
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{video.channel}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">{video.category}</Badge>
                                    <span className="text-xs text-muted-foreground">{video.duration}</span>
                                    {video.views && (
                                        <span className="text-xs text-muted-foreground">• {video.views} views</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    asChild
                                >
                                    <a href={`https://youtube.com/watch?v=${video.videoId}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => openDeleteDialog(video)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Video Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Meditation Video</DialogTitle>
                        <DialogDescription>
                            Enter the YouTube URL and video details.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">YouTube URL or Video ID *</Label>
                            <Input
                                id="url"
                                placeholder="https://youtube.com/watch?v=... or video ID"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Deep Sleep Meditation"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="channel">Channel *</Label>
                                <Input
                                    id="channel"
                                    placeholder="Meditation Channel"
                                    value={formData.channel}
                                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration *</Label>
                                <Input
                                    id="duration"
                                    placeholder="15 min"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val as typeof CATEGORIES[number] })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="views">Views (optional)</Label>
                                <Input
                                    id="views"
                                    placeholder="5M+"
                                    value={formData.views}
                                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <Label htmlFor="isPro" className="font-medium">PRO Only</Label>
                                <p className="text-xs text-muted-foreground">Restrict to Pro subscribers</p>
                            </div>
                            <Switch
                                id="isPro"
                                checked={formData.isPro}
                                onCheckedChange={(checked) => setFormData({ ...formData, isPro: checked })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddVideo} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Add Video
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Video</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{videoToDelete?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteVideo} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
