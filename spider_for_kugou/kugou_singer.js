var request = require('request');
var cheerio = require('cheerio');
var path = require('path'); 
var fs = require('fs');

var out = fs.createWriteStream('./test1.txt');

var listUrl=new Array(); 
var filenames=new Array();

var requrl="http://www.kugou.com/yy/singer/index/1-a-1.html";
var headurlbase= 'http://www.kugou.com/yy/singer/index/'
var singerList=new Array()
var page_Num=0;

var reqlist=[]

for(let i=97;i<123;i++){
	var headbasestring= String.fromCharCode(i)
	var headurl = headurlbase+'1-'+headbasestring+'-1.html'
	//console.log( 'headurl  : ' +headurl );
	for (let j=1;j<=5;j++){
		requrl = headurlbase+j+'-'+headbasestring+'-1.html'
		reqlist.push(requrl);
		//console.log('curent url is ' + requrl)
	}
	for(let k=2; k<12;k++){
		requrl = headurlbase+'1-'+headbasestring+'-'+k+'.html'
		reqlist.push(requrl);
		//console.log('curent url is ' + requrl)
	}
} 	
console.log('End....'+reqlist.length);
//for(let i=0; i< reqlist.length;i++){
for(let i=0; i< 390;i++){
	console.log(' i =  ['+i+']   current get the url :  ---'+reqlist[i])
	getHtmlPage(reqlist[i])
}



function getHtmlPage(url){
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var tmplist =acquireSingerData(body)
			singerList.push.apply(singerList,tmplist)
		}
		console.log('singerList length ====='+singerList.length)
		console.log(singerList)


	});
}

function acquirePageNum(data){
	var $ = cheerio.load(data);
	console.log('start find page ');
	var pageNum=$('#mypage').find('a').eq(-3).text()   // 通过索引筛选匹配的元素。使用.eq(-i)就从最后一个元素向前数。
	console.log('mypage :'+pageNum)
	return pageNum
	
}



function acquireSingerData(data) { 
	var tmpsingerlist=[]

	var $ = cheerio.load(data);
	//网页内容装入cheerio中之后，查找网页节点元素， 加入'#'和加入’.‘查找的方式不一样
	
	//topsingerlist=$('#list_head strong').toArray();  //找到list_head节点下所有strong的节点
	
	//前18个歌手信息
	var topsingerlist=$('#list_head')
	console.log("singer info is :"+topsingerlist.length);
	topsingerlist.find('li').each(function(item){
		var  infos=$(this)
		let singername=infos.find('strong').find('a').text()
		let singerurl=infos.find('strong').find('a').attr('href')
		out.write(singerurl)
		out.write('\n')
		
		console.log('singer name :  ['+singername+']   地址 :'+singerurl)
		
		
		
		var singerData={
			singername:singername,
			singerurl:singerurl
		};
		tmpsingerlist.push(singerurl);
	});
	
	//后32个歌手信息
	var lastsingerlist=$('#list1 a').toArray();
	console.log("list1 :"+lastsingerlist.length);
	for(let i = 0; i < lastsingerlist.length;i++ ){
		let singername=lastsingerlist[i].attribs.title;
		
		let singerurl=lastsingerlist[i].attribs.href; 
		console.log('singer name :['+singername+']   地址 :'+singerurl)
		out.write(singerurl)
		out.write('\n')
		
		var singerData={
			singername:singername,
			singerurl:singerurl
		};
		tmpsingerlist.push(singerurl);
	}


	//console.log(tmpsingerlist)
	
	return tmpsingerlist
} 


	