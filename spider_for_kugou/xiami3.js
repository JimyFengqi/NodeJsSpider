/**
 * Created by aidim78 on 2016/11/23.
 */
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
var Bagpipe = require('bagpipe');

const redis = require('redis');
const client = redis.createClient();

var headers={
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50'
    };

//getRanklistSongUrlInfo()

function getRanklistSongUrlInfo() {	
	var rankurl='https://www.xiami.com/chart/data?c=103&type=1&page=1&limit=100&_='  // type 后面的数字代表rankType={'0':' 全部排行','1':'华语','2':'欧美' ,'3':'日本','4':'韩国'} 
	var rankType={'0':' 全部排行','1':'华语','2':'欧美' ,'3':'日本','4':'韩国'} 
	var now = new Date();
	var rankfolder= './'+'排行榜'+'/'
	var basefoldername=rankType[rankurl.slice('https://www.xiami.com/chart/data?c=103&type='.length,'https://www.xiami.com/chart/data?c=103&type='.length+1)]
	var basefolder = rankfolder+basefoldername+'/'
	rankur=rankurl+now.valueOf();
	
	
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
						});
					}else{
						console.log('basefolder=[%s] 已经存在，不需要创建',basefolder)	
					}
				});
			});
		}else{
			console.log('rankfolder=[%s] 已经存在，不需要创建',rankfolder);
			fs.access(basefolder, function (err){
				if(err){
					console.log('basefolder=[%s] 不存在，需要创建',basefolder);
					fs.mkdir(basefolder,function(err){
						console.log('basefolder=[%s]创建成功',basefolder)
					});
				}else{
					console.log('basefolder=[%s] 已经存在，不需要创建',basefolder)	
				}
			});
		}
	});

    request(rankurl, function (req, res, err) {
        if (res) {
			var $ = cheerio.load(res.body);
            var songlists = $('div.song div.info');  
			var checkedlist= $('input');   //真正的songid 在input属性里面
			var bagpipe = new Bagpipe(songlists.length);
            var ranksongs = [];
			console.log('songlists.length = [%d]',songlists.length);
            for (var i in songlists) {
                var song = songlists.eq(i);
				var songid=checkedlist.eq(i).attr('value');
                if(song.text()) {
                    var songname =song.find('p strong>a').text();
					songname=songname.trim().replace(' ','');
					songname=songname.trim().replace('?','_');
					songname=songname.trim().replace('! ','');
					songname=songname.trim().replace(':','_');
					songname=songname.trim().replace(':','_');
					songname=songname.trim().replace('\\','_');
					songname=songname.trim().replace('\\','_');
					songname=songname.trim().replace('(','_');
					songname=songname.trim().replace(')','_');
					songname=songname.trim().replace('\/','_');
					songname=songname.trim().replace('\/','_');
                    var songplayurl = 'https://www.xiami.com/song/'+song.find('p strong>a').attr('href').slice(6);
                    var singer = song.find('p>a').attr('title');
					if(!singer){
						singer=song.find('p>a').text().slice(2)
					}
					var songurl = getSongUrl(songid);
					var rank= +i+1    //字符串转为整形数字，可以在字符串前面加上一个加号， 比如： '12'  -> +'12'
					//console.log('rank=[%d],songname=[%s],songplayurl=[%s],singer=[%s],songid=[%s],songurl=[%s]',rank,songname,songplayurl,singer,songid,songurl);
                    var songobj = {
						rank:rank,
                        songname:songname,
                        songplayurl:songplayurl,
						songid:songid,
                        singer:singer,
						songurl:songurl
                    };
                    songobj = JSON.stringify(songobj);
					//console.log(songobj)
                    ranksongs.push(songobj);
					bagpipe.push(download,songname,songurl,singer,basefolder,rank);
                }
            }
			console.log('ranksongs.length = [%d]',ranksongs.length);
            client.sadd(basefoldername,ranksongs,function(err,val){
                console.log('数据存入basefoldename[%s] 成功 val=[%s]',basefoldername,val);
            });			
        }
    });
};


