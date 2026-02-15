import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useHealthData } from "@/contexts/HealthDataContext";
import { wellnessService } from "@/services/wellnessService";
import { medicationService } from "@/services/medicationService";
import { mealService } from "@/services/mealService";
import { SleepLog, MoodLog } from "@/types/wellness";
import { Medication, MedicationLog } from "@/types/medication";
import { FileDown, Printer, Clock, Heart, Pill, Utensils, Droplet, FileText } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

const HealthReportGenerator = () => {
    const { user } = useAuth();
    const { profile } = useHealthData();
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<{
        sleep: SleepLog[];
        mood: MoodLog[];
        meds: Medication[];
        medLogs: MedicationLog[];
        nutrition: { date: string; calories: number }[];
    } | null>(null);

    const generateReport = async () => {
        if (!user?.uid) return;
        setLoading(true);

        const days = 7;
        const endDate = new Date();
        const startDate = subDays(endDate, days - 1);
        const startDateStr = format(startDate, 'yyyy-MM-dd');
        const endDateStr = format(endDate, 'yyyy-MM-dd');

        try {
            const [sleep, mood, meds, nutrition] = await Promise.all([
                wellnessService.getSleepLogs(user.uid, days),
                wellnessService.getMoodLogs(user.uid, days),
                medicationService.getMedications(user.uid),
                mealService.getCaloriesByDateRange(user.uid, startDateStr, endDateStr)
            ]);

            // For med logs, we'll just show if they have any logs in the period for now 
            // since we don't have a range getter yet. 
            // We can fetch today's logs as a sample.
            const medLogs = await medicationService.getLogsByDate(user.uid, endDateStr);

            setReportData({ sleep, mood, meds, medLogs, nutrition });

            // Allow state to update then print
            setTimeout(() => {
                window.print();
            }, 500);

        } catch (error) {
            console.error("Error generating report:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5 no-print">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Weekly Health Report
                    </CardTitle>
                    <CardDescription>
                        Generate a professional summary of your wellness data from the last 7 days.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-background/50 rounded-lg p-6 flex flex-col items-center text-center gap-4">
                        <div className="p-4 rounded-full bg-primary/10">
                            <Printer className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium">Ready to export?</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                The report includes nutrition trends, sleep quality, mood history, and medication compliance.
                            </p>
                        </div>
                        <Button onClick={generateReport} disabled={loading} className="w-full sm:w-auto">
                            {loading ? "Preparing Report..." : <><Printer className="w-4 h-4 mr-2" /> Print / Save as PDF</>}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Print Section (Hidden on screen usually, handled by media queries) */}
            {reportData && (
                <div className="print-only p-8 hidden border shadow-sm rounded-xl bg-white text-slate-900" id="health-report-print">
                    <div className="flex justify-between items-start border-b pb-6 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-primary">Aliva Health Report</h1>
                            <p className="text-slate-500">Generated for {user?.displayName || 'User'}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="font-semibold">{format(new Date(), 'MMMM d, yyyy')}</p>
                            <p className="text-slate-500">Last 7 Days Summary</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                                <Utensils className="w-5 h-5" /> Nutrition Summary
                            </h3>
                            <div className="space-y-2">
                                {reportData.nutrition.map(day => (
                                    <div key={day.date} className="flex justify-between text-sm">
                                        <span>{format(new Date(day.date), 'EEE, MMM d')}</span>
                                        <span className="font-medium font-mono">{day.calories} kcal</span>
                                    </div>
                                ))}
                                {reportData.nutrition.length === 0 && <p className="text-sm italic text-slate-400">No data logged.</p>}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                                <Clock className="w-5 h-5" /> Sleep History
                            </h3>
                            <div className="space-y-2">
                                {reportData.sleep.map(log => (
                                    <div key={log.id} className="flex justify-between text-sm">
                                        <span>{format(new Date(log.date), 'EEE, MMM d')}</span>
                                        <span className="font-medium font-mono">{log.hours}h ({log.quality})</span>
                                    </div>
                                ))}
                                {reportData.sleep.length === 0 && <p className="text-sm italic text-slate-400">No data logged.</p>}
                            </div>
                        </section>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                                <Heart className="w-5 h-5" /> Mood Tracking
                            </h3>
                            <div className="space-y-2 text-sm">
                                {reportData.mood.map(log => (
                                    <div key={log.id} className="border-b border-slate-100 pb-2">
                                        <div className="flex justify-between">
                                            <span className="font-medium">{format(new Date(log.date), 'EEE, MMM d')}</span>
                                            <span className="text-primary font-bold">Mood: {log.mood}/5</span>
                                        </div>
                                        {log.tags.length > 0 && (
                                            <p className="text-xs text-slate-500">{log.tags.join(', ')}</p>
                                        )}
                                    </div>
                                ))}
                                {reportData.mood.length === 0 && <p className="text-sm italic text-slate-400">No data logged.</p>}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                                <Pill className="w-5 h-5" /> Medications
                            </h3>
                            <div className="space-y-2">
                                {reportData.meds.map(med => (
                                    <div key={med.id} className="flex justify-between text-sm">
                                        <span>{med.name} ({med.dosage})</span>
                                        <span className="text-slate-500">{med.frequency}</span>
                                    </div>
                                ))}
                                {reportData.meds.length === 0 && <p className="text-sm italic text-slate-400">No active medications.</p>}
                            </div>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t text-center">
                        <p className="text-xs text-slate-400 italic">
                            This report is for informational purposes only. Consult with a healthcare professional for clinical advice.
                        </p>
                        <p className="text-xs font-bold mt-2 text-primary">Powered by Aliva</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HealthReportGenerator;
