import { createFileRoute } from "@tanstack/react-router";
import projectsData from "../content/projects.generated.json";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Selected Projects — Himanshu Giri" },
      { name: "description", content: "Selected product management projects across product, UX, strategy, and growth." },
      { property: "og:title", content: "Selected Projects — Himanshu Giri" },
      { property: "og:description", content: "Selected product management projects across product, UX, strategy, and growth." },
    ],
  }),
  component: ProjectsPage,
});

type Project = {
  slug: string;
  title: string;
  summary?: string;
  outcome?: string;
  tags?: string[];
  image?: string;
  challenge?: string;
  approach?: string;
  result?: string;
  link?: string;
  date?: string;
};

const projects = (projectsData as Project[]).sort((a, b) => {
  const parseDate = (value?: string) => {
    if (!value) return 0;
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) return timestamp;
    const year = value.match(/\b(20\d{2})\b/)?.[1];
    return year ? Date.parse(`${year}-01-01`) : 0;
  };
  return parseDate(b.date) - parseDate(a.date);
});

function ProjectsPage() {
  return (
    <div className="bg-background">
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Projects
        </p>
        <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Selected Projects
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A selection of products and product work across discovery, strategy, UX, and execution.
        </p>

        {projects.length === 0 ? (
          <div className="mt-16 rounded-lg border border-dashed border-border px-6 py-24 text-center text-sm text-muted-foreground">
            Updating soon.
          </div>
        ) : (
          <div className="mt-16 space-y-10">
            {projects.map((project, index) => {
              const content = (
                <article className="selected-project-card group grid gap-8 rounded-xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:grid-cols-2 lg:items-center lg:p-6">
                  <div className={index % 2 === 1 ? "lg:col-start-2 lg:row-start-1" : ""}>
                    <div className="overflow-hidden rounded-lg bg-stone">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          width={1024}
                          height={768}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {project.title}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-2">
                        {(project.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {project.link && <span className="project-link-arrow" aria-hidden="true">↗</span>}
                    </div>

                    <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      {project.title}
                    </h2>
                    {project.summary && (
                      <p className="mt-3 text-base text-muted-foreground">{project.summary}</p>
                    )}

                    {(project.challenge || project.approach || project.result) && (
                      <div className="mt-6 space-y-4">
                        {project.challenge && (
                          <div>
                            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                              Challenge
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {project.challenge}
                            </p>
                          </div>
                        )}
                        {project.approach && (
                          <div>
                            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                              Approach
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {project.approach}
                            </p>
                          </div>
                        )}
                        {project.result && (
                          <div>
                            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                              Outcome
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {project.result}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {project.outcome && (
                      <div className="mt-8 inline-flex items-center rounded-md bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                        {project.outcome}
                      </div>
                    )}
                  </div>
                </article>
              );

              return project.link ? (
                <a
                  key={project.slug}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {content}
                </a>
              ) : (
                <div key={project.slug}>{content}</div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
