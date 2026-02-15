const axios = require('axios');

// Configuration
const AI_URL = 'http://localhost:8001/verify';  // adjust if different
const sampleClaim = 'COVID vaccines are unsafe';

async function testAI() {
  try {
    console.log(`📤 Sending claim: "${sampleClaim}" to ${AI_URL}...`);
    
    const response = await axios.post(AI_URL, { claim: sampleClaim });
    
    console.log('\n✅ AI Response received:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('\n❌ Error calling AI:');
    if (error.code === 'ECONNREFUSED') {
      console.error(`   Could not connect to ${AI_URL}. Make sure your AI service is running on port 8001.`);
    } else if (error.response) {
      // The request was made and the server responded with a status code outside 2xx
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('   No response received from AI service.');
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testAI();