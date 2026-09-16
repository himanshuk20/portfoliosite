import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import generatedStudies from '../content/case-studies.generated.json';
import { Arrow, SectionTitle, Tag } from '../components/portfolio-shell';

export const Route = createFileRoute('/case-studies/')({ head: () => ({ meta: [{ title: 'Case Studies — Himanshu Giri' }] }), component: CaseStudiesPage });
const studies = (generatedStudies as Array<{slug:string;title:string;body?:string;date?:string;time?:string;tags?:string[];visual?:string}>).map((s)=>({...s,body:s.body||'',date:s.date||'',time:s.time||'8 min',tags:s.tags||[],visual:s.visual||'CASE\nSTUDY'}));
const allTags = Array.from(new Set(studies.flatMap((s)=>s.tags)));
const filters=['All', ...allTags] as const;
function CaseStudiesPage(){
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState<string>('All');
  const filtered=useMemo(()=>studies.filter((s)=>{const q=query.trim().toLowerCase(); return (!q || `${s.title} ${s.body} ${s.tags.join(' ')}`.toLowerCase().includes(q)) && (filter==='All' || s.tags.includes(filter));}),[query,filter]);
  return <div className="page-shell"><SectionTitle eyebrow="Case Studies" title="Proof, not promises" description="In-depth explorations of product problems, decisions, experiments and outcomes."/><div className="toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search case studies..." aria-label="Search case studies" /></label><div className="filter-pills" aria-label="Case study filters">{filters.map((f)=><button type="button" key={f} className={filter===f?'selected':''} onClick={()=>setFilter(f)}>{f}</button>)}</div></div><div className="content-scroll case-index-list">{filtered.map(s=><Link key={s.slug} to="/case-studies/$slug" params={{slug:s.slug}} className="large-list-card"><div className="case-thumb large">{s.visual}</div><div className="list-card-copy"><div className="tag-row">{s.tags.slice(0,3).map(t=><Tag key={t}>{t}</Tag>)}</div><h2>{s.title}</h2><p>{s.body}</p><div className="read-meta">{s.date} · {s.time} read</div></div><Arrow/></Link>)}{filtered.length===0&&<div className="empty-state">{studies.length===0 ? 'No case studies published yet.' : 'No case studies match your search.'}</div>}</div></div>
}
