const retryFn = require('../jestCustom/retry');

describe('Example Suite', () => {
    // retryFn('Random value should eventually resolve to 1', 100, () => {
    //     expect(getRandomInt(0, 2)).toBe(1);
    // });

    const exception = 'expect(received).toBe(expected)';
    test.retryOnException(10, exception, 'Random value should eventually resolve to 1', () => {
        // expect(true).toBeFalsy();
        expect(getRandomInt(0, 2)).toBe(5);
    });
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + miß
}
