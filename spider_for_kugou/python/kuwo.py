import requests
import re
import urllib.parse
from pyquery import PyQuery as pq
import webbrowser as wb
import time

s = requests.session()
#filename = '周杰伦'
#filename = input("请输入音乐文件保存的本地路径：").strip()
#base_url = input("请输入音乐播放页面url：").strip()
base_url = 'http://www.kuwo.cn/yinyue/54994175?catalog=yueku2016'

base_number = re.findall(r"(?:http://www.kuwo.cn/yinyue/)(\d+)(?:\?catalog=yueku2016)", base_url)[0]
def get_url():
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
    url = "http://antiserver.kuwo.cn/anti.s?format=aac|mp3&rid=MUSIC_"+ base_number +"&type=convert_url&response=res"

    r = s.get(url, headers=headers, allow_redirects=False)
    return r.headers['Location']

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
	return r
def save_aac(filename, res):
	with open(filename, 'wb') as fd:
	    for chunk in res.iter_content(chunk_size=128):
	        fd.write(chunk)


def getRanklist():
	url='www.kuwo.cn/bang/content?name=%s' % urllib.parse.quote('酷我热歌榜')
	html=s.get(url).content.decode('utf-8')
	doc=pq(html)
	singlist=doc('div.name')
	print(len(singlist))


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
	path='http://'+mp3dl+'/resource/'+path
	print(path)

	mp3path='http://'+mp3dl+'/resource/'+mp3path
	print(mp3path)
	#wb.open_new(mp3path)
	time.sleep(2)

	aacpath='http://'+aacdl+'/resource/'+aacpath
	time.sleep(1)
	
	print(aacpath)
	#wb.open_new(aacpath)



	print(name,singer,artist)


print('base_number [%s]' % base_number)
url=get_url()
#wb.open_new(url)
time.sleep(1)
print(url)	        
getjson(base_number)
getRanklist()