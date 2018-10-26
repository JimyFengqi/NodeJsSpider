import requests
import re
import urllib.parse
from pyquery import PyQuery as pq
import webbrowser as wb
import time
import json
import redis
import urllib.request

class KuwoDownLoader(object): 
	def __init__(self,singer=''):  
		self.r = redis.Redis(host='127.0.0.1', port=6379,db=1)
		self.s = requests.session()
		self.headers ={
            'Accept': '*/*',
            'Accept-Encoding': 'identity;q=1, *;q=0',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive',
            'Cache-Control': 'max-age=0',
            'Host': 'www.kuwo.cn',
            'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
            'Range': 'bytes=0-'
           }
		self.search_url ='http://www.kuwo.cn/artist/content?name={}'

		if(singer == ''):
			tmp=input('请输入歌手：')
			if(tmp.startswith ==' ' or len(tmp) == 0):
				print('输入内容错误')
			else:
				self.singer=tmp.strip()
		else:
			self.singer=singer

	#程序运行函数
	def get_singer_data(self):

		singerinfo = self.get_search_data(self.singer) 
	
	#获取歌手信息
	def get_search_data(self, keys): 
		print(self.search_url.format(keys))
		search_file = self.s.get(self.search_url.format(keys),headers=self.headers).content.decode('utf-8')
		doc=pq(search_file)

		singlist=doc('#conBox')
		print(len(singlist))
		#disport=singlist('#disport')#歌手个人信息页面
		#print('disport = [%d]' % len(disport))
		#

		album=singlist('#album')('li')
		print('album= [%d]' % len(album))

		albumdatalist=[]
		for index,albumelement in enumerate(album.items()):
			albumurl=albumelement('span.name a').attr('href')
			albumname=albumelement('span.name a').text()
			albumname= re.sub(r'(\s+|\*+|\|+|\\+|\/+|&+|-+)', '_', albumname)
			print (index+1,albumname,albumurl)
			albumdata=self.getAlbumList(albumurl,albumname)
			tmp=[{albumname:albumdata}]
			self.r.lpush(self.singer,tmp)
			albumdatalist.append(tmp)
		
		#song=singlist('#song')('li')('div.name') #首页有多少歌曲
		#print('song= [%d]' % len(song))
		
		
		artistID=doc('div.artistTop').attr('data-artistid')
		songlistpage=doc('ul.listMusic').attr('data-page')
		eachpagenum=doc('ul.listMusic').attr('data-rn')
		if(songlistpage):
			print(songlistpage)
			rn=int(songlistpage)* int(eachpagenum)
			print('song length =[%d]' % rn)
			songlistdata=self.get_songlist(artistID,rn)
			tmp=[{'allsongs':songlistdata}]		
			self.r.lpush(self.singer,tmp)

	def getAlbumList(self,albumurl,albumname):
		#print(albumname,albumurl)
		albumhtml=self.s.get(albumurl,headers=self.headers).content.decode('utf-8')
		doc=pq(albumhtml)

		albumlist=doc('div.list')('li.clearfix')
		albumsonglist=[]
		print('albumname=[%s], albumlist length =[%s]' %(albumname,len(albumlist)))
		for index,albumsing in enumerate(albumlist.items()):
			rank=index+1
			songname=albumsing('p.m_name')('a').text()
			songplayurl=albumsing('p.m_name')('a').attr('href')
			songid='MUSIC_'+songplayurl.split('/')[-2]
			print(rank,songname,songplayurl,songid)
			songinfoUrl=self.getSongurl(songid)
			albumsongOBJ={
						"rank":rank,
						"name":songname,
						"id":songid,
						"songinfoUrl":songinfoUrl,
						"songplayurl":songplayurl,
						"exist":0
                   }
			albumdata=self.getjson(songinfoUrl,albumsongOBJ)
			albumsonglist.append(albumdata)

		return albumsonglist

	#获取歌手歌曲列表	
	def get_songlist(self,artistID,rn):
		url='http://www.kuwo.cn/artist/contentMusicsAjax?artistId=%s&pn=0&rn=%d' % (artistID,rn)
		print('song list url =[%s]' % url)
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
		html=self.s.get(url,headers=headers).content.decode('utf-8')
		doc=pq(html)
		
		singlist=doc('div.tools')
		print(len(singlist))
		singdatalist=[]
		for index,sing in enumerate(singlist.items()):
			songobj=sing.attr('data-music')
			songobj=json.loads(songobj)
			songid=songobj['id']
			songname=songobj['name']
			songplayurl='http://www.kuwo.cn/yinyue/%s?catalog=yueku2016' % songid.split('_')[1]
			rank=index+1
			songinfoUrl=self.getSongurl(songid)
			print(rank,songname,songplayurl,songinfoUrl)
			
			
			songobj['rank']=rank
			songobj['songplayurl']=songplayurl
			songobj['songinfoUrl']=songinfoUrl
			songobj['exist']=0
			data=self.getjson(songinfoUrl,songobj)
			singdatalist.append(data)
		
		return singdatalist

	def getSongurl(self,songid):
		base='http://player.kuwo.cn/webmusic/st/getNewMuiseByRid?rid='
		return base+songid
		
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
			#print(r)
			return r
		with open(filename, 'wb') as fd:
			for chunk in get_url_response(url).iter_content(chunk_size=128):
				fd.write(chunk)
	#url为网址
	def save_file_with_url(filename, url):
		urllib.request.urlretrieve(url,filename)




	def getjson(self,songinfoUrl,songobj):
		html=self.s.get(songinfoUrl).content.decode('utf-8')
		songname=songobj['name']
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

if __name__ == '__main__': 
    kw = KuwoDownLoader() 
    kw.get_singer_data()
