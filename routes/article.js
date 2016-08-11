// GET article 
exports.show = function (req, res, next) {
	if (!req.params.slug) { return next(new Error('No article slug!'))}
	req.models.Article.findOne({slug: req.params.slug}, function (err, article) {
		if (err) {return next(err)}
		if (!article.published) { return res.send(401)}
		res.render('article', article);
	});
}

// GET articles API route fetches all articles 
exports.list = function (req, res, next) {
	req.models.Article.list(function (err, articles) {
		if (err) {return next(err)}
		// Question: why send back a object with affectedCount property
		res.send({articles: articles});
	});
}

// POST article API route (used in admin page)
exports.add = function (req, res, next) {
	if (!req.body.article) {return next(new Error('No article payload!'))}

	var article = req.body.article;
	article.published = false;
	req.models.Article.create(article, function (err, articleRespond) {
		if (err) {return next(err)}
		res.send(articleRespond);
	})	
}

// PUT API route in admin page for publishing
exports.edit = function (req, res, next) {
	if (!req.params.id) {return next(new Error('No article ID'))}
	req.models.Article.findById(req.params.id, function (err, article) {
		if (err) {return next(err)}
		article.update({$set: req.body.article}, function (err, count, raw) {
			if (err) {return next(err)}
			res.send({affectedCount: count});
		});

	})	
}

// DELETE API route in admin page for destroying 
exports.delete = function (req, res, next) {
	if (!req.params.id) {return next(new Error('No article ID'))}
	req.models.Article.findById(req.params.id, function (err, article) {
		if (err) {return next(err)}
		if (!article) {return next(new Error('Article not found'))}
		article.remove(function (err, doc) {
			if (err) {return next(err)}
			res.send(doc);
		});
	});
}

// GET article post page (page is blank form)
exports.post = function (req, res, next) {
	if (!req.body.title) {
		res.render('post');
	}
}

// POST route for the post page form
exports.postArticle = function (req, res, next) {
	if (!req.body.title || !req.body.slug || !req.body.text) {return res.render('post', {error: 'Fill title, slug and text.'});}
	var article = {
		title: req.body.title,
		slug: req.body.slug,
		text: req.body.text,
		published: false
	};
	req.models.Article.create(article, function (err, articleResponse) {
		if (err) {return next(err)}
		res.render('post', {error: 'Article was added. Publish it in admin page.'});
	});
}

// GET admin page in which we fetches all soprted article ({sort: {_id: -1}})
exports.admin = function (req, res, next) {
	req.models.Article.list(function (err, articles) {
		if (err) {return next(err)}
		res.render('admin', {articles: articles});
	});
}

