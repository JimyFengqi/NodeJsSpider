
var request = require('request');
var cheerio = require('cheerio');
var path = require('path'); 
var fs = require('fs');


urllist = [ 'http://www.kugou.com/yy/singer/home/628633.html',

  'http://www.kugou.com/yy/singer/home/4003.html',
  'http://www.kugou.com/yy/singer/home/2.html',
  'http://www.kugou.com/yy/singer/home/7151.html',
  'http://www.kugou.com/yy/singer/home/84588.html',
  'http://www.kugou.com/yy/singer/home/82.html',
  'http://www.kugou.com/yy/singer/home/3956.html',
  'http://www.kugou.com/yy/singer/home/5.html',
  'http://www.kugou.com/yy/singer/home/182316.html',
  'http://www.kugou.com/yy/singer/home/180348.html',
  'http://www.kugou.com/yy/singer/home/198976.html',
  'http://www.kugou.com/yy/singer/home/36363.html',
  'http://www.kugou.com/yy/singer/home/36365.html',
  'http://www.kugou.com/yy/singer/home/4005.html',
  'http://www.kugou.com/yy/singer/home/3954.html',
  'http://www.kugou.com/yy/singer/home/84465.html',
  'http://www.kugou.com/yy/singer/home/180345.html',
  'http://www.kugou.com/yy/singer/home/85137.html',
  'http://www.kugou.com/yy/singer/home/87264.html',
  'http://www.kugou.com/yy/singer/home/3993.html',
  'http://www.kugou.com/yy/singer/home/91599.html',
  'http://www.kugou.com/yy/singer/home/86133.html',
  'http://www.kugou.com/yy/singer/home/171085.html',
  'http://www.kugou.com/yy/singer/home/4014.html',
  'http://www.kugou.com/yy/singer/home/3.html',
  'http://www.kugou.com/yy/singer/home/88770.html',
  'http://www.kugou.com/yy/singer/home/643262.html',
  'http://www.kugou.com/yy/singer/home/713534.html',
  'http://www.kugou.com/yy/singer/home/9.html',
  'http://www.kugou.com/yy/singer/home/19819.html',
  'http://www.kugou.com/yy/singer/home/90471.html',
  'http://www.kugou.com/yy/singer/home/3955.html',
  'http://www.kugou.com/yy/singer/home/92246.html',
  'http://www.kugou.com/yy/singer/home/642965.html',
  'http://www.kugou.com/yy/singer/home/289480.html',
  'http://www.kugou.com/yy/singer/home/88176.html',
  'http://www.kugou.com/yy/singer/home/3973.html',
  'http://www.kugou.com/yy/singer/home/551201.html',
  'http://www.kugou.com/yy/singer/home/87523.html',
  'http://www.kugou.com/yy/singer/home/769529.html',
  'http://www.kugou.com/yy/singer/home/13100.html',
  'http://www.kugou.com/yy/singer/home/11301.html',
  'http://www.kugou.com/yy/singer/home/91849.html',
  'http://www.kugou.com/yy/singer/home/90187.html',
  'http://www.kugou.com/yy/singer/home/164768.html',
  'http://www.kugou.com/yy/singer/home/194110.html',
  'http://www.kugou.com/yy/singer/home/154587.html',
  'http://www.kugou.com/yy/singer/home/175312.html',
  'http://www.kugou.com/yy/singer/home/91824.html' ]



for(let j = 0;j<urllist.length;j++){
	begin_url=urllist[j]
	console.log('current : '+begin_url)
	var singerInfo=[];
	request(begin_url, function (error, begin_url_response, begin_url_body) {
		if (!error && begin_url_response.statusCode == 200) {
			singerInfo = acquireData(begin_url_body); 
		}
		if (singerInfo.length>1){
			console.log('singerInfo.length '+singerInfo.length);
			for(let i=1;i<singerInfo.length;i++){
				let time=new Date().getTime();
				let singerName= singerInfo[0];
				let second_url='http://www.kugou.com/yy/index.php?r=play/getdata&hash='+singerInfo[i].songurl+'&album_id=0'+'&_='+time;
				let second_url_base_song_name=replaceName(singerInfo[i].songname);
		
				//console.log('Song Name: 【' +second_url_base_song_name+ '】  地址：'+second_url);
				
				request(second_url, function (error, response, body) { 
					if (!error && response.statusCode == 200) {
						acquireMusic(body,i,second_url_base_song_name,singerName); 
					} 
				});   
			}	
		}
		else{
			console.log('Current singer   '+singerInfo[0]+'   do not have songs ');
		}
	});
	singerInfo=[];
}

