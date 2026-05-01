import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useUser 
} from "@clerk/clerk-react";

const publishableKey =  process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  boxSizing: 'border-box' // Hogy ne lógjon ki a keretből
};



function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Összes');
  const [cart, setCart] = useState([]);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    color: '',
    image: '',
    categoryId: 1
  });
  const categories = ['Összes', 'PLA', 'ABS', 'PETG', 'ASA', 'TPU'];
  useEffect(() => {
    axios.get('http://localhost:5001/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error("Hiba:", error));
  }, []);
    const handleUpload = async (e) => {
    e.preventDefault();
    // Ellenőrzés
    if (!newProduct.name || !newProduct.price) {
      alert("Kérlek töltsd ki a nevet és az árat!");
      return;
    }
    try {
      const response = await axios.post('http://localhost:5001/api/products', {
        name: newProduct.name,
        price: parseInt(newProduct.price),
        color: newProduct.color,
        image: newProduct.image,
        categoryId: parseInt(newProduct.categoryId)
      });
      if (response.status === 201) {
        alert("Termék sikeresen hozzáadva!");
        setShowAdminModal(false); // Ablak bezárása
        
        // Frissítjük a listát, hogy azonnal látszódjon az új termék
        setProducts([...products, response.data]);
      }
    } catch (error) {
      console.error("Hiba a feltöltésnél:", error);
      alert("Hiba történt. Ellenőrizd a konzolt!");
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Biztosan törölni szeretnéd ezt a terméket?")) {
      try {
        await axios.delete(`http://localhost:5001/api/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
        alert("Termék törölve!");
      } catch (error) {
        console.error("Hiba a törlésnél:", error);
        alert("Nem sikerült a törlés.");
      }
    }
  };
  const addToCart = (product) => setCart([...cart, product]);
  const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeFilter === 'Összes' || product.category?.name === activeFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.color.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <MainLayout 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        activeFilter={activeFilter} setActiveFilter={setActiveFilter}
        categories={categories}
        filteredProducts={filteredProducts}
        addToCart={addToCart}
        cart={cart}
        removeFromCart={removeFromCart}
        totalPrice={totalPrice}
        showAdminModal={showAdminModal}
        setShowAdminModal={setShowAdminModal}
        handleUpload={handleUpload}
        handleDelete={handleDelete}
        setNewProduct={setNewProduct}
        newProduct={newProduct}
      />
    </ClerkProvider>
  );
}

function MainLayout(props) {
  const { user } = useUser();
  // Admin emailek megadása
  const userEmail = user?.primaryEmailAddress?.emailAddress;
  const isAdmin = userEmail === "pandur.akos@gmail.com" || 
                  userEmail === "MESZAROS.GYORGY@gde.hu" ||
                  userEmail === "ad5rk4@neptun.gde.hu";
  const { 
                    showAdminModal, setShowAdminModal, handleUpload, setNewProduct, newProduct, handleDelete 
                  } = props;
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial' }}>
      
      {/* FEJLÉC / NAVIGÁCIÓ */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '15px 40px', 
        backgroundColor: '#2196F3', // Kék háttér, hogy biztosan látszódjon
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
      
        <h2 style={{ margin: 0 }}>📦 3D Filament Shop</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{ 
                padding: '10px 20px', 
                backgroundColor: 'white', 
                color: '#2196F3', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold' 
              }}>
                Belépés
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {isAdmin && (
                <button 
                  onClick={() => setShowAdminModal(true)}
                  style={{ padding: '8px 15px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Admin Felület
                </button>
              )}
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </nav>

      {/* TARTALOM */}
      <div style={{ display: 'flex', padding: '20px' }}>
        
        {/* Bal oldal: Termékek */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <input 
              type="text" 
              placeholder="Keresés..." 
              value={props.searchTerm} 
              onChange={(e) => props.setSearchTerm(e.target.value)}
              style={{ width: '100%', maxWidth: '400px', padding: '12px', borderRadius: '25px', border: '1px solid #ddd' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
            {props.categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => props.setActiveFilter(cat)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: props.activeFilter === cat ? '#2196F3' : 'white',
                  color: props.activeFilter === cat ? 'white' : '#333',
                  border: '1px solid #2196F3',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
            {props.filteredProducts.map(product => (
              <div key={product.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <img src={product.image} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'contain', marginBottom: '10px' }} />
                <h4 style={{ margin: '5px 0' }}>{product.name}</h4>
                <p style={{ color: '#e44d26', fontWeight: 'bold' }}>{product.price.toLocaleString()} Ft</p>
                <button 
                  onClick={() => props.addToCart(product)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  Kosárba
                </button>
                {isAdmin && (
                    <button 
                        onClick={() => handleDelete(product.id)}
                        style={{ 
                          backgroundColor: '#ff4d4d', 
                          color: 'white', 
                          border: 'none', 
                          padding: '8px 15px', 
                          borderRadius: '5px',
                          cursor: 'pointer',
                          marginTop: '10px',
                          width: '100%',
                          fontWeight: 'bold'
                        }}
                      >
                        Törlés
                    </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Jobb oldal: Kosár (Csak ha nem üres) */}
        {props.cart.length > 0 && (
          <div style={{ width: '300px', marginLeft: '20px', backgroundColor: 'white', padding: '20px', borderRadius: '10px', height: 'fit-content', position: 'sticky', top: '100px' }}>
            <h3>🛒 Kosár</h3>
            {props.cart.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span>{item.name}</span>
                <button onClick={() => props.removeFromCart(index)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <hr />
            <div style={{ fontWeight: 'bold', textAlign: 'right' }}>Összesen: {props.totalPrice.toLocaleString()} Ft</div>
          </div>
        )}
      </div>
      {/* ADMIN MODAL ABLAK */}
      {showAdminModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>📦 Új termék hozzáadása</h2>
            <form onSubmit={handleUpload}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Termék neve:</label>
              <input style={inputStyle} type="text" placeholder="pl. Galaxy Blue PLA" onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
              
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ár (Ft):</label>
              <input style={inputStyle} type="number" placeholder="9500" onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
              
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Szín:</label>
              <input style={inputStyle} type="text" placeholder="Kék" onChange={(e) => setNewProduct({...newProduct, color: e.target.value})} required />
              
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Kép URL:</label>
              <input style={inputStyle} type="text" placeholder="https://..." onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} required />
              
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Kategória:</label>
              <select style={inputStyle} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})}>
                <option value="1">PLA</option>
                <option value="2">ABS</option>
                <option value="3">PETG</option>
                <option value="4">ASA</option>
                <option value="5">TPU</option>
              </select>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowAdminModal(false)} style={{ padding: '10px 20px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Mégse</button>
                <button type="submit" style={{ padding: '10px 25px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Termék mentése</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;