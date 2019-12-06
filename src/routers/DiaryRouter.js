import DateUtil from '../utils/DateUtil'
import DiaryService from '../services/DiaryService'
import Logger from '../utils/Logger'
import config from '../config'
import express from 'express'
import mockDiaries from '../utils/mock_data/diaries'
import mockDiary from '../utils/mock_data/diary'

const logger = Logger.create('DiaryRouter')
const router = express.Router()
const useMocks = config.app.useMock

router.get('/', (req, res) => {
  if (useMocks) {
    res.status(200).send(mockDiaries)
  } else {
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
  }
})

router.get('/:urlName', (req, res) => {
  if (useMocks) {
    res.status(200).send(mockDiary)
  } else {
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
  }
})

export default router
