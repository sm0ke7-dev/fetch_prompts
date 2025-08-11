// Test: Phase 1 - Generate structured optimization terms from NeuronWriter
// Usage: node test_phase1_neuronwriter_with_keyword_file.js [keyword]
// If keyword is omitted, it will use keyword from keyword.json.

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.local.env' });

const { GetOptimizationTermsService } = require('./dist/services/get_optimization_terms');

async function main() {
  console.log('🧪 Testing Phase 1: Generate Structured Optimization Terms\n');

  // 1) Resolve keyword
  let keyword = process.argv[2];
  if (!keyword) {
    try {
      const keywordData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'src', 'repositories', 'data', 'keyword.json'), 'utf-8')
      );
      keyword = keywordData.keyword;
    } catch {
      console.error('❌ Failed to read keyword.json and no CLI keyword provided');
      process.exit(1);
    }
  }
  console.log(`📖 Keyword: "${keyword}"`);

  // 2) Check NeuronWriter key
  if (!process.env.NEURONWRITER_API_KEY) {
    console.error('❌ NEURONWRITER_API_KEY missing in .local.env');
    process.exit(1);
  }

  // 3) Create service with config
  const config = {
    apiKey: process.env.NEURONWRITER_API_KEY,
    baseUrl: 'https://app.neuronwriter.com/neuron-api/0.5/writer',
    timeout: 30000
  };
  const optimizationService = new GetOptimizationTermsService(config);

  // 4) Get projects 
  console.log('📋 Getting available projects...');
  const projects = await optimizationService.listProjects();
  if (projects.length === 0) {
    console.error('❌ No projects found. Please create a project in NeuronWriter first.');
    process.exit(1);
  }

  const testProject = projects[0];
  console.log(`🎯 Using project: ${testProject.name} (${testProject.project})`);

  // 5) Use the full Phase 1 service logic
  console.log('🚀 Starting Phase 1: Complete optimization terms workflow');
  const result = await optimizationService.getOptimizationTerms({
    keyword: keyword,
    projectId: testProject.project,
    engine: 'google.com',
    language: 'English'
  });

  if (!result.success) {
    console.error('❌ Failed:', result.message);
    if (result.error) console.error('Error:', result.error);
    process.exit(1);
  }

  console.log('\n✅ Phase 1 completed successfully!');
  console.log(`   Query ID: ${result.data.query_id}`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  console.log(`   Query URL: ${result.data.query_url}`);

  // Now save the results to file for downstream phases
  console.log('\n💾 Saving structured terms to file...');
  const saveResult = await optimizationService.saveOptimizationTermsToFileByQueryId(result.data.query_id, keyword);
  
  if (!saveResult.success) {
    console.error('❌ Failed to save file:', saveResult.message);
    process.exit(1);
  }

  console.log(`✅ File saved: ${saveResult.filePath}`);

  // Show terms summary from the service result
  const termsData = result.data.optimization_terms;
  console.log('\n📊 Terms Summary:');
  console.log(`   Headings (H1): ${termsData.headings.h1.length} terms`);
  console.log(`   Headings (H2): ${termsData.headings.h2.length} terms`);
  console.log(`   Headings (H3): ${termsData.headings.h3.length} terms`);
  console.log(`   Body Terms (Basic): ${termsData.body_terms.basic.length} terms`);
  console.log(`   Body Terms (Extended): ${termsData.body_terms.extended.length} terms`);

  // Show sample terms
  console.log('\n🔍 Sample H2 Terms:');
  termsData.headings.h2.slice(0, 5).forEach(term => {
    console.log(`   - "${term.term}" (${term.usage_percentage}% usage)`);
  });

  console.log('\n🔍 Sample Body Terms:');
  termsData.body_terms.basic.slice(0, 5).forEach(term => {
    console.log(`   - "${term.term}" (${term.usage_percentage}% usage, suggested: ${term.suggested_usage[0]}-${term.suggested_usage[1]})`);
  });

  // Final confirmation
  console.log(`\n🎉 Phase 1 Complete! Full workflow executed:`);
  console.log(`   ✅ Project selection and validation`);
  console.log(`   ✅ Query creation or reuse of existing query`);
  console.log(`   ✅ Analysis completion (${result.data.processing_time}ms)`);
  console.log(`   ✅ Structured term extraction`);
  console.log(`   ✅ File generation for downstream phases`);
  console.log(`\n📁 Output file: ${path.basename(saveResult.filePath)}`);
  console.log(`   Location: src/repositories/optimization_terms/`);
  console.log(`   Ready for Phase 2 (Article Outline Creation)`);
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