/*
//var requrl="http://www.kugou.com/singer/420.html";  //陈奕迅歌单
var requrl="http://www.kugou.com/yy/singer/home/192923.html"; //摩登兄弟
requrl='http://www.kugou.com/yy/singer/home/3060.html';   //薛之谦
requrl='http://www.kugou.com/singer/3520.html';  // 周杰伦
begin_url = 'http://www.kugou.com/singer/722869.html'; //毛不易

request(begin_url, function (error, begin_url_response, begin_url_body) {
	if (!error && begin_url_response.statusCode == 200) {
		var singerInfo = acquireData(begin_url_body); 
	}
	console.log('singerInfo.length '+singerInfo.length);
	for(let i=1;i<singerInfo.length;i++){
		let time=new Date().getTime();
		let singerName= singerInfo[0];
		let second_url='http://www.kugou.com/yy/index.php?r=play/getdata&hash='+singerInfo[i].songurl+'&album_id=0'+'&_='+time;
		let second_url_base_song_name=singerInfo[i].songname;
		console.log('Song Name: 【' +second_url_base_song_name+ '】  地址：'+second_url);
		
		request(second_url, function (error, response, body) { 
			if (!error && response.statusCode == 200) {
				acquireMusic(body,i,second_url_base_song_name,singerName); 
			} 
		});   
	}	
});
*/

function replaceName(name){
	let  a = name.replace('"','');
	a = a.replace('"','');
	a = a.replace('?','');
	a = a.replace('、',' ');
	a = a.replace('*',' ');
	a = a.replace('*',' ');
	
	return a
}
function acquireData(data) { 
	var $ = cheerio.load(data);
	var singerInfo=[]
	var songsFolderName  = $('.mbx').find('span').text();
	console.log("singer is :"+songsFolderName);
	songsFolderName=songsFolderName+'/'
	createDir(songsFolderName);
	singerInfo.push(songsFolderName);
	
	var songlist = $('#song_container input').toArray(); 
	//console.log(songlist.length);
	
	for(let i=0;i<songlist.length;i++){ 
		let info=songlist[i].attribs.value; 
		//console.log("info=songlist[i].attribs.value:"+info);
		let reg=/\|/; 
		let hash=new Array(); 
		//hash=info.split(reg);
		hash=info.split('|');

		let tmpdata={
			songurl:hash[1],
			songname:hash[0]
		};
		singerInfo.push(tmpdata)
	} 
	songlist=[];
	return singerInfo;
} 

function createDir(path){
	if (fs.existsSync(path)){
		console.log(" 目录 ["+path+"] 已经存在，无需创建");
	}
	else{
		fs.mkdirSync(path);
		console.log(" 目录  ["+path+"]  创建成功");
	}
}

function acquireMusic(data,Num,songName,singerName){
	var info=JSON.parse(data);
	var song_download_url=info.data.play_url; 
	var lyricInfo=info.data.lyrics;
	//var filename = parseUrlForFileName(imgsrc);
 
	console.log("current num is "+Num+"   current song is:"+songName);
	/*
	//console.log("current num is "+Num+"current info.data.audio_name is:"+info.data.audio_name);
	//console.log("current num is "+Num+"current info.data.author_name is:"+info.data.author_name);
	
	for (let item in info ){
		var inter = info[item];
		console.log(inter);	
	}*/
	
	downloadLyric(lyricInfo,songName,singerName,function(){
		console.log("current num is["+Num+"]  ---- :["+songName+"]'s  lyric has donwload done");
	});
	
	downloadSong(song_download_url,songName,singerName,function(){ 
		console.log("current num is ["+Num+"] ----  :["+songName + '] 的歌曲写入本地已经完成 ');
	}); 
	
}

function parseUrlForFileName(address) { 
	var filename = path.basename(address); 
	return filename; 
}

var downloadLyric=function(lyricInfo,filename,singerName,callback) {
	out=fs.createWriteStream(singerName+filename+'.lyc');
	out.write(lyricInfo);
	out.end("close",callback);
}


var downloadSongtest = function(uri, filename,singerName,callback){
	request.head(uri, function(err, res, body){ 
		if (err) { 
			console.log('err: '+ err); 
			return false; 
		} 
		console.log('正在本地位置 : '+ singerName+'  写入文件  --------【'+filename+'.mp3】'); 
		
	});
};

var downloadSong = function(uri, filename,singerName,callback){
 
	console.log('正在本地位置 : '+ singerName+'  写入文件  --------【'+filename+'.mp3】'); 
	
	request(uri).pipe(fs.createWriteStream(singerName+filename+'.mp3')).on('close', callback); //调用request的管道来下载到 images文件夹下 

};