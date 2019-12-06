require('dotenv').config()

export default {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    encrypt: process.env.DB_ENCRYPT === 'true'
  },
  storage: {
    account: process.env.STORAGE_ACCOUNT,
    accountKey: process.env.STORAGE_ACCOUNT_KEY
  }
}
