/**
 * Created by Jimyfengqi on 2018/10/15.
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
				console.log(error)
			}else{
				if(response){            //res.body 和 response是一样的
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
						songsingername=songsingername.trim().replace(/[\\~`:?!/() &*]/g,'_');
						
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
								songelement.exist=1
								songelement.songplayurl=songplayurl
								songelement.songInfoUrl=songInfoUrl		
								singercoversonglist.push(songelement)
								//singercoversonglist.push(JSON.stringify(songelement))
								//console.log(songelement)
							}else{
								songelement.exist=0
								singercoversonglist.push(songelement)
								//singercoversonglist.push(JSON.stringify(songelement))
								//console.log(songelement)
							}
				
						}
					}
					if(singercoversonglist.length>0){
						songcoverinfo=[JSON.stringify(singercoversonglist)];
						//console.log(JSON.parse(songcoverinfo))
						InsertListInDB(singer,songcoverinfo)
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
										albumPicurl:albumPicurl,
										albumSongexist:1
							};
							//应该是不管是不是需要needpay,都检查一遍，有的专辑里面有可以听的内容						
							albumBagpipe.push(getCoverSongs,albumurl,albumname, singer,albumobj,i);
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

function getCoverSongs(albumurl,albumname,dbname,dbdata,dbdataindex){
	request(albumurl,function(error,res,response){
		if(error || res.statusCode != 200){
				console.log(error)
		}else{
			var albumsonglist=[]
			var $ = cheerio.load(response, {decodeEntities: false});
			var songstable = $('#track_list tr[data-needpay]');
			//var songstable = $('table.track_list tr[data-needpay]');
			
			if(songstable){
				var albumsongbagpipe = new Bagpipe(songstable.length);
				var checkflag=0
				var checkedlistElement=songstable.find('input[checked]');
				console.log('dbdataindex=[%d],songstable.length[%d],checkedlistElement.length[%d],albumname=[%s]',dbdataindex,songstable.length,checkedlistElement.length,albumname);
						
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
						var exist=1;
						checkflag=checkflag+1;
					}else{
						var exist=0;
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
					if(checkflag==0){						
						dbdata.albumSongexist=0
					}else{
						dbdata.albumSongexist=1
					}	
					albumsonglist.push(songelement)
					dbdata.albumSonglist=albumsonglist
					
					var newinfo=JSON.stringify(dbdata)
					
					//client.lset(dbname,dbdataindex,newinfo,function(err,val){
					//	console.log('update dbnum[%s] songname=[%s],album【%s】 dbname=【%s】finished val=[%s] ',dbdataindex,songname,albumname,dbname,val);
					//});										
					updatedb(dbname,dbdataindex,newinfo,songnum,songname,albumname);										
				}
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
				for(let index = 0; index <arr.length-1; index++){
					var songinfo = JSON.parse(arr[index]);
					var albumNum = songinfo.albumNum;
                    var albumneedpay = songinfo.albumneedpay;
					var albumname = songinfo.albumname;
                    var albumurl = songinfo.albumurl;
                    var albumPicurl = songinfo.albumPicurl;
					var albumSongexist=songinfo.albumSongexist
                   
					var albumSonglist=songinfo.albumSonglist
					//console.log('index=[%s],albumNum=【%s】,albumname=[%s],albumurl=[%s],needpay=[%s]',index,albumNum,albumname,albumurl,albumneedpay);
					if(albumSonglist){						
						//console.log('index=[%s],albumNum=【%s】,albumname=[%s],albumurl=[%s],needpay=[%s]',index,albumNum,albumname,albumurl,albumneedpay);
						var basedir = './'+singer;
						var albumdir = basedir+'/'+albumname+'/';
						downloadAlbumPic(basedir,albumdir,albumPicurl,albumname);
							
						var newalbumSonglist=[]
						var albumSongflag=0
						console.log(' albumSonglist[%d],albumname=[%s]',albumSonglist.length,albumname);
						if(albumSongexist > 0){
							for(let albumSongindex = 0; albumSongindex <albumSonglist.length; albumSongindex++){									
								var albumsonginfo = albumSonglist[albumSongindex];
								var songnum = albumsonginfo.songnum;
								var songname = albumsonginfo.songname;							
								var exist = albumsonginfo.exist;							
								if(exist){
									var songInfoUrl = albumsonginfo.songInfoUrl;
									var songUrl=albumsonginfo.songUrl;
									var songnamepath = albumdir+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
									if(songUrl){
										downloadsongs(songUrl,songnamepath,songname,albumname)
									}else{
										acquiresongUrl(songInfoUrl,songname,songnamepath,singer,albumname,songnum,songinfo,index,albumSongindex,1);
									}
								}									
							}						
						}						
					}						
				}				
			}
		}
	});
	
	client.lrange(singer,-1,-1,function(err,val){
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
                    var num = songinfo.num;
                    var songname = songinfo.songname;
                    var songsingername = songinfo.songsingername;
                    var exist = songinfo.exist;

					if(exist){
						var songInfoUrl = songinfo.songInfoUrl;
						var songUrl=songinfo.songUrl;
						var songnamepath = singerdir+songname+ '_' + singer + '.mp3';
						if(songUrl){
							downloadsongs(songUrl,songnamepath,songname,num)
						}else{
							acquiresongUrl(songInfoUrl,songname,songnamepath,singer,num,num,arr,dblength-1,index,0)

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

function getSongUrl(songid){
    const urlPrefix = 'http://www.xiami.com/widget/xml-single/uid/0/sid/';
    return urlPrefix+songid;
}

function acquiresongUrl(songInfoUrl,songname,songnamepath,dbname,albumname,songnum,songinfo,dbdataindex,dbsubindex,flag){	
	request(songInfoUrl, function (error, response, body) { 
		if (!error && response.statusCode == 200) {
			var $ = cheerio.load(body,{xmlMode: true});
			var urlstr = $('location').text();
			var exist=0			
			if(urlstr){
				var songUrl = decodeUrl(urlstr);
				if(songUrl){
					//console.log('after decode songUrl =[%s] songnamepath=[%s],songname=[%s]',songUrl,songnamepath,songname)
					exist=1;
					downloadsongs(songUrl,songnamepath,songname,albumname);
				}else{
					console.log(songname+'解析之后不存在，无法下载');
				}
			}else{
				console.log('songUrl不存在，歌曲【%s】所属专辑或者排行【%s】无法下载,requesturl为[%s]',songname,albumname,songInfoUrl);		
			}	
			if(flag){
				if(exist){
					songinfo.albumSonglist[dbsubindex].songUrl=songUrl;
					songinfo.albumSonglist[dbsubindex].exist=exist;	
				}else{
					songinfo.albumSonglist[dbsubindex].exist=exist;		
				}
			}else{
				if(exist){
					songinfo[dbsubindex].songUrl=songUrl;
					songinfo[dbsubindex].exist=exist;
				}else{
					songinfo[dbsubindex].exist=exist;
				}
			}
			
			var newinfo=JSON.stringify(songinfo)
			//console.log(songinfo);
			updatedb(dbname,dbdataindex,newinfo,songnum,songname,albumname)
			//client.lset(dbname,dbdataindex,newinfo,function(err,val){
			//	console.log('update num[%s] songname=【%s】,albumname=[%s],finished,finished val=[%s] ',dbdataindex,songname,albumname,val);
			//});
		}
	});
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

function downloadsongs(songUrl,songnamepath,songname,albumname){
	//albumname这里代指专辑名字，或者排行
	downloadsong(songUrl,songnamepath,songname,albumname,function(response){
		console.log('歌曲[%s]所属专辑或者排行【%s】 下载完毕,存贮在本地地址为[%s]',songname,albumname,songnamepath);
	});
}

function downloadsong(uri,songnamepath,songname,albumname,callback){
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
			console.log('歌曲【%s】 所属专辑或者排行【%s】已经存在，无需再次下载',songnamepath,albumname);

		} 
	});	
}

doit();