require('dotenv').config();
const configDevelopment = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DIALECT,
  logging: false,
  timezone: process.env.TIMEZONE,
  // dialectOptions: {
  // ssl: {
  //   require: true,
  //   rejectUnauthorized: false
  // }
  // }
}

const configQuery = {
  ...configDevelopment,
  query: {
    // raw: true,
    // plain: true,
    // nest: true
  },
  // raw: true,
  // nest: true,
}
module.exports = {
  development: configDevelopment,
  configQuery
}
