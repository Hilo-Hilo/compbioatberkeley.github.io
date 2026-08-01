import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppContent } from "./App";

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export const render = (pathname: string) => {
  const location = routerBasename === "/"
    ? pathname
    : `${routerBasename}${pathname}`;

  return renderToString(
    <StaticRouter basename={routerBasename} location={location}>
      <AppContent />
    </StaticRouter>,
  );
};
