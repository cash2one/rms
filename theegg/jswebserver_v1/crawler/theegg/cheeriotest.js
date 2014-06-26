
var Crawler = require("../lib/crawler").Crawler;
var dbhelper=require('./dbhelper.js');
var cheerio = require('cheerio');
var util=require('./utils.js');
var db=new dbhelper();
var c = new Crawler({
    "maxConnections":1,
//    "timeout":60,
    "skipDuplicates":true,
    "debug":true,
    "cache":true,
    "callback":function(error,result,$) {
        
        console.log("result:"+JSON.stringify(result.headers)+"content-type:"+result.headers['content-type'].split(";")[0]);
    return;
        $$=cheerio.load(result.body); 
        var currentUrl=result.window.location.href;
        db.updateUrl(currentUrl,1);
 //       console.log(error);
    
        $$("a").each(function(i,a) {
//            console.log("index : "+i+"find url:"+a+"  href:"+$$(a).attr("href")+" html:"+$$(a).html());
            var href=$$(a).attr("href");
            if(href==undefined || util.imageRegexp.test(href))
                return;
            db.addUrl(href,currentUrl);
        });
//        db.index(currentUrl,result,$$,function($){
//         var contentleft=$("div .entry");   
//         if(contentleft.length>0){
//             $$("script").remove();
//             $$("style").remove();
//             $$("div .meta").remove();
//             //console.log(contentleft.text());
//             return contentleft.text();
//         }else{
//            $$("script").remove();
//            $$("style").remove();
//            return $$.text();
//         }
//         //console.log(contentleft.length);
//         //console.log(contentleft.text());
//        });
    }
});
c.queue("http://www.baidu.com/img/bdlogo.gif");
c.queue("http://www.baidu.com/");

//process.exit();

console.log(Math.random()*1000+10000);
var cheerio = require('cheerio');
$=cheerio.load("<div><h1></h1><a></a></div>");
div=$("div");
console.log(div.html());
h1=$("div h1");
h1.remove();
console.log(div.html());
