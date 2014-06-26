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
exports.crawler=function(url,cb){



};
