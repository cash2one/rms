curl -XPOST 'http://localhost:9200/_aliases' -d 
'
{
	"actions" : [
	{ "remove" : { "index" : "theegg_v3", "alias" : "theegg" } },
	{ "add" : { "index" : "theegg_v3", "alias" :	"theegg" } }
			]
}'
