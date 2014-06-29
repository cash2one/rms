curl -XPOST 'localhost:9200/theegg/searchasia/_bulk' -d 
{	"doc" : 
	{
		"url" : "http://www.searchblog.asia/korea/naver-search-results-new-social-sharing-options/"
	}
}
	{
		"doc":	{
		"url" : "http://www.searchblog.asia/japan/yahoos-new-serp-designs-mobile-and-knowledge-graph/"
	}
}

'
