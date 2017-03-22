var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose =  require('mongoose');
var session = require('express-session');

var crypto = require('crypto');
var methodOverride = require('method-override');

var app = express();

app.set('view engine', 'jade');
var connection = mongoose.connect('mongodb://akku:akkujiggu@jello.modulusmongo.net:27017/vEtixy8r');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride());

app.use(session({
    secret: '123456',
    resave: true
}));

var userSchema = new mongoose.Schema({
    email: {
        type: String
    },
    name: {
        type: String
    },
    hash: String,
    salt: String
});

userSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    this.save(function (error) {
        if (error)
            return "Could not create User";
    })
};
userSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};
var User = mongoose.model('User',userSchema);
var sess;
app.get('/profile', function (req, res) {
    console.log("profile page");
    sess = req.session;
    if(sess && sess.email) {
        User.findOne({email: sess.email}, function (err, user) {
            if (user) {
                res.json({data: user.toJSON(), status: 'success'});
            }
        })
    }
    else {
        res.json({data: '', status: 'failure'});
    }
});

app.post('/signup', function (req, res) {
    console.log("signup page");
    sess = req.session;
    User.findOne({email: req.body.username}, function (err, user) {
        if(err)
            console.log(err);
        if(user)
            res.json({message: "user already exists"});
        else{
            User.create({email: req.body.username}, function (err, user) {
                if(err) {
                    console.log("error saving user");
                    return "No user can be created!";
                }
                console.log('the user is: ', user);
                console.log("email: "+req.body.username);
                console.log("*****"+req.body.password);
                user.setPassword(req.body.password);
                console.log("user password saved");
                sess.email = req.body.username;
            });
        }
    });
});
app.post('/login', function (req, res){
    console.log("login page");
    sess = req.session;
    console.log('the req is: ', req.body.username);
    console.log('the req is: ', req.body.password);
    User.find({email: req.body.username}, function (err, user) {
        console.log('the user is : ', user);
        if(err)
            console.log(err);
        if(user) {
            console.log(typeof (user[0]));
            if( user[0].validPassword(req.body.password)){
                console.log("valid user");
                req.session.email = req.body.username;
                console.log('the session is: ', sess);
                res.end();
            }
            else {
                res.send('Username / Password does not match!');
            }
        }
        else {
            res.redirect('/signup');
        }
    });
});

app.get('/logout', function (req, res) {
    console.log("logout page");
    req.session.reset();
    res.redirect('/');
});
app.listen(8080);
console.log("listening at port 8080");