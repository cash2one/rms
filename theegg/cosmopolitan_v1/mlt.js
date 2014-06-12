var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
host: 'localhost:9200',
log: 'trace'
});
/*
   var request=require("request");
   exports.query=function(req,res){
   eurl="http://localhost:9200/news/content/_search?pretty=true"
   targetUrl=eurl+"&q=url:"+encodeURIComponent(req.query.url);
   console.log("query:"+targetUrl);
   var query_string=
   {
   "query_string" : {
   "default_field" : "content",
   "query" : "this AND that OR thus"
   }
   };
   var options = {
url:targetUrl, 
headers: {
'User-Agent': 'request'
}
};

request.get(options, function (error, response, body) {
if (!error && response.statusCode == 200) {

//                console.log(body);
res.send(body);

}
else{
console.log("error code:"+response.statusCode);
console.log("error :"+error);
console.log("body: "+body);


}
});
 */

exports.queryUrl=function(req,res){
    console.log("queryUrl: %s",req.query.url);
    client.search({
		
		index: 'news',
		type: 'content',
		body: {
		query: {
		match: {
		url: req.query.url
		}
		}
		}
		
		}).then(function (resp){
            if(resp.hits.hits.length>0){
                var id=resp.hits.hits[0]._id;
                res.send(resp.hits.hits[0]);
           // req.query.id=id;
		  //  res.send(resp);
             // res.write(resp.hits.hits[0]);
//            req.query.id=
            //exports.queryMlt(req,res);
            }
            else{
                res.send(404);
                res.end({"error":"no result response."});

            }
		    },function (err){
		    console.trace(err.message);
		    });

};

exports.queryMlt=function(req,res){
    console.log("queryMlt: %s",req.query.url);

    id=req.query.id;
    client.mlt(
    {
        index:'news',
        type:'content',
        id:id,
        mlt_fields:'content,contenttitle'
    }

    ).then(function(resp){
      //res.setHeader('Content-Type','text/html;charset=UTF-8');
        console.log("finish queryMlt: %s",req.query.url);
        res.send(resp.hits.hits);
   //       res.write(resp);
    //      res.end();
    });

};
module.exports=exports;
