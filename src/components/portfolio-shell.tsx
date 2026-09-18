import { Link, useLocation } from '@tanstack/react-router';
import { BriefcaseBusiness, Download, FileText, FolderKanban, Github, Home, Linkedin, Mail, PenLine, SunMedium, Twitter, UserRound } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/about', label: 'About', icon: UserRound },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/case-studies', label: 'Case Studies', icon: FileText },
  { to: '/blogs', label: 'Blogs', icon: PenLine },
] as const;

const THEME_KEY = 'himanshu-portfolio-theme';

export function PortfolioShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const active = (to: string) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div className="portfolio-app">
      <aside className="portfolio-sidebar">
        <div>
          <Link to="/" className="portfolio-name">Himanshu<br />Giri</Link>
          <p className="portfolio-role">Product Manager&nbsp; · &nbsp;B.Tech IT&nbsp; · &nbsp;Builder</p>
          <p className="portfolio-intro">I build products at the intersection of user needs, business, design and technology. Currently focused on product management and creating meaningful, user-centric solutions at scale.</p>
          <div className="sidebar-actions">
            <a className="sidebar-button primary" href="/Himanshu_Giri_Resume.pdf" download><Download size={16}/>Download Resume<span>→</span></a>
            <Link className="sidebar-button" to="/contact"><Mail size={16}/>Get in touch<span>→</span></Link>
          </div>
          <nav className="sidebar-nav" aria-label="Portfolio navigation">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={`sidebar-nav-item ${active(to) ? 'active' : ''}`}>
                <Icon size={18}/><span>{label}</span>
              </Link>
            ))}
            <a href="/about#experience" className="sidebar-nav-item">
  <BriefcaseBusiness size={18}/>
  <span>Experience</span>
</a>
          </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="socials">
            <a href="https://www.linkedin.com/in/himanshu-giri-179516259/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20}/></a>
            <a href="https://github.com/himanshuk20" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={20}/></a>
            <a href="https://x.com/Himanshu29g" target="_blank" rel="noopener noreferrer" aria-label="X"><Twitter size={20}/></a>
            <a href="mailto:himanshugiri0829@gmail.com" aria-label="Email"><Mail size={20}/></a>
          </div>
          <button type="button" className="theme-row" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            <SunMedium size={18}/><span>{theme}</span>
          </button>
          <p className="sidebar-tagline">“Build. Learn. Share. Repeat.”</p>
        </div>
      </aside>
      <main className="portfolio-content">{children}</main>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-heading"><div><div className="section-eyebrow">// {eyebrow}</div>{title && <h1>{title}</h1>}{description && <p>{description}</p>}</div>{action}</div>;
}

export function Tag({ children }: { children: ReactNode }) { return <span className="tag">{children}</span>; }
export function Arrow() { return <span className="arrow" aria-hidden="true">↗</span>; }
