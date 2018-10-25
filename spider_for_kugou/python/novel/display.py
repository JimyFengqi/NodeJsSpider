#coding:utf-8
import sys,time
import os

#filename=sys.argv[1]
filename=r'C:\\code_my\\Python\\novel\\唐朝小闲人.txt'
f= open(filename,'r',encoding='utf-8')


def print_one_by_one(text):
    sys.stdout.write("\r " + " " * 60 + "\r") # /r 光标回到行首
    for c in text:
        sys.stdout.write(c)
        sys.stdout.flush()
        time.sleep(0.01)
    sys.stdout.flush() #把缓冲区全部输出
    #sys.stdout.write('\n')
        
for text in f.readlines():
    print_one_by_one(text)
f.close()

sys.stdout.write('\n')


