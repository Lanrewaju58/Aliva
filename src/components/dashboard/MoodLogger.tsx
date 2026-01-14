import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { wellnessService } from "@/services/wellnessService";
import { MoodLog } from "@/types/wellness";
import { useToast } from "@/hooks/use-toast";
import { Smile, Frown, Meh, Heart, CloudLightning } from "lucide-react";
import { format, parseISO } from "date-fns";

const MOODS = [
    { value: 5, label: "Great", icon: Heart, color: "text-rose-500 bg-rose-50 border-rose-200" },
    { value: 4, label: "Good", icon: Smile, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
    { value: 3, label: "Okay", icon: Meh, color: "text-amber-500 bg-amber-50 border-amber-200" },
    { value: 2, label: "Bad", icon: Frown, color: "text-orange-500 bg-orange-50 border-orange-200" },
    { value: 1, label: "Awful", icon: CloudLightning, color: "text-slate-600 bg-slate-100 border-slate-200" },
];

const QUICK_TAGS = ["Stressed", "Anxious", "Calm", "Energetic", "Tired", "Motivated", "Sick", "Happy", "Sad"];

const MoodLogger = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [recentLogs, setRecentLogs] = useState<MoodLog[]>([]);

    const loadData = async () => {
        if (!user?.uid) return;
        try {
            const data = await wellnessService.getMoodLogs(user.uid, 5); // Last 5 logs
            setRecentLogs(data);
        } catch (error) {
            console.error('Error loading mood logs:', error);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.uid]);

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSave = async () => {
        if (!user?.uid || !selectedMood) return;

        setSaving(true);
        try {
            await wellnessService.addMoodLog(user.uid, {
                userId: user.uid,
                date: new Date().toISOString().split('T')[0],
                mood: selectedMood as 1 | 2 | 3 | 4 | 5,
                tags: selectedTags,
                notes
            });

            toast({ title: "Mood logged", description: "Thanks for checking in!" });
            setSelectedMood(null);
            setSelectedTags([]);
            setNotes("");
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to save mood", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Input Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smile className="w-5 h-5 text-muted-foreground" />
                        How are you feeling?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Mood Selector */}
                    <div className="flex justify-between gap-2">
                        {MOODS.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setSelectedMood(m.value)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${selectedMood === m.value
                                    ? `${m.color} scale-110 shadow-sm`
                                    : "border-transparent hover:bg-muted"
                                    }`}
                            >
                                <m.icon className={`w-8 h-8 ${selectedMood === m.value ? "" : "text-muted-foreground"}`} />
                                <span className="text-xs font-medium">{m.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <span className="text-sm font-medium text-muted-foreground">What's affecting you?</span>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_TAGS.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <Textarea
                        placeholder="Add a note (optional)..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                    />

                    <Button onClick={handleSave} disabled={!selectedMood || saving} className="w-full">
                        {saving ? "Saving..." : "Log Mood"}
                    </Button>
                </CardContent>
            </Card>

            {/* History Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentLogs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Smile className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>No mood logs yet.</p>
                            </div>
                        ) : (
                            recentLogs.map(log => {
                                const moodConfig = MOODS.find(m => m.value === log.mood);
                                return (
                                    <div key={log.id} className="flex gap-4 p-3 rounded-lg border border-border bg-card/50">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${moodConfig?.color.replace('text-', 'bg-').split(' ')[0]} bg-opacity-20`}>
                                            {moodConfig && <moodConfig.icon className={`w-5 h-5 ${moodConfig.color.split(' ')[0]}`} />}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{moodConfig?.label}</span>
                                                <span className="text-xs text-muted-foreground">• {format(parseISO(log.date), 'MMM d')}</span>
                                            </div>
                                            {log.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {log.tags.map(t => (
                                                        <span key={t} className="text-xs px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {log.notes && <p className="text-sm text-muted-foreground line-clamp-2">{log.notes}</p>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MoodLogger;
