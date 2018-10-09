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

//[7h%1m2F227993%E3k5%%-734ct22iF7F7957255Fe355eccc1tF8.4523%878E.ay9EE61eebp%.n141423_58mu%6%-154ee%2xe11%%F%1%5pt355%722713Fit%1551545%3hD8E54bffAma%2%EE7E9E5%_18-Ef1fb]
//[4h%2F8an21712E47F55295%8m3teD98%%%dEd%%2b9E3t3Fm.meF%5%12%918E_3%53pFhy16%5551145593555tA%1xit4242%75%739125E53a_%555EEE%1cEE67%cap%22i.%1F1F53E29%748E8.%uk338E---561e2975cf]
//[9hFx%7159143k95E82ft%i25%E547%e6E-b4dt2aF4577923y5-45b7pFm41E9928F%8%af96%mi112%551a385c8bd31.1%721%6uD%E8d24A2n%23F65.t15-d5e5%8e2F411Emh5E%8362.tF2%7_2p_3%5c42]
//[8h28n11E75%273_55E58d3EtF.e%%298587%k3E-E%e19t%xt227%3E5%3e9%%a5ba2p2i%FF32%_%5Fy655aE3ba%Fa2724F515Ea%5EE96163mmF51%1E4E.u38--df85A1i44%57993mtD8%7955%%2.115E9831ph1%5%7335]
a='6hAFxn472E5F3922mae58E%%c5%851t%mie15F2E1%_88puy3%-557c53Eat21at14277751573t%95%EE58Eb%pF2m%%11399E4%2%h36E5-c83865%%8i221%4%599573_D5%Ea47edeE32..FF%5%2873E.Fk185-ca2a2%f'
//a='5h3%2ae4F117EF89455%pakD65-%57c112EtA28mt17%%371379%E53ue15E%5fc25129t%F.i%1525497%4359E%ty58%5Ee4467e6p2mx.2%4FE%%95_2E4.3h%385E-3f1b9%%F1inF2122525E18%4mF_39%E-f2effd5'
//a='4h%2F8an21712E47F555951Em3teD98%%%8a827c13t3Fm.meF%5%12%918E_3%36pFhy16%5556dd375edtA%1xit4242%75%739125%23a_%555EEEfc2d8bf6p%22i.%1F1F53E29%748E5.%uk338E---5664bb51'
//a='8h28n11E75859a%5EE3881tF.e%%298_%.u38--1%72t%xt227%315mtD8%e851cp2i%FF32%4Eph1%551Ea3%Fa2724F5923_55E%4ea33mmF51%1E38%k3E-5487aA1i44%579263e9%%Ebce%2.115E9785Fy65551d6'

decodeUrl(a);


function decodeUrl(str) {
	console.log('str[%s]',str)
    var finalresult;
	
	console.log('str.length [%d]',str.length);
    var needstr = str.slice(1);  //去掉开头一个数字，得到所需字符串
	console.log('needstr[%s]',needstr)  
	
    var lines = str.slice(0, 1) - 0;    //获取开头数字
	console.log('lines[%s]',lines)
	
    var cols = Math.ceil(needstr.length / lines);  //所需字符串 除以 开头数字取商
	console.log('cols[%s]',cols)
	
    var leftline = needstr.length % lines;    //所需字符串 除以 开头数字取余数
	console.log('leftline[%s]',leftline)
	if (leftline== 0){cols =cols+1}
	console.log('leftline[%s],cols[%s]',leftline,cols)
	
    var arr = [];
    var result = "";
    for (var j = 0; j < leftline; j++) {
        arr[j] = needstr.slice(cols * j, cols * (j + 1));
    }
	
	console.log('arr:')
	console.log(arr)	
	
	
    var leftstr = needstr.slice((leftline) * cols);
	console.log('leftstr[%s]',leftstr)
	
    for (var j = 0; j < lines - leftline; j++) {
        arr[leftline + j] = leftstr.slice((cols - 1) * j, (cols - 1) * (j + 1))
    }
	console.log('arr:')
	console.log(arr)
	
	
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < lines; j++) {
            if (arr[j][i]) {
                result += arr[j][i];
            }
        }
    }
	console.log('result[%s]',result)
	
    try{
        finalresult = decodeURIComponent(result).replace(/[\^]/g, '0');
		console.log('finalresult[%s]',finalresult)
		
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
								console.log('after decode songUrl =[%s] path=[%s]',songUrl,path)
								//downloadsong(songUrl,path,songname,function(response){
								//	console.log('歌曲[%s] 下载完毕,存贮在本地地址为[%s]',songname,path);
								//});
								
							}else{
								console.log('songUrl 解析之后不存在，歌曲【%s】所属专辑【%s】无法下载,requesturl为[%s]',songname,albumname,requesturl);
							}
						}else{
							console.log('歌曲【%s】 已经存在，无需再次下载',path);
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
        //searchSinger(singer.trim());
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
                       var albumurl = songinfo.songsurl;
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
						bagpipe = new Bagpipe(songstable.length);
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
									console.log('songname=[%s],songid=[%s]，newsongid=[%s],checked=[%s]',songname,songid,newsongid,checked);
									var songurl = getSongUrl(newsongid);
									bagpipe.push(download, songname, songurl,singer,dir,albumname);
									
									//download(songname,songurl,singer,dir);
								}
							}
						}
                    }
                }
            });
}

//doit();