/**
 * Created by aidim78 on 2018/10/10.
 */
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
var Bagpipe = require('bagpipe');

const redis = require('redis');
const client = redis.createClient();


getRanklistUrl()

function getRanklistUrl() {
	var ranklist=['https://www.xiami.com/chart/data?c=103&type=0&page=1&limit=100&_=',
	'https://www.xiami.com/chart/data?c=103&type=1&page=1&limit=100&_=',
	'https://www.xiami.com/chart/data?c=103&type=2&page=1&limit=100&_=',
	'https://www.xiami.com/chart/data?c=103&type=3&page=1&limit=100&_=',
	'https://www.xiami.com/chart/data?c=103&type=4&page=1&limit=100&_=']
	
	//var ranklist=['https://www.xiami.com/chart/data?c=103&type=4&page=0&limit=100&_=']
	for(let i in ranklist){
		getRanklistSongUrl(i,ranklist[i])
	}
}
	
function getRanklistSongUrl(i,url){
	//var rankType={'0':'全部排行','1':'华语','2':'欧美' ,'3':'日本','4':'韩国'} 
	var rankType={'0':'Alllist','1':'Chinese','2':'EuroAmerica' ,'3':'Japan','4':'Korea'} 
	//var rankurl='https://www.xiami.com/chart/data?c=103&type=4&page=1&limit=100&_='  // type 后面的数字代表rankType={'0':' 全部排行','1':'华语','2':'欧美' ,'3':'日本','4':'韩国'} 
    
	var now = new Date();
	var rankfolder= './'+'排行榜'
	var basefoldename=rankType[i]
		var basefolder=rankfolder+'/'+basefoldename+'/'
		var rankurl = url+now.valueOf();
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
    request(rankurl, function (req, res, err) {
        if (res) {
			var $ = cheerio.load(res.body);
            var songlists = $('div.song div.info');  
			var checkedlist= $('input');   //真正的songid 在input属性里面

            var ranksongs = [];
			console.log('songlists.length = [%d]',songlists.length);
			bagpipe= new Bagpipe(songlists.length)
            for (var index in songlists) {
                var song = songlists.eq(index);
				var songid=checkedlist.eq(index).attr('value');
                if(song.text()) {
                    var songname = song.find('p strong>a').text();
					songname=songname.trim().replace(/[\\~`:?!/() &*]/g,'_') ;

                    var songplayurl = 'https://www.xiami.com/song/'+song.find('p strong>a').attr('href').slice(6);
                    var singer = song.find('p>a').attr('title');
					if(!singer){
						singer=song.find('p>a').text().slice(2)
					}
					singer=singer.trim().trim().replace(/[\\~`:?!/() &*]/g,'_') ;
				
					
					var songInfoUrl = getSongUrl(songid);
					var rank= +index+1    //字符串转为整形数字，可以在字符串前面加上一个加号， 比如： '12'  -> +'12'
					//console.log('rank=[%d],songname=[%s],songplayurl=[%s],singer=[%s],songid=[%s],songInfoUrl=[%s]',rank,songname,songplayurl,singer,songid,songInfoUrl);
                    var songobj = {
						rank:rank,
                        songname:songname,
                        songplayurl:songplayurl,
						songid:songid,
                        singer:singer,
						songInfoUrl:songInfoUrl
                    };
					
					var songnamepath = basefolder+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
					bagpipe.push(getsongURLsaveInDB,songnamepath,songInfoUrl,rank,index,songobj,basefoldename);
					
                    songobj = JSON.stringify(songobj);
					//console.log(songobj)
                    ranksongs.push(songobj);
                }
            }
			console.log('ranksongs.length = [%d]',ranksongs.length);
			//将获取的到数据存贮到数据库中
			client.lpush(basefoldename,ranksongs,function(err,val){
                console.log('数据存入basefoldename[%s] 成功  val=[%s ]',basefoldename,val);
            });
			
			//获取db的数据长度， 因为是异步获取的，所以数据存贮会有延时
			var dblength;
			client.llen(basefoldename,function(err,val){
				dblength=val;
				console.log('get db[%s] finished,val=[%s]',basefoldename,val);
			});
			console.log(dblength)// 此时数据依然为undefined，因为上一句的异步数据还没有赋值，依然处于初始化的阶段
			
			//保留钱200 个数据，其他的全部删除
			client.ltrim(basefoldename,0,199,function(err,val){
				if(val == 0){
					console.log('delete other element success val=[%s]',val);
				}else{
					console.log('delete other element finished, val=[%s]',val);
					console.log('print in delete ddb ssentense,dblength = [%s]',dblength);
				}
				
			});
			client.lrange(basefoldename,101,200,function(err,val){
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
						   var songUrl = songinfo.songUrl;
						   var exist = songinfo.exist;
						   
						   var songnamepath = basefolder+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
						   
						   
						   //歌曲标识在就直接下载歌曲，不在的话，可以重新检查一遍是否现在就存在了，更新一下数据库
						   if(exist){
							  // console.log('songname=[%s],songnamepath=[%s],songUrl=[%s]',songname,songnamepath,songUrl)
							   bagpipe.push(downloadsongs,songUrl,songnamepath,songname,rank)
								
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
    const urlPrefix = 'http://www.xiami.com/widget/xml-single/uid/0/sid/';
    return urlPrefix+songid;
} 

function decodeUrl(str) {
    var finalresult;
    var needstr = str.slice(1);                    //去掉开头一个数字，得到【所需字符串】
    var lines = str.slice(0, 1) - 0;              //开头的第一个数字，代表总共有几行
    var cols = Math.ceil(needstr.length / lines); //[所需字符串]除以[开头数字]取[商], 代表前面几行每一行中的字符个数
    var leftline = needstr.length % lines;        //所需字符串 除以 开头数字取余数, 代表前面有几行
	if (leftline== 0){cols =cols+1}               //解决leftline=0时，最后解析错误的问题
    var arr = [];
    var result = "";
    for (var j = 0; j < leftline; j++) {           //将前面几行的字符排列
        arr[j] = needstr.slice(cols * j, cols * (j + 1));
    }
    var leftstr = needstr.slice((leftline) * cols);         //所需字符串中  后面几行的字符
    for (var j = 0; j < lines - leftline; j++) {            //将后面几行的字符排列
        arr[leftline + j] = leftstr.slice((cols - 1) * j, (cols - 1) * (j + 1))
    }
    for (var i = 0; i < cols; i++) {                          //将得到的字符数组连接成新的字符，新的字符就是没有处理过的url地址
        for (var j = 0; j < lines; j++) {
            if (arr[j][i]) {
                result += arr[j][i];
            }
        }
    }
    try{
        finalresult = decodeURIComponent(result).replace(/[\^]/g, '0');    //将没有处理过的url地址进行处理，得到正确的地址
    }catch(err){
        if(err){
            return ;
        }
    }finally{
        return finalresult;
    }
}

function downloadsongs(songUrl,songnamepath,songname,index){
	downloadsong(songUrl,songnamepath,songname,index,function(response){
		console.log('歌曲[%s]所属专辑或者排行【%s】 下载完毕,存贮在本地地址为[%s]',songname,index,songnamepath);
	});
}

function downloadsong(uri,songnamepath,songname,index,callback){
	fs.access(songnamepath, function (err) {
		if (err) {
			request.head(uri, function(err, res, body){ 
				if (err) { 
					console.log('err: '+ err); 
					console.log('err uri is [%s] ',uri); 
					return false; 
				} 
				console.log('正在下载歌曲[%s] 到本地',songname);
				request(uri).pipe(fs.createWriteStream(songnamepath,{autoClose:true})).on('close', callback); 
			});
		}else{
			//console.log('歌曲【%s】 所属专辑或者排行【%s】已经存在，无需再次下载',songnamepath,index);

		} 
	});	
}

function getsongURLsaveInDB(songnamepath,requesturl,albumname,index,songinfo,dbname) {
    ////var requesturl = getSongUrl(songid);
	var songname = songnamepath.split('/')
	songname=songname[songname.length-1].split('.')[0]
    if(requesturl){
		request(requesturl, function (err, res, body) {
			if(err || res.statusCode != 200){
				console.log('something wrong'+err);
			}else{
                var $ = cheerio.load(res.body,{xmlMode: true});
                var urlstr = $('location').text();
				
                if(urlstr){
					var songUrl = decodeUrl(urlstr);
					//var path = dir+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
					if(songUrl){
						//console.log('after decode songUrl =[%s] songnamepath=[%s],songname=[%s]',songUrl,songnamepath,songname)
						songinfo.songUrl=songUrl;
						songinfo.exist=1
					}else{
						console.log('songname [%s]解析之后不存在，无法下载,db location=[%d]',songname,index);
						songinfo.exist=0
					}
				}else{
					console.log('songUrl[%s]不存在，歌曲【%s】所属专辑或者排行【%s】无法下载,db location=[%s],dbname=[%s]',requesturl,songname,albumname,index,dbname);
					songinfo.exist=0
				}	
				var newsonginfo=JSON.stringify(songinfo)
				client.lset(dbname,index,newsonginfo,function(err,val){
							//console.log('update num[%s] finished val=[%s] ',index,val);
				});
			}
		});
    }
}