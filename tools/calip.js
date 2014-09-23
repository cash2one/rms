var fs=require('fs');
M0 = Math.pow(2, 24);
M1 = Math.pow(2, 16);
M2 = Math.pow(2, 8);

//ip转换成int

function ip2num(ip) {


    var arr = ip.split('.');
    //	console.log(arr.length);
    if (arr.length == 4) {
        return arr[0] * M0 + arr[1] * M1 + arr[2] * M2 + parseInt(arr[3]);

    } else {
        return - 1;

    }

}
//test data
var a1 = [{
    s: 1,
    e: 10,
    a: '1,10'
}, {
    s: 11,
    e: 110,
    a: '11~110'
}, {
    s: 1122,
    e: 22222,
    a: '1122~22222'
}, {
    s: 133333,
    e: 133333,
    a: '133333~133333'
}, {
    s: 333331,
    e: 3333310,
    a: 'max'
}];

//二分查找
function find(ipnum, iplib, start, end) {
    var count = end - start;
    var index = start + Math.floor(count / 2);
//	console.log(start+":"+end+":"+JSON.stringify(iplib[index]));
    if (iplib[index].s <= ipnum && iplib[index].e >= ipnum) {
        return iplib[index].a;
    }
    if ((index - 1) >= start && ipnum<iplib[index].s) {
        return find(ipnum, iplib, start, index - 1);
    }
    if ((index + 1) <= end && ipnum>iplib[index].e) {
        return find(ipnum, iplib, index + 1, end);

    }




}
function readIplibFile(filePath){

	var data=fs.readFileSync(filePath,'utf-8')+"";
	 var arr = data.split(/[\r\n]/g);
console.log(arr.length);
	 var iplib=[];
	 var count=0;
	 for(var i=0;i<arr.length;i++){
		 var ips=arr[i].split(/\s+/g);
		 if(ips.length>=3){
			 iplib[count++]={
				 s:ip2num(ips[0]),
				 e:ip2num(ips[1]),
				 a:ips[2]
			 
			 };

		 }
//		 console.log("len:"+ips.length);

	 }
	
	return iplib;

}
function readIpFile(filePath){
	var data=fs.readFileSync(filePath,'utf-8')+"";
	var arr=data.split(/[\r\n]/g);
	console.log(arr.length);
	var iparr=[];
	for(var i=0;i<arr.length;i++){
		iparr[arr[i]]=ip2num(arr[i]);
	}
	return iparr;


}

function main() {

    console.log("result:" + ip2num('61.1.1.1'));
    console.log("result:" + ip2num('58.248.17.244'));
    console.log("result:" + ip2num('1.'));
	console.log("search:"+find(10,a1,0,a1.length-1));
	console.log("search:"+find(11,a1,0,a1.length-1));
	console.log("search:"+find(133333,a1,0,a1.length-1));
	console.log("search:"+find(333331,a1,0,a1.length-1));
	console.log("search:"+find(3333311,a1,0,a1.length-1));
	//读取ip地址信息数据库文件
	var iplib=readIplibFile("./iplib.dat");
//	console.log("iplib:"+JSON.stringify(iplib));
//	读待分析的ip数据
	var ip=readIpFile("./ipall.dat");
	console.log("ip:"+JSON.stringify(ip));
	var address=[];
	for(var i in ip){
		if(ip[i]!=-1)
		address[i]=	find(ip[i],iplib,0,iplib.length-1);

	}
	for(var a in address){
	//i打印输出，可以输出你喜欢的任意格式， 比如sql（这里都是过滤后的数据）	
		console.log(a+'  '+address[a]);


	}
}
main();

