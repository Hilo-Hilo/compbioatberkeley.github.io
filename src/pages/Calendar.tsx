import { ExternalLink } from "lucide-react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { PageHeader } from "@/components/PageHeader";

const CALENDAR_SRC =
  "https://calendar.google.com/calendar/embed?src=c_89fd0fd6639f6879e54e29cf6160bd6b715c0d824d84fdc0166332e82c13404c%40group.calendar.google.com&ctz=America%2FLos_Angeles";

const Calendar = () => (
  <div>
    <PageHeader
      eyebrow="02 / calendar"
      title="Events calendar"
      lede="Stay up to date with our workshops, meetings, and special events."
    />

    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <div className="overflow-hidden rounded border border-border">
        <div className="flex flex-col gap-1 border-b border-border bg-muted px-4 py-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span className="uppercase tracking-[0.12em]">Google Calendar</span>
          <span>Pacific time</span>
        </div>
        <iframe
          src={CALENDAR_SRC}
          className="h-[600px] w-full border-0 bg-background"
          title="Computational Biology at Berkeley events calendar"
          loading="lazy"
        />
      </div>

      <div className="mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <EnhancedButton asChild variant="outline">
          <a href={CALENDAR_SRC} target="_blank" rel="noopener noreferrer">
            open full calendar
            <ExternalLink />
          </a>
        </EnhancedButton>
        <p className="text-sm text-muted-foreground">
          Subscribe to get notifications about upcoming events.
        </p>
      </div>
    </section>
  </div>
);

export default Calendar;
