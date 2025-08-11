// Test NeuronWriter Functions with Automatic Keyword from File
// Run with: node test_neuronwriter_with_keyword_file.js

const { NeuronWriterRepository } = require('./dist/repositories/neuron_writer');
require('dotenv').config({ path: '.local.env' });

async function testNeuronWriterWithKeywordFile() {
  console.log('🧪 Testing NeuronWriter Functions with Automatic Keyword Loading...\n');

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

  const repository = new NeuronWriterRepository(config);

  try {
    // Step 1: Get current keyword from file (no parameters needed!)
    console.log('📖 Getting current keyword from keyword.json...');
    const keyword = await repository.getCurrentKeyword();
    console.log(`✅ Current keyword: "${keyword}"`);

    // Step 2: List available projects
    console.log('\n📋 Getting available projects...');
    const projects = await repository.listProjects();
    console.log(`✅ Found ${projects.length} projects:`);
    projects.forEach(project => {
      console.log(`   - ${project.name} (${project.project})`);
    });

    if (projects.length === 0) {
      console.log('⚠️  No projects found. Please create a project in NeuronWriter first.');
      return;
    }

    const testProject = projects[0];
    console.log(`\n🎯 Using project: ${testProject.name} (${testProject.project})`);

    // Step 3: Check for existing query for current keyword (automatic!)
    console.log('\n🔍 Checking for existing query for current keyword...');
    const existingQuery = await repository.findExistingQueryForCurrentKeyword(testProject.project);
    
    if (existingQuery) {
      console.log(`✅ Found existing query!`);
      console.log(`   - Query ID: ${existingQuery.query}`);
      console.log(`   - Status: ${existingQuery.status}`);
      console.log(`   - Query URL: ${existingQuery.query_url}`);
      
      if (existingQuery.status === 'ready') {
        console.log('✅ Query is ready! Data is available.');
        console.log(`   - Has terms: ${existingQuery.terms ? 'Yes' : 'No'}`);
        console.log(`   - Has ideas: ${existingQuery.ideas ? 'Yes' : 'No'}`);
      } else {
        console.log(`⏳ Query still processing: ${existingQuery.status}`);
      }
      
      console.log('\n🎉 Test completed! Using existing query data.');
      return;
    }

    // Step 4: Create new query automatically using keyword from file
    console.log('🚀 No existing query found. Creating new query from keyword file...');
    const createResult = await repository.createQueryFromFile(testProject.project);

    console.log('✅ Query created successfully from keyword file!');
    console.log(`   - Keyword: "${keyword}"`);
    console.log(`   - Query ID: ${createResult.query}`);
    console.log(`   - Query URL: ${createResult.query_url}`);
    console.log(`   - Share URL: ${createResult.share_url}`);

    // Step 5: Check initial status
    console.log('\n📊 Checking initial query status...');
    const initialStatus = await repository.getQuery({ query: createResult.query });
    console.log(`✅ Initial status: ${initialStatus.status}`);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 New Keyword-File Methods Tested:');
    console.log('   ✅ getCurrentKeyword() - Gets keyword from keyword.json');
    console.log('   ✅ createQueryFromFile() - Creates query using keyword from file');
    console.log('   ✅ findExistingQueryForCurrentKeyword() - Finds existing query for current keyword');
    console.log('\n💡 Benefits:');
    console.log('   • No need to pass keywords as parameters');
    console.log('   • Just update keyword.json and run functions');
    console.log('   • Perfect for team demos and presentations');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testNeuronWriterWithKeywordFile();
