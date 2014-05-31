 curl -XPUT 'http://localhost:9200/theegg_v1/searchasia/_mapping' -d '
{
    "content" : {
        "_all":{
            "analyzer":"ik",
            "enabled":true
        },
        "properties" : {
            "content" : {"type" : "string", 
                    "indexAnalyzer" : "ik",
                    "searchAnalyzer" : "ik",
                    "include_in_all" : "true",
                    "boost" : 1
            },
            "contenttitle" : {"type" : "string", 
                    "indexAnalyzer" : "ik",
                    "searchAnalyzer" : "ik",
                    "include_in_all" : "true",
                    "boost" : 2
            },
            "url":{"type":"string"
            }
        }
    }
}
'