function getCollectsSongUrl() {
    var rankurl = 'http://www.xiami.com/index/collect?_=';
    var now = new Date();
    rankurl = rankurl + now.valueOf();
    options = {
        url:rankurl,
        headers:headers
    };
	console.log('rankurl = [%s]',rankurl),
    request(options, function (req, res, err) {
        if (res.body) {
            var body = JSON.parse(res.body).data.charts;   //截取一部分的json数据
            var $ = cheerio.load(body, {decodeEntities: false});   //将json数据重新加载
            var songlists = $('div.content div.info');
            var songs = [];

            for (var i in songlists) {
                var song = songlists.eq(i);
                if (song.text()) {
                    var songname = song.find('p strong>a').text();
                    var songid = song.find('p strong>a').attr('href').slice(6);
                    var singer = song.find('p.singer a').attr('title');
					var songurl = getSongUrl(songid);
                    var songobj = {
                        songname:songname,
                        id:songid,
                        singer:singer,
						songurl:songurl
                    };
                    songobj = JSON.stringify(songobj);
                    songs.push(songobj);

                }
            }
			console.log('songs.length = [%d]',songs.length);
            client.lpush('songs',songs,function(err,val){
                console.log(val);
            });
			
        }

    });
};

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

function getSongUrl(songid){
    const urlPrefix = 'http://www.xiami.com/widget/xml-single/uid/0/sid/';
    return urlPrefix+songid;
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
			console.log('歌曲【%s】 所属专辑或者排行【%s】已经存在，无需再次下载',songnamepath,index);

		} 
	});	
}

function getsongURLsaveInDB(songname,requesturl,albumname,dbname,dbindex,dbdata,dbdataindex) {
    ////var requesturl = getSongUrl(songid);
	//var songname = songnamepath.split('/')
	//songname=songname[songname.length-1].split('.')[0]
    if(requesturl){
		request(requesturl, function (req, res, err) {
			////if(err){
			////	console.log('something wrong'+err);
			////}
            if (res) {
                var $ = cheerio.load(res.body,{xmlMode: true});
                var urlstr = $('location').text();
				
                if(urlstr){
					var songUrl = decodeUrl(urlstr);
					//var path = dir+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
					if(songUrl){
						//console.log('after decode songUrl =[%s] songnamepath=[%s],songname=[%s]',songUrl,songnamepath,songname)
						dbdata[dbdataindex].songUrl=songUrl;
						var newsonginfo=JSON.stringify(dbdata)
								
						//callback(songUrl)	
						client.lset(dbname,dbindex,newsonginfo,function(err,val){
							console.log('update num[%s] finished val=[%s] ',dbindex,val);
						});
					}else{
						console.log(songname+'解析之后不存在，无法下载');
					}
				}else{
					console.log('songUrl不存在，歌曲【%s】所属专辑或者排行【%s】无法下载,requesturl为[%s]',songname,albumname,requesturl);
					
					dbdata[dbdataindex].needpay=1;
					var newsonginfo=JSON.stringify(dbdata)
													
					client.lset(dbname,dbindex,newsonginfo,function(err,val){
						console.log('songUrl不存在，歌曲【%s】无法下载 更新needpay=1,finished val=[%s] ',songname,val);
					});
				}	
			}else {
				console.log(songname+'没有下载权限,或者歌曲被下架');
            }
		});
    }
}

function doit() {
    const rl = require('readline').createInterface(process.stdin,process.stdout);
    console.log('输入你想要的歌手!');
    rl.on('line',function(singer){
        searchSinger(singer.trim());
		
		if(singer.startsWith(' ') || singer.length == 0 ){
			console.log('本次没有输入歌手，或者以空格开头，将以默认歌手为[汪东城]');
			singer='罗子文'
			console.log('singer=[%s]',singer);
		}
		//readDBsingeinfo(singer)
		
    });
}


function acquiresongUrl(songInfoUrl,songname,dbname,songinfo,dbindex,dbsubindex,callback){
	
	request(songInfoUrl, function (error, response, body) { 
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(body,{xmlMode: true});
			var urlstr = $('location').text();
			var exist=0			
			if(urlstr){
				var songUrl = decodeUrl(urlstr);
				//var path = dir+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
				if(songUrl){
					//console.log('after decode songUrl =[%s] songnamepath=[%s],songname=[%s]',songUrl,songnamepath,songname)
					exist=1;
					songinfo.albumSonglist[dbsubindex].songUrl=songUrl	
					songinfo.albumSonglist[dbsubindex].exist=exist	
					
				}else{
					console.log(songname+'解析之后不存在，无法下载');
					songinfo.albumSonglist[dbsubindex].exist=exist;
				}
			}else{
				console.log('songUrl不存在，歌曲【%s】所属专辑或者排行【%s】无法下载,requesturl为[%s]',songname,albumname,songInfoUrl);		
				songinfo.albumSonglist[dbsubindex].exist=exist	
			}	
			console.log('songname=【%s】,albumname=【%s】',songname,dbname);
			var newsonginfo=JSON.stringify(songinfo)
			console.log(songinfo);
			//client.lset(dbname,dbindex,newsonginfo,function(err,val){
			//	console.log('update num[%s] finished,finished val=[%s] ',dbindex,val);
			//});
			callback(exist);
		}
	});
}

