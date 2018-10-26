import requests
import re
import urllib.parse
from pyquery import PyQuery as pq
import webbrowser as wb
import time
import json
import redis
import urllib.request
r = redis.Redis(host='127.0.0.1', port=6379,db=3)
s = requests.session()

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
	url='http://www.kuwo.cn/bang/content?name=%s&bangId=%s' % (urllib.parse.quote(rankType),bangid)

	html=s.get(url,headers=headers).content.decode('utf-8')
	doc=pq(html)
	
	singlist=doc('div.tools')
	print(len(singlist))
	Ranklist=[]
	for index,sing in enumerate(singlist.items()):
		songobj=sing.attr('data-music')
		songobj=json.loads(songobj)
		songid=songobj['id']
		songname=songobj['name']
		songplayurl='http://www.kuwo.cn/yinyue/%s?catalog=yueku2016' % songid.split('_')[1]
		rank=index+1
		songinfoUrl=getSongurl(songid)
		print(songplayurl,songid,rank)
		
		
		songobj['rank']=rank
		songobj['songplayurl']=songplayurl
		songobj['songinfoUrl']=songinfoUrl
		songobj['exist']=0

	
		data=getjson(songinfoUrl,songobj)
		r.lpush(rankType,data)
		#data=json.dumps(data)   #json.loads()与json.dumps()可以字典数据和字符串数据的互换
		Ranklist.append(data)
	'''
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
		r.lpush(rankType,data)
		#data=json.dumps(data)   #json.loads()与json.dumps()可以字典数据和字符串数据的互换
		Ranklist.append(data)
	#r.lpush(rankType,Ranklist)
	'''
	#Ranklist=json.dumps(Ranklist)
	return Ranklist
	
def getSongurl(songid):
	#base='http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid=MUSIC_'
	base='http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid='
	return base+songid

def getjson(songinfoUrl,songobj):
	html=s.get(songinfoUrl).content.decode('utf-8')
	songname=songobj['name']
	songplayurl=songobj['songplayurl']
	if not  html:
		print ('页面错误')
		return songobj
	doc=pq(html)
	singer=doc('singer').text()
	if(singer):
		path=doc('path').text()
		artid=doc('artid').text()
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
		songobj['artid']=artid
		songobj['wmapath']=wmapath
		songobj['mp3path']=mp3path
		songobj['aacpath']=aacpath
		songobj['exist']=1
		
	else:
		songobj['exist']=0
		print('[%s]不存在，播放页面为[%s],信息页面为[%s]' % (songname,songplayurl,songinfoUrl))
	return songobj


def getRankTypeNamelist():
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
	html=s.get(url).content.decode('utf-8')
	doc=pq(html)
	Ranknamelist=doc("div.leftNav")('li')
	
	for index,sing in enumerate(Ranknamelist.items()):
		ranktype,bangid=sing.text(),sing.attr('data-bangid')
		print(ranktype,bangid)
		rankdata=getRanklist(ranktype,bangid)
		r.lpush(ranktype,rankdata)

#getRanklist(rankType='iTunes音乐榜',bangid='49')
getRankTypeNamelist()