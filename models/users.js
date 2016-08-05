var mongoose     = require('mongoose');
var Schema       = mongoose.Schema,
	uuid 		 = require('node-uuid'),
	crypto 		 = require('crypto'),
	ObjectId 	 = Schema.ObjectId;

var UsersSchema   = new mongoose.Schema({
    username: {type: String,unique : true},
    email: {type: String,unique : true},
    salt: { type: String, required: true, default: uuid.v1 },
    password: { type: String, required: true },
    accessToken_google: String,
    accessToken_fb: String,
    user_active: { type: Boolean, default: 1 },
    created_date: { type: Date, default: Date.now },
    updated_date: { type: Date, default: Date.now },
    userGroup:[{ type: Schema.Types.ObjectId, ref: 'Group',index: true , unique: true }],
    userProfile:{ type: Schema.Types.ObjectId, ref: 'Users_profile' }

},{
  toObject: {
  	virtuals: true
  },
  toJSON: {
  	virtuals: true 
  }
});

UsersSchema.methods.setPassword = function(passwordString) {
	if (passwordString =='' || passwordString === 'undefined' || !passwordString) {
	    this.password = this.password;
	}else{
		this.password = hash(passwordString, this.salt);
	}
};
 


/*UsersSchema.virtual('id_user').get(function () {
  return this._id;
});*/

var hash = function(passwd, salt) {
    return crypto.createHmac('sha256', salt).update(passwd).digest('hex');
};
 
UsersSchema.methods.isValidPassword = function(passwordString) {
    return this.password === hash(passwordString, this.salt);
};


module.exports = mongoose.model('Users',UsersSchema);
