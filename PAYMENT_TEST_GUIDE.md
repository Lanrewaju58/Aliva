# 💳 Payment Testing Guide

## 🧪 Test Payment Flow

### 1. **Generate Test Payment URL**
Run this command to get a fresh test URL:
```bash
node test-payment-flow.js
```

### 2. **Paystack Test Cards**

#### ✅ **Successful Payment**
- **Card Number:** `4084084084084081`
- **Expiry:** `12/25` (any future date)
- **CVV:** `408` (any 3 digits)
- **PIN:** `1234`

#### ❌ **Test Different Scenarios**
- **Insufficient Funds:** `4084084084084085`
- **Declined Card:** `4084084084084086`
- **3D Secure:** `4084084084084087`

### 3. **Test Different Plans**

#### PRO Plans:
- **Monthly:** ₦9,990.00
- **Yearly:** ₦99,000.00

#### PREMIUM Plans:
- **Monthly:** ₦19,990.00
- **Yearly:** ₦199,000.00

### 4. **What to Test**

1. **Payment Initialization** ✅
   - Generate authorization URL
   - Check metadata includes userId

2. **Payment Processing** 🧪
   - Use test cards on Paystack checkout
   - Test successful payment
   - Test declined payment

3. **Webhook Processing** ⚠️
   - Only works in production (Vercel)
   - Local development won't update profiles

### 5. **Expected Flow**

1. **User clicks upgrade** → Frontend sends request with userId
2. **Server creates Paystack transaction** → Returns authorization URL
3. **User completes payment** → Paystack processes with test card
4. **Webhook fires** → Updates user profile in Firestore (production only)

### 6. **Testing Commands**

```bash
# Generate test payment URL
node test-payment-flow.js

# Test different plans
curl -X POST http://localhost:5000/api/payments/init \
  -H "Content-Type: application/json" \
  -d '{"plan":"PREMIUM","interval":"yearly","customerEmail":"test@example.com","userId":"test-user-123"}'
```

### 7. **Production Testing**

For complete testing including webhooks:
1. Deploy to Vercel
2. Set up Paystack webhook URL
3. Test full payment flow
4. Verify profile updates in Firestore

## 🎯 Current Status: ✅ Ready for Testing!
