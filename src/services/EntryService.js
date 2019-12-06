import AttachmentService from './AttachmentService'
import CommentService from './CommentService'
import DatabaseUtil from '../utils/DatabaseUtil'
import DateUtil from '../utils/DateUtil'
import DiaryService from './DiaryService'
import Entry from '../models/Entry'
import sql from 'mssql'

function getByDiaryUrlName(diaryUrlName, withComments = false, withAttachments = false) {
    return DiaryService.getLatestDate(diaryUrlName)
        .then(date => {
            if (date) {
                return getByDiaryUrlNameAndDate(diaryUrlName, date.year, date.month, date.day, withComments, withAttachments)
            } else {
                return []
            }
        })
}

/**
 * Get diary by URL name and date
 * @param {string} diaryUrlName Diary URL name
 * @param {Object} date Moment object
 * @param {boolean} withComments Return with comments
 * @param {boolean} withAttachments Return with attachments
 * @deprecated("Will be replaced with ISO 8601 date")
 */
function getByDiaryUrlNameAndDate(diaryUrlName, date, withComments = false, withAttachments = false) {
    const minDate = date.clone().startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss')
    const maxDate = date.clone().endOf('day').utc().format('YYYY-MM-DDTHH:mm:ss')

    return DatabaseUtil.getConnection()
        .then(con => {
            return con.request()
                .input('diaryUrlName', sql.VarChar, diaryUrlName)
                .input('minDate', sql.VarChar, minDate)
                .input('maxDate', sql.VarChar, maxDate)
                .query(`
                    SELECT
                        e.*,
                        p.Name AS PlaceName,
                        p.Country AS PlaceCountry,
                        u.PublicName As UserPublicName,
                        DATEPART(TZoffset, CAST(e.Published AT TIME ZONE 'UTC' AT TIME ZONE p.TimeZoneId AS DATETIMEOFFSET)) AS TimeZoneOffset
                    FROM Entries AS e
                    INNER JOIN Places AS p ON p.Id = e.PlaceId
                    INNER JOIN Users AS u ON u.Id = e.UserId
                    WHERE e.DiaryId = (SELECT TOP 1 d.Id FROM Diaries AS d WHERE d.UrlName = @diaryUrlName)
                    AND Published BETWEEN @minDate AND @maxDate
                    ORDER BY e.Published ASC`)
                .then(res => {
                    if (res.recordset.length > 0) {
                        const entries = res.recordset.map(row => rowToEntry(row))
                        const entryIds = entries.map(e => e.id)

                        const commentPromise = withComments ? CommentService.getByEntryIds(entryIds, date.tz()) : Promise.resolve([])
                        const attachmentPromise = withAttachments ? AttachmentService.getByEntryIds(entryIds) : Promise.resolve([])

                        return Promise.all([commentPromise, attachmentPromise])
                            .then(results => {
                                const [comments, attachments] = results
                                
                                return entries.map(entry => {
                                    entry.comments = comments[entry.id] || []
                                    entry.attachments = attachments[entry.id] || []
                                    return entry
                                })
                            })
                    } else {
                        return []
                    }
    
                })
        })
}

function rowToEntry(row) {
    return new Entry(row.Id, row.Published, row.Latitude, row.Longitude, row.Content, row.PlaceName, row.PlaceCountry, row.UserPublicName, row.TimeZoneOffset) 
}

export default {
    getByDiaryUrlName: getByDiaryUrlName,
    getByDiaryUrlNameAndDate: getByDiaryUrlNameAndDate
}
