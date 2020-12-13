from typing import Tuple
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


def GetSheetValueDateRange(row: int, col: int) -> Tuple[dict, dict]:
    sheetValue = GetSheetValue(row, col)
    if not sheetValue:
        return {}, {}

    if '-' in sheetValue:
        dateArr = sheetValue.split('-')
        start = helper.get_date_from_input(dateArr[0])
        end = helper.get_date_from_input(dateArr[1])
        return start, end
    else:
        start = helper.get_date_from_input(sheetValue)
        return start, {}


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
        persons['monkname'] = capitalizeFirst(GetSheetValue(row, col_monkname))

        birthObj = {}
        birthDate = GetSheetValue(row, col_birthDate, True)
        if ('' != birthDate):
            birthDate = GetSheetValueDate(row, col_birthDate)
            birthObj["year"] = birthDate["ymd"][0]
            birthObj["month"] = birthDate["ymd"][1]
            birthObj["day"] = birthDate["ymd"][2]
            birthObj["century"] = birthDate["century"]
            birthObj["dateStr"] = birthDate["outputStr"]
            birthObj["isOnlyYear"] = birthDate["isOnlyYear"]
            birthObj["isOnlyCentury"] = birthDate["isOnlyCentury"]
        birthPlace = GetSheetValue(row, col_birthPlace)
        if birthPlace and 'неизвест' not in birthPlace.lower():
            birthPlace = birthPlace.replace('\\"', '')
            birthObj["place"] = capitalizeFirst(birthPlace)
        persons["birth"] = birthObj

        deathObj = {}
        deathDate = GetSheetValue(row, col_deathDate, True)
        if ('' != deathDate):
            deathDate = GetSheetValueDate(row, col_deathDate)
            deathObj["year"] = deathDate["ymd"][0]
            deathObj["month"] = deathDate["ymd"][1]
            deathObj["day"] = deathDate["ymd"][2]
            deathObj["century"] = deathDate["century"]
            deathObj["dateStr"] = deathDate["outputStr"]
            deathObj["isOnlyYear"] = deathDate["isOnlyYear"]
            deathObj["isOnlyCentury"] = deathDate["isOnlyCentury"]
        deathPlace = GetSheetValue(row, col_deathPlace)
        if deathPlace and 'неизвест' not in deathPlace.lower():
            deathObj["place"] = capitalizeFirst(deathPlace)
        persons["death"] = deathObj

        groupStatus = GetSheetValue(row, col_groupStatus)
        groupStatus = groupStatus.lower().replace('мучение', 'мученик')
        if groupStatus not in ['мученик', 'святой', 'преподобный']:
            raise Exception(f'Неправильный статус священника {groupStatus}')
        persons['groupStatus'] = groupStatus
        persons['status'] = GetSheetValue(row, col_status)

        achievs = []
        col_achiev = col_achievement_start
        while col_achiev <= col_achievement_end:
            achievString = GetSheetValue(row, col_achiev)
            if achievString and 'неизвест' not in achievString.lower():
                achievObj = {}
                achievObj["place"] = capitalizeFirst(achievString)
                achievObj["start"], achievObj["end"] = GetSheetValueDateRange(
                    row, col_achiev + 1)
                achievs.append(achievObj)
            col_achiev += 2
        persons["achievements"] = achievs

        worshipArr = []
        worships = GetSheetValue(row, col_worshipDays)
        if worships:
            worships = helper.remove_spaces(worships)
            worships = worships.replace('.', '').replace(';', '/')
            worships = worships.split('/')
            for worship in worships:
                worshipObj = {}
                worshipObj["day"] = int(worship[0:2])
                worshipObj["month"] = int(worship[2:4])
                worshipArr.append(worshipObj)
        persons["worshipDays"] = worshipArr

        canonizationDate = GetSheetValue(row, col_canonizationDate)
        if ('' != canonizationDate):
            canonizationDate = GetSheetValueDate(row, col_canonizationDate)
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

        persons["profession"] = GetSheetValue(row, col_profession)
        persons["fullDescription"] = GetSheetValue(row, col_fullDescription)

        persons["srcUrl"] = GetSheetValue(row, col_srcUrl)
        persons["photoUrl"] = GetSheetValue(row, col_photoUrl)

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
