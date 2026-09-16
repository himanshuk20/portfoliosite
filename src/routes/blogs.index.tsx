import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import posts from '../content/blogs.generated.json';
import { Arrow, SectionTitle, Tag } from '../components/portfolio-shell';

export const Route = createFileRoute('/blogs/')({ head: () => ({ meta: [{ title: 'Blogs — Himanshu Giri' }] }), component: BlogsPage });
const allTags = Array.from(new Set(posts.map((post) => post.tag)));
function BlogsPage() {
  const [query,setQuery]=useState(''); const [filter,setFilter]=useState<string>('All');
  const filters = useMemo(() => ['All', ...allTags], []);
  const filtered=useMemo(()=>posts.filter((post)=>{const q=query.trim().toLowerCase(); const hay=`${post.title} ${post.excerpt} ${post.tag}`.toLowerCase(); return (!q||hay.includes(q))&&(filter==='All'||post.tag.toLowerCase()===filter.toLowerCase());}),[query,filter]);
  return <div className="page-shell"><SectionTitle eyebrow="Blogs" title="Thoughts, learnings & ideas" description="Writing about product, technology, systems and the things I learn while building." />
    <div className="toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search blogs..." aria-label="Search blogs" /></label><div className="filter-pills" aria-label="Blog filters">{filters.map(f=><button type="button" key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div>
    <div className="content-scroll article-list">{filtered.map((post, i) => <Link key={post.slug} to="/blogs/$slug" params={{slug:post.slug}} className="large-list-card"><div className={`article-thumb thumb-${i}`}>{post.tag}</div><div className="list-card-copy"><div><Tag>{post.tag}</Tag><span className="list-date">{post.date}</span></div><h2>{post.title}</h2><p>{post.excerpt}</p><div className="read-meta">{post.readTime} read</div></div><Arrow /></Link>)}{filtered.length===0&&<div className="empty-state">{posts.length===0 ? 'No blogs published yet.' : 'No blogs match your search.'}</div>}</div>
  </div>;
}
