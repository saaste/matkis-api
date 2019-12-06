export default class Album {

  /**
   * Album
   * @param {number} placeId Place ID
   * @param {string} placeName Place name
   * @param {string} placeCountry Place country
   * @param {number} photoCount Number of photos
   * @param {string} thumbnailUrl Thumbnail URL
   * @param {string} fullUrl Full size URL
   */
  constructor(placeId, placeName, placeCountry, photoCount, thumbnailUrl, fullUrl, diaryUrlName) {
    this.place = {
      name: placeName,
      country: placeCountry

    }
    this.photoCount = photoCount
    this.previewImage = {
      thumbnailUrl: thumbnailUrl,
      fullUrl: fullUrl
    }
    this.path = `/${diaryUrlName}/albums/${placeId}`
  }
}
