# Notion CMS setup

This portfolio uses Notion as a private CMS while preserving the custom React UI.

## 1. Create two Notion databases

### Blogs
- Title — Title
- Slug — Rich text (optional)
- Excerpt — Rich text
- Tag — Select
- Tags — Multi-select (optional)
- Date — Date
- Read Time — Rich text
- Published — Checkbox
- Cover — Files & media (optional)

### Case Studies
- Title — Title
- Slug — Rich text (optional)
- Summary — Rich text
- Client — Rich text
- Metric — Rich text
- Duration — Rich text
- Date — Date
- Read Time — Rich text
- Tags — Multi-select
- Visual — Rich text (optional)
- Hero — Rich text (optional)
- Published — Checkbox

## 2. Share both databases with the Notion connection

Create an internal Notion connection with read-content capability and use **Add connections** from each database's menu to share them with the connection.

## 3. Configure `.env`

Copy `.env.example` to `.env` and add:

```env
NOTION_TOKEN=your_secret
NOTION_BLOG_DB_ID=your_blogs_database_id
NOTION_CASESTUDY_DB_ID=your_case_studies_database_id
```

The script accepts database IDs and automatically resolves the first data source under each database.

## 4. Write content in the Notion page body

The sync supports:
- Paragraphs
- H1/H2/H3 headings
- Bulleted and numbered lists
- Quotes
- Code blocks
- Dividers
- Images
- Nested blocks

Only pages with `Published` checked are exported.

## 5. Sync

```bash
npm run sync:notion
npm run dev
```

For deployment, run the sync before the production build so Notion content is baked into the static site. The token stays build-time/server-side and is never exposed to visitors.
