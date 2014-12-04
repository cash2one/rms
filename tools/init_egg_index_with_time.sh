
curl -XDELETE localhost:9200/theegg_time5
curl -XPUT localhost:9200/theegg_time5 -d '{
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
			"article":{
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
						"null_value":"",
                        "type" : "string",
						"index": "not_analyzed"
                    },
					"url_id":{
						"null_value":0,
						"type":"integer"
					},
					"post_id":{
						"null_value":0,
						"type":"integer"
					},
					"article_time":{
						"type":"integer"
					},
					"domain":{
						"type":"string",
						"index": "not_analyzed"
					},
					"thumbnail":{
						"null_value":"",
						"type":"string",
						"index": "not_analyzed"
					}

                }
			},
			"page":{
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
						"null_value":"",
                        "type" : "string"
                    },
					"post_id":{
						"type":"integer"
					},
					"url_id":{
						"null_value":0,
						"type":"integer",
						"index": "not_analyzed"
					},
					"article_time":{
						"type":"integer"
					},
					"domain":{
						"null_value":0,
						"type":"string",
						"index": "not_analyzed"
					},
					"thumbnail":{
						"null_value":"",
						"type":"string",
						"index": "not_analyzed"
					}

                }
			}

        }
}'
exit 0
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
