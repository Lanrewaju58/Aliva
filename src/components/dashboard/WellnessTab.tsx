import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SleepTracker from "./SleepTracker";
import MoodLogger from "./MoodLogger";
import MedicationTracker from "./MedicationTracker";
import HydrationCoach from "./HydrationCoach";
import HealthReportGenerator from "./HealthReportGenerator";

const WellnessTab = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Wellness Tracking</h2>
                <p className="text-muted-foreground">Monitor or export your health data.</p>
            </div>

            <Tabs defaultValue="sleep" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sleep">Sleep</TabsTrigger>
                    <TabsTrigger value="mood">Mood</TabsTrigger>
                    <TabsTrigger value="meds">Medications</TabsTrigger>
                    <TabsTrigger value="hydration">Hydration</TabsTrigger>
                    <TabsTrigger value="report">Report</TabsTrigger>
                </TabsList>

                <TabsContent value="sleep" className="space-y-4">
                    <SleepTracker />
                </TabsContent>

                <TabsContent value="mood" className="space-y-4">
                    <MoodLogger />
                </TabsContent>

                <TabsContent value="meds" className="space-y-4">
                    <MedicationTracker />
                </TabsContent>

                <TabsContent value="hydration" className="space-y-4">
                    <HydrationCoach />
                </TabsContent>

                <TabsContent value="report" className="space-y-4">
                    <HealthReportGenerator />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default WellnessTab;
