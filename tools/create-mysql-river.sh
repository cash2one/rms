
        #"schedule" : "0 0 10,14 ? * *",
curl -XPUT 'http://localhost:9200/_river/news_jdbc_river/_meta' -d '{
"type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/sohu",
        "user" : "root",
        "password" : "root",
        "sql" : [
        {
            "statement" : "select *, url as _id from news limit 1000"
        }
        ],
            "index" : "news_v1",
            "type" : "content",
            "bulk_size" : 200,
            "max_bulk_requests" : 1
    }
}'
