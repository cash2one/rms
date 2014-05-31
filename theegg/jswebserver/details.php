<html>
  <head>
    <meta name="generator"
    content="HTML Tidy for HTML5 (experimental) for Windows https://github.com/w3c/tidy-html5/tree/c63cc39" />
    <title></title>
  </head>
  <body>
    <?php
                //error_reporting(0);
                 function send_post($url, $post_data) {           
                $postdata = http_build_query($post_data);   
                $options = array(   
                  'http' => array(   
                    'method' => 'GET',   
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
                $id=$_GET["id"];
                $url="http://localhost:9200/news/content/".$id;
                $result=curl_post($url,'get',array());
                            //echo $result;
                            $resultObj=json_decode($result);
                            //echo $resultObj;
                ?>
    <h1>
      <?php echo $resultObj->_source->contenttitle;?>
    </h1>
    <div>
      <?php echo $resultObj->_source->content;?>
    </div>
    <div >
	<h2 style="border-top:1px solid black;width:100%;">相关新闻:</h2>
     
      <div>
        <?php 
                $relateUrl="http://localhost:9200/news/content/".$id."/_mlt?mlt_fields=content,contenttitle";
                $relateStr=curl_post($relateUrl,'get',array());
                //echo $relateStr;
                $relate=json_decode($relateStr);
                foreach( $relate->hits->hits as $rl){
                ?>
				<div><a href="details.php?id=<?php echo $rl->_id;?>">
				<?php
                echo $rl->_source->contenttitle;
				?>
				</a></div>
                <?php
				}
                ?>
      </div>
    </div>
  </body>
</html>
