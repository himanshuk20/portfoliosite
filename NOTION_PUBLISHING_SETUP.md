# Notion Publishing Setup

This project keeps the existing Blog and Case Study UI and continues to use the generated JSON files as the data layer.

## Architecture

Notion → `scripts/sync-notion.mjs` → generated JSON → React UI

The important change is that the sync now runs automatically as part of the production build:

```bash
npm run sync:notion && npm run build:app
```

You do **not** need to run the sync on your laptop when deploying to Vercel.

## Vercel environment variables

Add these in the Vercel project settings for the Production environment:

```text
NOTION_TOKEN
NOTION_BLOG_DB_ID
NOTION_CASESTUDY_DB_ID
VITE_WEB3FORMS_ACCESS_KEY
```

Keep `NOTION_TOKEN` server/build-side. Do not rename it to a `VITE_` variable.

## Automatic publishing

Create a Vercel Deploy Hook for this project. Vercel Deploy Hooks accept POST requests and trigger a new deployment.

Then, in each Notion database (Blogs and Case Studies), create a database automation:

1. Trigger: `Published` is set to `true`.
2. Action: `Send webhook`.
3. URL: paste the Vercel Deploy Hook URL.
4. Optionally add a custom secret header if you want an additional verification layer on the webhook side.

You can use the same Deploy Hook for both databases.

The resulting flow is:

```text
Notion
  ↓
Published = true
  ↓
Notion webhook
  ↓
Vercel Deploy Hook
  ↓
Vercel build
  ↓
npm run sync:notion
  ↓
blogs.generated.json / case-studies.generated.json
  ↓
React build
  ↓
Live website
```

## Important

- Do not delete the generated JSON files. They are build outputs consumed by the existing React UI.
- Do not change the existing Blog or Case Study components/CSS just to support Notion publishing.
- Do not put `NOTION_TOKEN` in client-side code or a `VITE_` variable.
- The Web3Forms key remains `VITE_WEB3FORMS_ACCESS_KEY` because it is already used by the client-side contact form.
- If you edit a published page in Notion, use the same automation approach if you want every edit to trigger a deployment. If you only want the explicit Publish action to deploy, use a Notion database Button that sets `Published` to true and then sends the webhook.
