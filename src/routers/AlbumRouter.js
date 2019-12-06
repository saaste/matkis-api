import AlbumService from '../services/AlbumService'
import AttachmentService from '../services/AttachmentService'
import DiaryService from '../services/DiaryService'
import express from 'express'
import pino from 'pino'

const logger = pino()
const router = express.Router({ mergeParams: true })

router.get('/', (req, res) => {
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
})

router.get('/:placeId/attachments', (req, res) => {
  AttachmentService
    .getByPlaceId(req.params.placeId)
    .then(attachments => {
      res.status(200).send({ attachments: attachments })
    })
    .catch(err => {
      logger.error(err, 'Fetching attachments failed')
      res.sendStatus(500)
    })
})

export default router
