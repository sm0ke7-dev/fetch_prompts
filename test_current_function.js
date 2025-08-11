// Test the current getOptimizationTerms function
// Run with: node test_current_function.js

const { GetOptimizationTermsService } = require('./dist/services/get_optimization_terms');
require('dotenv').config({ path: '.local.env' });

async function testCurrentFunction() {
  console.log('🧪 Testing Current getOptimizationTerms Function...\n');

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
    // First, let's see what projects are available
    console.log('📋 Checking available projects...');
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
    
    console.log(`\n🎯 Testing with project: ${testProject.name} (${testProject.project})`);
    console.log('🔍 Testing keyword: "what scares squirrels"');

    // Test the main getOptimizationTerms function
    const result = await service.getOptimizationTerms({
      keyword: 'what scares squirrels',
      projectId: testProject.project,
      engine: 'google.com',
      language: 'English'
    });

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

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testCurrentFunction();
