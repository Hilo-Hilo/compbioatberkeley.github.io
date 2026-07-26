import { AlertCircle } from "lucide-react";
import { useOfficers } from "@/hooks/useOfficers";
import { useOfficersFa25 } from "@/hooks/useOfficersFa25";
import { OfficerCard } from "@/components/OfficerCard";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Officer } from "@/types/officers";

const Grid = ({ officers }: { officers: Officer[] }) => {
  if (officers.length === 0) {
    return (
      <div className="rounded border border-border bg-card p-8 text-center">
        <h2 className="text-lg font-bold text-heading">No officers published yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Check back soon for the updated leadership roster.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {officers.map((officer, index) => (
        <OfficerCard key={`${officer.name}-${officer.role}-${index}`} officer={officer} />
      ))}
    </div>
  );
};

const Loading = () => (
  <div
    className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    aria-busy="true"
    aria-label="Loading officers"
  >
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="h-[300px] animate-pulse rounded border border-border bg-muted" />
    ))}
  </div>
);

const LoadError = ({ label }: { label: string }) => (
  <div className="flex items-start gap-3 rounded border border-border bg-card p-5" role="alert">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
    <p className="text-sm text-muted-foreground">
      Unable to load {label}. Please try again later.
    </p>
  </div>
);

const Officers = () => {
  const { officers, loading, error } = useOfficers();
  const { officers: officersFa25, loading: loadingFa25, error: errorFa25 } =
    useOfficersFa25();

  return (
    <div>
      <PageHeader
        eyebrow="04 / officers"
        title="Our leadership team"
        lede="Meet the dedicated students leading Computational Biology at Berkeley."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="mb-8 h-auto gap-1 rounded border border-border bg-muted p-1">
            <TabsTrigger
              value="current"
              className="rounded px-4 py-2 text-xs data-[state=active]:bg-button-surface data-[state=active]:shadow-none"
            >
              spring 2026
            </TabsTrigger>
            <TabsTrigger
              value="previous"
              className="rounded px-4 py-2 text-xs data-[state=active]:bg-button-surface data-[state=active]:shadow-none"
            >
              previous semesters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-0">
            {loading ? (
              <Loading />
            ) : error ? (
              <LoadError label="officers data" />
            ) : (
              <Grid officers={officers} />
            )}
          </TabsContent>

          <TabsContent value="previous" className="mt-0">
            <Accordion type="single" collapsible defaultValue="fa25" className="w-full">
              <AccordionItem value="fa25" className="border-border">
                <AccordionTrigger className="text-base hover:text-link hover:no-underline">
                  fall 2025
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {loadingFa25 ? (
                    <Loading />
                  ) : errorFa25 ? (
                    <LoadError label="Fall 2025 officers data" />
                  ) : (
                    <Grid officers={officersFa25} />
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        <div className="mt-16 rounded border border-border bg-muted p-8 md:p-10">
          <h2 className="text-xl font-bold text-heading">Interested in leadership?</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="border-t border-border pt-3">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-label">Elections</dt>
              <dd className="mt-1 text-sm text-muted-foreground">Held each semester.</dd>
            </div>
            <div className="border-t border-border pt-3">
              <dt className="text-[11px] uppercase tracking-[0.12em] text-label">Contact</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                Reach us through our social channels.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
};

export default Officers;
