var MongoClient = require('mongodb').MongoClient;
var request = require('request');
var cheerio = require('cheerio');
var path = require('path'); 
var fs = require('fs');

var out = fs.createWriteStream('./singerUrllist.txt');

var listUrl=new Array(); 
var filenames=new Array();

var requrl="http://www.kugou.com/yy/singer/index/1-a-1.html";
var headurlbase= 'http://www.kugou.com/yy/singer/index/'
var singerList=[]
var page_Num=0;

var	reqlist=["http://www.kugou.com/yy/singer/index/1-a-1.html", 
	"http://www.kugou.com/yy/singer/index/2-a-1.html", 
	"http://www.kugou.com/yy/singer/index/3-a-1.html", 
	"http://www.kugou.com/yy/singer/index/4-a-1.html", 
	"http://www.kugou.com/yy/singer/index/5-a-1.html", 
	"http://www.kugou.com/yy/singer/index/1-a-2.html", 
	"http://www.kugou.com/yy/singer/index/1-a-3.html", 
	"http://www.kugou.com/yy/singer/index/1-a-4.html", 
	"http://www.kugou.com/yy/singer/index/1-a-5.html", 
	"http://www.kugou.com/yy/singer/index/1-a-6.html", 
	"http://www.kugou.com/yy/singer/index/1-a-7.html", 
	"http://www.kugou.com/yy/singer/index/1-a-8.html", 
	"http://www.kugou.com/yy/singer/index/1-a-9.html", 
	"http://www.kugou.com/yy/singer/index/1-a-10.html", 
	"http://www.kugou.com/yy/singer/index/1-a-11.html", 
	"http://www.kugou.com/yy/singer/index/1-b-1.html", 
	"http://www.kugou.com/yy/singer/index/2-b-1.html", 
	"http://www.kugou.com/yy/singer/index/3-b-1.html", 
	"http://www.kugou.com/yy/singer/index/4-b-1.html", 
	"http://www.kugou.com/yy/singer/index/5-b-1.html", 
	"http://www.kugou.com/yy/singer/index/1-b-2.html", 
	"http://www.kugou.com/yy/singer/index/1-b-3.html", 
	"http://www.kugou.com/yy/singer/index/1-b-4.html", 
	"http://www.kugou.com/yy/singer/index/1-b-5.html", 
	"http://www.kugou.com/yy/singer/index/1-b-6.html", 
	"http://www.kugou.com/yy/singer/index/1-b-7.html", 
	"http://www.kugou.com/yy/singer/index/1-b-8.html", 
	"http://www.kugou.com/yy/singer/index/1-b-9.html", 
	"http://www.kugou.com/yy/singer/index/1-b-10.html", 
	"http://www.kugou.com/yy/singer/index/1-b-11.html", 
	"http://www.kugou.com/yy/singer/index/1-c-1.html", 
	"http://www.kugou.com/yy/singer/index/2-c-1.html", 
	"http://www.kugou.com/yy/singer/index/3-c-1.html", 
	"http://www.kugou.com/yy/singer/index/4-c-1.html", 
	"http://www.kugou.com/yy/singer/index/5-c-1.html", 
	"http://www.kugou.com/yy/singer/index/1-c-2.html", 
	"http://www.kugou.com/yy/singer/index/1-c-3.html", 
	"http://www.kugou.com/yy/singer/index/1-c-4.html", 
	"http://www.kugou.com/yy/singer/index/1-c-5.html", 
	"http://www.kugou.com/yy/singer/index/1-c-6.html", 
	"http://www.kugou.com/yy/singer/index/1-c-7.html", 
	"http://www.kugou.com/yy/singer/index/1-c-8.html", 
	"http://www.kugou.com/yy/singer/index/1-c-9.html", 
	"http://www.kugou.com/yy/singer/index/1-c-10.html", 
	"http://www.kugou.com/yy/singer/index/1-c-11.html", 
	"http://www.kugou.com/yy/singer/index/1-d-1.html", 
	"http://www.kugou.com/yy/singer/index/2-d-1.html", 
	"http://www.kugou.com/yy/singer/index/3-d-1.html", 
	"http://www.kugou.com/yy/singer/index/4-d-1.html", 
	"http://www.kugou.com/yy/singer/index/5-d-1.html", 
	"http://www.kugou.com/yy/singer/index/1-d-2.html", 
	"http://www.kugou.com/yy/singer/index/1-d-3.html", 
	"http://www.kugou.com/yy/singer/index/1-d-4.html", 
	"http://www.kugou.com/yy/singer/index/1-d-5.html", 
	"http://www.kugou.com/yy/singer/index/1-d-6.html", 
	"http://www.kugou.com/yy/singer/index/1-d-7.html", 
	"http://www.kugou.com/yy/singer/index/1-d-8.html", 
	"http://www.kugou.com/yy/singer/index/1-d-9.html", 
	"http://www.kugou.com/yy/singer/index/1-d-10.html", 
	"http://www.kugou.com/yy/singer/index/1-d-11.html", 
	"http://www.kugou.com/yy/singer/index/1-e-1.html", 
	"http://www.kugou.com/yy/singer/index/2-e-1.html", 
	"http://www.kugou.com/yy/singer/index/3-e-1.html", 
	"http://www.kugou.com/yy/singer/index/4-e-1.html", 
	"http://www.kugou.com/yy/singer/index/5-e-1.html", 
	"http://www.kugou.com/yy/singer/index/1-e-2.html", 
	"http://www.kugou.com/yy/singer/index/1-e-3.html", 
	"http://www.kugou.com/yy/singer/index/1-e-4.html", 
	"http://www.kugou.com/yy/singer/index/1-e-5.html", 
	"http://www.kugou.com/yy/singer/index/1-e-6.html", 
	"http://www.kugou.com/yy/singer/index/1-e-7.html", 
	"http://www.kugou.com/yy/singer/index/1-e-8.html", 
	"http://www.kugou.com/yy/singer/index/1-e-9.html", 
	"http://www.kugou.com/yy/singer/index/1-e-10.html", 
	"http://www.kugou.com/yy/singer/index/1-e-11.html", 
	"http://www.kugou.com/yy/singer/index/1-f-1.html", 
	"http://www.kugou.com/yy/singer/index/2-f-1.html", 
	"http://www.kugou.com/yy/singer/index/3-f-1.html", 
	"http://www.kugou.com/yy/singer/index/4-f-1.html", 
	"http://www.kugou.com/yy/singer/index/5-f-1.html", 
	"http://www.kugou.com/yy/singer/index/1-f-2.html", 
	"http://www.kugou.com/yy/singer/index/1-f-3.html", 
	"http://www.kugou.com/yy/singer/index/1-f-4.html", 
	"http://www.kugou.com/yy/singer/index/1-f-5.html", 
	"http://www.kugou.com/yy/singer/index/1-f-6.html", 
	"http://www.kugou.com/yy/singer/index/1-f-7.html", 
	"http://www.kugou.com/yy/singer/index/1-f-8.html", 
	"http://www.kugou.com/yy/singer/index/1-f-9.html", 
	"http://www.kugou.com/yy/singer/index/1-f-10.html", 
	"http://www.kugou.com/yy/singer/index/1-f-11.html", 
	"http://www.kugou.com/yy/singer/index/1-g-1.html", 
	"http://www.kugou.com/yy/singer/index/2-g-1.html", 
	"http://www.kugou.com/yy/singer/index/3-g-1.html", 
	"http://www.kugou.com/yy/singer/index/4-g-1.html", 
	"http://www.kugou.com/yy/singer/index/5-g-1.html", 
	"http://www.kugou.com/yy/singer/index/1-g-2.html", 
	"http://www.kugou.com/yy/singer/index/1-g-3.html", 
	"http://www.kugou.com/yy/singer/index/1-g-4.html", 
	"http://www.kugou.com/yy/singer/index/1-g-5.html", 
	"http://www.kugou.com/yy/singer/index/1-g-6.html", 
	"http://www.kugou.com/yy/singer/index/1-g-7.html", 
	"http://www.kugou.com/yy/singer/index/1-g-8.html", 
	"http://www.kugou.com/yy/singer/index/1-g-9.html", 
	"http://www.kugou.com/yy/singer/index/1-g-10.html", 
	"http://www.kugou.com/yy/singer/index/1-g-11.html", 
	"http://www.kugou.com/yy/singer/index/1-h-1.html", 
	"http://www.kugou.com/yy/singer/index/2-h-1.html", 
	"http://www.kugou.com/yy/singer/index/3-h-1.html", 
	"http://www.kugou.com/yy/singer/index/4-h-1.html", 
	"http://www.kugou.com/yy/singer/index/5-h-1.html", 
	"http://www.kugou.com/yy/singer/index/1-h-2.html", 
	"http://www.kugou.com/yy/singer/index/1-h-3.html", 
	"http://www.kugou.com/yy/singer/index/1-h-4.html", 
	"http://www.kugou.com/yy/singer/index/1-h-5.html", 
	"http://www.kugou.com/yy/singer/index/1-h-6.html", 
	"http://www.kugou.com/yy/singer/index/1-h-7.html", 
	"http://www.kugou.com/yy/singer/index/1-h-8.html", 
	"http://www.kugou.com/yy/singer/index/1-h-9.html", 
	"http://www.kugou.com/yy/singer/index/1-h-10.html", 
	"http://www.kugou.com/yy/singer/index/1-h-11.html", 
	"http://www.kugou.com/yy/singer/index/1-i-1.html", 
	"http://www.kugou.com/yy/singer/index/2-i-1.html", 
	"http://www.kugou.com/yy/singer/index/3-i-1.html", 
	"http://www.kugou.com/yy/singer/index/4-i-1.html", 
	"http://www.kugou.com/yy/singer/index/5-i-1.html", 
	"http://www.kugou.com/yy/singer/index/1-i-2.html", 
	"http://www.kugou.com/yy/singer/index/1-i-3.html", 
	"http://www.kugou.com/yy/singer/index/1-i-4.html", 
	"http://www.kugou.com/yy/singer/index/1-i-5.html", 
	"http://www.kugou.com/yy/singer/index/1-i-6.html", 
	"http://www.kugou.com/yy/singer/index/1-i-7.html", 
	"http://www.kugou.com/yy/singer/index/1-i-8.html", 
	"http://www.kugou.com/yy/singer/index/1-i-9.html", 
	"http://www.kugou.com/yy/singer/index/1-i-10.html", 
	"http://www.kugou.com/yy/singer/index/1-i-11.html", 
	"http://www.kugou.com/yy/singer/index/1-j-1.html", 
	"http://www.kugou.com/yy/singer/index/2-j-1.html", 
	"http://www.kugou.com/yy/singer/index/3-j-1.html", 
	"http://www.kugou.com/yy/singer/index/4-j-1.html", 
	"http://www.kugou.com/yy/singer/index/5-j-1.html", 
	"http://www.kugou.com/yy/singer/index/1-j-2.html", 
	"http://www.kugou.com/yy/singer/index/1-j-3.html", 
	"http://www.kugou.com/yy/singer/index/1-j-4.html", 
	"http://www.kugou.com/yy/singer/index/1-j-5.html", 
	"http://www.kugou.com/yy/singer/index/1-j-6.html", 
	"http://www.kugou.com/yy/singer/index/1-j-7.html", 
	"http://www.kugou.com/yy/singer/index/1-j-8.html", 
	"http://www.kugou.com/yy/singer/index/1-j-9.html", 
	"http://www.kugou.com/yy/singer/index/1-j-10.html", 
	"http://www.kugou.com/yy/singer/index/1-j-11.html", 
	"http://www.kugou.com/yy/singer/index/1-k-1.html", 
	"http://www.kugou.com/yy/singer/index/2-k-1.html", 
	"http://www.kugou.com/yy/singer/index/3-k-1.html", 
	"http://www.kugou.com/yy/singer/index/4-k-1.html", 
	"http://www.kugou.com/yy/singer/index/5-k-1.html", 
	"http://www.kugou.com/yy/singer/index/1-k-2.html", 
	"http://www.kugou.com/yy/singer/index/1-k-3.html", 
	"http://www.kugou.com/yy/singer/index/1-k-4.html", 
	"http://www.kugou.com/yy/singer/index/1-k-5.html", 
	"http://www.kugou.com/yy/singer/index/1-k-6.html", 
	"http://www.kugou.com/yy/singer/index/1-k-7.html", 
	"http://www.kugou.com/yy/singer/index/1-k-8.html", 
	"http://www.kugou.com/yy/singer/index/1-k-9.html", 
	"http://www.kugou.com/yy/singer/index/1-k-10.html", 
	"http://www.kugou.com/yy/singer/index/1-k-11.html", 
	"http://www.kugou.com/yy/singer/index/1-l-1.html", 
	"http://www.kugou.com/yy/singer/index/2-l-1.html", 
	"http://www.kugou.com/yy/singer/index/3-l-1.html", 
	"http://www.kugou.com/yy/singer/index/4-l-1.html", 
	"http://www.kugou.com/yy/singer/index/5-l-1.html", 
	"http://www.kugou.com/yy/singer/index/1-l-2.html", 
	"http://www.kugou.com/yy/singer/index/1-l-3.html", 
	"http://www.kugou.com/yy/singer/index/1-l-4.html", 
	"http://www.kugou.com/yy/singer/index/1-l-5.html", 
	"http://www.kugou.com/yy/singer/index/1-l-6.html", 
	"http://www.kugou.com/yy/singer/index/1-l-7.html", 
	"http://www.kugou.com/yy/singer/index/1-l-8.html", 
	"http://www.kugou.com/yy/singer/index/1-l-9.html", 
	"http://www.kugou.com/yy/singer/index/1-l-10.html", 
	"http://www.kugou.com/yy/singer/index/1-l-11.html", 
	"http://www.kugou.com/yy/singer/index/1-m-1.html", 
	"http://www.kugou.com/yy/singer/index/2-m-1.html", 
	"http://www.kugou.com/yy/singer/index/3-m-1.html", 
	"http://www.kugou.com/yy/singer/index/4-m-1.html", 
	"http://www.kugou.com/yy/singer/index/5-m-1.html", 
	"http://www.kugou.com/yy/singer/index/1-m-2.html", 
	"http://www.kugou.com/yy/singer/index/1-m-3.html", 
	"http://www.kugou.com/yy/singer/index/1-m-4.html", 
	"http://www.kugou.com/yy/singer/index/1-m-5.html", 
	"http://www.kugou.com/yy/singer/index/1-m-6.html", 
	"http://www.kugou.com/yy/singer/index/1-m-7.html", 
	"http://www.kugou.com/yy/singer/index/1-m-8.html", 
	"http://www.kugou.com/yy/singer/index/1-m-9.html", 
	"http://www.kugou.com/yy/singer/index/1-m-10.html", 
	"http://www.kugou.com/yy/singer/index/1-m-11.html", 
	"http://www.kugou.com/yy/singer/index/1-n-1.html", 
	"http://www.kugou.com/yy/singer/index/2-n-1.html", 
	"http://www.kugou.com/yy/singer/index/3-n-1.html", 
	"http://www.kugou.com/yy/singer/index/4-n-1.html", 
	"http://www.kugou.com/yy/singer/index/5-n-1.html", 
	"http://www.kugou.com/yy/singer/index/1-n-2.html", 
	"http://www.kugou.com/yy/singer/index/1-n-3.html", 
	"http://www.kugou.com/yy/singer/index/1-n-4.html", 
	"http://www.kugou.com/yy/singer/index/1-n-5.html", 
	"http://www.kugou.com/yy/singer/index/1-n-6.html", 
	"http://www.kugou.com/yy/singer/index/1-n-7.html", 
	"http://www.kugou.com/yy/singer/index/1-n-8.html", 
	"http://www.kugou.com/yy/singer/index/1-n-9.html", 
	"http://www.kugou.com/yy/singer/index/1-n-10.html", 
	"http://www.kugou.com/yy/singer/index/1-n-11.html", 
	"http://www.kugou.com/yy/singer/index/1-o-1.html", 
	"http://www.kugou.com/yy/singer/index/2-o-1.html", 
	"http://www.kugou.com/yy/singer/index/3-o-1.html", 
	"http://www.kugou.com/yy/singer/index/4-o-1.html", 
	"http://www.kugou.com/yy/singer/index/5-o-1.html", 
	"http://www.kugou.com/yy/singer/index/1-o-2.html", 
	"http://www.kugou.com/yy/singer/index/1-o-3.html", 
	"http://www.kugou.com/yy/singer/index/1-o-4.html", 
	"http://www.kugou.com/yy/singer/index/1-o-5.html", 
	"http://www.kugou.com/yy/singer/index/1-o-6.html", 
	"http://www.kugou.com/yy/singer/index/1-o-7.html", 
	"http://www.kugou.com/yy/singer/index/1-o-8.html", 
	"http://www.kugou.com/yy/singer/index/1-o-9.html", 
	"http://www.kugou.com/yy/singer/index/1-o-10.html", 
	"http://www.kugou.com/yy/singer/index/1-o-11.html", 
	"http://www.kugou.com/yy/singer/index/1-p-1.html", 
	"http://www.kugou.com/yy/singer/index/2-p-1.html", 
	"http://www.kugou.com/yy/singer/index/3-p-1.html", 
	"http://www.kugou.com/yy/singer/index/4-p-1.html", 
	"http://www.kugou.com/yy/singer/index/5-p-1.html", 
	"http://www.kugou.com/yy/singer/index/1-p-2.html", 
	"http://www.kugou.com/yy/singer/index/1-p-3.html", 
	"http://www.kugou.com/yy/singer/index/1-p-4.html", 
	"http://www.kugou.com/yy/singer/index/1-p-5.html", 
	"http://www.kugou.com/yy/singer/index/1-p-6.html", 
	"http://www.kugou.com/yy/singer/index/1-p-7.html", 
	"http://www.kugou.com/yy/singer/index/1-p-8.html", 
	"http://www.kugou.com/yy/singer/index/1-p-9.html", 
	"http://www.kugou.com/yy/singer/index/1-p-10.html", 
	"http://www.kugou.com/yy/singer/index/1-p-11.html", 
	"http://www.kugou.com/yy/singer/index/1-q-1.html", 
	"http://www.kugou.com/yy/singer/index/2-q-1.html", 
	"http://www.kugou.com/yy/singer/index/3-q-1.html", 
	"http://www.kugou.com/yy/singer/index/4-q-1.html", 
	"http://www.kugou.com/yy/singer/index/5-q-1.html", 
	"http://www.kugou.com/yy/singer/index/1-q-2.html", 
	"http://www.kugou.com/yy/singer/index/1-q-3.html", 
	"http://www.kugou.com/yy/singer/index/1-q-4.html", 
	"http://www.kugou.com/yy/singer/index/1-q-5.html", 
	"http://www.kugou.com/yy/singer/index/1-q-6.html", 
	"http://www.kugou.com/yy/singer/index/1-q-7.html", 
	"http://www.kugou.com/yy/singer/index/1-q-8.html", 
	"http://www.kugou.com/yy/singer/index/1-q-9.html", 
	"http://www.kugou.com/yy/singer/index/1-q-10.html", 
	"http://www.kugou.com/yy/singer/index/1-q-11.html", 
	"http://www.kugou.com/yy/singer/index/1-r-1.html", 
	"http://www.kugou.com/yy/singer/index/2-r-1.html", 
	"http://www.kugou.com/yy/singer/index/3-r-1.html", 
	"http://www.kugou.com/yy/singer/index/4-r-1.html", 
	"http://www.kugou.com/yy/singer/index/5-r-1.html", 
	"http://www.kugou.com/yy/singer/index/1-r-2.html", 
	"http://www.kugou.com/yy/singer/index/1-r-3.html", 
	"http://www.kugou.com/yy/singer/index/1-r-4.html", 
	"http://www.kugou.com/yy/singer/index/1-r-5.html", 
	"http://www.kugou.com/yy/singer/index/1-r-6.html", 
	"http://www.kugou.com/yy/singer/index/1-r-7.html", 
	"http://www.kugou.com/yy/singer/index/1-r-8.html", 
	"http://www.kugou.com/yy/singer/index/1-r-9.html", 
	"http://www.kugou.com/yy/singer/index/1-r-10.html", 
	"http://www.kugou.com/yy/singer/index/1-r-11.html", 
	"http://www.kugou.com/yy/singer/index/1-s-1.html", 
	"http://www.kugou.com/yy/singer/index/2-s-1.html", 
	"http://www.kugou.com/yy/singer/index/3-s-1.html", 
	"http://www.kugou.com/yy/singer/index/4-s-1.html", 
	"http://www.kugou.com/yy/singer/index/5-s-1.html", 
	"http://www.kugou.com/yy/singer/index/1-s-2.html", 
	"http://www.kugou.com/yy/singer/index/1-s-3.html", 
	"http://www.kugou.com/yy/singer/index/1-s-4.html", 
	"http://www.kugou.com/yy/singer/index/1-s-5.html", 
	"http://www.kugou.com/yy/singer/index/1-s-6.html", 
	"http://www.kugou.com/yy/singer/index/1-s-7.html", 
	"http://www.kugou.com/yy/singer/index/1-s-8.html", 
	"http://www.kugou.com/yy/singer/index/1-s-9.html", 
	"http://www.kugou.com/yy/singer/index/1-s-10.html", 
	"http://www.kugou.com/yy/singer/index/1-s-11.html", 
	"http://www.kugou.com/yy/singer/index/1-t-1.html", 
	"http://www.kugou.com/yy/singer/index/2-t-1.html", 
	"http://www.kugou.com/yy/singer/index/3-t-1.html", 
	"http://www.kugou.com/yy/singer/index/4-t-1.html", 
	"http://www.kugou.com/yy/singer/index/5-t-1.html", 
	"http://www.kugou.com/yy/singer/index/1-t-2.html", 
	"http://www.kugou.com/yy/singer/index/1-t-3.html", 
	"http://www.kugou.com/yy/singer/index/1-t-4.html", 
	"http://www.kugou.com/yy/singer/index/1-t-5.html", 
	"http://www.kugou.com/yy/singer/index/1-t-6.html", 
	"http://www.kugou.com/yy/singer/index/1-t-7.html", 
	"http://www.kugou.com/yy/singer/index/1-t-8.html", 
	"http://www.kugou.com/yy/singer/index/1-t-9.html", 
	"http://www.kugou.com/yy/singer/index/1-t-10.html", 
	"http://www.kugou.com/yy/singer/index/1-t-11.html", 
	"http://www.kugou.com/yy/singer/index/1-u-1.html", 
	"http://www.kugou.com/yy/singer/index/2-u-1.html", 
	"http://www.kugou.com/yy/singer/index/3-u-1.html", 
	"http://www.kugou.com/yy/singer/index/4-u-1.html", 
	"http://www.kugou.com/yy/singer/index/5-u-1.html", 
	"http://www.kugou.com/yy/singer/index/1-u-2.html", 
	"http://www.kugou.com/yy/singer/index/1-u-3.html", 
	"http://www.kugou.com/yy/singer/index/1-u-4.html", 
	"http://www.kugou.com/yy/singer/index/1-u-5.html", 
	"http://www.kugou.com/yy/singer/index/1-u-6.html", 
	"http://www.kugou.com/yy/singer/index/1-u-7.html", 
	"http://www.kugou.com/yy/singer/index/1-u-8.html", 
	"http://www.kugou.com/yy/singer/index/1-u-9.html", 
	"http://www.kugou.com/yy/singer/index/1-u-10.html", 
	"http://www.kugou.com/yy/singer/index/1-u-11.html", 
	"http://www.kugou.com/yy/singer/index/1-v-1.html", 
	"http://www.kugou.com/yy/singer/index/2-v-1.html", 
	"http://www.kugou.com/yy/singer/index/3-v-1.html", 
	"http://www.kugou.com/yy/singer/index/4-v-1.html", 
	"http://www.kugou.com/yy/singer/index/5-v-1.html", 
	"http://www.kugou.com/yy/singer/index/1-v-2.html", 
	"http://www.kugou.com/yy/singer/index/1-v-3.html", 
	"http://www.kugou.com/yy/singer/index/1-v-4.html", 
	"http://www.kugou.com/yy/singer/index/1-v-5.html", 
	"http://www.kugou.com/yy/singer/index/1-v-6.html", 
	"http://www.kugou.com/yy/singer/index/1-v-7.html", 
	"http://www.kugou.com/yy/singer/index/1-v-8.html", 
	"http://www.kugou.com/yy/singer/index/1-v-9.html", 
	"http://www.kugou.com/yy/singer/index/1-v-10.html", 
	"http://www.kugou.com/yy/singer/index/1-v-11.html", 
	"http://www.kugou.com/yy/singer/index/1-w-1.html", 
	"http://www.kugou.com/yy/singer/index/2-w-1.html", 
	"http://www.kugou.com/yy/singer/index/3-w-1.html", 
	"http://www.kugou.com/yy/singer/index/4-w-1.html", 
	"http://www.kugou.com/yy/singer/index/5-w-1.html", 
	"http://www.kugou.com/yy/singer/index/1-w-2.html", 
	"http://www.kugou.com/yy/singer/index/1-w-3.html", 
	"http://www.kugou.com/yy/singer/index/1-w-4.html", 
	"http://www.kugou.com/yy/singer/index/1-w-5.html", 
	"http://www.kugou.com/yy/singer/index/1-w-6.html", 
	"http://www.kugou.com/yy/singer/index/1-w-7.html", 
	"http://www.kugou.com/yy/singer/index/1-w-8.html", 
	"http://www.kugou.com/yy/singer/index/1-w-9.html", 
	"http://www.kugou.com/yy/singer/index/1-w-10.html", 
	"http://www.kugou.com/yy/singer/index/1-w-11.html", 
	"http://www.kugou.com/yy/singer/index/1-x-1.html", 
	"http://www.kugou.com/yy/singer/index/2-x-1.html", 
	"http://www.kugou.com/yy/singer/index/3-x-1.html", 
	"http://www.kugou.com/yy/singer/index/4-x-1.html", 
	"http://www.kugou.com/yy/singer/index/5-x-1.html", 
	"http://www.kugou.com/yy/singer/index/1-x-2.html", 
	"http://www.kugou.com/yy/singer/index/1-x-3.html", 
	"http://www.kugou.com/yy/singer/index/1-x-4.html", 
	"http://www.kugou.com/yy/singer/index/1-x-5.html", 
	"http://www.kugou.com/yy/singer/index/1-x-6.html", 
	"http://www.kugou.com/yy/singer/index/1-x-7.html", 
	"http://www.kugou.com/yy/singer/index/1-x-8.html", 
	"http://www.kugou.com/yy/singer/index/1-x-9.html", 
	"http://www.kugou.com/yy/singer/index/1-x-10.html", 
	"http://www.kugou.com/yy/singer/index/1-x-11.html", 
	"http://www.kugou.com/yy/singer/index/1-y-1.html", 
	"http://www.kugou.com/yy/singer/index/2-y-1.html", 
	"http://www.kugou.com/yy/singer/index/3-y-1.html", 
	"http://www.kugou.com/yy/singer/index/4-y-1.html", 
	"http://www.kugou.com/yy/singer/index/5-y-1.html", 
	"http://www.kugou.com/yy/singer/index/1-y-2.html", 
	"http://www.kugou.com/yy/singer/index/1-y-3.html", 
	"http://www.kugou.com/yy/singer/index/1-y-4.html", 
	"http://www.kugou.com/yy/singer/index/1-y-5.html", 
	"http://www.kugou.com/yy/singer/index/1-y-6.html", 
	"http://www.kugou.com/yy/singer/index/1-y-7.html", 
	"http://www.kugou.com/yy/singer/index/1-y-8.html", 
	"http://www.kugou.com/yy/singer/index/1-y-9.html", 
	"http://www.kugou.com/yy/singer/index/1-y-10.html", 
	"http://www.kugou.com/yy/singer/index/1-y-11.html", 
	"http://www.kugou.com/yy/singer/index/1-z-1.html", 
	"http://www.kugou.com/yy/singer/index/2-z-1.html", 
	"http://www.kugou.com/yy/singer/index/3-z-1.html", 
	"http://www.kugou.com/yy/singer/index/4-z-1.html", 
	"http://www.kugou.com/yy/singer/index/5-z-1.html", 
	"http://www.kugou.com/yy/singer/index/1-z-2.html", 
	"http://www.kugou.com/yy/singer/index/1-z-3.html", 
	"http://www.kugou.com/yy/singer/index/1-z-4.html", 
	"http://www.kugou.com/yy/singer/index/1-z-5.html", 
	"http://www.kugou.com/yy/singer/index/1-z-6.html", 
	"http://www.kugou.com/yy/singer/index/1-z-7.html", 
	"http://www.kugou.com/yy/singer/index/1-z-8.html", 
	"http://www.kugou.com/yy/singer/index/1-z-9.html", 
	"http://www.kugou.com/yy/singer/index/1-z-10.html", 
	"http://www.kugou.com/yy/singer/index/1-z-11.html", 
	"http://www.kugou.com/yy/singer/index/2-b-3.html", 
	"http://www.kugou.com/yy/singer/index/3-b-3.html", 
	"http://www.kugou.com/yy/singer/index/4-b-3.html", 
	"http://www.kugou.com/yy/singer/index/5-b-3.html", 
	"http://www.kugou.com/yy/singer/index/2-k-4.html", 
	"http://www.kugou.com/yy/singer/index/2-k-10.html", 
	"http://www.kugou.com/yy/singer/index/3-k-10.html", 
	"http://www.kugou.com/yy/singer/index/2-c-4.html", 
	"http://www.kugou.com/yy/singer/index/3-c-4.html", 
	"http://www.kugou.com/yy/singer/index/4-c-4.html", 
	"http://www.kugou.com/yy/singer/index/2-a-11.html", 
	"http://www.kugou.com/yy/singer/index/3-a-11.html", 
	"http://www.kugou.com/yy/singer/index/2-b-8.html", 
	"http://www.kugou.com/yy/singer/index/3-b-8.html", 
	"http://www.kugou.com/yy/singer/index/4-b-8.html", 
	"http://www.kugou.com/yy/singer/index/5-b-8.html", 
	"http://www.kugou.com/yy/singer/index/2-n-9.html", 
	"http://www.kugou.com/yy/singer/index/3-n-9.html", 
	"http://www.kugou.com/yy/singer/index/4-n-9.html", 
	"http://www.kugou.com/yy/singer/index/2-k-6.html", 
	"http://www.kugou.com/yy/singer/index/2-m-3.html", 
	"http://www.kugou.com/yy/singer/index/3-m-3.html", 
	"http://www.kugou.com/yy/singer/index/4-m-3.html", 
	"http://www.kugou.com/yy/singer/index/5-m-3.html", 
	"http://www.kugou.com/yy/singer/index/2-o-8.html", 
	"http://www.kugou.com/yy/singer/index/3-o-8.html", 
	"http://www.kugou.com/yy/singer/index/2-l-9.html", 
	"http://www.kugou.com/yy/singer/index/3-l-9.html", 
	"http://www.kugou.com/yy/singer/index/4-l-9.html", 
	"http://www.kugou.com/yy/singer/index/5-l-9.html", 
	"http://www.kugou.com/yy/singer/index/2-n-10.html", 
	"http://www.kugou.com/yy/singer/index/3-n-10.html", 
	"http://www.kugou.com/yy/singer/index/4-n-10.html", 
	"http://www.kugou.com/yy/singer/index/2-a-3.html", 
	"http://www.kugou.com/yy/singer/index/3-a-3.html", 
	"http://www.kugou.com/yy/singer/index/4-a-3.html", 
	"http://www.kugou.com/yy/singer/index/5-a-3.html", 
	"http://www.kugou.com/yy/singer/index/2-q-4.html", 
	"http://www.kugou.com/yy/singer/index/2-r-3.html", 
	"http://www.kugou.com/yy/singer/index/3-r-3.html", 
	"http://www.kugou.com/yy/singer/index/2-b-11.html", 
	"http://www.kugou.com/yy/singer/index/2-a-9.html", 
	"http://www.kugou.com/yy/singer/index/3-a-9.html", 
	"http://www.kugou.com/yy/singer/index/4-a-9.html", 
	"http://www.kugou.com/yy/singer/index/5-a-9.html", 
	"http://www.kugou.com/yy/singer/index/2-f-7.html", 
	"http://www.kugou.com/yy/singer/index/2-d-3.html", 
	"http://www.kugou.com/yy/singer/index/3-d-3.html", 
	"http://www.kugou.com/yy/singer/index/4-d-3.html", 
	"http://www.kugou.com/yy/singer/index/5-d-3.html", 
	"http://www.kugou.com/yy/singer/index/2-e-2.html", 
	"http://www.kugou.com/yy/singer/index/3-e-2.html", 
	"http://www.kugou.com/yy/singer/index/2-z-4.html", 
	"http://www.kugou.com/yy/singer/index/3-z-4.html", 
	"http://www.kugou.com/yy/singer/index/4-z-4.html", 
	"http://www.kugou.com/yy/singer/index/2-g-2.html", 
	"http://www.kugou.com/yy/singer/index/3-g-2.html", 
	"http://www.kugou.com/yy/singer/index/4-g-2.html", 
	"http://www.kugou.com/yy/singer/index/5-g-2.html", 
	"http://www.kugou.com/yy/singer/index/2-h-4.html", 
	"http://www.kugou.com/yy/singer/index/3-h-4.html", 
	"http://www.kugou.com/yy/singer/index/4-h-4.html", 
	"http://www.kugou.com/yy/singer/index/5-h-4.html", 
	"http://www.kugou.com/yy/singer/index/2-h-2.html", 
	"http://www.kugou.com/yy/singer/index/3-h-2.html", 
	"http://www.kugou.com/yy/singer/index/4-h-2.html", 
	"http://www.kugou.com/yy/singer/index/5-h-2.html", 
	"http://www.kugou.com/yy/singer/index/2-j-6.html", 
	"http://www.kugou.com/yy/singer/index/3-j-6.html", 
	"http://www.kugou.com/yy/singer/index/4-j-6.html", 
	"http://www.kugou.com/yy/singer/index/2-l-4.html", 
	"http://www.kugou.com/yy/singer/index/3-l-4.html", 
	"http://www.kugou.com/yy/singer/index/4-l-4.html", 
	"http://www.kugou.com/yy/singer/index/2-j-4.html", 
	"http://www.kugou.com/yy/singer/index/3-j-4.html", 
	"http://www.kugou.com/yy/singer/index/4-j-4.html", 
	"http://www.kugou.com/yy/singer/index/2-s-9.html", 
	"http://www.kugou.com/yy/singer/index/3-s-9.html", 
	"http://www.kugou.com/yy/singer/index/4-s-9.html", 
	"http://www.kugou.com/yy/singer/index/5-s-9.html", 
	"http://www.kugou.com/yy/singer/index/2-p-8.html", 
	"http://www.kugou.com/yy/singer/index/3-p-8.html", 
	"http://www.kugou.com/yy/singer/index/4-p-8.html", 
	"http://www.kugou.com/yy/singer/index/5-p-8.html", 
	"http://www.kugou.com/yy/singer/index/2-b-10.html", 
	"http://www.kugou.com/yy/singer/index/3-b-10.html", 
	"http://www.kugou.com/yy/singer/index/4-b-10.html", 
	"http://www.kugou.com/yy/singer/index/5-b-10.html", 
	"http://www.kugou.com/yy/singer/index/2-d-11.html", 
	"http://www.kugou.com/yy/singer/index/2-a-7.html", 
	"http://www.kugou.com/yy/singer/index/3-a-7.html", 
	"http://www.kugou.com/yy/singer/index/2-p-7.html", 
	"http://www.kugou.com/yy/singer/index/2-n-7.html", 
	"http://www.kugou.com/yy/singer/index/2-h-6.html", 
	"http://www.kugou.com/yy/singer/index/3-h-6.html", 
	"http://www.kugou.com/yy/singer/index/2-h-9.html", 
	"http://www.kugou.com/yy/singer/index/3-h-9.html", 
	"http://www.kugou.com/yy/singer/index/2-g-7.html", 
	"http://www.kugou.com/yy/singer/index/3-g-7.html", 
	"http://www.kugou.com/yy/singer/index/2-q-3.html", 
	"http://www.kugou.com/yy/singer/index/3-q-3.html", 
	"http://www.kugou.com/yy/singer/index/4-q-3.html", 
	"http://www.kugou.com/yy/singer/index/5-q-3.html", 
	"http://www.kugou.com/yy/singer/index/2-m-8.html", 
	"http://www.kugou.com/yy/singer/index/3-m-8.html", 
	"http://www.kugou.com/yy/singer/index/4-m-8.html", 
	"http://www.kugou.com/yy/singer/index/5-m-8.html", 
	"http://www.kugou.com/yy/singer/index/2-y-2.html", 
	"http://www.kugou.com/yy/singer/index/3-y-2.html", 
	"http://www.kugou.com/yy/singer/index/4-y-2.html", 
	"http://www.kugou.com/yy/singer/index/5-y-2.html", 
	"http://www.kugou.com/yy/singer/index/2-l-7.html", 
	"http://www.kugou.com/yy/singer/index/3-l-7.html", 
	"http://www.kugou.com/yy/singer/index/2-l-5.html", 
	"http://www.kugou.com/yy/singer/index/3-l-5.html", 
	"http://www.kugou.com/yy/singer/index/4-l-5.html", 
	"http://www.kugou.com/yy/singer/index/2-h-11.html", 
	"http://www.kugou.com/yy/singer/index/2-i-7.html", 
	"http://www.kugou.com/yy/singer/index/2-m-10.html", 
	"http://www.kugou.com/yy/singer/index/3-m-10.html", 
	"http://www.kugou.com/yy/singer/index/4-m-10.html", 
	"http://www.kugou.com/yy/singer/index/5-m-10.html", 
	"http://www.kugou.com/yy/singer/index/2-h-5.html", 
	"http://www.kugou.com/yy/singer/index/3-h-5.html", 
	"http://www.kugou.com/yy/singer/index/2-z-2.html", 
	"http://www.kugou.com/yy/singer/index/3-z-2.html", 
	"http://www.kugou.com/yy/singer/index/4-z-2.html", 
	"http://www.kugou.com/yy/singer/index/5-z-2.html", 
	"http://www.kugou.com/yy/singer/index/2-r-7.html", 
	"http://www.kugou.com/yy/singer/index/2-p-10.html", 
	"http://www.kugou.com/yy/singer/index/3-p-10.html", 
	"http://www.kugou.com/yy/singer/index/4-p-10.html", 
	"http://www.kugou.com/yy/singer/index/5-p-10.html", 
	"http://www.kugou.com/yy/singer/index/2-c-5.html", 
	"http://www.kugou.com/yy/singer/index/3-c-5.html", 
	"http://www.kugou.com/yy/singer/index/2-n-2.html", 
	"http://www.kugou.com/yy/singer/index/3-n-2.html", 
	"http://www.kugou.com/yy/singer/index/4-n-2.html", 
	"http://www.kugou.com/yy/singer/index/5-n-2.html", 
	"http://www.kugou.com/yy/singer/index/2-d-9.html", 
	"http://www.kugou.com/yy/singer/index/3-d-9.html", 
	"http://www.kugou.com/yy/singer/index/4-d-9.html", 
	"http://www.kugou.com/yy/singer/index/2-d-7.html", 
	"http://www.kugou.com/yy/singer/index/3-d-7.html", 
	"http://www.kugou.com/yy/singer/index/2-t-2.html", 
	"http://www.kugou.com/yy/singer/index/3-t-2.html", 
	"http://www.kugou.com/yy/singer/index/4-t-2.html", 
	"http://www.kugou.com/yy/singer/index/5-t-2.html", 
	"http://www.kugou.com/yy/singer/index/2-x-6.html", 
	"http://www.kugou.com/yy/singer/index/3-x-6.html", 
	"http://www.kugou.com/yy/singer/index/2-n-11.html", 
	"http://www.kugou.com/yy/singer/index/2-k-11.html", 
	"http://www.kugou.com/yy/singer/index/2-w-2.html", 
	"http://www.kugou.com/yy/singer/index/3-w-2.html", 
	"http://www.kugou.com/yy/singer/index/4-w-2.html", 
	"http://www.kugou.com/yy/singer/index/5-w-2.html", 
	"http://www.kugou.com/yy/singer/index/2-y-8.html", 
	"http://www.kugou.com/yy/singer/index/2-y-4.html", 
	"http://www.kugou.com/yy/singer/index/3-y-4.html", 
	"http://www.kugou.com/yy/singer/index/4-y-4.html", 
	"http://www.kugou.com/yy/singer/index/5-y-4.html", 
	"http://www.kugou.com/yy/singer/index/2-c-2.html", 
	"http://www.kugou.com/yy/singer/index/3-c-2.html", 
	"http://www.kugou.com/yy/singer/index/4-c-2.html", 
	"http://www.kugou.com/yy/singer/index/5-c-2.html", 
	"http://www.kugou.com/yy/singer/index/2-g-8.html", 
	"http://www.kugou.com/yy/singer/index/3-g-8.html", 
	"http://www.kugou.com/yy/singer/index/4-g-8.html", 
	"http://www.kugou.com/yy/singer/index/5-g-8.html", 
	"http://www.kugou.com/yy/singer/index/2-h-8.html", 
	"http://www.kugou.com/yy/singer/index/3-h-8.html", 
	"http://www.kugou.com/yy/singer/index/4-h-8.html", 
	"http://www.kugou.com/yy/singer/index/5-h-8.html", 
	"http://www.kugou.com/yy/singer/index/2-j-3.html", 
	"http://www.kugou.com/yy/singer/index/3-j-3.html", 
	"http://www.kugou.com/yy/singer/index/4-j-3.html", 
	"http://www.kugou.com/yy/singer/index/5-j-3.html", 
	"http://www.kugou.com/yy/singer/index/2-n-6.html", 
	"http://www.kugou.com/yy/singer/index/2-f-10.html", 
	"http://www.kugou.com/yy/singer/index/3-f-10.html", 
	"http://www.kugou.com/yy/singer/index/4-f-10.html", 
	"http://www.kugou.com/yy/singer/index/5-f-10.html", 
	"http://www.kugou.com/yy/singer/index/2-r-9.html", 
	"http://www.kugou.com/yy/singer/index/3-r-9.html", 
	"http://www.kugou.com/yy/singer/index/4-r-9.html", 
	"http://www.kugou.com/yy/singer/index/2-a-8.html", 
	"http://www.kugou.com/yy/singer/index/3-a-8.html", 
	"http://www.kugou.com/yy/singer/index/4-a-8.html", 
	"http://www.kugou.com/yy/singer/index/5-a-8.html", 
	"http://www.kugou.com/yy/singer/index/2-r-4.html", 
	"http://www.kugou.com/yy/singer/index/2-f-3.html", 
	"http://www.kugou.com/yy/singer/index/3-f-3.html", 
	"http://www.kugou.com/yy/singer/index/4-f-3.html", 
	"http://www.kugou.com/yy/singer/index/5-f-3.html", 
	"http://www.kugou.com/yy/singer/index/2-p-6.html", 
	"http://www.kugou.com/yy/singer/index/2-c-7.html", 
	"http://www.kugou.com/yy/singer/index/3-c-7.html", 
	"http://www.kugou.com/yy/singer/index/2-b-6.html", 
	"http://www.kugou.com/yy/singer/index/2-j-10.html", 
	"http://www.kugou.com/yy/singer/index/3-j-10.html", 
	"http://www.kugou.com/yy/singer/index/4-j-10.html", 
	"http://www.kugou.com/yy/singer/index/2-s-7.html", 
	"http://www.kugou.com/yy/singer/index/3-s-7.html", 
	"http://www.kugou.com/yy/singer/index/4-s-7.html", 
	"http://www.kugou.com/yy/singer/index/5-s-7.html", 
	"http://www.kugou.com/yy/singer/index/2-p-4.html", 
	"http://www.kugou.com/yy/singer/index/2-l-3.html", 
	"http://www.kugou.com/yy/singer/index/3-l-3.html", 
	"http://www.kugou.com/yy/singer/index/4-l-3.html", 
	"http://www.kugou.com/yy/singer/index/5-l-3.html", 
	"http://www.kugou.com/yy/singer/index/2-n-5.html", 
	"http://www.kugou.com/yy/singer/index/2-y-3.html", 
	"http://www.kugou.com/yy/singer/index/3-y-3.html", 
	"http://www.kugou.com/yy/singer/index/4-y-3.html", 
	"http://www.kugou.com/yy/singer/index/5-y-3.html", 
	"http://www.kugou.com/yy/singer/index/2-m-4.html", 
	"http://www.kugou.com/yy/singer/index/3-m-4.html", 
	"http://www.kugou.com/yy/singer/index/4-m-4.html", 
	"http://www.kugou.com/yy/singer/index/5-m-4.html", 
	"http://www.kugou.com/yy/singer/index/2-w-7.html", 
	"http://www.kugou.com/yy/singer/index/2-n-8.html", 
	"http://www.kugou.com/yy/singer/index/3-n-8.html", 
	"http://www.kugou.com/yy/singer/index/4-n-8.html", 
	"http://www.kugou.com/yy/singer/index/5-n-8.html", 
	"http://www.kugou.com/yy/singer/index/2-l-2.html", 
	"http://www.kugou.com/yy/singer/index/3-l-2.html", 
	"http://www.kugou.com/yy/singer/index/4-l-2.html", 
	"http://www.kugou.com/yy/singer/index/5-l-2.html", 
	"http://www.kugou.com/yy/singer/index/2-c-9.html", 
	"http://www.kugou.com/yy/singer/index/3-c-9.html", 
	"http://www.kugou.com/yy/singer/index/4-c-9.html", 
	"http://www.kugou.com/yy/singer/index/5-c-9.html", 
	"http://www.kugou.com/yy/singer/index/2-m-9.html", 
	"http://www.kugou.com/yy/singer/index/3-m-9.html", 
	"http://www.kugou.com/yy/singer/index/4-m-9.html", 
	"http://www.kugou.com/yy/singer/index/5-m-9.html", 
	"http://www.kugou.com/yy/singer/index/2-i-8.html", 
	"http://www.kugou.com/yy/singer/index/3-i-8.html", 
	"http://www.kugou.com/yy/singer/index/2-h-3.html", 
	"http://www.kugou.com/yy/singer/index/3-h-3.html", 
	"http://www.kugou.com/yy/singer/index/4-h-3.html", 
	"http://www.kugou.com/yy/singer/index/5-h-3.html", 
	"http://www.kugou.com/yy/singer/index/2-g-9.html", 
	"http://www.kugou.com/yy/singer/index/3-g-9.html", 
	"http://www.kugou.com/yy/singer/index/2-p-5.html", 
	"http://www.kugou.com/yy/singer/index/3-p-5.html", 
	"http://www.kugou.com/yy/singer/index/2-n-3.html", 
	"http://www.kugou.com/yy/singer/index/3-n-3.html", 
	"http://www.kugou.com/yy/singer/index/4-n-3.html", 
	"http://www.kugou.com/yy/singer/index/2-u-10.html", 
	"http://www.kugou.com/yy/singer/index/2-n-4.html", 
	"http://www.kugou.com/yy/singer/index/2-s-8.html", 
	"http://www.kugou.com/yy/singer/index/3-s-8.html", 
	"http://www.kugou.com/yy/singer/index/4-s-8.html", 
	"http://www.kugou.com/yy/singer/index/5-s-8.html", 
	"http://www.kugou.com/yy/singer/index/2-k-8.html", 
	"http://www.kugou.com/yy/singer/index/3-k-8.html", 
	"http://www.kugou.com/yy/singer/index/4-k-8.html", 
	"http://www.kugou.com/yy/singer/index/5-k-8.html", 
	"http://www.kugou.com/yy/singer/index/2-s-4.html", 
	"http://www.kugou.com/yy/singer/index/3-s-4.html", 
	"http://www.kugou.com/yy/singer/index/4-s-4.html", 
	"http://www.kugou.com/yy/singer/index/5-s-4.html", 
	"http://www.kugou.com/yy/singer/index/2-e-7.html", 
	"http://www.kugou.com/yy/singer/index/2-k-9.html", 
	"http://www.kugou.com/yy/singer/index/3-k-9.html", 
	"http://www.kugou.com/yy/singer/index/4-k-9.html", 
	"http://www.kugou.com/yy/singer/index/5-k-9.html", 
	"http://www.kugou.com/yy/singer/index/2-z-3.html", 
	"http://www.kugou.com/yy/singer/index/3-z-3.html", 
	"http://www.kugou.com/yy/singer/index/4-z-3.html", 
	"http://www.kugou.com/yy/singer/index/5-z-3.html", 
	"http://www.kugou.com/yy/singer/index/2-g-6.html", 
	"http://www.kugou.com/yy/singer/index/2-b-4.html", 
	"http://www.kugou.com/yy/singer/index/3-b-4.html", 
	"http://www.kugou.com/yy/singer/index/4-b-4.html", 
	"http://www.kugou.com/yy/singer/index/2-f-9.html", 
	"http://www.kugou.com/yy/singer/index/2-j-11.html", 
	"http://www.kugou.com/yy/singer/index/2-e-8.html", 
	"http://www.kugou.com/yy/singer/index/3-e-8.html", 
	"http://www.kugou.com/yy/singer/index/4-e-8.html", 
	"http://www.kugou.com/yy/singer/index/5-e-8.html", 
	"http://www.kugou.com/yy/singer/index/2-y-7.html", 
	"http://www.kugou.com/yy/singer/index/2-t-4.html", 
	"http://www.kugou.com/yy/singer/index/3-t-4.html", 
	"http://www.kugou.com/yy/singer/index/4-t-4.html", 
	"http://www.kugou.com/yy/singer/index/2-j-2.html", 
	"http://www.kugou.com/yy/singer/index/3-j-2.html", 
	"http://www.kugou.com/yy/singer/index/4-j-2.html", 
	"http://www.kugou.com/yy/singer/index/5-j-2.html", 
	"http://www.kugou.com/yy/singer/index/2-i-10.html", 
	"http://www.kugou.com/yy/singer/index/3-i-10.html", 
	"http://www.kugou.com/yy/singer/index/2-m-5.html", 
	"http://www.kugou.com/yy/singer/index/3-m-5.html", 
	"http://www.kugou.com/yy/singer/index/2-h-7.html", 
	"http://www.kugou.com/yy/singer/index/3-h-7.html", 
	"http://www.kugou.com/yy/singer/index/2-q-6.html", 
	"http://www.kugou.com/yy/singer/index/2-m-7.html", 
	"http://www.kugou.com/yy/singer/index/3-m-7.html", 
	"http://www.kugou.com/yy/singer/index/4-m-7.html", 
	"http://www.kugou.com/yy/singer/index/2-r-2.html", 
	"http://www.kugou.com/yy/singer/index/3-r-2.html", 
	"http://www.kugou.com/yy/singer/index/4-r-2.html", 
	"http://www.kugou.com/yy/singer/index/5-r-2.html", 
	"http://www.kugou.com/yy/singer/index/2-o-2.html", 
	"http://www.kugou.com/yy/singer/index/2-t-9.html", 
	"http://www.kugou.com/yy/singer/index/3-t-9.html", 
	"http://www.kugou.com/yy/singer/index/4-t-9.html", 
	"http://www.kugou.com/yy/singer/index/2-q-5.html", 
	"http://www.kugou.com/yy/singer/index/2-d-4.html", 
	"http://www.kugou.com/yy/singer/index/3-d-4.html", 
	"http://www.kugou.com/yy/singer/index/4-d-4.html", 
	"http://www.kugou.com/yy/singer/index/2-j-8.html", 
	"http://www.kugou.com/yy/singer/index/3-j-8.html", 
	"http://www.kugou.com/yy/singer/index/4-j-8.html", 
	"http://www.kugou.com/yy/singer/index/5-j-8.html", 
	"http://www.kugou.com/yy/singer/index/2-x-3.html", 
	"http://www.kugou.com/yy/singer/index/3-x-3.html", 
	"http://www.kugou.com/yy/singer/index/4-x-3.html", 
	"http://www.kugou.com/yy/singer/index/5-x-3.html", 
	"http://www.kugou.com/yy/singer/index/2-j-9.html", 
	"http://www.kugou.com/yy/singer/index/3-j-9.html", 
	"http://www.kugou.com/yy/singer/index/4-j-9.html", 
	"http://www.kugou.com/yy/singer/index/5-j-9.html", 
	"http://www.kugou.com/yy/singer/index/2-h-10.html", 
	"http://www.kugou.com/yy/singer/index/3-h-10.html", 
	"http://www.kugou.com/yy/singer/index/4-h-10.html", 
	"http://www.kugou.com/yy/singer/index/5-h-10.html", 
	"http://www.kugou.com/yy/singer/index/2-b-9.html", 
	"http://www.kugou.com/yy/singer/index/3-b-9.html", 
	"http://www.kugou.com/yy/singer/index/4-b-9.html", 
	"http://www.kugou.com/yy/singer/index/2-t-11.html", 
	"http://www.kugou.com/yy/singer/index/2-k-2.html", 
	"http://www.kugou.com/yy/singer/index/3-k-2.html", 
	"http://www.kugou.com/yy/singer/index/4-k-2.html", 
	"http://www.kugou.com/yy/singer/index/5-k-2.html", 
	"http://www.kugou.com/yy/singer/index/2-p-3.html", 
	"http://www.kugou.com/yy/singer/index/3-p-3.html", 
	"http://www.kugou.com/yy/singer/index/4-p-3.html", 
	"http://www.kugou.com/yy/singer/index/2-m-11.html", 
	"http://www.kugou.com/yy/singer/index/3-m-11.html", 
	"http://www.kugou.com/yy/singer/index/2-v-10.html", 
	"http://www.kugou.com/yy/singer/index/2-t-5.html", 
	"http://www.kugou.com/yy/singer/index/3-t-5.html", 
	"http://www.kugou.com/yy/singer/index/2-j-5.html", 
	"http://www.kugou.com/yy/singer/index/3-j-5.html", 
	"http://www.kugou.com/yy/singer/index/4-j-5.html", 
	"http://www.kugou.com/yy/singer/index/5-j-5.html", 
	"http://www.kugou.com/yy/singer/index/2-p-9.html", 
	"http://www.kugou.com/yy/singer/index/2-r-11.html", 
	"http://www.kugou.com/yy/singer/index/2-z-6.html", 
	"http://www.kugou.com/yy/singer/index/3-z-6.html", 
	"http://www.kugou.com/yy/singer/index/4-z-6.html", 
	"http://www.kugou.com/yy/singer/index/2-w-3.html", 
	"http://www.kugou.com/yy/singer/index/3-w-3.html", 
	"http://www.kugou.com/yy/singer/index/4-w-3.html", 
	"http://www.kugou.com/yy/singer/index/5-w-3.html", 
	"http://www.kugou.com/yy/singer/index/2-j-7.html", 
	"http://www.kugou.com/yy/singer/index/2-e-9.html", 
	"http://www.kugou.com/yy/singer/index/3-e-9.html", 
	"http://www.kugou.com/yy/singer/index/4-e-9.html", 
	"http://www.kugou.com/yy/singer/index/5-e-9.html", 
	"http://www.kugou.com/yy/singer/index/2-v-8.html", 
	"http://www.kugou.com/yy/singer/index/3-v-8.html", 
	"http://www.kugou.com/yy/singer/index/2-f-4.html", 
	"http://www.kugou.com/yy/singer/index/3-f-4.html", 
	"http://www.kugou.com/yy/singer/index/2-r-8.html", 
	"http://www.kugou.com/yy/singer/index/3-r-8.html", 
	"http://www.kugou.com/yy/singer/index/4-r-8.html", 
	"http://www.kugou.com/yy/singer/index/5-r-8.html", 
	"http://www.kugou.com/yy/singer/index/2-k-7.html", 
	"http://www.kugou.com/yy/singer/index/2-i-9.html", 
	"http://www.kugou.com/yy/singer/index/2-t-7.html", 
	"http://www.kugou.com/yy/singer/index/3-t-7.html", 
	"http://www.kugou.com/yy/singer/index/4-t-7.html", 
	"http://www.kugou.com/yy/singer/index/5-t-7.html", 
	"http://www.kugou.com/yy/singer/index/2-w-8.html", 
	"http://www.kugou.com/yy/singer/index/3-w-8.html", 
	"http://www.kugou.com/yy/singer/index/4-w-8.html", 
	"http://www.kugou.com/yy/singer/index/2-w-5.html", 
	"http://www.kugou.com/yy/singer/index/2-x-2.html", 
	"http://www.kugou.com/yy/singer/index/3-x-2.html", 
	"http://www.kugou.com/yy/singer/index/4-x-2.html", 
	"http://www.kugou.com/yy/singer/index/5-x-2.html", 
	"http://www.kugou.com/yy/singer/index/2-c-11.html", 
	"http://www.kugou.com/yy/singer/index/2-g-4.html", 
	"http://www.kugou.com/yy/singer/index/3-g-4.html", 
	"http://www.kugou.com/yy/singer/index/2-m-2.html", 
	"http://www.kugou.com/yy/singer/index/3-m-2.html", 
	"http://www.kugou.com/yy/singer/index/4-m-2.html", 
	"http://www.kugou.com/yy/singer/index/5-m-2.html", 
	"http://www.kugou.com/yy/singer/index/2-l-11.html", 
	"http://www.kugou.com/yy/singer/index/2-k-3.html", 
	"http://www.kugou.com/yy/singer/index/3-k-3.html", 
	"http://www.kugou.com/yy/singer/index/2-q-2.html", 
	"http://www.kugou.com/yy/singer/index/3-q-2.html", 
	"http://www.kugou.com/yy/singer/index/4-q-2.html", 
	"http://www.kugou.com/yy/singer/index/5-q-2.html", 
	"http://www.kugou.com/yy/singer/index/2-a-2.html", 
	"http://www.kugou.com/yy/singer/index/3-a-2.html", 
	"http://www.kugou.com/yy/singer/index/4-a-2.html", 
	"http://www.kugou.com/yy/singer/index/5-a-2.html", 
	"http://www.kugou.com/yy/singer/index/2-c-8.html", 
	"http://www.kugou.com/yy/singer/index/3-c-8.html", 
	"http://www.kugou.com/yy/singer/index/4-c-8.html", 
	"http://www.kugou.com/yy/singer/index/5-c-8.html", 
	"http://www.kugou.com/yy/singer/index/2-y-5.html", 
	"http://www.kugou.com/yy/singer/index/3-y-5.html", 
	"http://www.kugou.com/yy/singer/index/2-c-3.html", 
	"http://www.kugou.com/yy/singer/index/3-c-3.html", 
	"http://www.kugou.com/yy/singer/index/4-c-3.html", 
	"http://www.kugou.com/yy/singer/index/5-c-3.html", 
	"http://www.kugou.com/yy/singer/index/2-v-2.html", 
	"http://www.kugou.com/yy/singer/index/2-w-11.html", 
	"http://www.kugou.com/yy/singer/index/2-r-5.html", 
	"http://www.kugou.com/yy/singer/index/2-f-2.html", 
	"http://www.kugou.com/yy/singer/index/3-f-2.html", 
	"http://www.kugou.com/yy/singer/index/4-f-2.html", 
	"http://www.kugou.com/yy/singer/index/5-f-2.html", 
	"http://www.kugou.com/yy/singer/index/2-a-6.html", 
	"http://www.kugou.com/yy/singer/index/2-c-10.html", 
	"http://www.kugou.com/yy/singer/index/3-c-10.html", 
	"http://www.kugou.com/yy/singer/index/4-c-10.html", 
	"http://www.kugou.com/yy/singer/index/5-c-10.html", 
	"http://www.kugou.com/yy/singer/index/2-g-5.html", 
	"http://www.kugou.com/yy/singer/index/2-r-10.html", 
	"http://www.kugou.com/yy/singer/index/3-r-10.html", 
	"http://www.kugou.com/yy/singer/index/4-r-10.html", 
	"http://www.kugou.com/yy/singer/index/5-r-10.html", 
	"http://www.kugou.com/yy/singer/index/2-v-9.html", 
	"http://www.kugou.com/yy/singer/index/2-o-10.html", 
	"http://www.kugou.com/yy/singer/index/3-o-10.html", 
	"http://www.kugou.com/yy/singer/index/2-d-2.html", 
	"http://www.kugou.com/yy/singer/index/3-d-2.html", 
	"http://www.kugou.com/yy/singer/index/4-d-2.html", 
	"http://www.kugou.com/yy/singer/index/5-d-2.html", 
	"http://www.kugou.com/yy/singer/index/2-a-5.html", 
	"http://www.kugou.com/yy/singer/index/2-w-4.html", 
	"http://www.kugou.com/yy/singer/index/3-w-4.html", 
	"http://www.kugou.com/yy/singer/index/2-p-2.html", 
	"http://www.kugou.com/yy/singer/index/3-p-2.html", 
	"http://www.kugou.com/yy/singer/index/4-p-2.html", 
	"http://www.kugou.com/yy/singer/index/5-p-2.html", 
	"http://www.kugou.com/yy/singer/index/2-w-10.html", 
	"http://www.kugou.com/yy/singer/index/3-w-10.html", 
	"http://www.kugou.com/yy/singer/index/2-y-11.html", 
	"http://www.kugou.com/yy/singer/index/2-d-6.html", 
	"http://www.kugou.com/yy/singer/index/2-s-6.html", 
	"http://www.kugou.com/yy/singer/index/3-s-6.html", 
	"http://www.kugou.com/yy/singer/index/4-s-6.html", 
	"http://www.kugou.com/yy/singer/index/5-s-6.html", 
	"http://www.kugou.com/yy/singer/index/2-f-8.html", 
	"http://www.kugou.com/yy/singer/index/3-f-8.html", 
	"http://www.kugou.com/yy/singer/index/4-f-8.html", 
	"http://www.kugou.com/yy/singer/index/5-f-8.html", 
	"http://www.kugou.com/yy/singer/index/2-l-10.html", 
	"http://www.kugou.com/yy/singer/index/3-l-10.html", 
	"http://www.kugou.com/yy/singer/index/4-l-10.html", 
	"http://www.kugou.com/yy/singer/index/5-l-10.html", 
	"http://www.kugou.com/yy/singer/index/2-l-8.html", 
	"http://www.kugou.com/yy/singer/index/3-l-8.html", 
	"http://www.kugou.com/yy/singer/index/4-l-8.html", 
	"http://www.kugou.com/yy/singer/index/5-l-8.html", 
	"http://www.kugou.com/yy/singer/index/2-y-6.html", 
	"http://www.kugou.com/yy/singer/index/3-y-6.html", 
	"http://www.kugou.com/yy/singer/index/2-d-5.html", 
	"http://www.kugou.com/yy/singer/index/3-d-5.html", 
	"http://www.kugou.com/yy/singer/index/4-d-5.html", 
	"http://www.kugou.com/yy/singer/index/2-l-6.html", 
	"http://www.kugou.com/yy/singer/index/3-l-6.html", 
	"http://www.kugou.com/yy/singer/index/2-g-11.html", 
	"http://www.kugou.com/yy/singer/index/2-t-6.html", 
	"http://www.kugou.com/yy/singer/index/2-m-6.html", 
	"http://www.kugou.com/yy/singer/index/3-m-6.html", 
	"http://www.kugou.com/yy/singer/index/2-x-5.html", 
	"http://www.kugou.com/yy/singer/index/2-p-11.html", 
	"http://www.kugou.com/yy/singer/index/2-g-10.html", 
	"http://www.kugou.com/yy/singer/index/3-g-10.html", 
	"http://www.kugou.com/yy/singer/index/4-g-10.html", 
	"http://www.kugou.com/yy/singer/index/2-k-5.html", 
	"http://www.kugou.com/yy/singer/index/2-s-11.html", 
	"http://www.kugou.com/yy/singer/index/3-s-11.html", 
	"http://www.kugou.com/yy/singer/index/2-z-5.html", 
	"http://www.kugou.com/yy/singer/index/3-z-5.html", 
	"http://www.kugou.com/yy/singer/index/4-z-5.html", 
	"http://www.kugou.com/yy/singer/index/2-b-7.html", 
	"http://www.kugou.com/yy/singer/index/3-b-7.html", 
	"http://www.kugou.com/yy/singer/index/4-b-7.html", 
	"http://www.kugou.com/yy/singer/index/2-a-4.html", 
	"http://www.kugou.com/yy/singer/index/3-a-4.html", 
	"http://www.kugou.com/yy/singer/index/2-b-2.html", 
	"http://www.kugou.com/yy/singer/index/3-b-2.html", 
	"http://www.kugou.com/yy/singer/index/4-b-2.html", 
	"http://www.kugou.com/yy/singer/index/5-b-2.html", 
	"http://www.kugou.com/yy/singer/index/2-t-10.html", 
	"http://www.kugou.com/yy/singer/index/3-t-10.html", 
	"http://www.kugou.com/yy/singer/index/4-t-10.html", 
	"http://www.kugou.com/yy/singer/index/5-t-10.html", 
	"http://www.kugou.com/yy/singer/index/2-r-6.html", 
	"http://www.kugou.com/yy/singer/index/2-g-3.html", 
	"http://www.kugou.com/yy/singer/index/3-g-3.html", 
	"http://www.kugou.com/yy/singer/index/4-g-3.html", 
	"http://www.kugou.com/yy/singer/index/5-g-3.html", 
	"http://www.kugou.com/yy/singer/index/2-d-8.html", 
	"http://www.kugou.com/yy/singer/index/3-d-8.html", 
	"http://www.kugou.com/yy/singer/index/4-d-8.html", 
	"http://www.kugou.com/yy/singer/index/5-d-8.html", 
	"http://www.kugou.com/yy/singer/index/2-a-10.html", 
	"http://www.kugou.com/yy/singer/index/3-a-10.html", 
	"http://www.kugou.com/yy/singer/index/4-a-10.html", 
	"http://www.kugou.com/yy/singer/index/5-a-10.html", 
	"http://www.kugou.com/yy/singer/index/2-s-3.html", 
	"http://www.kugou.com/yy/singer/index/3-s-3.html", 
	"http://www.kugou.com/yy/singer/index/4-s-3.html", 
	"http://www.kugou.com/yy/singer/index/5-s-3.html", 
	"http://www.kugou.com/yy/singer/index/2-z-8.html", 
	"http://www.kugou.com/yy/singer/index/2-s-10.html", 
	"http://www.kugou.com/yy/singer/index/3-s-10.html", 
	"http://www.kugou.com/yy/singer/index/4-s-10.html", 
	"http://www.kugou.com/yy/singer/index/5-s-10.html", 
	"http://www.kugou.com/yy/singer/index/2-d-10.html", 
	"http://www.kugou.com/yy/singer/index/3-d-10.html", 
	"http://www.kugou.com/yy/singer/index/4-d-10.html", 
	"http://www.kugou.com/yy/singer/index/5-d-10.html", 
	"http://www.kugou.com/yy/singer/index/2-c-6.html", 
	"http://www.kugou.com/yy/singer/index/3-c-6.html", 
	"http://www.kugou.com/yy/singer/index/2-b-5.html", 
	"http://www.kugou.com/yy/singer/index/3-b-5.html", 
	"http://www.kugou.com/yy/singer/index/2-t-8.html", 
	"http://www.kugou.com/yy/singer/index/3-t-8.html", 
	"http://www.kugou.com/yy/singer/index/4-t-8.html", 
	"http://www.kugou.com/yy/singer/index/5-t-8.html", 
	"http://www.kugou.com/yy/singer/index/2-e-10.html", 
	"http://www.kugou.com/yy/singer/index/3-e-10.html", 
	"http://www.kugou.com/yy/singer/index/4-e-10.html", 
	"http://www.kugou.com/yy/singer/index/2-s-2.html", 
	"http://www.kugou.com/yy/singer/index/3-s-2.html", 
	"http://www.kugou.com/yy/singer/index/4-s-2.html", 
	"http://www.kugou.com/yy/singer/index/5-s-2.html", 
	"http://www.kugou.com/yy/singer/index/2-s-5.html", 
	"http://www.kugou.com/yy/singer/index/3-s-5.html", 
	"http://www.kugou.com/yy/singer/index/4-s-5.html", 
	"http://www.kugou.com/yy/singer/index/5-s-5.html", 
	"http://www.kugou.com/yy/singer/index/2-x-4.html", 
	"http://www.kugou.com/yy/singer/index/3-x-4.html", 
	"http://www.kugou.com/yy/singer/index/4-x-4.html", 
	"http://www.kugou.com/yy/singer/index/2-y-10.html", 
	"http://www.kugou.com/yy/singer/index/2-t-3.html", 
	"http://www.kugou.com/yy/singer/index/3-t-3.html", 
	"http://www.kugou.com/yy/singer/index/4-t-3.html", 
	"http://www.kugou.com/yy/singer/index/5-t-3.html", 
	]

