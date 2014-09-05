curl -XDELETE 'http://localhost:9200/theegg/cosmopolitan/_query' -d '
{"query":{"bool":{"must":[],"must_not":[],"should":[{"term":{"url":"http://www.cosmopolitan.com.hk/fashion/fashion-features/playing-field"}}]}},"from":0,"size":10,"sort":[],"facets":{}}
'
#	"query" : {
#		"term" : { "_id" : "4455"}
#	}
#}'
