const mongoose = require('mongoose'),
	  passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
	role: String,
	greenButtonAccess: Boolean,
	redButtonAccess: Boolean
});

userSchema.plugin(passportLocalMongoose,{
	usernameField: 'email'
});

const User = mongoose.model('User',userSchema);

module.exports = User;
