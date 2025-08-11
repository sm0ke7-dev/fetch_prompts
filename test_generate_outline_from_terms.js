// Test: Generate article outline from existing optimization terms
// Usage: node test_generate_outline_from_terms.js [keyword]
// If keyword is omitted, it will use keyword from keyword.json.

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.local.env' });

const { generateArticleOutline } = require('./dist/services/outline_submit_retrieve_output');

async function main() {
  console.log('🧪 Testing Article Outline Generator (Phase 2)\n');

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

  // 3) Generate outline
  const result = await generateArticleOutline({ keyword });
  if (!result.success) {
    console.error('❌ Failed:', result.message);
    if (result.error) console.error('Error:', result.error);
    process.exit(1);
  }

  const outline = result.data.outline;
  console.log('\n✅ Outline generated successfully!');
  console.log(`   Sections: ${outline.sections.length}`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);
  console.log(`   Token usage:`, result.data.usage);

  // Print outline headers for quick review
  outline.sections.forEach((sec, idx) => {
    console.log(`\n${idx + 1}. ${sec.header}`);
    console.log(`   ${sec.description}`);
  });
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
