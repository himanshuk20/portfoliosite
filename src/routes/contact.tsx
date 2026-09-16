import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Himanshu Giri" },
      { name: "description", content: "Get in touch for product leadership opportunities, advisory work, or a conversation." },
      { property: "og:title", content: "Contact — Himanshu Giri" },
      { property: "og:description", content: "Get in touch for product leadership opportunities, advisory work, or a conversation." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    // Hidden honeypot field — real visitors never fill this in. Bots that
    // auto-fill every field on the page will, so we drop it silently.
    const hpField = String(form.get("hp_field") ?? "");

    if (hpField) {
      setStatus("success");
      return;
    }

    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setError("Please fill in every field with a valid email.");
      return;
    }

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      setStatus("error");
      setError("Contact form isn't configured yet. Please email directly instead.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Portfolio contact — ${name}`,
          from_name: name,
          name,
          email,
          message,
        }),
      });
      const result = await res.json().catch(() => null);
      if (res.ok && result?.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError("Something went wrong sending your message. Please try emailing directly.");
      }
    } catch {
      setStatus("error");
      setError("Couldn't reach the mail service. Please try emailing directly.");
    }
  };

  return (
    <div className="bg-background">
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Contact
          </p>
          <h1 className="font-display mt-4 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Let's talk.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Whether you're hiring, looking for product advice, GTM or just want to
            swap notes on a hard problem, I'd love to hear from you.
          </p>
          <div className="mt-10 space-y-6">
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Email
              </h2>
              <a
                href="mailto:himanshugiri0829@gmail.com"
                className="mt-1 text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                himanshugiri0829@gmail.com
              </a>
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Location
              </h2>
              <p className="mt-1 text-base text-muted-foreground">New Delhi, India</p>
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                Connect
              </h2>
              <div className="mt-1 flex items-center gap-4">
                <a
                  href="https://www.linkedin.com/in/himanshu-giri-179516259/"
                  target = "_blank"
                  rel="noopener noreferrer"
                  className="text-base text-muted-foreground transition-colors hover:text-foreground"
                >
                  LinkedIn
                </a>
                <a
                  href="https://x.com/Himanshu29g"
                  target = "_blank"
                  rel="noopener noreferrer"
                  className="text-base text-muted-foreground transition-colors hover:text-foreground"
                >
                  Twitter
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="font-display mt-4 text-xl font-semibold text-card-foreground">
                Message sent
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Thanks for reaching out. I'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot — hidden from real users via CSS, bots fill every field they see */}
              <div className="absolute left-[-9999px]" aria-hidden="true">
                <label htmlFor="hp_field">Leave this field empty</label>
                <input id="hp_field" name="hp_field" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              {status === "error" && error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-card-foreground"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-card-foreground"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-card-foreground"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  placeholder="Tell me about your project or opportunity..."
                />
              </div>
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
              >
                {status === "submitting" ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
