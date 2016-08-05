var express = require('express');
var router = express.Router();
var Matchmaker     = require('../models/match_maker');
var auth = require('basic-auth');

/* GET users listing. */
router.route('/action')

    // create a Users (accessed at POST http://localhost:8080/api/Userss)
    .post(function(req, res,next) {
        req.app.locals.accessApi(req,res,function(user){
            if (user.userGroup.length > 0) {
                user.userGroup.some(function(value) {
                    if (value.equals(req.body.id_group_user_home)) {
                        var matchMaker = new Matchmaker({
                            id_group_user_home:req.body.id_group_user_home,
                            name_location:req.body.name_location,
                            address_match:req.body.address_match,
                            geo_location: {
                                long: req.body.geo_long,
                                lat: req.body.geo_lat
                            },
                            price_match:req.body.price_match,
                            start_game:req.body.start_game,
                            end_game:req.body.end_game,
                            refree:req.body.refree,
                            notes:req.body.notes,
                            number_of_team_home:req.body.number_of_team_home,
                            status_match:1
                        });
                        
                        // save the Users and check for errors
                        matchMaker.save(function(err) {
                            if (err)
                                return handleError(err);
                            res.json(matchMaker);
                        });
                    }
                });
            }else{
                res.send('You have no group yet')
            }
        });
        
    })

    // get all the Userss (accessed at GET http://localhost:8080/api/Users)
    .get(function(req, res) {
        req.app.locals.accessApi(req, res,function(Userdata){
            Matchmaker.find().populate('id_group_user_home')
                .exec(function (err, MatchmakerResult) {
                  if (err) return handleError(err);
                  res.json(MatchmakerResult);
              });
        });
    });

router.route('/action/:Matchmaker_id')
    // get the Users with that id (accessed at GET http://localhost:8080/api/Userss/:Matchmaker_id)
    .get(function(req, res) {
        Matchmaker.findById(req.params.Matchmaker_id, function(err, MatchmakerResult) {
            if (err)
                res.send(err);
            res.json(MatchmakerResult);
        }).populate('id_group_user_home');
    })
    // update the Users with this id (accessed at PUT http://localhost:8080/api/Userss/:Matchmaker_id)
    .put(function(req, res) {
        req.app.locals.accessApi(req,res,function(user){
            if (user.userGroup.length > 0) {
                user.userGroup.some(function(value) {
                    if (value.equals(req.body.id_group_user_home)) {

                        Matchmaker.findById(req.params.Matchmaker_id, function(err, MatchmakerResult) {

                            if (err)
                                res.send(err);

                            MatchmakerResult.name_location=req.body.name_location;
                            MatchmakerResult.address_match=req.body.address_match;
                            MatchmakerResult.geo_location.long= req.body.geo_long;
                            MatchmakerResult.geo_location.lat= req.body.geo_lat;
                            MatchmakerResult.price_match=req.body.price_match;
                            MatchmakerResult.start_game=req.body.start_game;
                            MatchmakerResult.end_game=req.body.end_game;
                            MatchmakerResult.refree=req.body.refree;
                            MatchmakerResult.notes=req.body.notes;
                            MatchmakerResult.number_of_team_home=req.body.number_of_team_home;

                            // save the MatchmakerResult
                            MatchmakerResult.save(function(err) {
                                if (err)
                                    res.send(err);
                                res.json(MatchmakerResult)
                            });

                        }).populate('id_group_user_home');
                    }
                });
            }else{
                res.send('You are wrong match')
            }
       });
    })
    .delete(function(req, res) {
            Matchmaker.remove({
                _id: req.params.Matchmaker_id
            }, function(err, MatchmakerResult) {
                if (err)
                    res.send(err);

                res.json({ message: 'Successfully deleted' });
            });
        });
router.route('/search')
    .get(function(req, res) {
        // liat dokumentasi https://www.npmjs.com/package/mongoose-api-query
        Matchmaker.apiQuery(req.query, function(err, matchResult){
            res.json(matchResult)
        });
    });
module.exports = router;
