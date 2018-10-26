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
db:3
});


doit()
function getdbnamelist(callback){
	client.keys('*',function(err,val){
	//console.log(val);	
	callback(val);
	});
}

function updatedb(dbname,dbdataindex,newinfo,songnum,songname,albumname){
	client.lset(dbname,dbdataindex,newinfo,function(err,val){
		console.log('update dbnum[%s] songname=[%s],songnum=[%s],album【%s】 dbname=【%s】finished val=[%s] ',dbdataindex,songname,songnum,albumname,dbname,val);
	});	
}

function InsertListInDB(dbname,dbdata){
	client.lpush(dbname,dbdata, function (err) {
		if (err) {
			console.log(err);
		}else{
			console.log('insert[%d] 个数据 in db[%s] finished',dbdata.length,dbname);
		}
	});
}


function doit() {
    const rl = require('readline').createInterface(process.stdin,process.stdout);
	var dblist;
	getdbnamelist(function(response){
		dblist=response;
	})
    console.log('输入你想要的歌手!');
	var lastsinger;
    rl.on('line',function(singer){
		if(singer.startsWith(' ') || singer.length == 0 ){
			if(lastsinger){
				console.log('本次没有输入歌手，将以上一次输入的【%s】作为查询对象',lastsinger);
				var singer=lastsinger
				if(dblist.indexOf(singer) > -1){
					console.log('singer in dblist, read it ');
					readDBsingeinfo(singer)	
				}else{
					console.log('singer not in dblist, add it');
					dblist.push(singer);
					console.log(dblist);
					searchSinger(singer.trim());
				}
			}else{
				console.log('本次没有输入歌手，或者以空格开头，请重新输入');
				return
			}
		}else{
			var singer=singer.trim();
			if(dblist.indexOf(singer) > -1){
				console.log('singer in dblist, read it ');
				readDBsingeinfo(singer)	
				lastsinger=singer;
			}else{
				console.log('singer not in dblist, add it');
				dblist.push(singer);
				console.log(dblist);
				lastsinger=singer;
				searchSinger(singer.trim());
			}
		}
    });
}



