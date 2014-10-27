var utils={};
var wordRegex=new RegExp(/[^\dA-Za-z\u3007\u3400-\u4DB5\u4E00-\u9FCB\uE815-\uE864]/);
utils.isWord=function(word){
	return !wordRegex.test(word);

}
module.exports=utils;
