var nodejieba = require("nodejieba");
nodejieba.loadDict("./dict/jieba.dict.utf8", "./dict/hmm_model.utf8");

//var sf="有人抱怨没有测试代码。我工作中用到。写了个例子正好发这里。大家领会下精神";
var sf="Based on the Trie tree structure to achieve efficient word graph scanning; sentences using Chinese characters constitute a directed acyclic graph (DAG)";
console.log("sf:"+sf);
console.log(nodejieba.cut(sf));
nodejieba.loadKeywordDict("./dict/jieba.dict.utf8", "./dict/hmm_model.utf8","./dict/idf.utf8","./dict/stop_words.utf8");
console.log(nodejieba.extract(sf,5));
