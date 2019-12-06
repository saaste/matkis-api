import Comment from '../models/Comment'
import DatabaseUtil from '../utils/DatabaseUtil'
import moment from 'moment-timezone'
import sql from 'mssql'

function getByEntryIds(entryIds, timezone) {
    if (entryIds !== undefined && entryIds.length > 0) {
        const distinctIds = [...new Set(entryIds)]
        return DatabaseUtil.getConnection()
            .then(con => {
                let request = con.request()
                return request
                    .query(`
                        SELECT
                            Id,
                            EntryId,
                            Published,
                            AuthorName,
                            Content,
                            Reply
                        FROM Comments
                        WHERE ` + DatabaseUtil.parameteriseQueryForIn(request, 'EntryId', 'entryIdParam', sql.Int, distinctIds) + `
                        ORDER BY Published ASC`)
                    .then(res => {
                        let commentsByEntry = {}
                        
                        res.recordset.forEach(row => {
                            if (!commentsByEntry[row.EntryId]) {
                                commentsByEntry[row.EntryId] = []
                            }
                            commentsByEntry[row.EntryId].push(rowToComment(row, timezone))
                        })
                        return commentsByEntry
                    })
                })
    } else {
        return Promise.resolve([])
    }
}

function rowToComment(row, timezone) {
    let published = moment.utc(row.Published).tz(timezone)
    return new Comment(row.Id, published, row.AuthorName, row.Content, row.Reply)
}

export default {
    getByEntryIds: getByEntryIds
}
