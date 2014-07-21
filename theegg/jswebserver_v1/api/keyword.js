var fs=require('fs');
var async=require('async');

var idf=[];
var idflock=1;
var exports={};
var MAGIC=50000000;
exports.init=function(callback,req,p){
	if(idflock==1){
		idflock=0;

	}else{
		return;
	}

	var path=process.cwd()+"/data/idf.dat";
	if(p!=undefined)
		path=p;
	var rOption={encoding:"utf-8"};
	var rs=fs.createReadStream(path,rOption);
	rs.on('data',function(data){
		var list=data.split("\n");
		for(var w in list){
			var kv=list[w].split(" ");
			idf[kv[0]]=kv[1];
		}

	});
	rs.on('end',function(){
		console.log("load idf end, length:"+idf.length);
		if(req!=undefined){
			req.appendlog("load idf end: path :"+path);
		}
		if(callback!=undefined){
			callback();
		}

	});
};
exports.initSync=function(req){
	async.series([
			function(cb){
				exports.init(cb);

			}
			],function(err,results){

	});

}
exports.calculateIdf=function(arr){
	var tf={};
	var tfidf=[];
//	console.log("input:"+JSON.stringify(arr));
	for(var a in arr){
//		if(arr[a].length<2)
//			continue;
		if(tf[arr[a]]>0){
			tf[arr[a]]+=1;
		}else{
			tf[arr[a]]=1;
		}
	}
	console.log("tf:"+JSON.stringify(tf,true));
	for(var t in tf){

		if(idf[t]>0){
			tfidf.push({word:t,score:tf[t]*Math.log(MAGIC/idf[t])});
			//tfidf[t]=tf[t]*Math.log(MAGIC/idf[t]);
//			console.log("word: "+t+" idf: "+idf[t]);
		}
		else{
			tfidf.push({word:t,score:tf[t]*Math.log(MAGIC)});

//			tfidf[t]=tf[t]*Math.log(MAGIC);
		}

	}
	return tfidf;
	

};
var extractKeyword=function(sentence){


};


exports.extractKeyword=function(req,res){
	



};
module.exports=exports;
