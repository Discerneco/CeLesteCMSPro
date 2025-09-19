# CeLesteCMS Pro: "Editions" Terminology Philosophy

## Why "Editions" Instead of "Revisions"

CeLesteCMS Pro deliberately uses **"Editions"** instead of the web-standard "revisions" to honor true publishing heritage and create a unique, meaningful user experience.

## Traditional Publishing Heritage

### Newspaper Publishing
- **Morning Edition** - First daily publication
- **Evening Edition** - Updated afternoon publication  
- **Final Edition** - Last edition with breaking news
- **Extra Edition** - Special urgent publications

### Book Publishing
- **First Edition** - Original publication
- **Second Edition** - Updated with corrections
- **Revised Edition** - Significant content updates
- **Collector's Edition** - Special release

## Modern CMS Comparison

| CMS | Term | Philosophy |
|-----|------|------------|
| **WordPress** | Revisions | Technical process focus |
| **Drupal** | Revisions | Version control approach |
| **Ghost** | Revisions | Developer-centric |
| **CeLesteCMS Pro** | **Editions** | **Publishing heritage** |

## User Experience Benefits

### Psychological Impact
- **"Creating a new edition"** feels important and purposeful
- **"Managing editions"** connects to professional publishing
- **"Browse past editions"** implies valuable content history
- **"Latest edition"** suggests freshness and relevance

### Professional Narrative
Content creators using CeLesteCMS Pro are **editors** managing **editions** of their content, not developers managing code revisions.

## Complete Terminology System

### Auto-Save (Temporary State)
```
Status: Published • Last update at 10:07 [Unsaved]
```
- **"Last update"** - Clear, precise timing
- **"[Unsaved]"** - Universal understanding of temporary state
- **Per-author tracking** - Each user has their own working copy

### Editions (Saved History)
```
View 15 editions
Browse edition history
Create new edition (when saving)
```
- **Maximum 15 editions** - Prevents database bloat
- **Edition timestamps** - Clear chronological history
- **Edition comparison** - Visual diff between editions

### Current Status (Active State)
```
Published | Draft | Scheduled
```
- **Core status unchanged** - Familiar CMS terminology
- **Clear content state** - What readers will see

## Technical Implementation

### Database Structure
- **`posts`** table - Current/active content
- **`post_autosaves`** table - Temporary per-user working copies
- **`post_editions`** table - Permanent historical snapshots (future)

### Auto-Save Field Classification
- **Auto-Saved Fields**:
  - Title (EN/PT)
  - Excerpt (EN/PT)
  - Content (EN/PT)
  - Active language tab
- **Manual Save Fields**:
  - Status (draft/published/scheduled)
  - Categories and tags
  - Featured flag
  - Publication date
  - Author assignment
  - SEO metadata

### Auto-Save Behavior
- **3-second debounce** - Save after user stops typing
- **All post statuses** - Works for published and draft content
- **Smart content loading** - Always show newest available content
- **No interruption** - Seamless editing experience

### Auto-Save Scope
- **Content Fields Only** - Title, excerpt, content (multilingual)
- **Settings Require Manual Save** - Status, categories, tags, featured flag
- **Rationale** - Prevents accidental publishing, follows publishing best practices
- **User Control** - Settings are intentional decisions requiring confirmation

## Brand Differentiation

Using "Editions" positions CeLesteCMS Pro as:
- **Publishing-first** - Built for content creators, not developers
- **Heritage-aware** - Respects traditional publishing workflows
- **User-focused** - Meaningful terminology over technical jargon
- **Unique** - Stands out in crowded CMS marketplace

## Implementation Examples

### Content Management Interface
```
📄 Post: "Website Redesign Announcement"
   Status: Published • Last update at 14:32 [Unsaved] ℹ️
   
   [Save New Edition] [Preview] [View 8 Editions]
```

### Edition History
```
Edition History (8 total)
├── Current Working Copy (14:32) [Unsaved]
├── Edition 8 - Published (12:15 PM, Today)
├── Edition 7 - Draft saved (11:42 AM, Today)  
├── Edition 6 - Published (09:30 AM, Today)
└── ...older editions
```

### Info Modal
```
Content Status Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
English:   Last update 14:32 [Unsaved]
Portuguese: Published (12:15 PM)

Actions:
[📊 View Changes]  [🗑️ Discard Auto-save]
```

## Conclusion

By choosing "Editions" over "revisions," CeLesteCMS Pro creates a more meaningful, publishing-focused user experience that differentiates the platform while honoring the rich heritage of traditional publishing.

This terminology choice reflects our core philosophy: **Content creators are editors managing valuable editions of their work, not developers managing code revisions.**