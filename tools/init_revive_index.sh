
curl -XPUT localhost:9200/theegg_revive -d '{
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
            "searchblog" : {
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
                    },
					"ctime" :{
						"type":"string",
						"index":"not_analyzed"
					}
                }
            },
			"revive":{
                "_all":{
                    "enabled":true,
                    "analyzer":"stem"
                },
                "properties" : {
                    "bannerid" : {
                        "type" : "string"
					},
                    "compaignid" : {
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
sleep 1
curl -XPUT localhost:9200/_river/searchblog_mysql_river/_meta -d '{
"type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/db_searchblog",
        "user" : "root",
        "password" : "root",
        "sql" : [
        {
			"statement":"select ID as _id, unix_timestamp(post_date) as ctime,post_content as content,post_title as contenttitle,guid as url from uq74u99_posts where LENGTH(post_content)>200"
        }
        ],
            "index" : "theegg_revive",
            "type" : "searchblog",
            "bulk_size" : 200,
            "max_bulk_requests" : 2
    }
}'
sleep 1

curl -XPUT localhost:9200/_river/db_revive_mysql_river/_meta -d '{
"type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/db_revive",
        "user" : "root",
        "password" : "root",
        "sql" : [
        {
            "statement" : "select bannerid as _id,bannerid,campaignid,url from rv_banners"
        }
        ],
            "index" : "theegg_revive",
            "type" : "revive",
            "bulk_size" : 200,
            "max_bulk_requests" : 2
    }
}'
