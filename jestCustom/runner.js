
const JestRunner = require('jest-runner').default;
const { Test,
    TestRunnerContext,
    TestWatcher,
    OnTestStart,
    OnTestSuccess,
    OnTestFailure,
    TestRunnerOptions
} = require('jest-runner');

const playwright = require('playwright');

// nodes_modules/jest-runner/build/index.js
class CustomRunner extends JestRunner {

    /**
     * @param {import('@jest/types').Config} globalConfig 
     * @param {TestRunnerContext} context 
     */
    constructor(globalConfig, context) {
        super(globalConfig, context);
        console.log('###### Update Snapshot: ', globalConfig.updateSnapshot);

        this.playwrightServerTypes = [];
        this.playwrightServers = {};
    }

    /**
     * @param {Array<Test>} tests 
     * @param {TestWatcher} watcher 
     * @param {OnTestStart} onStart 
     * @param {OnTestSuccess} onResult 
     * @param {OnTestFailure} onFailure 
     * @param {TestRunnerOptions} options 
     */
    async runTests(
        tests,
        watcher,
        onStart,
        onResult,
        onFailure,
        options,
    ) {
        const allPlaywrightServers = Array.from(tests).map(test => (
            {
                type: test.context.config.globals.browserType,
                browserOptions: test.context.config.globals.browserOptions,
            }
        ));
        const map = new Map();
        for (const item of allPlaywrightServers) {
            if (!map.has(item.type)) {
                map.set(item.type, true);
                this.playwrightServerTypes.push({
                    type: item.type,
                    browserOptions: item.browserOptions
                });
            }
        }

        // TODO: SERVER VS BROWSER;
        // await this.launchPlaywrightServers(this.playwrightServerTypes);
        this.playwrightBrowsers = {
            'chromium': await playwright['chromium'].launch(),
            'firefox':  await playwright['firefox'].launch(),
            'webkit': await playwright['webkit'].launch(),
        };
        const a = this.playwrightBrowsers['chrome'];
        tests.forEach(test => {
            const type = test.context.config.globals.browserType;
            // TODO: SERVER VS BROWSER;
            // test.context.config.globals['browserServerWebSocket'] = this.playwrightServers[type].webSocket;
            test.context.config.globals['browser'] = this.playwrightBrowsers[type];
        });

        await super.runTests(tests, watcher, onStart, onResult, onFailure, options);

        // TODO: SERVER VS BROWSER;
        // await this.closePlaywrightServers();
        await this.playwrightBrowsers['chromium'].close();
        await this.playwrightBrowsers['firefox'].close();
        await this.playwrightBrowsers['webkit'].close();
    }


    /**
     * This function launches the Playwright servers
     * @param serverTypes - an array of strings, each string is a server type.
     */
    async launchPlaywrightServers(serverTypes) {
        for (const playwrightServer of serverTypes) {
            console.log(playwrightServer.browserOptions);
            const pwServer = await playwright[playwrightServer.type].launchServer(
                playwrightServer.browserOptions,
            );
            const wsEndpoint = pwServer.wsEndpoint();
            this.playwrightServers[playwrightServer.type] = {
                object: pwServer,
                webSocket: wsEndpoint,
            };
        }
    }

    async closePlaywrightServers() {
        const promises = Array.from(Object.keys(this.playwrightServers)).map(type => this.playwrightServers[type].object.close());
        return Promise.all(promises);
    }

}

module.exports = CustomRunner;