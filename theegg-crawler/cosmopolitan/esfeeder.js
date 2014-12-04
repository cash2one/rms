var db = require('mysql');
var crypto=require('crypto');
var config = require('./configLoader.js');
var elasticsearch = require('elasticsearch');

config.load(__dirname + '/config.json');

var feeder= function() {
		var client=new elasticsearch.Client(config.get('es'));
		var default_index=config.get("domain_mapping").default_index+"";
		var default_type=config.get("domain_mapping").default_type+"";
        var self = this;
        this.conn = db.createConnection(config.get('db'));
		//增量
		this.add=function(limit,type){
			//find max id in es
			client.search({
				index:default_index,
				type:type?type:"",
				body:{
					size:0,
					aggregations:{
						"max_url_id":{
							"max":{"field":"url_id"}
						}
					}
				}
			},function(error,response){
				max_url_id=response.aggregations.max_url_id;
				if(!max_url_id.value){
					max_url_id.value=0;
				}
				console.log("type: %s max_url_id:%d",type,max_url_id.value);
				self.addNewUrl(max_url_id.value,0,20,type);
			});


		};
		this.addNewUrl=function(max_id,start,limit,type){
			var sql='SELECT body as content, id as url_id, url,title as contenttitle,domain,type,thumbnail, unix_timestamp(page_time) as article_time FROM `websites` WHERE LENGTH(body)>20';
			if(type){
				sql+=' and type=\"'+type+'\"';
			}
				sql+= ' and id>'+max_id+' order by id asc LIMIT '+start+','+limit;
				console.log("query db begin:"+sql);
			this.conn.query(sql,function(e,result){
				if(result==undefined){
					return;
				}
				var count=result.length;
				if(count<=0 || result.length==undefined){
					console.log('end'); 
					return 0; 
				}
				var next=start+count;
				//bulk index
				self.bulkIndex(result,function(e){
					self.addNewUrl(max_id,next,limit,type);

				});

			});

		}
		//更新
		this.update=function(){
			var sql='';

		};
		//全量
		
		this.all=function(start,limit,type){
			var sql='SELECT body as content, id as url_id, url,title as contenttitle,domain,type,thumbnail, unix_timestamp(page_time) as article_time FROM `websites` WHERE LENGTH(body)>20';
			if(type){
				sql+=' and type=\"'+type+'\"';
			}
			sql+=' order by id asc LIMIT '+start+','+limit;
            this.conn.query(sql, function(e, result) {
				if(result==undefined){
					return;
				}
				var count=result.length;
				if(count<=0 || result.length==undefined){
					console.log('end'); 
					return 0; 
				}
				console.log("length:"+count);
				var next=start+count;
				self.bulkIndex(result,function(e){
				self.all(next,limit,type);
				});

			});


		};
		this.bulkIndex=function(records,cb){
			var body=[];
			for(var i in records){
				var r=records[i];
				var ty=records[i].type;//config.get("domain_mapping")[records[i].domain];
				if(ty==undefined){
					ty=default_type;

				}
				id=this.hash(records[i].url);
				var action={index:{_index:default_index,_type:ty,_id:id}};
				var doc={content:r.content,contenttitle:r.contenttitle,article_time:r.article_time,url:r.url,url_id:r.url_id,
					thumbnail:r.thumbnail,domain:r.domain,post_id:0};
				body.push(action);
				body.push(doc);
			}
			//console.log(JSON.stringify(body));
			//return;
			var start=Date.now();
			client.bulk({"body":body},function(err,resp){

				console.log("time span:"+(Date.now()-start)+" bulk count:"+records.length);
				if(cb!=undefined){
					cb();
				}
				});



		};
		this.hash=function(val){
			var sha1=crypto.createHash('sha1');
			sha1.update(val);
			return sha1.digest('hex');

		}

};
module.exports = feeder;
