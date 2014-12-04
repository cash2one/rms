curl -XPOST 'http://localhost:9200/_aliases' -d '{
	"actions" : [
		{ "remove" : {"index":"theegg_time4",  "alias" :	"theegg" } },
		{ "add" : { "index" : "theegg_time5", "alias" :	"theegg" } }
	]
}'
