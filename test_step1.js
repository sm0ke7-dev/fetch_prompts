const { fetchPromptByName } = require('./dist/repositories/fetch_prompt');
const { processInputs } = require('./dist/services/process_input');
const { submitPrompt } = require('./dist/services/submit_prompt');

async function testStep1() {
  try {
    console.log('🚀 Testing Step 1: Idea Generation');
    console.log('Keyword: hvac maintenance\n');

    // Step 1: Fetch the prompt
    console.log('📋 Step 1: Fetching step1_idea_generation prompt...');
    const promptResult = await fetchPromptByName('step1_idea_generation');
    
    if (!promptResult.success) {
      console.error('❌ Failed to fetch prompt:', promptResult.message);
      return;
    }
    console.log('✅ Prompt fetched successfully\n');

    // Step 2: Process inputs
    console.log('📝 Step 2: Processing input substitution...');
    const processResult = await processInputs({
      userInput: { keyword: 'hvac maintenance' },
      promptName: 'step1_idea_generation'
    });

    if (!processResult.success) {
      console.error('❌ Failed to process inputs:', processResult.message);
      return;
    }
    console.log('✅ Inputs processed successfully\n');

    // Step 3: Submit to OpenAI
    console.log('🤖 Step 3: Submitting to OpenAI API...');
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

    if (!submitResult.success) {
      console.error('❌ Failed to submit prompt:', submitResult.message);
      return;
    }
    console.log('✅ OpenAI response received\n');

    // Step 4: Parse and display the response
    console.log('📊 Step 4: Parsing OpenAI response...');
    let concepts;
    try {
      concepts = JSON.parse(submitResult.data.content);
    } catch (parseError) {
      console.error('❌ Failed to parse response:', parseError);
      console.log('Raw response:', submitResult.data.content);
      return;
    }

    console.log('🎉 STEP 1 OUTPUT:');
    console.log('================');
    console.log(JSON.stringify(concepts, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStep1();
