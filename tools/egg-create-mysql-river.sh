
        #"schedule" : "0 0 10,14 ? * *",
curl -XPUT 'http://localhost:9200/_river/theegg_jdbc_river/_meta' -d '{
"type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/websites",
        "user" : "root",
        "password" : "root",
        "sql" : [
        {
            "statement" : "select title as contenttitle,body as content, url as url,id as _id  from websites where LENGTH(body)>400; "
        }
        ],
            "index" : "theegg_v2",
            "type" : "searchasiav2",
            "bulk_size" : 200,
            "max_bulk_requests" : 2
    }
}'
