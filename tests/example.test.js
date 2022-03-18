describe('Example Suite', () => {

    test('Example Test 1', async () => {
        await page.goto('https://www.example.com');
        console.log(await page.title());
        expect(1).toBe(1);
    });
});