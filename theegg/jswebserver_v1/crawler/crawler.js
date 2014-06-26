var URL=require('url');
var domainHelper=require('./domainhelper');
crawler=module.exports;
crawler.extract=function(url,cb){
	var domains=URL.parse(url);
	if(!domains.hostname){
		if(cb!=undefined)
		cb();
		return;
	}

	var helper=domainHelper.getHelper(domains.hostname);
	var index="theegg";
	var type=domainHelper.getType(domains.hostname);
	helper.index({index:index,type:type,url:url},cb);
};
