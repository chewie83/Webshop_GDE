import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Összes');

  const categories = ['Összes', 'PLA', 'ABS', 'PETG', 'ASA', 'TPU'];

  useEffect(() => {
    axios.get('http://localhost:5001/api/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => console.error("Hiba:", error));
  }, []);

  // KOMBINÁLT SZŰRÉS: Kategória ÉS Keresőszó alapján
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeFilter === 'Összes' || product.category?.name === activeFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.color.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>3D Filament Webshop</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Minőségi alapanyagok 3D nyomtatáshoz</p>

      {/* --- KERESŐ MEZŐ --- */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <input 
          type="text"
          placeholder="Keresés név vagy szín alapján..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '12px 20px',
            borderRadius: '25px',
            border: '2px solid #2196F3',
            fontSize: '1rem',
            outline: 'none',
            boxShadow: '0 2px 10px rgba(33, 150, 243, 0.1)'
          }}
        />
      </div>

      {/* --- KATEGÓRIA VÁLASZTÓ --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        flexWrap: 'wrap', 
        gap: '15px', 
        marginBottom: '40px' 
      }}>
        {categories.map(cat => (
          <div 
            key={cat}
            onClick={() => setActiveFilter(cat)}
            style={{
              width: '110px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activeFilter === cat ? '#2196F3' : 'white',
              color: activeFilter === cat ? 'white' : '#333',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              border: '2px solid #2196F3'
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* --- TERMÉK LISTA --- */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredProducts.map(product => (
          <div key={product.id} style={{ 
            backgroundColor: 'white', 
            borderRadius: '10px', 
            padding: '20px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '-30px', 
              backgroundColor: '#2196F3', 
              color: 'white', 
              padding: '5px 30px', 
              transform: 'rotate(45deg)',
              fontSize: '0.7rem'
            }}>
              {product.category?.name}
            </div>
            <h3 style={{ marginTop: '0', paddingRight: '30px' }}>{product.name}</h3>
            <p>Szín: <strong>{product.color}</strong></p>
            <p style={{ color: '#e44d26', fontWeight: 'bold', fontSize: '1.2rem' }}>{product.price} Ft</p>
            <button style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>Kosárba</button>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3>Sajnáljuk!</h3>
          <p>Nincs a keresésnek megfelelő termék.</p>
          <button onClick={() => {setSearchTerm(''); setActiveFilter('Összes');}} style={{color: '#2196F3', cursor: 'pointer', border: 'none', background: 'none', textDecoration: 'underline'}}>
            Szűrések törlése
          </button>
        </div>
      )}
    </div>
  );
}

export default App;