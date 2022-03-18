
test.debug = async function(name, fn, timeout) {
    global.enableDebug();
    return test.only(name, fn, timeout);
}

test.retryOnException = async function(retriesQty, exception, name, fn, timeout) {
    const baseCallExpection = 'Invalid argument when calling test.retry,';    
    if (typeof retriesQty !== 'number') throw new Error(`${baseCallExpection} retriesQty must be a integer.`);
    if (typeof exception !== 'string') throw new Error(`${baseCallExpection} exception must be a string with the expection.`)
    if (!name || typeof name !== 'string') throw new Error(`${baseCallExpection} name must be a integer.`);
    if (!fn || typeof fn !== 'function') throw new Error(`${baseCallExpection} fn must be a Jest Test fn.`);

    test(name, async () => {
        const exceptionToRetry = exception.replace(/(\r\n|\n|\r)/gm," ").toLowerCase();
        let latestError;
        for (let tries = 0; tries < retriesQty; tries++) {           
            try {
                await runTest(fn);
                return;
            } catch(error) {
                latestError = error;
                if (typeof error === 'object') {
                    const errorMessage = error.stack.toLowerCase();
                    const result = errorMessage.includes(exceptionToRetry);
                    if (result) {
                        log(`INFO - RETRING THE TEST: ${name}!`);
                        continue;
                    } else {
                        console.log('false');
                    }
                    break;
                }
            }
        }

        throw latestError;
    });
}

function runTest(handler) {
    return new Promise((resolve, reject) => {
        const result = handler((err) => err ? reject(err) : resolve());
        if (result && result.then) {
            result.catch(reject).then(resolve);
        } else {
            resolve();
        }
    });
}