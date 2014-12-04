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
