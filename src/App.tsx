import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Calendar from "./pages/Calendar";
import Collaborations from "./pages/Collaborations";
import Officers from "./pages/Officers";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import {
  ConceptFrame,
  ConceptReviewHome,
} from "./concepts/ConceptReview";

const ResearchEditorial = lazy(
  () => import("./concepts/research-editorial/ResearchEditorial"),
);
const LabNotebook = lazy(
  () => import("./concepts/lab-notebook/LabNotebook"),
);
const BioNetwork = lazy(
  () => import("./concepts/bio-network/BioNetwork"),
);

const queryClient = new QueryClient();

const StandardSite = () => (
  <div className="flex flex-col min-h-screen">
    <Navigation />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/collaborations" element={<Collaborations />} />
        <Route path="/officers" element={<Officers />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

const ConceptLoading = () => (
  <div className="concept-loading" role="status" aria-live="polite">
    <div className="concept-loading-line concept-loading-line-wide" />
    <div className="concept-loading-line" />
    <span>Loading design direction</span>
  </div>
);

const ConceptSite = () => (
  <Routes>
    <Route path="/concepts" element={<ConceptReviewHome />} />
    <Route
      path="/concepts/research-editorial"
      element={
        <ConceptFrame activeId="research-editorial">
          <Suspense fallback={<ConceptLoading />}>
            <ResearchEditorial />
          </Suspense>
        </ConceptFrame>
      }
    />
    <Route
      path="/concepts/lab-notebook"
      element={
        <ConceptFrame activeId="lab-notebook">
          <Suspense fallback={<ConceptLoading />}>
            <LabNotebook />
          </Suspense>
        </ConceptFrame>
      }
    />
    <Route
      path="/concepts/bio-network"
      element={
        <ConceptFrame activeId="bio-network">
          <Suspense fallback={<ConceptLoading />}>
            <BioNetwork />
          </Suspense>
        </ConceptFrame>
      }
    />
    <Route path="*" element={<ConceptReviewHome />} />
  </Routes>
);

const AppRoutes = () => {
  const location = useLocation();
  return location.pathname.startsWith("/concepts") ? (
    <ConceptSite />
  ) : (
    <StandardSite />
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
