module.exports = {
  apps: [
    {
      name: 'ud-frontend',
      script: './node_modules/.bin/next',
      args: 'start',
      cwd: '/var/www/ud-webiste/ud-c',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
