/**
 * Created by Jimyfengqi on 2018/10/17.
 */
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
var Bagpipe = require('bagpipe');

var headers={
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50'
    };

function doit() {
    const rl = require('readline').createInterface(process.stdin,process.stdout);
	var lastsinger;
    console.log('输入你想要的歌手!');
    rl.on('line',function(singer){
		if(singer.startsWith(' ') || singer.length == 0 ){
			if(lastsinger){
				singer=lastsinger
				console.log('本次没有输入歌手，将以上一次输入的【%s】作为查询对象',singer);
				searchSinger(singer.trim());
			}else{
				console.log('本次没有输入歌手，或者以空格开头，请重新输入');
				return
			}
		}else{
			var singer=singer.trim();
			searchSinger(singer.trim());
			lastsinger=singer
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
					var songbagpipe= new Bagpipe(checkedlistElement.length)
					console.log('songstable.length[%d],checkedlistElement.length[%d],albums.length=[%d]',songstable.length,checkedlistElement.length,albums.length);
					var dir =singer+'/'
					fs.access(dir,function(err){
                        if(err){
                            fs.mkdir(dir,function(err){ 
                            });
                        }
                    });
					
					for(var index=0; index<songstable.length; index++ ){
						var song = songstable.eq(index).find('td.song_name a:first-child');
						//var songsingername = songstable.eq(index).find('td.song_artist a:first-child').text();
						var songsingername = songstable.eq(index).find('td.song_artist a').text().trim();
						songsingername=songsingername.trim().replace(/[\\~`:?!/() &*]/g,'_');
						
						var num = +index+1
						var checkelement=songstable.eq(index).find('td.chkbox input:first-child');
						var checked= checkelement.attr('checked');
						var songid= checkelement.attr('value'); //获取歌曲的ID
						var songplayurl = 'https:'+song.attr('href');
						
						var songname = song.text();
						songname=songname.replace(/[\\~`:?!/() &*]/g,'_')  //字符串替换，将其他类型的字符全部替换了

						if(songname){
							if(checked == 'checked'){
								var songInfoUrl = getSongUrl(songid);
							
								songbagpipe.push(download, songname, songInfoUrl,singer,dir,num);
							}
						}
					}
				
					if(albums.length >0){
						var albumBagpipe=new Bagpipe(albums.length)

						for(var i =0; i<albums.length;i++){
							var album = albums.eq(i);
							albumPicurl = 'http:'+album.find('a.CDcover100 img').attr('src');
							albumname = album.find('p.name a.song').attr('title');
							albumname=albumname.replace(/[\\~`:?!/() &*]/g,'_');
							albumurl = 'https:'+album.find('p.name a.song').attr('href');
							albumBagpipe.push(downloadAlbum,albumPicurl,albumurl,albumname, singer);

						}	
					}

					
				}
			}
		});
	}
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

function getSongUrl(songid){
    const urlPrefix = 'http://www.xiami.com/widget/xml-single/uid/0/sid/';
    return urlPrefix+songid;
}

function downloadsong(uri,path,songname,callback){
	request.head(uri, function(err, res, body){ 
		if (err) { 
			console.log('err: '+ err); 
			console.log('err uri is [%s] ',uri); 
			return false; 
		} 
		console.log('正在下载歌曲[%s] 到本地',songname);
		request(uri).pipe(fs.createWriteStream(path,{autoClose:true})).on('close', callback); 
	});
}								

function download(songname,requesturl,singer,dir,albumname) {
    ////var requesturl = getSongUrl(songid);
	//console.log('download function requesturl = [%s]',requesturl)
    if(requesturl){
    request(requesturl, function (req, res, err) {
			////if(err){
			////	console.log('something wrong'+err);
			////}
            if (res) {
                var $ = cheerio.load(res.body, {xmlMode: true});
                var urlstr = $('location').text();
				
                if(urlstr){
					var songUrl = decodeUrl(urlstr);
					var path = dir+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
					fs.access(path, function (err) {
						if (err) {
							if(songUrl){
								//console.log('after decode songUrl =[%s] path=[%s]',songUrl,path)
								downloadsong(songUrl,path,songname,function(response){
									console.log('歌曲[%s]所属专辑或者排行【%s】 下载完毕,存贮在本地地址为[%s]',songname,albumname,path);
								});
								
							}else{
								console.log('songUrl 解析之后不存在，歌曲【%s】所属专辑或者排行【%s】无法下载,requesturl为[%s]',songname,albumname,requesturl);
							}
						}else{
							console.log('歌曲【%s】 所属专辑或者排行【%s】已经存在，无需再次下载',path,albumname);
						} 
					});
                }else{
                    console.log(songname+'无法下载');
                }
            } 
            else {
                console.log(songname+'没有下载权限');
            }
    });
    }
}

function downloadAlbum(picurl,albumurl,albumname,singer){
    var basedir = './'+singer;
    var dir = basedir+'/'+albumname+'/';
    var picname = albumname+'.jpg';
    fs.access(basedir,function(err){
        if(err){
            fs.mkdir(basedir,function(err){
               fs.access(dir,function(err){
                            if(err){
                                fs.mkdir(dir,function(err){
                                    downloadCoverAndSongs(picurl,albumurl,dir,picname,singer,albumname);
                                })
                            }else{
                               downloadCoverAndSongs(picurl,albumurl,dir,picname,singer,albumname);
                            }
                        });
            });
        }else{
              fs.access(dir,function(err){
                    if(err){
                        fs.mkdir(dir,function(err){
                           downloadCoverAndSongs(picurl,albumurl,dir,picname,singer,albumname);
                        })
                    }else{
                       downloadCoverAndSongs(picurl,albumurl,dir,picname,singer,albumname);
                    }
                })
            }
    });


}

function downloadCoverAndSongs(picurl,albumurl,dir,picname,singer,albumname){
            request(picurl).pipe(fs.createWriteStream(dir+picname));
            request(albumurl,function(err,res,body){
				if(err || res.statusCode!=200 ){
					console.log(err)
				}else{
                    var $ = cheerio.load(res.body, {decodeEntities: false});
                    var songstable = $('#track_list tr[data-needpay]');
                    if(songstable){
						console.log('songstable.length = [%d],albumname=[%s]',songstable.length,albumname);
						var bagpipe = new Bagpipe(songstable.length);
						var bagpipeflag=0;
                        for(var i in songstable){
							var song = songstable.eq(i).find('td.song_name a:first-child');
							var checkelement=songstable.eq(i).find('td.chkbox input:first-child');
							var checked= checkelement.attr('checked');
							var newsongid= checkelement.attr('value'); //获取歌曲的ID
							if(checked == 'checked'){
								if(song.text()){
									var songid = song.attr('href').slice(6);
									var songname = song.text();
									var songname = songname.replace(/[\\~`:?!/() &*]/g,'_') ;
									//console.log('songid =[%s],songname=[%s]',songid,songname);
									//download(songname,songid,singer,dir);
									//console.log('songname=[%s],songid=[%s]，newsongid=[%s],checked=[%s]',songname,songid,newsongid,checked);
									var songurl = getSongUrl(newsongid);
									bagpipe.push(download, songname, songurl,singer,dir,albumname);

								}
							}
							
						}
                    }
                }
            });
}

doit();