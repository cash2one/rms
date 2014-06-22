var elasticsearch = require('elasticsearch');
var util = require('util');
var async = require('async');
var client=undefined; 
/*
   new elasticsearch.Client({
   host: 'localhost:9200',
   log: 'trace'
   }

   );
   */

var indexConfig={"index":"theegg_v3","type":"searchasia_v3"};

var config={};
exports.init=function(conf){
	if(client!=undefined) return;
	config=conf;
	var search=config.search;
	client=new elasticsearch.Client({
		host:search.host+":"+search.port,
		log:'info',

	});
	indexConfig.index=search.index;
	indexConfig.type=search.type;
};
exports.queryUrl = function(req, res) {
	index=req.param('index',indexConfig.index);
	type=req.param('type',indexConfig.type);
	console.log("queryUrl: %s", req.query.url);
	client.search({
		index: index,
		type: type,
		body: {
			query: {
				match: {
					url: req.query.url
				}
			}
		}

	}).then(function(error,resp) {
		if(error){
			req.appendlog("Error happen: %s",error);
		}
		if (resp.hits.hits.length > 0) {
			var id = resp.hits.hits[0]._id;
			res.send(resp.hits.hits[0]);
			// req.query.id=id;
			//  res.send(resp);
			// res.write(resp.hits.hits[0]);
			//            req.query.id=
			//exports.queryMlt(req,res);
		} else {
			res.send(404);
			res.end({
				"error": "no result response."
			});
		}
	}, function(err) {
		console.trace(err.message);
	});

};

exports.queryMlt = function(req, res) {
	console.log("queryMlt: %s", req.query.url);

	id = req.query.id;
	index=req.param('index',indexConfig.index);
	type=req.param('type',indexConfig.type);
	client.mlt({
		index: index,
		type:type,
		id: id,
		mlt_fields: 'content,contenttitle'
	}

	).then(function(resp) {
		//res.setHeader('Content-Type','text/html;charset=UTF-8');
		console.log("finish queryMlt: %s", req.query.url);
		res.send(resp.hits.hits);
		//       res.write(resp);
		//      res.end();
	});

};
exports.queryFlt=function(req,res){
	var flt=function(pageContent){
		client.search({
			index: index,
			type:type,
			body:{
				_source:["contenttitle","url"],
				from:0,
				size:20,
				query:{

					//"fuzzy_like_this" : {
					"more_like_this" : {
						"fields" : ["content","contenttitle"],
						"max_query_terms":10,
						"like_text":pageContent
                }
            }

			}
		}
		).then(function(resp) {
			etime=Date.now();
			req.appendlog("finish queryFlt cost:%d ms",(etime-stime));
//			res.send(resp.hits.hits);
			var hits=resp.hits.hits;
			var result=[];
			var uq=[];
			for(var h in hits){
				var title=hits[h]._source.contenttitle;
				if(uq[title]>0) continue;
				uq[title]=1;
				result.push({'id':hits[h]._id,'url':hits[h]._source.url,title:hits[h]._source.contenttitle,score:hits[h]._score});
			}
			var s=JSON.stringify(result);
			delete uq;
			res.send(s);
			
		});
	}
	stime=Date.now();
//	req.appendlog("queryFlt: %s", req.query.url);

	id = req.query.id;
	index=req.param('index',indexConfig.index); 
    type=req.param('type',indexConfig.type); 
    var url=req.param('targetUrl',""); 
    if(url.length<1){
        var m=util.format("resource not found: %s",url)
        res.render('404',{errmsg:m})
    }

	client.search({
		index: index,
		type: type,
		body: {
			query: {
				match: {
					url:url 
				}
			}
		}

	}).then(function(resp) {
		if (resp.hits.hits.length > 0) {
			var id = resp.hits.hits[0]._id;
			var body=resp.hits.hits[0]._source.content;
			var title=resp.hits.hits[0]._source.contenttitle;
			req.appendlog("id: %s, title: %s, body: %s", id, title,body);
		//	res.send(resp.hits.hits[0]);
			flt(title+"  "+body);
		} else { 
			var m= util.format("Not Found Url: %s",url);
			req.appendlog(m);
			//res.render('404',{errmsg:m});

		}
	}, function(err) {
		console.trace(err.message);
	});


};

exports.queryKw = function(req, res) {

	var pageNum = req.param('page', 1);
	var perPage = req.param('perpage', 10);
	var kw = req.param('kw', "*");
	index=req.param('index',indexConfig.index);
	type=req.param('type',indexConfig.type);
	//indexConfig.index=index;
	//indexConfig.type=type;

	client.search({
		index: index,
		type: type,
		from: (pageNum - 1) * perPage,
		q: "content:" + kw + " contenttitle:" + kw
	}, function(err, resp) {
		if (err) {
			// handle error
			console.trace(err);
			return;
		}
		//res.send(resp.hits.hits);
		var currentpage = Number(pageNum);
		var pagestart = (currentpage - 4) > 0 ? (currentpage - 4) : 1;
		var total = Math.ceil(resp.hits.total / perPage);
		var pageend = (currentpage + 4) < total ? (currentpage + 4) : total;
		console.log("page: %s %s  %s %s", pagestart, pageend, total, currentpage + 4);
		resp.hits.pagestart = pagestart;
		resp.hits.pageend = pageend;
		resp.hits.currentpage = currentpage;
		resp.hits.perpage = perPage;
		resp.hits.kw = kw;
		resp.hits.baseurl = "/query?kw=" + kw + "&perpage=" + perPage;
		// res.send(resp.hits);
		res.render("search", resp.hits);
		/*
		   response.render('search_results', {
		   results: response.hits.hits,
		   page: pageNum,
		   pages: Math.ceil(response.hists.total / perPage)
		   })
		   */
	});
};

exports.queryId = function(req, res) {
	var id = req.param("id", -1);
	index=req.param('index',indexConfig.index);
	type=req.param('type',indexConfig.type);
	//indexConfig.index=index;
	//indexConfig.type=type;
	jsonformat=req.param('jsonformat',0);
	if (id < 0) {
		res.send(404);
		res.end("err: not found id:" + id);
		return;
	}
	result={};
	async.parallel([

			function(cb) {
				//content
				client.get({
					index: index,
					type: type,
					id: id,
				}).then(function(resp) {
					result["content"]=resp._source;
					result["content"]._index=resp._index;
					result["content"]._type=resp._type;
					cb();

					//            console.trace(resp);


				});;

			}, function(cb) {
				//mlt
				client.mlt({
					index: index,
					type: type,
					id: id,
					mlt_fields: 'content,contenttitle'
				}

				).then(function(resp) {
					//result["relate"]=resp.hits.hits;
					result["relate"]=[];
					ct=[];
					for(var i in resp.hits.hits){ 
						var ele=resp.hits.hits[i];
						var ii=encodeURIComponent(ele._source.contenttitle);
						if(ct[ii]==1) continue;
						ct[ii]=1;
						result["relate"].push({_id:ele._id,_source:{
								contenttitle:ele._source.contenttitle,
								url:ele._source.url
							}});

					}
					cb();
				});
			}], function(err, results) {
				if(jsonformat==0){
				res.render("detail",result);
				}else if(jsonformat==1){
					res.send(JSON.stringify(result,null,4));

				}

			});

};

module.exports = exports;

