import { useEffect, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { activeNotices } from "@/data/siteNotices.js";

type Notice = (typeof __SITE_NOTICES__)[number];

function useNotices(): Notice[] {
  // Use the same build snapshot for the first browser render and static HTML.
  const [notices, setNotices] = useState<Notice[]>(__SITE_NOTICES__);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      const now = Date.now();
      const current = activeNotices(__SITE_NOTICES__, now);
      setNotices(current);
      if (current.length) {
        const next = Math.min(...current.map((notice) => Date.parse(notice.endsAt)));
        timer = setTimeout(refresh, Math.min(next - now, 2_147_483_647));
      }
    };
    refresh();
    return () => clearTimeout(timer);
  }, []);
  return notices;
}

function NoticeBanner({ notice }: { notice: Notice }) {
  const [dismissed, setDismissed] = useState(false);
  const storageKey = `dismissed-notice:${notice.id}`;
  const revision = JSON.stringify(notice);
  useEffect(() => {
    try { setDismissed(sessionStorage.getItem(storageKey) === revision); } catch { /* Storage can be disabled. */ }
  }, [storageKey, revision]);
  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(storageKey, revision); } catch { /* Dismissal still works for this page. */ }
  };
  if (dismissed) return null;
  return (
    <aside aria-label={`${notice.title} reminder`} className="border-b border-gold/30 bg-gold text-gold-foreground">
      <div className="mx-auto flex max-w-6xl items-start gap-4 px-4 py-3 text-sm sm:items-center sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="leading-relaxed">
            <strong className="font-bold">{notice.title}</strong>
            <span className="mx-2" aria-hidden="true">·</span>
            <time dateTime={notice.startsAt}>{notice.shortDateLabel}</time>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>{notice.timeLabel}</span>
          </p>
          <a href={notice.url} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit shrink-0 items-center gap-2 rounded font-bold text-gold-foreground underline underline-offset-4 hover:text-gold-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
            {notice.linkLabel}<ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
        <button type="button" onClick={dismiss} aria-label={`Dismiss ${notice.title} banner`} className="-my-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded hover:bg-black/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

export function NoticeBanners() {
  return useNotices().map((notice) => <NoticeBanner key={notice.id} notice={notice} />);
}

export function NoticeCards({ className = "" }: { className?: string }) {
  const notices = useNotices();
  if (!notices.length) return null;
  return (
    <section aria-label="Event notices" className={className}>
      <div className="grid gap-4">
        {notices.map((notice) => (
          <article key={notice.id} id={notice.id} aria-labelledby={`${notice.id}-title`} className="scroll-mt-24 rounded border border-border bg-card p-6 md:p-8">
            <p className="eyebrow">On the calendar</p>
            <h2 id={`${notice.id}-title`} className="mt-3 text-2xl font-bold text-heading">{notice.title}</h2>
            <p className="mt-3 text-sm font-semibold text-heading md:text-base">
              <time dateTime={notice.startsAt}>{notice.dateLabel}</time>
              <span className="mx-2" aria-hidden="true">·</span>{notice.timeLabel}
            </p>
            <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">{notice.description}</p>
            <EnhancedButton asChild variant="primary" className="mt-6 w-full sm:w-auto">
              <a href={notice.url} target="_blank" rel="noopener noreferrer">
                {notice.linkLabel}<ExternalLink aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </EnhancedButton>
          </article>
        ))}
      </div>
    </section>
  );
}
