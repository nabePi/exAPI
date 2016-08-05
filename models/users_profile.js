var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

mongoose.connect( 'mongodb://localhost/Tarkam' );

var Users_profileSchema   = new Schema({
	id_user: { type: Schema.Types.ObjectId, ref: 'Users' },
    age: String,
    photo: String,
    name: {
    	first: String,
    	last: String
    },
    telephone: String,
    last_login: { type: Date, default: Date.now },
    status_verify: { type: Boolean, default: 0 },
    code_verify: String

});

Users_profileSchema.virtual('name.full').get(function () {
  return this.name.first + ' ' + this.name.last;
}).set(function(name) {
  var split = name.split(' ');
  this.name.first = split[0];
  this.name.last = split[1];
});

module.exports = mongoose.model('Users_profile', Users_profileSchema);