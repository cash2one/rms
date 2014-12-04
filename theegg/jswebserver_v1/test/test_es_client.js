
console.log('begin');
var elasticsearch = require('elasticsearch');
var util = require('util');
var async = require('async');
var client = undefined;
var crypto=require("crypto");
var http = require('http');
var ejs=require("../lib/elastic");
var client = new elasticsearch.Client({
	host: "localhost"+ ":" + "9200",
	log: 'info',
});
console.log('after');
var index="theegg";
var type="article"
var body=ejs.BoolQuery();//.must(ejs.QueryStringQuery(options.keywords));
var domain="dr1.cosmopolitan.com.hk";
body=body.must(ejs.TermQuery("domain",domain));
queryBody={
	index:index,
	type:type,
};
queryBody.body=ejs.Request().query(body).size(2).fields(['domain','url']);
console.log("..."+JSON.stringify(queryBody));
client.search(queryBody).then(function(resp){
	console.log("result:. for query");
	if(resp.hits && resp.hits.hits){
		console.log(JSON.stringify(resp.hits.hits));
	}
});

client.search({
	index:index,
	type:type,
	body:ejs.Request().facet(ejs.TermsFacet('domain').field('domain')).size(0)
}).then(function(resp){
	console.log("result:. for facet");
	if(resp){
		console.log(JSON.stringify(resp));
	}

});
