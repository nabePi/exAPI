var express = require('express');
var router = express.Router();
var Users     = require('../models/users');
var Users_profile     = require('../models/users_profile');
var auth = require('basic-auth')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.route('/checkexist')
    .post(function(req, res) {
        Users.findOne({ username: req.body.username }, function(err, user) {
            if (err || user === null) {
                res.json(400, {err})
            }else{
                if (user.isValidPassword(req.body.password)) res.json(user.populate('userProfile'));;
            }
            res.json(404, {err});
        });
    });

router.route('/action')

    // create a Users (accessed at POST http://localhost:8080/api/Userss)
    .post(function(req, res,next) {

        var userBaru = new Users({
            username: req.body.username,
            email: req.body.email,
            accessToken_google:req.body.accessToken_google,
            accessToken_fb:req.body.accessToken_fb
        });
        userBaru.setPassword(req.body.password);

        var userProfile = new Users_profile({
            id_user:userBaru._id,
            age: req.body.age,
            photo: req.body.photo,
            name: {
                first: req.body.first_name,
                last: req.body.last_name
            },
            telephone: req.body.telephone,
            status_verify: req.body.status_verify,
            code_verify: req.body.code_verify
        });
        
        // save the Users and check for errors
        userBaru.save(function(err) {
            if (err)
                res.send(err);

            userProfile.save(function (err) {
            	if (err) return handleError(err);
                userBaru.userProfile = userProfile;
                userBaru.save(function (err) {
                      if (err) {                                
                          res.json(400, { message: err + '' });
                      } else {
                            res.json({ message: 'Users created!',data: userBaru.populate('userProfile')});
                      }
                  }); 
                // thats it!
            });

        });
        
    })

    // get all the Userss (accessed at GET http://localhost:8080/api/Users)
    .get(function(req, res) {
        accessApi(req, res,function(Userdata){
            if (err)
                res.send(err);
            Users.find().populate('userProfile')
                .exec(function (err, Users) {
                  if (err) return handleError(err);
                  res.json(Users);
              });
        });
    });

router.route('/action/:Users_id')
    // get the Users with that id (accessed at GET http://localhost:8080/api/Userss/:Users_id)
    .get(function(req, res) {
        Users.findById(req.params.Users_id, function(err, Users) {
            if (err)
                res.send(err);
            res.json(Users);
        }).populate('userProfile');
    })
    // update the Users with this id (accessed at PUT http://localhost:8080/api/Userss/:Users_id)
    .put(function(req, res) {

        // use our Users model to find the Users we want
        Users.findById(req.params.Users_id, function(err, UsersResult) {

            if (err)
                res.send(err);

            UsersResult.username= req.body.username;
            UsersResult.email = req.body.email;
            UsersResult.accessToken_google=req.body.accessToken_google;
            UsersResult.accessToken_fb=req.body.accessToken_fb;
            UsersResult.setPassword(req.body.password);
            // save the UsersResult
            UsersResult.save(function(err) {
                if (err)
                    res.send(err);
                Users_profile.findOne({id_user:UsersResult._id}, function(err, Users_profile_result) {
                    if (Users_profile_result == null) {
                        var userProfile = new Users_profile({
                            id_user:UsersResult._id,
                            age: req.body.age,
                            photo: req.body.photo,
                            name: {
                                first: req.body.first_name,
                                last: req.body.last_name
                            },
                            telephone: req.body.telephone,
                            status_verify: req.body.status_verify,
                            code_verify: req.body.code_verify
                        });

                        userProfile.save(function (err) {
                            if (err) return handleError(err);
                            // thats it!
                            res.json({ message: 'Users created!',data: UsersResult.populate('userProfile')});
                        });
                    }else{
                        Users_profile_result.id_user=UsersResult._id;
                        Users_profile_result.age= req.body.age;
                        Users_profile_result.photo= req.body.photo;
                        Users_profile_result.name.first= req.body.first_name;
                        Users_profile_result.name.last= req.body.last_name;
                        Users_profile_result.telephone= req.body.telephone;
                        Users_profile_result.status_verify= req.body.status_verify;
                        Users_profile_result.code_verify= req.body.code_verif;

                        Users_profile_result.save(function(err) {
                            if (err)
                                res.send(err);

                            res.json({ message: 'Users updated!',data:UsersResult});
                        });
                    };

                });

            });

        }).populate('userProfile');
    })
    .delete(function(req, res) {
            Users.remove({
                _id: req.params.Users_id
            }, function(err, Users) {
                if (err)
                    res.send(err);

                res.json({ message: 'Successfully deleted' });
            });
        });

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


/*====================================
=            untuk verify            =
====================================*/


/*var authenticate = function(username, password, callback) {
    User.findOne({ name: username }, function(err, user) {
        if (err) return callback(new Error('User not found'));
        if (user.isValidPassword(password)) return callback(null, user);
        return callback(new Error('Invalid password'));
    });
};*/

/*=====  End of untuk verify  ======*/


module.exports = router;
