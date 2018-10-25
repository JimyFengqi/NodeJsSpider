# -*- coding: utf-8 -*-
# @Date    : 2018-10-25 17:31:20
# @Author  : Jimy_Fengqi (jmps515@163.com)
# @Link    : https://blog.csdn.net/qiqiyingse
# @Version : V1.0
'''
小说的内容编码格式需要是utf-8

'''

import re
import os
import sys


if sys.argv[1]
	source_path=os.getcwd()+'\\'+sys.argv[1]
else:
	source_path = r'C:\\code_my\\Python\\novel\\带着仓库到大明.txt'
# regex for the section title
# sec_re = re.compile(r'第.+卷\s+.+\s+第.+章\s+.+')

# txt book's path.
#source_path = r'C:\\code_my\\Python\\novel\\唐朝小闲人.txt'
source_path = r'C:\\code_my\\Python\\novel\\带着仓库到大明.txt'

path_pieces = os.path.split(source_path)
novel_title = re.sub(r'(\..*$)|($)', '', path_pieces[1])
target_path = '%s%s_html' % (path_pieces[0], novel_title)
#section_re = re.compile(r'^\s*第.+卷\s+.*$')
section_re = re.compile(r'^\s*第.+章\s+.*$')
section_head = '''
    <html>
        <head>
            <meta http-equiv="Content-Type" content="utf-8"/>
            <title>%s</title>
        </head>
        <body style="font-family:楷体,宋体;font-size:16px; margin:0;
            padding: 20px; background:#FAFAD2;color:#2B4B86;text-align:center;">
            <h2>%s</h2><a href="#bottom">去页尾</a><hr/>'''

# escape xml/html
def escape_xml(code):
    text = code
    text = re.sub(r'<', '&lt;', text)
    text = re.sub(r'>', '&gt;', text)
    text = re.sub(r'&', '&amp;', text)
    text = re.sub(r'\t', '&nbsp;&nbsp;&nbsp;&nbsp;', text)
    text = re.sub(r'\s', '&nbsp;', text)
    return text

# entry of the script
def main():
    # create the output folder
    if not os.path.exists(target_path):
        os.mkdir(target_path)

    # open the source file
    input = open(source_path, 'r',encoding='utf-8')

    sec_count = 0
    sec_cache = []
    idx_cache = []

    output = open('%s\\%d.html' % (target_path, sec_count), 'w',encoding='utf-8')
    preface_title = '%s 前言' % novel_title
    output.writelines([section_head % (preface_title, preface_title)])
    idx_cache.append('<li><a href="%d.html">%s</a></li>'
                     % (sec_count, novel_title))
        
    for line in input:
        # is a chapter's title?
        if line.strip() == '':
            pass
        elif re.match(section_re, line):
            line = re.sub(r'\s+', ' ', line)
            print ('converting %s...' % line)

            # write the section footer
            sec_cache.append('<hr/><p>')
            if sec_count == 0:
                sec_cache.append('<a href="index.html">目录</a>&nbsp;|&nbsp;')
                sec_cache.append('<a href="%d.html">下一篇</a>&nbsp;|&nbsp;'
                                 % (sec_count + 1))
            else:
                sec_cache.append('<a href="%d.html">上一篇</a>&nbsp;|&nbsp;'
                                 % (sec_count - 1))
                sec_cache.append('<a href="index.html">目录</a>&nbsp;|&nbsp;')
                sec_cache.append('<a href="%d.html">下一篇</a>&nbsp;|&nbsp;'
                                 % (sec_count + 1))
            sec_cache.append('<a name="bottom" href="#">回页首</a></p>')
            sec_cache.append('</body></html>')
            output.writelines(sec_cache)
            output.flush()
            output.close()
            sec_cache = []
            sec_count += 1

            # create a new section
            output = open('%s\\%d.html' % (target_path, sec_count), 'w',encoding='utf-8')
            output.writelines([section_head % (line, line)])
            idx_cache.append('<li><a href="%d.html">%s</a></li>'
                             % (sec_count, line))
        else:
            sec_cache.append('<p style="text-align:left;">%s</p>'
                             % escape_xml(line))
            
    # write rest lines
    sec_cache.append('<a href="%d.html">下一篇</a>&nbsp;|&nbsp;'
                     % (sec_count - 1))
    sec_cache.append('<a href="index.html">目录</a>&nbsp;|&nbsp;')
    sec_cache.append('<a name="bottom" href="#">回页首</a></p></body></html>')
    output.writelines(sec_cache)
    output.flush()
    output.close()
    sec_cache = []

    # write the menu
    output = open('%s\\index.html' % (target_path), 'w',encoding='utf-8')
    menu_head = '%s 目录' % novel_title
    output.writelines([section_head % (menu_head, menu_head), '<ul style="text-align:left">'])
    output.writelines(idx_cache)
    output.writelines(['</ul><body></html>'])
    output.flush()
    output.close()
    inx_cache = []
    
    print ('completed. %d chapter(s) in total.' % sec_count)

if __name__ == '__main__':
    #MultiLanguage.set_language('en')
    main()

