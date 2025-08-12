// Test: Phases 2-5 Pipeline (Skip Phase 1 - assumes terms already exist)
// Usage: node test_phases_2_to_5.js [keyword]
// If keyword is omitted, it will use keyword from keyword.json.
// 
// Prerequisites: 
// - Phase 1 must have been run previously for this keyword
// - File must exist: src/repositories/optimization_terms/<sanitized_keyword>.json

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.local.env' });

// Import all phase services (except Phase 1)
const { generateArticleOutline } = require('./dist/services/outline_submit_retrieve_output');
const { mergeOutlineWithTerms } = require('./dist/services/merge_outline_with_nw_terms');
const { LoopThruSectionsService } = require('./dist/services/loop_thru_sections/loop_thru_sections');
const { RenderArticleService } = require('./dist/services/render_article');

// Utility function to sanitize keyword for filenames (matches the core files)
function sanitizeKeyword(keyword) {
  return keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_').trim();
}

// Utility function to check if optimization terms file exists
function checkOptimizationTermsExist(keyword) {
  const sanitizedKeyword = sanitizeKeyword(keyword);
  const termsFile = path.join(__dirname, 'src', 'repositories', 'optimization_terms', `${sanitizedKeyword}.json`);
  return fs.existsSync(termsFile);
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
  
  console.log('🧪 TESTING PHASES 2-5: Article Generation Pipeline');
  console.log('=' .repeat(60));
  console.log('⚠️  Note: This test assumes Phase 1 has already been run');
  console.log('   and optimization terms file exists.');
  
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
  
  // 2) Check if optimization terms file exists
  if (!checkOptimizationTermsExist(keyword)) {
    const sanitizedKeyword = sanitizeKeyword(keyword);
    console.error(`❌ Optimization terms file not found: src/repositories/optimization_terms/${sanitizedKeyword}.json`);
    console.error('   Please run Phase 1 first to generate the optimization terms.');
    process.exit(1);
  }
  
  console.log('✅ Optimization terms file found - proceeding with Phases 2-5');
  
  // 3) Check environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY missing in .local.env');
    process.exit(1);
  }
  
  try {
    // 4) Run phases 2-5 sequentially
    const phase2Result = await runPhase2(keyword);
    const phase3Result = await runPhase3(keyword);
    const phase4Result = await runPhase4(keyword);
    const phase5Result = await runPhase5(keyword);
    
    // 5) Summary
    const totalTime = Date.now() - startTime;
    console.log('\n🎉 PHASES 2-5 COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Total processing time: ${Math.round(totalTime / 1000)}s`);
    console.log(`   Phase 2: ${Math.round(phase2Result.processing_time / 1000)}s`);
    console.log(`   Phase 3: ${Math.round(phase3Result.processing_time / 1000)}s`);
    console.log(`   Phase 4: ${Math.round(phase4Result.processing_time / 1000)}s`);
    console.log(`   Phase 5: ${Math.round(phase5Result.processing_time / 1000)}s`);
    
    console.log(`\n📁 Generated Files:`);
    const sanitizedKeyword = sanitizeKeyword(keyword);
    console.log(`   Phase 2: src/repositories/outlines/phase2_outline_${sanitizedKeyword}.json`);
    console.log(`   Phase 3: src/repositories/outlines/phase3_merged_outline_${sanitizedKeyword}.json`);
    console.log(`   Phase 4: src/repositories/articles/phase4_article_${sanitizedKeyword}.json`);
    console.log(`   Final: src/repositories/final/phase5_article_${sanitizedKeyword}.md`);
    
    console.log(`\n✅ All phases completed successfully!`);
    console.log(`💡 You can now view the final article at: src/repositories/final/phase5_article_${sanitizedKeyword}.md`);
    
  } catch (error) {
    console.error('\n❌ PHASES 2-5 TEST FAILED');
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
