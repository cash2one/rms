var elasticsearch = require('elasticsearch');
var async = require('async');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
}

);
//var indexConfig={"index":"theegg_v2","type":"searchasiav2"};
var indexConfig={"index":"theegg_v3","type":"searchasia_v3"};

exports.queryUrl = function(req, res) {
    console.log("queryUrl: %s", req.query.url);
    client.search({

        index: indexConfig.index,
        type:indexConfig.type,
        body: {
            query: {
                match: {
                    url: req.query.url
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
    client.mlt({
        index: indexConfig.index,
        type: indexConfig.type,
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

exports.queryKw = function(req, res) {

    var pageNum = req.param('page', 1);
    var perPage = req.param('perpage', 10);
    var kw = req.param('kw', "*");

    client.search({
        index: indexConfig.index,
        type: indexConfig.type,
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
        var pageend = (currentpage + 4) < total ? (currentpage + 4) : total
        console.log("page: %s %s  %s %s", pagestart, pageend, total, currentpage + 4)
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
            index: indexConfig.index,
            type: indexConfig.type,
            id: id,
        }).then(function(resp) {
            result["content"]=resp._source;
            cb();

//            console.trace(resp);


        });;

    }, function(cb) {
        //mlt
        client.mlt({
            index: indexConfig.index,
            type: indexConfig.type,
            id: id,
            mlt_fields: 'content,contenttitle'
        }

        ).then(function(resp) {
            result["relate"]=resp.hits.hits;
            cb();
        });
    }], function(err, results) {
        //log('1.1 results: ', results); // ->[ 'a400', 'a200', 'a300' ]

        //res.render("detail",{"content":results[0],"mlt":results[1]});
        console.trace("result:::::",result);
        res.render("detail",result);

    });

};

module.exports = exports;

