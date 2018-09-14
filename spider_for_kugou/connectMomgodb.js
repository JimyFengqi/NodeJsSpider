var MongoClient = require('mongodb').MongoClient;


//连接字符串
//var DB_CONN_STR = {'mongodb://localhost:27017/users':true}
var DB_CONN_STR = 'mongodb://localhost:27017/'

//使用客户端连接数据，并指定完成时的回调方法
MongoClient.connect(DB_CONN_STR, {useNewUrlParser:true},function(err, client) {
    console.log("连接成功！");
    //执行插入数据操作，调用自定义方法
	var collection=client.db('users')
	//获得指定的集合 
    var db = collection.collection('users');

	
		
	//var data = [{"name":'rose',"age":21},{"name":'mark',"age":22},{'num':10}];
	//var data = [{"name":'rose',"age":21}];//,{"name":'mark',"age":22},{'num':10}];
	var data=[ { singername: 'Alan Walker',
    singerurl: 'http://www.kugou.com/yy/singer/home/178240.html' },
  { singername: '阿杜',
    singerurl: 'http://www.kugou.com/yy/singer/home/2.html' },
  { singername: '艾辰',
    singerurl: 'http://www.kugou.com/yy/singer/home/628633.html' },
  { singername: '艾热',
    singerurl: 'http://www.kugou.com/yy/singer/home/180348.html' },
  { singername: '阿里郎',
    singerurl: 'http://www.kugou.com/yy/singer/home/7151.html' },
  { singername: '安东阳',
    singerurl: 'http://www.kugou.com/yy/singer/home/82.html' },
  { singername: '安与骑兵',
    singerurl: 'http://www.kugou.com/yy/singer/home/84588.html' },
  { singername: 'A-Lin',
    singerurl: 'http://www.kugou.com/yy/singer/home/3956.html' },
  { singername: '阿宝',
    singerurl: 'http://www.kugou.com/yy/singer/home/5.html' },
  { singername: 'Avril Lavigne',
    singerurl: 'http://www.kugou.com/yy/singer/home/36363.html' },
  { singername: '阿涵',
    singerurl: 'http://www.kugou.com/yy/singer/home/198976.html' },
  { singername: 'Adele',
    singerurl: 'http://www.kugou.com/yy/singer/home/36365.html' },
  { singername: '阿桑',
    singerurl: 'http://www.kugou.com/yy/singer/home/3954.html' },
  { singername: '阿悄',
    singerurl: 'http://www.kugou.com/yy/singer/home/4005.html' },
  { singername: 'Angelababy',
    singerurl: 'http://www.kugou.com/yy/singer/home/4003.html' },
  { singername: '阿细',
    singerurl: 'http://www.kugou.com/yy/singer/home/182316.html' },
  { singername: '艾福杰尼',
    singerurl: 'http://www.kugou.com/yy/singer/home/180345.html' },
  { singername: 'AOA',
    singerurl: 'http://www.kugou.com/yy/singer/home/85137.html' },
  { singername: 'Akon',
    singerurl: 'http://www.kugou.com/yy/singer/home/19819.html' },
  { singername: 'Apink',
    singerurl: 'http://www.kugou.com/yy/singer/home/84465.html' },
  { singername: '阿鲁阿卓',
    singerurl: 'http://www.kugou.com/yy/singer/home/3993.html' },
  { singername: '艾歌',
    singerurl: 'http://www.kugou.com/yy/singer/home/4014.html' },
  { singername: 'AGA',
    singerurl: 'http://www.kugou.com/yy/singer/home/88770.html' },
  { singername: '阿木',
    singerurl: 'http://www.kugou.com/yy/singer/home/9.html' },
  { singername: '阿牛',
    singerurl: 'http://www.kugou.com/yy/singer/home/3.html' },
  { singername: '安苏羽',
    singerurl: 'http://www.kugou.com/yy/singer/home/87264.html' },
  { singername: '阿冷',
    singerurl: 'http://www.kugou.com/yy/singer/home/643262.html' },
  { singername: 'Avicii',
    singerurl: 'http://www.kugou.com/yy/singer/home/86133.html' },
  { singername: '阿肆',
    singerurl: 'http://www.kugou.com/yy/singer/home/91599.html' },
  { singername: 'A',
    singerurl: 'http://www.kugou.com/yy/singer/home/171085.html' },
  { singername: '阿权',
    singerurl: 'http://www.kugou.com/yy/singer/home/87523.html' },
  { singername: '奥杰阿格',
    singerurl: 'http://www.kugou.com/yy/singer/home/92246.html' },
  { singername: '阿幼朵',
    singerurl: 'http://www.kugou.com/yy/singer/home/3973.html' },
  { singername: '爱乐团王超',
    singerurl: 'http://www.kugou.com/yy/singer/home/7144.html' },
  { singername: '阿光',
    singerurl: 'http://www.kugou.com/yy/singer/home/194110.html' },
  { singername: 'Ariana Grande',
    singerurl: 'http://www.kugou.com/yy/singer/home/90471.html' },
  { singername: 'ANU',
    singerurl: 'http://www.kugou.com/yy/singer/home/551201.html' },
  { singername: '安七炫',
    singerurl: 'http://www.kugou.com/yy/singer/home/16272.html' },
  { singername: '阿兰',
    singerurl: 'http://www.kugou.com/yy/singer/home/3955.html' },
  { singername: '安室奈美恵',
    singerurl: 'http://www.kugou.com/yy/singer/home/11140.html' },
  { singername: '阿夏',
    singerurl: 'http://www.kugou.com/yy/singer/home/88176.html' },
  { singername: '安可儿',
    singerurl: 'http://www.kugou.com/yy/singer/home/175312.html' },
  { singername: 'Aimer',
    singerurl: 'http://www.kugou.com/yy/singer/home/11301.html' },
  { singername: 'A.N.JELL',
    singerurl: 'http://www.kugou.com/yy/singer/home/154587.html' },
  { singername: '安悦溪',
    singerurl: 'http://www.kugou.com/yy/singer/home/198652.html' },
  { singername: '阿泱',
    singerurl: 'http://www.kugou.com/yy/singer/home/642965.html' },
  { singername: 'AKB48',
    singerurl: 'http://www.kugou.com/yy/singer/home/13100.html' },
  { singername: '阿吉仔',
    singerurl: 'http://www.kugou.com/yy/singer/home/18.html' },
  { singername: '暗杠',
    singerurl: 'http://www.kugou.com/yy/singer/home/91849.html' },
  { singername: '阿四龙组合',
    singerurl: 'http://www.kugou.com/yy/singer/home/91824.html' } ];
	
	console.log(data)
	insertData(db,data,function(result) {
        //显示结果
        console.log(result);
 
    });
	client.close();
});



//定义函数表达式，用于操作数据库并返回结果，插入数据
var insertData = function(db, data,callback) {  
    //获得指定的集合 
    //var collection = db.collection('users');
    //插入数据
    //var data = [{_id:7,"name":'rose',"age":21},{_id:8,"name":'mark',"age":22}];

    db.insertMany(data, function(err, result) { 
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
var findData = function(db, callback) {  
    //获得指定的集合 
    var collection = db.collection('users');
    //要查询数据的条件，<=10岁的用户
    var  where={age:{"$lte":10}};
    //要显示的字段
    var set={name:1,age:1};
    collection.find(where,set).toArray(function(err, result) { 
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

//定义函数表达式，用于操作数据库并返回结果，删除数据
var findData = function(db, callback) {  
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