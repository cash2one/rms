var elasticsearch = require('elasticsearch');
var util = require('util');
var async = require('async');
var crypto=require('crypto');
var client=undefined; 
//console.log("grud: "+process.cwd());

var config=require(__dirname+'/../configLoader.js').load(__dirname+'/../config.json'); 
var search=config.search;
client=new elasticsearch.Client({
		host:search.host+":"+search.port,
		log:'info',

	});

var defaultIndex=search.index;
var defaultType=search.type;
var exports={};
exports.put=function(req,res){
	var index=req.param('index',defaultIndex); 
	var type=req.param('type',defaultType); 
	var id=req.param('_id','');
	var url=req.param('url','');
	var content=req.param('content','');
	var contenttitle=req.param('contenttitle','');
	var ctime=req.param('ctime',Date.now());;
	var result={request_id:req.request_id};
	if(url==''){
		result.error_code=50013;
		result.err_msg="page's url should not be null";
		res.send(result);
		return;
	}
	if(id==''){
		var sha1=crypto.createHash('sha1');
		sha1.update(url);
		id=sha1.digest('hex');
	}
	var options=	{
		  index: index,
		  type: type,
		  id: id,
		  body: {
			contenttitle: contenttitle,
		    content:content,
		    url:url,
		  }
	}
	if(ctime>1){
		options.body.ctime=ctime;

	}
	client.index(options
	, function (error, response) {
		result.msg=response;
		res.send(result);
	});

};

module.exports=exports;

