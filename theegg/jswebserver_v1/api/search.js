var elasticsearch = require('elasticsearch');
var util = require('util');
var async = require('async');
var client = undefined;
var http = require('http');
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
exports.queryUrl = function(req, res) {
    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    url = req.param('targetUrl', '');
    if (url == '') {
        res.send(404);
        return;
    }
    console.log("targetUrl: %s", req.query.url);
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
exports.queryFlt = function(req, res) {
    var flt = function(pageContent,keywordonly) {
            queryBody = {
                index: index,
                type: type,
                body: {
                    _source: ["contenttitle", "url","thumbnail"],
                    from: 0,
                    size: 20,
                    query: {

                        //"fuzzy_like_this" : {
                        "more_like_this": {
                            "fields": ["content", "contenttitle"],
                            "max_query_terms": 10,
                            "like_text": pageContent
                        }
                    }

                }
            };
            if (type.indexOf(",") > 0) {
                queryBody.body.query.fuzzy_like_this = queryBody.body.query.more_like_this;
                delete queryBody.body.query.more_like_this;
            }
			if(keywordonly==true){
				delete queryBody.body.query.more_like_this;
				queryBody.body.query.multi_match={
				"query":pageContent,
				"fields":["contenttitle","content"],
				};

			}
            client.search(queryBody).then(function(resp) {
                etime = Date.now();
                req.appendlog("finish queryFlt cost:%d ms", (etime - stime));
                //			res.send(resp.hits.hits);
                var hits = resp.hits.hits;
                var urls = [];
                var uq = [];
                for (var h in hits) {
                    var title = hits[h]._source.contenttitle;
                    if (uq[title] > 0) continue;
                    uq[title] = 1;
                    urls.push(hits[h]._source.url);
                    //				result.push({'id':hits[h]._id,'url':hits[h]._source.url,title:hits[h]._source.contenttitle,score:hits[h]._score});
                }
                revive(urls, hits);
				//console.log(JSON.stringify(hits));

            });
        };
    var result = [];
    var revive = function(urls, hits) {
            //	console.log(JSON.stringify(urls));
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
                var s = JSON.stringify(result);
				//console.log(s);
                delete uq;
                res.send(s);

            });



        };
    stime = Date.now();
    //	req.appendlog("queryFlt: %s", req.query.url);
    id = req.query.id;
    index = req.param('index', indexConfig.index);
    type = req.param('type', indexConfig.type);
    var url = req.param('targetUrl', "");
    var keyword = req.param('keyword', "");
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
			flt(keyword,true);

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
                flt(title + "  " + body);
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

