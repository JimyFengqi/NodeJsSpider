
var request = require('request');
var cheerio = require('cheerio');
var path = require('path'); 
var fs = require('fs');
var requrl="http://www.kugou.com/singer/420.html";  //陈奕迅歌单
var requrl="http://www.kugou.com/yy/singer/home/1574.html";  //林俊杰歌单
//var requrl="http://www.kugou.com/yy/singer/home/192923.html";     //摩登兄弟歌单
var listUrl=new Array(); 
var filenames=new Array();

var  songsFolderName

request(requrl, function (error, response, body) {
	if (!error && response.statusCode == 200) {
		acquireData(body); 
	}
	
	for(let i=0;i<listUrl.length;i++){
		let time=new Date().getTime();
		request('http://www.kugou.com/yy/index.php?r=play/getdata&hash='+listUrl[i]+'&album_id=0'+'&_='+time, function (error, response, body) { 
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
	
	fs.exists(songsFolderName,function(exists){
		if (exists){
			console.log("歌手目录["+songsFolderName+"]已经存在，无需创建");
		}
		else{
			fs.mkdir(songsFolderName,function(err){
				if (err) {
					return console.error(err);
				}
				console.log("歌手目录["+songsFolderName+"]创建成功");
			});
		}
	});
		
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
	//var filename = parseUrlForFileName(imgsrc);
	var filename=filenames[Num]; 
	console.log("current num is "+Num+"   current song is:"+filename);
	/*
	//console.log("current num is "+Num+"current info.data.audio_name is:"+info.data.audio_name);
	//console.log("current num is "+Num+"current info.data.author_name is:"+info.data.author_name);
	
	for (let item in info ){
		var inter = info[item];
		console.log(inter);	
	}*/
	
	downloadLyric(lyricInfo,filename,function(){
		console.log("current num is["+Num+"]  ---- :["+filename+"]'s  lyric has donwload done");
	});
	
	downloadImg(imgsrc,filename,function(){ 
		console.log("current num is ["+Num+"] ----  :["+filename + '] 的歌曲写入本地已经完成 ');
	}); 
	
}

function parseUrlForFileName(address) { 
	var filename = path.basename(address); 
	return filename; 
}

var downloadLyric=function(lyricInfo,filename,callback) {
	out=fs.createWriteStream(songsFolderName+filename+'.lyc');
	out.write(lyricInfo);
	out.end("close",callback);
}


var downloadImg = function(uri, filename, callback){
	request.head(uri, function(err, res, body){ 
		if (err) { 
			console.log('err: '+ err); 
			return false; 
		} 
		//console.log('res: '+ res); 
		console.log('正在位置 : '+ songsFolderName+'写入文件  --------【'+filename+'.mp3】 它的下载地址为：----'+uri); 
		request(uri).pipe(fs.createWriteStream(songsFolderName+filename+'.mp3')).on('close', callback); //调用request的管道来下载到 images文件夹下 
	});
};
	

