var db = require('mysql');
var config = require('./configLoader.js');

config.load(__dirname + '/config.json');

var dbhelper = function() {
		var countRegex=new RegExp('\/','g');
        var self = this;
        this.conn = db.createConnection(config.get('db'));
        this.domainFilter = config.get('domainFilter');
        this.baseSite = config.get('baseSite');
        this.crawler = undefined;
        this.filterDomain = function(url) {
            if (self.domainFilter && url && url!=undefined) {
		//console.log("");
                return url.indexOf(self.domainFilter) >= 0;
            }
            return false;


        }
        this.addUrl = function(url, ref) {
            /*if (!self.filterDomain(url)) {
                console.log("ignore url:" + url);
                return;
            }*/
            sql = "INSERT IGNORE INTO `queue` SET ?";
            //sql = "REPLACE INTO `queue` SET ?";
			var level=url.match(countRegex).length;
			level-=3;
			if(level<0) level=0;

            self.conn.query(sql, {
                'url': url,
                'ref': ref,
				'level':level

            }, function(e) {
                if (e) {
                    console.log('Error add url %s', url);
                    console.log(e);
                }
            });
        };
        this.updateUrl = function(url, st) {

            sql = "UPDATE `queue` SET `status`= " + st + " where `url`=" + self.conn.escape(url);
            console.log("sql:" + sql);
            self.conn.query(sql, function(e) {
                if (e) {
                    console.log('Error add url %s', url);
                    console.log(e);
                }
            });

        };
        this.setCrawler = function(c) {
            self.crawler = c;
            console.log("set crawler to dbhelper ");

        }
        this.getQueueUrl = function(cb) {
            this.conn.query('SELECT * FROM `queue` WHERE `status`=0 order by level asc LIMIT 0,100', function(e, result) {
                console.log("queue url:" + result.length);
                if (cb != undefined) cb(result);
				var ids="(";
				for(var i in result){
					ids+=result[i].id+", ";

				}
				ids+="0)";
				self.conn.query('update queue set status=4 where id in '+ids,function(e){
					
					
				});
            });
			


        };

        this.index = function(url, result, $, cb) {
            var title = $('head title').text();
            var keywords = $('head meta[name=keywords]').attr('content');
            var desc = $('head meta[name=description]').attr('content');
            var body = $('body');
            var type = "";
            if (cb != undefined) {
                var content = cb($);
                if (content.body != undefined) body = content.body;
                if (content.type!= undefined) type = content.type;
                if (content.title != undefined) title = content.title

            }
            body = self.trimBody(body);
            console.log("url %s:||| type: %s ||| body %s", url,type, body);
			var sql='REPLACE INTO `websites` SET ?';
            self.conn.query(sql, {
                body: body,
                type: type,
                url: url,
                title: title,
                keywords: keywords || '',
                desc: desc || ''
            }, function(e) {
                if (e) {
                    console.log('Error indexing page %s', url);
                    console.log(e);
                } else {
                    console.log('Successfully indexed page %s', url);
                    self.indexed++;
                }
            });
        };
		this.store=function(page,cb){
            //console.log("url %s:||| type: %s ||| body %s", page.url,page.type, page.body);
			var sql='REPLACE INTO `websites` SET ?';
            self.conn.query(sql, {
                body: page.body,
                type: page.type,
                url: page.url,
                title: page.title,
                keywords: page.keywords || '',
                desc: page.desc || '',
				domain:page.domain||'',
				page_time:page.page_time,
				thumbnail:page.thumbnail
            }, function(e) {
                if (e) {
                    console.log('Error indexing page %s', page.url);
                    console.log(e);
                } else {
                    console.log('Successfully indexed page %s', page.url);
                    self.indexed++;
                }
				if(cb!=undefined){
					cb();
				}
            });




		};
        this.trimBody = function(str) {
            var result = str.replace(/(\s+)|(\s+)/g, " ");
            return result;
        };

    };

module.exports = dbhelper;

