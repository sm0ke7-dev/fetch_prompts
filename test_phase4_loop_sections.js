// Test: Phase 4 - Loop through sections to generate content
// Usage: node test_phase4_loop_sections.js [keyword]
// If keyword is omitted, it will use keyword from keyword.json.

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.local.env' });

const { LoopThruSectionsService } = require('./dist/services/loop_thru_sections/loop_thru_sections');

async function main() {
  console.log('🧪 Testing Phase 4: Loop Through Sections\n');

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

  // 3) Loop through sections and generate content
  const loopService = new LoopThruSectionsService();
  const result = await loopService.loopThruSections({ keyword });
  
  if (!result.success) {
    console.error('❌ Failed:', result.message);
    if (result.error) console.error('Error:', result.error);
    process.exit(1);
  }

  const phase4Article = result.data.phase4Article;
  console.log('\n✅ Phase 4 completed successfully!');
  console.log(`   Sections: ${phase4Article.sections.length}`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  console.log(`   Total word count: ${phase4Article.metadata.total_word_count}`);
  console.log(`   Total content blocks: ${phase4Article.metadata.total_content_blocks}`);

  // Print section summaries for review
  console.log('\n📋 Generated Content Summary:');
  phase4Article.sections.forEach((section, idx) => {
    console.log(`\n${idx + 1}. ${section.headline}`);
    console.log(`   Content blocks: ${section.content.content.length}`);
    console.log(`   Headline: ${section.content.headline}`);
    console.log(`   Content types: ${section.content.content.map(block => block.type).join(', ')}`);
  });

  // 4) Check if output file was created
  const outputFile = `phase4_article_${keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_')}.json`;
  const outputPath = path.join(__dirname, 'src', 'repositories', 'articles', outputFile);
  
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
