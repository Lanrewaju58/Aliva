import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { profileService } from '@/services/profileService';
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newWeightKg, setNewWeightKg] = useState<string>("");
  const [newWeightDate, setNewWeightDate] = useState<string>(() => new Date().toISOString().slice(0,10));
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
        <div className="flex flex-col items-center gap-8">
          <img src="/logo.svg" alt="Aliva logo" className="h-28 w-28 animate-pulse" />
          <div className="h-16 w-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="text-foreground text-base">Authenticating…</div>
        </div>
      </div>
    );
  }
  if (pageLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
        <div className="flex flex-col items-center gap-9">
          <img src="/logo.svg" alt="Aliva logo" className="h-32 w-32 animate-pulse" />
          <div className="h-20 w-20 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <div className="text-foreground text-base">Loading your profile…</div>
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
    setNewWeightDate(new Date().toISOString().slice(0,10));
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
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Personal Information</h2>
        </div>

        {/* Plan status */}
        <div className="mb-6">
          <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
            <div className={`px-2 py-1 rounded text-xs font-medium ${profile?.plan && profile.plan !== 'FREE' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-muted text-muted-foreground border border-border'}`}>
              {profile?.plan || 'FREE'}
            </div>
            <div className="text-sm text-foreground">
              {profile?.plan && profile.plan !== 'FREE' ? (
                <>
                  Active plan
                  {profile?.planExpiresAt && (
                    <span className="ml-2 text-muted-foreground">
                      Expires on {new Date((profile as any).planExpiresAt?.toDate ? (profile as any).planExpiresAt.toDate() : (profile as any).planExpiresAt).toLocaleDateString()}
                    </span>
                  )}
                </>
              ) : (
                'Free plan - ads shown and daily chat limit applies'
              )}
            </div>
            {profile?.plan === 'FREE' && (
              <Button className="ml-auto" onClick={() => navigate('/upgrade')}>Upgrade</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input id="fullName" value={profile.fullName || ''} onChange={e => updateField('fullName', e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" min={0} value={profile.age ?? ''} onChange={e => updateField('age', e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={profile.gender || ''} onValueChange={v => updateField('gender', v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input id="height" type="number" min={0} value={profile.heightCm ?? ''} onChange={e => updateField('heightCm', e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div>
                  <Label htmlFor="currentWeight">Current weight (kg)</Label>
                  <Input id="currentWeight" type="number" min={0} value={profile.currentWeightKg ?? ''} onChange={e => updateField('currentWeightKg', e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div>
                  <Label htmlFor="targetWeight">Target weight (kg)</Label>
                  <Input id="targetWeight" type="number" min={0} value={profile.targetWeightKg ?? ''} onChange={e => updateField('targetWeightKg', e.target.value ? Number(e.target.value) : undefined)} />
                </div>
                <div>
                  <Label>Activity level</Label>
                  <Select value={profile.activityLevel || ''} onValueChange={v => updateField('activityLevel', v)}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_LEVELS.map(l => (
                        <SelectItem key={l} value={l}>{l.replace('_', ' ')}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Dietary preferences (comma separated)</Label>
                  <Input value={(profile.dietaryPreferences || []).join(', ')} onChange={e => updateField('dietaryPreferences', parseCSV(e.target.value))} />
                </div>
                <div>
                  <Label>Health goals (comma separated)</Label>
                  <Input value={(profile.healthGoals || []).join(', ')} onChange={e => updateField('healthGoals', parseCSV(e.target.value))} />
                </div>
                <div>
                  <Label>Allergies (comma separated)</Label>
                  <Input value={(profile.allergies || []).join(', ')} onChange={e => updateField('allergies', parseCSV(e.target.value))} />
                </div>
                <div>
                  <Label>Medical conditions (comma separated)</Label>
                  <Input value={(profile.medicalConditions || []).join(', ')} onChange={e => updateField('medicalConditions', parseCSV(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Smoking status</Label>
                  <Select value={profile.smokingStatus || ''} onValueChange={v => updateField('smokingStatus', v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="former">Former</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Alcohol frequency</Label>
                  <Select value={profile.alcoholFrequency || ''} onValueChange={v => updateField('alcoholFrequency', v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="occasional">Occasional</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea placeholder="Additional info to personalize your diet plan" />
              </div>
            </Card>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="mb-4 font-semibold">Calorie calculator</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>BMR (Basal Metabolic Rate)</Label>
                  <Input
                    value={bmr ? String(bmr) : ''}
                    disabled
                  />
                </div>
                <div>
                  <Label>TDEE (Total Daily Energy Expenditure)</Label>
                  <Input
                    value={tdee ? String(tdee) : ''}
                    disabled
                  />
                </div>
                <div>
                  <Label>Goal</Label>
                  <Select value={calorieGoal} onValueChange={(v) => setCalorieGoal(v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loss">Lose weight</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                      <SelectItem value="gain">Gain muscle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Suggested calories</Label>
                  <Input value={suggestedCalories ? String(suggestedCalories) : ''} disabled />
                </div>
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                  <div>
                    <Label>Protein</Label>
                    <Input value={`${macroBreakdown.proteinG} g`} disabled />
                  </div>
                  <div>
                    <Label>Fat</Label>
                    <Input value={`${macroBreakdown.fatG} g`} disabled />
                  </div>
                  <div>
                    <Label>Carbs</Label>
                    <Input value={`${macroBreakdown.carbG} g`} disabled />
                  </div>
                </div>
                <div>
                  <Label>Preferred daily calorie target</Label>
                  <Input
                    type="number"
                    min={0}
                    value={profile.preferredCalorieTarget ?? ''}
                    onChange={e => updateField('preferredCalorieTarget', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
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
                  Save calorie target
                </Button>
                <Button
                  className="ml-2"
                  variant="default"
                  onClick={() => updateField('preferredCalorieTarget', suggestedCalories || undefined)}
                  disabled={!suggestedCalories}
                >
                  Apply suggestion
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Weight journey</div>
                <Button variant="outline" onClick={addWeightEntry}>Add entry</Button>
              </div>
              <div className="mb-4">
                <ChartContainer
                  config={{ kg: { label: 'Weight (kg)', color: 'hsl(var(--primary))' } }}
                  className="w-full"
                >
                  <LineChart data={weightData} margin={{ left: 12, right: 12 }}>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="kg" stroke="var(--color-kg)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ChartContainer>
              </div>
              <div className="space-y-2">
                {(profile.weightHistory || []).length === 0 && (
                  <div className="text-sm text-muted-foreground">No entries yet.</div>
                )}
                {(profile.weightHistory || [])
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-sm border rounded-md p-2">
                      <span className="text-muted-foreground">{new Date(w.date).toLocaleDateString()}</span>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="h-8 w-24"
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
                        <Button
                          size="sm"
                          variant="outline"
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
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;