import { defineConfig, devices } from "@playwright/test";

/**
 * Two builds are tested because NEXT_PUBLIC_ values are fixed at build time:
 *   npm run test:e2e             a test WhatsApp number and a mock orders database
 *   npm run test:e2e:unconfigured   exactly what ships today, nothing configured
 */
const unconfigured = process.env.E2E_MODE === "unconfigured";
const PORT = unconfigured ? 3211 : 3210;
const MOCK_PORT = 54399;
const MOCK_KEY = "e2e-only-key";

export const TEST_ADMIN_PASSWORD = "e2e-only-admin-password";

export default defineConfig({
  testDir: "./e2e",
  testMatch: unconfigured ? "unconfigured.spec.ts" : "site.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Optional: point at an already-installed Chromium instead of downloading one.
    launchOptions: process.env.E2E_CHROMIUM ? { executablePath: process.env.E2E_CHROMIUM } : {},
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 850 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: unconfigured
    ? [{ command: `npx next start -p ${PORT}`, port: PORT, reuseExistingServer: false, timeout: 60_000 }]
    : [
        {
          command: "node e2e/mock-postgrest.mjs",
          port: MOCK_PORT,
          reuseExistingServer: false,
          env: { MOCK_PORT: String(MOCK_PORT), SUPABASE_SERVICE_ROLE_KEY: MOCK_KEY },
        },
        {
          command: `npx next start -p ${PORT}`,
          port: PORT,
          reuseExistingServer: false,
          timeout: 60_000,
          env: {
            SUPABASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
            SUPABASE_SERVICE_ROLE_KEY: MOCK_KEY,
            ADMIN_PASSWORD: TEST_ADMIN_PASSWORD,
            INSECURE_ADMIN_COOKIE: "1",
          },
        },
      ],
});