function readDBsingeinfo(singer){
	if(singer.startsWith(' ') || singer.length == 0 ){
		console.log('本次查询没有输入内容，或者以空格开头，请重新输入正确内容');
		return
	}
	fs.access(singer,function(err){
		if(err){
			fs.mkdir(singer,function(err){
				console.log('目录[%s]创建成功',singer)
			});
		}else{
			console.log('目录[%s]已经存在，无需创建',singer)
		}
	});
	
	var dblength;  //dblength可以通过llen的方法获得，也可以通过lrange(0,-1)的长度获取，lrange(0,-1)返回所有的内容，他的长度即dblength
	//client.llen(singer,function(err,val){
	//	dblength=val;
	//	console.log('get db[%s] finished,dblength=[%s]',singer,val);
	//});
	
	client.lrange(singer,0,-1,function(err,val){
		if(err){
               console.log(err);
		} else{
			dblength=val.length;
			console.log('read data from DB success. data length=[%d]',val.length);
			var arr = val;
			if(arr) {
				var newsonginfo=[];
				for(let index = 1; index <arr.length; index++){
					var songinfo = JSON.parse(arr[index]);
					var albumNum = songinfo.albumNum;
 
					var albumname = songinfo.albumname
					console.log(albumname)
					albumname=albumname.trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_');
                    var albumPicurl = songinfo.albumPicurl;
					var albumSongexist=songinfo.albumSongexist
					var albumSonglist=songinfo.albumSonglist
					//console.log('index=[%s],albumNum=【%s】,albumname=[%s],albumurl=[%s],needpay=[%s]',index,albumNum,albumname,albumurl,albumneedpay);
					if(albumSonglist){						
						//console.log('index=[%s],albumNum=【%s】,albumname=[%s],albumurl=[%s],needpay=[%s]',index,albumNum,albumname,albumurl,albumneedpay);
						var basedir = './'+singer;
						var albumdir = basedir+'/'+albumname+'/'
						downloadAlbumPic(basedir,albumdir,albumPicurl,albumname);
							
							
						var newalbumSonglist=[]
						var albumSongflag=0
						console.log(' albumSonglist[%d],albumname=[%s]',albumSonglist.length,albumname);
						if(albumSongexist > 0){
							for(let albumSongindex = 0; albumSongindex <albumSonglist.length; albumSongindex++){									
								var albumsonginfo = albumSonglist[albumSongindex];
								var songnum = albumsonginfo.songnum;
								var songname = albumsonginfo.name;							
								var exist = albumsonginfo.exist;							
								if(exist){
									var songinfoUrl = albumsonginfo.songinfoUrl;
									var mp3path=albumsonginfo.mp3path;
									var songnamepath = albumdir+songnum+'_'+songname.trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') + '_' + singer.trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') + '.mp3';
									if(mp3path){
										console.log('have mp3 path mp3path=[%s]',mp3path);
										downloadsongs(mp3path,songnamepath,songname,albumname)
									}else{
										//console.log('no info in mp3path,need uupdate')
										console.log(songnum,songname,songinfoUrl)
										getsongURLsaveInDB(songinfoUrl,songname,songnamepath,singer,songnum,songinfo,index,albumSongindex,1);
									}
								}									
							}						
						}		
											
					}						
				}				
			}
		}
	});
	
	
	
	client.lrange(singer,0,0,function(err,val){
		if(err){
				console.log('有错误啊')
               console.log(err);
		}else{
			console.log('arr.length[%d]',val.length);
			if(val) {
				var arr = JSON.parse(val);
				//console.log(arr)
				
				var singerdir=singer+'/'
				fs.access(singerdir,function(err){
                    if(err){
                        fs.mkdir(singerdir,function(err){
                           console.log('create singerdir=[%s] finished ',singerdir);
                        })
                    }
                });
				
				
				for(let index = 0; index <arr.length; index++){
					var songinfo = arr[index];
                    var num = songinfo.rank;
                    var songname = songinfo.songname;
                    var exist = songinfo.exist;
					if(exist){
						var songinfoUrl = songinfo.songinfoUrl;
						var mp3path=songinfo.mp3path;
						var songnamepath = singerdir+num+'_'+songname.trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_')+ '_' + singer.trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') + '.mp3';
						if(mp3path){
							downloadsongs(mp3path,songnamepath,songname,num)
						}else{
							getsongURLsaveInDB(songinfoUrl,songname,songnamepath,singer,num,arr,0,index,0)

						}			
					}	
				}
			}
		}
	});
		
}

function downloadAlbumPic(basedir,albumdir,albumPicurl,albumname){
    var picname = albumname+'.jpg';
    fs.access(basedir,function(err){
        if(err){
            fs.mkdir(basedir,function(err){
               fs.access(albumdir,function(err){
                            if(err){
                                fs.mkdir(albumdir,function(err){
                                    request(albumPicurl).pipe(fs.createWriteStream(albumdir+picname));
                                })
                            }else{
                               request(albumPicurl).pipe(fs.createWriteStream(albumdir+picname));
                            }
                        });
            });
        }else{
              fs.access(albumdir,function(err){
                    if(err){
                        fs.mkdir(albumdir,function(err){
                           request(albumPicurl).pipe(fs.createWriteStream(albumdir+picname));
                        })
                    }else{
                       request(albumPicurl).pipe(fs.createWriteStream(albumdir+picname));
                    }
                });
            }
    });
}


