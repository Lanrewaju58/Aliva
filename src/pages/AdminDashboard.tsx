import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminRevenue } from "@/components/admin/AdminRevenue";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminContent } from "@/components/admin/AdminContent";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!adminService.isAdmin(user.email)) {
      toast({
        title: "Access Denied",
        description: `Your email (${user.email}) is not authorized.`,
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }
  }, [user, navigate, toast]);

  if (!user || !adminService.isAdmin(user.email)) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview />;
      case "users":
        return <AdminUsers />;
      case "revenue":
        return <AdminRevenue />;
      case "content":
        return <AdminContent />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;