function readDBsingeinfo(singer){
	fs.access(singer,function(err){
		if(err){
			fs.mkdir(singer,function(err){
				console.log('目录[%s]创建成功',singer)
			});
		}else{
			console.log('目录[%s]已经存在，无需创建',singer)
		}
	});

	client.lrange(singer,-1,-1,function(err,val){
		if(err){
               console.log(err);
		}else{
			
			var arr = val;
			if(arr) {
				arr=JSON.parse(arr)
				console.log('arr.length[%d]',arr.length);
				
				for(let index = 0; index <arr.length; index++){
					var songinfo = arr[index];
					
                    var num = songinfo.num;
                    var songname = songinfo.songname;
                    var songsingername = songinfo.songsingername;
                    var needpay = songinfo.needpay;
					if(!needpay){
						var songInfoUrl = songinfo.songInfoUrl;
						console.log('index=[%s],num=[%s],songname=[%s],songsingername=[%s],singer=[%s],needpay=[%s]',index,num,songname,songsingername,singer,needpay);
						/*
						request(songInfoUrl, function (error, response, body) { 
							if (!error && response.statusCode == 200) {
								response=acquiresongUrl(body,songname,num,songInfoUrl); 
							} 
							
							if(response == 0){
								songinfo.exist=0;
							}else{
								songinfo.exist=1;
								songinfo.songUrl=response;
							}
							console.log('index=[%s],num=[%s],songname=[%s],songsingername=[%s],singer=[%s],needpay=[%s],songUrl=[%s]',index,num,songname,songsingername,singer,needpay,response);
						});
						*/
						//downloadAlbum(albumPicurl, albumurl, albumname, singer,songinfo,index);
						//getsongURLsaveInDB(songname,songInfoUrl,albumname,singer,-1,dbdata,dbdataindex)
					}						
				}
			}
		}
	});
	
	client.lrange(singer,0,-1,function(err,val){
		if(err){
               console.log(err);
		} else{
			console.log('read data from DB success. data length=[%d]',val.length);
			var arr = val;
			if(arr) {
				console.log('arr.length[%d]',arr.length);
				var newsonginfo=[];
				for(let index = 0; index <arr.length-1; index++){
					var songinfo = JSON.parse(arr[index]);
					var albumNum = songinfo.albumNum;
                    var albumneedpay = songinfo.albumneedpay;
					var albumname = songinfo.albumname;
                    var albumurl = songinfo.albumurl;
                    var albumPicurl = songinfo.albumPicurl;
                   
					var albumSonglist=songinfo.albumSonglist
					//console.log('index=[%s],albumNum=【%s】,albumname=[%s],albumurl=[%s],needpay=[%s]',index,albumNum,albumname,albumurl,albumneedpay);
					if(albumSonglist.length > 0){
						//console.log('index=[%s],albumNum=【%s】,albumname=[%s],albumurl=[%s],needpay=[%s]',index,albumNum,albumname,albumurl,albumneedpay);
						var basedir = './'+singer;
						var albumdir = basedir+'/'+albumname+'/';
						downloadAlbumPic(basedir,albumdir,albumPicurl,albumname);
						
						var newalbumSonglist=[]
						var albumSongflag=0
						console.log(' albumSonglist[%d],albumname=[%s]',albumSonglist.length,albumname);
						for(let albumSongindex = 0; albumSongindex <albumSonglist.length; albumSongindex++){
							
							var albumsonginfo = albumSonglist[albumSongindex];
							var songnum = albumsonginfo.songnum;
							var songname = albumsonginfo.songname;							
							var exist = albumsonginfo.exist;							
							if(exist){
								var songInfoUrl = albumsonginfo.songInfoUrl;
								//console.log('index=[%s],albumNum=【%s】,albumname=[%s],albumSongindex=[%s],songnum=[%s],songname=[%s],singer=[%s],exist=[%s]',index,albumNum,albumname,albumSongindex,songnum,songname,singer,exist);
								//downloadAlbum(albumPicurl, albumurl, albumname, singer,songinfo,index);
								acquiresongUrl(songInfoUrl,songname,singer,songinfo,index,albumSongindex,function(response){
									
									//console.log(response)
									albumSongflag=albumSongflag+1
									//newalbumSonglist.push(response);
										 
									
								});
							}
							
						}
						
						
						
					}						
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
		const singerurl = 'http://www.xiami.com/search?key='+encodeURIComponent(singer)+'&pos=1';
		var albumarr = [];
		request(singerurl,function(error,res,response){
			if(error || res.statusCode != 200){
			    console.log('something wrong');
				console.log(error)
			
			}else{
				//if(res.body){
					//var $ = cheerio.load(res.body,{decodeEntities:false});
				if(response){            //res.body 和 response是一样de
					var $ = cheerio.load(response,{decodeEntities:false});
					var albumslist = $('div.result_main ul.clearfix').eq(0);
					var albums = albumslist.find("li[data-needpay]");
					var albumPicurl,albumname,albumurl;
					
					var songstable = $('table.track_list tr[data-needpay]');
					var checkedlistElement=songstable.find('input[checked]');
					console.log('songstable.length[%d],checkedlistElement.length[%d],albums.length=[%d]',songstable.length,checkedlistElement.length,albums.length);
					
					var checkflag=0
					var singercoversonglist=[]
					for(var index=0; index<songstable.length; index++ ){
						var song = songstable.eq(index).find('td.song_name a:first-child');
						//var songsingername = songstable.eq(index).find('td.song_artist a:first-child').text();
						var songsingername = songstable.eq(index).find('td.song_artist a').text().trim();
						songsingername=songsingername.trim().replace('\\','_');
						songsingername=songsingername.trim().replace('\/','_');
						
						var checkelement=songstable.eq(index).find('td.chkbox input:first-child');
						var checked= checkelement.attr('checked');
						var songid= checkelement.attr('value'); //获取歌曲的ID
						var songplayurl = 'https:'+song.attr('href');
						var songname = song.text();
						songname=songname.replace(/[\\~`:?!/() &*]/g,'_')  //字符串替换，将其他类型的字符全部替换了
						
			
						var num = +index+1
						var songelement={
							num:num,
							songname:songname,
							songsingername:songsingername
						}
						if(songname){
							if(checked == 'checked'){
								var songInfoUrl = getSongUrl(songid);
								checkflag=checkflag+1;
								songelement.needpay=0
								songelement.songplayurl=songplayurl
								songelement.songInfoUrl=songInfoUrl		
								singercoversonglist.push(songelement)
								//singercoversonglist.push(JSON.stringify(songelement))
								//console.log(songelement)
							}else{
								songelement.needpay=1
								singercoversonglist.push(songelement)
								//singercoversonglist.push(JSON.stringify(songelement))
								//console.log(songelement)
							}
				
						}
					}
					if(singercoversonglist.length>0){
						songcoverinfo=[JSON.stringify(singercoversonglist)];
					
						client.lpush(singer, songcoverinfo, function (err) {
								if (err) {
									console.log(err);
								}else{
									console.log('songcoverinfo insert success');
								}
							});
					}
					
					
					
					if(albums.length >0){
						var albumBagpipe=new Bagpipe(albums.length)

						for(var i =0; i<albums.length;i++){
							var album = albums.eq(i);
							albumPicurl = 'http:'+album.find('a.CDcover100 img').attr('src');
							albumname = album.find('p.name a.song').attr('title');
							
							albumname=albumname.replace(/[\\~`:?!/() &*]/g,'_');
							albumurl = 'https:'+album.find('p.name a.song').attr('href');
							var albumneedpay=album.data('needpay')        //这个数据需要关注
							var index = i+1
							var albumobj = {
										albumNum:index,
										singer:singer,
										albumneedpay:albumneedpay,
										albumname:albumname,
										albumurl:albumurl,
										albumPicurl:albumPicurl
							};
							//downloadAlbum(albumPicurl, albumurl, albumname, singer,albumobj,i);
							//console.log(albumPicurl, albumurl, albumname, singer,albumobj,index)
							//if(!albumneedpay){ 
							//	albumBagpipe.push(getCoverSongs,albumurl,albumname, singer,albumobj,i);
							//	albumarr.push(JSON.stringify(albumobj));
							//}
							//应该是不管是不是需要needpay,都检查一遍，有的专辑里面有可以听的内容						
							albumBagpipe.push(getCoverSongs,albumurl,albumname, singer,albumobj,i);
							albumarr.push(JSON.stringify(albumobj));
						}	
					}
					if(albumarr.length > 0) { // 如果albumarr 有内容就进来，没有就进不来，
						//console.log('albumarr.length = [%d]',albumarr.length);
						client.lpush(singer, albumarr, function (err) {
							if (err) {
								console.log(err);
							}else{
								console.log('albumarr insert success')
							}
						});
					}else{
						console.log('no need to insert anything,no data in albumarr ')
					}
					
				}
			}
		});
	}
}
function getCoverSongs(albumurl,albumname,dbname,dbdata,dataindex){
	request(albumurl,function(error,res,response){
		if(error || res.statusCode != 200){
			    console.log('something wrong');
				console.log(error)
		}else{
			var albumsonglist=[]
			var $ = cheerio.load(response, {decodeEntities: false});
			var songstable = $('#track_list tr[data-needpay]');
			//var songstable = $('table.track_list tr[data-needpay]');
			
			if(songstable){
				var albumsongbagpipe = new Bagpipe(songstable.length);
				var bagpipeflag=0;
				var checkflag=0
				var checkedlistElement=songstable.find('input[checked]');
				console.log('dataindex=[%d],songstable.length[%d],checkedlistElement.length[%d],albumname=[%s]',dataindex,songstable.length,checkedlistElement.length,albumname);
						
				for(var index=0; index<songstable.length; index++ ){
					var song = songstable.eq(index).find('td.song_name a:first-child');	
					var songname = song.text();
					var songname = songname.replace(/[\\~`:?!/() &*]/g,'_');
					var checkelement=songstable.eq(index).find('td.chkbox input:first-child');
					var songid= checkelement.attr('value'); //获取歌曲的ID
					var songplayurl = 'https:'+song.attr('href');
					var songnum=index+1
					
					var checked= checkelement.attr('checked');
					if(checked == 'checked'){
						var exist=1
					}else{
						var exist=0
					}
				
					var songelement={
						songnum:songnum,
						songname:songname,	
						songplayurl:songplayurl,
						songid:songid,						
						exist:exist				
					}	
					if(exist){
						var songInfoUrl = getSongUrl(songid);
						songelement.songInfoUrl=songInfoUrl	
					}
					
					albumsonglist.push(songelement)
					dbdata.albumSonglist=albumsonglist
					
					var newinfo=JSON.stringify(dbdata)
					client.lset(dbname,dataindex,newinfo,function(err,val){
						console.log('update dbnum[%s] album【%s】 dbname=【%s】finished val=[%s] ',dataindex,albumname,dbname,val);
					});										
															
				}
			}
		}
	});
}


// function searchSong(songname){
//     var searchurl = 'http://www.xiami.com/search?key='+encodeURIComponent(songname)+'&pos=1';

// }


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
                })
            }
    });
}



function downloadCoverAndSongs(albumPicurl,albumurl,dir,picname,singer,albumname,albuminfo,dataindex){
	//request(albumPicurl).pipe(fs.createWriteStream(dir+picname));
	
	request(albumurl,function(error,res,response){
		if(error || res.statusCode != 200){
			    console.log('something wrong');
				console.log(error)
		}else{
			var $ = cheerio.load(response, {decodeEntities: false});
			var songstable = $('#track_list tr[data-needpay]');
			
			if(songstable){
				console.log('songstable.length = [%d],albumname=[%s]',songstable.length,albumname);
				var bagpipe = new Bagpipe(songstable.length);
				var bagpipeflag=0;
				var albumsonglist=[]
				var checkflag=0

				//var songstable = $('table.track_list tr[data-needpay]');
				var checkedlistElement=songstable.find('input[checked]');
				console.log('dataindex=[%d],songstable.length[%d],checkedlistElement.length[%d],albumname=[%s]',dataindex,songstable.length,checkedlistElement.length,albumname);
						
				for(var index=0; index<songstable.length; index++ ){
					var song = songstable.eq(index).find('td.song_name a:first-child');	
					var checkelement=songstable.eq(index).find('td.chkbox input:first-child');
					var checked= checkelement.attr('checked');
					var songid= checkelement.attr('value'); //获取歌曲的ID
					var songplayurl = 'https:'+song.attr('href');
					var songname = song.text();
					var songname = songname.replace(/[\\~`:?!/() &*]/g,'_');
					var songnum=index+1
					if(checked == 'checked'){
						var exist=1
					}else{
						var exist=0
					}
				
					var songelement={
						songnum:songnum,
						songname:songname,	
						songplayurl:songplayurl,
						songid:songid,						
						exist:exist				
					}
						
						
					if(exist){
						var songInfoUrl = getSongUrl(songid);
						songelement.songInfoUrl=songInfoUrl	
												
						
						console.log(songelement)											
						
						request(songInfoUrl, function (err, songInfoRes, songInfoBody) {
							checkflag=checkflag+1;
							var newsongelement	=songelement
							if(error || res.statusCode != 200){
									console.log('something wrong');
									console.log(error)
							}else{
								var $ = cheerio.load(songInfoRes.body,{xmlMode: true});
								var urlstr = $('location').text();
								
								if(urlstr){
									var songUrl = decodeUrl(urlstr);
									if(songUrl){
										newsongelement.songUrl=songUrl
										//songelement.songUrl=songUrl
									}else{
										console.log(songname+'解析之后不存在，无法下载');
										newsongelement.exist=0
										//songelement.needpay=1
									}
								}else{
									console.log('songUrl不存在，歌曲【%s】无法下载,requesturl为[%s]',songname,songInfoUrl);
									newsongelement.needpay=1
									//songelement.needpay=1
								}	
								
								console.log(newsongelement)
								//console.log(songelement)
								
								
								
								albumsonglist.push(newsongelement)
								
								if(checkflag == checkedlistElement.length){
									albuminfo.albumSonglist=albumsonglist
									var newinfo=JSON.stringify(albuminfo)
						
									//console.log('newinfo.length=[%d]',newinfo.length )	;
									//console.log(newinfo )	;
									client.lset(singer,dataindex,newinfo,function(err,val){
										console.log('update num[%s] finished val=[%s] ',dataindex,val);
									});
								}
								
								
							}
						});	
						
						
						/*
						getsongFinalURL(songname,songInfoUrl,function(response){
							checkflag=checkflag+1;
							console.log('songname=[%s] ,response=[%s]',songname,response)
							if(response == 1){
								songelement.needpay=response
							}else{
								songelement.songUrl=response
							}
							bagpipeflag=bagpipeflag+1							
							albumsonglist.push(songelement)
							//albumsonglist.push(JSON.stringify(songelement))
							console.log(songelement)
							
							if(checkflag == checkedlistElement.length){
								albuminfo.albumSonglist=albumsonglist
								var newinfo=JSON.stringify(albuminfo)
					
								//console.log('newinfo.length=[%d]',newinfo.length )	;
								//console.log(newinfo )	;
								client.lset(singer,dataindex,newinfo,function(err,val){
									console.log('update num[%s] finished val=[%s] ',dataindex,val);
								});
							}
							
						})
						*/
						
						
					}/*
					else{
						songelement.needpay=1
						albumsonglist.push(songelement)
						//albumsonglist.push(JSON.stringify(songelement))
						console.log(songelement)
						bagpipeflag=bagpipeflag+1							
					}	
					*/
					
					
				}

			}
		}
	});
}

function getsongFinalURL(songname,requesturl,callback) {
	request(requesturl, function (err, res, body) {
		if (res) {
			var $ = cheerio.load(res.body,{xmlMode: true});
			var urlstr = $('location').text();
				
			if(urlstr){
				var songUrl = decodeUrl(urlstr);
				if(songUrl){
					callback(songUrl)
				}else{
					console.log(songname+'解析之后不存在，无法下载');
					callback(1)
				}
			}else{
				console.log('songUrl不存在，歌曲【%s】无法下载,requesturl为[%s]',songname,requesturl);
				callback(1)
			}	
		}else {
			callback(1)
			console.log(songname+'没有下载权限,或者歌曲被下架');
		}
	});
}

doit();