import typing
import helper
import re

__all__ = [
    'IsEmptyValue', 'GetSheetValue', 'GetSheetValueDateRange',
    'GetSheetValueDate', 'GetSheetValueArr'
]


class ExcelHelper():
    def __init__(self, sheet):
        self.sheet = sheet

    def IsEmptyValue(self, row, col):
        v = self.sheet.cell(row, col).value
        return (v == '')

    def GetSheetValue(self, row, col, isSimple=False):
        cell_value = self.sheet.cell(row, col).value
        if (isSimple and isinstance(cell_value, float)):
            v = str(int(round(cell_value, 0)))
        else:
            v = str(cell_value)
        return v.replace('"', '\\"').rstrip().rstrip(',')

    def GetSheetValueDateRange(self, row: int,
                               col: int) -> typing.Tuple[dict, dict]:
        sheetValue = self.sheet.cell(row, col).value
        if not sheetValue:
            return {}, {}

        if '-' in str(sheetValue):
            dateArr = str(sheetValue).split('-')
            start = helper.get_date_from_input(dateArr[0])
            end = helper.get_date_from_input(dateArr[1])
            return start, end
        else:
            start = helper.get_date_from_input(sheetValue)
            return start, start

    def GetSheetValueDate(self, row, col):
        dateExcel = self.sheet.cell(row, col).value
        if re.match(r'.*[.]0$', str(dateExcel)):  # убираем float
            dateExcel = int(round(float(dateExcel)))
        return helper.get_date_from_input(str(dateExcel))

    def GetSheetValueArr(self, row, col, split_char=';'):
        val = self.sheet.cell(row, col).value
        if ('' == val):
            return []
        return val.split(split_char)