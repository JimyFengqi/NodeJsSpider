const redis = require('redis');
const client = redis.createClient();


song1={
  "rank": 1,
  "songname": "沙漠骆驼",
  "songplayurl": "https://www.xiami.com/song/xNdNB3df465",
  "songid": "1796001263",
  "singer": "展展与罗罗",
  "songurl": "http://www.xiami.com/widget/xml-single/uid/0/sid/1796001263",
  'albumsongs':[{'songname':'123','songurl':'www.123'},{'songname':'123','songurl':'www.123'},{'songname':'123','songurl':'www.123'}]
}
song2={
  "rank": 10,
  "songname": "一百万个可能",
  "songplayurl": "https://www.xiami.com/song/8GsZTDe5093",
  "songid": "1773650237",
  "singer": "Christine Welch(克丽丝叮)",
  "songurl": "http://www.xiami.com/widget/xml-single/uid/0/sid/1773650237"
}
data=[]
data2=[1,2,3,4,5,'a','b','c']
data.push(JSON.stringify(song1))
data.push(JSON.stringify(song2))

console.log(data)
console.log(data2)
insertListInDB('test',data)
insertListInDB('test2',data2)
querylistdata('test')
querylistdata('test2')
getdbnamelist()
deletelistdata('test')
getdbnamelist()

updatelist('test2',1,'test')


//获取当前db中所有的key
function getdbnamelist(){
	// 相当于命令（keys *）, 返回list，包含当前db所有key的名字
	client.keys('*',function(err,val){
		console.log(val);	
		//callback(val);
	});
}


//添加list数据
function insertListInDB(dbname,dbdata){
	client.lpush(dbname,dbdata, function (err) {
		if (err) {
			console.log(err);
		}else{
			console.log('insert[%d] 个数据 in db[%s] finished',dbdata.length,dbname);
		}
	});
}

//查询指定的key中，指定位置的内容
function querylistdata(dbname){
	//0 为起始位置，-1为最后的位置
	client.lrange(dbname,0,-1,function(err,val){
           if(err){
               console.log(err);
           } else{
			   console.log('read data from DB success. data length=[%d]',val.length);
			   console.log(val)
           }
        });
}


//删除
function deletelistdata(dbname){
	//保留指定位置的内容，其他全部删除，所以从0到-1就是一个不删； 从-1到0就是数据全部删除，相当于del key
	client.ltrim(dbname,-1,0,function(err,val){
		console.log('delet all data in db[%s] ，finished val=[%s] ',dbname,val);
	});	
}

//更新指定位置内容
function updatelist(dbname,dbdataindex,newinfo){
	client.lset(dbname,dbdataindex,newinfo,function(err,val){
		console.log('update dbdataindex[%s] data.length=[%s],dbname=【%s】 finished val=[%s] ',dbdataindex,newinfo.length,dbname,val);
	});	
}

