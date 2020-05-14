const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());
promoRouter.route('/')
    .all((_req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((_req, res, _next) => {
        res.end('Still in debug mode')
    })
    .post((req, res, _next) => {
        res.end('Will add the promotions ' + req.body.name + ': ' + req.body.description);
    })
    .put((_req, res, _next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete((_req, res, _next) => {
        res.end('Delete still in debug mode');
    });

promoRouter.route('/:promoId')
    .get((req, res, _next) => {
        res.end('Get promotion details: ' + req.param.promoId);
    })
    .post((req, res, _next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /promotions/' + req.params.promoId);
    })
    .put((req, res, _next) => {
        res.statusCode = 403;
        res.write('Updating the promotion ' + req.params.promoId + '\n');
        res.end('Will update the promotion: ' + req.body.name);
    })
    .delete((req, res, _next) => {
        res.end('Delete of promotion ' + req.params.promoId + ' still in debug mode')
    });

module.exports = promoRouter
