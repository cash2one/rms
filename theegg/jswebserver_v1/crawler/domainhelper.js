var searchasia=require('./helper/searchasia');
var cosmopolitan=require('./helper/cosmopolitan');
var defaultHelper=require('./helper/default');
var config=["searchblog.asia":searchasia,"cosmopolitan.com.hk":cosmopolitan];
var types=["searchblog.asia":searchasia,"cosmopolitan.com.hk":cosmopolitan,"default":"default_type"];

exports.getHelper=function(domain){
	for(var c in config){
		if(domain.indexOf(c)>=0){
			return config[c];
		}
	}
	return defaultHelper; 
}
exports.getType=function(domain){
	for(var c in types){
		if(domain.indexOf(c)>=0){
			return types[c];
		}
	}
	return types["default"]; 



}
