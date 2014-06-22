curl -XGET 'http://localhost:9200/theegg/searchasia,cosmopolitan/_search?' -d '
{
	query:{
		"fuzzy_like_this" : {
		"fields" : ["content","contenttitle"],
		"like_text" : "Google Japan has implemented some design changes this month"
	}

}
}'
curl -XGET 'http://localhost:9200/theegg/searchasia,cosmopolitan/_search?' -d '
{
	query:{
		"fuzzy_like_this" : {
		"fields" : ["content","contenttitle"],
		"like_text" :
		"首次以「活得精彩」名義，辦了第一個小型感恩聚會。感恩一直支持的工作顆伴、同學及朋友們；同時分享未來展望，特別希望將形象工作朝住身心靈方向，希望大家都活得更精彩"
	}

}
}'
