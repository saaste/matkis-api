import pino from 'pino'

const _logger = pino({name: 'Logger'})

function create(name) {
  if (!name || name === '') {
    _logger.warn('You created a logger without a name')
  }
  return pino({name: name})
}

export default {
  create: create
}
