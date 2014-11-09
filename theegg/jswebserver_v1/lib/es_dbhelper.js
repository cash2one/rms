var mysql=require('mysql');
var config = require('../configLoader.js');

config.load(__dirname + '/../config.json');

var dbhelper = function() {
        var self = this;
        this.conn = mysql.createConnection(config.get('db'));
        this.addWebpages= function(records, cb) {
			var pointer=0;

			for(var i in records){
				self.addWebpage(records[i],function(){
					pointer+=1;
					if(pointer==records.length){
						console.log('finish insert pages, total : '+pointer);
						if(typeof cb =='function'){
							cb();
						}
					}
				
				});

			}
        };
		self.SQL_GET_Webpage="SELECT 1 from websites where url= ?";
		self.SQL_INSERT_Webpage="INSERT into websites SET ?";
		self.SQL_UPDATE_Webpage="UPDATE websites SET ? where url=?";
		this.addWebpage=function(record,cb){
			//select

			var sql=mysql.format(self.SQL_GET_Webpage,[record.url]);
			self.conn.query(sql,function(err,result){
				console.log("sql:%s,error:%s, result:%s",sql,JSON.stringify(err),JSON.stringify(result));
				var page={
					body:record.content,
				type:record.type,
				title:record.contenttitle,
				url:record.url,
				thumbnail:record.thumbnail,
				domain:record.domain,
				page_time:record.article_time,
				desc:record.desc||'',
				keywords:record.keywords||''
				};
				if(result.length<=0){
					//insert
					console.log("insert ",page);

					self.conn.query(self.SQL_INSERT_Webpage,page,function(err,result){
						if(!err){
							
							console.log("insert error: %s",err,result);

						}
						if(typeof cb =='function'){
							cb();
						}

					});
						
				}else{
					var usql=mysql.format(self.SQL_UPDATE_Webpage,[page,record.url]);
					console.log("update webpage: %s" , usql);
					self.conn.query(usql,function(err,result){


					});
					console.log("page has existed ",page);
					if(typeof cb =='function'){
						cb();
					}
				}
			});

		};
}

module.exports = dbhelper;
