var keyword=require('../api/keyword');
var async=require('async');
async.series([function(callback){
keyword.init(callback);
},function(callback){

var ret=keyword.calculateIdf(["數量", "數量","香港","中國","大陸","內地","政府","香港"]);
console.log(JSON.stringify(ret));
callback()



}],function(err,results){

});
//var ret=keyword.calculateIdf(["數量", "數量","香港","中國","大陸","內地","政府","香港"]);
//console.log(JSON.stringify(ret));

