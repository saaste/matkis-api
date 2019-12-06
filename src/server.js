import AlbumRouter from './routers/AlbumRouter'
import DateRouter from './routers/DateRouter'
import DiaryRouter from './routers/DiaryRouter'
import EntryRouter from './routers/EntryRouter'
import Logger from './utils/Logger'
import RequestLogger from './utils/RequestLogger'
import SwaggerUI from 'swagger-ui-express'
import YAML from 'yamljs'
import config from './config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

const logger = Logger.create('server');
const app = express()
const port = config.app.port
const swaggerDocument = YAML.load('./swagger.yaml')

app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(RequestLogger)

app.get('/', (req, res) => {
  return res.sendStatus(200)
})

app.use('/diaries', DiaryRouter)
app.use('/diaries/:urlName/entries', EntryRouter)
app.use('/diaries/:urlName/albums', AlbumRouter)
app.use('/diaries/:urlName/dates', DateRouter)
app.use('/api-docs', SwaggerUI.serve, SwaggerUI.setup(swaggerDocument));

app.listen(port, () => {
  logger.info(`Server running in ${config.app.env.toUpperCase()} mode on port ${port}`)
})
