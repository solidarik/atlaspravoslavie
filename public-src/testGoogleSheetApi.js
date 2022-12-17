import {google} from 'googleapis'
import dotenv from 'dotenv'
dotenv.config()

import authentication from '../loadDatabase/googleAuthentication.js'

async function main () {

  const spreadsheetId = ''
  const range = "A2:A4"

  const sheets = google.sheets('v4')

  // const authClient = await authorize()
  const authClient = await authentication.authenticate()

  sheets.spreadsheets.values.update({
    auth: authClient,
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    resource: { range: "A2:A4", majorDimension: "COLUMNS", values: [
      ["testhello", 'hello', 'people']] },
  })
  return 'hello, world'
}

(async () => {
  const res = await main();
  console.log(res)
})()