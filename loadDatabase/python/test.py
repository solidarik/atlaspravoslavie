from typing import List
import helper
import typing
import sys


def GetSheetValueDateRange(sheetValue):
    if not sheetValue:
        return {}, {}

    if '-' in str(sheetValue):
        dateArr = sheetValue.split('-')
        start = helper.get_date_from_input(dateArr[0])
        end = helper.get_date_from_input(dateArr[1])
        return start, end
    else:
        start = helper.get_date_from_input(sheetValue)
        return start, {}


if __name__ == "__main__":
    func = GetSheetValueDateRange
    #func = helper.get_date_from_input
    res = func('07.08.0626')
    print(res)
    res = func('15 августа 1219 года')
    print(res)
    res = func('24 июля 1330')
    print(res)
    res = func(7723.0)
    print(res)
    res = func('100')
    print(res)
    res = func('')
    print(res)
    # res = func(float(2116))
    # print(res)
    sys.exit(0)
