import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { medicationService } from "@/services/medicationService";
import { Medication, MedicationLog, MedicationType } from "@/types/medication";
import { useToast } from "@/hooks/use-toast";
import { Pill, Plus, Check, Trash2, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const MED_TYPES: MedicationType[] = ['Pill', 'Capsule', 'Liquid', 'Injection', 'Other'];

const MedicationTracker = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [meds, setMeds] = useState<Medication[]>([]);
    const [logs, setLogs] = useState<MedicationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [frequency, setFrequency] = useState('Once daily');
    const [time, setTime] = useState('08:00');
    const [type, setType] = useState<MedicationType>('Pill');

    const today = format(new Date(), 'yyyy-MM-dd');

    const loadData = async () => {
        if (!user?.uid) return;
        try {
            const [fetchedMeds, fetchedLogs] = await Promise.all([
                medicationService.getMedications(user.uid),
                medicationService.getLogsByDate(user.uid, today)
            ]);
            setMeds(fetchedMeds);
            setLogs(fetchedLogs);
        } catch (error) {
            console.error('Error loading medications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.uid]);

    const handleAddMed = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid || !name) return;

        try {
            await medicationService.addMedication(user.uid, {
                userId: user.uid,
                name,
                dosage,
                frequency,
                time,
                type,
                active: true
            });
            toast({ title: "Success", description: "Medication added!" });
            setName('');
            setDosage('');
            setIsAdding(false);
            loadData();
        } catch (error) {
            toast({ title: "Error", description: "Failed to add medication", variant: "destructive" });
        }
    };

    const handleToggleLog = async (medId: string) => {
        if (!user?.uid) return;

        const existingLog = logs.find(l => l.medicationId === medId);
        try {
            if (existingLog) {
                await medicationService.deleteLog(user.uid, existingLog.id);
                setLogs(logs.filter(l => l.id !== existingLog.id));
            } else {
                await medicationService.addLog(user.uid, {
                    userId: user.uid,
                    medicationId: medId,
                    date: today,
                    status: 'taken',
                    takenAt: new Date()
                });
                loadData();
            }
        } catch (error) {
            toast({ title: "Error", description: "Action failed", variant: "destructive" });
        }
    };

    const handleDeleteMed = async (medId: string) => {
        if (!user?.uid) return;
        if (!confirm('Are you sure you want to remove this medication?')) return;

        try {
            await medicationService.deleteMedication(user.uid, medId);
            setMeds(meds.filter(m => m.id !== medId));
            toast({ title: "Removed", description: "Medication deleted." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">Daily Checklist</h3>
                    <p className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "ghost" : "default"} size="sm">
                    {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Med</>}
                </Button>
            </div>

            {isAdding && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-base">New Medication/Supplement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddMed} className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input placeholder="e.g. Multivitamin" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Dosage</Label>
                                <Input placeholder="e.g. 500mg or 1 capsule" value={dosage} onChange={e => setDosage(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={type} onValueChange={(v: any) => setType(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MED_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                            </div>
                            <Button type="submit" className="sm:col-span-2">Save Medication</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {meds.length === 0 && !loading && (
                    <div className="text-center py-12 border-2 border-dashed rounded-xl opacity-50">
                        <Pill className="w-12 h-12 mx-auto mb-2" />
                        <p>No medications added yet.</p>
                    </div>
                )}

                {meds.map(med => {
                    const isTaken = logs.some(l => l.medicationId === med.id);
                    return (
                        <Card key={med.id} className={`transition-all ${isTaken ? 'opacity-60 bg-muted/50' : 'hover:border-primary/50'}`}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleToggleLog(med.id)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isTaken
                                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                                : 'border-muted-foreground/30 hover:border-primary text-transparent'
                                            }`}
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>
                                    <div>
                                        <h4 className={`font-semibold ${isTaken ? 'line-through' : ''}`}>{med.name}</h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                            <span className="flex items-center gap-1"><Pill className="w-3 h-3" /> {med.dosage}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {med.time}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteMed(med.id)}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default MedicationTracker;
