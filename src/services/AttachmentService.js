import Attachment from '../models/Attachment'
import DatabaseUtil from '../utils/DatabaseUtil'
import StorageUtil from '../utils/StorageUtil'
import sql from 'mssql'

function getByEntryIds(entryIds) {
    if (entryIds !== undefined && entryIds.length > 0) {
        const distinctIds = [...new Set(entryIds)]
        return DatabaseUtil.getConnection()
            .then(con => {
                let request = con.request()
                return request
                    .query(`
                        SELECT *
                        FROM Attachments
                        WHERE ` + DatabaseUtil.parameteriseQueryForIn(request, 'EntryId', 'entryIdParam', sql.Int, distinctIds) + `
                        ORDER BY Id ASC`)
                    .then(res => {
                        let attachmentsByEntry = {}
                        
                        res.recordset.forEach(row => {
                            if (!attachmentsByEntry[row.EntryId]) {
                                attachmentsByEntry[row.EntryId] = []
                            }
                            attachmentsByEntry[row.EntryId].push(rowToAttachment(row))
                        })
                        return attachmentsByEntry
                    })
                })
    } else {
        Promise.resolve([])
    }
}

function getByPlaceId(placeId) {
    return DatabaseUtil.getConnection()
    .then(con => {
        let request = con.request()
        return request
            .input('placeId', sql.Int, placeId)
            .query(`
                SELECT
                    a.*
                FROM Attachments AS a
                INNER JOIN Entries AS e ON e.Id = a.EntryId
                WHERE e.PlaceId = @placeId
                ORDER BY e.Published ASC, a.Id ASC`)
            .then(res => {
                return res.recordset.map(row => rowToAttachment(row))
            })
        })
}

function rowToAttachment(row) {
    let urls = StorageUtil.getAttachmentUrls(row.Filename)
    return new Attachment(urls.thumbnailUrl, urls.fullUrl)
}

export default {
    getByEntryIds: getByEntryIds,
    getByPlaceId: getByPlaceId
}
