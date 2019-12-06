import DatabaseUtil from '../utils/DatabaseUtil'
import Diary from '../models/Diary'
import moment from 'moment-timezone'
import pino from 'pino'
import sql from 'mssql'

const logger = pino({ name: 'DiaryService'})

/**
 * Diary exists
 * @param {string} urlName Diary URL name
 * @returns {boolean}
 */
function exists (urlName) {
  return DatabaseUtil.getConnection()
    .then(con => {
      return con.request()
        .input('urlName', sql.VarChar, urlName)
        .query('SELECT 1 FROM Diaries WHERE UrlName = @urlName')
        .then(res => {
          return res.recordset.length > 0
        })
    })
}

function all (timezone) {
  return DatabaseUtil.getConnection()
    .then(con => {
      return con.request()
        .query(`
          SELECT
              d.*,
              LatestEntryDate = (SELECT TOP 1 e.Published FROM Entries AS e WHERE e.DiaryId = d.Id ORDER BY e.Published DESC)
          FROM Diaries AS d
          ORDER BY d.TripBegins DESC`)
        .then(res => {
          return res.recordset.map(row => rowToDiary(row, timezone))
        })
    })
}

function findByUrlName (urlName, timezone) {
  return DatabaseUtil.getConnection()
    .then(con => {
      return con.request()
        .input('urlName', sql.VarChar, urlName)
        .query(
          `SELECT
              d.*,
              LatestEntryDate = (SELECT TOP 1 CAST(e.Published AS date) FROM Entries AS e WHERE e.DiaryId = d.Id ORDER BY e.Published DESC)
          FROM Diaries AS d
          WHERE d. UrlName = @urlName`)
        .then(res => {
          if (res.recordset.length > 0) {
            return rowToDiary(res.recordset[0], timezone)
          } else {
            return null
          }
        })
    })
}

function getLatestDate (urlName, timezone) {
  return DatabaseUtil.getConnection()
    .then(con => {
      return con.request()
        .input('urlName', sql.VarChar, urlName)
        .query(`
          SELECT TOP 1
              Published
          FROM Entries
          WHERE DiaryId = (SELECT TOP 1 Id FROM Diaries WHERE UrlName = @urlName)
          ORDER BY Published DESC`)
        .then(res => {
          if (res.recordset.length > 0) {
            return moment.utc(res.recordset[0].Published).tz(timezone)
          } else {
            return null
          }
        })
    })
}

function getNextAndPreviousDate (urlName, currentDate) {
  const minDate = currentDate.clone().startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss')
  const maxDate = currentDate.clone().endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss')
  const timezone = currentDate.tz()

  return DatabaseUtil.getConnection()
    .then(con => {
      const previousDayPromise = con.request()
        .input('urlName', sql.VarChar, urlName)
        .input('date', sql.VarChar, minDate)
        .query(`
          SELECT TOP 1
              Published
          FROM Entries
          WHERE DiaryId = (SELECT TOP 1 Id FROM Diaries WHERE UrlName = @urlName)
          AND Published < @date
          ORDER BY Published DESC`)
        .then(res => {
          if (res.recordset[0]) {
            return moment.utc(res.recordset[0].Published).tz(timezone)
          }
          return null
        })

      const nextDayPromise = con.request()
        .input('urlName', sql.VarChar, urlName)
        .input('date', sql.VarChar, maxDate)
        .query(`
          SELECT TOP 1
              Published
          FROM Entries
          WHERE DiaryId = (SELECT TOP 1 Id FROM Diaries WHERE UrlName = @urlName)
          AND Published > @date
          ORDER BY Published ASC`)
        .then(res => {
          if (res.recordset[0]) {
            return moment.utc(res.recordset[0].Published).tz(timezone)
          }
          return null
        })

      return Promise.all([previousDayPromise, nextDayPromise])
        .then(result => {
          const [previousDate, nextDate] = result
          const previousDatePath = previousDate ? `/${urlName}/${previousDate.format(`YYYY/MM/DD`)}` : null
          const nextDatePath = nextDate ? `/${urlName}/${nextDate.format(`YYYY/MM/DD`)}` : null

          return {
            currentDate: currentDate,
            previousDatePath: previousDatePath,
            nextDatePath: nextDatePath
          }
        })
    })
}

function rowToDiary (row, timezone) {
  if (timezone === null || timezone === undefined || timezone === '') {
    timezone = 'UTC'
  }
  
  const latestEntryDate = moment.utc(row.LatestEntryDate)
  const pathDatePart = latestEntryDate ? `/${latestEntryDate.tz(timezone).format('YYYY/MM/DD')}` : ''
  const path = `/${row.UrlName}${pathDatePart}`

  return new Diary(row.Id, row.Name, row.UrlName, path)
}

export default {
  all: all,
  findByUrlName: findByUrlName,
  getLatestDate: getLatestDate,
  getNextAndPreviousDate: getNextAndPreviousDate,
  exists: exists
}
