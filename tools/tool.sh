
{
    "_source" : 
        {
            "enabled" : 1
        )

    "_all" : 
        {
            "indexAnalyzer" : ik
            "searchAnalyzer" : ik
            "term_vector" : no
            "store" : false
        )

    "properties" : 
        {
            "text" : 
                {
                    "type" : string
                    "term_vector" : with_positions_offsets
                    "indexAnalyzer" : ik
                    "searchAnalyzer" : ik
                    "include_in_all" : true
                    "boost" : 8
                )

            "title" : 
                {
                    "type" : string
                    "term_vector" : with_positions_offsets
                    "indexAnalyzer" : ik
                    "searchAnalyzer" : ik
                    "include_in_all" : true
                    "boost" : 8
                )

        )

)
