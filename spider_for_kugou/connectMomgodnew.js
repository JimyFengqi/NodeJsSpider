var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var cheerio = require('cheerio');
var path = require('path'); 
var fs = require('fs');
var filenames=new Array();
var keywords='singerurl'
//连接字符串
var DB_URL = 'mongodb://localhost:27017/'


/*
dbclient(DB_URL,'users','users',function(db,client0){
	console.log('client0 connect DB finished ')
	var data={
  
    "singername" : "姜潮",
    "singerurl" : "http://www.kugou.com/yy/singer/home/89163.html"
}
	var  data1 =[{

    "singername" : "帆乃佳",
    "singerurl" : "http://www.kugou.com/yy/singer/home/304438.html"
},{
   
    "singername" : "柏木由紀",
    "singerurl" : "http://www.kugou.com/yy/singer/home/95002.html"
}]
	insertOneData(db,data);
	console.log('insert one data finished')
	insertManyData(db,data1,function(callback){
		console.log('Insert many data finished')
	});
	
	client0.close()
	console.log('client0 close')	
});
*/
/*
dbclient(DB_URL,'users','users',function(db,client){
	console.log('connect DB finished ')
	findAllData(db,function(callback){
			console.log('find data finished');
			console.log('data.length is :%d ',callback.length);
			client.close();
	});
	console.log('client close')
	
});
*/



dbclient(DB_URL,'users','users',function(db,client1){
	console.log('client1 connect DB finished ')
	var urllist=[]
	var datalist=[]
	var clientflag=0
	findkeyData(db,keywords,function(keylist,alllist){
			console.log('find data finished');
			console.log('data.length is :%d ',alllist.length);
		
			urllist=keylist
			datalist=alllist
			
			
		
			for(let i in keylist )
			{
				getsinglist(keylist[i],i,function(datalist){
					console.log('getsinglist [%d] finished , datalist length=[%d] ',i,datalist.length);
					
					var olddata={'singerurl':keylist[i]}
					var newdata={'info':datalist}
					updateKeyData(db,olddata,newdata,function (callback){
						//console.log('update  data finished');
						clientflag=clientflag+1;
						console.log('clientflag = [%d / %d]',clientflag,keylist.length)
						if(clientflag >= keylist.length){
							console.log('this is find finished')
							client1.close()
						}
					});
				});
				
				/*
				var tmpa={'singerurl':keylist[i]}
				alllist[i].a=['new_item','test_'+i]
				delete alllist[i]._id        //更新数据的时候，因为_id是唯一的，所以不能把这个字段带上
				//console.log(tmpa)
				//console.log(alllist[i])
				updateKeyData(db,tmpa,alllist[i],function (callback){
					console.log('update  data finished');
				})
				*/
				
			}
			
	});
	console.log('dbclient to end')
});


function getsinglist(requrl,flag,callback){
	var tmpsinglist=[]
	var tmpsingnamelist=[]
	var datalist=[]
	var getsinglistflag=0
	request(requrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			acquireData(body,function(singlist,singnamelist){
				tmpsinglist.push.apply(tmpsinglist,singlist)
				tmpsingnamelist.push.apply(tmpsingnamelist,singnamelist)
			}); 
		}
		console.log('flag=[%d],tmpsinglist length = [%d]',flag,tmpsinglist.length);
		for(let i=0;i<tmpsinglist.length;i++){
			let time=new Date().getTime();
			let finialsingurl='http://www.kugou.com/yy/index.php?r=play/getdata&hash='+tmpsinglist[i]+'&album_id=0'+'&_='+time
			let finalsingname=tmpsingnamelist[i]
			let tmpdata={'singername':finalsingname,'singinfo':finialsingurl}
			//console.log('Name[%s] url[%s]',finalsingname,finialsingurl);
			
			acquireMusic(finialsingurl,i,function(singkeyinfo){
				datalist.push(singkeyinfo)
				getsinglistflag=getsinglistflag+1;
				console.log('flag=[%d],get real info [%d] finished, getsinglistflag=[%d/%d]',flag,i,getsinglistflag,tmpsinglist.length);
				if(getsinglistflag>= tmpsinglist.length){callback(datalist)}
			});
		}
	});
	
}

