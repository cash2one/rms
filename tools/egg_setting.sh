INDEX=theegg_v3
TYPE=searchasia_v3
DB=searchasia
curl -XPUT localhost:9200/${INDEX}-d '{
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
            "searchasia" : {
                "_all":{
                    "enabled":true,
                    "analyzer":"stem"
                },
                "properties" : {
                    "content" : {
                        "type" : "string",
                        "analyzer" : "stem"
                    },
                    "contenttitle" : {
                        "type" : "string",
                        "analyzer" : "stem"
                    },
                    "url" : {
                        "type" : "string",
                        "index" : "not_analyzed"
                    }
                }
            }
        }
}'
curl -XPUT localhost:9200/_river/${INDEX}_jdbc_river/_meta -d '{
"type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/websites",
        "user" : "root",
        "password" : "root",
        "sql" : [
        {
            "statement" : "select title as contenttitle,body as content, url as url,id as _id  from searchasia where LENGTH(body)>400 and type=\"article\"; "
        }
        ],
            "index" : "theegg_v3"
            "type" : "searchasia_v3",
            "bulk_size" : 200,
            "max_bulk_requests" : 2
    }
}'
