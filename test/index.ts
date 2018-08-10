import { expect } from 'chai';
import * as express from 'express';
import * as request from 'supertest';

import { injectMiddleware } from '../src';

describe('Group middleware test', () => {
  const result: string[] = [];

  const m1: express.RequestHandler = (req, res, next) => {
    result.push('m1');
    return next();
  };

  const m2: express.RequestHandler = (req, res, next) => {
    result.push('m2');
    return next();
  };

  afterEach(() => {
    result.length = 0;
  });

  it('should inject middlewares into app.[METHOD]', () => {
    const app = express();

    app.use(injectMiddleware([m1, m2], [
      app.get('/test', (req, res, next) => { res.end(); }),
    ]));

    request(app)
      .get('/test')
      .end((err, res) => {
        expect(result).to.deep.equal(['m1', 'm2']);
      });
  });

  it('should inject middlewares into router', () => {
    const app = express();
    const router = express.Router();

    app.use(injectMiddleware([m1, m2], [
      router.get('/test', (req, res, next) => { res.end(); }),
    ]));

    app.use(router);

    request(app)
      .get('/test')
      .end((err, res) => {
        expect(result).to.deep.equal(['m1', 'm2']);
      });
  });

  it('should skip n layers before inject to app stack', () => {
    const app = express();

    // this middleware's stack should not be injected.
    app.get('/test1', (req, res) => {
      result.push('m3');
      res.end();
    });

    app.use(injectMiddleware([m1, m2], [
      app.get('/test', (req, res, next) => { res.end(); }),
    ]));

    request(app)
      .get('/test1')
      .end((err, res) => {
        expect(result).to.have.lengthOf(1);
      });
  });

  it('should accept app.use', () => {
    const app = express();
    const router = express.Router();

    // this middleware's stack should not be injected.
    router.get('/test1', (req, res) => {
      result.push('test1');
      res.end();
    });

    app.use(injectMiddleware([m1, m2], [
      app.use(router),
    ]));

    request(app)
      .get('/test1')
      .end((err, res) => {
        expect(result).to.have.lengthOf(3);
      });
  });

  it('should distinct the same app instance', () => {
    const app = express();
    const router1 = express.Router();
    const router2  = express.Router();

    router1.get('/test1', (req, res) => {
      result.push('test1');
      res.end();
    });

    router2.get('/test2', (req, res) => {
      result.push('test2');
      res.end();
    });

    app.use(injectMiddleware([m1, m2], [
      app.use(router1),
      app.use(router2),
    ]));

    request(app)
      .get('/test1')
      .end((err, res) => {
        expect(result).to.have.lengthOf(3);
      });
  });
});
