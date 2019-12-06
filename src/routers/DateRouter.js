import DateUtil from '../utils/DateUtil'
import DiaryService from '../services/DiaryService'
import config from '../config'
import datesMock from '../utils/mock_data/dates'
import express from 'express'
import moment from 'moment'

const router = express.Router({mergeParams: true})
const useMocks = config.app.useMock

router.get('/', (req, res) => {
    if (useMocks) {
        return res.status(200).send(datesMock)
    } else {
        let timezone = DateUtil.getTimezone(req)
        let urlName = req.params.urlName
        
        DiaryService.getLatestDate(urlName, timezone).then(latestDate => {
            
            if (!latestDate) {
                return res.sendStatus(404)
            }
    
            let currentDate = latestDate
    
            if (req.query.year !== undefined && req.query.month !== undefined && req.query.day !== undefined) {
                currentDate = moment.tz({year: req.query.year, month: req.query.month, day: req.query.day}, timezone)
            }
    
            DiaryService.getNextAndPreviousDate(urlName, currentDate).then(dates => {
                return res.status(200).send(dates)
            })
        })
    }
})

export default router
