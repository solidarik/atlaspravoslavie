import csv
import sys
import wikipediaapi
from mediawiki import MediaWiki
import wikipedia
#import wptools
from lxml import html
from lxml import etree
import re


def print_sections(sections, level=0):
        for s in sections:
                print("%s: %s - %s" % ("*" * (level + 1), s.title, s.text[0:40]))
                print_sections(s.sections, level + 1)

maxInt = sys.maxsize
while True:
    # decrease the maxInt value by factor 10
    # as long as the OverflowError occurs.
    try:
        csv.field_size_limit(maxInt)
        break
    except OverflowError:
        maxInt = int(maxInt/10)

with open('D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\data_wiki.csv', 'a', newline='', encoding='utf-8', errors='ignore') as file_csv:
    writer = csv.writer(file_csv, delimiter=';')

    writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
    with open('D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\persons_.csv', newline='', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f, delimiter=';')
        data = list(reader)

        existDataInFile=[]

        for d in data:
            existDataInFile.append(d[0])

        wiki = wikipediaapi.Wikipedia(
            language='ru',
            extract_format=wikipediaapi.ExtractFormat.HTML
        )
        i=0
        for p_n in existDataInFile:
            # p_n = existDataInFile[10] #'Авраамий Ростовский'
            # print(p_n)
            i+=1
            # page_py = wiki.page(p_n)
            # print("Page - Exists: %s" % page_py.exists())
            # print_sections(page_py.sections)
            # print(page_py.text)
            # print(page_py.summary[0:60])

            #wiki_p = MediaWiki()
           # wiki_p.language('ru')
            #p = wiki_p.page(p_n)

            yes_data = False

            wikipedia.set_lang('ru')

            #print(wikipedia.page(p_n).content)

            try:



                file = open('D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\wikidata\\'+p_n+'_.html', 'w', newline='', encoding='utf-8', errors='ignore')
                file.write(wikipedia.page(p_n).html())
                file.close()

                with open('D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\wikidata\\'+p_n+'_.html', encoding='utf-8', errors='ignore') as f_t:
                    f_t_l=f_t.readlines()
                    tree = html.fromstring(str(f_t_l))
                    # print(tree)
                    infobox_lxml = tree.xpath("//table[@class='infobox']/tbody/tr")
                    # print(infobox_lxml)
                    for tr in infobox_lxml:
                        # print(etree.tostring(tr, pretty_print=True))
                        tree_tr=html.fromstring(etree.tostring(tr, pretty_print=True))
                        th_lxml = tree_tr.xpath("//th")
                        if(len(th_lxml)>=1):
                            th=th_lxml[0]
                            #Дата рождения;Место рождения;Дата смерти;Похоронен
                            if not (th.text is None):
                                # writer.writerow([th.text,'','','','',''])
                                if(th.text.find('Место погребения')>-1):#Место погребения
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=''.join(span_lxml[0].itertext()).strip()
                                    span_text=span_text.replace("'","")
                                    span_text=span_text.replace("[d]","")
                                    span_text=span_text.strip()
                                    span_text=span_text.replace("\\n, ","")
                                    print(p_n)
                                    print('Похоронен - '+span_text)
                                    yes_data=True
                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                    writer.writerow([p_n,'','','','',span_text])
                                if(th.text.find('Родился')>-1 or th.text.find('Родилась')>-1):#Родился
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    print(p_n)
                                    span_text=span_text.replace("\\n', ' ","")
                                    print("Родился - "+span_text)
                                    if(span_text.find(' век')>-1):
                                        if(span_text.find('до н. э.')>-1):
                                            print("Дата рождения - "+span_text[0:span_text.find('до н. э.')+8])
                                            print("Место рождения - "+span_text[span_text.find('до н. э.')+8:])
                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                            writer.writerow([p_n,span_text[0:span_text.find('до н. э.')+8],span_text[span_text.find('до н. э.')+8:],'','',''])
                                        else:
                                            print("Дата рождения - "+span_text[0:span_text.find(' век')+4])
                                            print("Место рождения - "+span_text[span_text.find(' век')+4:])
                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                            writer.writerow([p_n,span_text[0:span_text.find(' век')+4],span_text[span_text.find(' век')+4:],'','',''])
                                    if(span_text.find(' год')>-1):
                                        print("Дата рождения - "+span_text[0:span_text.find(' год')+4])
                                        print("Место рождения - "+span_text[span_text.find(' год')+4:])
                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                        writer.writerow([p_n,span_text[0:span_text.find(' год')+4],span_text[span_text.find(' год')+4:],'','',''])
                                if(th.text.find('Рождение')>-1):#Рождение
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")
                                    print("Рождение - "+span_text)
                                    if(span_text.find(' ) ')>-1):

                                        if(span_text[span_text.find(' ) ')+3:].find(' ) ')>-1):
                                            ind = span_text.find(' ) ')+3 +span_text[span_text.find(' ) ')+3:].find(' ) ')
                                            print("Дата рождения - "+span_text[0:ind])
                                            print("Место рождения - "+span_text[ind:])
                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                            writer.writerow([p_n,span_text[0:span_text.find(' ) ')+2],span_text[span_text.find(' ) ')+2:],'','',''])
                                        else:
                                            print("Дата рождения - "+span_text[0:span_text.find(' ) ')+2])
                                            print("Место рождения - "+span_text[span_text.find(' ) ')+2:])
                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                            writer.writerow([p_n,span_text[0:span_text.find(' ) ')+2],span_text[span_text.find(' ) ')+2:],'','',''])
                                    else:
                                        if(span_text.find('век')>-1):
                                            print("Дата рождения - "+span_text[0:span_text.find('век')+3])
                                            print("Место рождения - "+span_text[span_text.find('век')+3:])
                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                            writer.writerow([p_n,span_text[0:span_text.find('век')+3],span_text[span_text.find('век')+3:],'','',''])
                                        else:

                                            if(span_text.find('год)')>-1):
                                                print("Дата рождения - "+span_text[0:span_text.find('год)')+4])
                                                print("Место рождения - "+span_text[span_text.find('год)')+4:])
                                                # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                writer.writerow([p_n,span_text[0:span_text.find('год)')+4],span_text[span_text.find('год)')+4:],'','',''])
                                            else:

                                                if(span_text.find('лет)')>-1):
                                                    print("Дата рождения - "+span_text[0:span_text.find('лет)')+4])
                                                    print("Место рождения - "+span_text[span_text.find('лет)')+4:])
                                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                    writer.writerow([p_n,span_text[0:span_text.find('лет)')+4],span_text[span_text.find('лет)')+4:],'','',''])
                                                else:

                                                    isMatch = False

                                                    for match in re.finditer(" \d{3} ", span_text):
                                                        print("Дата рождения - "+span_text[0:match.end()])
                                                        print("Место рождения - "+span_text[match.end():])
                                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                        writer.writerow([p_n,span_text[0:match.end()],span_text[match.end():],'','',''])
                                                        isMatch = True

                                                    if(not isMatch):
                                                        for match in re.finditer("\d{4} ", span_text):
                                                            print("Дата рождения - "+span_text[0:match.end()])
                                                            print("Место рождения - "+span_text[match.end():])
                                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                            writer.writerow([p_n,span_text[0:match.end()],span_text[match.end():],'','',''])
                                                            isMatch = True

                                                    if(not isMatch):
                                                        for match in re.finditer("\d{3} ", span_text):
                                                            print("Дата рождения - "+span_text[0:match.end()])
                                                            print("Место рождения - "+span_text[match.end():])
                                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                            writer.writerow([p_n,span_text[0:match.end()],span_text[match.end():],'','',''])
                                                            isMatch = True

                                                    if(not isMatch):
                                                        print("Место рождения - "+span_text)
                                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                        writer.writerow([p_n,'',span_text,'','',''])

                                if(th.text.find('Умер')>-1 or th.text.find('Умерла')>-1):#Умер
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")+" "
                                    # print("Умер - "+span_text)
                                    if(span_text.find('лет)')>-1):
                                        print("Дата смерти - "+span_text[0:span_text.find('лет)')+4])
                                        print("Место смерти - "+span_text[span_text.find('лет)')+4:])
                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                        writer.writerow([p_n,'','',span_text[0:span_text.find('лет)')+4],span_text[span_text.find('лет)')+4:],''])
                                    else:
                                        if(span_text.find(' ) ')>-1):

                                            if(span_text[span_text.find(' ) ')+3:].find(')')>-1):
                                                ind = span_text.find(' ) ')+3 +span_text[span_text.find(')')+1:].find(' ) ')
                                                print("Дата смерти - "+span_text[0:ind])
                                                print("Место смерти - "+span_text[ind:])
                                                # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                writer.writerow([p_n,'','',span_text[0:ind],span_text[ind:],''])
                                            else:
                                                print("Дата смерти - "+span_text[0:span_text.find(' ) ')+2])
                                                print("Место смерти - "+span_text[span_text.find(' ) ')+2:])
                                                # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                writer.writerow([p_n,'','',span_text[0:span_text.find(' ) ')+2],span_text[span_text.find(' ) ')+2:],''])
                                        else:
                                            if(span_text.find('век')>-1):
                                                print("Дата смерти - "+span_text[0:span_text.find('век')+3])
                                                print("Место смерти - "+span_text[span_text.find('век')+3:])
                                                # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                writer.writerow([p_n,'','',span_text[0:span_text.find('век')+3],span_text[span_text.find('век')+3:],''])
                                            else:
                                                if(span_text.find('года')>-1):
                                                    print("Дата смерти - "+span_text[0:span_text.find('года')+4])
                                                    print("Место смерти - "+span_text[span_text.find('года')+4:])
                                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                    writer.writerow([p_n,'','',span_text[0:span_text.find('года')+4],span_text[span_text.find('года')+4:],''])
                                                else:

                                                    isMatch = False

                                                    for match in re.finditer(" \d{3} ", span_text):
                                                        print("Дата смерти - "+span_text[0:match.end()])
                                                        print("Место смерти - "+span_text[match.end():])
                                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                        writer.writerow([p_n,'','',span_text[0:match.end()],span_text[match.end():],''])
                                                        isMatch = True

                                                    for match in re.finditer("^\d{3} ", span_text):
                                                        print("Дата смерти - "+span_text[0:match.end()])
                                                        print("Место смерти - "+span_text[match.end():])
                                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                        writer.writerow([p_n,'','',span_text[0:match.end()],span_text[match.end():],''])
                                                        isMatch = True

                                                    if(not isMatch):
                                                        for match in re.finditer("\d{4} ", span_text):
                                                            print("Дата смерти - "+span_text[0:match.end()])
                                                            print("Место смерти - "+span_text[match.end():])
                                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                            writer.writerow([p_n,'','',span_text[0:match.end()],span_text[match.end():],''])
                                                            isMatch = True

                                                    if(not isMatch):
                                                        print("Место смерти - "+span_text)
                                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                        writer.writerow([p_n,'','','',span_text,''])



                                if(th.text.find('Смерть')>-1):#Смерть
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")+" "
                                    # print("Смерть - "+span_text)
                                    if(span_text.find('года)')>-1):
                                        print("Дата смерти - "+span_text[0:span_text.find('года)')+5])
                                        print("Место смерти - "+span_text[span_text.find('года)')+5:])
                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                        writer.writerow([p_n,'','',span_text[0:span_text.find('года)')+5],span_text[span_text.find('года)')+5:],''])
                                    else:
                                        if(span_text.find('лет)')>-1):
                                            print("Дата смерти - "+span_text[0:span_text.find('лет)')+4])
                                            print("Место смерти - "+span_text[span_text.find('лет)')+4:])
                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                            writer.writerow([p_n,'','',span_text[0:span_text.find('лет)')+4],span_text[span_text.find('лет)')+4:],''])
                                        else:
                                            if(span_text.find(' ) ')>-1):
                                                print("Дата смерти - "+span_text[0:span_text.find(' ) ')+2])
                                                print("Место смерти - "+span_text[span_text.find(' ) ')+2:])
                                                # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                writer.writerow([p_n,'','',span_text[0:span_text.find(' ) ')+2],span_text[span_text.find(' ) ')+2:],''])
                                            else:
                                                if(span_text.find('век')>-1):
                                                    print("Дата смерти - "+span_text[0:span_text.find('век')+3])
                                                    print("Место смерти - "+span_text[span_text.find('век')+3:])
                                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                    writer.writerow([p_n,'','',span_text[0:span_text.find('век')+3],span_text[span_text.find('век')+3:],''])
                                                else:
                                                    if(span_text.find('года')>-1):
                                                        print("Дата смерти - "+span_text[0:span_text.find('года')+4])
                                                        print("Место смерти - "+span_text[span_text.find('года')+4:])
                                                        # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                        writer.writerow([p_n,'','',span_text[0:span_text.find('года')+4],span_text[span_text.find('года')+4:],''])
                                                    else:

                                                        isMatch = False

                                                        for match in re.finditer(" \d{3} ", span_text):
                                                            print("Дата смерти - "+span_text[0:match.end()])
                                                            print("Место смерти - "+span_text[match.end():])
                                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                            writer.writerow([p_n,'','',span_text[0:match.end()],span_text[match.end():],''])
                                                            isMatch = True

                                                        for match in re.finditer("^\d{3} ", span_text):
                                                            print("Дата смерти - "+span_text[0:match.end()])
                                                            print("Место смерти - "+span_text[match.end():])
                                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                            writer.writerow([p_n,'','',span_text[0:match.end()],span_text[match.end():],''])
                                                            isMatch = True

                                                        if(not isMatch):
                                                            for match in re.finditer("\d{4} ", span_text):
                                                                print("Дата смерти - "+span_text[0:match.end()])
                                                                print("Место смерти - "+span_text[match.end():])
                                                                # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                                writer.writerow([p_n,'','',span_text[0:match.end()],span_text[match.end():],''])
                                                                isMatch = True

                                                        if(not isMatch):
                                                            print("Место смерти - "+span_text)
                                                            # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                                            writer.writerow([p_n,'','','',span_text,''])

                                if(th.text.find('Дата смерти')>-1 or th.text.find('Дата смерти')>-1):#Дата смерти
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")+" "
                                    print("Дата смерти - "+span_text)
                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                    writer.writerow([p_n,'','',span_text,'',''])
                                if(th.text.find('Место смерти')>-1 or th.text.find('Место смерти')>-1):#Место смерти
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")+" "
                                    print("Место смерти - "+span_text)
                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                    writer.writerow([p_n,'','','',span_text,''])
                                if(th.text.find('Дата рождения')>-1 or th.text.find('Дата рождения')>-1):#Дата рождения
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")+" "
                                    print("Дата рождения - "+span_text)
                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                    writer.writerow([p_n,span_text,'','','',''])
                                if(th.text.find('Место рождения')>-1 or th.text.find('Место рождения')>-1):#Место рождения
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")+" "
                                    print("Место рождения - "+span_text)
                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                    writer.writerow([p_n,'',span_text,'','',''])

                                if(th.text.find('Период жизни')>-1):#Период жизни
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")+" "
                                    print("Период жизни - "+span_text)
                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                    writer.writerow([p_n,span_text,'','','',''])
                                if(th.text.find('Похоронен')>-1):#Похоронен
                                    print(p_n)
                                    span_lxml = tree_tr.xpath("//td")
                                    span_text=' '.join(span_lxml[0].itertext())
                                    span_text=span_text.replace("\\n', ' ","")+" "
                                    print("Похоронен - "+span_text)
                                    # writer.writerow(['Имя для сайта','Дата рождения','Место рождения','Дата смерти','Место смерти','Похоронен'])
                                    writer.writerow([p_n,'','','','',span_text])



                                # if(th.text.find('мерт')>-1):#Смерть
                                #     print(th.text)
                                # if(th.text.find('Рожден')>-1|th.text.find('рожден')):#Рождение, Место рождения
                                #     print(th.text)
                                # if(th.text.find('огребе')>-1):#Погребен, место погребения
                                #     print(th.text)
                                # if(th.text.find('Родился')>-1):#Родился
                                #     print(th.text)
                                # if(th.text.find('Умер')>-1):#Умер
                                #     print(th.text)
                        # for th in th_lxml:
                        #     if():
                        #         print(th.text)
                        #     if():
                        #         print(th.text)
                # if i==100:
                #     sys.exit()

            except wikipedia.exceptions.DisambiguationError as e:
                yes_data = False
                # print(e.options)
            except wikipedia.exceptions.PageError as e:
                yes_data = False
                # print(e)
