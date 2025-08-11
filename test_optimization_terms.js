// Test script for Optimization Terms Service
// Run with: node test_optimization_terms.js

const { GetOptimizationTermsService } = require('./dist/services/get_optimization_terms');
require('dotenv').config({ path: '.local.env' });

async function testOptimizationTerms() {
  console.log('🧪 Testing Optimization Terms Service...\n');

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
    // Test 1: List Projects
    console.log('📋 Test 1: Listing projects...');
    const projects = await service.listProjects();
    console.log(`✅ Found ${projects.length} projects:`);
    projects.forEach(project => {
      console.log(`   - ${project.name} (${project.project})`);
    });

    if (projects.length === 0) {
      console.log('⚠️  No projects found. Please create a project in NeuronWriter first.');
      return;
    }

    // Use the first project for testing
    const testProject = projects[0];
    
    // Use existing query ID where competitors have been accepted
    const existingQueryId = 'd0ece22496721e8f';
    
    console.log(`\n🎯 Test 2: Fetching optimization terms from existing query "${existingQueryId}"...`);

    // Test 2: Get Optimization Terms from existing query
    const result = await service.getOptimizationTermsFromExistingQuery(existingQueryId);

    if (result.success) {
      console.log('✅ Optimization terms retrieved successfully!');
      console.log(`📊 Query ID: ${result.data.query_id}`);
      console.log(`⏱️  Processing time: ${result.data.processing_time}ms`);
      console.log(`🔗 Query URL: ${result.data.query_url}`);
      
      const terms = result.data.optimization_terms;
      console.log('\n📈 Optimization Terms Summary:');
      console.log(`   Header Terms: ${terms.header_terms.length}`);
      console.log(`   Body Terms: ${terms.body_terms.length}`);
      console.log(`   Entities: ${terms.entities.length}`);
      console.log(`   Suggested Questions: ${terms.suggested_questions.length}`);
      console.log(`   PAA Questions: ${terms.paa_questions.length}`);
      console.log(`   Content Questions: ${terms.content_questions.length}`);
      console.log(`   Competitors: ${terms.competitors.length}`);

      // Show some sample data
      if (terms.header_terms.length > 0) {
        console.log('\n🎯 Sample Header Terms:');
        terms.header_terms.slice(0, 5).forEach(term => console.log(`   - ${term}`));
      }

      if (terms.entities.length > 0) {
        console.log('\n🏷️  Sample Entities:');
        terms.entities.slice(0, 5).forEach(entity => console.log(`   - ${entity}`));
      }

    } else {
      console.error('❌ Failed to get optimization terms:', result.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testOptimizationTerms();