//连接字符串
//var DB_CONN_STR = {'mongodb://localhost:27017/users':true}
var DB_CONN_STR = 'mongodb://localhost:27017/'
var singerallinfo=[]
//使用客户端连接数据，并指定完成时的回调方法
MongoClient.connect(DB_CONN_STR, {useNewUrlParser:true},function(err, client) {
    console.log("连接成功！");
    //执行插入数据操作，调用自定义方法
	var collection=client.db('kugou')
	//获得指定的集合 
	var db = collection.collection('歌手列表');
	
	var leni=0
	var singerid=0
	for(let i=0; i< reqlist.length;i++){
	//for(let i=0; i< 2;i++){
		console.log(' i =  ['+i+']   current get the url :  ---'+reqlist[i])
		getSingerDataHtmlPage(reqlist[i])
	}
	function getHtmlPage(url){
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var Num =acquirePageNum(body,url)
				if (Num>1){
					for(let i=2; i<= Num;i++){
						let tmpurl=url.replace(url[37],i)
						//console.log(tmpurl+'--------['+i+']')
						//console.log(url.replace(url[37],i)+'--------['+i+']')
						reqlist.push(tmpurl)
					}
				}
			}
			if(reqlist.length == 941){
				console.log('End....'+reqlist.length);
				var singerpagelistout = fs.createWriteStream('./singerpageurl.txt');
				//singerpagelistout.write('[')

				for(let i=0;i<reqlist.length;i++){
					//singerpagelistout.write('"'+reqlist[i]+'", \n');
					singerpagelistout.write(reqlist[i]+'\n');
				}
				//singerpagelistout.write(']')
			}
		});
	}
	function acquirePageNum(data,url){
		var $ = cheerio.load(data);
		//console.log('start find page ');
		var pageNum=$('#mypage').find('a').eq(-3).text()   // 通过索引筛选匹配的元素。使用.eq(-i)就从最后一个元素向前数。
		if(pageNum == '上一页'){
			console.log('mypage is 1:'+pageNum+url);
			return 1;
		}
		else{
			return pageNum;
		}
	}

	function getSingerDataHtmlPage(url){
		request(url, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var tmplist =acquireSingerData(body)
				singerList.push.apply(singerList,tmplist)
				leni =leni+1
			}
			
			console.log('singerList length only show once time ====='+singerList.length)

			if(singerList.length >0){
				insertData(db,singerList,function(result) {
					//显示结果
				//console.log(result);
		 
				});
			}

			
			singerList=[]
			console.log('current leni = '+leni)
			if (leni>reqlist.length-1){
				client.close();
			}
		
			

		});

	}

	function acquireSingerData(data) { 
		var tmpsingerlist=[]
		var $ = cheerio.load(data);
		//网页内容装入cheerio中之后，查找网页节点元素， 加入'#'和加入’.‘查找的方式不一样
		
		//topsingerlist=$('#list_head strong').toArray();  //找到list_head节点下所有strong的节点
		
		//前18个歌手信息
		var topsingerlist=$('#list_head')
		console.log("singer info is :"+topsingerlist.length);
		topsingerlist.find('li').each(function(item){
			var  infos=$(this)
			let singername=infos.find('strong').find('a').text()
			let singerurl=infos.find('strong').find('a').attr('href')
			out.write(singerurl)
			out.write('\n')
			
			console.log('singer name :  ['+singername+']   地址 :'+singerurl)
			
			
			
			var singerData={'_id':singerid,'singername':singername,'singerurl':singerurl};
			singerid =singerid+1
			tmpsingerlist.push(singerData);
			//tmpsingerlist.push(singerData);
		});
		
		//后32个歌手信息
		var lastsingerlist=$('#list1 a').toArray();
		console.log("list1 :"+lastsingerlist.length);
		for(let i = 0; i < lastsingerlist.length;i++ ){
			let singername=lastsingerlist[i].attribs.title;
			
			let singerurl=lastsingerlist[i].attribs.href; 
			console.log('singer name :['+singername+']   地址 :'+singerurl)
			out.write(singerurl)
			out.write('\n')
			
			var singerData={'_id':singerid,'singername':singername,'singerurl':singerurl};
			singerid =singerid+1
			//singerallinfo.push(singerData)
			//tmpsingerlist.push(singerurl);
			tmpsingerlist.push(singerData);
		}


		//console.log(tmpsingerlist)
		
		return tmpsingerlist
	} 




});



//定义函数表达式，用于操作数据库并返回结果，插入数据
var insertData = function(db,data,callback) {  
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
    var collection = db.collection('歌手信息');
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