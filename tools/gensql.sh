head news_tensite_xml.smarty.dat  | awk 'BEGIN{f=0;}
{
	if($0=="<doc>"){
		f=1;
	};
		if($0=="</doc>"){
f=0;
		};
		if(f==1){


		};
		if(f==0){

		};


}END{}'
