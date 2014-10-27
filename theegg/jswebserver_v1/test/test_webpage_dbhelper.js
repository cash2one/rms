var wpdb=require('../lib/es_dbhelper.js');
var record={url:"cosmopolitan.com.hk",content:"ddd",contenttitle:"s",type:"article",thumbnail:"",domain:"cosmopolitan.com.hk",page_time:Date.now()};
var helper=new wpdb();
helper.addWebpage(record,function(){
});
var record1={url:"https://github.com/felixge/node-mysql#custom-format",content:"ddd",contenttitle:"s",type:"article",thumbnail:"",domain:"cosmopolitan.com.hk",page_time:Date.now()};
helper.addWebpages([record1,record]);
