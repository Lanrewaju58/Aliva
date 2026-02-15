import fetch from 'node-fetch';

async function checkHealth() {
    try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error fetching health:', error.message);
    }
}

checkHealth();
