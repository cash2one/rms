var push_plugin=require('../api/push_plugin.js');
var config = require('../configLoader.js').load('../config.json');
var search=require('../api/search.js');
search.init(config);
push_plugin.init(search);
var req={};
var res={};
req.options={domain:'cosmopolitan.com.hk'}
req.param=function(name,default_value){
	if(req.options[name]!=undefined){
		return req.options[name];
	}
	return default_value;

}
req.appendlog=function(){
	console.log(arguments);
}

res.send=function(obj){
	console.log(JSON.stringify(obj));

}
res.status=function(){};
res.end=function(){};
req.emit=function(){};
push_plugin.getMaxPostId(req,res);
req.options={domain1:'cosmopolitan.com.hk'}
push_plugin.getMaxPostId(req,res);
req.options={domain:'cosmopolitan.com.hk1'}
push_plugin.getMaxPostId(req,res);
return;

var record={url:"cosmopolitan.com.hk",content:"ddd",contenttitle:"s",type:"article",thumbnail:"",domain:"cosmopolitan.com.hk",article_time:Date.now()/1000};
var record1={url:"https://github.com/felixge/node-mysql#custom-format",content:"ddd",contenttitle:"s",type:"article",thumbnail:"",domain:"cosmopolitan.com.hk",article_time:Date.now(),"post_id":4};
record1={url:"www.baidu.com",content:"ddd",contenttitle:"s",type:"article",thumbnail:"",domain:"cosmopolitan.com.hk",article_time:Date.now()/1000,"post_id":-34};
req.options.authdomain='cosmopolitan.com.hk';
req.options.posts=JSON.stringify([record,record1]);
push_plugin.bulkIndex(req,res);
