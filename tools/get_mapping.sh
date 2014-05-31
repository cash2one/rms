

curl -XGET 'http://localhost:9200/news/_mapping'
curl -XGET 'http://localhost:9200/_i'




curl -XPUT 'http://localhost:9200/_river/my_jdbc_river3/_meta' -d '{
    "type" : "jdbc",
    "jdbc" : {
        "url" : "jdbc:mysql://localhost:3306/sohu",
        "user" : "root",
        "password" : "root",
        "sql" : [
            {
                "statement" : "select * from news"
            }
        ],
        "index":"news_index2",
        "type":"new_type3"
    }
}'


 curl -XPUT 'http://localhost:9200/news/content/_mapping' -d '
{
    "content" : {
	"_all":{"enabled":true}
        "properties" : {
            "content" : {"type" : "string", 
			"store" : true
			 }
        }
    }
}
'


 curl -XPUT 'http://localhost:9200/news_index2/content/_mapping' -d '
{
  
        "properties" : {
            "content" : {"type" : "string", 
			"fields" : true
			 }
        }
}
'

 curl -XPUT 'http://localhost:9200/news_index2/new_type2/_mapping' -d '
{
   "news_type2":{
	"properties":	{
		"content":{
"type":"string",
},
		"contenttitle":{"type":"string"},
		"docno":{"type":"string"},
		"id":{"type":"long"},
		"url":{"type":"string"}
	}	
	}
    
}'


 curl -XPUT 'http://localhost:9200/news_index2/new_type3/_mapping' -d '
{
   "news_type3":{
	"properties":	{
		"content":{"type":"string"},
		"contenttitle":{"type":"string"},
		"docno":{"type":"string"},
		"id":{"type":"long"},
		"url":{"type":"string"}
	}	
	}
    
}'



 curl -XPUT 'http://localhost:9200/news/news/_mapping' -d '
{
   "news":{
	"properties":	{
		"content":{"type":"string"},
		"contenttitle":{"type":"string"},
		"docno":{"type":"string"},
		"id":{"type":"long"},
		"url":{"type":"string"}
	}	
	}
    
}'


 curl -XPUT 'http://localhost:9200/news/content/_mapping' -d '
{
   "content":{
	"properties":	{
		"content":{"type":"string"},
		"contenttitle":{"type":"string"},
		"docno":{"type":"string"},
		"id":{"type":"long"},
		"url":{"type":"string"}
		}
	}
    
}'
