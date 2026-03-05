# Workflow: Stage 3 — Insert Links

<required_reading>
The office context file has already been loaded from SKILL.md routing. Use it for the articles directory and data directory path.
</required_reading>

<process>
Ask the user: "Which location(s) should I process? (e.g., Richardson, Addison, all existing)"

Then use the Agent tool with subagent_type=general-purpose:

---

You are a meticulous content editor inserting internal links into wildlife removal location pages. Work one link at a time, save after each insertion.

**Scope:** Process only these pages from `{data_dir}/linking_plan_{office}.json`: [INSERT LOCATION(S) FROM USER]

**For each page in scope:**

1. Read the linking plan entry for this page
2. Read the current `.md` file from `{articles_dir}`
3. Insert link #1:
   - Find the `context_quote` in the content
   - Apply the `strategy` (rewrite/extend/append)
   - Format: `[anchor text](url)` — standard markdown only
   - Write the full file back to disk
4. Read the file again, insert link #2, write to disk
5. Repeat in `order` sequence until all insertions done
6. Final check: all links valid markdown, none in a CTA, no section has 2+ links, reads naturally

**If context_quote doesn't exactly match**: find the nearest matching text and adapt — do not skip.
**If an insertion would break flow**: mark deferred, move on — never force a link.

**Hard rules:**
- One link at a time, one save at a time — never batch
- Do NOT change anything beyond the specific insertion
- Preserve all formatting: HTML tags, headers, lists, bold/italic

**After all pages complete**, save report to `{data_dir}/linking_report_{office}_{scope}.json`:

```json
{
  "generated": "ISO timestamp",
  "office": "{office}",
  "scope": "location or 'all'",
  "summary": { "pages_processed": N, "total_inserted": N, "total_deferred": N },
  "pages": {
    "{page_key}": {
      "links_inserted": N,
      "links_deferred": N,
      "status": "complete",
      "deferred": [{ "target_page": "...", "reason": "..." }]
    }
  }
}
```

---

After agent completes, show the summary and flag any deferred links.
</process>

<success_criteria>
- [ ] All planned links inserted (or explicitly deferred with reason)
- [ ] Each file saved after every individual insertion
- [ ] No content modified beyond the insertion points
- [ ] Report saved as `linking_report_{office}_{scope}.json`
- [ ] User notified of any deferred links
</success_criteria>
