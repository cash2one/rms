
curl -XPUT localhost:9200/theegg -d '{
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
            },
			"cosmopolitan":{
                "_all":{
                    "enabled":true,
                    "analyzer":"ik"
                },
                "properties" : {
                    "content" : {
                        "type" : "string",
                        "analyzer" : "ik"
					},
                    "contenttitle" : {
                        "type" : "string",
                        "analyzer" : "ik"
                    },
                    "url" : {
                        "type" : "string",
                        "index" : "not_analyzed"
                    }
                }
			}

        }
}'
sleep 1
curl -XPUT localhost:9200/_river/searchasia_mysql_river/_meta -d '{
"type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/searchasia",
        "user" : "root",
        "password" : "root",
        "sql" : [
        {
            "statement" : "select title as contenttitle,body as content, url as url,id as _id, unix_timestamp() as ctime  from websites where LENGTH(body)>200 and type=\"article\""
        }
        ],
            "index" : "theegg",
            "type" : "searchasia",
            "bulk_size" : 200,
            "max_bulk_requests" : 2
    }
}'
sleep 1

curl -XPUT localhost:9200/_river/cosmopolitan_mysql_river/_meta -d '{
"type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/cosmopolitan",
        "user" : "root",
        "password" : "root",
        "sql" : [
        {
            "statement" : "select title as contenttitle,body as content, url as url,id as _id, unix_timestamp() as ctime  from websites where LENGTH(body)>200 and type=\"article\""
        }
        ],
            "index" : "theegg",
            "type" : "cosmopolitan",
            "bulk_size" : 200,
            "max_bulk_requests" : 2
    }
}'
