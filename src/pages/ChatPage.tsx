import { useEffect } from "react";
import LoginChat from "@/components/LoginChat";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/auth');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background pb-20 lg:pb-0">
            <div className="max-w-4xl mx-auto h-[calc(100vh-5rem)] lg:h-[calc(100vh-2rem)] py-4">
                <LoginChat />
            </div>
        </div>
    );
};

export default ChatPage;
