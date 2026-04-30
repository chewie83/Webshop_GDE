import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Összes');
  const [cart, setCart] = useState([]);

  const categories = ['Összes', 'PLA', 'ABS', 'PETG', 'ASA', 'TPU'];

  useEffect(() => {
    axios.get('http://localhost:5001/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error("Hiba:", error));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeFilter === 'Összes' || product.category?.name === activeFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.color.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial' }}>
      
      {/* --- FŐ TARTALOM --- */}
      <div style={{ flex: '1', padding: '20px' }}>
        <h1 style={{ textAlign: 'center' }}>3D Filament Shop</h1>
        
        {/* Kereső */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Keresés név vagy szín alapján..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '12px', borderRadius: '25px', border: '1px solid #2196F3', outline: 'none' }}
          />
        </div>

        {/* Kategóriák */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveFilter(cat)}
              style={{
                padding: '10px 20px',
                backgroundColor: activeFilter === cat ? '#2196F3' : 'white',
                color: activeFilter === cat ? 'white' : '#333',
                border: '2px solid #2196F3',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: '0.2s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Termék rács */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(product => (
            <div key={product.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: '4px solid #2196F3' }}>
              
              <div style={{ 
                    width: '100%', 
                    height: '180px', 
                    backgroundColor: '#f9f9f9', 
                    borderRadius: '8px', 
                    marginBottom: '15px', 
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #eee'
              }}>
                {product.image ? (
              <img 
              src={product.image} 
                alt={product.name} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />
              ) : (
              <div style={{ color: '#ccc', fontSize: '0.8rem' }}>Nincs kép</div>
              )}
              </div>
              <h3 style={{ margin: '0 0 10px 0' }}>{product.name}</h3>
              <p style={{ margin: '5px 0' }}>Szín: <strong>{product.color}</strong></p>
              <p style={{ fontWeight: 'bold', color: '#e44d26', fontSize: '1.2rem' }}>{product.price.toLocaleString('hu-HU', { useGrouping: true })} Ft</p>
              <button 
                onClick={() => addToCart(product)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Kosárba teszem
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* --- DINAMIKUS OLDALSÁV (Csak ha van benne valami) --- */}
      {cart.length > 0 && (
        <div style={{ 
          width: '320px', 
          backgroundColor: 'white', 
          borderLeft: '2px solid #ddd', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '-5px 0 15px rgba(0,0,0,0.05)',
          animation: 'fadeIn 0.3s ease-in' // Egy kis finom megjelenés
        }}>
          <h2 style={{ borderBottom: '2px solid #f0f2f5', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>🛒 Kosaram</span>
            <span style={{ fontSize: '0.8rem', backgroundColor: '#2196F3', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{cart.length} db</span>
          </h2>
          
          <div style={{ flex: '1', overflowY: 'auto' }}>
              {cart.map((item, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '10px', 
                  padding: '10px', 
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#e44d26' }}>{item.price} Ft</div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(index)}
                    style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>

          <div style={{ borderTop: '2px solid #f0f2f5', paddingTop: '20px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
              <span>Összesen:</span>
              <span style={{ color: '#2196F3' }}>{totalPrice} Ft</span>
            </div>
            <button style={{ 
              width: '100%', 
              padding: '15px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              Fizetés indítása
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;