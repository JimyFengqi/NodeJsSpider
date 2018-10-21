import requests
import re
import urllib.parse
from pyquery import PyQuery as pq
import webbrowser as wb
import time
import json
import redis
import urllib.request
r = redis.Redis(host='127.0.0.1', port=6379,db=1)


a={'songur':'讲的','aa':'大苏打'}
b=json.dumps(a)
c=[]
cc=['jiangjiang 将将 ']
c.append(a)
c.append(a)
r.lpush('lll',c)
r.lpush('lll',cc)
r.lpush('lll',a)
s = requests.session()
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


#res是一个打开url的返回值，是一个迭代器
def save_file_with_response(filename, url):
	def get_url_response(url):
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
		#r = s.get(url, headers=headers, stream=True)
		#r = s.get(url, stream=True)
		r = s.get(url)
		print(r)
		return r
	with open(filename, 'wb') as fd:
	    for chunk in get_url_response(url).iter_content(chunk_size=128):
	        fd.write(chunk)
#url为网址
def save_file_with_url(filename, url):
	urllib.request.urlretrieve(url,filename)


def getRanklist(rankType='酷我热歌榜',bangid='16'):
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
	url='http://www.kuwo.cn/bang/content?name=%s&bangId=%s' % (urllib.parse.quote(rankType),bangid)
	#print(url)
	#url='http://www.kuwo.cn/bang/content?name=%E9%85%B7%E6%88%91%E7%83%AD%E6%AD%8C%E6%A6%9C'
	#print(url)
	html=s.get(url,headers=headers).content.decode('utf-8')
	doc=pq(html)
	singlist=doc('div.name')
	print(len(singlist))
	Ranklist=[]
	for index,sing in enumerate(singlist.items()):
		songname=sing('a').text()
		songplayurl=sing('a').attr('href')
		songid=songplayurl.split('?')[0].split('/')[-1]
		rank=index+1
		songinfoUrl=getSongurl(songid)
		print(songplayurl,songid,rank)
		
		songobj = {
						"rank":rank,
						"songname":songname,
						"songid":songid,
						"songinfoUrl":songinfoUrl,
						"songplayurl":songplayurl,
						"exist":0
                   }
		data=getjson(songinfoUrl,songobj)
		data=json.dumps(data)   #json.loads()与json.dumps()可以字典数据和字符串数据的互换
		r.lpush(rankType,data)
		Ranklist.append(data)
	#r.lpush(rankType,Ranklist)
	#json.dumps(Ranklist)
	return Ranklist
	
def getSongurl(songid):
	base='http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid=MUSIC_'
	return base+songid

def getjson(songinfoUrl,songobj):
	html=s.get(songinfoUrl).content.decode('utf-8')
	songname=songobj['songname']
	songplayurl=songobj['songplayurl']
	if not  html:
		print ('页面错误')
		return songobj
	doc=pq(html)
	singer=doc('singer').text()
	if(singer):
		path=doc('path').text()
		mp3path=doc('mp3path').text()
		mp3dl=doc('mp3dl').text()
		aacpath=doc('aacpath').text()
		aacdl=doc('aacdl').text()

		#print(path)
		wmapath='http://'+mp3dl+'/resource/'+path
		mp3path='http://'+mp3dl+'/resource/'+mp3path
		aacpath='http://'+aacdl+'/resource/'+aacpath
		#print(wmapath,mp3path,aacpath)
		songobj['singer']=singer
		songobj['wmapath']=wmapath
		songobj['mp3path']=mp3path
		songobj['aacpath']=aacpath
		songobj['exist']=1
		
	else:
		songobj['exist']=0
		print('[%s]不存在，播放页面为[%s],信息页面为[%s]' % (songname,songplayurl,songinfoUrl))
	return songobj


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
		if index > 3:
			ranktype,bangid=sing.text(),sing.attr('data-bangid')
			print(ranktype,bangid)
			rankdata=getRanklist(ranktype,bangid)
			r.lpush(ranktype,rankdata)
		#print((index,sing.text()))
		#print('"%s",' % sing.text())
		#getRanklist(sing.text())
#save_file_with_response('那一刻是你.mp3',get_url('54994175'))
#save_file_with_url('那一刻是你1.mp3',get_url('54994175'))
#r.lpush("HotRank",data)
#getRanklist(rankType='iTunes音乐榜',bangid='49')
#getRankNamelist()