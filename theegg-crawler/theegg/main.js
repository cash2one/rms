var Crawler = require('./crawler.js');
var async = require('async');
var spider = new Crawler();
//spider.crawl(function(){});
async.forever(function(cb){
    spider.crawl(function(){
        process.nextTick(function(){
            cb(null);
        });
    });
});

