import {
    defineConfig,
    devices
} from '@playwright/test';

export default defineConfig({

    testDir: './tests',

    fullyParallel: false,

    forbidOnly:
        !!process.env.CI,

    retries:
        process.env.CI
            ? 1
            : 0,

    workers: 1,

    reporter: [
        [
            './reporter/custom-reporter.ts'
        ]
    ],

    use: {

        baseURL:
            'https://parabank.parasoft.com',

        trace:
            'on-first-retry',
    },

    projects: [

        {
            name: 'chromium',

            use: {
                ...devices[
                    'Desktop Chrome'
                ]
            }
        }

    ]
});