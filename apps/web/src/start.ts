// Global Middleware
import { createStart, createMiddleware } from '@tanstack/react-start';
import { createCsrfMiddleware } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { authGlobalMiddleware } from './middlewares/auth';

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === 'serverFn',
});
export const loggingGlobalMiddleware = createMiddleware({ type: 'request' }).server(
  ({ next, request }) => {
    const url = new URL(request.url);
    const headers = getRequestHeaders();
    console.log(`[${request.method}] ${url.pathname}`);

    return next({
      context: {
        headers: headers,
        req: request,
      },
    });
  },
);

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware, loggingGlobalMiddleware, authGlobalMiddleware],
  };
});
