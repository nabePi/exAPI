var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GroupSchema   = Schema({
    created_by:{ type: Schema.Types.ObjectId, ref: 'Users',required: true},
    name_group: {type: String},
    description: {type: String},
    photo_group: { type: String},
    group_active: { type: Boolean, default: 1 },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now },
    groupUser:[{ type: Schema.Types.ObjectId, ref: 'Users',index: true , unique: true }],
    groupChat:[{ type: Schema.Types.ObjectId, ref: 'Chatting' }]

});


module.exports = mongoose.model('Group',GroupSchema);
