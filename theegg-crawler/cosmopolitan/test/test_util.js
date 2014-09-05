var util=require('../utils.js');
var u=util.resolveRelativeURL("","http://www.cosmopolitan.com.hk/");
console.log("url: "+u);
var url=require('url');
console.log(JSON.stringify(url.parse("http://www.cosmopolitan.com.hk:3322/fashion/abcd?dds=3&d=1")));
