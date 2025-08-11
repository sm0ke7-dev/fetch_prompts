// Test script for our service layer
require('dotenv').config({ path: '.local.env' });

// Import our compiled services
const { processInputs, submitPrompt } = require('./dist/services');
const { fetchPromptByName } = require('./dist/repositories/fetch_prompt');

async function testServices() {
  console.log('🧪 Testing Service Layer...\n');

  try {
    // Test 1: Fetch prompt configuration
    console.log('1️⃣ Testing prompt fetching...');
    const promptResult = await fetchPromptByName('prompts');
    
    if (promptResult.success) {
      console.log('✅ Prompt fetched successfully');
      console.log(`   Model: ${promptResult.data.model}`);
      console.log(`   System: ${promptResult.data.system.substring(0, 50)}...`);
    } else {
      console.log('❌ Failed to fetch prompt:', promptResult.message);
      return;
    }

    // Test 2: Process inputs
    console.log('\n2️⃣ Testing input processing...');
    const processResult = await processInputs({
      userInput: { keyword: 'artificial intelligence' },
      promptName: 'prompts'
    });

    if (processResult.success) {
      console.log('✅ Input processing successful');
      console.log(`   Processed user message: ${processResult.data.processedUserMessage}`);
      console.log(`   Variables:`, processResult.data.variables);
    } else {
      console.log('❌ Failed to process inputs:', processResult.message);
      return;
    }

    // Test 3: Submit to OpenAI
    console.log('\n3️⃣ Testing OpenAI submission...');
    const submitResult = await submitPrompt({
      processedInput: processResult.data,
      promptConfig: {
        model: promptResult.data.model,
        temperature: promptResult.data.temperature,
        max_tokens: promptResult.data.max_tokens,
        top_p: promptResult.data.top_p,
        frequency_penalty: promptResult.data.frequency_penalty,
        presence_penalty: promptResult.data.presence_penalty,
        outputSchema: promptResult.data['output-schema']
      }
    });

    if (submitResult.success) {
      console.log('✅ OpenAI submission successful!');
      console.log(`   Tokens used: ${submitResult.data.usage.total_tokens}`);
      console.log('\n📄 Raw AI Response:');
      console.log('=' * 50);
      console.log(submitResult.data.content);
      console.log('=' * 50);
      
      // Try to parse as JSON if it's structured
      try {
        const parsedContent = JSON.parse(submitResult.data.content);
        console.log('\n🔍 Parsed JSON Structure:');
        console.log(JSON.stringify(parsedContent, null, 2));
      } catch (parseError) {
        console.log('\n⚠️  Response is not valid JSON - it\'s plain text');
      }
    } else {
      console.log('❌ Failed to submit to OpenAI:', submitResult.message);
    }

    console.log('\n🎉 Service layer test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testServices();
