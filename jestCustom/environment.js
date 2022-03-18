const NodeEnvironment = require('jest-environment-node');
const playwright = require('playwright');

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    this.testPath = context.testPath;
    this.docblockPragmas = context.docblockPragmas;

    this.globals = config.globals;
    this.projectName = config.displayName.name;
    /** @type {import('playwright').BrowserType} */
    this.browserType = this.globals.browserType;
    this.browserOptions = this.globals.browserOptions;
    this.browserWebSocket = this.globals.browserServerWebSocket;
    this.contextOptions = this.globals.contextOptions;

    /** @type {import('playwright').Browser} */
    this.global.browser;
    /** @type {import('playwright').BrowserContext} */
    this.global.context;
    /** @type {import('playwright').Page} */
    this.global.page;

    this.debug = false;
  }

  async setup() {
    await super.setup();
    await this.launchBrowser();

    this.global.configPlaywright = {
      browser: async () => this.setupBrowser(),
    };

    this.global.enableDebug = () => this.debug = true;
    this.global.log = (message) => console.log(message);
  }

  async teardown() {
    await super.teardown();
    await this.closeBrowser({ closePage: true, closeBrowser: true });
  }

  getVmContext() {
    return super.getVmContext();
  }

  async handleTestEvent(event, state) {
    switch (event.name) {
      case 'add_test':
        event.testName += ` | ${this.projectName}`;
        break;
      case 'test_start':
        event.test.name += ` | ${this.projectName}`;
        break;
      case 'test_fn_start':
        await this.setupBrowser();
        await this.global.context.tracing.start({ screenshots: true, snapshots: true });
        break;
      case 'test_fn_failure':
        const describeName = event.test.parent.name.replace(/\W/g, '-');
        const testName = event.test.name.replace(/\W/g, '-');
        await this.global.context.tracing.stop({ path: `${describeName}-${testName}.zip` });
        break
      case 'test_done':
        await this.closeBrowser({ closeBrowser: this.debug, closePage: true });
        this.debug = false;
        break;
    }
  }

  async launchBrowser() {
    if (this.debug) {
      await this.global.browser.close();
      this.global.browser = await playwright[this.browserType].launch({ headless: false });
    } else {
      this.global.browser = await playwright[this.browserType].connect(this.browserWebSocket);
    }
  }

  async setupBrowser() {
    // Browsers;
    if (!this.global.browser || this.debug) await this.launchBrowser();
    // Context;
    this.global.context = await this.global.browser.newContext();
    // this.global.context = await this.globals.chromiumBrowser.newContext();
    // Page;
    this.global.page = await this.global.context.newPage();
    if (this.debug) await this.global.page.pause();
  }

  async closeBrowser({ closePage = false, closeBrowser = false }) {
    if (closePage && this.global.page) {
      await this.global.page.close();
      await this.global.context.close();
    }
    if (closeBrowser && this.global.browser) await this.global.browser.close();
  }

  async playwrightTrace({ start = false, close = false, path = './' }) {
    console.log('######', start, close);
    if (start) await this.global.context.tracing.start({ screenshots: true, snapshots: true });
    if (close) {
      await this.global.context.tracing.stop({ path: path });
    }
  }
}

module.exports = CustomEnvironment;