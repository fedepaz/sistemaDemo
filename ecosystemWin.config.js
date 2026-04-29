module.exports = {
  apps: [
    {
      name: "vivero-backend",
      script: "pnpm",
      args: "--filter backend start:prod",
      cwd: "C:\\vivero-client-alpha",
      env: { NODE_ENV: "production" },
    },
    {
      name: "vivero-frontend",
      script: "pnpm",
      args: "--filter frontend start",
      cwd: "C:\\vivero-client-alpha",
      env: { NODE_ENV: "production" },
    },
  ],
};
