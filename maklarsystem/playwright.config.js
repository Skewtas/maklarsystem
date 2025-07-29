module.exports = {
  testDir: './',
  timeout: 30000,
  use: {
    headless: false, // Visar webbläsaren så vi kan se vad som händer
    baseURL: 'http://localhost:3000',
    screenshot: 'on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],
}; 