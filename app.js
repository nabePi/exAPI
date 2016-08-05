var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');


var routes = require('./routes/index');
var users = require('./routes/users');
var chatting = require('./routes/chatting');
var group = require('./routes/group');
var matchmaker = require('./routes/matchmaker');
var matchuser = require('./routes/matchuser');
var Room = require('./room.js');
var auth = require('basic-auth');
var app = express(),
    socket_io    = require( "socket.io" ),
    uuid = require('node-uuid'),
    _ = require('underscore')._,
    bodyParser = require('body-parser'),
    Users     = require('./models/users');
    // server   = require('http').createServer(app),
    // io        = require('socket.io').listen(server),

// Socket.io
var io           = socket_io();
app.io           = io;

app.use(express.static(__dirname + '/public'));
app.use('/components', express.static(__dirname + '/components'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/icons', express.static(__dirname + '/icons'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* Store process-id (as priviledged user) */
/*try {
    npid.create('/var/run/advanced-chat.pid', true);
} catch (err) {
    console.log(err);
    //process.exit(1);
}*/
// server.listen(app.get('port'), app.get('ipaddr'), function(){
//     console.log('Express server listening on  IP: ' + app.get('ipaddr') + ' and port ' + app.get('port'));
// });



// middleware to use for all requests
app.use(function(req, res, next) {
    next()
   /* freeAccess = [
                    {method:'GET',url:'/users/action'},
                    {method:'POST',url:'/users/action'}
                ];
    freeAccess.forEach(function (key,value) {
        if (req.url == key.url && req.method == key.method) {
            next();
        }else{
            
        }
    })*/


});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/chatting', chatting);
app.use('/group', group);
app.use('/matchmaker', matchmaker);
app.use('/matchuser', matchuser);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.locals.io = app.io;
app.locals.auth = function(){
  console.log('yoi')
}



app.locals.accessApi = function(req,res,callback){
    var credentials = auth(req);
    authenticate(credentials.name,credentials.pass,function(err, userData){
        if (err || userData == null){
            res.statusCode = 401
            res.setHeader('WWW-Authenticate', 'Basic realm="example"')
            res.end('Access denied '+err)
        }else{
            return callback(userData);
        }
    });
}

function authenticate(username, password, callback) {
    Users.findOne({ username: username }, function(err, user) {
        if (err || user === null) return callback(new Error('User not found'));
        if (user.isValidPassword(password)) return callback(null, user);
        return callback(new Error('Invalid password'));
    });
};



app.io.on('connection', function(socket){  
  console.log('a user connected');
});

module.exports = app;
