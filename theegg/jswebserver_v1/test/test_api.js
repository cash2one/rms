
http=require("http"); 
var querystring = require('querystring');
var data={
	//domain:"wp1.cosmopolitan.com.hk",
	domain:"lo.cosmopolitan.com.hk",
};
var post=querystring.stringify(data);
var options={
	hostname: '106.185.30.33',
	port: 3000,
	path: '/maxpostid',
	method: 'POST',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': post.length
	}

};
var req=http.request(options,function(res){
	console.log('STATUS: ' + res.statusCode);
	console.log('HEADERS: ' + JSON.stringify(res.headers));
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
		console.log('BODY: ' + chunk);
	});


});


req.on('error', function(e) {
	console.log('problem with request: ' + e.message);
});
req.write(post);

req.end();
