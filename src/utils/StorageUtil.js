import config from '../config'
import { StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from '@azure/storage-blob'

class StorageUtil {

    constructor() {
        let account = config.storage.account
        let accountKey = config.storage.accountKey
        this.baseUrl = `https://${account}.blob.core.windows.net`
        this.sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey)
    }

    getAttachmentUrls(filename) {
        let container = 'attachments'
        let suffix = filename.split('.').pop();
        let prefix = filename.split('.').slice(0, -1).join(".")
        
        let thumbnailFilename = `${prefix}_tn.${suffix}`
        let fullSizeFilename = `${prefix}_full.${suffix}`
    
        let startsOn = new Date();
        let expiresOn = new Date(startsOn.valueOf() + 86400 * 1000)
        let startsOnUtc = new Date(startsOn.getTime() + startsOn.getTimezoneOffset() * 60000);
        let expiresOnUtc = new Date(expiresOn.getTime() + expiresOn.getTimezoneOffset() * 60000);
        
        const SAS = generateBlobSASQueryParameters({
            containerName: container,
            permissions: BlobSASPermissions.parse("r"),
            startsOn: startsOnUtc,
            expiresOn: expiresOnUtc,
            contentType: 'image/jpeg'
        }, this.sharedKeyCredential)
        
        const thumbnailUrl = `${this.baseUrl}/${container}/${thumbnailFilename}?${SAS.toString()}`
        const fullUrl = `${this.baseUrl}/${container}/${fullSizeFilename}?${SAS.toString()}`

        return {
            thumbnailUrl: thumbnailUrl,
            fullUrl: fullUrl
        }
    }

}

export default new StorageUtil()
