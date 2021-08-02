import urllib.request
#import json
import re
from lxml import html
from lxml import etree
import csv

data = urllib.request.urlretrieve("https://azbyka.ru/days/menology", "D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\azbukzPersons.html")

count=0

with open('D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\persons.csv', 'w', newline='', encoding='utf-8', errors='ignore') as file_csv:
    writer = csv.writer(file_csv, delimiter=';')


    writer.writerow(['Фамилия','Имя для сайта','Имя ','Отчество','Дата рождения','Место рождения','Связь с храмом','Имя в монашестве','Место подвига','Время подвига','Место подвига','Время подвига','Место подвига','Время подвига','Дата канонизации','Статус святости','Общий статус','Дата почитания','Сфера деятельности','Жизнеописание','Источник','Ссылка на фото','Дата смерти','Похоронен'])

    with open('D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\azbukzPersons.html', encoding='utf-8', errors='ignore') as f:
        f_l=f.readlines()

        #print(l)
        tree = html.fromstring(str(f_l))
        list_ul_lxml = tree.xpath("//div[@class='saints']/a")
        for ul in list_ul_lxml:
            print(ul.text+'-'+ul.attrib['href'])

            urllib.request.urlretrieve(ul.attrib['href'], "D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\azbukz_persos_letter.html")
            with open('D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\azbukz_persos_letter.html', encoding='utf-8', errors='ignore') as f_t:
                f_t_l=f_t.readlines()
                tree_persons_letter=html.fromstring(str(f_t_l))
                saints = tree_persons_letter.xpath("//td[@class='menology-name']/a")
                for saint in saints:
                    print(saint.text+'-'+saint.attrib['href'])
                    count=count+1

print("count="+str(count))
            # tree_ul=html.fromstring(etree.tostring(ul))
            # list_li_lxml = tree_ul.xpath('//li')
            # print(len(list_li_lxml))
            # for li in list_li_lxml:
            #     tree_li=html.fromstring(etree.tostring(li))
            #     hrefs = tree_li.xpath('//a')
            #     #name
            #     print('name='+hrefs[0].text)
            #     n=hrefs[0].text

            #     urllib.request.urlretrieve('https://azbyka.ru/'+hrefs[0].attrib['href'], "D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\azbukz_temple.html")
            #     with open('D:\\projJS\\atlaspravoslavie\\loadDatabase\\out\\out_temples_azbuka\\azbukz_temple.html', encoding='utf-8', errors='ignore') as f_t:
            #         f_t_l=f_t.readlines()
            #         tree_temple=html.fromstring(str(f_t_l))
            #         #coord
            #         map_data=tree_temple.xpath("//div[@class='mapdata']")
            #         s = re.search(r'(?<="lat":)-?(\d+\.\d+)', map_data[0].text)
            #         print('lat='+s[0])
            #         lat=s[0]
            #         s = re.search(r'(?<="lon":)-?(\d+\.\d+)', map_data[0].text)
            #         print('lon='+s[0])
            #         lon=s[0]


            #         #place
            #         pl_lxml = tree_temple.xpath('.//*[contains(text(),"Адрес")]')
            #         if len(pl_lxml)>0:
            #             if not pl_lxml[0].tail is None:
            #                 print('place='+pl_lxml[0].tail)
            #                 p=pl_lxml[0].tail
            #             else:
            #                 print('place='+pl_lxml[0].text)
            #                 p=pl_lxml[0].text
            #         else:
            #             print('place=')
            #             p=''
            #         #print(etree.tostring(pl_lxml[0].getparent(), pretty_print=True))

            #         all_data=tree_temple.xpath(".//div[@class='mw-parser-output']")
            #         #print(all_data)
            #         #print(str(etree.tostring(all_data[0], pretty_print=True)))
            #         tree_text=html.fromstring(str(etree.tostring(all_data[0], pretty_print=True)))
            #         #print(etree.tostring(all_data[0], pretty_print=True))
            #         all_text_elm=tree_text.xpath("//*")
            #         isHist = False
            #         text=''
            #         for ch in all_text_elm:
            #             if isHist and str(ch.tag)=='h2':
            #                 isHist = False
            #             if isHist:
            #                 text=text+(str(ch.text))
            #             if str(ch.tag)=='span' and str(ch.text)=='История' and ch.getparent().tag!='a':
            #                 isHist = True

            #         #date
            #         s = re.search(r'[0-9]{4}', text)
            #         if not s is None:
            #             print('date='+s[0])
            #             d=s[0]
            #         else:
            #             print('date=')
            #             d=''

            #         #description

            #         print('descr='+text)
            #         t=text
            #         #people
            #         print('people=')
            #         pe=''
            #         #url
            #         print('url=https://azbyka.ru/'+hrefs[0].attrib['href'])
            #         u='https://azbyka.ru/'+hrefs[0].attrib['href']
            #         #eparhia
            #         print('eparhia=')
            #         ep=''
            #         #img
            #         img_lxml = tree_temple.xpath("//div[@class='thumb thumb-mobile tright']/div[@class='thumbinner']/a/img")
            #         print('img=https://azbyka.ru/'+img_lxml[0].attrib['src'])
            #         img='https://azbyka.ru/'+img_lxml[0].attrib['src']

            #         writer.writerow([n,str(lat)+' '+str(lon),img,p,d,t,pe,u,ep])