var mongoose = require('mongoose');
var articleSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Title is required.'],
		validate: {
			validator: function (val) {
				return val.length <= 120;
			},
			message: 'Title is too long (120 max)'
		}
	},
	text: String,
	published: {
		type: Boolean,
		default: false
	},
	slug: {
		type: String,
		set: function (val) {
			return val.toLowerCase().replace(' ', '-')
		}
	}
});

articleSchema.statics.list = function (cb) {
	return this.find({}, null, {sort: {_id: -1}}, cb);
}

module.exports = mongoose.model('Article', articleSchema);