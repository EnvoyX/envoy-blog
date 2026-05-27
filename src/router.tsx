import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

import { DefaultErrorComponent } from './components/web/DefaultErrorComponent';
import { DefaultPendingComponent } from './components/web/DefaultPendingComponent';
import { NotFoundGlobal } from './components/web/NotFoundGlobal';
import { getQueryClient } from './components/web/query-provider';
// Import the generated route tree
import { routeTree } from './routeTree.gen';

const queryClient = getQueryClient();
// Create a new router instance
export const getRouter = () => {
  const router = createRouter({
    routeTree,
    defaultErrorComponent: (props) => <DefaultErrorComponent {...props} />,
    defaultNotFoundComponent: () => <NotFoundGlobal />,
    defaultPendingComponent: () => <DefaultPendingComponent />,
    defaultPendingMs: 500, // only show if loading takes longer than 0.5s
    defaultPendingMinMs: 300, // if shown, stay for at least 0.3s to avoid flickering
    // optionally expose the QueryClient via router context
    // user and session context properties data are fetched from __root.tsx via beforeLoad from createRootRouteWithContext function
    context: {
      queryClient: queryClient,
      user: null!,
      session: null!,
    },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    // optional:
    handleRedirects: true,
    // wrapQueryClient: true,
  });

  return router;
};
