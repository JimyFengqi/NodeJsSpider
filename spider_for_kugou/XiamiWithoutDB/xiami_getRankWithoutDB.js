/**
 * Created by aidim78 on 2018/10/10.
 */
const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
var Bagpipe = require('bagpipe');


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

function getRanklistSongUrlInfo(rankurl,basefolder,ranktype) {	
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

					var songnamepath = basefolder+rank+'_'+songname.trim().replace('\/','_') + '_' + singer + '.mp3';
					bagpipe.push(getsongURLdownload,songnamepath,songInfoUrl,rank,ranktype);
					
                }
            }
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

function downloadsongs(songUrl,songnamepath,songname,rank,RankType){
	downloadsong(songUrl,songnamepath,songname,rank,RankType,function(response){
		console.log('歌曲[%s]所属榜单【%s】,排行【%s】 下载完毕,存贮在本地地址为[%s]',songname,RankType,rank,songnamepath);
	});
}

function downloadsong(uri,songnamepath,songname,rank,RankType,callback){
	fs.access(songnamepath, function (err) {
		if (err) {
			request.head(uri, function(err, res, body){ 
				if (err) { 
					console.log('err: '+ err); 
					console.log('err uri is [%s] ',uri); 
					return false; 
				} 
				console.log('正在下载歌曲[%s] 所属榜单为【%s】,排行为[%s]到本地',songname,RankType,rank);
				request(uri).pipe(fs.createWriteStream(songnamepath,{autoClose:true})).on('close', callback); 
			});
		}else{
			//console.log('歌曲【%s】 所属专辑或者排行【%s】已经存在，无需再次下载',songnamepath,rank);

		} 
	});	
}

function getsongURLdownload(songnamepath,requesturl,rank,RankType) {
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
					if(songUrl){
						downloadsongs(songUrl,songnamepath,songname,rank,RankType);
					}else{
						console.log('songname [%s]解析之后不存在，无法下载',songname);
					}
				}else{
					console.log('songUrl[%s]不存在，歌曲【%s】排行【%s】，所属榜单【%s】无法下载',requesturl,songname,rank,RankType);
				}	
			}
		});
    }
}