function getsonglist(artistID,rn,singer){
	songInfoUrl='http://www.kuwo.cn/artist/contentMusicsAjax?artistId='+artistID+'&pn=0&rn='+rn
	console.log('songInfoUrl=[%s]',songInfoUrl);
	request(songInfoUrl, function (error, res, body) {
		if(error || res.statusCode!=200){
			console.log(error)
		}else{
			var $ = cheerio.load(res.body);

            var songlists = $('div.tools');
            var songslist = [];
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
						pay:pay,
						exist:1
                    };
					
                    songslist.push(songobj);
					
                }
            }
			console.log('songslist.length = [%d]',songslist.length);
			if(songslist.length>0){
				songcoverinfo=[JSON.stringify(songslist)];
				//console.log(JSON.parse(songcoverinfo))
				InsertListInDB(singer,songcoverinfo)
			}		

		}
	});
}

function getCoverSongs(albumurl,albumname,dbname,dbdata,dbdataindex){
	request(albumurl,function(error,res,response){
		if(error || res.statusCode != 200){
				console.log(error)
		}else{
			var albumsonglist=[]
			var $ = cheerio.load(response, {decodeEntities: false});
			var songlists = $('div.list li.clearfix');
            
			
			if(songlists){
				var ranksongs = [];
				console.log('songlists.length = [%d]  albumname=[%s]',songlists.length,albumname);
				bagpipe= new Bagpipe(songlists.length)
				for(let i=0;i< songlists.length;i++){
					albumsing=songlists.eq(i)
					songnum=i+1
					songname=albumsing.find('p.m_name a').text()
					songplayurl=albumsing.find('p.m_name a').attr('href')
					songid='MUSIC_'+songplayurl.split('/')[4]
					//console.log(rank,songname,songplayurl,songid)
					songinfoUrl=getSongUrl(songid)
					albumsongOBJ={
								"songnum":songnum,
								"name":songname,
								"id":songid,
								"songinfoUrl":songinfoUrl,
								"songplayurl":songplayurl,
								"exist":1
						   }
					
					albumsonglist.push(albumsongOBJ)
					dbdata.albumSonglist=albumsonglist;
					var newinfo=JSON.stringify(dbdata);			
					updatedb(dbname,dbdataindex,newinfo,songnum,songname,albumname);	
					
				}
			}
		}
	});
}

function searchSinger(singer){
	console.log('singer = [%s]',singer);
	if(singer.startsWith(' ') || singer.length == 0 ){
		console.log('本次查询没有输入内容，或者以空格开头，请重新输入正确内容');
		return
	}else{
		const singerurl = 'http://www.kuwo.cn/artist/content?name='+encodeURIComponent(singer)
		var albumarr = [];
		request(singerurl,function(error,res,response){
			if(error || res.statusCode != 200){
				console.log(error)
			}else{
				if(response){            //res.body 和 response是一样的
					var $ = cheerio.load(response,{decodeEntities:false});
					var info = $('#conBox #album')
					console.log(info.length)
					var albumslist =info.find('li')
					
					var artistID=$('div.artistTop').attr('data-artistid')
					var songlistpage=$('ul.listMusic').attr('data-page')
					var eachpagenum=$('ul.listMusic').attr('data-rn')
					
					
					if(songlistpage){
						console.log('songlistpage=')
						rn= songlistpage *  eachpagenum
						console.log('song length =[%d]' , rn)
						songlistdata=getsonglist(artistID,rn,singer)
					}
					
					if(albumslist.length >0){
						console.log('albumslist.length=[%d]',albumslist.length)
						var albumBagpipe=new Bagpipe(albumslist.length)				
						for(let i=0; i<albumslist.length;i++){
							albumelement=albumslist.eq(i)
							albumPicurl=albumelement.find('div.cover a img').attr('src')
							albumurl=albumelement.find('span.name a').attr('href')
							albumname=albumelement.find('span.name a').text()
							albumname= albumname;
							console.log(i+1,albumname,albumurl)
							var albumobj = {
										albumNum:i+1,
										singer:singer,
										albumneedpay:0,
										albumname:albumname,
										albumurl:albumurl,
										albumPicurl:albumPicurl,
										albumSongexist:1
							};
							albumBagpipe.push(getCoverSongs,albumurl,albumname,singer,albumobj,i);
							albumarr.push(JSON.stringify(albumobj));
						}
						
					}						
					
					
					if(albumarr.length > 0) { // 如果albumarr 有内容就进来，没有就进不来，
						//console.log('albumarr.length = [%d]',albumarr.length);
						InsertListInDB(singer,albumarr)
					}else{
						console.log('no need to insert anything,no data in albumarr ')
					}
					
				}
			}
		});
	}
}
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
						   					   
						   //歌曲标识在就直接下载歌曲，不在的话，可以重新检查一遍是否现在就存在了，更新一下数据库
						   if(exist){
								var songnamepath = basefolder+rank+'_'+songname.trim().replace('\/','_') + '_' + singer.replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') + '.mp3';
								//console.log('songname=[%s],songnamepath=[%s],mp3path=[%s]',songname,songnamepath,mp3path)
							    bagpipe.push(downloadsongs,mp3path,songnamepath,songname,rank,basefoldename)
								
						   }else{
								bagpipe.push(getsongURLsaveInDB,songname,songInfoUrl,rank,+index+101,songinfo,basefoldename);
						   }
						   
					   }
				   }
			   }
            });
			
        }
    });
};


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
				} 
				console.log('正在下载歌曲[%s] 所属榜单【%s】,排行【%s】 到本地',songname,rankType,index);
				request(uri).pipe(fs.createWriteStream(songnamepath,{autoClose:true})).on('close', callback); 
			});
		}else{
			console.log('歌曲【%s】 所属专辑或者排行【%s】已经存在，无需再次下载',songnamepath,index);
		} 
	});	
}


