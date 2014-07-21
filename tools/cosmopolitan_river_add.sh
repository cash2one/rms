curl -XPUT localhost:9200/_river/cosmopolitan_mysql_river_1/_meta -d '{
"type" : "jdbc",
"jdbc" : { 
"url" : "jdbc:mysql://localhost:3306/cosmopolitan",
"user" : "root",
"password" : "root",
"sql" : [
{
	"statement" : "select title as contenttitle,body as content, url as url,id as _id, unix_timestamp() as ctime  from websites where id>7000 and LENGTH(body)>200 and type=\"article\""                                       
}
],
"index" : "theegg", 
"type" : "cosmopolitan",
"bulk_size" : 200, 
"max_bulk_requests" : 2
}
}' 
