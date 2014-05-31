curl -XPUT localhost:9200/local -d '{
    "settings" : {
        "analysis" : {
            "analyzer" : {
                "stem" : {
                    "tokenizer" : "standard",
                        "filter" : ["standard", "lowercase", "stop", "porter_stem"]
                }
            }
        }
    },
        "mappings" : {
            "article" : {
                "dynamic" : true,
                "properties" : {
                    "title" : {
                        "type" : "string",
                        "analyzer" : "stem"
                    }
                }
            }
        }
}'
