import moment from 'moment'

class DateUtil {
    
    /**
     * Get a timezone from request header. Fallback to UTC.
     * @param {Object} req Request object
     * @returns {string} Timezone string
     */
    getTimezone(req) {
        let timezone = req.headers['x-timezone']
        if (moment().tz(timezone) !== undefined) {
            return timezone
        } else {
            return 'UTC'
        }
    }

    /**
     * Validate and create a proper year, month and date
     * 
     * @param {string|number} year Year
     * @param {string|number} month Month
     * @param {string|number} day Day
     * @returns {object} Object containing year, month and day if valid; null otherwise
     */
    createDate(year, month, day) {
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            let date = moment.utc({year: year, month: month - 1, day: day})
            return {
                year: date.utc().year(),
                month: date.utc().month() + 1,
                day: date.utc().date()
            }
        }

        return null
    }

    createDateMoment(year, month, day) {
        let date = this.createDate(year, month, day)
        if (date) {
            return moment.utc({year: date.year, month: date.month - 1, day: date.day})
        }
        return null
    }
}

export default new DateUtil()
