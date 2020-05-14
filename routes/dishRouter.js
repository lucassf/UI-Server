const express = require('express');
const bodyParser = require('body-parser');

const dishRouter = express.Router();

dishRouter.use(bodyParser.json());
dishRouter.route('/')
    .all((_req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((_req, res, _next) => {
        res.end('Still in debug mode')
    })
    .post((req, res, _next) => {
        res.end('Will add the dishes ' + req.body.name + ': ' + req.body.description);
    })
    .put((_req, res, _next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete((_req, res, _next) => {
        res.end('Delete still in debug mode');
    });

dishRouter.route('/:dishId')
    .get((req, res, _next) => {
        res.end('Get dish details: ' + req.param.dishId);
    })
    .post((req, res, _next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /dishes/' + req.params.dishId);
    })
    .put((req, res, _next) => {
        res.statusCode = 403;
        res.write('Updating the dish ' + req.params.dishId + '\n');
        res.end('Will update the dish: ' + req.body.name);
    })
    .delete((req, res, _next) => {
        res.end('Delete of dish ' + req.params.dishId + ' still in debug mode')
    });

module.exports = dishRouter
