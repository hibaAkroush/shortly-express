var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(session({
  secret:'shhhh it is a secret',
  resave:false,
  saveUninialized: true

}));

app.get('/', util.checkUser,function(req, res) {
  res.render('index');
});

app.get('/create', util.checkUser,function(req, res) {
  res.render('index');
});

app.get('/links', util.checkUser,function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.status(200).send(links.models);
  });
});



app.post('/links', util.checkUser,function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
      console.log(found)
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });

      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

// add a function tom redirect the user to a login page
///login


app.get('/login', 
function(req, res) {
  res.render('login');
})

app.post('/login', function(req, res) {
    
  var username = req.body.username;
  var password = req.body.password;
  new User ({username:username})
    .fetch()
    .then(function(user){
      if(!user){
        res.redirect('/login')
      } else{
        user.comperPassword(password,function(match){
          if(match){
            util.createSession(req,res,user)
          }else{
            res.redirect('/login');
          }
        });
      }
    });
});
app.get('/logout',function(req,res){
  req.session.destroy(function(){
    res.redirect('/login');
  });
});

// // if username and password exist redirect to restrected 
//     if(username === 'demo' && password === 'demo'){
//         res.redirect('Link');
//     }
// // if not redirect  to login
//     else {
//        res.redirect('login');
//     } 
// });

// //signup

// app.get('/signup', 
// function(req, res) {
//   res.render('signup');
// });

// // post /sign up

// app.post('/signup',
// function(req,res){


// var newuser = req.body.username;
// var newpass = req.body.password;
// console.log(newpass,newuser) 

//   Users.create({
//     username: newuser,
//     password: newpass,
//   })
//   .then(function(){
//   res.status(200).render();
//   });

// })
app.post('/singup',function(req,res){
  var username=req.body.username;
  var password = req.body.password;

  new User({username:username})
  .fetch()
  .then(function(user){
    if(!user){
      var newUser = new User({
        username:username,
        password:password
      });
      newUser.save().then(function(savedUser){
        util.createSession(req,res,savedUser)
      })
    }else{
      console.log('Account Already exist');
      res.redirect('/signup');
    }
  })
})

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
