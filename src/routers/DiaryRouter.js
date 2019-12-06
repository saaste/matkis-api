import DateUtil from '../utils/DateUtil'
import DiaryService from '../services/DiaryService'
import Logger from '../utils/Logger'
import express from 'express'

const logger = Logger.create('DiaryRouter')
const router = express.Router()

router.get('/', (req, res) => {
  const timezone = DateUtil.getTimezone(req)
  DiaryService
    .all(timezone)
    .then(diaries => {
      res.status(200).send({ diaries: diaries })
    })
    .catch(err => {
      logger.error(err, 'Fetching diaries failed')
      res.sendStatus(500)
    })
})

router.get('/:urlName', (req, res) => {
  const urlName = req.params.urlName
  const timezone = DateUtil.getTimezone(req)
  DiaryService.findByUrlName(urlName, timezone)
    .then(diary => {
      if (diary) {
        res.status(200).send(diary)
      } else {
        res.sendStatus(404)
      }
    })
})

export default router
