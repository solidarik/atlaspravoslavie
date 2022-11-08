import xlrd
import sys
import os
import datetime
from urllib.request import urlopen
import helper
import excel_helper
print(sys.stdout.encoding)

root_folder = 'out_chronos_temple'

col_place = 0
col_startDateYear, col_endDate, col_startDate = tuple(range(1, 4, 1))
col_shortBrief, col_longBrief, col_url, col_remark = tuple(range(4, 8, 1))
col_priority, col_comment = tuple(range(8, 10, 1))

filename = os.path.abspath(__file__)
filename += os.path.sep + '..' + os.path.sep + '..' + os.path.sep
filename += 'religion' + os.path.sep + 'события русской церкви.xlsx'
book = xlrd.open_workbook(filename, encoding_override="cp1251")

sheet = book.sheet_by_index(0)
START_ROW = 1
END_ROW = sheet.nrows

xls = excel_helper.ExcelHelper(sheet)

print(f"Input count lines from Excel: {END_ROW}")

entities = []
for row in range(START_ROW, END_ROW):
    chrono = {}
    try:

        if xls.IsEmptyValue(row, col_place) and xls.IsEmptyValue(
                row, col_startDate) and xls.IsEmptyValue(
                    row, col_shortBrief) and xls.IsEmptyValue(row, col_url):
            print(f'Empty line {row}')
            continue

        startDateStr = xls.GetSheetValue(row, col_startDate, True)
        if ('' == startDateStr):
            startDateStr = xls.GetSheetValue(row, col_startDateYear, True)
            col_startDate = col_startDateYear

        chrono['place'] = xls.GetSheetValue(row, col_place)

        if ('' != startDateStr):
            dateObj = xls.GetSheetValueDate(row, col_startDate)
            if 'ymd' in dateObj:
                chrono["start"] = {}
                chrono["start"]["year"] = dateObj["ymd"][0]
                chrono["start"]["month"] = dateObj["ymd"][1]
                chrono["start"]["day"] = dateObj["ymd"][2]
                chrono["start"]["century"] = dateObj["century"]
                chrono["start"]["dateStr"] = dateObj["outputStr"]
                chrono["start"]["isOnlyYear"] = dateObj["isOnlyYear"]
                chrono["start"]["isOnlyCentury"] = dateObj["isOnlyCentury"]

        endDateStr = xls.GetSheetValue(row, col_endDate)
        if ('' != endDateStr):
            dateObj = xls.GetSheetValueDate(row, col_endDate)
            if 'ymd' in dateObj:
                chrono["end"] = {}
                chrono["end"]["year"] = dateObj["ymd"][0]
                chrono["end"]["month"] = dateObj["ymd"][1]
                chrono["end"]["day"] = dateObj["ymd"][2]
                chrono["end"]["century"] = dateObj["century"]
                chrono["end"]["dateStr"] = dateObj["outputStr"]
                chrono["end"]["isOnlyYear"] = dateObj["isOnlyYear"]
                chrono["end"]["isOnlyCentury"] = dateObj["isOnlyCentury"]

        chrono['shortBrief'] = helper.capitalize_first(
            xls.GetSheetValue(row, col_shortBrief))
        chrono['longBrief'] = helper.capitalize_first(
            xls.GetSheetValue(row, col_longBrief))

        chrono['srcUrl'] = xls.GetSheetValue(row, col_url)
        chrono['remark'] = helper.capitalize_first(
            xls.GetSheetValue(row, col_remark))
        chrono['priority'] = xls.GetSheetValue(row, col_priority, True)
        chrono['comment'] = helper.capitalize_first(
            xls.GetSheetValue(row, col_comment))

        entities.append(chrono)
    except Exception as e:
        print(f'Exception input line in row {row}: {chrono}')
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
