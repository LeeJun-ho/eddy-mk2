export default () => ({
  env: process.env.NODE_ENV || 'development',
  app: {
    name: process.env.APP_NAME || 'eddy-mk2',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  db: {
    sqlite: {
      path: process.env.DB_SQLITE_PATH || './data/mk2.db',
    },
    debug: process.env.DB_DEBUG ? process.env.DB_DEBUG.toLowerCase() === 'true' : false,
  },
});
