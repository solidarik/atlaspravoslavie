import xlrd
import sys
import os
import re
import datetime
from urllib.request import urlopen
import helper
print(sys.stdout.encoding)

root_folder = 'out_persons'

col_surname, col_name, col_middlename = tuple(range(0, 3))
col_birthDate, col_birthPlace = tuple(range(3, 5))
col_monkname = 5

col_achievement_start = 6
col_achievement_counts = 3

col_canonizationDate = 12
col_status = 13
col_worshipDates = 14

col_professional = 15
col_fullDescription = 16
col_srcUrl = 17
col_photoUrl = 18

col_deathDate = 19
col_deathPlace = 20


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
filename += 'religion' + os.path.sep + 'святые.xlsx'
book = xlrd.open_workbook(filename, encoding_override="cp1251")

scheet = book.sheet_by_index(0)
START_ROW = 1
END_ROW = scheet.nrows

print(f"Input count lines from Excel: {END_ROW}")

entities = []
for row in range(START_ROW, END_ROW):
    persons = {}
    try:

        if IsEmptyValue(row, col_name) and IsEmptyValue(
                row, col_surname) and IsEmptyValue(row, col_middlename):
            print(f'Empty line {row}')
            continue

        persons['surname'] = GetSheetValue(row, col_surname)
        persons['name'] = GetSheetValue(row, col_name)
        persons['middlename'] = GetSheetValue(row, col_middlename)

        birthDate = GetSheetValue(row, col_birthDate, True)
        if ('' != birthDate):
            birthObj = {}
            birthDate = GetSheetValueDate(row, col_birthDate)
            birthObj["year"] = birthDate["ymd"][0]
            birthObj["month"] = birthDate["ymd"][1]
            birthObj["day"] = birthDate["ymd"][2]
            birthObj["century"] = birthDate["century"]
            birthObj["dateStr"] = birthDate["outputStr"]
            birthObj["isOnlyYear"] = birthDate["isOnlyYear"]
            birthObj["isOnlyCentury"] = birthDate["isOnlyCentury"]
            persons["birth"] = birthObj

        holyStatus = GetSheetValue(row, col_status)
        if holyStatus not in ['blalbalba']:
            raise Exception(f'Неправильный статус священника {holyStatus}')

        entities.append(persons)
        continue
        persons['']
        col_birthDate, col_birthPlace = tuple(range(3, 5))
        col_monkname = 5

        col_achievement_start = 6
        col_achievement_counts = 3

        col_canonizationDate = 12
        col_status = 13
        col_worshipDates = 14

        col_professional = 15
        col_fullDescription = 16
        col_srcUrl = 17
        col_photoUrl = 18

        col_deathDate = 19
        col_deathPlace = 20

        dateStr = GetSheetValue(row, col_date, True)
        if ('' != dateStr):
            if '-' in dateStr:
                dateArr = dateStr.split('-')
                startDate = helper.get_date_from_input(dateArr[0])
                persons["startYear"] = startDate["ymd"][0]
                persons["startMonth"] = startDate["ymd"][1]
                persons["startDay"] = startDate["ymd"][2]
                persons["startDateStr"] = startDate["outputStr"]
                persons["startIsOnlyYear"] = startDate["isOnlyYear"]

                endDate = helper.get_date_from_input(dateArr[1])
                persons["endYear"] = endDate["ymd"][0]
                persons["endMonth"] = endDate["ymd"][1]
                persons["endDay"] = endDate["ymd"][2]
                persons["endDateStr"] = endDate["outputStr"]
                persons["endIsOnlyYear"] = endDate["isOnlyYear"]
            else:
                if GetSheetValue(row, col_date):
                    startDate = GetSheetValueDate(row, col_date)
                    persons["startYear"] = startDate["ymd"][0]
                    persons["startMonth"] = startDate["ymd"][1]
                    persons["startDay"] = startDate["ymd"][2]
                    persons["startDateStr"] = startDate["outputStr"]
                    persons["startIsOnlyYear"] = startDate["isOnlyYear"]

        persons['srcUrl'] = GetSheetValue(row, col_srcUrl)
        persons['eparchyUrl'] = GetSheetValue(row, col_eparchyUrl)
        persons['abbots'] = capitalizeFirst(GetSheetValue(row, col_abbots))

        entities.append(persons)
    except Exception as e:
        print(f'Exception input line in row {row}: {persons}')
        raise Exception(e)

i = 0

helper.clear_folder(helper.get_full_path(root_folder))
helper.create_folder(helper.get_full_path(root_folder))

for i in range(len(entities)):
    item = entities[i]
    filename = 'file{}.json'.format(i)
    filename = helper.get_full_path(os.path.join(root_folder, filename))
    helper.save_json(item, filename)

print("Completed read to json files")
exit(0)
