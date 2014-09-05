var _ = require('underscore');
var default_rule = {
    "domain_filter": "cosmopolitan.com.hk",
	"domain":"cosmopolitan.com.hk",
    "body_filter": "div#content",
    "type": "page",
    "title_filter": "head title",
    "thumbnail_filter": "div[class='field field-body'] > img"

};

var filters = [

{
    "domain_filter": ["cosmopolitan.com.hk\/beauty[\/-]",
		"cosmopolitan.com.hk\/fashion\/",
		"cosmopolitan.com.hk\/love-sex\/",
		"cosmopolitan.com.hk\/lifestyle\/",
		"cosmopolitan.com.hk\/entertainment\/",
		"cosmopolitan.com.hk\/horoscopes\/",
		"cosmopolitan.com.hk\/bride\/",
		"cosmopolitan.com.hk\/cosmotv\/"],

	"domain":"cosmopolitan.com.hk",
    "body_filter": "div[class='field field-body']",
    "type": "article",
    "title_filter": "div[class='field field-title'] > h2",

}, 
{
    "domain_filter": "cosmopolitan.com.hk\/come-n-share\/",
    "body_filter": "div#content-area div.content",
	"domain":"cosmopolitan.com.hk",
    "type": "article",
    "title_filter": "span.come-n-share-title",
    "thumbnail_filter": "div#content-area div.content img"

}
];
var sort_filter=[];
var rule = {};
rule.find = function(url) {
    for (var i in sort_filter) {
//        console.log(tmp[i].domain_filter);
		
		if(sort_filter[i].reg.test(url)){
			return sort_filter[i];
		}

    };
    return default_rule;



}
rule.init=function(){
	var split_filters=[];
	for(var i in filters){
		if(_.isArray(filters[i].domain_filter)){
			var d=filters[i];
			for(var j in d.domain_filter){
				var domain={
					body_filter:d.body_filter,
					type:d.type,
					domain:d.domain,
					title_filter:d.title_filter,
					thumbnail_filter:d.thumbnail_filter
				};
				domain.domain_filter=filters[i].domain_filter[j];
				split_filters.push(domain);
			}

		}else{
			split_filters.push(filters[i]);
		}

	}
    sort_filter= split_filters.sort(function(a, b) {
        return b.domain_filter.length - a.domain_filter.length;
    });
	for(var i in sort_filter){
		sort_filter[i].reg=new RegExp(sort_filter[i].domain_filter,"g");
	}
//	console.log("count %d %s",sort_filter.length,JSON.stringify(sort_filter));

}
rule.init();

module.exports = rule;

