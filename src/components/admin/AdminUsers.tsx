import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    MoreHorizontal,
    Search,
    Trash2,
    Calendar,
    Shield,
    Crown,
    Users,
    ArrowUpCircle,
    ArrowDownCircle
} from "lucide-react";
import { adminService, AdminUser } from "@/services/adminService";
import { settingsService, GlobalSettings } from "@/services/settingsService";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const AdminUsers = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({ freeUsersArePro: false });
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
    const { toast } = useToast();
    const { user: currentUser } = useAuth();

    // Promotion state
    const [promoteUserId, setPromoteUserId] = useState<string | null>(null);
    const [promoteDuration, setPromoteDuration] = useState<number>(30);
    const [isPromoting, setIsPromoting] = useState(false);

    // Super admin ID - only this user can delete other admins
    const SUPER_ADMIN_ID = 'EJ3f1PoNSEWEPHXJkFZcerEzxeC3';

    // Real-time subscription
    useEffect(() => {
        setIsLoading(true);
        const unsubscribeSettings = settingsService.subscribeToSettings(setGlobalSettings);
        const unsubscribeUsers = adminService.subscribeToUsers((updatedUsers) => {
            setUsers(updatedUsers);
            setIsLoading(false);
        });
        return () => {
            unsubscribeSettings();
            unsubscribeUsers();
        };
    }, []);

    // Categorize users
    const categorizeUsers = () => {
        const admins: AdminUser[] = [];
        const proUsers: AdminUser[] = [];
        const freeUsers: AdminUser[] = [];

        users.forEach(user => {
            if (adminService.isAdmin(user.email, user.userId)) {
                admins.push(user);
            } else if (user.plan === 'PRO') {
                proUsers.push(user);
            } else {
                freeUsers.push(user);
            }
        });

        return { admins, proUsers, freeUsers };
    };

    const { admins, proUsers, freeUsers } = categorizeUsers();

    // Filter by search
    const filterBySearch = (list: AdminUser[]) => {
        if (!searchQuery.trim()) return list;
        const query = searchQuery.toLowerCase();
        return list.filter(user =>
            user.fullName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.userId.toLowerCase().includes(query)
        );
    };

    const handleDeleteUser = async () => {
        if (!deleteUserId) return;

        // Prevent non-super-admins from deleting admins
        const targetUser = users.find(u => u.userId === deleteUserId);
        const isTargetAdmin = targetUser && adminService.isAdmin(targetUser.email, targetUser.userId);
        const isSuperAdmin = currentUser?.uid === SUPER_ADMIN_ID;

        if (isTargetAdmin && !isSuperAdmin) {
            toast({ title: "Permission Denied", description: "Only the super admin can delete other administrators.", variant: "destructive" });
            setDeleteUserId(null);
            return;
        }

        try {
            await adminService.deleteUser(deleteUserId);
            toast({ title: "User deleted", description: "The user account has been permanently removed." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete user. Please try again.", variant: "destructive" });
        } finally {
            setDeleteUserId(null);
        }
    };

    const handleGlobalProToggle = async (checked: boolean) => {
        setIsUpdatingSettings(true);
        try {
            await settingsService.updateSettings({ freeUsersArePro: checked });
            toast({
                title: checked ? "Global Pro Enabled" : "Global Pro Disabled",
                description: checked ? "All free users now have Pro access." : "Free users reverted to standard access.",
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update settings.", variant: "destructive" });
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    // Handle promoting a user to Pro
    const handlePromoteUser = async () => {
        if (!promoteUserId) return;
        setIsPromoting(true);
        try {
            await adminService.promoteToProUser(promoteUserId, promoteDuration);
            const targetUser = users.find(u => u.userId === promoteUserId);
            toast({
                title: "User Promoted to Pro",
                description: `${targetUser?.fullName || 'User'} now has Pro access for ${promoteDuration} days.`,
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to promote user.", variant: "destructive" });
        } finally {
            setPromoteUserId(null);
            setIsPromoting(false);
            setPromoteDuration(30);
        }
    };

    // Handle demoting a user to Free
    const handleDemoteUser = async (userId: string) => {
        try {
            await adminService.demoteToFree(userId);
            const targetUser = users.find(u => u.userId === userId);
            toast({
                title: "User Demoted",
                description: `${targetUser?.fullName || 'User'} is now on the Free plan.`,
            });
        } catch (error) {
            toast({ title: "Error", description: "Failed to demote user.", variant: "destructive" });
        }
    };

    const formatDate = (date: Date | null) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    };

    const UserTableRow = ({ user, planBadgeClass, showPromote = false, showDemote = false, isPro = false }: { user: AdminUser; planBadgeClass?: string; showPromote?: boolean; showDemote?: boolean; isPro?: boolean }) => (
        <TableRow key={user.userId}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs border border-primary/20">
                        {(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                            {user.fullName}
                            {isPro && (
                                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 gap-1 text-[10px] px-1.5 py-0">
                                    <Crown className="h-3 w-3" />
                                    PRO
                                </Badge>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant={user.isActive ? "secondary" : "outline"} className={user.isActive ? "bg-green-500/10 text-green-700" : "text-muted-foreground"}>
                    {user.isActive ? "Active" : "Inactive"}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(user.createdAt)}
                </div>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.userId)}>Copy User ID</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {showPromote && (
                            <DropdownMenuItem onClick={() => setPromoteUserId(user.userId)} className="text-yellow-600 focus:text-yellow-600">
                                <ArrowUpCircle className="mr-2 h-4 w-4" /> Promote to Pro
                            </DropdownMenuItem>
                        )}
                        {showDemote && (
                            <DropdownMenuItem onClick={() => handleDemoteUser(user.userId)} className="text-orange-600 focus:text-orange-600">
                                <ArrowDownCircle className="mr-2 h-4 w-4" /> Demote to Free
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteUserId(user.userId)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );

    const UserTable = ({ userList, showPromote = false, showDemote = false, isAdminList = false }: { userList: AdminUser[]; showPromote?: boolean; showDemote?: boolean; isAdminList?: boolean }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {userList.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-16 text-center text-muted-foreground">No users in this category.</TableCell></TableRow>
                ) : (
                    userList.map((user) => (
                        <UserTableRow
                            key={user.userId}
                            user={user}
                            showPromote={showPromote}
                            showDemote={showDemote}
                            isPro={isAdminList && user.plan === 'PRO'}
                        />
                    ))
                )}
            </TableBody>
        </Table>
    );

    if (isLoading) {
        return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading users...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>

            {/* Admins Section */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <CardTitle className="text-lg">Administrators ({filterBySearch(admins).length})</CardTitle>
                    </div>
                    <CardDescription>Users with administrative privileges. Always have Pro access.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <UserTable userList={filterBySearch(admins)} isAdminList />
                </CardContent>
            </Card>

            {/* Pro Subscribers Section */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-lg">Pro Subscribers ({filterBySearch(proUsers).length})</CardTitle>
                    </div>
                    <CardDescription>Paying users with active Pro subscriptions.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <UserTable userList={filterBySearch(proUsers)} showDemote />
                </CardContent>
            </Card>

            {/* Free Users Section */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-gray-500" />
                                <CardTitle className="text-lg">Free Users ({filterBySearch(freeUsers).length})</CardTitle>
                            </div>
                            <CardDescription>Users on the free plan.</CardDescription>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                            <div className="text-sm">
                                <p className="font-medium">Enable Pro for All Free Users</p>
                                <p className="text-xs text-muted-foreground">Override access for all free users</p>
                            </div>
                            <Switch
                                checked={globalSettings.freeUsersArePro}
                                onCheckedChange={handleGlobalProToggle}
                                disabled={isUpdatingSettings}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <UserTable userList={filterBySearch(freeUsers)} showPromote />
                </CardContent>
            </Card>

            <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user account and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Promote User Dialog */}
            <AlertDialog open={!!promoteUserId} onOpenChange={(open) => !open && setPromoteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5 text-yellow-500" />
                            Promote User to Pro
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Select the duration for this user's Pro subscription. They will have access to all Pro features during this period.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <div className="grid grid-cols-5 gap-2">
                            {[1, 7, 30, 90, 365].map((days) => (
                                <Button
                                    key={days}
                                    variant={promoteDuration === days ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setPromoteDuration(days)}
                                    className="w-full"
                                >
                                    {days === 365 ? '1 Year' : days === 90 ? '3 Months' : days === 30 ? '1 Month' : days === 7 ? '1 Week' : '1 Day'}
                                </Button>
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 text-center">
                            Pro access will expire on <span className="font-medium text-foreground">
                                {new Date(Date.now() + promoteDuration * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPromoting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePromoteUser} disabled={isPromoting} className="bg-yellow-500 text-white hover:bg-yellow-600">
                            {isPromoting ? 'Promoting...' : 'Promote to Pro'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};
