var ejs=require("../lib/elastic");
var client=null;
var search=null;
var indexConfig=null;
var rvdbhelper=require("../lib/rv_dbhelper");
var rvdb=new rvdbhelper();
var esdbhelper=require("../lib/es_dbhelper");
var esdb=new esdbhelper();
exports.init=function(se){
	if(se)
		search=se;
	else
		search=require('search.js');
	client=search.getESClient();
	indexConfig=search.getDefaultConf();


}
exports.getMaxPostId=function(req,res){
	var index=req.param('index',indexConfig.index);
	var type=req.param('type',indexConfig.type);
	var query={
		index:index,
		type:type,
		body:{
			size:0,
			aggregations:{
				"max_post_id":{
					"max":{"field":"post_id"}
				}
			}

		}
	};
	var domain=req.param('domain','');
	if(domain!=''){
		query.body.query={"term":{"domain":domain}};
	}
//	console.log(JSON.stringify(query));
		client.search(query,function(error,response){
			var max_post_id=response.aggregations.max_post_id;
	//		console.log(JSON.stringify(response));
			req.appendlog('Max_post_id:%s domain:%s',max_post_id.value,domain);
			console.log('Max_post_id:%s domain:%s',max_post_id.value,domain);
			if(!max_post_id.value || max_post_id.value==0){
				max_post_id.value=-1;
			}
			res.send({
				ret_value:max_post_id.value,
				error_code:0

			});

		});




}
exports.deleteByUrl=function(req,res){
	console.log('start delete :');
	var body=[];
	var index=req.param('index',indexConfig.index);
	var type=req.param('type',indexConfig.type);
	var url=req.param('url','');
	req.appendlog("start delete by query url: %s",url);
	if(url==''){
		req.appendlog('url is null');
		req.emit('end');
		res.send(404);
		return;
	}
	var _id=search.hash(url);
	client.delete({
		index: index,
		type:type,
		id:_id
//		body: {
//			query: {
	//			term:{"url":url}
//			}
//		}

	},function(error,response,status){
		req.appendlog("end delete by query url: %s, id: %s",url,_id);
		req.emit('end');
		res.status(200);


	});



}
var domainPatten=/cosmopolitan.com.hk|theegg.com|theegg.cn/;

exports.checkdomain=function(domain){

	return domainPatten.test(domain);


}
exports.bulkIndex=function(req,res){
	var body=[];
	var index=req.param('index',indexConfig.index);
	var type=req.param('type',indexConfig.type);
	var articles=req.param('posts','');
	var domain=req.param('authdomain','');
	if(articles=='' || !exports.checkdomain(domain)){
		req.appendlog('posts is null or domain invalid: %s',domain);
		res.status(502);
		res.end();
		return;
	}
	var records=JSON.parse(articles);
	req.appendlog("records %s",JSON.stringify(records));
	//res.send(records);
	//return;
	for(var i in records){
		var r=records[i];
		if(!r ||!r.url)
			continue;
		var id=search.hash(r.url);
		var action={index:{_index:index,_type:type,_id:id}};
		var doc={content:r.content,contenttitle:r.contenttitle,article_time:r.article_time,url:r.url,domain:r.domain,post_id:r.post_id};
		if(r.url_id>0){
			doc.url_id=r.url_id;
		}
		if(r.thumbnail!='' && r.thumbnail !=undefined){
			doc.thumbnail=r.thumbnail;
		}
		body.push(action);
		body.push(doc);
	}
	var step=0;
	var finish=function(){
		step++;
		if(step>=3){
			req.emit('end');
			res.send({"error_code":0,"total:":body.length/2});
		}

}
//insert to es
var insertToEs=function(options,cb){
	client.bulk({"body":options},function(err,resp){
		if(cb!=undefined){
			cb(err,resp);

		}

	});

};
req.appendlog("prepare bulk insert to es: count: %s",JSON.stringify(body),body.length/2);
insertToEs(body,function(err, resp){
	console.log("error: %s res:%s",JSON.stringify(err),JSON.stringify(resp));
	finish();

});
//return;
	//insert to banner
	
	rvdb.addBanners(records,function(){
		finish();

		req.appendlog("finish insert to banner db: rv_banners");

	});
	//insert to webpages
	esdb.addWebpages(records,function(){
		finish();
		req.appendlog("finish insert to es db: websites");

	});


}

