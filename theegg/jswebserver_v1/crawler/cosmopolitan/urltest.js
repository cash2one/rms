var nurl =require('url');
var url="http://nodejs.org/docs/latest/api/url.html?dd=22";
var obj=nurl.parse(url);
console.trace(obj,true);