function getsongURLsaveInDB(requesturl,songname,songnamepath,dbname,rank, songinfo,index,dbsubindex,flag) {
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
				var exist=0;
                if(mp3path){
					var singer = $('singer').text().trim().replace(/[\\~`:?!！/() &*|{}《》<>&]/g,'_') ;
					var artid = $('artid').text()
					var path = $('path').text();
					
					var mp3dl = $('mp3dl').text();
					var aacpath = $('aacpath').text();
					var aacdl = $('aacdl').text();
					
					exist=1
					wmapath='http://'+mp3dl+'/resource/'+path
					mp3path='http://'+mp3dl+'/resource/'+mp3path
					aacpath='http://'+aacdl+'/resource/'+aacpath
					
					//songnamepath=basefolder+rank+'_'+songname + '_' + singer + '.mp3';
					downloadsongs(mp3path,songnamepath,songname,rank,dbname)					
				}else{
					console.log('songUrl[%s]不存在，歌曲【%s】,排行【%s】无法下载,db location=[%s],dbname=[%s]',requesturl,songname,rank,index,dbname);
					exist=0;
				}
				//console.log(songinfo)
				
				if(flag){
					if(exist){
						songinfo.albumSonglist[dbsubindex].exist=exist;
						songinfo.albumSonglist[dbsubindex].singer=singer;
						songinfo.albumSonglist[dbsubindex].artid=artid;
						songinfo.albumSonglist[dbsubindex].wmapath=wmapath;
						songinfo.albumSonglist[dbsubindex].mp3path=mp3path;
						songinfo.albumSonglist[dbsubindex].aacpath=aacpath;

					}else{
						songinfo.albumSonglist[dbsubindex].exist=exist;		
					}
				}else{
					if(exist){
						
						songinfo[dbsubindex].exist=exist;
						songinfo[dbsubindex].singer=singer;
						songinfo[dbsubindex].artid=artid;
						songinfo[dbsubindex].wmapath=wmapath;
						songinfo[dbsubindex].mp3path=mp3path;
						songinfo[dbsubindex].aacpath=aacpath;
					}else{
						songinfo[dbsubindex].exist=exist;
					}
				}
			
				
				var newsonginfo=JSON.stringify(songinfo)
				client.lset(dbname,index,newsonginfo,function(err,val){
						console.log('update num[%s] dbname[%s], finished val=[%s] ',index,dbname,val);
				});
			}
		});
    }
}