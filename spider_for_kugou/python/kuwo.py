import requests
import re
import urllib.parse
from pyquery import PyQuery as pq
import webbrowser as wb
import time
import json
import redis
r = redis.Redis(host='127.0.0.1', port=6379,db=0)

s = requests.session()
#filename = '周杰伦'
#filename = input("请输入音乐文件保存的本地路径：").strip()
#base_url = input("请输入音乐播放页面url：").strip()
base_url = 'http://www.kuwo.cn/yinyue/54994175?catalog=yueku2016'

base_number = re.findall(r"(?:http://www.kuwo.cn/yinyue/)(\d+)(?:\?catalog=yueku2016)", base_url)[0]
def get_url(number):
    headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'identity;q=1, *;q=0',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
        'Host':'antiserver.kuwo.cn',
        'Range': 'bytes=0-',
        'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Referer':base_url
    }
    #url = "http://antiserver.kuwo.cn/anti.s?format=aac|mp3&rid=MUSIC_"+ base_number +"&type=convert_url&response=res"
    #r = s.get(url, headers=headers, allow_redirects=False)
    url = "http://antiserver.kuwo.cn/anti.s?format=aac|mp3&rid=MUSIC_"+ number +"&type=convert_url&response=res"
    r = s.get(url,allow_redirects=False)
    accpath= r.headers['Location']
    print(accpath)
    return accpath

def get_aac(url):
	base_host = re.findall(r"(?:http://)(.*)", url)[0]
	base_host = base_host.split('/')[0]
	headers ={
            'Accept': '*/*',
            'Accept-Encoding': 'identity;q=1, *;q=0',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
            'Host': base_host,
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
            'Referer':base_url,
            'Range': 'bytes=0-'
           }
	r = s.get(url, headers=headers, stream=True)
	print(r)
	return r
def save_aac(filename, res):
	with open(filename, 'wb') as fd:
	    for chunk in res.iter_content(chunk_size=128):
	        fd.write(chunk)


def getRanklist(rankType):
	headers ={
            'Accept': '*/*',
            'Accept-Encoding': 'identity;q=1, *;q=0',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'Host': 'www.kuwo.cn',
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
            'Range': 'bytes=0-'
           }
	#rankType='酷我热歌榜'
	url='http://www.kuwo.cn/bang/content?name=%s' % urllib.parse.quote(rankType)
	#print(url)
	#url='http://www.kuwo.cn/bang/content?name=%E9%85%B7%E6%88%91%E7%83%AD%E6%AD%8C%E6%A6%9C'
	#print(url)
	html=s.get(url).content.decode('utf-8')
	doc=pq(html)
	singlist=doc('div.name')
	print(len(singlist))
	Ranklist=[]
	for index,sing in enumerate(singlist.items()):
		singurl=sing('a').attr('href')
		number=singurl.split('?')[0].split('/')[-1]
		#name=sing('a').text()
		rank=index+1
		print(singurl,number,rank)
		'''
		data=getjson(number)
		data['rank']=rank
		data['singurl']=singurl
		data['rank']=rank
		Ranklist.append(data)
	json.dumps(Ranklist)
	return Ranklist
	'''

def getjson(number):
	base='http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid=MUSIC_'
	newurl=base+number

	html=s.get(newurl).content.decode('utf-8')
	doc=pq(html)
	singer=doc('singer').text()
	name=doc('name').text()
	artist=doc('artist').text()
	
	path=doc('path').text()
	mp3path=doc('mp3path').text()
	mp3dl=doc('mp3dl').text()
	aacpath=doc('aacpath').text()
	aacdl=doc('aacdl').text()

	#print(path)
	wmapath='http://'+mp3dl+'/resource/'+path
	print(wmapath)

	mp3path='http://'+mp3dl+'/resource/'+mp3path
	print(mp3path)
	aacpath='http://'+aacdl+'/resource/'+aacpath
	print(aacpath)
	print(name,singer,artist)
	data = {"singer":singer,
	"singer":singer,
	"name":name,
	"wmapath":wmapath,
	"mp3path":mp3path,
	"aacpath":aacpath,
	}
	return data


def getRankNamelist():
	headers ={
            'Accept': '*/*',
            'Accept-Encoding': 'identity;q=1, *;q=0',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'Host': 'www.kuwo.cn',
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
            'Range': 'bytes=0-'
           }
	url='http://www.kuwo.cn/bang/index'
	#print(url)
	#url='http://www.kuwo.cn/bang/content?name=%E9%85%B7%E6%88%91%E7%83%AD%E6%AD%8C%E6%A6%9C'
	#print(url)
	html=s.get(url).content.decode('utf-8')
	doc=pq(html)

	Ranknamelist=doc("div.leftNav")('li')


	for index,sing in enumerate(Ranknamelist.items()):
		#print('{%s："%s"},' % (index,sing.text()) )
		print(sing.text(),sing.attr('data-bangid') )
		#print((index,sing.text()))
		#print('"%s",' % sing.text())
		#getRanklist(sing.text())
#save_aac('那一刻是你',get_aac(get_url('54994175')))
#getjson('54994175')
#data=getRanklist()
#r.lpush("HotRank",data)

getRankNamelist()