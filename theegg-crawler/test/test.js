var Crawler = require("../lib/crawler").Crawler;

var c = new Crawler({
    "maxConnections":1,
//    "timeout":60,
    "debug":true,
    "callback":function(error,result,$) {
        console.log(error);
    
        $("a").each(function(i,a) {
            console.log(a.href);
        })
    }
});

//c.queue(["http://joshfire.com/","http://joshfire.com/","http://joshfire.com/","http://joshfire.com/"]);
//c.queue("http://www.cnblogs.com/");
c.queue("http://www.theegg.com/seo/overview");
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
