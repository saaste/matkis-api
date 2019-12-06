import DateUtil from '../utils/DateUtil'
import DiaryService from '../services/DiaryService'
import EntryService from '../services/EntryService'
import express from 'express'
import moment from 'moment-timezone'
import pino from 'pino'

const logger = pino()
const router = express.Router({mergeParams: true})

router.get('/', (req, res) => {
    
    let timezone = DateUtil.getTimezone(req)
    let withComments = !(req.query['comments'] === 'false')
    let withAttachments = !(req.query['attachments'] === 'false')
    
    DiaryService
    .getLatestDate(req.params.urlName, timezone)
    .then(date => {
        if (date) {
            let datesPromise = DiaryService.getNextAndPreviousDate(req.params.urlName, date, timezone)
            let entriesPromise = EntryService.getByDiaryUrlNameAndDate(req.params.urlName, date, withComments, withAttachments)

            Promise.all([datesPromise, entriesPromise])
                .then(results => {
                    let [dates, entries] = results
                    res.status(200).send({dates: dates, entries: entries})
                })
                .catch(err => {
                    logger.error(err, 'Fetching entries failed')
                    res.sendStatus(500)
                })
        } else {
            res.status(200).send({dates: null, entries:[]})
        }
    })
})

router.get('/date/:year/:month/:day', (req, res) => {
    
    let timezone = DateUtil.getTimezone(req)
    let currentDate = moment.tz({year: req.params.year, month: req.params.month - 1, day: req.params.day}, timezone)
    let withComments = !(req.query['comments'] === 'false')
    let withAttachments = !(req.query['attachments'] === 'false')
    
    let datesPromise = DiaryService.getNextAndPreviousDate(req.params.urlName, currentDate)
    let entriesPromise = EntryService.getByDiaryUrlNameAndDate(req.params.urlName, currentDate, withComments, withAttachments)

    Promise.all([datesPromise, entriesPromise])
        .then(results => {
            let [dates, entries] = results
            res.status(200).send({dates: dates, entries: entries})
        })
        .catch(err => {
            logger.error(err, 'Fetching entries failed')
            res.sendStatus(500)
        })




})


export default router
