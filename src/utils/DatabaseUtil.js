import sql from 'mssql'
import config from '../config'
import pino from 'pino'

const logger = pino()

class DatabaseUtils {
    constructor() {
        logger.info('Initializing database...')
        
        this.pool = new sql.ConnectionPool(config.database);
        this.pool.on('error', err => {
            logger.error(err, 'Database connection pool error')
        })

        this.connection = this.pool.connect().then(con => {
            logger.info('Database connection intialized')
            return con
        }).catch(err => {
            logger.error(err, 'Error connecting database')
        });

    }

    /**
     * Get a database connection
     */
    getConnection() {
        return this.connection
    }

    /**
     * Prepare IN query
     * From: https://github.com/tediousjs/node-mssql/issues/313#issuecomment-409879580
     * 
     * @param request sql request object
     * @param {string} columnName sql table column name
     * @param {string} paramNamePrefix prefix for parameter name
     * @param type parameter type
     * @param {Array<string>} values an array of values
     */
    parameteriseQueryForIn(request, columnName, parameterNamePrefix, type, values) {
        if (values.length > 0) {
            var parameterNames = [];
            for (var i = 0; i < values.length; i++) {
            var parameterName = parameterNamePrefix + i;
            request.input(parameterName, type, values[i]);
            parameterNames.push(`@${parameterName}`);
            }
            return `${columnName} IN (${parameterNames.join(',')})`
        } else {
            return '1 = 0'
        }
    }
}

export default new DatabaseUtils()