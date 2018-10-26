/**
 * Created by Jimyfengqi on 2018/10/10.
 */
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
var Bagpipe = require('bagpipe');

const redis = require('redis');
//const client = redis.createClient();  //默认的连接port:'6379',host:'127.0.0.1',db:1,无鉴权
const client = redis.createClient(
{port:'6379',
host:'127.0.0.1',
db:2
});
console.log('本程序运行两次才能下载歌曲，\n 第一遍将排行榜的歌曲信息记录到数据库中，第二遍，收集歌曲最终的信息，并且下载，同时再次收集当前排行榜情况');
//getRanklistUrl()
getDBlist()

function getDBlist(){
	client.keys('*',function(err,val){
		var dbpipe=new Bagpipe(val.length);
		for(let i in val){
			console.log(i,val[i]);
			if(i > 20){
				//dbpipe.push(CreatFolderByDbname,val[i]);
				CreatFolderByDbname(val[i]);
			}
		}
    });
}

function CreatFolderByDbname(DBname){
	var basefoldename=DBname;
	var rankfolder= './'+'酷我音乐排行榜'
	var basefolder=rankfolder+'/'+basefoldename+'/'

	fs.access(rankfolder, function (err){
			if(err){
				console.log('rankfolder=[%s] 不存在，需要创建',rankfolder);
				fs.mkdir(rankfolder,function(err){
					console.log('rankfolder=[%s]创建成功',rankfolder)
					fs.access(basefolder, function (err){
						if(err){
							console.log('basefolder=[%s] 不存在，需要创建',basefolder);
							fs.mkdir(basefolder,function(err){
								console.log('basefolder=[%s]创建成功',basefolder)
								getRedisInfo(basefolder,basefoldename)
							});
						}else{
							console.log('basefolder=[%s] 已经存在，不需要创建',basefolder)
							getRedisInfo(basefolder,basefoldename)
						}
					});	
				});
			}else{
				console.log('rankfolder=[%s] 已经存在，不需要创建',rankfolder)
				fs.access(basefolder, function (err){
					if(err){
						console.log('basefolder=[%s] 不存在，需要创建',basefolder);
						fs.mkdir(basefolder,function(err){
							console.log('basefolder=[%s]创建成功',basefolder)
							getRedisInfo(basefolder,basefoldename)
						});
					}else{
						console.log('basefolder=[%s] 已经存在，不需要创建',basefolder)
						getRedisInfo(basefolder,basefoldename)
					}
				});	
			}
	});
}


function getRedisInfo(basefolder,basefoldename) {			
	//获取db的数据长度， 因为是异步获取的，所以数据存贮会有延时
	var dblength;
	client.llen(basefoldename,function(err,val){
		console.log('get db[%s] finished,val=[%s]',basefoldename,val);
		dblength=val;
		client.lrange(basefoldename,dblength/2,dblength,function(err,val){
                if(err){
				   console.log(err);
			   } else{
				   console.log('read data from DB success. data length=[%d]',val.length);
				   var arr = val;		   
				   if(arr) {
					   	var bagpipe = new Bagpipe(arr.length);
					   for (var index in arr) {
						   var songinfo = JSON.parse(arr[index]);
						   var songname = songinfo.songname;
						   var songInfoUrl = songinfo.songInfoUrl;
						   var singer = songinfo.singer;
						   var rank = songinfo.rank;
						   var mp3path = songinfo.mp3path;
						   var exist = songinfo.exist;
						   
						   //歌曲标识在就直接下载歌曲，不在的话，可以重新检查一遍是否现在就存在了，更新一下数据库
						   if(exist){
								var songnamepath = basefolder+rank+'_'+songname.trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') + '_' + singer.replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') + '.mp3';						   					   
								//console.log('songname=[%s],songnamepath=[%s],mp3path=[%s]',songname,songnamepath,mp3path)
							    bagpipe.push(downloadsongs,mp3path,songnamepath,songname,rank,basefoldename)
								
						   }else{
								bagpipe.push(getsongURLsaveInDB,songname,songInfoUrl,rank,+index+101,songinfo,basefoldename);
						   }
						   
					   }
				   }
				
			  }
            });
	});
}


function getSongUrl(songid){
    const urlPrefix = 'http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid=';
    return urlPrefix+songid;
} 

function downloadsongs(songUrl,songnamepath,songname,index,rankType){
	downloadsong(songUrl,songnamepath,songname,index,rankType,function(response){
		console.log('歌曲[%s]所属榜单【%s】,排行【%s】 下载完毕,存贮在本地地址为[%s]',songname,rankType,index,songnamepath);
	});
}

function downloadsong(uri,songnamepath,songname,index,rankType,callback){
	fs.access(songnamepath, function (err) {
		if (err) {
			request.head(uri, function(err, res, body){ 
				if (err) { 
					console.log('err: '+ err); 
					console.log('err uri is [%s] ',uri); 
					return false; 
				}else{
					console.log('正在下载歌曲[%s] 所属榜单【%s】,排行【%s】 到本地',songname,rankType,index);
					request(uri).pipe(fs.createWriteStream(songnamepath,{autoClose:true})).on('close', callback); 
					//request(uri).pipe(fs.createWriteStream(songnamepath)).on('close', callback); 
				}
			});
		}else{
			console.log('歌曲【%s】 所属专辑或者排行【%s】已经存在，无需再次下载',songnamepath,index);
		} 
	});	
}

function getsongURLsaveInDB(songname,requesturl,rank,index,songinfo,dbname) {
    ////var requesturl = getSongUrl(songid);
	//var songname = songnamepath.split('/')
	//songname=songname[songname.length-1].split('.')[0]
    if(requesturl){
		request(requesturl, function (err, res, body) {
			if(err || res.statusCode != 200){
				console.log('something wrong'+err);
			}else{
                var $ = cheerio.load(res.body,{xmlMode: true});
				var mp3path = $('mp3path').text();
                if(mp3path){
					var singer = $('singer').text().trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') ;
					var artid = $('artid').text()
					var path = $('path').text();
					
					var mp3dl = $('mp3dl').text();
					var aacpath = $('aacpath').text();
					var aacdl = $('aacdl').text();
					
					wmapath='http://'+mp3dl+'/resource/'+path
					mp3path='http://'+mp3dl+'/resource/'+mp3path
					aacpath='http://'+aacdl+'/resource/'+aacpath
					
					songinfo.exist=1;
					songinfo.singer=singer;
					songinfo.artid=artid;
					songinfo.wmapath=wmapath;
					songinfo.mp3path=mp3path;
					songinfo.aacpath=aacpath;
					//songnamepath=basefolder+rank+'_'+songname + '_' + singer + '.mp3';
					//downloadsongs(songUrl,songnamepath,songname,rank,dbname)					
				}else{
					console.log('songUrl[%s]不存在，歌曲【%s】,排行【%s】无法下载,db location=[%s],dbname=[%s]',requesturl,songname,rank,index,dbname);
					songinfo.exist=0
				}
				//console.log(songinfo)
				var newsonginfo=JSON.stringify(songinfo)
				client.lset(dbname,index,newsonginfo,function(err,val){
					console.log('update num[%s] dbname[%s], finished val=[%s] ',index,dbname,val);
				});
			}
		});
    }
}