export default class Diary {

    /**
     * Diary
     * @param {number} id ID
     * @param {string} name Name
     * @param {string} urlName Name used in URL
     * @param {string} path Diary path
     */
    constructor(id, name, urlName, path) {
        this.id = id
        this.name = name
        this.urlName = urlName
        this.path = path
    }
}
