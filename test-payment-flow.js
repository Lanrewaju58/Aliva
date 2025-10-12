// Test Payment Flow with Test Cards
const testPayment = async () => {
  console.log('🧪 Testing Payment Flow with Test Cards\n');

  try {
    // Generate a test payment URL
    const response = await fetch('http://localhost:5000/api/payments/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'PRO',
        interval: 'monthly',
        customerEmail: 'test@example.com',
        userId: 'test-user-123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment URL Generated Successfully!');
      console.log('🔗 Authorization URL:', data.authorizationUrl);
      console.log('📋 Reference:', data.reference);
      console.log('\n💳 Test Cards to Use:');
      console.log('Card Number: 4084084084084081');
      console.log('Expiry: 12/25 (any future date)');
      console.log('CVV: 408 (any 3 digits)');
      console.log('PIN: 1234');
      console.log('\n🌐 Open this URL in your browser to test:');
      console.log(data.authorizationUrl);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
};

testPayment();
