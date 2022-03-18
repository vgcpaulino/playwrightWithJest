const runner = './jestCustom/runner.js';
const testEnvironment = './jestCustom/environment.js';
const executionConfig = require('./execution.config');

const projects = getProjects(executionConfig.playwrightConfig.browserSetups);

module.exports = {
    reporters: ['jest-spec-reporter'],
    
    projects,
    // projects: [
    //     
    //     {
    //         displayName: 'ChromeDesktop',
    //         globals: {
    //             browserType: 'chromium',
    //             browserOptions: {
    //                 headless: true,
    //             },
    //         },
    //         runner,
    //         testEnvironment
    //     },
    //     /** @type {import('@jest/types/build/Config')} */
    //     {
    //         displayName: 'FirefoxDesktop',
    //         globals: {
    //             browserType: 'firefox',
    //             browserOptions: {
    //                 headless: true,
    //             },
    //         },
    //         runner,
    //         testEnvironment
    //     }
    // ]
}

function getProjects(browserSetups) {
    return Array.from(browserSetups).map(setup => (
        /** @type {import('@jest/types/build/Config')} */
        {
            displayName: setup.displayName,
            globals: {
                browserType: setup.browserType,
                browserOptions: {
                    headless: true,
                },
                contextOptions: setup.contextOptions,
            },
            runner,
            setupFilesAfterEnv: ['./jestCustom/jestCustomTest.js'],
            testEnvironment,
            testTimeout: 180000,
        }
    ));
}

