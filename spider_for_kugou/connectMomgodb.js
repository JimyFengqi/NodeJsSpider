var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var cheerio = require('cheerio');
var path = require('path'); 
var fs = require('fs');
var filenames=new Array();

//连接字符串
//var DB_CONN_STR = {'mongodb://localhost:27017/users':true}
var DB_CONN_STR = 'mongodb://localhost:27017/'
var singerlist=[]
var listUrl=new Array(); 

var flag=0
//使用客户端连接数据，并指定完成时的回调方法
MongoClient.connect(DB_CONN_STR, {useNewUrlParser:true},function(err, client) {
    console.log("连接成功！");
    //执行插入数据操作，调用自定义方法
	var collection=client.db('users')
	//获得指定的集合 
    var db = collection.collection('users');
	var newdata=[]
	
		
	//var data = [{"name":'rose',"age":21},{"name":'mark',"age":22},{'num':10}];
	//var data = {"name":'rose',"age":21};//,{"name":'mark',"age":22},{'num':10}];
	var  data ={
    "_id" : 19,
    "singername" : "阿斯满",
    "singerurl" : "http://www.kugou.com/yy/singer/home/91868.html"
};
	//console.log(data)
	findData(db,function(result) {
        //显示结果
		console.log('result length is '+result.length)
		newresult=result
		result.forEach(function(val){
			for(let item in val){
				if(item == 'singerurl'){
					console.log(val[item])
					singerlist.push(val[item])
				}	
			}
		});
		console.log('查询结束');
		console.log(singerlist.length)
		getsingers(singerlist)
		
		if(flag >2){
			client.close();
		}
    });
	console.log('it is time to close db')
	

});
function getsingers(urllist){
	for(url in urllist){
		console.log(urllist[url])
		request(urllist[url], function (error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log('open success, get data')
				acquireData(body); 
			}
			
			for(let i=0;i<listUrl.length;i++){
				let time=new Date().getTime();
				let newurl= 'http://www.kugou.com/yy/index.php?r=play/getdata&hash='+listUrl[i]+'&album_id=0'+'&_='+time
				console.log(newurl)
				
				
				request( newurl, function (error, response, body) { 
					if (!error && response.statusCode == 200) {
						//console.log('get music conetent')
						acquireMusic(body,i); 
					} 
				}); 
				
			}
		});
	}
}
function acquireMusic(data,Num){
	var info=JSON.parse(data);
	var play_url=info.data.play_url; 
	var lyricInfo=info.data.lyrics;
	var filename=filenames[Num]; 
	//console.log("current num is "+Num+"   current song is:"+filename+'imgsrc is ['+play_url+']');
	

	
}
function acquireData(data) { 
	var $ = cheerio.load(data);
	songsFolderName  = $('.mbx').find('span').text();
	songsFolderName=songsFolderName+'/'
	console.log("singer info is :"+songsFolderName);
		
	var songlist = $('#song_container input').toArray(); 

	
	for(let i=0;i<songlist.length;i++){ 
		let info=songlist[i].attribs.value; 
		//console.log("info=songlist[i].attribs.value:"+info);
		let reg=/\|/; 
		let hash=new Array(); 
		//hash=info.split(reg);
		hash=info.split('|');
		//console.log("info.split(reg):"+hash);
		listUrl.push(hash[1]); 
		//console.log("hash[1] : "+hash[1]); 
		//console.log("hash[0] : "+hash[0]); 
		filenames.push(hash[0]); 		
	} 
} 



//定义函数表达式，用于操作数据库并返回结果，插入数据
var insertData = function(db, data,callback) {  
    //获得指定的集合 
    //var collection = db.collection('users');
    //插入数据
    //var data = [{_id:7,"name":'rose',"age":21},{_id:8,"name":'mark',"age":22}];

    //db.insertMany(data, function(err, result) { 
    db.insertOne(data, function(err, result) { 
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

//定义函数表达式，用于操作数据库并返回结果，查询数据
var findData = function(db,callback) {  

    db.find().toArray(function(err, result) { 
        //如果存在错误
        if(err)
        {
            console.log('Error:'+ err);
            return;
        } 
        //调用传入的回调方法，将操作结果返回
		/*
		console.log(result)
		for(let item in result ){
			console.log(item)
			console.log(result[item])
		}
		result.forEach(function(val){
			console.log(val['_id'])
			console.log(val['singername'])
			console.log(val['singerurl'])
		});
		*/	
		
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