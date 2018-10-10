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

getRanklistSongUrlInfo()
//searchSingertest()
function searchSingertest(){
		singer='林俊杰'
		const singerurl = 'http://www.xiami.com/search?key='+encodeURIComponent(singer)+'&pos=1';
		var albumarr = [];
		request(singerurl,function(req,res,err){
			////if(err){
			////    console.log('something wrong');
			////
			////}else{
				if(res.body){
					var $ = cheerio.load(res.body,{decodeEntities:false});
					var albumslist = $('div.result_main ul.clearfix').eq(0);
					console.log(albumslist)
					var albums = albumslist.find("li[data-needpay]");
					var picurl,albumname,songsurl;
					for(var i in albums){
						var album = albums.eq(i);
						picurl = 'http:'+album.find('a.CDcover100 img').attr('src');
						albumname = album.find('p.name a.song').attr('title');
						songsurl = 'https:'+album.find('p.name a.song').attr('href');
						if(album.data('needpay')){

							console.log(albumname+'需要付费');
						}else{
							if(album.data('needpay')=='0'){
								var albumobj = {
									singer:singer,
									picurl:picurl,
									albumname:albumname,
									songsurl:songsurl
								};
								//console.log(albumobj)
								albumarr.push(JSON.stringify(albumobj));
							}
						}
					}
			
				}
			//}
		});
}


function getRanklistSongUrlInfo() {	
	var rankurl='https://www.xiami.com/chart/data?c=103&type=1&page=1&limit=100&_='  // type 后面的数字代表rankType={'0':' 全部排行','1':'华语','2':'欧美' ,'3':'日本','4':'韩国'} 
	var now = new Date();
	var rankfolder= './'+'排行榜'+'/'
	rankur=rankurl+now.valueOf();
	fs.access(rankfolder, function (err){
			if(err){
				console.log('rankfolder=[%s] 不存在，需要创建',rankfolder);
				fs.mkdir(rankfolder,function(err){
					console.log('rankfolder=[%s]创建成功',rankfolder)
				});
			}else{
				console.log('rankfolder=[%s] 已经存在，不需要创建',rankfolder)	
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
					bagpipe.push(download,songname,songurl,singer,rankfolder,rank);
                }
            }
			console.log('ranksongs.length = [%d]',ranksongs.length);
            client.sadd('ranksongs',ranksongs,function(err,val){
                console.log(val);
				client.close()
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
            client.sadd('songs',songs,function(err,val){
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

    })
    }
}
function doit() {
    const rl = require('readline').createInterface(process.stdin,process.stdout);
    console.log('输入你想要的歌手!');
    rl.on('line',function(singer){
        searchSinger(singer.trim());
        client.lrange('singer_albums',0,-1,function(err,val){
           if(err){
               console.log(err);
           } else{
			   console.log('read data from DB success. data length=[%d]',val.length);
               var arr = val;
               if(arr) {
                   for (var i in arr) {
                       var songinfo = JSON.parse(arr[i]);
                       var albumpic = songinfo.picurl;
                       var albumname = songinfo.albumname;
                       var albumurl = songinfo.albumurl;
                       var singer = songinfo.singer;
					   //console.log('albumpic=[%s]',albumpic)
					   //console.log('albumname=[%s]',albumname)
					   //console.log('albumurl=[%s]',albumurl)
                       downloadAlbum(albumpic, albumurl, albumname, singer);
                   }
               }
           }
        });

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
		request(singerurl,function(req,res,err){
			////if(err){
			////    console.log('something wrong');
			////
			////}else{
				if(res.body){
					var $ = cheerio.load(res.body,{decodeEntities:false});
					var albumslist = $('div.result_main ul.clearfix').eq(0);
					var albums = albumslist.find("li[data-needpay]");
					var picurl,albumname,albumurl;
					for(var i in albums){
						var album = albums.eq(i);
						picurl = 'http:'+album.find('a.CDcover100 img').attr('src');
						albumname = album.find('p.name a.song').attr('title');
						albumurl = 'https:'+album.find('p.name a.song').attr('href');
						if(album.data('needpay')){

							console.log(albumname+'需要付费');
						}else{
							if(album.data('needpay')=='0'){
								var albumobj = {
									singer:singer,
									picurl:picurl,
									albumname:albumname,
									albumurl:albumurl
								};
								console.log(albumobj)
								albumarr.push(JSON.stringify(albumobj));
							}
						}
					}
					if(albumarr.length > 0) { // 如果albumarr 有内容就进来，没有就进不来，
						//console.log('albumarr.length = [%d]',albumarr.length);
						client.lpush("singer_albums", albumarr, function (err) {
							if (err) {
								console.log(err);
							}else{
								console.log('albumarr insert success')
							}
						})
					}else{
						console.log('no need to insert anything,no data in albumarr ')
					}
				}
			//}
		});
	}
}
// function searchSong(songname){
//     var searchurl = 'http://www.xiami.com/search?key='+encodeURIComponent(songname)+'&pos=1';

// }
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
            request(albumurl,function(req,res,err){

                if(res) {
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
									//console.log('songid =[%s],songname=[%s]',songid,songname);
									//download(songname,songid,singer,dir);
									//console.log('songname=[%s],songid=[%s]，newsongid=[%s],checked=[%s]',songname,songid,newsongid,checked);
									var songurl = getSongUrl(newsongid);
									bagpipeflag=bagpipeflag+1;
									bagpipe.push(download, songname, songurl,singer,dir,albumname);
									console.log('bagpipeflag = [%d]/[%d], albumname=[%s],songname[%s]',bagpipeflag,songstable.length,albumname,songname);
									//download(songname,songurl,singer,dir);
								}
							}
							
						}
                    }
                }
            });
}
function downloadCoverAndSongs_old(picurl,albumurl,dir,picname,singer){
            request(picurl).pipe(fs.createWriteStream(dir+picname));
            request(albumurl,function(req,res,err){

                if(res) {
                    var $ = cheerio.load(res.body, {decodeEntities: false});
                    var songstable = $('#track_list tr[data-needpay]');
                    if(songstable){
                        for(var i in songstable){
                            var song = songstable.eq(i).find('td.song_name a:first-child');
                            if(song.text()){
                                var songid = song.attr('href').slice(6);
                                var songname = song.text();
								console.log('songid =[%s],songname=[%s]',songid,songname);
                                download(songname,songid,singer,dir);
                            }
                        }
                    }
                }
            })
}
//doit();