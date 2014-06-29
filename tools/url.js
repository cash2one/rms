var URL = require('url'); 
var testUrl = "http://www.baidu.com:8080/index.php?content=abc"; 
var p = URL.parse(testUrl); 
console.log(JSON.stringify(p));
console.log("------------------href : " + p.href); //取到的值是：http://www.baidu.com:8080/index.php?content=abc 
console.log("------------------requestHead: " + p.protocol); //取到的值是：http: 
console.log("------------------hostname: " + p.hostname);//取到的值是：www.baidu.com 
console.log("------------------host:" + p.host);//取到的值是：www.baidu.com:8080 
console.log("------------------port: " + p.port);//取到的值是：8080 
console.log("------------------path: " + p.path);//取到的值是：/index.php?content=abc 
console.log("------------------hash: " + p.hash);//取到的值是：null 
console.log("------------------query: " + p.query);//取到的值是：content=abc,在此值得注意的是当语句是 var p = URL.parse(testUrl, true) 时,p.query则返回的是如：{content:'abc'}这样的对象，直接打印p.query则返回 [object Object]，这时我们可以这样写： var pp = p.query; console.log("------------------content: " + pp.content);//取到的值是：abc 
console.log("------------------pathname: " + p.pathname);//取到的值是：/index.php
