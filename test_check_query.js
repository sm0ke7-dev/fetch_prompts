// Test to check the query status and pull results
// Run with: node test_check_query.js

const { GetOptimizationTermsService } = require('./dist/services/get_optimization_terms');
require('dotenv').config({ path: '.local.env' });

async function checkQueryStatus() {
  console.log('🔍 Checking Query Status and Pulling Results...\n');

  // Configuration
  const config = {
    apiKey: process.env.NEURONWRITER_API_KEY,
    baseUrl: 'https://app.neuronwriter.com/neuron-api/0.5/writer',
    timeout: 30000
  };

  if (!config.apiKey || config.apiKey === 'your_neuronwriter_api_key_here') {
    console.error('❌ Please set your NEURONWRITER_API_KEY in .local.env file');
    return;
  }

  const service = new GetOptimizationTermsService(config);

  try {
    // The query ID from our previous test
    const queryId = '304667879d58ae4e';
    
    console.log(`🎯 Checking status of query: ${queryId}`);

    // First, let's check the current status
    const queryResult = await service.repository.getQuery({ query: queryId });
    console.log('📊 Current Status:', queryResult.status);

    if (queryResult.status === 'ready') {
      console.log('✅ Query is ready! Pulling results...');
      
      // Use the existing query method to get results
      const result = await service.getOptimizationTermsFromExistingQuery(queryId);
      
      console.log('\n📊 RESULT:');
      console.log('==========');
      console.log('Success:', result.success);
      console.log('Message:', result.message);
      
      if (result.success) {
        console.log('\n📈 DATA:');
        console.log('Query ID:', result.data.query_id);
        console.log('Query URL:', result.data.query_url);
        console.log('Processing Time:', result.data.processing_time + 'ms');
        
        console.log('\n📋 OPTIMIZATION TERMS:');
        console.log('Header Terms:', result.data.optimization_terms.header_terms.length);
        console.log('Body Terms:', result.data.optimization_terms.body_terms.length);
        console.log('Entities:', result.data.optimization_terms.entities.length);
        console.log('Suggested Questions:', result.data.optimization_terms.suggested_questions.length);
        console.log('PAA Questions:', result.data.optimization_terms.paa_questions.length);
        console.log('Content Questions:', result.data.optimization_terms.content_questions.length);
        console.log('Competitors:', result.data.optimization_terms.competitors.length);

        // Show some sample data
        if (result.data.optimization_terms.header_terms.length > 0) {
          console.log('\n🎯 Sample Header Terms:');
          result.data.optimization_terms.header_terms.slice(0, 5).forEach(term => console.log(`   - ${term}`));
        }

        if (result.data.optimization_terms.body_terms.length > 0) {
          console.log('\n📝 Sample Body Terms:');
          result.data.optimization_terms.body_terms.slice(0, 5).forEach(term => console.log(`   - ${term}`));
        }

      } else {
        console.log('\n❌ ERROR:');
        console.log('Error:', result.error);
      }
    } else {
      console.log(`⏳ Query is still processing. Status: ${queryResult.status}`);
      console.log('Please wait a bit longer and try again.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
checkQueryStatus();
