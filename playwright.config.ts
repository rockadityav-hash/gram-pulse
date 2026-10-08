import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/browser',workers:1,use:{baseURL:process.env.TEST_BASE_URL||'http://localhost:3000',headless:true,launchOptions:{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}},reporter:'list',timeout:60000});
