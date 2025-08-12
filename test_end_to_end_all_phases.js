// Test: Complete End-to-End Pipeline (Phase 1 → Phase 5)
// Usage: node test_end_to_end_all_phases.js [keyword]
// If keyword is omitted, it will use keyword from keyword.json.

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.local.env' });

// Import all phase services
const { GetOptimizationTermsService } = require('./dist/services/get_optimization_terms');
const { generateArticleOutline } = require('./dist/services/outline_submit_retrieve_output');
const { mergeOutlineWithTerms } = require('./dist/services/merge_outline_with_nw_terms');
const { LoopThruSectionsService } = require('./dist/services/loop_thru_sections/loop_thru_sections');
const { RenderArticleService } = require('./dist/services/render_article');

// Utility function to sanitize keyword for filenames
function sanitizeKeyword(keyword) {
  return keyword.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Utility function to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

async function runPhase1(keyword, projectId) {
  console.log('\n🚀 PHASE 1: Generating Optimization Terms from NeuronWriter');
  console.log('=' .repeat(60));
  
  const config = {
    apiKey: process.env.NEURONWRITER_API_KEY,
    baseUrl: 'https://app.neuronwriter.com/neuron-api/0.5/writer',
    timeout: 30000
  };
  
  const optimizationService = new GetOptimizationTermsService(config);
  
  console.log(`📖 Keyword: "${keyword}"`);
  console.log(`🎯 Project ID: ${projectId}`);
  
  const result = await optimizationService.getOptimizationTerms({
    keyword: keyword,
    projectId: projectId,
    engine: 'google.com',
    language: 'English'
  });

  if (!result.success) {
    throw new Error(`Phase 1 failed: ${result.message}`);
  }

  console.log('✅ Phase 1 completed successfully!');
  console.log(`   Query ID: ${result.data.query_id}`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  
  // Save to file for downstream phases
  const saveResult = await optimizationService.saveOptimizationTermsToFileByQueryId(result.data.query_id, keyword);
  if (!saveResult.success) {
    throw new Error(`Failed to save Phase 1 results: ${saveResult.message}`);
  }
  
  console.log(`💾 Saved to: ${saveResult.filePath}`);
  
  const termsData = result.data.optimization_terms;
  console.log('\n📊 Terms Summary:');
  console.log(`   Headings (H1): ${termsData.headings.h1.length} terms`);
  console.log(`   Headings (H2): ${termsData.headings.h2.length} terms`);
  console.log(`   Headings (H3): ${termsData.headings.h3.length} terms`);
  console.log(`   Body Terms (Basic): ${termsData.body_terms.basic.length} terms`);
  console.log(`   Body Terms (Extended): ${termsData.body_terms.extended.length} terms`);
  
  return result.data;
}

async function runPhase2(keyword) {
  console.log('\n🚀 PHASE 2: Generating Article Outline');
  console.log('=' .repeat(60));
  
  console.log(`📖 Keyword: "${keyword}"`);
  
  const result = await generateArticleOutline({ keyword });
  if (!result.success) {
    throw new Error(`Phase 2 failed: ${result.message}`);
  }

  const outline = result.data.outline;
  console.log('✅ Phase 2 completed successfully!');
  console.log(`   Sections: ${outline.sections.length}`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  console.log(`   Token usage:`, result.data.usage);

  // Print outline headers for quick review
  console.log('\n📋 Generated Outline:');
  outline.sections.forEach((sec, idx) => {
    console.log(`   ${idx + 1}. ${sec.header}`);
    console.log(`      ${sec.description}`);
  });
  
  return result.data;
}

async function runPhase3(keyword) {
  console.log('\n🚀 PHASE 3: Merging Outline with Body Terms');
  console.log('=' .repeat(60));
  
  console.log(`📖 Keyword: "${keyword}"`);
  
  const result = await mergeOutlineWithTerms({ keyword });
  if (!result.success) {
    throw new Error(`Phase 3 failed: ${result.message}`);
  }

  const mergedOutline = result.data.mergedOutline;
  console.log('✅ Phase 3 completed successfully!');
  console.log(`   Sections: ${mergedOutline.sections.length}`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  console.log(`   Token usage:`, result.data.usage);

  // Print merged sections with term counts
  console.log('\n📋 Merged Outline with Terms:');
  mergedOutline.sections.forEach((sec, idx) => {
    console.log(`   ${idx + 1}. ${sec.headline}`);
    console.log(`      Header terms: ${sec['header-terms']?.length || 0}`);
    console.log(`      Content terms: ${sec['content-terms']?.length || 0}`);
  });
  
  return result.data;
}

async function runPhase4(keyword) {
  console.log('\n🚀 PHASE 4: Generating Section Content');
  console.log('=' .repeat(60));
  
  console.log(`📖 Keyword: "${keyword}"`);
  
  const loopService = new LoopThruSectionsService();
  const result = await loopService.loopThruSections({ keyword });
  if (!result.success) {
    throw new Error(`Phase 4 failed: ${result.message}`);
  }

  const article = result.data.phase4Article;
  console.log('✅ Phase 4 completed successfully!');
  console.log(`   Sections: ${article.sections.length}`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  console.log(`   Total word count: ${article.metadata.total_word_count}`);
  console.log(`   Total content blocks: ${article.metadata.total_content_blocks}`);

  // Print section summaries
  console.log('\n📋 Generated Content Summary:');
  article.sections.forEach((sec, idx) => {
    console.log(`   ${idx + 1}. ${sec.headline}`);
    console.log(`      Content blocks: ${sec.content.content.length}`);
  });
  
  return result.data;
}

async function runPhase5(keyword) {
  console.log('\n🚀 PHASE 5: Rendering Final Article');
  console.log('=' .repeat(60));
  
  console.log(`📖 Keyword: "${keyword}"`);
  
  const renderService = new RenderArticleService();
  const result = await renderService.renderMarkdown({ keyword });
  if (!result.success) {
    throw new Error(`Phase 5 failed: ${result.message}`);
  }

  console.log('✅ Phase 5 completed successfully!');
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  console.log(`   Output file: ${result.data.output_path}`);

  // Show preview of the generated markdown
  const markdownContent = result.data.markdown;
  const previewLines = markdownContent.split('\n').slice(0, 20).join('\n');
  console.log('\n📄 Article Preview (first 20 lines):');
  console.log('─' .repeat(60));
  console.log(previewLines);
  if (markdownContent.split('\n').length > 20) {
    console.log('...');
  }
  console.log('─' .repeat(60));
  
  return result.data;
}

async function main() {
  const startTime = Date.now();
  
  console.log('🧪 COMPLETE END-TO-END TEST: Phase 1 → Phase 5');
  console.log('=' .repeat(60));
  
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
  console.log(`📖 Target Keyword: "${keyword}"`);
  
  // 2) Check environment variables
  if (!process.env.NEURONWRITER_API_KEY) {
    console.error('❌ NEURONWRITER_API_KEY missing in .local.env');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY missing in .local.env');
    process.exit(1);
  }
  
  // 3) Get NeuronWriter project
  console.log('\n🔍 Getting NeuronWriter project...');
  const config = {
    apiKey: process.env.NEURONWRITER_API_KEY,
    baseUrl: 'https://app.neuronwriter.com/neuron-api/0.5/writer',
    timeout: 30000
  };
  const optimizationService = new GetOptimizationTermsService(config);
  const projects = await optimizationService.listProjects();
  if (projects.length === 0) {
    console.error('❌ No projects found. Please create a project in NeuronWriter first.');
    process.exit(1);
  }
  const projectId = projects[0].project;
  console.log(`✅ Using project: ${projects[0].name} (${projectId})`);
  
  try {
    // 4) Run all phases sequentially
    const phase1Result = await runPhase1(keyword, projectId);
    const phase2Result = await runPhase2(keyword);
    const phase3Result = await runPhase3(keyword);
    const phase4Result = await runPhase4(keyword);
    const phase5Result = await runPhase5(keyword);
    
    // 5) Summary
    const totalTime = Date.now() - startTime;
    console.log('\n🎉 END-TO-END TEST COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total processing time: ${Math.round(totalTime / 1000)}s`);
    console.log(`   Phase 1: ${Math.round(phase1Result.processing_time / 1000)}s`);
    console.log(`   Phase 2: ${Math.round(phase2Result.processing_time / 1000)}s`);
    console.log(`   Phase 3: ${Math.round(phase3Result.processing_time / 1000)}s`);
    console.log(`   Phase 4: ${Math.round(phase4Result.processing_time / 1000)}s`);
    console.log(`   Phase 5: ${Math.round(phase5Result.processing_time / 1000)}s`);
    
    console.log(`\n📁 Generated Files:`);
    const sanitizedKeyword = sanitizeKeyword(keyword);
    console.log(`   Terms: src/repositories/optimization_terms/${sanitizedKeyword}.json`);
    console.log(`   Phase 2: src/repositories/outlines/phase2_outline_${sanitizedKeyword}.json`);
    console.log(`   Phase 3: src/repositories/outlines/phase3_merged_outline_${sanitizedKeyword}.json`);
    console.log(`   Phase 4: src/repositories/articles/phase4_article_${sanitizedKeyword}.json`);
    console.log(`   Final: src/repositories/final/phase5_article_${sanitizedKeyword}.md`);
    
    console.log(`\n✅ All phases completed successfully!`);
    
  } catch (error) {
    console.error('\n❌ END-TO-END TEST FAILED');
    console.error('=' .repeat(60));
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
