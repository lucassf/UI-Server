const express = require('express');
const bodyParser = require('body-parser');
const Comments = require('../models/comments');
const cors = require('./cors');
const authenticate = require('../authenticate');

const commentRouter = express.Router();

commentRouter.use(bodyParser.json());

commentRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Comments.find(req.query).populate('author')
            .then((comments) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(comments);
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        if (req.body != null) {
            req.body.author = req.user._id;
            Comments.create(req.body)
                .then((comment) => {
                    Comments.findById(comment._id).populate('author')
                        .then((comment) => {
                            res.statusCode = 200;
                            res.setHeader('Content-type', 'application/json');
                            res.json(comment);
                        });
                }, (err) => next(err))
                .catch((err) => next(err))
        } else {
            err = new Error('Comment not found in request body');
            err.status = 404;
            return next(err);
        }
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (_req, res, _next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /comments/');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Comments.remove({})
            .then((comments) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(comments);
            }, (err) => next(err))
            .catch((err) => next(err))
    });

commentRouter.route('/:commentId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Comments.findById(req.params.commentId).populate('author')
            .then((comment) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(comment);
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, _next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /comments/' + req.params.commentId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .then((comment) => {
                if (comment != null && comment.author.equals(req.user._id)) {
                    req.body.author = req.user._id;
                    Comments.findByIdAndUpdate(comment._id, {
                        $set: req.body
                    }, { new: true })
                    then((comment) => {
                        Comments.findById(comment._id).populate('author')
                            .then((comment) => {
                                res.statusCode = 200;
                                res.setHeader('Content-type', 'application/json');
                                res.json(comment);
                            })
                    }, (err) => next(err))
                } else {
                    var errName = comment == null ? 'Comment ' + req.params.commentId + ' not found' :
                        'User not authorized to change comment';
                    err = new Error(errName);
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Comments.findById(req.params.commentId)
            .then((comment) => {
                if (comment != null && comment.author.equals(req.user._id)) {
                    Comments.findByIdAndRemove(comment._id)
                        .then((resp) => {
                            res.statusCode = 200;
                            res.setHeader('Content-type', 'application/json');
                            res.json(comment);
                        }, (err) => next(err))
                } else {
                    var errName = comment == null ? 'Comment ' + req.params.commentId + ' not found' :
                        'User not authorized';
                    err = new Error(errName);
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    });

module.exports = commentRouter