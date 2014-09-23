curl -XPOST 'http://localhost:9200/_aliases' -d '{
	"actions" : [
		{ "remove" : { "index" : "theegg_time2", "alias" :	"theegg" } },
		{ "add" : { "index" : "theegg_time2", "alias" :	"theegg" } }
	]
}'
