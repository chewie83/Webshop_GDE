const { validateProduct } = require('../utils');

describe('Termék validáció tesztek', () => {
    
    test('Elfogadja a helyes adatokat', () => {
        const product = { name: "PLA Filament", price: 8500 };
        expect(validateProduct(product)).toBe(true);
    });

    test('Elutasítja a 0 vagy negatív árat', () => {
        const product = { name: "Ingyen Filament", price: 0 };
        expect(validateProduct(product)).toBe(false);
    });

    test('Elutasítja az üres nevet', () => {
        const product = { name: "", price: 5000 };
        expect(validateProduct(product)).toBe(false);
    });

});