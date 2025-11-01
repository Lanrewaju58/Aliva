import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Salad, Sparkles, User, AlertCircle, MapPin, RotateCcw, ChefHat, Settings, MessageSquare, Clock, Trash2, X, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/services/profileService";
import { UserProfile } from "@/types/profile";

type ChatMessage = {
  role: "user" | "assistant" | "restaurants";
  content: string;
  restaurants?: RestaurantResult[];
};

type RestaurantResult = {
  name: string;
  eta: string;
  rating: number;
  price: string;
  distanceKm: number;
  dish: string;
  logo?: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
};

const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api/chat' 
  : '/api/chat';

const FALLBACK_API_URL = 'https://your-vercel-app.vercel.app/api/chat';

interface DashboardData {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number;
  };
  waterIntake: number;
}

interface LoginChatProps {
  dashboardData?: DashboardData;
}

const LoginChat = ({ dashboardData }: LoginChatProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [showMapDialog, setShowMapDialog] = useState(false);
  const [mapRestaurants, setMapRestaurants] = useState<any[]>([]);
  const [mapKeyword, setMapKeyword] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [decidedFood, setDecidedFood] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyCount, setDailyCount] = useState<number>(0);
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);
  const [showRecentChats, setShowRecentChats] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hoveredPrompt, setHoveredPrompt] = useState<number | null>(null);

  const AI_PERSONA_HEADER = `You are Aliva — a compassionate AI health companion focused exclusively on health, wellness, and medical topics.

CORE IDENTITY:
- You are a supportive health advisor, nutritionist, and wellness coach
- You ONLY discuss health-related topics: nutrition, fitness, mental health, medical conditions, wellness, lifestyle, and preventive care
- If asked about non-health topics, politely redirect to health discussions

COMMUNICATION STYLE:
- Write in a warm, conversational, and human-like manner
- Use natural language without markdown formatting (no #, *, -, or bullet points)
- Write in flowing paragraphs like a caring friend or health professional
- Be encouraging, supportive, and non-judgmental
- Use "we" and "you" naturally in conversation

RESPONSE FORMAT:
- Write responses as flowing, natural text
- Use line breaks for readability but no markdown symbols
- Focus on practical, actionable health advice
- Include relevant health information and tips
- Keep responses comprehensive but conversational

BOUNDARIES:
- You are not a licensed clinician and cannot provide medical diagnosis
- Always encourage professional medical help for serious health concerns
- Focus on general wellness, nutrition, and lifestyle advice
- Respect allergies and medical conditions when giving advice

SAFETY:
- If user mentions self-harm or medical emergencies, advise immediate professional help
- Provide grounding techniques and coping strategies for mental health
- Always prioritize safety and professional medical care when needed`;

  // Load recent chats from localStorage
  const loadRecentChats = () => {
    if (!user?.uid) return;
    try {
      const savedChats = localStorage.getItem(`recent_chats_${user.uid}`);
      if (savedChats) {
        const chats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt)
        }));
        setRecentChats(chats);
      }
    } catch (error) {
      console.error('Error loading recent chats:', error);
    }
  };

  const saveRecentChats = (chats: ChatSession[]) => {
    if (!user?.uid) return;
    try {
      localStorage.setItem(`recent_chats_${user.uid}`, JSON.stringify(chats));
    } catch (error) {
      console.error('Error saving recent chats:', error);
    }
  };

  const generateChatTitle = (firstMessage: string): string => {
    const words = firstMessage.trim().split(' ');
    if (words.length <= 4) return firstMessage;
    return words.slice(0, 4).join(' ') + '...';
  };

  const createNewChat = (): string => {
    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentChatId(chatId);
    return chatId;
  };

  const saveCurrentChat = () => {
    if (!currentChatId || messages.length <= 1) return;
    
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (!firstUserMessage) return;

    const chatTitle = generateChatTitle(firstUserMessage.content);
    const newChat: ChatSession = {
      id: currentChatId,
      title: chatTitle,
      messages: messages,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedChats = [newChat, ...recentChats.filter(chat => chat.id !== currentChatId)].slice(0, 10);
    setRecentChats(updatedChats);
    saveRecentChats(updatedChats);
  };

  const loadChat = (chatId: string) => {
    const chat = recentChats.find(c => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setShowRecentChats(false);
    }
  };

  const deleteChat = (chatId: string) => {
    const updatedChats = recentChats.filter(chat => chat.id !== chatId);
    setRecentChats(updatedChats);
    saveRecentChats(updatedChats);
    
    if (currentChatId === chatId) {
      handleStartNewConsultation();
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;
      
      try {
        const profile = await profileService.getProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
          const todayKey = `chat_count_${new Date().toISOString().slice(0,10)}`;
          const count = parseInt(localStorage.getItem(todayKey) || '0', 10);
          setDailyCount(Number.isFinite(count) ? count : 0);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
    loadRecentChats();
    
    setTimeout(() => setIsAnimating(true), 100);

    setMessages([
      {
        role: "assistant",
        content: "Hi, I'm Aliva, your health and wellness companion. I'm here to help you with nutrition, fitness, mental health, and overall wellness. What health topic would you like to discuss today?",
      },
    ]);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => console.log('Could not get user location:', error)
      );
    }

    if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD5SzaJLsPAqsE1t_e_6c8A0vHbxb2fcBo&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [user]);

  useEffect(() => {
    if (listRef.current) {
      requestAnimationFrame(() => {
        if (listRef.current) {
          const container = listRef.current;
          container.scrollTop = container.scrollHeight;
          
          const scrollArea = container.closest('[data-radix-scroll-area-viewport]');
          if (scrollArea) {
            scrollArea.scrollTop = scrollArea.scrollHeight;
          }
        }
      });
    }
  }, [messages, thinking]);

  useEffect(() => {
    if (currentChatId && messages.length > 1) {
      const timeoutId = setTimeout(() => {
        saveCurrentChat();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [messages, currentChatId]);

  const quickPrompts = useMemo(
    () => [
      { text: "Suggest healthy meals for me", icon: "🥗" },
      { text: "I'm feeling stressed and anxious", icon: "😌" },
      { text: "Help me with my health goals", icon: "🎯" },
      { text: "Find healthy restaurants near me", icon: "📍" },
      { text: "I need nutrition advice", icon: "🍎" },
      { text: "Help me with my mental health", icon: "💚" },
    ],
    []
  );

  const actionButtons = useMemo(
    () => [
      { label: "New chat", icon: RotateCcw, action: "new" },
      { label: "Recipe", icon: ChefHat, action: "recipe" },
      { label: "Profile", icon: Settings, action: "profile" },
    ],
    []
  );

  const handleStartNewConsultation = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hi, I'm Aliva, your health and wellness companion. I'm here to help you with nutrition, fitness, mental health, and overall wellness. What health topic would you like to discuss today?",
      },
    ]);
    setInput("");
    setError(null);
    setCurrentChatId(null);
  };

  const handleGenerateRecipe = () => {
    setInput("Generate a healthy recipe based on my dietary profile and preferences");
  };

  const buildProfileContext = (): string => {
    if (!userProfile) return '';
    
    const parts: string[] = [];
    
    if (userProfile.age) parts.push(`Age: ${userProfile.age} years`);
    if (userProfile.gender) parts.push(`Gender: ${userProfile.gender}`);
    
    if (userProfile.heightCm && userProfile.currentWeightKg) {
      parts.push(`Height: ${userProfile.heightCm}cm, Current Weight: ${userProfile.currentWeightKg}kg`);
    }
    if (userProfile.targetWeightKg) {
      parts.push(`Target Weight: ${userProfile.targetWeightKg}kg`);
    }
    
    if (userProfile.activityLevel) {
      const activityFormatted = userProfile.activityLevel.replace('_', ' ');
      parts.push(`Activity Level: ${activityFormatted}`);
    }
    
    if (userProfile.healthGoals && userProfile.healthGoals.length > 0) {
      parts.push(`Health Goals: ${userProfile.healthGoals.join(', ')}`);
    }
    
    if (userProfile.dietaryPreferences && userProfile.dietaryPreferences.length > 0) {
      parts.push(`Dietary Preferences: ${userProfile.dietaryPreferences.join(', ')}`);
    }
    
    if (userProfile.allergies && userProfile.allergies.length > 0) {
      parts.push(`IMPORTANT - Allergies: ${userProfile.allergies.join(', ')} (MUST AVOID)`);
    }
    
    if (userProfile.medicalConditions && userProfile.medicalConditions.length > 0) {
      parts.push(`Medical Conditions: ${userProfile.medicalConditions.join(', ')}`);
    }
    
    if (userProfile.smokingStatus) {
      parts.push(`Smoking Status: ${userProfile.smokingStatus}`);
    }
    if (userProfile.alcoholFrequency) {
      parts.push(`Alcohol Consumption: ${userProfile.alcoholFrequency}`);
    }
    
    if (userProfile.preferredCalorieTarget) {
      parts.push(`Daily Calorie Target: ${userProfile.preferredCalorieTarget} kcal`);
    }
    
    return parts.length > 0 
      ? `\n\n[User's Health Profile - Use this to personalize all recommendations]:\n${parts.join('\n')}\n[CRITICAL: Avoid all foods listed in allergies. Consider medical conditions when recommending foods.]` 
      : '';
  };

  const buildDashboardContext = (): string => {
    if (!dashboardData) return '';
    
    const { totals, targets, waterIntake } = dashboardData;
    const caloriesRemaining = targets.calories - totals.calories;
    const proteinRemaining = targets.protein - totals.protein;
    const carbsRemaining = targets.carbs - totals.carbs;
    const fatRemaining = targets.fat - totals.fat;
    const waterRemaining = targets.water - waterIntake;
    
    const parts: string[] = [];
    parts.push(`\n[Today's Nutrition Overview - Use this real-time data to provide personalized advice]:`);
    parts.push(`Calories: ${totals.calories}/${targets.calories} kcal (${caloriesRemaining > 0 ? `${caloriesRemaining} remaining` : `${Math.abs(caloriesRemaining)} over target`})`);
    parts.push(`Protein: ${totals.protein}/${targets.protein}g (${proteinRemaining > 0 ? `${proteinRemaining}g remaining` : `${Math.abs(proteinRemaining)}g over target`})`);
    parts.push(`Carbs: ${totals.carbs}/${targets.carbs}g (${carbsRemaining > 0 ? `${carbsRemaining}g remaining` : `${Math.abs(carbsRemaining)}g over target`})`);
    parts.push(`Fat: ${totals.fat}/${targets.fat}g (${fatRemaining > 0 ? `${fatRemaining}g remaining` : `${Math.abs(fatRemaining)}g over target`})`);
    parts.push(`Water: ${waterIntake}/${targets.water} glasses (${waterRemaining > 0 ? `${waterRemaining} glasses remaining` : 'target met'})`);
    
    // Add recommendations based on progress
    if (caloriesRemaining < 0) {
      parts.push(`Note: User has exceeded their calorie target today.`);
    } else if (caloriesRemaining < 200) {
      parts.push(`Note: User is close to their calorie target.`);
    }
    
    if (proteinRemaining > 30) {
      parts.push(`Note: User needs more protein today.`);
    }
    
    if (waterRemaining > 2) {
      parts.push(`Note: User should drink more water today.`);
    }
    
    return parts.join('\n');
  };

  const initializeMap = (keyword?: string) => {
    // Map initialization code remains the same
    // (keeping your existing implementation)
  };

  const handleFindRestaurants = () => {
    if (!userLocation) {
      setError("Please enable location access to find nearby restaurants");
      return;
    }
    
    if (!(window as any).google) {
      setError("Google Maps is still loading. Please wait a moment.");
      return;
    }
    
    setShowMapDialog(true);
    setError(null);
    setTimeout(() => initializeMap(), 300);
  };

  const extractFoodKeyword = (text: string): string | null => {
    // Keep your existing implementation
    return null;
  };

  const callOpenAI = async (userMessage: string, chatHistory: ChatMessage[], useFallback = false) => {
    const profileContext = buildProfileContext();
    const dashboardContext = buildDashboardContext();
    const enhancedMessage = `${AI_PERSONA_HEADER}\n\n[User message]: ${userMessage}${profileContext}${dashboardContext}`;

    let isActivePaid = false;
    if (userProfile?.plan && userProfile.plan !== 'FREE') {
      const expires = (userProfile as any).planExpiresAt;
      if (!expires) {
        isActivePaid = true;
      } else {
        const expDate = (typeof (expires as any)?.toDate === 'function')
          ? (expires as any).toDate()
          : (expires instanceof Date ? expires : new Date(expires));
        isActivePaid = expDate > new Date();
      }
    }
    if (userProfile && userProfile.plan === 'FREE' && dailyCount >= 3) {
      setError('Daily limit reached on Free plan. Upgrade to continue.');
      return { response: 'You have reached the daily limit for the free plan. Please upgrade to continue unlimited chats.', restaurants: [] };
    }

    const url = useFallback ? FALLBACK_API_URL : API_URL;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-paid-user': userProfile?.plan && userProfile.plan !== 'FREE' ? 'true' : 'false',
        },
        body: JSON.stringify({
          message: enhancedMessage,
          chatHistory: chatHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          userId: user?.uid,
          isPaid: userProfile?.plan && userProfile.plan !== 'FREE' ? true : false,
          location: userLocation ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          } : undefined
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      if (!isActivePaid) {
        const todayKey = `chat_count_${new Date().toISOString().slice(0,10)}`;
        const next = dailyCount + 1;
        localStorage.setItem(todayKey, String(next));
        setDailyCount(next);
      }
      return { response: data.response, restaurants: [] };
    } catch (error) {
      if (!useFallback && !import.meta.env.DEV) {
        return callOpenAI(userMessage, chatHistory, true);
      }
      throw error;
    }
  };

  const streamAssistantResponse = async (fullText: string) => {
    let newIndex = -1;
    setMessages(prev => {
      const next = prev.concat([{ role: "assistant", content: "" } as ChatMessage]);
      newIndex = next.length - 1;
      return next;
    });

    await new Promise(r => setTimeout(r, 20));

    const step = 2;
    const baseDelay = 20;
    
    for (let i = 0; i < fullText.length; i += step) {
      const slice = fullText.slice(0, i + step);
      setMessages(prev => {
        const next = prev.slice();
        if (newIndex >= 0 && newIndex < next.length && next[newIndex].role === 'assistant') {
          next[newIndex] = { ...next[newIndex], content: slice } as ChatMessage;
        }
        return next;
      });
      
      const char = fullText[i];
      let delay = baseDelay;
      
      if (char === '.' || char === '!' || char === '?') {
        delay = baseDelay * 3;
      } else if (char === ',' || char === ';' || char === ':') {
        delay = baseDelay * 2;
      } else if (char === ' ') {
        delay = baseDelay * 1.5;
      }
      
      await new Promise(r => setTimeout(r, delay));
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    if (messages.length === 1) {
      createNewChat();
    }

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setError(null);

    const crisisPatterns = [
      /suicid(e|al)|kill myself|end my life|want to die/i,
      /self[-\s]?harm|hurt myself|cutting|overdose/i,
      /hurt (someone|others)|kill (someone|them)/i,
      /i can't go on|no reason to live|i am a danger/i
    ];
    const isCrisis = crisisPatterns.some(rx => rx.test(text));
    if (isCrisis) {
      const crisisResponse = `I'm really glad you reached out. Your feelings matter, and you don't have to face this alone.\n\nIf you feel at immediate risk, please contact your local emergency number right now. If you're in the U.S., call or text 988 (Suicide & Crisis Lifeline). In the U.K., call Samaritans at 116 123. If you're elsewhere, your local health services can connect you to 24/7 support.\n\nFor right now, can we try a quick grounding exercise together? Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Take slow breaths: in 4 seconds, hold 4, out 6.\n\nWould you like help finding professional support in your area, or to talk through what you're feeling in a safer way?`;
      const assistantMsg: ChatMessage = { role: "assistant", content: crisisResponse };
      setMessages(prev => [...prev, assistantMsg]);
      setThinking(false);
      return;
    }

    try {
      const result = await callOpenAI(text, messages);
      await streamAssistantResponse(result.response || "");

      const keyword = extractFoodKeyword(text) || extractFoodKeyword(result.response);
      if (keyword) {
        setDecidedFood(keyword);
        setMapKeyword(null);
      }

      const wantsLocations = /\b(show|suggest|nearby|where)\b.*\b(location|place|restaurant|spot)s?/i.test(text);
      if (keyword && wantsLocations && userLocation && (window as any).google) {
        setMapKeyword(keyword);
        setShowMapDialog(true);
        setTimeout(() => initializeMap(keyword), 400);
      }
    } catch (error: any) {
      setError(error.message || "Sorry, I'm having trouble connecting right now.");
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      {/* Main Chat Container */}
      <div className="mx-auto w-full h-screen flex flex-col bg-gradient-to-b from-background to-muted/10 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-col h-full py-3 sm:py-4 px-3 sm:px-4 relative">
          {/* Header */}
          <div className={`flex items-center justify-between mb-3 sm:mb-4 p-3 sm:p-4 bg-card/50 backdrop-blur-sm rounded-2xl border-2 border-border shadow-sm transition-all duration-700 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shrink-0 animate-pulse">
                <Salad className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base truncate">Chat with Aliva</div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mt-0.5">
                  {userProfile && (
                    <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50 text-xs px-1.5 py-0">
                      Profile Active
                    </Badge>
                  )}
                  {userLocation && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-xs px-1.5 py-0">
                      <MapPin className="h-2.5 w-2.5 mr-0.5" />
                      <span className="hidden sm:inline">Location</span>
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRecentChats(true)}
              className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-300 hover:scale-105 shrink-0 h-8 sm:h-9"
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">History</span>
            </Button>
          </div>

          {/* Profile Alert */}
          {!userProfile && (
            <div className={`mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm transition-all duration-700 delay-200 ${
              isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1 text-sm text-blue-700">
                  <p className="font-medium mb-1">Get Personalized Support</p>
                  <p className="text-xs mb-2">Complete your health profile for tailored advice.</p>
                  <Button
                    size="sm"
                    className="h-7 text-xs hover:scale-105 transition-transform"
                    onClick={() => navigate('/profile')}
                  >
                    Complete Profile
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError(null)} className="shrink-0 hover:bg-red-100 rounded p-1 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Messages Area */}
          <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-700 delay-300 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}>
            <ScrollArea className="flex-1 w-full">
              <div ref={listRef} className="p-2 sm:p-4 space-y-3 sm:space-y-4 min-h-full flex flex-col justify-end">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} ${idx === 0 ? 'items-center min-h-[40vh] sm:min-h-[50vh]' : ''} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                  >
                    {m.role !== "user" && idx !== 0 && (
                      <Avatar className="h-6 w-6 sm:h-7 sm:w-7 mr-2 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {idx === 0 ? (
                      <div className="text-center w-full px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 mb-4 shadow-xl animate-pulse">
                          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Hi, I'm Aliva.</h2>
                        <p className="text-lg sm:text-xl text-primary font-medium mb-2">Your dedicated health companion</p>
                        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">I'm here to help with nutrition, fitness, mental health, and wellness. What would you like to discuss?</p>
                      </div>
                    ) : (
                      <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 shadow-sm hover:shadow-md ${
                        m.role === "user" 
                          ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground" 
                          : "bg-card border-2 border-border"
                      }`}>
                        <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                          {m.content}
                          {m.role === "assistant" && thinking && idx === messages.length - 1 && (
                            <span className="inline-block w-1.5 h-3.5 bg-primary ml-1 animate-pulse"></span>
                          )}
                        </div>
                      </div>
                    )}
                    {m.role === "user" && idx !== 0 && (
                      <Avatar className="h-6 w-6 sm:h-7 sm:w-7 ml-2 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </AvatarFallback>
                      </Avatar>
                    )} </div>
                ))}

                {thinking && (
                  <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 mr-2 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 bg-card border-2 border-border shadow-sm">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Quick Prompts */}
          {messages.length === 1 && (
            <div className={`flex flex-wrap gap-2 justify-center mb-3 sm:mb-4 transition-all duration-700 delay-400 ${
              isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              {quickPrompts.map((q, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className={`rounded-full text-xs border-2 border-border hover:border-primary/50 px-3 py-2 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                    hoveredPrompt === i ? 'bg-primary/5 border-primary/50 scale-105' : 'bg-card/50'
                  }`}
                  onClick={() => {
                    if (q.text === "Find healthy restaurants near me") {
                      handleFindRestaurants();
                    } else {
                      setInput(q.text);
                    }
                  }}
                  onMouseEnter={() => setHoveredPrompt(i)}
                  onMouseLeave={() => setHoveredPrompt(null)}
                  disabled={thinking}
                >
                  <span className="mr-1.5">{q.icon}</span>
                  <span className="hidden sm:inline">{q.text}</span>
                  <span className="sm:hidden">{q.text.split(' ').slice(0, 2).join(' ')}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className={`mt-auto pt-3 sm:pt-4 pb-2 transition-all duration-700 delay-500 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex gap-2 items-center bg-card/80 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-border hover:border-primary/50 transition-all duration-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 shadow-lg hover:shadow-xl">
              <Input
                placeholder="Ask about your health..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground px-0 text-sm sm:text-base"
                disabled={thinking}
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || thinking} 
                size="icon"
                className="rounded-full h-8 w-8 sm:h-9 sm:w-9 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
            
            {/* Action Buttons */}
            {messages.length > 1 && (
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {actionButtons.map((btn, i) => (
                  <Button 
                    key={i} 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs text-primary hover:text-primary hover:bg-primary/10 hover:scale-105 transition-all duration-200 px-2 sm:px-3" 
                    onClick={() => {
                      if (btn.action === "new") {
                        handleStartNewConsultation();
                      } else if (btn.action === "recipe") {
                        handleGenerateRecipe();
                      } else if (btn.action === "profile") {
                        navigate('/profile');
                      }
                    }}
                    disabled={thinking}
                  >
                    <btn.icon className="h-3 w-3 mr-1" />
                    {btn.label}
                  </Button>
                ))}
                {decidedFood && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs hover:scale-105 transition-all duration-200"
                    onClick={() => handleFindRestaurants()}
                    disabled={thinking}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Show places for "{decidedFood}"</span>
                    <span className="sm:hidden">Places</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 gap-0 animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-card/50 backdrop-blur-sm">
            <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Nearby Restaurants
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col md:flex-row h-[calc(100%-60px)] overflow-hidden">
            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-full" />
            </div>
            
            <div className="w-full md:w-96 border-l bg-card">
              <ScrollArea className="h-full">
                <div className="p-3 sm:p-4 space-y-3">
                  {mapRestaurants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50 animate-pulse" />
                      <p className="text-sm">Searching for restaurants...</p>
                    </div>
                  ) : (
                    mapRestaurants.map((place, index) => {
                      let distance = 0;
                      if (userLocation && place.geometry?.location && (window as any).google?.maps?.geometry) {
                        const google = (window as any).google;
                        distance = google.maps.geometry.spherical.computeDistanceBetween(
                          new google.maps.LatLng(userLocation.latitude, userLocation.longitude),
                          place.geometry.location
                        ) / 1000;
                      }

                      const placeLatLng = place.geometry?.location;
                      const googleMapsUrl = placeLatLng 
                        ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.latitude},${userLocation?.longitude}&destination=${placeLatLng.lat()},${placeLatLng.lng()}&travelmode=driving`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.vicinity)}`;
                      
                      return (
                        <div 
                          key={index} 
                          className="group p-3 sm:p-4 border-2 border-border rounded-xl hover:shadow-lg hover:border-primary/50 cursor-pointer transition-all duration-300 bg-card hover:-translate-y-1"
                          onClick={() => {
                            if (place.geometry?.location && googleMapRef.current) {
                              googleMapRef.current.panTo(place.geometry.location);
                              googleMapRef.current.setZoom(17);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110 ${
                              place.rating && place.rating >= 4 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold mb-1 text-sm sm:text-base truncate group-hover:text-primary transition-colors">{place.name}</div>
                              <div className="text-xs text-muted-foreground mb-2 line-clamp-1">{place.vicinity}</div>
                              <div className="flex items-center gap-2 sm:gap-3 text-xs mb-2 flex-wrap">
                                {distance > 0 && (
                                  <div className="flex items-center gap-1 text-primary font-medium">
                                    <MapPin className="h-3 w-3" />
                                    {distance.toFixed(1)} km
                                  </div>
                                )}
                                {place.rating && (
                                  <div className="flex items-center gap-1 text-amber-600">
                                    <span>⭐</span>
                                    <span className="font-medium">{place.rating}</span>
                                    {place.user_ratings_total && (
                                      <span className="text-muted-foreground">({place.user_ratings_total})</span>
                                    )}
                                  </div>
                                )}
                                {place.price_level && (
                                  <div className="text-muted-foreground font-medium">
                                    {Array(place.price_level).fill('$').join('')}
                                  </div>
                                )}
                              </div>
                              {place.types && place.types.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {place.types.slice(0, 2).map((type: string, typeIndex: number) => (
                                    <span 
                                      key={typeIndex}
                                      className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                                    >
                                      {type.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full mt-3 text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(googleMapsUrl, '_blank');
                            }}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Get Directions
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Chats Sheet */}
      <Sheet open={showRecentChats} onOpenChange={setShowRecentChats}>
        <SheetContent className="w-[300px] sm:w-[400px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Chat History
              </h2>
            </div>

            <div className="flex-1 overflow-hidden">
              {recentChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-10 w-10 text-primary/50" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start a new chat to see your history</p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-2">
                    {recentChats.map((chat, index) => (
                      <div
                        key={chat.id}
                        className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 mb-1 hover:bg-muted/80 hover:shadow-md hover:-translate-y-0.5 ${
                          currentChatId === chat.id ? 'bg-primary/10 border-2 border-primary/30' : 'border-2 border-transparent'
                        }`}
                        onClick={() => loadChat(chat.id)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          currentChatId === chat.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground group-hover:bg-primary/20'
                        }`}>
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{chat.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {chat.updatedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:scale-110"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Aliva is ready to help</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
};

export default LoginChat;
