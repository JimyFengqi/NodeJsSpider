var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var cheerio = require('cheerio');
//连接字符串
var DB_URL = 'mongodb://localhost:27017/'

dbclient(DB_URL,'kugou','kugou',function(db,client1){
	console.log('client1 connect DB finished ')
	findAllDataAndupdate(db,client1,function(callback){
			console.log('find data finished');
			/*
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
			}
			*/
			
	});
	console.log('dbclient to end')
});


function getsinglist(requrl,flag,callback){
	var tmpsinglist=[]
	var tmpsingnamelist=[]
	var datalist=[]

	request(requrl, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			acquireData(flag,body,function(singlist,singnamelist){
				tmpsinglist.push.apply(tmpsinglist,singlist)
				tmpsingnamelist.push.apply(tmpsingnamelist,singnamelist)
			}); 
		}
		for(let i=0;i<tmpsinglist.length;i++){
			let time=new Date().getTime();
			let finialsingurl='http://www.kugou.com/yy/index.php?r=play/getdata&hash='+tmpsinglist[i]+'&album_id=0'+'&_='+time
			//console.log('Name[%s] url[%s]',finalsingname,finialsingurl);
			datalist.push({'num':i,'finaurl':finialsingurl})
		}
		callback(datalist)

	});
	
}

function acquireData(flagnum,data,callfunc) { 
	var $ = cheerio.load(data);

	var songlist = $('#song_container input').toArray(); 
	//console.log('songlist length %d',songlist.length);
	var singlist=[]
	var singNameList=[]

	for(let i=0;i<songlist.length;i++){ 
		let info=songlist[i].attribs.value; 
		//console.log("info=songlist[%d].attribs.value:{%s}",i,info);
		let reg=/\|/; 
		
		if(typeof(info) == 'undefined'){	//某些歌曲可能下架了，获取不到地址了
			console.log('numflag[%d],curent sing[%d] not defined',flagnum,i)
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
	console.log('numflag[%d],real sing length is [%d]',flagnum,singlist.length);
	callfunc(singlist,singNameList)
} 
//定义函数表达式，用于操作数据库并返回结果，查询数据
var findAllDataAndupdate = function(db,client,callback) {  
	var keyword='singerurl'
	var clientflag=0
    db.find().toArray(function(err, result) { 
        //如果存在错误
        if(err)
        {
            console.log('Error:'+ err);
            return;
        }else{
			for(let num in result) {
				
				if(num >199 && num < 500){
				console.log('num'+num)
				for(let item in result[num]){
					if(item=='singerurl'){
						getsinglist(result[num][item],num,function(datalist){
							console.log('getsinglist numflag[%d] finished , datalist length=[%d] ',num,datalist.length);
						
							var olddata={'singerurl':result[num][item]}
							var newdata={'info':datalist}
							updateKeyData(db,olddata,newdata,function (callback){
							//console.log('update  data finished');
							clientflag=clientflag+1;
							console.log('clientflag = [%d / %d]',clientflag,result.length)
							if(clientflag >= result.length){
								console.log('this is find finished')
								client.close()
							}
							});
						});
						
					}
					
				}//endfor
				}//endif
			} 
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