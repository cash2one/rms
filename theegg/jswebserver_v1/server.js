var express = require('express');
var app = express();
var logger=require('./log').logger;
var config=require('./configLoader.js').load('config.json');
var search = require('./api/search.js');
var util=require('util');

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
app.use(function(req,res,next){
	request_id=Date.now()+Math.random();
	req.logmsg="";
	req.request_id=request_id;
	req.stime=Date.now();
	req.appendlog=function(format){
		req.logmsg+= "["+util.format.apply(format,arguments)+"]";
	};
	req.on ('end', function () {
		
		req.etime=Date.now();
	 	var m=util.format("request_id:%d,msg:[%s],time cost:[%d ms]",req.request_id,req.logmsg,(req.etime-req.stime));
		 logger.info(m);
		 console.log(m);
	 });

	next();
});
app.use(function(err,req,res,next){
	if(!err) return next();
	var m=util.format("request_id:%d,msg:[%s],error:%j",req.request_id,req.logmsg,err.stack);
	res.render('404',{errmsg:m});
	logger.error(m);
	console.log(m);
});
app.use(function(req,res,next){
	req.appendlog(util.format("path:%s;query:%s",req.path,JSON.stringify(req.query)));
	next();
});
app.use(express.static(__dirname + '/public/icon'));
app.use("/views",express.static(__dirname + '/public'));
//app.use("/favicon.ico",express.static(__dirname+"/favicon.ico"));
app.all("/", function(req, res) {
	logger.info("begin");
	req.appendlog("add msg 1: time:"+Date.now());
	res.send("helloword.");
	req.appendlog("add msg 2: time:"+Date.now());
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
app.all("/recommander",function(req,res){
    search.queryFlt(req,res);
});
app.all("*",function(req,res){
	var m=util.format("request_id: %d, status:%d",req.request_id,404);
	var j={request_id:req.request_id,error_msg:"the resource not found",error_code:404};
	res.send(JSON.stringify(j));
});
var server = app.listen(3000, function() {
	console.log('Listening on port %d', server.address().port);
});

