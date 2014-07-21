$ curl -XDELETE 'http://localhost:9200/twitter/tweet/_query' -d '{
"query" : {
"term" : { "user" : "kimchy" }
				}
			}
			'
