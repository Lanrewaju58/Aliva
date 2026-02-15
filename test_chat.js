import fetch from 'node-fetch';

async function testChat() {
    try {
        const response = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Hello, are you working?',
                chatHistory: []
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        if (response.ok) {
            console.log('Response:', data.response ? 'Received Response' : 'No Response Field');
        } else {
            console.log('Error:', JSON.stringify(data));
        }
    } catch (error) {
        console.error('Request Failed:', error.message);
    }
}

testChat();
