declare module 'express/lib/router/layer' {
  import { RequestHandler } from 'express';
  class Layer {
    handle: RequestHandler;
    name: string;
    params: any;
    path?: string;
    keys: any[];
    regexp: RegExp;
    method: string;
    constructor(path: string, options: object, fn: RequestHandler);
  }

  export = Layer;
}

// error TS2304: Cannot find name 'XMLHttpRequest'
declare interface XMLHttpRequest {}
// error TS2304: Cannot find name 'Blob'
declare interface Blob {}
