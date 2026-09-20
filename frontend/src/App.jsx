import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [page, setPage] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to load products');
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setPage('detail');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📊 Price Tracker</h1>
        <nav className="nav">
          <button 
            className={page === 'dashboard' ? 'active' : ''} 
            onClick={() => setPage('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={page === 'search' ? 'active' : ''} 
            onClick={() => setPage('search')}
          >
            Add Product
          </button>
        </nav>
      </header>

      <main className="main">
        {page === 'dashboard' && (
          <DashboardPage products={products} onSelectProduct={handleProductSelect} />
        )}
        {page === 'search' && (
          <SearchPage onProductTracked={() => { fetchProducts(); setPage('dashboard'); }} />
        )}
        {page === 'detail' && selectedProduct && (
          <DetailPage 
            product={selectedProduct} 
            onBack={() => setPage('dashboard')}
            onDelete={() => { fetchProducts(); setPage('dashboard'); }}
          />
        )}
      </main>
    </div>
  );
}

// ========== DASHBOARD PAGE ==========
function DashboardPage({ products, onSelectProduct }) {
  return (
    <div className="page">
      <h2>Tracked Products</h2>
      {products.length === 0 ? (
        <p className="empty">No products tracked yet. Add one to get started!</p>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-card" onClick={() => onSelectProduct(product)}>
              {product.product_image && (
                <img src={product.product_image} alt={product.product_name} className="product-image" />
              )}
              <h3>{product.product_name}</h3>
              <p className="product-date">Added: {new Date(product.created_at).toLocaleDateString()}</p>
              <button className="btn-primary">View Details</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== SEARCH PAGE ==========
function SearchPage({ onProductTracked }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tracking, setTracking] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleTrack = async (product) => {
    setTracking(true);
    try {
      const res = await fetch(`${API_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: product.name,
          productUrl: product.url,
          productImage: product.image
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Tracked: ${product.name}`);
        onProductTracked();
      } else {
        alert('Failed to track product');
      }
    } catch (error) {
      console.error('Track error:', error);
      alert('Error tracking product');
    } finally {
      setTracking(false);
    }
  };

  return (
    <div className="page">
      <h2>Search & Add Product</h2>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for a product..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={searching} className="btn-primary">
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="search-results">
          {results.map((product, i) => (
            <div key={i} className="result-item">
              {product.image && <img src={product.image} alt={product.name} className="result-image" />}
              <div className="result-info">
                <h4>{product.name}</h4>
              </div>
              <button 
                onClick={() => handleTrack(product)}
                disabled={tracking}
                className="btn-secondary"
              >
                {tracking ? 'Tracking...' : 'Track'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========== DETAIL PAGE ==========
function DetailPage({ product, onBack, onDelete }) {
  const [history, setHistory] = useState([]);
  const [scrapeLog, setScrapeLog] = useState([]);
  const [activeTab, setActiveTab] = useState('history');
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchScrapeLog();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/history/${product.id}`);
      const data = await res.json();
      setHistory((data.history || []).reverse());
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchScrapeLog = async () => {
    try {
      const res = await fetch(`${API_URL}/api/scrape-log/${product.id}`);
      const data = await res.json();
      setScrapeLog((data.log || []).reverse());
    } catch (error) {
      console.error('Error fetching scrape log:', error);
    }
  };

  const handleManualScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch(`${API_URL}/api/scrape-now/${product.id}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert(`Scrape result: ${data.result.success ? 'Success' : 'Failed'}`);
        fetchHistory();
        fetchScrapeLog();
      } else {
        alert('Scrape failed: ' + data.error);
      }
    } catch (error) {
      console.error('Scrape error:', error);
      alert('Error running scrape');
    } finally {
      setScraping(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${product.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert('Product deleted');
        onDelete();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete product');
    }
  };

  const currentPrice = history.length > 0 ? history[history.length - 1].price : 'N/A';
  const currentStock = history.length > 0 ? history[history.length - 1].stock : 'N/A';

  return (
    <div className="page">
      <button onClick={onBack} className="btn-back">← Back</button>
      
      <div className="product-detail">
        <h2>{product.product_name}</h2>
        <div className="detail-stats">
          <div className="stat">
            <span className="label">Current Price:</span>
            <span className="value">${currentPrice}</span>
          </div>
          <div className="stat">
            <span className="label">Current Stock:</span>
            <span className="value">{currentStock}</span>
          </div>
        </div>

        <div className="detail-actions">
          <button 
            onClick={handleManualScrape} 
            disabled={scraping}
            className="btn-primary"
          >
            {scraping ? 'Scraping...' : 'Scrape Now'}
          </button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>

        <div className="tabs">
          <button 
            className={activeTab === 'history' ? 'active' : ''} 
            onClick={() => setActiveTab('history')}
          >
            Price History ({history.length})
          </button>
          <button 
            className={activeTab === 'log' ? 'active' : ''} 
            onClick={() => setActiveTab('log')}
          >
            Scrape Log ({scrapeLog.length})
          </button>
        </div>

        {activeTab === 'history' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan="4" className="no-data">No history yet</td></tr>
                ) : (
                  history.map((entry, i) => (
                    <tr key={i}>
                      <td>{new Date(entry.scraped_at).toLocaleString()}</td>
                      <td>${entry.price || 'N/A'}</td>
                      <td>{entry.stock ?? 'N/A'}</td>
                      <td>
                        <span className={`status ${entry.status}`}>{entry.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Attempt #</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {scrapeLog.length === 0 ? (
                  <tr><td colSpan="6" className="no-data">No scrape log</td></tr>
                ) : (
                  scrapeLog.map((entry, i) => (
                    <tr key={i}>
                      <td>{new Date(entry.timestamp).toLocaleString()}</td>
                      <td>{entry.attempt_number}</td>
                      <td>
                        <span className={`status ${entry.status}`}>{entry.status}</span>
                      </td>
                      <td>${entry.price || '-'}</td>
                      <td>{entry.stock ?? '-'}</td>
                      <td className="error-text">{entry.error_message || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
