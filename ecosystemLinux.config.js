module.exports = {
  apps: [
    {
      name: "vivero-backend",
      script: "pnpm",
      args: "--filter backend start:prod",
      interpreter: "bash", // 👈 forces bash execution
      cwd: process.cwd(),
      env: { NODE_ENV: "production" },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      time: true,
    },
    {
      name: "vivero-frontend",
      script: "pnpm",
      args: "--filter frontend start",
      interpreter: "bash", // 👈 same here
      cwd: process.cwd(),
      env: { NODE_ENV: "production" },
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      time: true,
    },
  ],
};
