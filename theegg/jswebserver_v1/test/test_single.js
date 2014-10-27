
var client=undefined;
module.exports.getInstance=function(){
	if(!client){
		client=Date.now();
	}
	return client;

};
