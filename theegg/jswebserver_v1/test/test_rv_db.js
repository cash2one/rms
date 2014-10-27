var rvdb=require('../lib/rv_dbhelper.js');
var record={url:"cosmopolitan.com.hk"};
var helper=new rvdb();
var util=require('util');

var t=new Date();
var h=parseInt(t-t%3600);
h1=new Date(t);
h=util.format("%s-%s-%s %d:00:00",t.getFullYear(),t.getMonth()+1,t.getDate(),t.getHours());
var imps=[
	{interval_start:h,creative_id:1,zone_id:1,count:1},
	{interval_start:h,creative_id:2,zone_id:1,count:1},
	{interval_start:h,creative_id:3,zone_id:1,count:1},
];

var imps1=[
[h,1,1,1],
[h,2,1,1],
[h,4,1,1],
]
helper.updateImpression(imps);

return;
//
helper.getBannerid(['www.baidu.com','cosmopolitan.com.hk'],function(){

});



//return;
helper.addBanner(record,function(){
});
var record1={url:"http://beta4wp2.theegg.com/?p=71424"};
helper.addBanners([record1,record]);
