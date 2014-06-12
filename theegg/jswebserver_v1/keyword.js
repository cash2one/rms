var nodejieba = require("nodejieba");
nodejieba.loadDict("./dict/jieba.dict.utf8", "./dict/hmm_model.utf8");
var exports.cut=function(article){
    return nodejieba.cut(article);
}
var 
