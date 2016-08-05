var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var mongooseApiQuery = require('mongoose-api-query');

var Matchmaker_Schema   = Schema({
    id_group_user_home:{ type: Schema.Types.ObjectId, ref: 'Group',required: true},
    name_location: {type: String,required: true},
    address_match: {type: String},
    geo_location: {
    	long: String,
    	lat: String
    },
    price_match: {type: String},
    start_game: {type: String},
    end_game: {type: String},
    refree: {type: String},
    notes: {type: String},
    number_of_team_home: {type: String},
    status_match: {type: String},
    updated_date: {type: Date },
    created_date: { type: Date, default: Date.now }
});

Matchmaker_Schema.plugin(mongooseApiQuery);

module.exports = mongoose.model('Matchmaker',Matchmaker_Schema);
