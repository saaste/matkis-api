export default class Attachment {
    /**
     * Attachment (photo)
     * @param {string} thumbnailUrl Thumbnail URL
     * @param {sting} fullUrl Full size URL
     */
    constructor(thumbnailUrl, fullUrl) {
        this.thumbnailUrl = thumbnailUrl
        this.fullUrl = fullUrl
    }
}
