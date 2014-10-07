var elasticsearch = require('elasticsearch');
var util = require('util');
var async = require('async');
var client = undefined;
var crypto=require("crypto");
var http = require('http');
var ejs=require("../lib/elastic");
/*
   new elasticsearch.Client({
   host: 'localhost:9200',
   log: 'trace'
   }

   );
   */

var indexConfig = {
    "index": "theegg",
    "type": "article"
};

var config = {};
exports.init = function(conf) {
    if (client != undefined) return;
    config = conf;
    var search = config.search;
    client = new elasticsearch.Client({
        host: search.host + ":" + search.port,
        log: 'info',

    });
    indexConfig.index = search.index;
    indexConfig.type = search.type;
};

exports.hash=function(val){
	var sha1=crypto.createHash('sha1');
	sha1.update(val);
	return sha1.digest('hex');
}
exports.queryUrl = function(req, res) {
    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    var url = req.param('targetUrl', '');
    if (url == '') {
        //res.send(404);
		res.status(404).end();
        return;
    }
	url=encodeURI(decodeURI(decodeURI(url)));

	var hashid=exports.hash(url);
    console.log("targetUrl: %s, _id %s ", url,hashid);
    client.search({
        index: index,
        type: type,
        body: {
            query: {
				bool:{
				should:[
				{
					term : {
						_id:hashid
					}
				},
				{
					term: {
						url: url
					}
				}
			]
            }
			}
        }

    }).then(function(resp) {
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
    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    client.mlt({
        index: index,
        type: type,
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
exports.flt = function(pageContent,options,callback) {
			var index=options.index;
			var type=options.type;
			var fltType=options.fltType;
			var req=options.req;
            queryBody = {
                index: index,
                type: type,
                body: {
                    _source: ["contenttitle", "url","thumbnail"],
                    from: 0,
                    size: 20,
                }
            };
			var body=ejs.BoolQuery().must(ejs.QueryStringQuery(pageContent));
			//var body=ejs.BoolQuery().should(ejs.MoreLikeThisQuery(['contenttitle','title'],options.pageContent));
			//body.boost(3);
			//body=body.should(ejs.QueryStringQuery(options.keywords));
			body.boost(2);
			var range=parseInt(req.param('range',0));
			
			if(range>0){
				var rq={};
				var now=Date.now()/1000;
				var from=now-range*24*60*60;
				body=body.must(ejs.RangeQuery("article_time").from(from).to(now));
			}
			var domain=req.param('domain','');
			if(domain!=''){
				body=body.must(ejs.TermQuery("domain",domain));
			}
			console.log("..."+JSON.stringify(body));

			queryBody.body=ejs.Request().query(body).size(20);
			//console.log("2.."+JSON.stringify(queryBody.body));
            client.search(queryBody).then(function(resp) {
                req.etime = Date.now();
                req.appendlog("finish queryFlt cost:%d ms", (req.etime - req.stime));
                //			res.send(resp.hits.hits);
                var hits = resp.hits.hits;
                var urls = [];
                var uq = [];
                for (var h in hits) {
					//filter duplicate urls
                    var title = hits[h]._source.contenttitle;
                    if (uq[title] > 0) continue;
                    uq[title] = 1;
                    urls.push(hits[h]._source.url);
                    //				result.push({'id':hits[h]._id,'url':hits[h]._source.url,title:hits[h]._source.contenttitle,score:hits[h]._score});
                }
                //revive(urls, hits);
				callback(urls,hits);

            });
        };
exports.revive = function(urls, hits,options,callback) {
            //	console.log(JSON.stringify(urls));
    		var result = [];
            var arr_url = [];
            var ind = {
                index: 'theegg_revive',
                type: 'revive'
            };
            for (var u in urls) {
                arr_url.push(ind);
                arr_url.push({
                    _source: ['bannerid', 'url', 'contenttitle'],
                    query: {
                        match: {
                            url: urls[u]
                        }
                    }
                });
            }
            client.msearch({
                body: arr_url
            }, function(error, response) {
                var ra = response.responses;

                var uq = [];
                var ub = []
                for (var rs in ra) {
                    if (ra[rs].hits.length < 1 || ra[rs].hits.hits.length < 1) {
                        continue;
                    }
                    var uu = ra[rs].hits.hits[0]._source;
                    if (ra[rs].hits.hits.length > 0) {
                        ub[uu.url] = uu.bannerid;
                    } else {
                        ub[uu.url] = -1;
                    }
                }
                for (var h in hits) {
                    var title = hits[h]._source.contenttitle;
                    var url = hits[h]._source.url;
                    if (uq[title] > 0) continue;
                    uq[title] = 1;
                    urls.push(hits[h]._source.url);
                    var bannerid = 0;
                    if (ub[url] > 0) {
                        bannerid = ub[url];
                    }
                    result.push({
                        'id': hits[h]._id,
                        'url': hits[h]._source.url,
                        title: hits[h]._source.contenttitle,
                        score: hits[h]._score,
						thumbnail:hits[h]._source.thumbnail,
                        bannerid: ub[url]
                    });
                }
				//console.log(s);
                delete uq;
       //         res.send(s);

				callback(result);
            });



        };
exports.showwidget=function(req,res){
    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    var content= req.param("content", "");
	req.appendlog('content:'+content);
	var maxc=req.param("maxc",4);
	var title=req.param("title","");
	if(maxc<4){
		maxc=4
	}
	if(maxc>7){
		maxc=7;
	}
	//content=decodeURI(content);
	options={index:index,type:type,req:req,fltType:"keywordonly"};
	exports.requestKeyword(title+" "+content,function(error,result){
			if(error>0){
				res.status(500).end("Internal Error: 50031");
				return;
			}
			var k='';
			var MaxKeyword=9;
			var len=result.length>MaxKeyword?MaxKeyword:result.length;
			for(var i=0;i<len;i++){
				k+=" "+result[i].word;

			}
			req.appendlog("keyword len: "+len+"keyword:"+k);
			options.keywords=k;
			options.pageContent=title+' '+content;

//			exports.flt(k,options,function(urls,hits){
			exports.flt(title+" "+content,options,function(urls,hits){
				exports.revive(urls,hits,options,function(result){
					console.log(JSON.stringify(result));
					var nr=[];
					for(var i in result){
						if(result[i].title=='' || result[i].thumbnail=='' || result[i].url==''){
							continue;
						}
						if(result[i].title==title){
							continue;
						}
						if(result[i].title.length>24){
							result[i].title=result[i].title.substr(0,23)+"...";//substring(result[i].title,0,20)+"...";
						}
						nr.push(result[i]);

					}
					if(maxc<nr.length){
						nr.splice(maxc-2,nr.length-maxc);
					}
					delete result;
					
					res.render("plugin_thumb",{result:nr});

				});

			});
	});

};
exports.queryFlt = function(req, res) {
    req.stime = Date.now();
    //	req.appendlog("queryFlt: %s", req.query.url);
	var options={};
    id = req.query.id;
    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    var url = req.param('targetUrl', "");
    var keyword = req.param('keyword', "");
	options={index:index,type:type,req:req};
    if (url.length < 1) {
        if (keyword == "") {
            var m = util.format("resource not found: %s", url)
            res.send(JSON.stringify({
                request_id: req.request_id,
                errmsg: m
            }));
            res.end(404);
        } else {
			//search by keywords
			req.appendlog("query multi keywords by flt");
			options.fltType="keywordonly";
			exports.flt(keyword,options,function(urls,hits){
				exports.revive(urls,hits,options,function(result){
					res.send(JSON.stringify(result));
				});
				
			});

        }
    } else {
		//search by urls

        client.search({
            index: index,
            type: type,
            body: {
                query: {
                    match: {
                        url: url
                    }
                }
            }

        }).then(function(resp, err) {
            //		console.log(err);
            if (resp.hits.hits.length > 0) {
                var id = resp.hits.hits[0]._id;
                var body = resp.hits.hits[0]._source.content;
                var title = resp.hits.hits[0]._source.contenttitle;
                req.appendlog("id: %s, title: %s, body: %s", id, title, body);
                //	res.send(resp.hits.hits[0]);
				options.fltType="content"
               exports.flt(title + "  " + body,options,function(urls,hits){
					exports.revive(urls,hits,options,function(result){
						res.send(JSON.stringify(result));
					});
					
				});
            } else {
                var m = util.format("Not Found Url: %s", url);
                req.appendlog(m);
                console.log(m);
                res.send(JSON.stringify({
                    request_id: req.request_id,
                    errmsg: m,
                    error_code: 40011
                }));
                res.end(404);
                //res.render('404',{errmsg:m});
            }
        }, function(err) {
            console.trace(err.message);
        });
    }


};

exports.queryKw = function(req, res) {

    var pageNum = req.param('page', 1);
    var perPage = req.param('perpage', 10);
    var kw = req.param('kw', "*");
    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    req.appendlog("index:" + index + " type:" + type);
    //indexConfig.index=index;
    //indexConfig.type=type;
    client.search({
        index: index,
        type: type,
        from: (pageNum - 1) * perPage,
		to:(pageNum*perPage),
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
		console.log(JSON.stringify(resp.hits));
        /*
		   response.render('search_results', {
		   results: response.hits.hits,
		   page: pageNum,
		   pages: Math.ceil(response.hists.total / perPage)
		   })
		   */
    });
};
exports.requestKeyword=function(text,callback){

    var data = text.replace(/\"/g, '\'').replace(/[\r\n\(\)\[\]]/g, '');
    var opt = {
        method: "POST",
        host: "127.0.0.1",
        port: 11200,
        path: "/",
        headers: {
            "Content-Length": data.length
        }
    }
    console.log("start req keyword: " + JSON.stringify(opt));
    var keywordreq = http.request(opt, function(serverFeedback) {
        if (serverFeedback.statusCode == 200) {
            var body = "";
            serverFeedback.on('data', function(data) {
                body += data;
            }).on('end', function() {
                var tokens = JSON.parse(body.replace(/[\r\t\n\\\/]/g, ""));
                var arr = [];
                for (var t in tokens) {
					var words=tokens[t].split(":");
					if(words.length>0){
                    	arr.push({word:words[0],score:words[1]});
					}
                }
				callback(0,arr);
                //res.send(arr);
            });

        } else {
            callback(50013,JSON.stringify({
                request_id: req.request_id,
                msg: errmsg,
                error_code: 50013
            }));
        }
    });
    keywordreq.write(data);
    keywordreq.end();

	};
exports.extractKeyword = function(req, res, keyword) {

    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    analyzer = req.param('analyzer', 'ik');
    var text = req.param('text', '');
    console.log("length: " + text.length);
    if (text == '') {
        res.send({
            "request_id": req.request_id,
            "error_code": 50010,
            "err_msg": "text should not empty."
        });
        return;
    } else if (text.length > 204800) {
        res.send({
            "request_id": req.request_id,
            "error_code": 50011,
            "err_msg": "text too long."
        });
        return;

    }
	exports.requestKeyword(text,function(error,result){
		if(error>0){
			res.send(result);
		}
		res.send(result);

	});
	/*
    var data = text.replace(/\"/g, '\'').replace(/[\r\n\(\)\[\]]/g, '');
    var opt = {
        method: "POST",
        host: "127.0.0.1",
        port: 11200,
        path: "/",
        headers: {
            "Content-Length": data.length
        }
    }
    console.log("start req keyword: " + JSON.stringify(opt));
    var keywordreq = http.request(opt, function(serverFeedback) {
        if (serverFeedback.statusCode == 200) {
            var body = "";
            serverFeedback.on('data', function(data) {
                body += data;
            }).on('end', function() {
                //var tokens =eval('('+body+')');//JSON.parse(body);
                var tokens = JSON.parse(body.replace(/[\r\t\n\\\/]/g, ""));
                var arr = [];
                for (var t in tokens) {
					var words=tokens[t].split(":");
					if(words.length>0){
                    	arr.push({word:words[0],score:words[1]});
					}
                }
                //			console.log("source: "+JSON.stringify(arr));
                //var ret = keyword.calculateIdf(arr);
                //		console.log("idf:" + JSON.stringify(ret));
                res.send(arr);
            });

        } else {
            res.send(JSON.stringify({
                request_id: req.request_id,
                msg: errmsg,
                error_code: 50013
            }));
        }
    });
    keywordreq.write(data);
    keywordreq.end();
	*/
};

exports.queryId = function(req, res) {
    var id = req.param("id", -1);
    var url = req.param("targetUrl", "");
    if (url.length < 1) {
        var m = util.format("Not Found Url: %s or URL is empty", url);
        req.appendlog(m);
        console.log(m);
        res.send(JSON.stringify({
            request_id: req.request_id,
            errmsg: m,
            error_code: 40012
        }));
        res.end(404);
        return;
    }
    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    //indexConfig.index=index;
    //indexConfig.type=type;
    jsonformat = req.param('jsonformat', 0);
    if (id < 0) {
        res.send(404);
        res.end("err: not found id:" + id);
        return;
    }
    result = {};
    async.series([

    function(cb) {
        //content
        client.search({
            index: index,
            type: type,
            body: {
                query: {
                    match: {
                        url: url
                    }
                }
            }
        }).then(function(resp) {
            console.log(resp);
            if (resp.hits.hits.length > 0) {
                var top1 = resp.hits.hits[0];
                //console.trace(top1);
                result["content"] = top1._source;
                result["content"]._index = top1._index;
                result["content"]._type = top1._type;
                result["content"]._url = top1._source.url;
                cb();
            } else {
                var m = util.format("resource not found: %s", url)
                res.send(JSON.stringify({
                    request_id: req.request_id,
                    errmsg: m
                }));
                res.end(404);
                cb();
            }
        });;

    }, function(cb) {
        //mlt
        console.log('=-=============================');
        //				console.trace(result["content"]);
        client.search({
            index: index,
            type: type,
            body: {
                query: {
                    "more_like_this": {
                        "fields": ["content", "contenttitle"],
                        "max_query_terms": 10,
                        "like_text": result["content"].content + " " + result["content"].contenttitle,
                    }
                }
            }
        }).then(function(resp) {
            //result["relate"]=resp.hits.hits;
            req.appendlog("related new search end. time:" + Date.now());
            result["relate"] = [];
            ct = [];
            for (var i in resp.hits.hits) {
                var ele = resp.hits.hits[i];
                var ii = encodeURIComponent(ele._source.contenttitle);
                if (ct[ii] == 1) continue;
                ct[ii] = 1;
                result["relate"].push({
                    _id: ele._id,
                    _index: ele._index,
                    _type: ele._type,
                    _source: {
                        contenttitle: ele._source.contenttitle,
                        url: ele._source.url
                    }
                });

            }
            cb();
        });
    }], function(err, results) {
        if (jsonformat == 0) {
            res.render("detail", result);
        } else if (jsonformat == 1) {
            res.send(JSON.stringify(result, null, 4));

        }

    });

};

module.exports = exports;

