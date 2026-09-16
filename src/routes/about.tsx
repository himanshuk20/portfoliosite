import { createFileRoute, Link } from '@tanstack/react-router';
import { BookOpen, BriefcaseBusiness, Camera, CircleUserRound, Gamepad2, GraduationCap, Heart, Lightbulb, MapPin, Rocket, Sparkles, Trophy, UsersRound, Wrench } from 'lucide-react';
import { Arrow, Tag } from '../components/portfolio-shell';

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About — Himanshu Giri' }] }),
  component: AboutPage,
});

const experiences = [
  { role: 'Founding Product Lead', company: 'Scoobyz', period: '2026 - Present', description: 'Building a two-sided marketplace for student needs.', icon: Rocket },
  { role: 'Product Management Intern', company: 'Lobb Logistics', period: '2025 - 2026', description: 'Worked on truck filtering for the B2B platform.', icon: BriefcaseBusiness },
  { role: 'B.Tech in Information Technology', company: 'Maharaja Surajmal Institute of Technology (MSIT)', period: '2022 - 2026', description: 'Engineering foundation across technology, systems and problem solving.', icon: GraduationCap },
];

const skills = ['Product Strategy','User Research','Product Analytics','Roadmapping','PRD Writing','Growth','A/B Testing','Figma','SQL','Data Analysis','Market Research','Stakeholder Management'];

const values = [
  { title: 'User First', body: 'I start with real user needs and empathize deeply.', icon: UsersRound },
  { title: 'Outcome Driven', body: 'I focus on impact, not just output.', icon: Lightbulb },
  { title: 'Builder Mindset', body: 'I enjoy taking ideas from 0 → 1 and beyond.', icon: Rocket },
  { title: 'Lifelong Learner', body: 'I constantly seek to learn, adapt and grow.', icon: BookOpen },
];

const beyond = [
  { title: 'Running', body: 'Clears my mind', icon: Trophy },
  { title: 'Travel', body: 'New perspectives', icon: Camera },
  { title: 'Reading', body: 'Better thinking', icon: BookOpen },
  { title: 'F1 / Sports', body: 'Pure joy', icon: Gamepad2 },
];

function AboutPage() {
  return (
    <div className="page-shell about-reference-shell">
      <header className="about-page-heading">
        <div>
          <div className="section-eyebrow">// About Me</div>
          <p>A quick intro, my journey, what drives me, and where I’m headed.</p>
        </div>
        <div className="about-heading-quote">“Better products<br />for a more inclusive tomorrow.”<span /></div>
      </header>

      <div className="content-scroll about-reference-scroll">
        <section className="about-hero-card">
          <div className="about-hero-copy">
            <span className="about-kicker">HELLO, I’M</span>
            <h1>Himanshu Giri</h1>
            <h2>Product Manager | Engineer | Builder</h2>
            <p className="about-lead">I'm a product manager and builder who enjoys turning real user problems into simple, scalable solutions. I like working at the intersection of product, design, engineering, and business — where ideas meet impact. Currently, I’m exploring full-time product opportunities and continue to work on side projects that excite me.</p>
            <div className="about-meta-row">
              <span><MapPin size={15}/> India</span>
              <span><GraduationCap size={15}/> B.tech IT, MSIT</span>
              <span><CircleUserRound size={15}/> Always up for a good conversation</span>
            </div>
            <div className="about-hero-actions">
              <a className="about-cta primary" href="mailto:himanshugiri0829@gmail.com">Let's connect <Arrow /></a>
              <a className="about-cta" href="/Himanshu_Giri_Resume.pdf" download>Download Resume <Arrow /></a>
            </div>
          </div>
          <div className="about-hero-image" role="img" aria-label="A builder looking across a mountain landscape" />
        </section>

        <section className="about-values-grid">
          {values.map(({ title, body, icon: Icon }) => <article className="about-value-card" key={title}><span className="about-icon"><Icon size={22}/></span><div><h3>{title}</h3><p>{body}</p></div></article>)}
        </section>

        <div className="about-lower-grid">
          <section className="about-panel journey-panel" id="experience">
            <div className="about-panel-title"><h2><Sparkles size={21}/> My Journey</h2></div>
            <div className="journey-list">
              {experiences.map(({ role, company, period, description }) => <div className="journey-item" key={company}><span className="journey-period">{period}</span><span className="journey-dot"/><div><h3>{role} <span>— {company}</span></h3><p>{description}</p></div></div>)}
            </div>
            <a href="#experience" className="journey-link">View Full Experience <Arrow /></a>
          </section>

          <div className="about-right-stack">
            <section className="about-panel" id="skills">
              <div className="about-panel-title"><h2><Wrench size={20}/> Skills &amp; Tools</h2><Link to="/projects">View all <Arrow /></Link></div>
              <div className="tag-cloud about-skill-cloud">{skills.map((skill) => <Tag key={skill}>{skill}</Tag>)}</div>
            </section>

            <section className="about-panel" id="more">
              <div className="about-panel-title"><h2><Heart size={21}/> Beyond Work</h2></div>
              <p className="beyond-copy">When I'm not deep in product ideas, you'll probably find me running, exploring new places, reading, or geeking out over technology and productivity tools.</p>
              <div className="beyond-grid">{beyond.map(({ title, body, icon: Icon }) => <div className="beyond-item" key={title}><span className="beyond-icon"><Icon size={19}/></span><div><b>{title}</b><small>{body}</small></div></div>)}</div>
            </section>
          </div>
        </div>

        <section className="about-quote-card"><div className="quote-mark">“</div><blockquote>“I’m motivated by the opportunity to build products that make a real difference — for people, businesses, and a more inclusive future.”</blockquote><div className="quote-mountain" aria-hidden="true">⌁⌁⌁</div><div className="quote-caption">Same journey.<br />Bigger horizons.</div></section>
      </div>
    </div>
  );
}
