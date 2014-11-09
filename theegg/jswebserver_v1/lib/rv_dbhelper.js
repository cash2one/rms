var mysql=require('mysql');
var config = require('../configLoader.js');

config.load(__dirname + '/../config.json');

var dbhelper = function() {
        var self = this;
        this.conn = mysql.createConnection(config.get('revive_db'));
        this.addBanners= function(records, cb) {
			var pointer=0;

			for(var i in records){
				self.addBanner(records[i],function(){
					pointer+=1;
					if(pointer==records.length){
						console.log('finish insert banners, total : '+pointer);
						if(typeof cb =='function'){
							cb();
						}
					}
				
				});


			}
        };
		self.SQL_GET_BANNER="SELECT bannerid from rv_banners where description = ?";
		self.SQL_INSERT_BANNER="INSERT into rv_banners SET ?";
		self.SQL_UPDATE_BANNER="UPDATE rv_banners set ? where bannerid =?";
		this.addBanner=function(record,cb){
			//select

			var sql=mysql.format(self.SQL_GET_BANNER,[record.url]);
			self.conn.query(sql,function(err,result){
				console.log("sql:%s,error:%s, result:%s",sql,JSON.stringify(err),JSON.stringify(result));
				var t=new Date();
				var upTime=require('util').format("%s-%s-%s %d:%d:%d",t.getFullYear(),t.getMonth()+1,t.getDate(),t.getHours(),t.getMinutes(),t.getSeconds());
				var banner={
					campaignid:1,
				description:record.url,
				block:0,
				capping:0,
				session_capping:0,
				bannertype:0,
				updated:upTime,
				};
				if(result.length<=0){
					//insert
					console.log("insert ",banner);

					self.conn.query(self.SQL_INSERT_BANNER,banner,function(err,insertresult){
						if(!err){
							
							console.log("insert error: %s",err,insertresult);

						}
						if(typeof cb =='function'){
							cb();
						}

					});
						

				}else{
					console.log("banner has existed, Update ",banner);
					var usql=mysql.format(self.SQL_UPDATE_BANNER,[banner,result[0].bannerid]);
					console.log(usql);
					self.conn.query(usql,function(err,updateresult){
						console.log("insert error: %s",err,updateresult);
						if(typeof cb =='function'){
							cb();
						}
					});
				}
			});

		};
		var SQL_GET_BANNERID="select description, bannerid from rv_banners where description in (?)";
		this.getBannerid=function(urls,cb){
			if(!urls || urls.length<1 || urls.length>20){
				cb({error_code:51404,msg:'empty url array'});
				return;
			}
			var sql=mysql.format(SQL_GET_BANNERID,[urls]);
			console.log("get banner id sql:%s",sql);
			this.conn.query(sql,function(err,result){
				console.log("result: %s",JSON.stringify(result));
				var ret={};
				for(var i in result){
					ret[result[i].description]=result[i].bannerid;
				}
				console.log("ret %s",JSON.stringify(ret));
				if(typeof cb =='function'){
					cb(err,ret);
				}

			});


		}
		var SQL_UPDATE_IMPRESSION="insert into rv_data_bkt_m set ? on DUPLICATE KEY UPDATE count=count+VALUES(count);";
		this.updateImpression=function(imps,cb){
			if(!imps|| imps.length==0){
				if(typeof cb=='function')	cb();	
				return;
			}
			sql='';
			for(var i in imps){

				sql+=mysql.format(SQL_UPDATE_IMPRESSION,imps[i]);

			}
			console.log("update imp sql: %s",sql);


			self.conn.query(sql,function(err,result){
				if(typeof cb == 'function') cb(err,result);
				if(err){
					console.log("error:%s",JSON.stringify(err));
				}
				console.log("result: %s ",JSON.stringify(result));


			});
		}
		
}

module.exports = dbhelper;
