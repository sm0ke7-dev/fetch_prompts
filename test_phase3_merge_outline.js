// Test: Phase 3 - Merge outline with NeuronWriter body terms
// Usage: node test_phase3_merge_outline.js [keyword]
// If keyword is omitted, it will use keyword from keyword.json.

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.local.env' });

const { MergeOutlineWithNWTermsService } = require('./dist/services/merge_outline_with_nw_terms');

async function main() {
  console.log('🧪 Testing Phase 3: Merge Outline with Body Terms\n');

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

  // 2) Check OpenAI key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY missing in .local.env');
    process.exit(1);
  }

  // 3) Merge outline with body terms
  const mergeService = new MergeOutlineWithNWTermsService();
  const result = await mergeService.mergeOutlineWithNWTerms({ keyword });
  
  if (!result.success) {
    console.error('❌ Failed:', result.message);
    if (result.error) console.error('Error:', result.error);
    process.exit(1);
  }

  const mergedOutline = result.data.mergedOutline;
  console.log('\n✅ Phase 3 completed successfully!');
  console.log(`   Sections: ${mergedOutline.sections.length}`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  console.log(`   Body terms used: ${mergedOutline.metadata.body_terms_used}`);
  console.log(`   Token usage:`, result.data.usage);

  // Print merged sections for review
  console.log('\n📋 Merged Outline Sections:');
  mergedOutline.sections.forEach((section, idx) => {
    console.log(`\n${idx + 1}. ${section.headline}`);
    console.log(`   Description: ${section.description}`);
    console.log(`   Header Terms: ${section["header-terms"].join(', ')}`);
    console.log(`   Content Terms: ${section["content-terms"].join(', ')}`);
  });

  // 4) Check if output file was created
  const outputFile = `phase3_merged_outline_${keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}.json`;
  const outputPath = path.join(__dirname, 'dist', 'repositories', 'outlines', outputFile);
  
  if (fs.existsSync(outputPath)) {
    console.log(`\n💾 Output saved to: ${outputFile}`);
  } else {
    console.log(`\n⚠️  Output file not found: ${outputFile}`);
  }
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
