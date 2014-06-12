INDEX=cosmopolitan_v1
TYPE=cos_v1
DB=cosmopolitan
sleep 1
curl -XPUT localhost:9200/${INDEX} -d '{
        "mappings" : {
            "cos_v1" : {
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
curl -XPUT localhost:9200/_river/${INDEX}_jdbc_river/_meta -d '{
"type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/cosmopolitan",
        "user" : "root",
        "password" : "root",
        "sql" : [
        {
            "statement" : "select title as contenttitle,body as content, url as url,id as _id  from websites where LENGTH(body)>200 and type=\"article\"; "
        }
        ],
            "index" : "cosmopolitan_v1",
            "type" : "cos_v1",
            "bulk_size" : 200,
            "max_bulk_requests" : 2
    }
}'
