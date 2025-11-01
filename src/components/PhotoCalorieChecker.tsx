// src/components/PhotoCalorieChecker.tsx

import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/profile";
import { Camera, Upload, X, Loader2, Sparkles, Image as ImageIcon, Check, Crown, Lock } from "lucide-react";

interface NutritionData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  confidence: string;
}

interface PhotoCalorieCheckerProps {
  onAddMeal?: (meal: {
    name: string;
    mealType: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

const PhotoCalorieChecker = ({ onAddMeal }: PhotoCalorieCheckerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<NutritionData | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string>("lunch");
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Check if user has active Pro plan (only PRO, not PREMIUM)
  const isPro = useMemo(() => {
    if (!userProfile?.plan || userProfile.plan !== 'PRO') return false;
    const expires = (userProfile as any).planExpiresAt;
    if (!expires) return true; // No expiry = lifetime
    const expDate = (typeof expires?.toDate === 'function')
      ? expires.toDate()
      : (expires instanceof Date ? expires : new Date(expires));
    return expDate > new Date();
  }, [userProfile]);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        setUserProfile(null);
        return;
      }
      try {
        const profile = await profileService.getProfile(user.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setUserProfile(null);
      }
    };
    loadProfile();
  }, [user]);

  // Pro plan only - no free scans

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFoodImage = async () => {
    if (!image) return;

    // Check if user has Pro access
    if (!isPro) {
      toast({
        title: 'Pro feature required',
        description: 'Photo scanning is available for Pro users only. Upgrade to unlock this feature.',
        variant: 'destructive'
      });
      setIsOpen(false);
      navigate('/upgrade');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: `Analyze this food image and provide nutritional information in the following JSON format only, no additional text:
{
  "name": "Name of the dish",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": "description of serving size",
  "confidence": "High or Medium or Low"
}

Be as accurate as possible based on the visible portion size. If you're unsure, indicate "Medium" or "Low" confidence.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: image
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from API');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const nutritionData: NutritionData = JSON.parse(jsonMatch[0]);
      
      setResult(nutritionData);
      
      toast({
        title: 'Analysis complete!',
        description: `Found: ${nutritionData.name}`
      });
    } catch (error: any) {
      console.error('Error analyzing image:', error);
      
      let errorMessage = 'Please try again with a clearer image';
      
      if (error.message?.includes('API key')) {
        errorMessage = 'OpenAI API key not configured. Please check your environment variables.';
      } else if (error.message?.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message?.includes('quota')) {
        errorMessage = 'API quota exceeded. Please check your OpenAI account.';
      }
      
      toast({
        title: 'Analysis failed',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToLog = () => {
    if (!result || !onAddMeal) return;

    onAddMeal({
      name: result.name,
      mealType: selectedMealType,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat
    });

    setShowSuccess(true);
    
    setTimeout(() => {
      toast({
        title: 'Meal added!',
        description: `${result.name} added to ${selectedMealType}`
      });
      handleClose();
    }, 800);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setImage(null);
      setResult(null);
      setSelectedMealType("lunch");
      setShowSuccess(false);
    }, 200);
  };

  // Show upgrade prompt if not Pro user
  if (!isPro && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-4 w-4 text-primary" />
              </div>
              Pro Feature Required
            </DialogTitle>
            <CardDescription>
              Photo scanning is available for Pro users only
            </CardDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                Pro Plan Benefits
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>AI-powered food photo scanning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Instant nutrition analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>All Pro features for just ₦6,500/year</span>
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                onClick={() => {
                  setIsOpen(false);
                  navigate('/upgrade');
                }}
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Button 
        onClick={() => {
          if (!isPro) {
            toast({
              title: 'Pro feature required',
              description: 'Photo scanning is available for Pro users only.',
              variant: 'destructive'
            });
            navigate('/upgrade');
            return;
          }
          setIsOpen(true);
        }}
        className="gap-2 group hover:scale-105 transition-transform"
        size="lg"
      >
        <Camera className="h-4 w-4 group-hover:rotate-12 transition-transform" />
        Scan Food Photo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </div>
              AI Food Scanner
            </DialogTitle>
            <CardDescription>
              Upload a photo or take a picture of your meal for instant nutrition info
            </CardDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* Upload Area */}
            {!image && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="border-2 border-dashed border-border rounded-xl p-8 sm:p-12 text-center hover:border-primary hover:bg-primary/5 transition-all duration-300 group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:rotate-12 transition-transform" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">Take or Upload a Photo</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Get instant AI-powered nutrition estimates from food images
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => cameraInputRef.current?.click()}
                      size="lg"
                      className="gap-2 group/btn hover:scale-105 transition-all"
                    >
                      <Camera className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                      Take Photo
                    </Button>
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="lg"
                      className="gap-2 group/btn hover:scale-105 transition-all"
                    >
                      <ImageIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
                      Upload from Gallery
                    </Button>
                  </div>
                </div>

                {/* Tips Section */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-foreground">
                          💡 Tips for best results:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Take clear, well-lit photos showing the entire meal</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Include all items on the plate for accurate estimates</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-0.5">•</span>
                            <span>Place common objects (utensils, phone) for size reference</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Image Preview and Results */}
            {image && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative rounded-xl overflow-hidden border-2 border-border shadow-lg group">
                  <img 
                    src={image} 
                    alt="Food" 
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-3 right-3 shadow-lg hover:scale-110 transition-transform"
                    onClick={() => {
                      setImage(null);
                      setResult(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {!result && !isAnalyzing && (
                  <>
                    {!canScan ? (
                      <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="p-6 text-center space-y-4">
                          <p className="text-sm font-medium text-destructive">
                            Daily scan limit reached
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Free users can scan up to {FREE_SCAN_LIMIT} times per day. Upgrade to Premium for unlimited scans.
                          </p>
                          <Button
                            onClick={() => {
                              setIsOpen(false);
                              navigate('/upgrade');
                            }}
                            className="gap-2"
                            variant="default"
                          >
                            <Crown className="h-4 w-4" />
                            Upgrade to Premium
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button 
                        onClick={analyzeFoodImage}
                        className="w-full gap-2 h-12 text-base hover:scale-[1.02] transition-transform"
                        size="lg"
                      >
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        Analyze Food with AI
                      </Button>
                    )}
                  </>
                )}

                {isAnalyzing && (
                  <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 animate-in fade-in zoom-in-95 duration-500">
                    <CardContent className="flex items-center justify-center p-12">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                          <div className="absolute inset-0 animate-ping">
                            <Sparkles className="h-12 w-12 text-primary/30 mx-auto" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-base font-medium">Analyzing your food...</p>
                          <p className="text-sm text-muted-foreground">
                            AI is identifying ingredients and calculating nutrition
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Results */}
                {result && (
                  <Card className="border-2 border-primary/20 shadow-xl animate-in fade-in zoom-in-95 duration-500">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-xl sm:text-2xl mb-1 truncate">{result.name}</CardTitle>
                          <CardDescription className="text-sm">{result.servingSize}</CardDescription>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                          result.confidence === 'High' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : result.confidence === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                          {result.confidence} Confidence
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        {[
                          { label: 'Calories', value: result.calories, unit: '', color: 'orange' },
                          { label: 'Protein', value: result.protein, unit: 'g', color: 'blue' },
                          { label: 'Carbs', value: result.carbs, unit: 'g', color: 'green' },
                          { label: 'Fat', value: result.fat, unit: 'g', color: 'yellow' }
                        ].map((item, idx) => (
                          <div 
                            key={item.label}
                            className={`p-4 rounded-xl bg-${item.color}-50 border-2 border-${item.color}-200 hover:scale-105 transition-all duration-300 animate-in fade-in zoom-in-95`}
                            style={{ animationDelay: `${idx * 100}ms` }}
                          >
                            <p className={`text-xs font-semibold text-${item.color}-600 mb-1`}>{item.label}</p>
                            <p className={`text-2xl sm:text-3xl font-bold text-${item.color}-700`}>
                              {item.value}{item.unit}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Add to meal</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                            <Button
                              key={type}
                              variant={selectedMealType === type ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedMealType(type)}
                              className="capitalize hover:scale-105 transition-all"
                            >
                              {selectedMealType === type && (
                                <Check className="h-3 w-3 mr-1" />
                              )}
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={handleAddToLog}
                        className="w-full h-12 text-base gap-2 hover:scale-[1.02] transition-transform relative overflow-hidden group"
                        disabled={showSuccess}
                      >
                        {showSuccess ? (
                          <>
                            <Check className="h-5 w-5 animate-in zoom-in-50" />
                            Added!
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
                            Add to {selectedMealType}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Bottom Note */}
            {image && result && (
              <p className="text-xs text-center text-muted-foreground px-4 animate-in fade-in duration-700 delay-200">
                <strong>Note:</strong> Estimates are approximate and may vary. Always adjust if needed.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-from-bottom-4 {
          from { 
            opacity: 0;
            transform: translateY(1rem);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes zoom-in-95 {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
      `}</style>
    </>
  );
};

export default PhotoCalorieChecker;