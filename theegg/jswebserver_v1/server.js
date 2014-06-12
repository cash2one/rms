var express = require('express');
var app = express();
var logger = require('morgan');
var config=require('./configLoader.js').load('config.json');
var search = require('./api/search.js');
search.init(config);
app.engine('jade', require('jade').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
/*
app.use(function(req, res, next) {
	console.log('%s %s', req.method, req.url);
	res.setHeader('Content-Type', 'text/html;charset=UTF-8');
	next();

});
*/
app.use(logger());
app.use("/views",express.static(__dirname + '/public'));
app.all("/", function(req, res) {
	res.send("helloword.");
});
app.all("/url", function(req, res) {
	search.queryUrl(req, res);
});
app.all("/mlt", function(req, res) {
	search.queryMlt(req, res);
});
app.all("/query", function(req, res) {
	search.queryKw(req, res);
});
app.all("/detail", function(req, res) {
	search.queryId(req, res);
});
var server = app.listen(3000, function() {
	console.log('Listening on port %d', server.address().port);
});

