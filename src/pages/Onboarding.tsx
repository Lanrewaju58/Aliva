import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Target,
  Activity,
  Utensils,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Apple,
  Loader2,
  TrendingDown,
  Scale,
  Dumbbell,
  Sofa,
  PersonStanding,
  Bike,
  Flame,
  Trophy
} from "lucide-react";
import { ActivityLevel, UserProfile } from "@/types/profile";
import { COUNTRIES } from "@/data/countries";

interface OnboardingData {
  age: number | undefined;
  gender: 'male' | 'female' | 'other' | '';
  heightCm: number | undefined;
  currentWeightKg: number | undefined;
  targetWeightKg: number | undefined;
  goal: 'loss' | 'maintain' | 'gain' | '';
  activityLevel: string;
  dietaryPreferences: string[];
  allergies: string[];
  country: string;
}

const steps = [
  { id: 1, title: "Personal", icon: User, description: "Basic information" },
  { id: 2, title: "Goals", icon: Target, description: "Your targets" },
  { id: 3, title: "Activity", icon: Activity, description: "Lifestyle" },
  { id: 4, title: "Diet", icon: Utensils, description: "Preferences" },
];

const commonDietaryPrefs = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free'];
const commonAllergies = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'];

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible] = useState(true);
  const [data, setData] = useState<OnboardingData>({
    age: undefined,
    gender: '',
    heightCm: undefined,
    currentWeightKg: undefined,
    targetWeightKg: undefined,
    goal: '',
    activityLevel: '',
    dietaryPreferences: [],
    allergies: [],
    country: '',
  });

  const updateData = (field: keyof OnboardingData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'dietaryPreferences' | 'allergies', item: string) => {
    setData((prev) => {
      const array = prev[field];
      if (array.includes(item)) {
        return { ...prev, [field]: array.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...array, item] };
      }
    });
  };

  const calculateTargets = () => {
    if (!data.age || !data.heightCm || !data.currentWeightKg || !data.gender) {
      return { calories: 2000, protein: 150, carbs: 200, fat: 65 };
    }

    const s = data.gender === 'male' ? 5 : -161;
    const bmr = Math.round(10 * data.currentWeightKg + 6.25 * data.heightCm - 5 * data.age + s);

    const activityFactors: Record<string, number> = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };
    const factor = activityFactors[data.activityLevel] || 1.2;
    const tdee = Math.round(bmr * factor);

    let calories = tdee;
    if (data.goal === 'loss') {
      calories = Math.max(1200, tdee - 500);
    } else if (data.goal === 'gain') {
      calories = tdee + 300;
    }

    const protein = Math.round(data.currentWeightKg * 1.8);
    const fatCalories = Math.round(calories * 0.25);
    const fat = Math.round(fatCalories / 9);
    const carbCalories = Math.max(0, calories - (protein * 4 + fat * 9));
    const carbs = Math.round(carbCalories / 4);

    return { calories, protein, carbs, fat };
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!data.age || !data.gender || !data.heightCm || !data.currentWeightKg) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
      if (data.age < 10 || data.age > 120) {
        toast({ title: "Invalid age", description: "Please enter a valid age between 10 and 120", variant: "destructive" });
        return;
      }
      if (data.heightCm < 100 || data.heightCm > 250) {
        toast({ title: "Invalid height", description: "Please enter a valid height between 100 and 250 cm", variant: "destructive" });
        return;
      }
      if (data.currentWeightKg < 30 || data.currentWeightKg > 300) {
        toast({ title: "Invalid weight", description: "Please enter a valid weight between 30 and 300 kg", variant: "destructive" });
        return;
      }
    } else if (currentStep === 2) {
      if (!data.targetWeightKg || !data.goal) {
        toast({ title: "Missing information", description: "Please fill in all required fields", variant: "destructive" });
        return;
      }
      if (data.targetWeightKg < 30 || data.targetWeightKg > 300) {
        toast({ title: "Invalid target weight", description: "Please enter a valid target weight", variant: "destructive" });
        return;
      }
    } else if (currentStep === 3) {
      if (!data.activityLevel || data.activityLevel === '') {
        toast({ title: "Missing information", description: "Please select your activity level", variant: "destructive" });
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Authentication required", description: "Please log in to continue", variant: "destructive" });
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      const targets = calculateTargets();

      const profileData: Partial<UserProfile> = {
        userId: user.uid,
        fullName: user.displayName || '',
        age: data.age,
        gender: data.gender !== '' ? data.gender : undefined,
        heightCm: data.heightCm,
        currentWeightKg: data.currentWeightKg,
        targetWeightKg: data.targetWeightKg,
        activityLevel: data.activityLevel as ActivityLevel,
        dietaryPreferences: data.dietaryPreferences,
        allergies: data.allergies,
        healthGoals: [
          data.goal === 'loss'
            ? 'Weight Loss'
            : data.goal === 'gain'
              ? 'Muscle Gain'
              : 'Maintain Weight'
        ],
        country: data.country || undefined,
        preferredCalorieTarget: targets.calories,
        weightHistory: [
          {
            date: new Date(),
            weightKg: data.currentWeightKg!,
          },
        ],
      };

      await profileService.upsertProfile(user.uid, profileData);

      toast({
        title: "Profile created! 🎉",
        description: "Your personalized nutrition plan is ready",
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({ title: "Error", description: "Failed to create profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Left Panel - Progress & Info */}
      <div className={`hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        {/* Logo */}
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
            <Logo className="h-10 w-auto transition-transform group-hover:scale-105 [&_text]:fill-white" />
          </button>
        </div>

        {/* Steps Progress */}
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Let's personalize<br />your experience
            </h1>
            <p className="text-white/60">
              Complete these steps to create your perfect nutrition plan
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isActive
                    ? 'bg-white/10 border border-white/20'
                    : isComplete
                      ? 'opacity-60'
                      : 'opacity-40'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isComplete
                    ? 'bg-green-500'
                    : isActive
                      ? 'bg-white text-primary'
                      : 'bg-white/20 text-white/60'
                    }`}>
                    {isComplete ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${isActive || isComplete ? 'text-white' : 'text-white/60'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-white/50">{step.description}</div>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white/60 text-sm">
            <Apple className="w-4 h-4" />
            <span>Step {currentStep} of {steps.length}</span>
          </div>
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className={`w-full lg:w-3/5 flex flex-col justify-center p-6 sm:p-12 bg-background transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full max-w-xl mx-auto">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 mb-4">
              <Logo className="h-8 w-auto" />
            </button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Step {currentStep} of {steps.length}</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {(() => {
                const Icon = steps[currentStep - 1].icon;
                return (
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                );
              })()}
              <h2 className="text-2xl font-bold text-foreground">
                {currentStep === 1 && "Tell us about yourself"}
                {currentStep === 2 && "What's your goal?"}
                {currentStep === 3 && "How active are you?"}
                {currentStep === 4 && "Any dietary preferences?"}
              </h2>
            </div>
            <p className="text-muted-foreground ml-[52px]">
              {currentStep === 1 && "This helps us calculate your nutritional needs"}
              {currentStep === 2 && "We'll create a plan tailored to your objectives"}
              {currentStep === 3 && "Your activity level affects calorie requirements"}
              {currentStep === 4 && "Optional but helps us give better recommendations"}
            </p>
          </div>

          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-foreground">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="10"
                    max="120"
                    placeholder="25"
                    value={data.age || ''}
                    onChange={(e) => updateData('age', e.target.value ? Number(e.target.value) : undefined)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Gender</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ].map((g) => (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => updateData('gender', g.value)}
                        className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${data.gender === g.value
                          ? 'border-primary bg-primary text-white'
                          : 'border-border hover:border-primary/50'
                          }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-foreground">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    min="100"
                    max="250"
                    placeholder="170"
                    value={data.heightCm || ''}
                    onChange={(e) => updateData('heightCm', e.target.value ? Number(e.target.value) : undefined)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-foreground">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="30"
                    max="300"
                    step="0.1"
                    placeholder="70"
                    value={data.currentWeightKg || ''}
                    onChange={(e) => updateData('currentWeightKg', e.target.value ? Number(e.target.value) : undefined)}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="text-foreground">Country</Label>
                <select
                  id="country"
                  value={data.country}
                  onChange={(e) => updateData('country', e.target.value)}
                  className="w-full h-12 px-3 rounded-lg border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="target-weight" className="text-foreground">Target Weight (kg)</Label>
                <Input
                  id="target-weight"
                  type="number"
                  min="30"
                  max="300"
                  step="0.1"
                  placeholder="65"
                  value={data.targetWeightKg || ''}
                  onChange={(e) => updateData('targetWeightKg', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-12"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-foreground">Select your goal</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'loss', label: 'Lose Weight', Icon: TrendingDown, desc: 'Burn fat', color: 'text-orange-500' },
                    { value: 'maintain', label: 'Maintain', Icon: Scale, desc: 'Stay fit', color: 'text-blue-500' },
                    { value: 'gain', label: 'Build Muscle', Icon: Dumbbell, desc: 'Gain mass', color: 'text-purple-500' },
                  ].map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => updateData('goal', goal.value)}
                      className={`p-5 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${data.goal === goal.value
                        ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${data.goal === goal.value ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center mx-auto mb-3`}>
                        <goal.Icon className={`w-5 h-5 ${data.goal === goal.value ? 'text-primary' : goal.color}`} />
                      </div>
                      <div className="font-semibold text-foreground">{goal.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{goal.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Activity Level */}
          {currentStep === 3 && (
            <div className="space-y-3">
              {[
                { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise', Icon: Sofa },
                { value: 'lightly_active', label: 'Lightly Active', desc: 'Exercise 1-3 days/week', Icon: PersonStanding },
                { value: 'moderately_active', label: 'Moderately Active', desc: 'Exercise 3-5 days/week', Icon: Bike },
                { value: 'very_active', label: 'Very Active', desc: 'Exercise 6-7 days/week', Icon: Flame },
                { value: 'extremely_active', label: 'Athlete', desc: 'Physical job or twice daily training', Icon: Trophy },
              ].map((activity) => (
                <button
                  key={activity.value}
                  type="button"
                  onClick={() => updateData('activityLevel', activity.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] flex items-center gap-4 ${data.activityLevel === activity.value
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full ${data.activityLevel === activity.value ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center shrink-0`}>
                    <activity.Icon className={`w-5 h-5 ${data.activityLevel === activity.value ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{activity.label}</div>
                    <div className="text-sm text-muted-foreground">{activity.desc}</div>
                  </div>
                  {data.activityLevel === activity.value && (
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Dietary Preferences</Label>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {commonDietaryPrefs.map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => toggleArrayItem('dietaryPreferences', pref)}
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${data.dietaryPreferences.includes(pref)
                        ? 'border-primary bg-primary text-white font-medium'
                        : 'border-border hover:border-primary/50'
                        }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Allergies</Label>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {commonAllergies.map((allergy) => (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleArrayItem('allergies', allergy)}
                      className={`p-3 rounded-lg border-2 text-sm transition-all ${data.allergies.includes(allergy)
                        ? 'border-red-500 bg-red-500 text-white font-medium'
                        : 'border-border hover:border-red-500/50'
                        }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="h-12 px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === steps.length ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-12 px-8 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <Apple className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} className="h-12 px-8">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;