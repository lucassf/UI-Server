const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorites');
const Dishes = require('../models/dishes')
const cors = require('./cors');
const authenticate = require('../authenticate');

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id }).populate('user').populate('dishes')
            .then((favs) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(favs);
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favs) => {
                if (favs == null) {
                    Favorites.create({ user: req.user._id, dishes: req.body })
                        .then((favs) => {
                            Favorites.findById(favs._id).populate('user').populate('dishes')
                                .then((favs) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-type', 'application/json');
                                    res.json(favs);
                                })
                        })
                } else {
                    favs.dishes = req.body;
                    favs.save()
                        .then((favs) => {
                            Favorites.findById(favs._id).populate('user').populate('dishes')
                                .then((favs) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-type', 'application/json');
                                    res.json(favs);
                                })
                        })
                }
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({ user: req.user._id })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err))
    })

favoritesRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId).populate('comments.author')
            .then((dish) => {
                if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                Favorites.findOne({ user: req.user._id })
                    .then((favs) => {
                        if (favs == null) {
                            Favorites.create({ user: req.user._id, dishes: [req.params.dishId] })
                                .then((favs) => {
                                    Favorites.findById(favs._id).populate('user').populate('dishes')
                                        .then((favs) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-type', 'application/json');
                                            res.json(favs);
                                        })
                                })
                        } else {
                            if (!favs.dishes.some((dishId) => dishId == req.params.dishId)) {
                                favs.dishes.push(req.params.dishId);
                                favs.save()
                                    .then((favs) => {
                                        Favorites.findById(favs._id).populate('user').populate('dishes')
                                            .then((favs) => {
                                                res.statusCode = 200;
                                                res.setHeader('Content-type', 'application/json');
                                                res.json(favs);
                                            })
                                    })
                            } else {
                                Favorites.findById(favs._id).populate('user').populate('dishes')
                                    .then((favs) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-type', 'application/json');
                                        res.json(favs);
                                    })
                            }
                        }
                    }, (err) => next(err))
                    .catch((err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Dishes.findById(req.params.dishId).populate('comments.author')
            .then((dish) => {
                if (dish == null) {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                Favorites.findOne({ user: req.user._id })
                    .then((favs) => {
                        if (favs != null && favs.dishes.some((dishId) => dishId == req.params.dishId)) {
                            favs.dishes = favs.dishes.filter((dishId) => dishId != req.params.dishId)
                            favs.save()
                                .then((favs) => {
                                    Favorites.findById(favs._id).populate('user').populate('dishes')
                                        .then((favs) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-type', 'application/json');
                                            res.json(favs);
                                        })
                                })
                        } else {
                            err = new Error('The dish ' + req.params.dishId + ' was not favorited by user');
                            err.status = 404;
                            return next(err);
                        }
                    }, (err) => next(err))
                    .catch((err) => next(err))
            }, (err) => next(err))
            .catch((err) => next(err))
    })

module.exports = favoritesRouter;
