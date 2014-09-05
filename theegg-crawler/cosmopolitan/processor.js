var Crawler = require("../lib/crawler").Crawler;
var dbhelper = require('./dbhelper.js');
var cheerio = require('cheerio');
var util = require('./utils.js');
var nurl = require('url');
var rule=require('./rule.js');
var db = new dbhelper();
var MAXCONNECTION=32;
var c = new Crawler({
    "maxConnections": MAXCONNECTION,
    "skipDuplicates": true,
    "debug": true,
    "cache": false,
	"retries":1,
	"retryTimeout":30000,
	"timeout":90000,
	"autoWindowClose":true,
	"customParser":true,
    "callback": function(error, result, $) {
		if(error){
			db.updateUrl(currentUrl,1001);
			return;
		}
		result.time.callbackStart=new Date().getTime();
        try {
            //encoding process
			//console.log("body: "+$);
            var contenttype = result.headers['content-type'].split(";")[0];

            //console.log("content-type:" + contenttype);
            if (contenttype != 'text/html' && contenttype != 'text/xml') {
             //   console.log("content type is not text/html or text/xml: " + result.uri);
                db.updateUrl(result.uri, 1);
                return;

            }

            $$ = cheerio.load(result.body);
            var currentUrl = result.uri;
            db.updateUrl(currentUrl, 1);
            //console.log(error);
			var r=rule.find(currentUrl);
			//url process
            var currentUrlObj= nurl.parse(currentUrl);
			var fdomain=r.domain || currentUrlObj.hostname;
            $$("a").each(function(i, a) {
                //            console.log("index : "+i+"find url:"+a+"  href:"+$$(a).attr("href")+" html:"+$$(a).html());
                var href = $$(a).attr("href");

                if (href == undefined || util.imageRegexp.test(href)) return;


                var rehref = nurl.resolve(currentUrl, href); //util.resolveRelativeURL(href,currentUrl);
                var hrefobj = nurl.parse(rehref);
                var hrefstr = hrefobj.href;//hrefobj.protocol + "//" + hrefobj.host + hrefobj.pathname;
				if(r.ignoreQuery){
					hrefstr=hrefobj.protocol + "//" + hrefobj.host + hrefobj.pathname;
				}
                //console.log("resolve url:current:%s  href: %s rehref: %s  hrefstr:%s ", currentUrl, href, rehref, hrefstr);
				//console.log("hrefobj:"+JSON.stringify(hrefobj));
				

				if(r.crossDomain && hrefstr){
                	db.addUrl(hrefstr, currentUrl);
				}else if(hrefstr && hrefstr.indexOf(fdomain)>=0){
                	db.addUrl(hrefstr, currentUrl);
				}else{
					console.log("ignore url: %s",hrefstr);

				}
            });
	//		console.log(JSON.stringify(r));
			var page={};
			page.url=currentUrl;
			page.domain=r.domain || currentUrlObj.hostname;
			page.title=$$(r.title_filter+" ").first().text();
			var body=$$(r.body_filter+"").first();
			var imgsrc="";
			if(r.thumbnail_filter && r.thumbnail_filter.length>1){
				imgsrc=$$(r.thumbnail_filter+"").first().attr("src");

			}
			if(imgsrc=="" || imgsrc==undefined){
				imgsrc=body.find("img").first().attr("src");
			}
			//console.log("imgsrc: "+imgsrc);
			if(imgsrc!="" && imgsrc!=undefined){
				imgsrc=nurl.resolve(currentUrl,imgsrc);
			}
			page.thumbnail=imgsrc;
			$$("script").remove();
			$$("style").remove();
			var bodytext=body.text();
			//console.log(text);
			if(bodytext==""){ 
				page.type='other';
				if(bodytext==""){
					page.body=$$("body").text();
				}
			}else{
				page.type=r.type || "page";
				page.body=bodytext;//.replace(/[\n]/g,'');
			}
				page.body=page.body.replace(/[\n\r\t]/g,'').replace(/\s{2,100}/g," ");
			
			console.log("Result==>:"+JSON.stringify(page));
			db.store(page,function(){
				//console.log("store:"+page.url);

			});
			

        } catch (exception) {
            console.trace( exception); 
        }
		result.time.callbackEnd=new Date().getTime();
		var t=result.time;
		//console.log("TIME:"+JSON.stringify(t));
		console.log("TIME COST:WAIT:%d, REQ:%d, CALLBACK:%d,TOTAL:%d.",t.reqStart-t.queueTime,t.reqEnd-t.reqStart,t.callbackEnd-t.callbackStart,t.callbackEnd-t.reqStart);
    }
});

var processor=function(){
	this.singleUrl=function(url){
		c.queue(url);

	}
	this.crawler=function(baseurl){
		if(baseurl!=undefined){
			c.queue(baseurl);
		}
		setInterval(function() {
			if (c.getQueuedCount() <= MAXCONNECTION/2) {
				db.getQueueUrl(function(result){
					if (result.length > 0) {
						for (var i = 0; i < result.length; i++) {
							var t=1000*i+1;
							var turl=result[i].url;
							c.queue(turl);
						}
					}
					
				});
			}

		}, 500*MAXCONNECTION);

	}



};
module.exports = processor;
