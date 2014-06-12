<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
<meta name="generator"
content="HTML Tidy for HTML5 (experimental) for Windows https://github.com/w3c/tidy-html5/tree/c63cc39" />
<title></title>
</head>
<body>
<fieldset>
<legend>
search demo:
</legend>
<input type="" id="keyword_input" style="width:320px;height:24px;" />

<input type="button" onclick="searchClick();" value="search"/>

</fieldset>
<?php
//      error_reporting(0);
//echo phpinfo();
$from=0;
if(array_key_exists("from",$_GET)){
    $from=$_GET["from"];

}

$keyword="*";
if(array_key_exists("keyword",$_GET)){
    $keyword=$_GET["keyword"];
}
//echo "1";
function send_post($url, $post_data) {   

    $postdata = http_build_query($post_data);   
    $options = array(   
            'http' => array(   
                'method' => 'POST',   
                'header' => 'Content-type:application/x-www-form-urlencoded',   
                'content' => $postdata,   
                'timeout' => 15 * 60 // 超时时间（单位:s）   
                )   
            );   
    $context = stream_context_create($options);   
    $result = file_get_contents($url, false, $context);   

    return $result;   
}   
function curl_post($url,$method,$params=array()){
    if(trim($url)==''||!in_array($method,array('get','post'))||!is_array($params)){
        return false;
    }
    $result="";
    $curl=curl_init();
    curl_setopt($curl,CURLOPT_RETURNTRANSFER,1);
    curl_setopt($curl,CURLOPT_HEADER,0 ) ;
    switch($method){
        case 'get':
            $str='?';
            foreach($params as $k=>$v){
                $str.=$k.'='.$v.'&';
            }
            $str=substr($str,0,-1);
            $url.=$str;//$url=$url.$str;
            curl_setopt($curl,CURLOPT_URL,$url);
            break;
        case 'post':
            curl_setopt($curl,CURLOPT_URL,$url);
            curl_setopt($curl,CURLOPT_POSTFIELDS,$params);
            break;
        default:
            $result='';
            break;
    }
    if(isset($result)){
        $result=curl_exec($curl);
    }
    curl_close($curl);
    if (substr( $result, 0, 3 ) == "\xEF\xBB\xBF" ){   
        $result=substr_replace( $result, '', 0, 3 ) ;   
    }  
    return $result;


}

$data=array();
$k="content:".$keyword." or contenttitle:".$keyword;
$keyword=rawurlencode($k);
$url="http://localhost:9200/news/content/_search?pretty=true&q=".$keyword."&from=".$from;
//$url=rawurlencode($url);
//echo $url;
//$result=curl_post("http://localhost:9200/news/content/_search?pretty=true&q=content:".$keyword." OR contenttitle:".$keyword"&from=".$from,'get',$data);
$result=curl_post($url,'get',$data);
//$result=curl_post("http://www.baidu.com",'get',$data);

//print_r($result);
$aa=json_decode($result); 
$hits=$aa->hits->hits;
//print_r($aa);
$total=$aa->hits->total;
//echo "total:".$total."  ";
render_page($total/10,$from/10);

//echo $from;
foreach($hits as $hh){
    print_r("--------------------------------------------<br/>");
    $url=$hh->_source->url;
    ?>

        <h2><a href="<?php echo $url; ?>"><?php print_r($hh->_source->contenttitle); ?></a></h2>

        <div>
        <?php print_r(substr($hh->_source->content,0,253)); ?><a href="details.php?id=<?php echo $hh->_id; ?>">...more...</a>
        </div>


        <?php

}
render_page($total/10,$from/10);
// print_r($aa->hits->hits);
function render_page($t,$c){
    $arr=array();
    $brr=array();
    
    for($i=$c-1;$i<=$c+2;$i++){
        if($i!=$c){
            $arr[$i]=get_url($i,$keyword);//"demo.php?keyword=".$keyword."from=".($i*10);
        }
        else{
            $arr[$i]=" ";
        }
    }

    for($i=$t-2;$i<=$t;$i++){
        if($i!=$c){
            $brr[$i]=get_url($i,$keyword);//"demo.php?keyword=".$keyword."from=".($i*10);
        }
        else{
            $brr[$i]=" ";
        }
    }
    echo "<a href=".get_url($c-1,$keyword).">   <<   </a>";
    foreach($arr as $key=>$val){
        if($key>=0 && $key<=$total);
       echo "<a href=".$val." >  ".($key+1)." </a>";
    }
    echo "......";
    foreach($brr as $key=>$val){
        if($key>=0 && $key<=$total);
       echo "<a href=".$val." >  ".($key+1)." </a>";
    }
    echo "<a href=".get_url($c+1,$keyword).">   >>   </a>";
    echo "<br/>";

}
function get_url($i,$key){
    return "demo.php?keyword=".$key."from=".($i*10);

}
?>
<script>
function searchClick(){

    //alert(11);
    var kw=document.getElementById("keyword_input");
    url="demo.php?keyword="+trimStr(kw.value);
//    alert(url);
    window.location=url;
}
function trimStr(str){return str.replace(/(^\s*)|(\s*$)/g,"");}
</script>
</body>
</html>
