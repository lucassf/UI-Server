var express = require('express');;
const bodyParser = require('body-parser');
var User = require('../models/users');
var passport = require('passport');
const cors = require('./cors');
var authenticate = require('../authenticate')
var router = express.Router();

router.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find((err, users) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        }
    });
})

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
    User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
        if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
        } else {
            if (req.body.firstname)
                user.firstname = req.body.firstname;
            if (req.body.lastname)
                user.lastname = req.body.lastname;
            user.save((err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ err: err });
                    return;
                }
                passport.authenticate('local', function (err, user, info) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: true, status: 'Registration successful' })
                })(req, res, next);
            });
        }
    })
});

router.post('/login', cors.corsWithOptions, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err)
        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, status: 'Login Unsuccessful!', err: info })
        }
        else {
            req.logIn(user, (err) => {
                if (err) {
                    res.statusCode = 401;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({ success: false, status: 'Login Unsuccessful!', err: 'Could not login user' })
                }

                var token = authenticate.getToken({ _id: req.user._id });
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: true, status: 'You have succesfully signed in', token: token })
            });
        }
    })(req, res, next);
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
    if (req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    } else {
        var err = new Error('You are not logged in');
        err.status = 403;
        next(err);
    }
})

router.get('/checkJWTToken', cors.corsWithOptions, (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: false, status: 'JWT invalid!', err: info })
        } else {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'JWT invalid!', user: user })
        }
    })(req, res, next);
})

module.exports = router;
