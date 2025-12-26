import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { healthService, ConnectedProvider } from "@/services/healthService";
import {
    Watch,
    Smartphone,
    Activity,
    CheckCircle,
    Plus,
    RefreshCw,
    AlertCircle,
    X
} from "lucide-react";

// Provider configurations with SVG logos
const PROVIDERS = [
    {
        id: 'GOOGLE',
        name: 'Google Fit',
        color: 'bg-blue-500',
        logo: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                <path d="M12 2L4 6v12l8 4 8-4V6l-8-4z" fill="#4285F4" />
                <path d="M12 2v20l8-4V6l-8-4z" fill="#34A853" />
                <path d="M4 6l8 4v12l-8-4V6z" fill="#FBBC05" />
                <path d="M12 10l8-4v12l-8 4V10z" fill="#EA4335" />
            </svg>
        )
    },
    {
        id: 'APPLE',
        name: 'Apple Health',
        color: 'bg-red-500',
        logo: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
            </svg>
        )
    },
    {
        id: 'FITBIT',
        name: 'Fitbit',
        color: 'bg-teal-500',
        logo: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#00B0B9">
                <path d="M12 4a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm0 6a2 2 0 100-4 2 2 0 000 4zm-5-15a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm10-12a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
        )
    },
    {
        id: 'GARMIN',
        name: 'Garmin',
        color: 'bg-blue-600',
        logo: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#007CC3">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                <path d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14.5c-3.59 0-6.5-2.91-6.5-6.5S8.41 5.5 12 5.5s6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5z" />
            </svg>
        )
    },
    {
        id: 'OURA',
        name: 'Oura Ring',
        color: 'bg-gray-700',
        logo: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#2D3748">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
        )
    },
    {
        id: 'SAMSUNG',
        name: 'Samsung Health',
        color: 'bg-indigo-500',
        logo: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1428A0">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
        )
    },
    {
        id: 'WITHINGS',
        name: 'Withings',
        color: 'bg-green-500',
        logo: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#00B67A">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
        )
    },
];

interface HealthConnectProps {
    onConnectionChange?: () => void;
}

const HealthConnect: React.FC<HealthConnectProps> = ({ onConnectionChange }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [connectedProviders, setConnectedProviders] = useState<ConnectedProvider[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

    // Load connected providers
    useEffect(() => {
        if (user?.uid) {
            loadConnectedProviders();
        }
    }, [user?.uid]);

    const loadConnectedProviders = async () => {
        if (!user?.uid) return;
        try {
            const providers = await healthService.getConnectedProviders(user.uid);
            setConnectedProviders(providers);
        } catch (error) {
            console.error('Error loading connected providers:', error);
        }
    };

    const handleConnect = async (providerId: string) => {
        if (!user?.uid) {
            toast({
                title: 'Sign in required',
                description: 'Please sign in to connect health devices.',
                variant: 'destructive'
            });
            return;
        }

        setConnectingProvider(providerId);
        setLoading(true);

        try {
            // Call backend to generate Terra widget session
            const apiBase = import.meta.env.VITE_API_BASE_URL || '';
            const response = await fetch(`${apiBase}/api/terra/generate-widget`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    provider: providerId,
                    referenceId: user.uid
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate connection widget');
            }

            const data = await response.json();

            if (data.url) {
                // Open Terra widget in popup
                const popup = window.open(
                    data.url,
                    'terra-connect',
                    'width=500,height=700,scrollbars=yes'
                );

                // Poll for popup close
                const pollTimer = setInterval(() => {
                    if (popup?.closed) {
                        clearInterval(pollTimer);
                        loadConnectedProviders();
                        onConnectionChange?.();
                        toast({
                            title: 'Connection updated',
                            description: 'Checking connection status...'
                        });
                    }
                }, 1000);

                // Clear timer after 5 minutes
                setTimeout(() => clearInterval(pollTimer), 300000);
            } else {
                throw new Error('No widget URL returned');
            }
        } catch (error: any) {
            console.error('Error connecting provider:', error);
            toast({
                title: 'Connection failed',
                description: error.message || 'Unable to connect device. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
            setConnectingProvider(null);
        }
    };

    const handleDisconnect = async (provider: string) => {
        if (!user?.uid) return;

        try {
            // Call backend to disconnect
            const apiBase = import.meta.env.VITE_API_BASE_URL || '';
            await fetch(`${apiBase}/api/terra/disconnect`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    provider
                })
            });

            await loadConnectedProviders();
            onConnectionChange?.();
            toast({
                title: 'Device disconnected',
                description: 'Your health device has been disconnected.'
            });
        } catch (error) {
            console.error('Error disconnecting:', error);
            toast({
                title: 'Disconnect failed',
                description: 'Unable to disconnect device. Please try again.',
                variant: 'destructive'
            });
        }
    };

    const isConnected = (providerId: string) => {
        return connectedProviders.some(p =>
            p.provider.toUpperCase() === providerId.toUpperCase() && p.status === 'active'
        );
    };

    return (
        <Card className="border-border">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Health Connections
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Connect your fitness devices and apps
                        </CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadConnectedProviders}
                        className="h-8 w-8 p-0"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Connected Devices */}
                {connectedProviders.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {connectedProviders.map((provider) => {
                            const config = PROVIDERS.find(p => p.id === provider.provider.toUpperCase());
                            return (
                                <div
                                    key={provider.provider}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        {config?.logo || <Watch className="w-6 h-6" />}
                                        <div>
                                            <p className="text-sm font-medium">{config?.name || provider.provider}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {provider.lastSyncAt
                                                    ? `Last sync: ${new Date(provider.lastSyncAt).toLocaleDateString()}`
                                                    : 'Connected'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDisconnect(provider.provider)}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Connect New Device Button */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full gap-2">
                            <Plus className="w-4 h-4" />
                            Connect Device
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Connect Health Device</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-3 py-4">
                            {PROVIDERS.map((provider) => {
                                const connected = isConnected(provider.id);
                                return (
                                    <button
                                        key={provider.id}
                                        onClick={() => !connected && handleConnect(provider.id)}
                                        disabled={loading || connected}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${connected
                                            ? 'bg-muted/50 border-green-200 dark:border-green-900'
                                            : 'hover:bg-muted border-border hover:border-primary/50'
                                            } ${connectingProvider === provider.id ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {provider.logo}
                                            <span className="font-medium">{provider.name}</span>
                                        </div>
                                        {connected ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : connectingProvider === provider.id ? (
                                            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                                        ) : (
                                            <Plus className="w-5 h-5 text-muted-foreground" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Powered by Terra API. Your data is encrypted and secure.
                        </p>
                    </DialogContent>
                </Dialog>

                {/* Empty State */}
                {connectedProviders.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                        <Watch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No devices connected yet</p>
                        <p className="text-xs mt-1">Connect your fitness tracker to sync health data</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default HealthConnect;
