var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Matchuser_Schema   = Schema({
    id_match_maker:{ type: Schema.Types.ObjectId, ref: 'Matchmaker',required: true},
    id_group_user:{ type: Schema.Types.ObjectId, ref: 'Group',required: true},
    created_date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Matchuser',Matchuser_Schema);
