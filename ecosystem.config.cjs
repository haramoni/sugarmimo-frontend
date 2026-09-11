module.exports = {
  apps: [
    {
      name: "sugarmimo-web",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      autorestart: true,
      env: { NODE_ENV: "production" },
    },
  ],
};
