import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Target, 
  Activity, 
  Utensils, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { ActivityLevel, UserProfile } from "@/types/profile";

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
}

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Your Goals", icon: Target },
  { id: 3, title: "Activity Level", icon: Activity },
  { id: 4, title: "Preferences", icon: Utensils },
];

const commonDietaryPrefs = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free'];
const commonAllergies = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 'Shellfish'];

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (!data.age || !data.heightCm || !data.currentWeightKg || !data.gender || data.gender === '') {
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
      if (!data.age || !data.gender || data.gender === '' || !data.heightCm || !data.currentWeightKg) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      if (data.age < 10 || data.age > 120) {
        toast({
          title: "Invalid age",
          description: "Please enter a valid age between 10 and 120",
          variant: "destructive",
        });
        return;
      }
      if (data.heightCm < 100 || data.heightCm > 250) {
        toast({
          title: "Invalid height",
          description: "Please enter a valid height between 100 and 250 cm",
          variant: "destructive",
        });
        return;
      }
      if (data.currentWeightKg < 30 || data.currentWeightKg > 300) {
        toast({
          title: "Invalid weight",
          description: "Please enter a valid weight between 30 and 300 kg",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 2) {
      if (!data.targetWeightKg || !data.goal || data.goal === '') {
        toast({
          title: "Missing information",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      if (data.targetWeightKg < 30 || data.targetWeightKg > 300) {
        toast({
          title: "Invalid target weight",
          description: "Please enter a valid target weight between 30 and 300 kg",
          variant: "destructive",
        });
        return;
      }
    } else if (currentStep === 3) {
      if (!data.activityLevel || data.activityLevel === '') {
        toast({
          title: "Missing information",
          description: "Please select your activity level",
          variant: "destructive",
        });
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
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.svg" alt="Aliva Logo" className="h-10 w-auto" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Let's personalize your journey</h2>
          <p className="text-muted-foreground">
            We'll use this information to create your perfect nutrition plan
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isComplete
                          ? 'bg-primary text-primary-foreground'
                          : isActive
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className="text-xs mt-2 hidden sm:block">{step.title}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-1 h-1 mx-2 bg-muted rounded">
                      <div 
                        className="h-full bg-primary rounded transition-all duration-300" 
                        style={{ width: currentStep > step.id ? '100%' : '0%' }} 
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const Icon = steps[currentStep - 1].icon;
                return <Icon className="w-5 h-5" />;
              })()}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>Step {currentStep} of {steps.length}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      min="10"
                      max="120"
                      placeholder="25" 
                      value={data.age || ''} 
                      onChange={(e) => updateData('age', e.target.value ? Number(e.target.value) : undefined)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select 
                      value={data.gender} 
                      onValueChange={(value) => updateData('gender', value)}
                    >
                      <SelectTrigger id="gender">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm) *</Label>
                    <Input 
                      id="height" 
                      type="number" 
                      min="100"
                      max="250"
                      placeholder="170" 
                      value={data.heightCm || ''} 
                      onChange={(e) => updateData('heightCm', e.target.value ? Number(e.target.value) : undefined)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Current Weight (kg) *</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      min="30"
                      max="300"
                      step="0.1"
                      placeholder="70" 
                      value={data.currentWeightKg || ''} 
                      onChange={(e) => updateData('currentWeightKg', e.target.value ? Number(e.target.value) : undefined)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Goals */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target-weight">Target Weight (kg) *</Label>
                  <Input 
                    id="target-weight" 
                    type="number" 
                    min="30"
                    max="300"
                    step="0.1"
                    placeholder="65" 
                    value={data.targetWeightKg || ''} 
                    onChange={(e) => updateData('targetWeightKg', e.target.value ? Number(e.target.value) : undefined)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>What's your goal? *</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { value: 'loss', label: 'Lose Weight', icon: '📉' },
                      { value: 'maintain', label: 'Maintain', icon: '⚖️' },
                      { value: 'gain', label: 'Gain Muscle', icon: '💪' },
                    ].map((goal) => (
                      <button 
                        key={goal.value} 
                        type="button" 
                        onClick={() => updateData('goal', goal.value)} 
                        className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                          data.goal === goal.value 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{goal.icon}</div>
                        <div className="font-medium">{goal.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Activity Level */}
            {currentStep === 3 && (
              <div className="space-y-2">
                <Label>How active are you? *</Label>
                <div className="space-y-2">
                  {[
                    { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                    { value: 'lightly_active', label: 'Lightly Active', desc: 'Exercise 1-3 days/week' },
                    { value: 'moderately_active', label: 'Moderately Active', desc: 'Exercise 3-5 days/week' },
                    { value: 'very_active', label: 'Very Active', desc: 'Exercise 6-7 days/week' },
                    { value: 'extremely_active', label: 'Extremely Active', desc: 'Physical job or training twice/day' },
                  ].map((activity) => (
                    <button 
                      key={activity.value} 
                      type="button" 
                      onClick={() => updateData('activityLevel', activity.value)} 
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${
                        data.activityLevel === activity.value 
                          ? 'border-primary bg-primary/10 shadow-md' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-medium">{activity.label}</div>
                      <div className="text-sm text-muted-foreground">{activity.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Dietary Preferences (optional)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {commonDietaryPrefs.map((pref) => (
                      <button 
                        key={pref} 
                        type="button" 
                        onClick={() => toggleArrayItem('dietaryPreferences', pref)} 
                        className={`p-2 rounded-lg border text-sm transition-all hover:scale-105 ${
                          data.dietaryPreferences.includes(pref) 
                            ? 'border-primary bg-primary/10 font-medium shadow-sm' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {pref}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Allergies (optional)</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {commonAllergies.map((allergy) => (
                      <button 
                        key={allergy} 
                        type="button" 
                        onClick={() => toggleArrayItem('allergies', allergy)} 
                        className={`p-2 rounded-lg border text-sm transition-all hover:scale-105 ${
                          data.allergies.includes(allergy) 
                            ? 'border-destructive bg-destructive/10 font-medium shadow-sm' 
                            : 'border-border hover:border-destructive/50'
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
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {currentStep === steps.length ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting} 
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 mr-2 rounded-full border-2 border-background border-t-transparent animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Complete <Sparkles className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;