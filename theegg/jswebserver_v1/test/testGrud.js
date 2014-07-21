
console.log("test grud path:"+process.cwd());
var grud=require('../api/grud');
var req={
	request_id:0,
	param:function(key,defaultValue){
		if(req.options[key]!=undefined){
			return req.options[key];

		}else
			return defaultValue;


	},
	options:{}
};
var res={
	send:function(ret){
		console.log(JSON.stringify(ret));
	}


};
var options={
		index:'theegg',
		type:'cosmopolitan',
		_id:'http://www.cosmopolitan.com.hk/fashion/fashion-news/tory-burch-pre-fall-2014',
		url:'http://www.cosmopolitan.com.hk/fashion/fashion-news/tory-burch-pre-fall-2014',
		content:'眾多Chic girls喜愛的奢華美國運動時裝品牌Tory Burch在今個早秋系列有新玩意！本季的靈感繆斯是女性攝影師Gertrud Arndt，擅長拍攝人物，風格獨特、不食人間煙火，與Tory Burch無拘無束的理念100﹪吻合',
		contenttitle:'test for test case',
		ctime:Date.now(),
};
req.options=options;
grud.put(req,res);
