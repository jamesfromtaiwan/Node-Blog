var mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		set: function (val) {
			return val.trim().toLowerCase();
		},
		validate: {
	  		validator: function(email) {
				return (email.match(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i) != null)},
			message: 'Invalid email'
		}
	},
	password: String,
	admin: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('User', userSchema);