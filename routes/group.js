var express = require('express');
var router = express.Router();
var Users     = require('../models/users');
var Group     = require('../models/group');
var auth = require('basic-auth');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
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



router.route('/action')
    // create a Users (accessed at POST http://localhost:8080/api/Userss)
    .post(function(req, res,next) {
        accessApi(req, res,function(userAccess){
            var groupBaru = new Group({
                created_by:userAccess._id,
                name_group:req.body.name_group,
                description:req.body.description,
                photo_group:req.body.photo_group
            });
            groupBaru.groupUser.push(userAccess._id);
            userAccess.userGroup.push(groupBaru._id);

            // save the Users and check for errors
            groupBaru.save(function(err) {
                if (err)
                    res.send(err);
                userAccess.save(function(err){
                    if (err)
                        res.send(err);
                    res.json(groupBaru.populate('created_by'));
                })

            });
        });
        
    })

    // get all the Userss (accessed at GET http://localhost:8080/api/Users)
    .get(function(req, res) {
        accessApi(req, res,function(dataUser){
            Group.find({created_by:dataUser._id}).populate(['created_by','groupUser'])
                .exec(function (err, GroupData) {
                  if (err) return handleError(err);
                  res.json(GroupData);
              });
        });
        
        // userAccess
    });

router.route('/action/:Group_id')
    // get the Users with that id (accessed at GET http://localhost:8080/api/Userss/:Group_id)
    .get(function(req, res) {
        accessApi(req, res, function (Userdata) {
            Group.findById(req.params.Group_id, function(err, groupData) {
                if (err)
                    res.send(err);
                res.json(groupData);
            }).populate('created_by');
        });

    })
    // update the Users with this id (accessed at PUT http://localhost:8080/api/Userss/:Group_id)
    .put(function(req, res) {
        accessApi(req, res, function (userAccess) {
            Group.findById(req.params.Group_id, function(err, GroupResult) {
                if (err)
                    res.send(err);
                if (GroupResult.created_by._id.equals(userAccess._id)) {
                    GroupResult.name_group = req.body.name_group;
                    GroupResult.description = req.body.description;
                    GroupResult.photo_group=req.body.photo_group;

                    // save the GroupResult
                    GroupResult.save(function(err) {
                        if (err)
                            res.send(err);
                         res.json(GroupResult.populate('created_by'));
                    });
                }else{
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
                    res.end('Access denied ')
                }


            }).populate('created_by');
        });

    })
    .delete(function(req, res) {
        accessApi(req, res, function (userAccess) {
            Group.find({_id:req.params.Group_id,created_by:userAccess._id},function(err,GroupData){
                if (err || GroupData == null || GroupData == [] || GroupData.length <1){
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
                    res.end('Access denied '+err)
                }else{
                    userAccess.userGroup.some(function(groupnya){
                        if (groupnya.equals(GroupData._id)) {
                             user.userGroup.pull(GroupData._id);
                             user.save(function(err) {
                                 if (err)
                                     res.send(err);
                             });
                        }
                    });

                    res.json('Berhasil')
                }
            }).remove(function(err, groupnya){
                        // res.json(groupnya);
            });
        });
    });


router.route('/invite/:User_id/group/:Group_id')
    .put(function(req, res) {
        accessApi(req, res, function (userAccess) {
            Group.findById(req.params.Group_id, function(err, GroupResult) {
                if (err)
                    res.send(err);
                if (GroupResult.created_by._id.equals(userAccess._id)) {
                    Users.findById(req.params.User_id, function(err, user) {
                        if (err || user === null) res.send(err);
                        if (GroupResult.groupUser.length >0) {

                            GroupResult.groupUser.some(function(value) {
                                if (!value.equals(user._id)) {
                                    GroupResult.groupUser.push(user._id);
                                    user.userGroup.push(GroupResult._id);
                                    // save the GroupResult
                                    GroupResult.save(function(err) {
                                        user.save(function (err) {
                                            if (err)
                                                res.send(err);    
                                        });
                                        if (err)
                                            res.send(err);
                                         res.json(GroupResult.populate(['created_by','groupUser']));
                                    });
                                }else{
                                    res.statusCode = 400
                                    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
                                    res.end('User already in group chat')
                                }
                            });
                        }else{
                            GroupResult.groupUser.push(user._id);
                            user.userGroup.push(GroupResult._id);
                            // save the GroupResult
                            GroupResult.save(function(err) {
                                user.save(function (err) {
                                    if (err)
                                        res.send(err);    
                                });
                                if (err)
                                    res.send(err);
                                 res.json(GroupResult.populate(['created_by','groupUser']));
                            });
                        }

                    });
                }else{
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
                    res.end('Access denied ')
                    
                }


            }).populate(['created_by','groupUser']);
        });

    })
router.route('/kick/:User_id/group/:Group_id')
    .put(function(req, res) {
        accessApi(req, res, function (userAccess) {
            Group.findById(req.params.Group_id, function(err, GroupResult) {
                if (err)
                    res.send(err);
                if (GroupResult.created_by._id.equals(userAccess._id)) {
                    Users.findById(req.params.User_id, function(err, user) {
                        if (err || user === null) res.send(err);
                        GroupResult.groupUser.pull(user._id);
                        user.userGroup.some(function(groupnya){
                            if (groupnya.equals(GroupResult._id)) {
                                 user.userGroup.pull(GroupResult._id);
                                 user.save(function(err) {
                                     if (err)
                                         res.send(err);
                                 });
                            }
                        });

                        // save the GroupResult
                        GroupResult.save(function(err) {
                            if (err)
                                res.send(err);
                             res.json(GroupResult.populate(['created_by','groupUser']));
                        });

                    });
                }else{
                    res.statusCode = 401
                    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
                    res.end('Access denied ')
                    
                }


            }).populate('created_by');
        });

    })

module.exports = router;
