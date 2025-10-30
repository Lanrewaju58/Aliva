// src/components/PhotoCalorieChecker.tsx

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Loader2, Sparkles } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

    setIsAnalyzing(true);
    
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
      }

      // Call OpenAI GPT-4 Vision API
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

      // Parse the JSON response
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

    toast({
      title: 'Meal added',
      description: `${result.name} added to ${selectedMealType}`
    });

    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setImage(null);
    setResult(null);
    setSelectedMealType("lunch");
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Camera className="h-4 w-4" />
        Scan Food Photo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Food Scanner
            </DialogTitle>
            <CardDescription>
              Upload a photo of your meal to get instant nutrition information
            </CardDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Area */}
            {!image && (
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Take or Upload a Photo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant nutrition estimates from food images
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.capture = "environment";
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {image && (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden border-2 border-border">
                  <img 
                    src={image} 
                    alt="Food" 
                    className="w-full h-64 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImage(null);
                      setResult(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {!result && !isAnalyzing && (
                  <Button 
                    onClick={analyzeFoodImage}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Food
                  </Button>
                )}

                {isAnalyzing && (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Analyzing your food...
                      </p>
                    </div>
                  </div>
                )}

                {/* Results */}
                {result && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{result.name}</CardTitle>
                          <CardDescription>{result.servingSize}</CardDescription>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          result.confidence === 'High' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {result.confidence} Confidence
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                          <p className="text-xs text-orange-600 font-medium">Calories</p>
                          <p className="text-2xl font-bold text-orange-700">{result.calories}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium">Protein</p>
                          <p className="text-2xl font-bold text-blue-700">{result.protein}g</p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                          <p className="text-xs text-green-600 font-medium">Carbs</p>
                          <p className="text-2xl font-bold text-green-700">{result.carbs}g</p>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                          <p className="text-xs text-yellow-600 font-medium">Fat</p>
                          <p className="text-2xl font-bold text-yellow-700">{result.fat}g</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Add to meal</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                            <Button
                              key={type}
                              variant={selectedMealType === type ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedMealType(type)}
                              className="capitalize"
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={handleAddToLog}
                        className="w-full"
                      >
                        Add to {selectedMealType}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                <strong>💡 Tips for best results:</strong>
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Take clear, well-lit photos showing the entire meal</li>
                <li>Include all items on the plate for accurate estimates</li>
                <li>Avoid blurry or dark images</li>
                <li>Place common objects (utensils, phone) for size reference</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Note:</strong> Estimates are approximate and may vary based on portion sizes, 
                ingredients, and preparation methods. Always adjust if needed.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoCalorieChecker;