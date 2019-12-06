import pino from 'pino'

const logger = pino()

export default function (req, res, next) {
  const timezone = req.headers['x-timezone'] || 'NO-TIMEZONE'
  logger.info(`${req.method} ${req.url} - ${timezone}`);
  next()
}
