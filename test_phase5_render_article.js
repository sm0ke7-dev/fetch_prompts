// Test: Phase 5 - Render final article to Markdown
// Usage: node test_phase5_render_article.js [keyword]

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.local.env' });

const { RenderArticleService } = require('./dist/services/render_article');

async function main() {
  console.log('🧪 Testing Phase 5: Render Article to Markdown\n');

  let keyword = process.argv[2];
  if (!keyword) {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'src', 'repositories', 'data', 'keyword.json'), 'utf-8')
      );
      keyword = data.keyword;
    } catch {
      console.error('❌ Failed to read keyword.json and no CLI keyword provided');
      process.exit(1);
    }
  }
  console.log(`📖 Keyword: "${keyword}"`);

  const service = new RenderArticleService();
  const result = await service.renderMarkdown({ keyword });

  if (!result.success) {
    console.error('❌ Failed:', result.message);
    if (result.error) console.error('Error:', result.error);
    process.exit(1);
  }

  console.log('\n✅ Phase 5 completed successfully!');
  console.log(`   Output: ${path.basename(result.data.output_path)}`);
  console.log(`   Location: src/repositories/final/`);
  console.log(`   Processing time: ${result.data.processing_time}ms`);

  // Preview first lines
  console.log('\n📄 Preview:\n');
  const lines = result.data.markdown.split('\n').slice(0, 20);
  lines.forEach(l => console.log(l));
}

main().catch(err => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
