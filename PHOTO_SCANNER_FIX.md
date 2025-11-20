# Final Security Fix - PhotoCalorieChecker

## ⚠️ CRITICAL: One Security Issue Remains

Your `PhotoCalorieChecker.tsx` is still exposing the OpenAI API key to the browser.

## Quick Fix Instructions

### Step 1: Remove VITE_OPENAI_API_KEY from Vercel

1. Go to Vercel Dashboard → Settings → Environment Variables
2. **Delete** `VITE_OPENAI_API_KEY` (it should NOT have VITE_ prefix)
3. Keep `OPENAI_API_KEY` (without VITE_) - this stays server-side only

### Step 2: Add Backend Endpoint to server.js

Open `server.js` and add this code **after line 278** (after the `/api/chat` endpoint closes):

```javascript
// Food Image Analysis Endpoint
app.post('/api/analyze-food', async (req, res) => {
  const startTime = Date.now();

  try {
    const { image } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Image data is required'
      });
    }

    if (!openaiClient) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'AI service is temporarily unavailable'
      });
    }

    console.log(`🍔 Processing food image analysis`);

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: [
          { 
            type: "text", 
            text: `Analyze this food image and provide nutritional information in JSON format:
{
  "name": "Name of the dish",
  "calories": number,
  "protein": number (in grams),
  "carbs": number (in grams),
  "fat": number (in grams),
  "servingSize": "description",
  "confidence": "High or Medium or Low"
}`
          },
          {
            type: "image_url",
            image_url: { url: image }
          }
        ]
      }],
      max_tokens: 500,
      temperature: 0.3
    });

    const content = completion.choices[0]?.message?.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) throw new Error('Invalid response format');

    const nutritionData = JSON.parse(jsonMatch[0]);
    console.log(`✅ Food analysis completed in ${Date.now() - startTime}ms`);

    res.status(200).json(nutritionData);

  } catch (error) {
    console.error('❌ Error in /api/analyze-food:', error);
    res.status(500).json({
      error: 'Failed to analyze image',
      ...(CONFIG.NODE_ENV === 'development' && { details: error.message })
    });
  }
});
```

### Step 3: Update PhotoCalorieChecker.tsx

Replace the `analyzeFoodImage` function (lines 103-214) with:

```typescript
const analyzeFoodImage = async () => {
  if (!image) return;

  if (!isPro) {
    toast({
      title: 'Pro feature required',
      description: 'Photo scanning is available for Pro users only.',
      variant: 'destructive'
    });
    setIsOpen(false);
    navigate('/upgrade');
    return;
  }

  setIsAnalyzing(true);
  
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';
    
    const response = await fetch(`${apiBase}/api/analyze-food`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    const nutritionData: NutritionData = await response.json();
    setResult(nutritionData);
    
    toast({
      title: 'Analysis complete!',
      description: `Found: ${nutritionData.name}`
    });
  } catch (error: any) {
    console.error('Error analyzing image:', error);
    
    toast({
      title: 'Analysis failed',
      description: error.message?.includes('Service') 
        ? 'Service temporarily unavailable. Please try again later.'
        : 'Please try again with a clearer image',
      variant: 'destructive'
    });
  } finally {
    setIsAnalyzing(false);
  }
};
```

## ✅ After These Changes

- ✅ OpenAI API key stays server-side only
- ✅ No API keys exposed to browser
- ✅ Food scanning works through secure backend
- ✅ All security issues resolved!

## Test It

```bash
# Start backend
npm run dev:server

# Start frontend  
npm run dev

# Test food scanning in the app
```
