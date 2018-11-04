from wxpy import *

import requests

from datetime import datetime

import time

from apscheduler.schedulers.blocking import BlockingScheduler#定时框架

bot = Bot(cache_path=True)

#tuling = Tuling(api_key=你的api')#机器人api

def send_weather(location):

#准备url地址

    path ='http://api.map.baidu.com/telematics/v3/weather?location=%s&output=json&ak=TueGDhCvwI6fOrQnLM0qmXxY9N0OkOiQ&callback=?'

    url = path % location
    print(url)
    response = requests.get(url)

    result = response.json()

    #如果城市错误就按照濮阳发送天气

    if result['error'] !=0:

        location ='南阳'

        url = path % location
        print(url)
        response = requests.get(url)

        result = response.json()

    str0 = ('    这是今天的天气预报！\n')

    results = result['results']

    # 取出数据字典

    data1 = results[0]

    # 取出城市

    city = data1['currentCity']

    str1 ='    当前地区: %s\n' % city

    # 取出pm2.5值

    pm25 = data1['pm25']

    str2 ='    Pm值    : %s\n' % pm25
    # 将字符串转换为整数 否则无法比较大小

    if pm25 =='':
        pm25 =0

    pm25 =int(pm25)

    # 通过pm2.5的值大小判断污染指数

    if 0 <= pm25 <35:

        pollution ='优'

    elif 35 <= pm25 <75:

        pollution ='良'

    elif 75 <= pm25 <115:

        pollution ='轻度污染'

    elif 115 <= pm25 <150:

        pollution ='中度污染'

    elif 150 <= pm25 <250:

        pollution ='重度污染'

    elif pm25 >=250:

        pollution ='严重污染'

    str3 ='    污染指数: %s\n' % pollution

    result1 = results[0]

    weather_data = result1['weather_data']

    data = weather_data[0]

    temperature_now = data['date']

    str4 ='    当前温度: %s\n' % temperature_now

    wind = data['wind']

    str5 ='    风向    : %s\n' % wind

    weather = data['weather']

    str6 ='    天气    : %s\n' % weather

    str7 ='    温度    : %s\n' % data['temperature']

    message = data1['index']

    str8 ='    穿衣    : %s\n' % message[0]['des']

    str9 ='    温馨提示: %s\n' % message[2]['des']

    str10 ='    运动    : %s\n' % message[3]['des']

    str11 ='    紫外线 : %s\n' % message[4]['des']
    weather_data=result1['weather_data']
    future1='\t%s \n\t\t\t\t温度：%s\n\t\t\t\t天气：%s\n\t\t\t\t风向：%s\n ' % (weather_data[1]['date'],weather_data[1]['temperature'],weather_data[1]['weather'] ,weather_data[1]['wind'])
    future2='\t%s \n\t\t\t\t温度：%s\n\t\t\t\t天气：%s\n\t\t\t\t风向：%s\n ' % (weather_data[2]['date'],weather_data[2]['temperature'],weather_data[2]['weather'] ,weather_data[2]['wind'])
    future3='\t%s \n\t\t\t\t温度：%s\n\t\t\t\t天气：%s\n\t\t\t\t风向：%s\n ' % (weather_data[3]['date'],weather_data[3]['temperature'],weather_data[3]['weather'] ,weather_data[3]['wind'])
    future_weather='未来三天天气：\n'+future1+future2+future3
	
    str = str0 + str1 + str2 + str3 + str4 + str5 + str6 + str7 + str8 + str9 + str10 + str11+future_weather
	
    return str

#好友列表

my_friends = []

my_friends = bot.friends()


group=bot.groups().search('风骚六人，不减当年')[0]
group1=bot.groups().search('F5')[0]
group1.send(send_weather('海淀'))
def send_member_message():
	for member in group.members:
		if member.name != 'Trigger':
			print(member.name,my_friends.search(member.nick_name)[0].city)
			#group.send('@ '+member.name+' \n'+send_weather(my_friends.search(member.nick_name)[0].city))


	bot.file_helper.send('组聊【%s】的天气发送完毕' % group.name)

def getnameandcity():
	for friend in my_friends:
		print(friend.name,friend.nick_name,friend.city)
		

#发送函数

def send_message():

#给全体好友发送

    for friend in my_friends:
        if friend.name == 'suger' or friend.name == 'cathy':
            print(friend)
            print(friend.city)
            friend.send('@suger\n'+send_weather('南阳'))
			
	
#发送成功通知我

    bot.file_helper.send(send_weather('濮阳'))

    bot.file_helper.send('发送完毕')

#定时器
#send_weather('南阳')

#send_member_message()
#getnameandcity()
#sched = BlockingScheduler()

#sched.add_job(send_message,'cron',month='1-12',day='1-31',hour=5,minute =30)

#sched.start()