function acquireData(data,callfunc) { 
	var $ = cheerio.load(data);
	/*
	songsFolderName  = $('.mbx').find('span').text();
	songsFolderName=songsFolderName+'/'
	console.log("singer info is :"+songsFolderName);
	
	fs.exists(songsFolderName,function(exists){
		if (exists){
			console.log("歌手目录["+songsFolderName+"]已经存在，无需创建");
		}
		else{
			fs.mkdir(songsFolderName,function(err){
				if (err) {
					return console.error(err);
				}
				console.log("歌手目录["+songsFolderName+"]创建成功");
			});
		}
	});
	*/	
	var songlist = $('#song_container input').toArray(); 
	//console.log('songlist length %d',songlist.length);
	var singlist=[]
	var singNameList=[]

	for(let i=0;i<songlist.length;i++){ 
		let info=songlist[i].attribs.value; 
		//console.log("info=songlist[%d].attribs.value:{%s}",i,info);
		let reg=/\|/; 
		
		if(typeof(info) == 'undefined'){	//某些歌曲可能下架了，获取不到地址了
			console.log('curent sing[%d] not defined',i)
			continue
		}else{
			let hash=new Array(); 
			hash=info.split(reg);
			//hash=info.split('|');
			singlist.push(hash[1]); 
			singNameList.push(hash[0]); 
			//console.log("info.split(reg):"+hash);
			//console.log("hash[1] : "+hash[1]); 
			//console.log("hash[0] : "+hash[0]); 
		}
	} 
	console.log('real sing length is [%d]',singlist.length);
	callfunc(singlist,singNameList)
} 

function acquireMusic(url,Num,callback){
	request(url, function (error, response, body) { 
		if (!error && response.statusCode == 200) {
			var info=JSON.parse(body);
			var imgsrc=info.data.play_url
			var tmpdata={'num':Num,'finalurl':url,'paly_url':imgsrc}
			callback(tmpdata)	
		}
	});
}

function dbclient(host,collections,dbs,callback){
	MongoClient.connect(host, {useNewUrlParser:true},function(err, client) {
		var collect=client.db(collections)
		var db = collect.collection(dbs);
		console.log('连接 %s 成功,set collection[%s] and db[%s] finished',host,collections,dbs)
		callback(db,client)
	});
}

//定义函数表达式，用于操作数据库并返回结果，插入数据
var insertManyData = function(db, data,callback) {  
    db.insertMany(data, function(err, result) { 
    //如果存在错误
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }else{
			//调用传入的回调方法，将操作结果返回
			//console.log(result)
			callback(result);
		}
    });
}

//定义函数表达式，用于操作数据库并返回结果，插入数据
var insertOneData = function(db, data) {  
    db.insertOne(data, function(err, result){ 
        if(err){
			//如果存在错误
            console.log('Error:'+ err);
            return;
        }else{
			console.log('One date be insert finished')
		}
    });
}


//定义函数表达式，用于操作数据库并返回结果，更新数据
var updateKeyData = function(db, olddata,newdata,callback) {  
    //获得指定的集合 

    //要修改数据的条件，>=10岁的用户
    //var  where={age:{"$gte":10}};
    //要修改的结果
	console.log(olddata)
	//console.log(newdata)
    var set={$set:newdata};
    db.updateMany(olddata,set, function(err, result) { 
        //如果存在错误
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }else{
			//调用传入的回调方法，将操作结果返回
			callback(result);
		}    
    });
}

//定义函数表达式，用于操作数据库并返回结果，更新数据
var updateData = function(db, callback) {  
    //获得指定的集合 
    var collection = db.collection('users');
    //要修改数据的条件，>=10岁的用户
    var  where={age:{"$gte":10}};
    //要修改的结果
    var set={$set:{age:95}};
    collection.updateMany(where,set, function(err, result) { 
        //如果存在错误
        if(err)
        {
            console.log('Error:'+ err);
            return;
        } 
        //调用传入的回调方法，将操作结果返回
        callback(result);
    });
}

//定义函数表达式，用于操作数据库并返回结果，从所有数据中获取指定元素数据
var findkeyData = function(db,keyword,callback) {  
	var keyvalue=[]
	var allvalue=[]
    db.find().toArray(function(err, result) { 
        //如果存在错误
        if(err){
            console.log('Error:'+ err);
            return;
        }else{
			result.forEach(function(val){
				for(let item in val){
					if(item == keyword){
						console.log(val[item]);
						//console.log(val);
						keyvalue.push(val[item]);
						allvalue.push(val);
					}	
				}	
			});    
		}
		console.log('get keyvalue list finished');
		//console.log(allvalue);
		callback(keyvalue,allvalue);
    });	
}


//定义函数表达式，用于操作数据库并返回结果，查询数据
var findAllData = function(db,callback) {  
    db.find().toArray(function(err, result) { 
        //如果存在错误
        if(err)
        {
            console.log('Error:'+ err);
            return;
        } 
        callback(result);
    });
}

//定义函数表达式，用于操作数据库并返回结果，删除数据
var removeData = function(db, callback) {  
    //获得指定的集合 
    var collection = db.collection('users');
    //要删除数据的条件，_id>2的用户删除
    var  where={_id:{"$gt":2}};
    collection.remove(where,function(err, result) { 
        //如果存在错误
        if(err)
        {
            console.log('Error:'+ err);
            return;
        } 
        //调用传入的回调方法，将操作结果返回
        callback(result);
    });
}