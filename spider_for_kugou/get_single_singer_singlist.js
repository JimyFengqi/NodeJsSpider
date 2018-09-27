// 获取酷狗网页上，单个歌手的歌曲list，一般为30首左右

var request = require('request');
var cheerio = require('cheerio');
var path = require('path'); 
var fs = require('fs');
var requrl="http://www.kugou.com/singer/420.html";  //陈奕迅歌单

var listUrl=new Array(); 
var filenames=new Array();



request(requrl, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		acquireData(body); 
	}
	
	for(let i=0;i<listUrl.length;i++){
		let time=new Date().getTime();
		let singer_url='http://www.kugou.com/yy/index.php?r=play/getdata&hash='+listUrl[i]+'&album_id=0'+'&_='+time
		request(singer_url, function (error, response, body) { 
			if (!error && response.statusCode == 200) {
				acquireMusic(body,i); 
			} 
		}); 
	}
	
	
});

function acquireData(data) { 
	var $ = cheerio.load(data);
	songsFolderName  = $('.mbx').find('span').text();
	songsFolderName=songsFolderName+'/'
	console.log("singer info is :"+songsFolderName);
	

	var songlist = $('#song_container input').toArray(); 
	//console.log(songlist);
	
	for(let i=0;i<songlist.length;i++){ 
		let info=songlist[i].attribs.value; 
		//console.log("info=songlist[i].attribs.value:"+info);
		let reg=/\|/; 
		let hash=new Array(); 
		//hash=info.split(reg);
		hash=info.split('|');
		//console.log("info.split(reg):"+hash);
		listUrl.push(hash[1]); 
		//console.log("hash[1] : "+hash[1]); 
		//console.log("hash[0] : "+hash[0]); 
		filenames.push(hash[0]); 
	} 
} 

function acquireMusic(data,Num){
	var info=JSON.parse(data);
	var imgsrc=info.data.play_url; 
	var lyricInfo=info.data.lyrics;
	var filename=filenames[Num]; 
	console.log("current num is "+Num+"   current song is:["+filename+"] Url  is ["+imgsrc+"]");
}



