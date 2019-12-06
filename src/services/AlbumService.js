import Album from '../models/Album'
import DatabaseUtil from '../utils/DatabaseUtil'
import StorageUtil from '../utils/StorageUtil'
import sql from 'mssql'
import { stringify } from 'querystring'

function getAlbumsByDiaryUrlName(diaryUrlName) {
    return DatabaseUtil.getConnection()
        .then(con => {
            let request = con.request()
            return request
                .input('diaryUrlName', sql.VarChar, diaryUrlName)
                .query(`
                    WITH cte AS (
                        SELECT
                            p.Id,
                            p.Country,
                            p.Name,
                            a.Filename,
                            d.UrlName,
                            ROW_NUMBER() OVER (
                                PARTITION BY
                                    p.Country,
                                    p.Name
                                ORDER BY p.id ASC
                            ) AS RowNum
                        FROM Places AS p
                        INNER JOIN Entries AS e ON e.PlaceId = p.Id AND e.DiaryId = (SELECT TOP 1 Id FROM Diaries WHERE UrlName = @diaryUrlName)
                        INNER JOIN Attachments AS a ON a.EntryId = e.Id
                        INNER JOIN Diaries AS d ON d.Id = e.DiaryId
                    )
                    SELECT
                        c.Id,
                        c.Country,
                        c.Name,
                        c.Filename,
                        c.UrlName,
                        PhotoCount = (SELECT COUNT(*) FROM cte AS c2 WHERE c2.Id = c.Id)
                    FROM cte AS c
                    WHERE RowNum = 1`)
                .then(res => {
                    let result = []

                    if (res.recordset.length > 0) {
                        let currentCountry = null
                        res.recordset.forEach(row => {
                            if (currentCountry === null || currentCountry.country !== row.Country) {
                                if (currentCountry !== null) {
                                    result.push(currentCountry)
                                }
                                currentCountry = { country: row.Country, albums: []}
                            }
                            currentCountry.albums.push(rowToAlbum(row, row.PhotoCount))
                        })
                        result.push(currentCountry)
                    }
                    return result
                })
            })
}

function rowToAlbum(row, photoCount) {
    let urls = StorageUtil.getAttachmentUrls(row.Filename)
    return new Album(row.Id, row.Name, row.Country, photoCount, urls.thumbnailUrl, urls.fullUrl, row.UrlName)
}

export default {
    getAlbumsByDiaryUrlName: getAlbumsByDiaryUrlName
}
