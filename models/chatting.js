var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ChatSchema   = Schema({
    id_group:{ type: Schema.Types.ObjectId, ref: 'Group',required: true},
    sender: { type: Schema.Types.ObjectId, ref: 'Users',required: true},
    message: {type: String,required: true},
    time_send: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Chatting',ChatSchema);
