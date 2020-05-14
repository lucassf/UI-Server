const express = require('express');
const bodyParser = require('body-parser');

const leaderRouter = express.Router();

leaderRouter.use(bodyParser.json());
leaderRouter.route('/')
    .all((_req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((_req, res, _next) => {
        res.end('Still in debug mode')
    })
    .post((req, res, _next) => {
        res.end('Will add the leaders ' + req.body.name + ': ' + req.body.description);
    })
    .put((_req, res, _next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /leaders');
    })
    .delete((_req, res, _next) => {
        res.end('Delete still in debug mode');
    });

leaderRouter.route('/:leaderId')
    .get((req, res, _next) => {
        res.end('Get leader details: ' + req.param.leaderId);
    })
    .post((req, res, _next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /leaders/' + req.params.leaderId);
    })
    .put((req, res, _next) => {
        res.statusCode = 403;
        res.write('Updating the leader ' + req.params.leaderId + '\n');
        res.end('Will update the leader: ' + req.body.name);
    })
    .delete((req, res, _next) => {
        res.end('Delete of leader ' + req.params.leaderId + ' still in debug mode')
    });

module.exports = leaderRouter
