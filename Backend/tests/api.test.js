const request = require('supertest');
const app = require('../server'); 

describe('Termék API Integrációs Tesztek', () => {
    
    test('POST /api/products - Új termék sikeres létrehozása', async () => {
        const newProduct = {
            name: "Integrációs Teszt Filament",
            price: 9900,
            color: "Neon Zöld",
            image: "https://example.com/test.jpg",
            categoryId: 1
        };

        const response = await request(app)
            .post('/api/products')
            .send(newProduct);

        expect(response.statusCode).toBe(201);
        expect(response.body.name).toBe(newProduct.name);
    });

    test('POST /api/products - Hiba hibás adatok esetén (400)', async () => {
        const response = await request(app)
            .post('/api/products')
            .send({ name: "", price: -100 });

        expect(response.statusCode).toBe(400);
    });
});