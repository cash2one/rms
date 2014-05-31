var db = require('mysql');
var config = require('./configLoader.js');

config.load(__dirname + '/config.json');

var dbhelper = function() {
        var self = this;
        this.conn = db.createConnection(config.get('db'));
        this.domainFilter = config.get('domainFilter');
        this.baseSite = config.get('baseSite');
        this.crawler = undefined;
        this.filterDomain = function(url) {
            if (self.domainFilter && url) {
                return url.indexOf(self.domainFilter) >= 0;
            }
            return false;


        }
        this.addUrl = function(url, ref) {
            if (!self.filterDomain(url)) {
                console.log("ignore url:" + url);
                return;
            }
            sql = "INSERT IGNORE INTO `queue` SET ?";
            self.conn.query(sql, {
                'url': url,
                'ref': ref

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
        this.queueUrl = function(cb) {

            if (!self.crawler) return;
            console.log("queue url:");
            this.conn.query('SELECT * FROM `queue` WHERE `status`=0 LIMIT 0,100', function(e, result) {
                console.log("queue url:" + result.length);
                if (result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        self.crawler.queue(result[i].url);
                    }
                }
                if (cb != undefined) cb(result.length);
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
            self.conn.query('INSERT IGNORE INTO `websites` SET ?', {
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
        this.trimBody = function(str) {
            var result = str.replace(/(\s+)|(\s+)/g, " ");
            return result;
        };

    };

module.exports = dbhelper;

