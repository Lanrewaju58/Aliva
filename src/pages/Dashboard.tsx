import Navigation from "@/components/Navigation";
import LoginChat from "@/components/LoginChat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Salad, MapPin, ChefHat, History, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const QuickAction = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <Button variant="outline" className="justify-start gap-2">
    <Icon className="h-4 w-4 text-primary" />
    {label}
  </Button>
);

const Dashboard = () => {
  const { user, loading } = useAuth();
  if (loading || !user) return null; // handled by ProtectedRoute

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background" data-testid="main-content">
      <Navigation />
      <main className="pt-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-4 bg-card shadow-xl border border-border rounded-[20px]">
              <LoginChat />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;


