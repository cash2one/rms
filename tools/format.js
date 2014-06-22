var util=require('util');
function format(f){
	console.log(util.format.apply(f,arguments));
}
format("haha%d%d%d",1,2,3);

