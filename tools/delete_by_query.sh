curl -XGET 'http://localhost:9200/theegg/cosmopolitan/_query' -d '{
	"query" : {
		"term" : { "url" : "http://www.cosmopolitan.com.hk/fashion/fashion-features/playing-field" }
	}
}'
curl -XGET 'http://localhost:9200/theegg/cosmopolitan/_search' -d '{
	"query" : {
		"term" : { "_id" : "4455"}
	}
}'
