export default () => ({
  jira: {
    baseUrl: process.env.JIRA_BASE_URL || '',
    email: process.env.JIRA_EMAIL || '',
    apiToken: process.env.JIRA_API_TOKEN || '',
  },
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
