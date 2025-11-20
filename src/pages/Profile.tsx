import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { profileService } from '@/services/profileService';
import MobileNav from "@/components/MobileNav";
import { ACTIVITY_LEVELS, UserProfile } from '@/types/profile';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newWeightKg, setNewWeightKg] = useState<string>("");
  const [newWeightDate, setNewWeightDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const weightSaveTimerRef = useRef<number | null>(null);
  const [calorieGoal, setCalorieGoal] = useState<'loss' | 'maintain' | 'gain'>('maintain');

  const defaults = useMemo<UserProfile>(() => ({
    userId: user?.uid || '',
    fullName: user?.displayName || '',
    dietaryPreferences: [],
    healthGoals: [],
    allergies: [],
    age: undefined,
    activityLevel: undefined,
    gender: undefined,
    heightCm: undefined,
    currentWeightKg: undefined,
    targetWeightKg: undefined,
    medicalConditions: [],
    smokingStatus: undefined,
    alcoholFrequency: undefined,
    weightHistory: [],
  }), [user]);

  // Helper function to get user initials
  const getUserInitials = (name: string | null, email: string | null): string => {
    if (name && name.trim()) {
      return name
        .trim()
        .split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }
    if (email && email.trim()) {
      return email.charAt(0).toUpperCase();
    }
    return 'U'; // fallback to 'U' for User
  };

  const userInitials = getUserInitials(profile?.fullName || user?.displayName, user?.email);

  useEffect(() => {
    if (!user || loading) return;
    let active = true;
    (async () => {
      try {
        const existing = await profileService.getProfile(user.uid);
        if (!active) return;
        setProfile(existing || { ...defaults, userId: user.uid });
      } catch (e) {
        // Graceful fallback to editable defaults so the page remains usable
        console.warn('Profile load failed, using defaults', e);
        setProfile({ ...defaults, userId: user.uid });
        toast({ title: 'Profile unavailable', description: 'Using defaults. You can still edit and save.' });
      } finally {
        if (active) setPageLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user, loading, defaults, toast]);

  // Derived memos must be declared before any early returns to keep hook order stable
  const weightData = useMemo(() => (
    ((profile?.weightHistory) || [])
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(w => ({ date: new Date(w.date).toLocaleDateString(), kg: w.weightKg }))
  ), [profile?.weightHistory]);

  const bmr = useMemo(() => {
    const age = profile?.age ?? 0;
    const height = profile?.heightCm ?? 0;
    const weight = profile?.currentWeightKg ?? 0;
    if (!age || !height || !weight || !profile?.gender) return 0;
    const s = profile.gender === 'male' ? 5 : -161;
    return Math.round(10 * weight + 6.25 * height - 5 * age + s);
  }, [profile?.age, profile?.heightCm, profile?.currentWeightKg, profile?.gender]);

  const tdee = useMemo(() => {
    if (!bmr) return 0;
    const factorMap: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };
    const f = profile?.activityLevel ? factorMap[profile.activityLevel] || 1.2 : 1.2;
    return Math.round(bmr * f);
  }, [bmr, profile?.activityLevel]);

  const suggestedCalories = useMemo(() => {
    if (!tdee) return 0;
    const map = {
      loss: Math.max(1200, tdee - 500),
      maintain: tdee,
      gain: tdee + 300,
    } as const;
    return map[calorieGoal];
  }, [tdee, calorieGoal]);

  const macroBreakdown = useMemo(() => {
    if (!suggestedCalories) return { proteinG: 0, fatG: 0, carbG: 0 };
    const weight = profile?.currentWeightKg || 0;
    const proteinG = weight > 0 ? Math.round(weight * 1.8) : 0;
    const fatKcal = Math.round(suggestedCalories * 0.25);
    const fatG = Math.round(fatKcal / 9);
    const remainingKcal = Math.max(0, suggestedCalories - (proteinG * 4 + fatG * 9));
    const carbG = Math.round(remainingKcal / 4);
    return { proteinG, fatG, carbG };
  }, [suggestedCalories, profile?.currentWeightKg]);

  if (loading || !user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-b from-primary/10 to-background' : 'bg-gradient-to-b from-primary/10 to-white'}`}>
        <div className="flex flex-col items-center gap-8">
          <img src="/logo.svg" alt="Aliva logo" className="h-28 w-28 animate-pulse" />
          <div className="h-16 w-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className={`text-base ${theme === 'dark' ? 'text-foreground' : 'text-gray-700'}`}>Authenticating…</div>
        </div>
      </div>
    );
  }
  if (pageLoading || !profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gradient-to-b from-primary/10 to-background' : 'bg-gradient-to-b from-primary/10 to-white'}`}>
        <div className="flex flex-col items-center gap-9">
          <img src="/logo.svg" alt="Aliva logo" className="h-32 w-32 animate-pulse" />
          <div className="h-20 w-20 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className={`text-base ${theme === 'dark' ? 'text-foreground' : 'text-gray-700'}`}>Loading your profile…</div>
        </div>
      </div>
    );
  }

  const updateField = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const parseCSV = (value: string) => value.split(',').map(s => s.trim()).filter(Boolean);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await profileService.upsertProfile(user.uid, {
        ...profile,
        userId: user.uid,
      });
      toast({ title: 'Profile saved', description: 'Your changes have been saved.' });
      navigate('/dashboard');
    } catch (e) {
      toast({ title: 'Save failed', description: 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const addWeightEntry = () => {
    setNewWeightKg("");
    setNewWeightDate(new Date().toISOString().slice(0, 10));
    setAddDialogOpen(true);
  };

  const saveWeightHistoryDebounced = (nextHistory: NonNullable<UserProfile['weightHistory']>) => {
    if (!user) return;
    if (weightSaveTimerRef.current) {
      window.clearTimeout(weightSaveTimerRef.current);
    }
    weightSaveTimerRef.current = window.setTimeout(async () => {
      try {
        await profileService.updateProfile(user.uid, { weightHistory: nextHistory });
        toast({ title: 'Weight updated' });
      } catch (e) {
        toast({ title: 'Autosave failed', description: 'We will retry on next change.' });
      }
    }, 700);
  };

  const handleSignOut = () => {
    signOut();
    toast({
      title: "Signed out successfully",
      description: "See you next time!",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Profile Settings</h1>
            </div>

            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold mr-2">
                      {userInitials}
                    </div>
                    {user?.displayName || user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Status Banner */}
        <div className="mb-8">
          <div className="bg-card border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide ${profile?.plan && profile.plan !== 'FREE' ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' : 'bg-muted text-muted-foreground border border-border'}`}>
              {profile?.plan || 'FREE'}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">
                {profile?.plan && profile.plan !== 'FREE' ? 'Premium Plan Active' : 'Free Plan'}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {profile?.plan && profile.plan !== 'FREE' ? (
                  <>
                    {profile?.planExpiresAt && (
                      <>Expires on {new Date((profile as any).planExpiresAt?.toDate ? (profile as any).planExpiresAt.toDate() : (profile as any).planExpiresAt).toLocaleDateString()}</>
                    )}
                  </>
                ) : (
                  'Ads shown and daily chat limit applies'
                )}
              </div>
            </div>
            {profile?.plan === 'FREE' && (
              <Button className="ml-auto" onClick={() => navigate('/upgrade')}>Upgrade Plan</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Profile Info */}
          <div className="xl:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Your personal details and account info</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName || ''}
                      onChange={e => updateField('fullName', e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email Address</Label>
                    <Input
                      value={user.email || ''}
                      disabled
                      className="mt-1.5 bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age" className="text-sm font-medium">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min={0}
                      value={profile.age ?? ''}
                      onChange={e => updateField('age', e.target.value ? Number(e.target.value) : undefined)}
                      className="mt-1.5"
                      placeholder="Enter your age"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Gender</Label>
                    <Select value={profile.gender || ''} onValueChange={v => updateField('gender', v as any)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Physical Metrics */}
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Physical Metrics</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Height, weight, and activity information</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="height" className="text-sm font-medium">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      min={0}
                      value={profile.heightCm ?? ''}
                      onChange={e => updateField('heightCm', e.target.value ? Number(e.target.value) : undefined)}
                      className="mt-1.5"
                      placeholder="e.g., 175"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentWeight" className="text-sm font-medium">Current Weight (kg)</Label>
                    <Input
                      id="currentWeight"
                      type="number"
                      min={0}
                      value={profile.currentWeightKg ?? ''}
                      onChange={e => updateField('currentWeightKg', e.target.value ? Number(e.target.value) : undefined)}
                      className="mt-1.5"
                      placeholder="e.g., 70"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetWeight" className="text-sm font-medium">Target Weight (kg)</Label>
                    <Input
                      id="targetWeight"
                      type="number"
                      min={0}
                      value={profile.targetWeightKg ?? ''}
                      onChange={e => updateField('targetWeightKg', e.target.value ? Number(e.target.value) : undefined)}
                      className="mt-1.5"
                      placeholder="e.g., 65"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Activity Level</Label>
                    <Select value={profile.activityLevel || ''} onValueChange={v => updateField('activityLevel', v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select activity level" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTIVITY_LEVELS.map(l => (
                          <SelectItem key={l} value={l}>
                            {l.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Health & Lifestyle */}
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Health & Lifestyle</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Dietary preferences, allergies, and health information</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Dietary Preferences</Label>
                    <Input
                      value={(profile.dietaryPreferences || []).join(', ')}
                      onChange={e => updateField('dietaryPreferences', parseCSV(e.target.value))}
                      className="mt-1.5"
                      placeholder="e.g., Vegetarian, Vegan"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate multiple items with commas</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Health Goals</Label>
                    <Input
                      value={(profile.healthGoals || []).join(', ')}
                      onChange={e => updateField('healthGoals', parseCSV(e.target.value))}
                      className="mt-1.5"
                      placeholder="e.g., Weight loss, Muscle gain"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate multiple items with commas</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Allergies</Label>
                    <Input
                      value={(profile.allergies || []).join(', ')}
                      onChange={e => updateField('allergies', parseCSV(e.target.value))}
                      className="mt-1.5"
                      placeholder="e.g., Peanuts, Shellfish"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate multiple items with commas</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Medical Conditions</Label>
                    <Input
                      value={(profile.medicalConditions || []).join(', ')}
                      onChange={e => updateField('medicalConditions', parseCSV(e.target.value))}
                      className="mt-1.5"
                      placeholder="e.g., Diabetes, Hypertension"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Separate multiple items with commas</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Smoking Status</Label>
                    <Select value={profile.smokingStatus || ''} onValueChange={v => updateField('smokingStatus', v as any)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="former">Former Smoker</SelectItem>
                        <SelectItem value="current">Current Smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Alcohol Frequency</Label>
                    <Select value={profile.alcoholFrequency || ''} onValueChange={v => updateField('alcoholFrequency', v as any)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="occasional">Occasional</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <Textarea
                    placeholder="Any additional information to help personalize your diet plan..."
                    className="mt-1.5 min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Optional: Share any other relevant information</p>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                size="lg"
                className="px-8"
              >
                {saving ? 'Saving Changes...' : 'Save All Changes'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Right Column - Calculators & Tracking */}
          <div className="space-y-8">
            {/* Calorie Calculator */}
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <h3 className="text-lg font-semibold text-foreground">Calorie Calculator</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Personalized daily targets</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Metrics Display */}
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">BMR</div>
                    <div className="text-2xl font-bold text-foreground mt-1">
                      {bmr ? `${bmr} cal` : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Basal Metabolic Rate</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">TDEE</div>
                    <div className="text-2xl font-bold text-foreground mt-1">
                      {tdee ? `${tdee} cal` : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Total Daily Energy Expenditure</div>
                  </div>
                </div>

                {/* Goal Selection */}
                <div>
                  <Label className="text-sm font-medium">Your Goal</Label>
                  <Select value={calorieGoal} onValueChange={(v) => setCalorieGoal(v as any)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loss">🔥 Lose Weight</SelectItem>
                      <SelectItem value="maintain">⚖️ Maintain Weight</SelectItem>
                      <SelectItem value="gain">💪 Gain Muscle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Suggested Calories */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="text-xs font-medium text-primary uppercase tracking-wide">Suggested Daily Calories</div>
                  <div className="text-3xl font-bold text-primary mt-1">
                    {suggestedCalories ? `${suggestedCalories}` : '—'}
                  </div>
                </div>

                {/* Macro Breakdown */}
                <div>
                  <div className="text-sm font-medium mb-3">Macro Breakdown</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Protein</div>
                      <div className="text-lg font-bold text-foreground mt-1">{macroBreakdown.proteinG}g</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Fat</div>
                      <div className="text-lg font-bold text-foreground mt-1">{macroBreakdown.fatG}g</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-xs text-muted-foreground">Carbs</div>
                      <div className="text-lg font-bold text-foreground mt-1">{macroBreakdown.carbG}g</div>
                    </div>
                  </div>
                </div>

                {/* Custom Target */}
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium">Custom Daily Target (optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={profile.preferredCalorieTarget ?? ''}
                    onChange={e => updateField('preferredCalorieTarget', e.target.value ? Number(e.target.value) : undefined)}
                    className="mt-1.5"
                    placeholder="Enter custom target"
                  />
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={async () => {
                        if (!user) return;
                        try {
                          await profileService.updateProfile(user.uid, { preferredCalorieTarget: profile.preferredCalorieTarget });
                          toast({ title: 'Calorie target saved' });
                        } catch (e) {
                          toast({ title: 'Save failed', description: 'Please try again.' });
                        }
                      }}
                    >
                      Save Target
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => updateField('preferredCalorieTarget', suggestedCalories || undefined)}
                      disabled={!suggestedCalories}
                    >
                      Use Suggested
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Weight Journey */}
            <Card className="overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Weight Journey</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Track your progress over time</p>
                </div>
                <Button variant="outline" size="sm" onClick={addWeightEntry}>Add Entry</Button>
              </div>
              <div className="p-6 space-y-4">
                {/* Chart */}
                {weightData.length > 0 ? (
                  <div className="h-48">
                    <ChartContainer
                      config={{ kg: { label: 'Weight (kg)', color: 'hsl(var(--primary))' } }}
                      className="w-full h-full"
                    >
                      <LineChart data={weightData} margin={{ left: 12, right: 12, top: 12, bottom: 12 }}>
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} fontSize={11} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="kg" stroke="var(--color-kg)" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <div className="text-sm text-muted-foreground">No weight data yet</div>
                      <div className="text-xs text-muted-foreground mt-1">Add your first entry to start tracking</div>
                    </div>
                  </div>
                )}

                {/* Entry List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(profile.weightHistory || [])
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((w, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                        <span className="text-sm text-muted-foreground min-w-[90px]">
                          {new Date(w.date).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="h-9 w-20 text-sm"
                            value={w.weightKg}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setProfile(prev => {
                                if (!prev) return prev;
                                const next = [...(prev.weightHistory || [])];
                                next[idx] = { ...next[idx], weightKg: Number.isNaN(val) ? next[idx].weightKg : val };
                                return { ...prev, weightHistory: next };
                              });
                            }}
                            onBlur={() => {
                              const nextHistory = (profile.weightHistory || []).slice();
                              saveWeightHistoryDebounced(nextHistory);
                            }}
                          />
                          <span className="text-xs text-muted-foreground">kg</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setProfile(prev => {
                                if (!prev) return prev;
                                const next = (prev.weightHistory || []).filter((_, i) => i !== idx);
                                return { ...prev, weightHistory: next };
                              });
                              const nextHistory = (profile.weightHistory || []).filter((_, i) => i !== idx);
                              saveWeightHistoryDebounced(nextHistory as any);
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
