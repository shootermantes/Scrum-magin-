var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var session = require('client-sessions');
// Schema models
var User = require('./models/user');
var CreateProject = require('./models/create-project')

var config = require('./config');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var LocalStrategy = require('passport-local').Strategy;

var app = express();

mongoose.Promise = global.Promise;  // Use this code because mongoose.Promise has been deprecated and global.Promise is taking its place.
app.use(bodyParser.json());
app.use(express.static('build'));
app.use(passport.initialize());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// middleware to run as a module or as a server. 
// This setup the connection to the server and the server to the DB.
var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

// If this file was 'required' on another file as a module then this file will run
if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

exports.app = app;
exports.runServer = runServer;

passport.serializeUser(function(user, done) { 
    return done(null, user._id)
});

passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
        console.log(77, user)
        done(err, user);
    });
});

passport.use(new LocalStrategy(     // LocalStrategy will parse the username and password from the req.body and pass it on to the inside function.
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) { // First this searches for an existing username that was provided
  
            if (err) {  // if there was an issue besides 'nonexisting user' the error message will be passed in here. 
                return done(err); 
            }
            if (!user) {        // If no username found this err will be thrown
                return done(null, false, { message: 'Incorrect username.' });
            }

            user.validatePassword(password, function(err, isValid){  // If username is found in the db this will authenticate the submitted password with the db password on file. The validatePassword() method is a method from the User model. 
                if (err) { // if there was an issue besides 'invalid password' the error message will be passed in here. 
                    return done(null, false, err);
                } 

                if (!isValid) {         // If password submitted is incvalid this err will be thrown
                    return done(null, false, { message: 'Incorrect password.' });
                }

                return done(null, user, { _id: user._id}); 
                    // If password passes authentication this 'done()' function will be called passing in 'null' (for 'error' argument) and 'user' for the 
            });
        });                         // Once this function completes the serializeUser() is invoked and continues from there
    }
))



// Beginning routes

app.options('*', function(req, res){
    res.status(200)
});

app.get('/test', function(){
    console.log('testing server')
})


app.get('/:userid', function(req, res){
    console.log(110, req.params)
    return res.status(212)
})


// // POST /login
// //   This is an alternative implementation that uses a custom callback to
// //   achieve the same functionality.
// app.post('/login', function(req, res, next) {
//   passport.authenticate('local', function(err, user, info) {
//     if (err) { return next(err) }
//     if (!user) {
//       return res.json(401, { error: 'message' });
//     }

//     //user has authenticated correctly thus we create a JWT token 
//     var token = jwt.encode({ username: 'somedata'}, tokenSecret);
//     res.json({ token : token });

//   })(req, res, next);
// });


// Authenticate user supplied sign In credentials
app.post('/hidden', passport.authenticate('local'), function(req, res){
                    //  - when a call gets made to '/hidden' endpoint passport.authenticate('local'). The info in the req.body will be parsed by the LocalStrategy method
    // res.setHeader('body', req.user)
    res.redirect('/')
    res.status(211)
});

// Create new users
app.post('/users', function(req, res) {
    console.log('server received ' + req.body.username)

    if (!req.body) {
        return res.status(400).json({
            message: "No request body"
        });
    }

    if (!('username' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: username'
        });
    }

    var username = req.body.username;

    if (typeof username !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: username'
        });
    }

    username = username.trim();

    if (username === '') {
        return res.status(422).json({
            message: 'Incorrect field length: username'
        });
    }

    if (!('password' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: password'
        });
    }

    var password = req.body.password;

    if (typeof password !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: password'
        });
    }

    password = password.trim();

    if (password === '') {
        return res.status(422).json({
            message: 'Incorrect field length: password'
        });
    }


    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }

            var user = new User({
                username: username,
                password: hash
            });

            user.save(function(err, object) {

                if (err) {
                    return res.status(500).json({
                        message: 'Internal server error'
                    });
                }

                return res.status(201).json(object); // new user has been created successfully
            });
        });
    });
});

app.get('/projects', function(req, res){
    console.log(215, req.session === true)
    console.log(207, req.user)
    // User.findOne(req.session.user._id)
    //     .populate('projects')
    //     .exec(function(err, data){
    //         console.log(data)
    //     })
});

app.post('/createproject', function(req, res){
    console.log(224, req)
    CreateProject.create({
                projectName: req.body.projectName,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                projectLeader: req.body.projectLeader,
                scrumMaster: req.body.scrumMaster,
                crew: req.body.crew

        }, function(err, object){
            console.log(226, err, object)
            if (err){
                return res.status(500).json({
                    message: 'did not create the project. Internal Server Error'
                });
            }

            // User.findOneAndUpdate(
            //     {_id: req.session.user._id},
            //     {$push:{'projects': object._id}}, 
            //     function(err, user){
            //         if (err) {
            //             return res.status(502).json({
            //                 message: 'Internal Server Error'
            //             })
            //         }
            //     }
            // )
            res.status(200).json(object)
        }
    )

})


// Used for error handling. If a request was made to a non-existing endpoint this will be returned
app.use('*', function(req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});