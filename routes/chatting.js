var express = require('express');
var router = express.Router();
var socket = require('../sockets.js');
var Users     = require('../models/users');
var app     = require('../app');
var Group     = require('../models/group');
var Chatting     = require('../models/chatting');
var auth = require('basic-auth');
var Authentication = require('../utilities/Authentication');


function accessApi(req,res,callback){
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


router.route('/newchat/:Group_id')

    // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {
        req.app.locals.accessApi(req,res,function(user){
            Group.findById(req.params.Group_id, function(err, groupData) {

                var chatting = new Chatting();      // create a new instance of the Bear model

                groupData.groupChat.push(chatting._id);
                chatting.id_group = groupData._id;
                chatting.sender = user._id;
                chatting.message = req.body.message;
                // save the bear and check for errors
                groupData.save(function(err) {
                    if (err)
                        res.send(err);
                    chatting.save(function(err) {
                        if (err)
                            res.send(err);
                        res.json(groupData.groupChat);
                    });
                });
            }).populate('groupChat');
        });
        
    })

    // get all the bears (accessed at GET http://localhost:8080/api/bears)
    .get(function(req, res) {
        var io  = req.app.locals.io;
        req.app.locals.accessApi(req,res,function(user){
            io.on('connection', function (socket) {
                socket.on('ask_chat', function () {
                    Group.findById(req.params.Group_id, function(err, groupData) {
                        groupData.groupUser.some(function(userInGroup) {
                            if ( userInGroup.equals(user._id)) {
                                socket.emit('chatting', { chatting: groupData.groupChat });
                            }else{
                                res.send('You are not in group')
                            }
                        });
                    }).populate('groupChat',null, null,{sort: { "time_send" : -1 }});
                });

            });
            res.render('chatting', { title: 'Express' });

        });
    });

module.exports = router;
