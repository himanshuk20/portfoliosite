// Build-time Notion CMS sync. Notion is the content source; the browser never
// receives NOTION_TOKEN. Database IDs are resolved to their first data source.
import sanitizeHtml from 'sanitize-html';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const TOKEN = process.env.NOTION_TOKEN;
const BLOG_DB_ID = process.env.NOTION_BLOG_DB_ID;
const CASE_DB_ID = process.env.NOTION_CASESTUDY_DB_ID;
const PROJECT_DB_ID = process.env.NOTION_PROJECT_DB_ID;
const VERSION = '2026-03-11';
const CONTENT_DIR = path.resolve('src/content');
const IMAGE_DIR = path.resolve('public/content');

if (!TOKEN || !BLOG_DB_ID || !CASE_DB_ID) {
  console.warn('[sync-notion] Missing NOTION_TOKEN / NOTION_BLOG_DB_ID / NOTION_CASESTUDY_DB_ID. Keeping existing generated content.');
  process.exit(0);
}

const headers = { Authorization: `Bearer ${TOKEN}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' };

async function notion(pathname, options = {}) {
  const res = await fetch(`https://api.notion.com/v1${pathname}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Notion ${res.status}: ${body.message || pathname}`);
  return body;
}

function text(parts = []) { return parts.map((x) => x.plain_text || x.text?.content || '').join(''); }
function escapeHtml(value = '') { return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;'); }
function richTextToHtml(parts = []) {
  return parts.map((part) => {
    const raw = part.plain_text || part.text?.content || '';
    let html = escapeHtml(raw);
    const annotations = part.annotations || {};
    if (annotations.code) html = `<code>${html}</code>`;
    if (annotations.bold) html = `<strong>${html}</strong>`;
    if (annotations.italic) html = `<em>${html}</em>`;
    if (annotations.underline) html = `<u>${html}</u>`;
    if (annotations.strikethrough) html = `<s>${html}</s>`;
    const href = part.href || part.text?.link?.url;
    if (href) html = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
    return html;
  }).join('');
}
function prop(page, name, fallback = '') {
  const p = page.properties?.[name]; if (!p) return fallback;
  switch (p.type) {
    case 'title': return text(p.title) || fallback;
    case 'rich_text': return text(p.rich_text) || fallback;
    case 'select': return p.select?.name || fallback;
    case 'multi_select': return p.multi_select?.map((x) => x.name) || fallback;
    case 'date': return p.date?.start || fallback;
    case 'checkbox': return p.checkbox;
    case 'number': return p.number ?? fallback;
    case 'url': return p.url || fallback;
    case 'files': return p.files?.[0]?.file?.url || p.files?.[0]?.external?.url || fallback;
    default: return fallback;
  }
}
function slugify(title) { return title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
function safeHtml(html) { return sanitizeHtml(html, { allowedTags:['p','h1','h2','h3','ul','ol','li','strong','em','u','s','a','blockquote','code','pre','img','br','hr','table','thead','tbody','tr','th','td'], allowedAttributes:{a:['href','target','rel'],img:['src','alt','width','height']}, transformTags:{a:sanitizeHtml.simpleTransform('a',{target:'_blank',rel:'noopener noreferrer'})} }); }

async function resolveDataSource(databaseId) {
  const db = await notion(`/databases/${databaseId}`);
  const source = db.data_sources?.[0];
  if (!source?.id) throw new Error(`No data source found under database ${databaseId}.`);
  return source.id;
}

async function queryPublished(dataSourceId) {
  const results = []; let cursor;
  do {
    const body = { page_size: 100, result_type: 'page', filter: { property: 'Published', checkbox: { equals: true } } };
    if (cursor) body.start_cursor = cursor;
    const res = await notion(`/data_sources/${dataSourceId}/query`, { method:'POST', body:JSON.stringify(body) });
    results.push(...(res.results || [])); cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return results;
}

async function children(blockId) {
  const all=[]; let cursor;
  do { const q=cursor ? `?start_cursor=${encodeURIComponent(cursor)}` : ''; const res=await notion(`/blocks/${blockId}/children${q}`); all.push(...(res.results||[])); cursor=res.has_more ? res.next_cursor : null; } while(cursor);
  return all;
}

async function downloadImage(url, subdir) {
  const res=await fetch(url); if(!res.ok) throw new Error(`Failed to download image (${res.status})`);
  const buf=Buffer.from(await res.arrayBuffer()); const type=res.headers.get('content-type')||'image/jpeg'; const ext=type.includes('png')?'png':type.includes('webp')?'webp':'jpg';
  const hash=createHash('sha256').update(buf).digest('hex').slice(0,16); const dir=path.join(IMAGE_DIR,subdir); await mkdir(dir,{recursive:true}); await writeFile(path.join(dir,`${hash}.${ext}`),buf); return `/content/${subdir}/${hash}.${ext}`;
}

async function blocksToHtml(blocks, imageDir, slides) {
  const out=[];
  for(const block of blocks){
    const type=block.type; const data=block[type]; const rich=richTextToHtml(data?.rich_text||[]);
    if(type==='paragraph') out.push(`<p>${rich}</p>`);
    else if(type==='heading_1') out.push(`<h1>${rich}</h1>`);
    else if(type==='heading_2') out.push(`<h2>${rich}</h2>`);
    else if(type==='heading_3') out.push(`<h3>${rich}</h3>`);
    else if(type==='bulleted_list_item') out.push(`<ul><li>${rich}</li></ul>`);
    else if(type==='numbered_list_item') out.push(`<ol><li>${rich}</li></ol>`);
    else if(type==='quote') out.push(`<blockquote>${rich}</blockquote>`);
    else if(type==='code') out.push(`<pre><code>${rich}</code></pre>`);
    else if(type==='divider') out.push('<hr />');
    else if(type==='image'){
      const url=data.type==='external'?data.external.url:data.file?.url; if(url){const local=await downloadImage(url,imageDir); out.push(`<img src="${local}" alt="${escapeHtml(data.caption?.[0]?.plain_text || '')}" />`); slides?.push(local);}
    }
    else if(type==='table'){
      const rows=await children(block.id);
      const hasColumnHeader=Boolean(data.table_has_column_header);
      const rowHtml=rows.filter((row)=>row.type==='table_row').map((row, index)=>{
        const cells=row.table_row?.cells || [];
        const tag=hasColumnHeader && index===0 ? 'th' : 'td';
        return `<tr>${cells.map((cell)=>`<${tag}>${richTextToHtml(cell)}</${tag}>`).join('')}</tr>`;
      }).join('');
      out.push(`<div class="notion-table-wrap"><table>${hasColumnHeader ? `<thead>${rowHtml.split('</tr>')[0]}</tr></thead><tbody>${rowHtml.split('</tr>').slice(1).join('</tr>')}</tbody>` : `<tbody>${rowHtml}</tbody>`}</table></div>`);
    }
    if(block.has_children && type!=='table'){ const nested=await children(block.id); out.push(await blocksToHtml(nested,imageDir,slides)); }
  }
  return out.join('\n');
}

function firstValue(page, names, fallback=''){ for(const name of names){ const v=prop(page,name,''); if(v!=='' && v!==undefined) return v; } return fallback; }

async function syncBlogs(){
  const source=await resolveDataSource(BLOG_DB_ID); const pages=await queryPublished(source); const posts=[];
  for(const page of pages){ const title=firstValue(page,['Title','Name'],'Untitled'); const slug=firstValue(page,['Slug'])||slugify(title); const blocks=await children(page.id); const html=safeHtml(await blocksToHtml(blocks,`blogs/${slug}`)); const tags=firstValue(page,['Tags'],[]); posts.push({slug,title,date:firstValue(page,['Date'],''),readTime:firstValue(page,['Read Time'],'5 min'),excerpt:firstValue(page,['Excerpt'],''),tag:firstValue(page,['Tag'],Array.isArray(tags)?(tags[0]||'General'):'General'),contentHtml:html,cover:firstValue(page,['Cover','Image'],''),tags:Array.isArray(tags)?tags:[]}); }
  await mkdir(CONTENT_DIR,{recursive:true}); await writeFile(path.join(CONTENT_DIR,'blogs.generated.json'),JSON.stringify(posts,null,2)); console.log(`[sync-notion] Blogs: ${posts.length}`);
}

async function syncProjects(){
  const output=path.join(CONTENT_DIR,'projects.generated.json');
  if(!PROJECT_DB_ID){
    await mkdir(CONTENT_DIR,{recursive:true});
    await writeFile(output,'[]');
    console.log('[sync-notion] Projects: 0 (NOTION_PROJECT_DB_ID not configured)');
    return;
  }
  const source=await resolveDataSource(PROJECT_DB_ID); const pages=await queryPublished(source); const projects=[];
  for(const page of pages){
    const title=firstValue(page,['Title','Name'],'Untitled'); const slug=firstValue(page,['Slug'])||slugify(title);
    const tags=firstValue(page,['Tags'],[]);
    const image=firstValue(page,['Image','Cover','Hero','Visual'],'');
    let localImage=image;
    if(image && /^https?:\/\//.test(image)){
      try { localImage=await downloadImage(image,`projects/${slug}`); }
      catch(error){ console.warn(`[sync-notion] Could not download project image for ${slug}: ${error.message}`); localImage=''; }
    }
    projects.push({
      slug,
      title,
      summary:firstValue(page,['Summary','Excerpt','Description']),
      outcome:firstValue(page,['Outcome','Metric']),
      tags:Array.isArray(tags)?tags:[],
      image:localImage,
      challenge:firstValue(page,['Challenge']),
      approach:firstValue(page,['Approach']),
      result:firstValue(page,['Result','Details']),
      link:firstValue(page,['Link','URL','Project Link']),
      date:firstValue(page,['Date'],'')
    });
  }
  await mkdir(CONTENT_DIR,{recursive:true}); await writeFile(output,JSON.stringify(projects,null,2)); console.log(`[sync-notion] Projects: ${projects.length}`);
}

async function syncCaseStudies(){
  const source=await resolveDataSource(CASE_DB_ID); const pages=await queryPublished(source); const studies=[];
  for(const page of pages){ const title=firstValue(page,['Title','Name'],'Untitled'); const slug=firstValue(page,['Slug'])||slugify(title); const blocks=await children(page.id); const slides=[]; const html=safeHtml(await blocksToHtml(blocks,`case-studies/${slug}`,slides)); const tags=firstValue(page,['Tags'],[]); studies.push({slug,title,client:firstValue(page,['Client']),metric:firstValue(page,['Metric','Outcome']),duration:firstValue(page,['Duration']),body:firstValue(page,['Summary','Excerpt']),date:firstValue(page,['Date'],''),time:firstValue(page,['Read Time','Time'],'8 min'),tags:Array.isArray(tags)?tags:[],visual:firstValue(page,['Visual'],'CASE\nSTUDY'),contentHtml:html,slides,hero:firstValue(page,['Hero','Visual'],'CASE STUDY')}); }
  await mkdir(CONTENT_DIR,{recursive:true}); await writeFile(path.join(CONTENT_DIR,'case-studies.generated.json'),JSON.stringify(studies,null,2)); console.log(`[sync-notion] Case studies: ${studies.length}`);
}

await syncBlogs();
await syncCaseStudies();
await syncProjects();
console.log('[sync-notion] Done.');
