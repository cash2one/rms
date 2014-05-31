var Crawler = require("../lib/crawler").Crawler;
var dbhelper = require('./dbhelper.js');
var cheerio = require('cheerio');
var util = require('./utils.js');
var db = new dbhelper();
var c = new Crawler({
    "maxConnections": 8,
    //    "timeout":60,
    "skipDuplicates": true,
    "debug": true,
    "cache": true,
    "callback": function(error, result, $) {
        try {
            var contenttype = result.headers['content-type'].split(";")[0];
            console.log("content-type:" + contenttype);
            if (contenttype != 'text/html' && contenttype != 'text/xml') {
                console.log("content type is not text/html or text/xml: " + result.uri);
                db.updateUrl(result.uri, 1);
                return;

            }

            $$ = cheerio.load(result.body);
            var currentUrl = result.window.location.href;
            db.updateUrl(currentUrl, 1);
            console.log(error);

            $$("a").each(function(i, a) {
                //            console.log("index : "+i+"find url:"+a+"  href:"+$$(a).attr("href")+" html:"+$$(a).html());
                var href = $$(a).attr("href");
                if(href.indexOf("#")>0){
                    href=href.substr(0,href.indexOf("#"));
                }
                if (href == undefined || util.imageRegexp.test(href)) return;
                db.addUrl(href, currentUrl);
            });
            db.index(currentUrl, result, $$, function($) {
                var contentleft = $$("div .entry");
                var title = contentleft.find("h1").text();
                console.log("title %s",title);
                var content = contentleft.find("p");
                //console.log("content <<<< %s >>>>", content.text());
                //         console.trace(currentUrl,content);
                $("script").remove();
                $("style").remove();
                $("div .meta").remove();

                if (contentleft.length > 0 && title.length>0 && content.length>0) {
                    //console.log(contentleft.text());
                    return {
                        "type": "article",
                        "body": content.text(),
                        "title":title
                    };
                } else {
                    //return $$.text();
                    var body="";
                    if(contentleft.length>0){
                        body=contentleft.text();
                    }else{
                        body=$("body").text();
                    }
                    //console.log("others pages: ",$("body").text());
                    return {
                        "type": "others",
                        "body": body 
                    };
                }
                //console.log(contentleft.length);
                //console.log(contentleft.text());
            });
        } catch (exception) {
            console.log("error:" + exception);

        }
    }
});
db.setCrawler(c);
console.log(db.baseSite);
db.queueUrl(function(count){
 if(count<=0){
     c.queue(db.baseSite);
 }
});

setInterval(function() {
    //    console.log("queuedCount:"+c.getQueuedCount());
    if (c.getQueuedCount() <= 0) {
                db.queueUrl();
    }

}, 10000);
//c.queue("http://www.searchblog.asia/korea/naver-korea-now-advertising-its-ppc-search-ads-on-cable-tv/");
//c.queue("http://www.searchblog.asia/2014/02/");
//c.queue(db.baseSite);
//c.queue(["http://joshfire.com/","http://joshfire.com/","http://joshfire.com/","http://joshfire.com/"]);
//c.queue("http://www.cnblogs.com/");
//c.queue("http://www.theegg.com/seo/overview");
//c.queue("http://www.theegg.com/seo/overview");
/*
c.queue([{
    "uri":"http://www.theegg.com/",
    "userAgent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/34.0.1847.116 Chrome/34.0.1847.116 Safari/537.36",
    "callback":function(err,result,$){
        console.log(err);
        console.log('theegg:');
        $('a').each(function(i,a){
            console.log(a.href);
        });

    }
    }
]);
*/
/*
c.queue([{
    "uri":"http://parisjs.org/register",
    "method":"POST",
    "timeout":120,
    "callback":function(error,result,$) {
        $("div:contains(Thank you)").after(" very much");
    }
}]);
*/

