export default class Entry {

    /**
     * Entry
     * @param {number} id ID
     * @param {string} published Date and time when entry was published (ISO 8061)
     * @param {number} latitude Latitude
     * @param {number} longitude Longitude
     * @param {string} content Content
     * @param {string} placeName Name of the place
     * @param {string} placeCountry Country of the place
     * @param {string} userPublicName Author's public name
     * @param {number} timeZoneOffset Time offset from UTC in minutes
     * @param {Object[]} comments Comments
     * @param {Object[]} attachments Attachments (photos)
     */
    constructor(id, published, latitude, longitude, content, placeName, placeCountry, userPublicName, timeZoneOffset, comments = [], attachments = []) {
        this.id = id
        this.published = published
        this.latitude = latitude
        this.longitude = longitude
        this.content = content
        
        this.place = {
            name: placeName,
            country: placeCountry
        }
        
        this.author = {
            name: userPublicName
        }
        
        this.timeZoneOffset = timeZoneOffset
        this.comments = comments
        this.attachments = attachments
    }
}
