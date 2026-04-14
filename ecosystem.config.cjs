module.exports = {
  apps: [
    {
      name: 'eddy-mk2-batch',
      script: 'dist/main.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      out_file: './logs/pm2/out.log',
      error_file: './logs/pm2/error.log',
      log_file: './logs/pm2/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
