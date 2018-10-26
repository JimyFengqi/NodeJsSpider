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

            var songlists = $('div.tools');
            var ranksongs = [];
			console.log('songlists.length = [%d]',songlists.length);
			bagpipe= new Bagpipe(songlists.length)
			
            for (var index in songlists) {
                var songinfo = songlists.eq(index).attr('data-music');
				if(songinfo){
					songinfo=JSON.parse(songinfo);
					var songname = songinfo['name']
					songname=songname.trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') ;
					//songid=songplayurl.split('?')[0].split('/').pop();
					id=songinfo['id']
					artist=songinfo['artist']
					album=songinfo['album']
					pay=songinfo['pay']

					songplayurl='http://www.kuwo.cn/yinyue/'+id.split('_')[1]+'?catalog=yueku2016'
					var rank= +index+1    //字符串转为整形数字，可以在字符串前面加上一个加号， 比如： '12'  -> +'12'
					var songinfoUrl=getSongUrl(id)

                    var songobj = {
						rank:rank,
						songname:songname,
						id:id,
						songinfoUrl:songinfoUrl,
						songplayurl:songplayurl,
						artist:artist,
						album:album,
						pay:pay
                    };
					
					//var songnamepath = basefolder+rank+'_'+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
					bagpipe.push(getsongURLsaveInDB,songname,songinfoUrl,rank,index,songobj,basefoldename);
					
                    songobj = JSON.stringify(songobj);
					//console.log(songobj)
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
			//console.log(dblength)// 此时数据依然为undefined，因为上一句的异步数据还没有赋值，依然处于初始化的阶段
			
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
			
        }
    });
};

function getSongUrl(songid){
    const urlPrefix = 'http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid=';
    return urlPrefix+songid;
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