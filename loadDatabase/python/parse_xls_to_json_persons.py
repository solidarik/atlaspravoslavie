from typing import Tuple
import xlrd
import sys
import os
import re
import datetime
from urllib.request import urlopen
from loadDatabase.python.helper import helper
from loadDatabase.python.excel_helper import ExcelHelper
print(sys.stdout.encoding)

root_folder = 'out_persons'

col_surname, col_name, col_middlename = tuple(range(0, 3))
col_birthDate, col_birthPlace = tuple(range(3, 5))
col_monkname = 5

col_achievement_start = 6
col_achievement_end = 10

col_canonizationDate = 12
col_status = 13
col_groupStatus = 14
col_worshipDays = 15

col_profession = 16
col_fullDescription = 17
col_srcUrl = 18
col_photoUrl = 19

col_deathDate = 20
col_deathPlace = 21

filename = os.path.abspath(__file__)
filename += os.path.sep + '..' + os.path.sep + '..' + os.path.sep
filename += 'religion' + os.path.sep + 'святые.xlsx'
book = xlrd.open_workbook(filename, encoding_override="cp1251")

sheet = book.sheet_by_index(0)
START_ROW = 1
END_ROW = sheet.nrows

xls = ExcelHelper(sheet)

print(f"Input count lines from Excel: {END_ROW}")

entities = []
for row in range(START_ROW, END_ROW):
    persons = {}
    try:

        if xls.IsEmptyValue(row, col_name) and xls.IsEmptyValue(
                row, col_surname) and xls.IsEmptyValue(row, col_middlename):
            print(f'Empty line {row}')
            continue

        persons['surname'] = xls.GetSheetValue(row, col_surname)
        persons['name'] = xls.GetSheetValue(row, col_name)
        persons['middlename'] = xls.GetSheetValue(row, col_middlename)
        persons['monkname'] = helper.capitalize_first(
            xls.GetSheetValue(row, col_monkname))

        birthObj = {}
        birthDate = xls.GetSheetValue(row, col_birthDate, True)
        if ('' != birthDate):
            birthDate = xls.GetSheetValueDate(row, col_birthDate)
            birthObj["year"] = birthDate["ymd"][0]
            birthObj["month"] = birthDate["ymd"][1]
            birthObj["day"] = birthDate["ymd"][2]
            birthObj["century"] = birthDate["century"]
            birthObj["dateStr"] = birthDate["outputStr"]
            birthObj["isOnlyYear"] = birthDate["isOnlyYear"]
            birthObj["isOnlyCentury"] = birthDate["isOnlyCentury"]

        if row == 7:
            print('debug')

        birthPlace = xls.GetSheetValue(row, col_birthPlace)
        if birthPlace and 'неизвест' not in birthPlace.lower():
            birthPlace = birthPlace.replace('\\"', '')
            birthObj["place"] = helper.capitalize_first(birthPlace)
        persons["birth"] = birthObj

        deathObj = {}
        deathDate = xls.GetSheetValue(row, col_deathDate, True)
        if ('' != deathDate):
            deathDate = xls.GetSheetValueDate(row, col_deathDate)
            deathObj["year"] = deathDate["ymd"][0]
            deathObj["month"] = deathDate["ymd"][1]
            deathObj["day"] = deathDate["ymd"][2]
            deathObj["century"] = deathDate["century"]
            deathObj["dateStr"] = deathDate["outputStr"]
            deathObj["isOnlyYear"] = deathDate["isOnlyYear"]
            deathObj["isOnlyCentury"] = deathDate["isOnlyCentury"]
        deathPlace = xls.GetSheetValue(row, col_deathPlace)
        if deathPlace and 'неизвест' not in deathPlace.lower():
            deathObj["place"] = helper.capitalize_first(deathPlace)
        persons["death"] = deathObj

        groupStatus = xls.GetSheetValue(row, col_groupStatus)
        groupStatus = groupStatus.lower().replace('мучение', 'мученик')
        if groupStatus not in ['мученик', 'святой', 'преподобный']:
            raise Exception(f'Неправильный статус священника {groupStatus}')
        persons['groupStatus'] = groupStatus
        persons['status'] = xls.GetSheetValue(row, col_status)

        achievs = []
        col_achiev = col_achievement_start
        while col_achiev <= col_achievement_end:
            achievString = xls.GetSheetValue(row, col_achiev)
            if achievString and 'неизвест' not in achievString.lower():
                achievObj = {}
                achievObj["place"] = helper.capitalize_first(achievString)
                achievObj["dateStr"] = xls.GetSheetValue(row, col_achiev + 1)
                achievObj["start"], achievObj[
                    "end"] = xls.GetSheetValueDateRange(row, col_achiev + 1)
                if 'ymd' in achievObj['start']:
                    achievObj["start"]["year"] = achievObj["start"]["ymd"][0]
                    achievObj["start"]["month"] = achievObj["start"]["ymd"][1]
                    achievObj["start"]["day"] = achievObj["start"]["ymd"][2]
                if 'ymd' in achievObj['end']:
                    achievObj["end"]["year"] = achievObj["end"]["ymd"][0]
                    achievObj["end"]["month"] = achievObj["end"]["ymd"][1]
                    achievObj["end"]["day"] = achievObj["end"]["ymd"][2]
                achievs.append(achievObj)
            col_achiev += 2
        persons["achievements"] = achievs

        worshipArr = []
        worships = xls.GetSheetValue(row, col_worshipDays)
        if worships:
            print(worships)
            worships = helper.remove_spaces(worships)
            worships = worships.replace('.', '').replace(';', '/')
            worships = worships.split('/')
            for worship in worships:
                worshipObj = {}
                day = int(worship[0:2])
                month = int(worship[2:4])
                worshipObj["day"] = day
                worshipObj["month"] = month
                worshipObj[
                    "dateStr"] = f'{day} {helper.get_text_of_month_parent_case(month)}'
                worshipArr.append(worshipObj)
        persons["worshipDays"] = worshipArr

        canonizationDate = xls.GetSheetValue(row, col_canonizationDate)
        if ('' != canonizationDate):
            canonizationDate = xls.GetSheetValueDate(row, col_canonizationDate)
            canonizationObj = {}
            canonizationObj["year"] = canonizationDate["ymd"][0]
            canonizationObj["month"] = canonizationDate["ymd"][1]
            canonizationObj["day"] = canonizationDate["ymd"][2]
            canonizationObj["century"] = canonizationDate["century"]
            canonizationObj["dateStr"] = canonizationDate["outputStr"]
            canonizationObj["isOnlyYear"] = canonizationDate["isOnlyYear"]
            canonizationObj["isOnlyCentury"] = canonizationDate[
                "isOnlyCentury"]
            persons["canonizationDate"] = canonizationObj

        persons["profession"] = xls.GetSheetValue(row, col_profession)
        persons["fullDescription"] = xls.GetSheetValue(row,
                                                       col_fullDescription)

        persons["srcUrl"] = xls.GetSheetValue(row, col_srcUrl)
        persons["photoUrl"] = xls.GetSheetValue(row, col_photoUrl)

        entities.append(persons)
    except Exception as e:
        print(f'Exception input line in row {row}: {persons}')
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
