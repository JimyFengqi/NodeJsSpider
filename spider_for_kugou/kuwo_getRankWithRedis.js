/**
 * Created by aidim78 on 2018/10/10.
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
getranktype()

//获取所有榜单
function getranktype(){
	
	var GlobalRankList=[{12:"Billboard榜"},{49:"iTunes音乐榜"},{13:"英国UK榜"},{4:"台湾幽浮榜"},{14:"韩国M-net榜"},{15:"日本公信榜"},{8:"香港电台榜"}]	
	var ClassifyRankList=[{16:"酷我热歌榜"},{17:"酷我新歌榜"},{93:"酷我飙升榜"},{62:"酷我华语榜"},{158:"潮流热歌榜"},{157:"老铁热歌榜"},{22:"酷我欧美榜"},{23:"酷我日韩榜"}]
	var SpecialRankList=[{154:"酷我综艺榜"},{26:"经典怀旧榜"},{63:"网络神曲榜"},{76:"夜店舞曲榜"},{64:"热门影视榜"},{153:"网红新歌榜"},{104:"酷我首发榜"},{106:"酷我真声音"},{151:"腾讯音乐人"},{141:"单曲畅销榜"}]

	//var GlobalRankList=[{4:"台湾幽浮榜"}]   //测试用
	GlobalRankList=GlobalRankList.concat(ClassifyRankList).concat(SpecialRankList)
	for(let num in GlobalRankList){
		for(let a in GlobalRankList[num]){ 
			bangId=a;
			ranktypeName=GlobalRankList[num][a];	
			rankurl='http://www.kuwo.cn/bang/content?name='+encodeURIComponent(ranktypeName)+'&bangId='+bangId
			//console.log(num,rankurltype,ranktypeName,url)
			getRanklistSongUrl(rankurl,ranktypeName)
		}
	}
}

function getRanklistSongUrl(rankurl,rankname){
	var basefoldename=rankname;
	var rankfolder= './'+'酷我音乐排行榜'
	var basefolder=rankfolder+'/'+basefoldename+'/'

	console.log('basefolder=[%s],rankurl=[%s]',basefolder,rankurl);
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
								getRanklistSongUrlInfo(rankurl,basefolder,basefoldename)
							});
						}else{
							console.log('basefolder=[%s] 已经存在，不需要创建',basefolder)
							getRanklistSongUrlInfo(rankurl,basefolder,basefoldename)
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
							getRanklistSongUrlInfo(rankurl,basefolder,basefoldename)
						});
					}else{
						console.log('basefolder=[%s] 已经存在，不需要创建',basefolder)
						getRanklistSongUrlInfo(rankurl,basefolder,basefoldename)
					}
				});	
			}
	});
}

function getRanklistSongUrlInfo(rankurl,basefolder,basefoldename) {	
    request(rankurl, function (error, res, body) {
		if(error || res.statusCode!=200){
			console.log(error)
		}else{
			var $ = cheerio.load(res.body);
            var songlists = $('div.name');  
            var ranksongs = [];
			console.log('songlists.length = [%d]',songlists.length);
			bagpipe= new Bagpipe(songlists.length)
			
            for (var index in songlists) {
                var songinfo = songlists.eq(index).find('a');
                var songname = songinfo.text();
				if(songname){
					songname=songname.trim().replace(/[\\~`:?!/() &*]/g,'_') ;
					songplayurl=songinfo.attr('href')
					songid=songplayurl.split('?')[0].split('/').pop();
					console.log(songplayurl)
					var rank= +index+1    //字符串转为整形数字，可以在字符串前面加上一个加号， 比如： '12'  -> +'12'
					var songinfoUrl=getSongUrl(songid)
                    var songobj = {
						rank:rank,
						songname:songname,
						songid:songid,
						songinfoUrl:songinfoUrl,
						songplayurl:songplayurl
                    };
					
					//var songnamepath = basefolder+rank+'_'+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
					bagpipe.push(getsongURLsaveInDB,songname,songinfoUrl,rank,index,songobj,basefoldename);
					
                    songobj = JSON.stringify(songobj);
					console.log(songobj)
                    ranksongs.push(songobj);
                }
            }
			console.log('ranksongs.length = [%d]',ranksongs.length);
			//将获取的到数据存贮到数据库中
			
			var lpushlength=ranksongs.length;
			client.lpush(basefoldename,ranksongs,function(err,val){
                console.log('数据存入basefoldename[%s] 成功  val=[%s]',basefoldename,val);
            });
			
			//获取db的数据长度， 因为是异步获取的，所以数据存贮会有延时
			var dblength;
			client.llen(basefoldename,function(err,val){
				dblength=val;
				console.log('get db[%s] finished,val=[%s]',basefoldename,val);
			});
			console.log(dblength)// 此时数据依然为undefined，因为上一句的异步数据还没有赋值，依然处于初始化的阶段
			
			//保留两次数据(最新一次和上一次数据)，其他的全部删除
			//client.ltrim(basefoldename,0,199,function(err,val){
			client.ltrim(basefoldename,0,lpushlength*2-1,function(err,val){
				if(val == 0){
					console.log('delete other element success val=[%s]',val);
				}else{
					console.log('delete other element finished, val=[%s]',val);
					console.log('print in delete db sentense,dblength = [%s]',dblength);
				}
				
			});
			//client.lrange(basefoldename,100,200,function(err,val){
			client.lrange(basefoldename,lpushlength,lpushlength*2,function(err,val){
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
						   
						   var songnamepath = basefolder+rank+'_'+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
						   					   
						   //歌曲标识在就直接下载歌曲，不在的话，可以重新检查一遍是否现在就存在了，更新一下数据库
						   if(exist){
								console.log('songname=[%s],songnamepath=[%s],mp3path=[%s]',songname,songnamepath,mp3path)
							    bagpipe.push(downloadsongs,mp3path,songnamepath,songname,rank,basefoldename)
								
						   }else{
								bagpipe.push(getsongURLsaveInDB,songnamepath,songInfoUrl,rank,+index+101,songinfo,basefoldename);
						   }
						   
					   }
				   }
			   }
            });
			
        }
    });
};

function getSongUrl(songid){
    const urlPrefix = 'http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid=MUSIC_';
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
				} 
				console.log('正在下载歌曲[%s] 所属榜单【%s】,排行【%s】 到本地',songname,rankType,index);
				request(uri).pipe(fs.createWriteStream(songnamepath,{autoClose:true})).on('close', callback); 
			});
		}else{
			//console.log('歌曲【%s】 所属专辑或者排行【%s】已经存在，无需再次下载',songnamepath,index);

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
					var singer = $('singer').text().trim().replace(/[\\~`:?!/() &*]/g,'_');
					var path = $('path').text();
					
					var mp3dl = $('mp3dl').text();
					var aacpath = $('aacpath').text();
					var aacdl = $('aacdl').text();
					
					wmapath='http://'+mp3dl+'/resource/'+path
					mp3path='http://'+mp3dl+'/resource/'+mp3path
					aacpath='http://'+aacdl+'/resource/'+aacpath
					
					songinfo.singer=singer;
					songinfo.exist=1;
					songinfo.wmapath=wmapath;
					songinfo.mp3path=mp3path;
					songinfo.aacpath=aacpath;
					//songnamepath=basefolder+rank+'_'+songname + '_' + singer + '.mp3';
					//downloadsongs(songUrl,songnamepath,songname,rank,dbname)					
				}else{
					console.log('songUrl[%s]不存在，歌曲【%s】,排行【%s】无法下载,db location=[%s],dbname=[%s]',requesturl,songname,rank,index,dbname);
					songinfo.exist=0
				}
				console.log(songinfo)
				var newsonginfo=JSON.stringify(songinfo)
				client.lset(dbname,index,newsonginfo,function(err,val){
						console.log('update num[%s] finished val=[%s] ',index,val);
				});
			}
		});
    }
}