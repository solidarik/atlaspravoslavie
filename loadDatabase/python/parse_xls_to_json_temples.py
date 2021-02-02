import xlrd
import sys
import os
import re
import datetime
from urllib.request import urlopen
import helper
print(sys.stdout.encoding)

root_folder = 'out_temples'

col_name = 0
col_imgUrl = 2
col_place, col_date, col_longBrief = tuple(range(3, 6))
col_abbots, col_srcUrl, col_eparchyUrl = tuple(range(6, 9))
col_imgUrl_1,col_imgUrl_2,col_imgUrl_3,col_imgUrl_4,col_imgUrl_5  = tuple(range(9, 14))

def IsEmptyValue(row, col):
    v = scheet.cell(row, col).value
    return (v == '')


def GetSheetValue(row, col, isSimple=False):
    cell_value = scheet.cell(row, col).value
    if (isSimple and isinstance(cell_value, float)):
        v = str(int(round(cell_value, 0)))
    else:
        v = str(cell_value)
    return v.replace('"', '\\"').rstrip().rstrip(',')


def GetSheetValueDate(row, col):
    dateExcel = scheet.cell(row, col).value
    return helper.get_date_from_input(dateExcel)


def capitalizeFirst(input):
    if (len(input) < 1 or input[0].isupper()):
        return input
    return input[0].upper() + input[1:]


def GetSheetValue_arr(row, col, split_char=';'):
    val = scheet.cell(row, col).value
    if ('' == val):
        return []
    return val.split(split_char)


filename = os.path.abspath(__file__)
filename += os.path.sep + '..' + os.path.sep + '..' + os.path.sep
filename += 'religion' + os.path.sep + 'храмы.xlsx'
book = xlrd.open_workbook(filename, encoding_override="cp1251")

scheet = book.sheet_by_index(0)
START_ROW = 1
END_ROW = scheet.nrows

print(f"Input count lines from Excel: {END_ROW}")

entities = []
for row in range(START_ROW, END_ROW):
    temples = {}
    try:

        if IsEmptyValue(row, col_place) and IsEmptyValue(
                row, col_date) and IsEmptyValue(row, col_longBrief):
            print(f'Empty line {row}')
            continue

        dateStr = GetSheetValue(row, col_date, True)
        if ('' != dateStr):
            if '-' in dateStr:
                dateArr = dateStr.split('-')
                startDate = helper.get_date_from_input(dateArr[0])
                temples["startYear"] = startDate["ymd"][0]
                temples["startMonth"] = startDate["ymd"][1]
                temples["startDay"] = startDate["ymd"][2]
                temples["startDateStr"] = startDate["outputStr"]
                temples["startIsOnlyYear"] = startDate["isOnlyYear"]
                temples["startIsOnlyCentury"] = startDate["isOnlyCentury"]
                temples["startCentury"] = startDate["century"]

                endDate = helper.get_date_from_input(dateArr[1])
                temples["endYear"] = endDate["ymd"][0]
                temples["endMonth"] = endDate["ymd"][1]
                temples["endDay"] = endDate["ymd"][2]
                temples["endDateStr"] = endDate["outputStr"]
                temples["endIsOnlyYear"] = endDate["isOnlyYear"]
                temples["endIsOnlyCentury"] = endDate["isOnlyCentury"]
                temples["endCentury"] = endDate["century"]
            else:
                if GetSheetValue(row, col_date):
                    startDate = GetSheetValueDate(row, col_date)
                    temples["startYear"] = startDate["ymd"][0]
                    temples["startMonth"] = startDate["ymd"][1]
                    temples["startDay"] = startDate["ymd"][2]
                    temples["startDateStr"] = startDate["outputStr"]
                    temples["startIsOnlyYear"] = startDate["isOnlyYear"]
                    temples["startIsOnlyCentury"] = startDate["isOnlyCentury"]
                    temples["startCentury"] = startDate["century"]

        temples['name'] = GetSheetValue(row, col_name)
        temples['imgUrl'] = GetSheetValue(row, col_imgUrl)
        temples['imgUrl_1'] = GetSheetValue(row, col_imgUrl_1)
        temples['imgUrl_2'] = GetSheetValue(row, col_imgUrl_2)
        temples['imgUrl_3'] = GetSheetValue(row, col_imgUrl_3)
        temples['imgUrl_4'] = GetSheetValue(row, col_imgUrl_4)
        temples['imgUrl_5'] = GetSheetValue(row, col_imgUrl_5)

        temples['place'] = GetSheetValue(row, col_place)
        temples['surPlace'] = helper.remove_substring(
            GetSheetValue(row, col_place))
        temples['longBrief'] = capitalizeFirst(
            GetSheetValue(row, col_longBrief)) \
                .replace('\t', ' ').replace('  ', ' ')

        temples['srcUrl'] = GetSheetValue(row, col_srcUrl)
        temples['eparchyUrl'] = GetSheetValue(row, col_eparchyUrl)
        temples['abbots'] = capitalizeFirst(GetSheetValue(row, col_abbots))

        entities.append(temples)
    except Exception as e:
        print(f'Exception input line in row {row}: {temples}')
        raise Exception(e)

i = 0

helper.clear_folder(helper.get_full_path(root_folder))
helper.create_folder(helper.get_full_path(root_folder))

while i < len(entities):
    item = entities[i]
    i += 1

    filename = 'file{}.json'.format(i)
    filename = helper.get_full_path(os.path.join(root_folder, filename))
    file = open(filename, 'w', encoding='utf-8')
    file.write('[{')
    file.write('\n')
    last_key = ''
    text = ''
    try:
        list_items = item.items()

        # define last key
        for key, value in list_items:
            if (isinstance(value, list)):
                if (0 < len(', '.join(value))):
                    last_key = key
            elif (value != ''):
                last_key = key

        for key, value in list_items:
            text = ''
            if (isinstance(value, list)):
                if (0 < len(', '.join(value))):
                    text = '"{}": [{}]'.format(
                        key,
                        ', '.join(list(map(lambda x: '"' + x + '"', value))))
            elif (value != ''):
                text = '"{}": "{}"'.format(key, value)

            if ('' != text):
                if (key != last_key): text = '{},'.format(text)
                text = text.replace('\n', ' ')
                file.write('\t{}\n'.format(text))
    except Exception as e:
        print('{}: {}'.format(i, text))
        raise Exception(e)

    file.write('}]')
    file.close()

print("Completed read to json files")
exit(0)
