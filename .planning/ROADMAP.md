# Roadmap: fetch_prompts

## Milestones

- ✅ **v1.0 Content Generation Pipeline** - Phases 1-5 (shipped 2025-08)
- ✅ **v1.0.1 Location Service Pages** - Milestone 1 (shipped 2026-02)
- 🚧 **v1.1 WordPress Upload** - Phase 6 (in progress)

## Phases

<details>
<summary>✅ v1.0 Content Generation Pipeline (Phases 1-5) - SHIPPED 2025-08</summary>

### Phase 1: Text Generation API
**Goal**: Single-shot text generation with prompt config system
**Status**: Complete

### Phase 2: NeuronWriter Integration
**Goal**: SEO optimization terms extraction
**Status**: Complete

### Phase 3: Multi-Phase Text Pipeline
**Goal**: 5-phase article generation (terms → outline → merge → loop → render)
**Status**: Complete

### Phase 4: Image Generation Pipeline
**Goal**: 4-step image description + Ideogram generation + GPT Vision QA
**Status**: Complete

### Phase 5: Location Service Pages
**Goal**: service_page pageType + /create-location-page Claude command
**Status**: Complete

</details>

### 🚧 v1.1 WordPress Upload (In Progress)

**Milestone Goal:** Publish generated content to WordPress from the CLI

#### Phase 6: WordPress Upload
**Goal**: Standalone wp-upload endpoint + Claude command integration
**Depends on**: Phase 5 (content must exist in final/ directory)
**Plans**: 3 plans

Plans:
- [ ] 06-01: WordPress upload service (Markdown → HTML → WP REST API)
- [ ] 06-02: API endpoint + route wiring
- [ ] 06-03: Update /create-location-page Claude command with upload flow

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-5. Content Pipeline | v1.0 | - | Complete | 2025-08 |
| 5.1 Location Pages | v1.0.1 | - | Complete | 2026-02 |
| 6. WordPress Upload | v1.1 | 0/3 | In progress | - |
