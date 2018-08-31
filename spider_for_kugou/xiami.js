/**
 * Created by aidim78 on 2016/11/23.
 */
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const redis = require('redis');
const client = redis.createClient();

var headers={
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50'
    }
;
function getCollectsSongUrl() {
    var rankurl = 'http://www.xiami.com/index/collect?_=';
    var now = new Date();
    rankurl = rankurl + now.valueOf();
    options = {
        url:rankurl,
        headers:headers
    };
    request(options, function (req, res, err) {
        if (res.body) {
            var body = JSON.parse(res.body).data.charts;
            var $ = cheerio.load(body, {decodeEntities: false});
            var songlists = $('div.content div.info');
            var songs = [];

            for (var i in songlists) {
                var song = songlists.eq(i);
                if (song.text()) {
                    var name = song.find('p strong>a').text();
                    var songid = song.find('p strong>a').attr('href').slice(6);
                    var singer = song.find('p.singer a').attr('title');
                    var songobj = {
                        name:name,
                        id:songid,
                        singer:singer
                    };
                    songobj = JSON.stringify(songobj);
                    songs.push(songobj);

                }
            }
            client.sadd('songs',songs,function(err,val){
                console.log(val);
            });

        }

    });
};

function decodeUrl(str) {
    var finalresult;
    var needstr = str.slice(1);
    var lines = str.slice(0, 1) - 0;
    var cols = Math.ceil(needstr.length / lines);
    var leftline = needstr.length % lines;
    var arr = [];
    var result = "";
    for (var j = 0; j < leftline; j++) {
        arr[j] = needstr.slice(cols * j, cols * (j + 1));
    }
    var leftstr = needstr.slice((leftline) * cols);
    for (var j = 0; j < lines - leftline; j++) {
        arr[leftline + j] = leftstr.slice((cols - 1) * j, (cols - 1) * (j + 1))
    }
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < lines; j++) {
            if (arr[j][i]) {
                result += arr[j][i];
            }
        }
    }
    try{
        finalresult = decodeURIComponent(result).replace(/[\^]/g, '0');
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
function download(songname,songid,singer,dir) {
    var requesturl = getSongUrl(songid);
    if(requesturl){
    request(requesturl, function (req, res, err) {
            var body;

            if (res) {
                var $ = cheerio.load(res.body, {xmlMode: true});
                var urlstr = $('location').text();
                if(urlstr){
                var songUrl = decodeUrl(urlstr);
                var path = dir+songname.trim().replace('\/','_') + '_' + singer + '.mp3';

                fs.access(path, function (err) {
                    if (err) {
                        if(songUrl) {
                            console.log("正在下载"+songname);
                            request(songUrl).pipe(fs.createWriteStream(path)).on('end',function(err){
                               console(err?songname+'下载失败':songname+"下载成功");
                            });
                        }
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
               var arr = val;
               if(arr) {
                   for (var i in arr) {
                       var songinfo = JSON.parse(arr[i]);
                       var albumpic = songinfo.picurl;
                       var albumname = songinfo.albumname;
                       var albumurl = songinfo.songsurl;
                       downloadAlbum(albumpic, albumurl, albumname, singer);
                   }
               }
           }
        });

    });

}
function searchSinger(singer){
    const singerurl = 'http://www.xiami.com/search?key='+encodeURIComponent(singer)+'&pos=1';
    var albumarr = [];
    request(singerurl,function(req,res,err){
        //if(err){
        //    console.log('something wrong');
        //
        //}else{
            if(res.body){
                var $ = cheerio.load(res.body,{decodeEntities:false});
                var albumslist = $('div.result_main ul.clearfix').eq(0);
                var albums = albumslist.find("li[data-needpay]");
                var picurl,albumname,songsurl;
                for(var i in albums){
                    var album = albums.eq(i);
                    picurl = album.find('a.CDcover100 img').attr('src');
                    albumname = album.find('p.name a.song').attr('title');
                    songsurl = album.find('p.name a.song').attr('href');
                    if(album.data('needpay')){

                        console.log(albumname+'需要付费');
                    }else{
                        if(album.data('needpay')=='0'){
                            var albumobj = {
                                picurl:picurl,
                                albumname:albumname,
                                songsurl:songsurl
                            };

                            albumarr.push(JSON.stringify(albumobj));
                        }
                    }
                }
                if(albumarr) {
                    client.lpush("singer_albums", albumarr, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    })
                }
            }
        //}
    });

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
                                    downloadCoverAndSongs(picurl,albumurl,dir,singer);
                                })
                            }else{
                               downloadCoverAndSongs(picurl,albumurl,dir,singer);
                            }
                        });
            });
        }else{
              fs.access(dir,function(err){
                    if(err){
                        fs.mkdir(dir,function(err){
                           downloadCoverAndSongs(picurl,albumurl,dir,picname,singer);
                        })
                    }else{
                       downloadCoverAndSongs(picurl,albumurl,dir,picname,singer);
                    }
                })
            }
    });


}

function downloadCoverAndSongs(picurl,albumurl,dir,picname,singer){
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
                                download(songname,songid,singer,dir);
                            }
                        }
                    }
                }
            })
}
doit();