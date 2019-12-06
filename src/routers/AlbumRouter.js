import AlbumService from '../services/AlbumService'
import AttachmentService from '../services/AttachmentService'
import DiaryService from '../services/DiaryService'
import Logger from '../utils/Logger'
import albumsMock from '../utils/mock_data/albums'
import attachmentsMock from '../utils/mock_data/attachments'
import config from '../config'
import express from 'express'

const logger = Logger.create('AlbumRouter')
const router = express.Router({ mergeParams: true })
const useMocks = config.app.useMock

router.get('/', (req, res) => {
  if (useMocks) {
    res.status(200).send(albumsMock)
  } else {
    DiaryService
    .exists(req.params.urlName)
    .then(exists => {
      if (exists) {
        AlbumService
          .getAlbumsByDiaryUrlName(req.params.urlName)
          .then(albums => {
            res.status(200).send({ albums: albums })
          })
          .catch(err => {
            logger.error(err, 'Fetching albums failed')
            res.sendStatus(500)
          })
      } else {
        res.sendStatus(404)
      }
    })
  }
})

router.get('/:placeId/attachments', (req, res) => {
  if (useMocks) {
    res.status(200).send(attachmentsMock)
  } else {
    AttachmentService
    .getByPlaceId(req.params.placeId)
    .then(attachments => {
      res.status(200).send({ attachments: attachments })
    })
    .catch(err => {
      logger.error(err, 'Fetching attachments failed')
      res.sendStatus(500)
    })
  }
})

export default router
