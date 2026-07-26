import { Link } from "react-router-dom";
import { EnhancedButton } from "@/components/ui/enhanced-button";

const NotFound = () => {
  return (
    <div className="relative flex min-h-[70dvh] items-center overflow-hidden bg-muted">
      <div className="absolute inset-0 bg-lab-grid opacity-80" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">error</p>
        <h1 className="mt-4 text-5xl font-bold text-heading md:text-6xl">404</h1>
        <p className="mt-4 max-w-[46ch] text-base text-muted-foreground">
          No page at <span className="text-sm text-heading">{location.pathname}</span>. It may have
          moved, or the link may be out of date.
        </p>
        <EnhancedButton asChild variant="primary" className="mt-8">
          <Link to="/">back to home</Link>
        </EnhancedButton>
      </div>
    </div>
  );
};

export default NotFound;
