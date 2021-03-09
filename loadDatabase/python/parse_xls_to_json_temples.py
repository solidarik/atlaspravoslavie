import xlrd
import sys
import os
import re
import datetime
from urllib.request import urlopen
import helper
import excel_helper
print(sys.stdout.encoding)

root_folder = 'out_temples'

col_name = 0
col_imgUrl = 2
col_place, col_date, col_longBrief = tuple(range(3, 6))
col_abbots, col_srcUrl, col_eparchyUrl = tuple(range(6, 9))
col_imgUrl_1, col_imgUrl_2, col_imgUrl_3, col_imgUrl_4, col_imgUrl_5 = tuple(
    range(9, 14))

filename = os.path.abspath(__file__)
filename += os.path.sep + '..' + os.path.sep + '..' + os.path.sep
filename += 'religion' + os.path.sep + 'храмы.xlsx'
book = xlrd.open_workbook(filename, encoding_override="cp1251")

sheet = book.sheet_by_index(0)
START_ROW = 1
END_ROW = sheet.nrows

xls = excel_helper.ExcelHelper(sheet)

print(f"Input count lines from Excel: {END_ROW}")

entities = []
for row in range(START_ROW, END_ROW):
    temples = {}
    try:

        if xls.IsEmptyValue(row, col_place) and xls.IsEmptyValue(
                row, col_date) and xls.IsEmptyValue(row, col_longBrief):
            print(f'Empty line {row}')
            continue

        dateStr = xls.GetSheetValue(row, col_date, True)
        if ('' != dateStr):
            dateObj = xls.GetSheetValueDate(row, col_date)
            if 'ymd' in dateObj:
                temples["start"] = {}
                temples["start"]["year"] = dateObj["ymd"][0]
                temples["start"]["month"] = dateObj["ymd"][1]
                temples["start"]["day"] = dateObj["ymd"][2]
                temples["start"]["century"] = dateObj["century"]
                temples["start"]["dateStr"] = dateObj["outputStr"]
                temples["start"]["isOnlyYear"] = dateObj["isOnlyYear"]
                temples["start"]["isOnlyCentury"] = dateObj["isOnlyCentury"]

        temples['name'] = helper.capitalize_first(
            xls.GetSheetValue(row, col_name))
        temples['imgUrl'] = xls.GetSheetValue(row, col_imgUrl)
        temples['imgUrl_1'] = xls.GetSheetValue(row, col_imgUrl_1)
        temples['imgUrl_2'] = xls.GetSheetValue(row, col_imgUrl_2)
        temples['imgUrl_3'] = xls.GetSheetValue(row, col_imgUrl_3)
        temples['imgUrl_4'] = xls.GetSheetValue(row, col_imgUrl_4)
        temples['imgUrl_5'] = xls.GetSheetValue(row, col_imgUrl_5)

        temples['place'] = xls.GetSheetValue(row, col_place)
        temples['surPlace'] = helper.remove_substring(
            xls.GetSheetValue(row, col_place))
        temples['longBrief'] = helper.capitalize_first(
            xls.GetSheetValue(row, col_longBrief)) \
                .replace('\t', ' ').replace('  ', ' ')

        temples['srcUrl'] = xls.GetSheetValue(row, col_srcUrl)
        temples['eparchyUrl'] = xls.GetSheetValue(row, col_eparchyUrl)
        temples['abbots'] = helper.capitalize_first(
            xls.GetSheetValue(row, col_abbots))

        entities.append(temples)
    except Exception as e:
        print(f'Exception input line in row {row}: {temples}')
        raise Exception(e)

helper.clear_folder(helper.get_full_path(root_folder))
helper.create_folder(helper.get_full_path(root_folder))

for i in range(len(entities)):
    item = entities[i]
    filename = 'file{}.json'.format(i)
    filename = helper.get_full_path(os.path.join(root_folder, filename))
    helper.save_json(item, filename)

print("Completed read to json files")
exit(0)
