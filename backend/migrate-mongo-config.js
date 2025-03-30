require("dotenv").config();

module.exports = {
  mongodb: {
    url: process.env.DB_CONNECTION_STRING,
    databaseName: process.env.DB_NAME,
  },
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  migrationsDir: "src/migration",
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
};
