///<reference path="./index.d.ts" />
import { RequestHandler, IRouter } from 'express';
import layer = require('express/lib/router/layer');

export interface GenericsRouter<T> extends IRouter<T> {
  init?: any;
  _router?: any;
}

function distinctMiddlewaresByReference<T>(middlewares: GenericsRouter<T>[]) {
  const distinct: GenericsRouter<T>[] = [];
  middlewares.forEach((middleware) => {
    if (!distinct.some(dm => dm === middleware)) {
      distinct.push(middleware);
    }
  });

  return distinct;
}

function injectMiddlewaresRecursive<T>(
  middleware: GenericsRouter<T>,
  injectLayers: layer[],
  appCount: number,
) {
  const stack = middleware.stack || (middleware._router && middleware._router.stack);
  stack.forEach((layer, index) => {
    if (layer.route) {
      if (!(middleware.name === 'app' && index < stack.length - appCount)) {
        layer.route.stack.unshift(...injectLayers);
      }
    } else if (layer.name === 'router' || layer.name === 'bound dispatch') {
      injectMiddlewaresRecursive(layer.handle, injectLayers, appCount);
    }
  });
}

export function injectMiddleware<T>(
  injectedMiddlewares: RequestHandler[],
  groupingMiddlewares: GenericsRouter<T>[],
): RequestHandler {
  const distinctMiddlewares = distinctMiddlewaresByReference(groupingMiddlewares);
  const injectLayers = injectedMiddlewares.map(i => new layer('', {}, i));
  // If the name is app, it should skip n layers before inject middlewares.
  const appCount = groupingMiddlewares.filter(m => m.name === 'app').length;

  distinctMiddlewares.forEach((middleware) => {
    injectMiddlewaresRecursive(middleware, injectLayers, appCount);
  });

  return (function (req, res, next) {
    return next();
  }) as RequestHandler;
}
