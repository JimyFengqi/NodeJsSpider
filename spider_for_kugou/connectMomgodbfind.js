var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var cheerio = require('cheerio');
var path = require('path'); 
var fs = require('fs');
var filenames=new Array();
var keywords='singerurl'
//连接字符串
var DB_URL = 'mongodb://localhost:27017/'



dbclient(DB_URL,'kugou','kugou',function(db,client0){
	console.log('client0 connect DB finished ')
	var data={
  
    "singername" : "姜潮",
    "singerurl" : "http://www.kugou.com/yy/singer/home/89163.html"
}
	var  data1 =[{ _id: 0,
  singername: 'Ailee',
  singerurl: 'http://www.kugou.com/yy/singer/home/84303.html' },
{ _id: 1,
  singername: '安又琪',
  singerurl: 'http://www.kugou.com/yy/singer/home/3963.html' },
{ _id: 2,
  singername: 'Azis',
  singerurl: 'http://www.kugou.com/yy/singer/home/176176.html' },
{ _id: 3,
  singername: 'AI',
  singerurl: 'http://www.kugou.com/yy/singer/home/11153.html' },
{ _id: 4,
  singername: 'ASTRO',
  singerurl: 'http://www.kugou.com/yy/singer/home/289480.html' },
{ _id: 5,
  singername: '安琥',
  singerurl: 'http://www.kugou.com/yy/singer/home/8.html' },
{ _id: 6,
  singername: 'AWM',
  singerurl: 'http://www.kugou.com/yy/singer/home/769529.html' },
{ _id: 7,
  singername: 'Amy Chanrich',
  singerurl: 'http://www.kugou.com/yy/singer/home/178235.html' },
{ _id: 8,
  singername: '安全着陆',
  singerurl: 'http://www.kugou.com/yy/singer/home/716781.html' },
{ _id: 9,
  singername: '阿影',
  singerurl: 'http://www.kugou.com/yy/singer/home/179916.html' },
{ _id: 10,
  singername: 'After School',
  singerurl: 'http://www.kugou.com/yy/singer/home/18413.html' },
{ _id: 11,
  singername: '阿吉太组合',
  singerurl: 'http://www.kugou.com/yy/singer/home/90187.html' },
{ _id: 12,
  singername: '安然',
  singerurl: 'http://www.kugou.com/yy/singer/home/638026.html' },
{ _id: 13,
  singername: 'Alizée',
  singerurl: 'http://www.kugou.com/yy/singer/home/36368.html' },
{ _id: 14,
  singername: 'AC/DC',
  singerurl: 'http://www.kugou.com/yy/singer/home/68022.html' },
{ _id: 15,
  singername: '傲日其愣',
  singerurl: 'http://www.kugou.com/yy/singer/home/560022.html' },
{ _id: 16,
  singername: '阿雅',
  singerurl: 'http://www.kugou.com/yy/singer/home/3960.html' },
{ _id: 17,
  singername: 'Adam Lambert',
  singerurl: 'http://www.kugou.com/yy/singer/home/19821.html' },
{ _id: 18,
  singername: 'Acreix',
  singerurl: 'http://www.kugou.com/yy/singer/home/533473.html' },
{ _id: 19,
  singername: '阿斯满',
  singerurl: 'http://www.kugou.com/yy/singer/home/91868.html' }]
	//insertOneData(db,data);
	//console.log('insert one data finished')
	insertManyData(db,data1,function(callback){
		console.log('Insert many data finished')
	});
	
	client0.close()
	console.log('client0 close')	
});


/*
dbclient(DB_URL,'users','users',function(db,client){
	console.log('connect DB finished ')
	findkeyData(db,'singername',function(callback){
			console.log('find data finished');
			//console.log('data.length is :%d ',callback.length);
			client.close();
	});
	console.log('client close')
	
});
*/


/*
dbclient(DB_URL,'kugou','kugou',function(db,client1){
	console.log('client1 connect DB finished ')

	var clientflag=0
	findAllData(db,function(callback) {  
		console.log('data length is[%d]'.callback.length);
		client1.close();
	});
	console.log('dbclient to end')
	
});
*/


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
					console.log(val)
					if(item == keyword){
						//console.log(val[item]);
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
		for(let i in result){
			if(i<20){			console.log(result[i])}
		}
		console.log(result.length)
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