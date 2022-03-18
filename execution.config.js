const { devices } = require('playwright');
// const { runningOnDocker } = require('../helpers/environment.helper');
const fs = require('fs');

let config = {
    mocks: {
        startServer: true,
    },
    parallelExecution: {
        blockedTests: ['error.test.js'],
    },
    playwrightConfig: {
        browserSetups: [
            getBrowserConfig('chromium', { viewport: { width: 1920, height: 1080 } }, false, 'ChromeDesktop'),
            // getBrowserConfig('chromium', devices['Pixel 5'], true, 'ChromeMobile'),
            // getBrowserConfig('firefox', { viewport: { width: 1920, height: 1080 } }, false, 'FirefoxDesktop'),
            // getBrowserConfig('firefox', devices['Pixel 5'], true, 'FirefoxMobile'),
            // getBrowserConfig('webkit', { viewport: { width: 1920, height: 1080 } }, false, 'WebKitDesktop'),
            // getBrowserConfig('webkit', devices['iPhone 12 Pro Max'], true, 'WebKitMobile'),
        ],
        servers: ['chromium', 'firefox', 'webkit'],
        serverOptions: {
            headless: true,
        },
    },
    reporters: {
        addJUnit: true,
        junitConfig: [
            'jest-junit',
            {
                ancestorSeparator: ' › ',
                classNameTemplate: 'PayByLink Int Describe: {classname}',
                outputDirectory: './testResults',
                uniqueOutputName: 'true',
                usePathForSuiteName: 'true',
                titleTemplate: 'PayByLink Int Test: {title}',
                includeConsoleOutput: true,
            },
        ],
        addAllure: true,
        allureConfig: {
            resultsDir: './allure-results',
            addTestCodeAsAttachment: true,
            screenshotOnFailure: true,
            zipReportAfterFinish: true,
            suffix: 'pbl',
        },
    },
    screenshots: {
        onSuccess: false,
        onFailure: true,
        prefix: 'pbl',
    },
};

if (fs.existsSync(`${__dirname}/execution.config.dev.js`)) {
    const executionUserConfig = require('./execution.config.dev.js');
    config = { ...config, ...executionUserConfig };
}

module.exports = {
    ...config,
};

function getBrowserConfig(browserType, contextOptions, isMobile = false, customDisplayName = '') {
    const displayName = customDisplayName || `${browserType} (${contextOptions.viewport.width} x ${contextOptions.viewport.height})`;
    let result = {
        browserType: browserType,
        name: browserType,
        displayName,
        tags: [browserType],
        contextOptions: {
            ignoreHTTPSErrors: true,
            ...contextOptions,
        },
    };

    /**
     * According to Playwright docs, isMobile parameter it's not supported in Firefox.
     * The tags property, it's not used by Playwright directly. It's used by the custom test functions (from @config/jest-playwright)
     * in order to filter setups easily, avoiding using the viewport, and also enabling other filters (e.g. landscape);
     */
    if (browserType === 'firefox' && isMobile) {
        result.contextOptions['isMobile'] = false;
        delete result.contextOptions.defaultBrowserType;
    }
    const browserModeTag = isMobile ? 'isMobile' : 'isDesktop';
    result.tags.push(browserModeTag);

    return result;
}
