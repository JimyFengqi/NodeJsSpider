# encoding: utf-8
#
# 将txt小说分割转换成多个HTML文件
#
# @author : GreatGhoul
# @email  : greatghoul@gmail.com
# @blog   : http://greatghoul.iteye.com

import re
import os
import sys

# txt book's path.
source_path = r'C:\\code_my\\Python\\novel\\带着仓库到大明.txt'

path_pieces = os.path.split(source_path)
novel_title = re.sub(r'(\..*$)|($)', '', path_pieces[1])
target_path = '%s\\%s_分章' % (path_pieces[0], novel_title)
section_re = re.compile(r'^\s*第.+章\s+.*$')


# entry of the script
def main():
    # create the output folder
    if not os.path.exists(target_path):
        os.mkdir(target_path)

    # open the source file
    input = open(source_path, 'r',encoding='utf-8')

    sec_count = 0
    sec_cache = []
    title_cache=[]

    output = open('%s\\前言.txt' % (target_path), 'w',encoding='utf-8')
    preface_title = '%s 前言' % novel_title
    output.writelines(preface_title)

        
    for line in input:
        # is a chapter's title?
        if line.strip() == '':
            pass
        elif re.match(section_re, line):
            line = re.sub(r'\s+', ' ', line)
            print ('converting %s...' % line)
    
            output.writelines(sec_cache)
            output.flush()
            output.close()
            sec_cache = []
            sec_count += 1
            #chapter_name=re.sub('(~|！+|\(+|\)+|~+|\（+|\）+|（+|!+)','_',line)
            chapter_name=re.sub('(~+|\*+)','_',line)


            # create a new section
            output = open('%s\\%s.txt' % (target_path, chapter_name), 'w',encoding='utf-8')
            output.writelines(line)
            title_cache.append(line+'\n')
        else:
            sec_cache.append(line)
            
    output.writelines(sec_cache)
    output.flush()
    output.close()
    sec_cache = []

    # write the menu
    output = open('%s\\目录.txt' % (target_path), 'w',encoding='utf-8')
    menu_head = '%s 目录' % novel_title
    output.writelines(menu_head)
    output.writelines(title_cache)
    output.flush()
    output.close()
    inx_cache = []
    
    print ('completed. %d chapter(s) in total.' % sec_count)

if __name__ == '__main__':

    main()

