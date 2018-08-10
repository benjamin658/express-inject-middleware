# express-inject-middleware

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Inject stack of middlewares into given routes or middlewares.

With this middleware, it can easily define express routes as a group that use one set of middlewares.

## Installation

`npm install express-inject-middleware --save`

## Example Usage


### Basic example

```javascript
import express from 'express';
import { injectMiddleware } from 'express-inject-middleware';

const app = express();

const authMiddleware = (req, res, next) => {
  // some auth logic...
};

const fooMiddleware = (req, res, next) => {
  // some foo logic
}

const barMiddleware = (req, res, next) => {
  // some bar logic
}

app.use(injectMiddleware(
  [
    authMiddleware,
    fooMiddleware,
  ],
  [
    // Passing the app.[METHOD] as the parameter.
    app.get('/secrets', (req, res, next) => res.send('secrets'));

    // Mount barMiddleware itself
    app.post('/secrets', barMiddleware, (req, res, next) => res.send('ok'));
  ],
));
```

Will become...

```javascript
app.get('/secrets', authMiddleware, fooMiddleware, (req, res, next) => res.send('secrets'));
app.post('/secrets', authMiddleware, fooMiddleware, barMiddleware, (req, res, next) => res.send('secrets'));
```

### Working with express.Router

```javascript
import express from 'express';
import { injectMiddleware } from 'express-inject-middleware';

const app = express();
const router = express.Router();

const authMiddleware = (req, res, next) => {
  // some auth logic...
};

const fooMiddleware = (req, res, next) => {
  // some foo logic
}

app.use(injectMiddleware(
  [
    authMiddleware,
    fooMiddleware,
  ],
  [
    // Passing the router.[METHOD] as the parameter.
    router.get('/secrets', (req, res, next) => res.send('secrets'));
  ],
));
```

Will become...

```javascript
router.get('/secrets', authMiddleware, fooMiddleware, (req, res, next) => res.send('secrets'));
```

### Combine app and router

```javascript
import express from 'express';
import { injectMiddleware } from 'express-inject-middleware';

const app = express();
const router1 = express.Router();
const router2 = express.Router();

const authMiddleware = (req, res, next) => {
  // some auth logic...
};

router1.get('/foo', (req, res, next) => res.send('foo with secret'));
router2.get('/bar', (req, res, next) => res.send('bar with secret'));

app.use(injectMiddleware(
  [
    authMiddleware,
  ],
  [
    // Passing app.use as the parameter
    app.use('/api', router1);
    app.use('/api', router2);
  ],
));

// Both of the "/api/foo" and "/api/bar" will use the authMiddleware.
```

## License

```text
            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.


```