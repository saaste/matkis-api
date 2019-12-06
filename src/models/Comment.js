export default class Comment {

    /**
     * Comment
     * @param {number} id ID
     * @param {string} published Published (ISO 8061)
     * @param {string} authorName Author's name
     * @param {string} content Content
     * @param {string} reply Reply
     */
    constructor(id, published, authorName, content, reply) {
        this.id = id
        this.published = published
        this.content = content
        this.reply = reply
        this.author = {
            name: authorName
        }
    }
}
