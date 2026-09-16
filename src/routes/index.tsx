import { createFileRoute, Link } from '@tanstack/react-router';
import { BriefcaseBusiness, FileText, PenLine, Rocket, GraduationCap } from 'lucide-react';
import { useMemo, useState } from 'react';
import blogs from '../content/blogs.generated.json';
import caseStudiesData from '../content/case-studies.generated.json';
import projectsData from '../content/projects.generated.json';
type CaseStudySummary = { slug: string; title: string; date?: string; body?: string; visual?: string; hero?: string; tags?: string[] };
const caseStudies = caseStudiesData as CaseStudySummary[];
type ProjectSummary = { slug: string; title: string; date?: string; link?: string };
const projects = projectsData as ProjectSummary[];
import { Arrow, SectionTitle, Tag } from '../components/portfolio-shell';

export const Route = createFileRoute('/')({ head: () => ({ meta: [{ title: 'Himanshu Giri — Product Manager' }] }), component: Home });

const experience = [
  {
    company: 'Scoobyz',
    role: 'Founding Product Lead',
    period: 'Mar 2026 — Present',
    logo: '/company-logos/scoobyz.png',
    text: 'Owning the product end-to-end — product vision, user/vendor flows, roadmap, QA and go-to-market.',
    href: 'https://scoobyz.com',
  },
  {
    company: 'Lobb Logistics',
    role: 'Product Management Intern',
    period: 'Jan 2026 — Jun 2026',
    logo: '/company-logos/lobb.png',
    text: 'Worked on truck filtering, user journeys, PRDs, metrics, competitor research and cross-functional delivery.',
    href: 'https://lobb.in',
  },
];

type RecentFilter = 'All' | 'Work' | 'Projects' | 'Blogs' | 'Case Studies';
type RecentItem = {
  text: string;
  date: string;
  type: Exclude<RecentFilter, 'All'>;
  Icon: typeof BriefcaseBusiness;
  sortDate: string;
  href?: string;
};

const staticRecent: RecentItem[] = [
  { text: 'Started Product Management internship at Lobb Logistics', date: 'Jan 2026', type: 'Work', Icon: BriefcaseBusiness, sortDate: '2026-01-01' },
  { text: 'Worked on Truck Filtering feature for B2C logistics', date: 'Mar 2026', type: 'Work', Icon: FileText, sortDate: '2026-03-01' },
  { text: 'Became Founding Product Lead at Scoobyz', date: 'Mar 2026', type: 'Work', Icon: Rocket, sortDate: '2026-03-01' },
  { text: 'B.Tech in Information Technology — MSIT', date: '2022 — 2026', type: 'Work', Icon: GraduationCap, sortDate: '2026-06-01' },
];

const dynamicRecent: RecentItem[] = [
  ...projects.map((project) => ({
    text: project.title,
    date: project.date || '',
    type: 'Projects' as const,
    Icon: Rocket,
    sortDate: project.date || '0000-00-00',
    href: project.link,
  })),
  ...blogs.map((post) => ({
    text: post.title,
    date: post.date,
    type: 'Blogs' as const,
    Icon: PenLine,
    sortDate: post.date || '0000-00-00',
    href: `/blogs/${post.slug}`,
  })),
  ...caseStudies.map((study) => ({
    text: study.title,
    date: study.date || '',
    type: 'Case Studies' as const,
    Icon: FileText,
    sortDate: study.date || '0000-00-00',
    href: `/case-studies/${study.slug}`,
  })),
];

const recent: RecentItem[] = [...staticRecent, ...dynamicRecent].sort((a, b) => {
  const dateDiff = b.sortDate.localeCompare(a.sortDate);
  return dateDiff !== 0 ? dateDiff : b.text.localeCompare(a.text);
});

function Home() {
  const [recentFilter, setRecentFilter] = useState<RecentFilter>('All');
  const filteredRecent = useMemo(() => recentFilter === 'All' ? recent : recent.filter((item) => item.type === recentFilter), [recentFilter]);

  return <div className="dashboard-page">
    <div className="dashboard-grid">
      <section className="panel experience-panel"><SectionTitle eyebrow="Experience" title="" action={<Link to="/about" className="view-all">View all →</Link>} />
        <div className="scroll-list">{experience.map((e) => {
          const isExternal = e.href.startsWith('http');
          const card = <div className="experience-card">
            <div className="company-mark">
  <img src={e.logo} alt={`${e.company} logo`} />
</div><div className="card-main"><div className="muted-line">{e.company}</div><h3>{e.role}</h3><p>{e.text}</p><div className="tag-row"><Tag>Product</Tag><Tag>Strategy</Tag><Tag>UX</Tag></div></div><div className="card-date">{e.period}</div><Arrow />
          </div>;
          return isExternal ? <a href={e.href} target="_blank" rel="noopener noreferrer" key={e.company}>{card}</a> : <Link to={e.href} key={e.company}>{card}</Link>;
        })}</div></section>
      <section className="panel case-panel"><SectionTitle eyebrow="Case Studies" title="" action={<Link to="/case-studies" className="view-all">View all →</Link>} />
        <div className="scroll-list case-list">
          {caseStudies.slice(0, 3).map((s) => <Link key={s.slug} to="/case-studies/$slug" params={{slug: s.slug}} className="case-card"><div className="case-thumb">{s.visual || s.hero || 'CASE\nSTUDY'}</div><div><h3>{s.title}</h3><p>{s.body}</p><Tag>{(s.tags && s.tags[0]) || 'Case Study'}</Tag></div><Arrow /></Link>)}
          {caseStudies.length === 0 && <div className="empty-state">No case studies published yet.</div>}
        </div>
      </section>
      <section className="panel recent-panel"><SectionTitle eyebrow="Recent" title="" /><div className="filter-pills" role="tablist" aria-label="Recent filters">{(['All','Work','Projects','Blogs','Case Studies'] as const).map((filter) => <button type="button" key={filter} className={recentFilter === filter ? 'selected' : ''} onClick={() => setRecentFilter(filter)}>{filter}</button>)}</div><div className="recent-list scroll-list">{filteredRecent.map(({ text, date, Icon, href }) => { const row = <div className="recent-row"><Icon size={17}/><span>{text}</span><time>{date}</time></div>; if (!href) return <div key={`${text}-${date}`}>{row}</div>; if (href.startsWith('/blogs/')) return <Link key={`${text}-${date}`} to="/blogs/$slug" params={{slug: href.slice('/blogs/'.length)}}>{row}</Link>; if (href.startsWith('/case-studies/')) return <Link key={`${text}-${date}`} to="/case-studies/$slug" params={{slug: href.slice('/case-studies/'.length)}}>{row}</Link>; return <a key={`${text}-${date}`} href={href} target="_blank" rel="noopener noreferrer">{row}</a>; })}{filteredRecent.length === 0 && <div className="empty-state">Nothing here yet.</div>}</div></section>
      <section className="panel blogs-panel"><SectionTitle eyebrow="Blogs" title="" action={<Link to="/blogs" className="view-all">View all →</Link>} /><div className="scroll-list blog-mini-list">{blogs.map((post, i) => <Link className="blog-mini" to="/blogs/$slug" params={{slug: post.slug}} key={post.slug}><div className={`blog-thumb thumb-${i}`}>{post.tag}</div><div><h3>{post.title}</h3><p>{post.excerpt}</p></div><time>{post.date}</time><Arrow /></Link>)}
          {blogs.length === 0 && <div className="empty-state">No blogs published yet.</div>}</div></section>
    </div>
    <div className="dashboard-footer">Build products. Think deeply. Share what you learn.</div>
  </div>;
}
