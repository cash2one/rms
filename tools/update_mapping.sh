 curl -XUPDATE 'http://localhost:9200/theegg/_mapping' -d '
{
    "cosmopolitan" : {
        "_all":{
            "analyzer":"ik"
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
            "docno":{"type":"string"
            },
            "url":{"type":"string"
            }
        }
    }
}
'
