import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import './Store.css'; // We'll create this next

const Store = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: '',
        search: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'createdAt_desc'
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Build query string
            const queryParams = new URLSearchParams();
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
            if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/all?${queryParams.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filters]); // Refetch when filters change

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="store-container">
            <div className="store-header">
                <h1>Campus Store</h1>
                <Link to="/store/sell" className="sell-btn">
                    + Sell Product
                </Link>
                <Link to="/store/chat" className="sell-btn" style={{ marginLeft: '10px', background: '#4CAF50' }}>
                    My Chats
                </Link>
            </div>

            <div className="store-layout">
                {/* Sidebar Filters */}
                <aside className="store-sidebar">
                    <div className="filter-group">
                        <input
                            type="text"
                            name="search"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label>Category</label>
                        <select name="category" value={filters.category} onChange={handleFilterChange}>
                            <option value="">All Categories</option>
                            <option value="Books">Books</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Stationery">Stationery</option>
                            <option value="Uniform">Uniform</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Price Range</label>
                        <div className="price-inputs">
                            <input
                                type="number"
                                name="minPrice"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                            />
                            <input
                                type="number"
                                name="maxPrice"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Sort By</label>
                        <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                            <option value="createdAt_desc">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                        </select>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className="product-grid">
                    {loading ? (
                        <p>Loading products...</p>
                    ) : products.length > 0 ? (
                        products.map(product => (
                            <div key={product._id} className="product-card">
                                <Link to={`/store/product/${product._id}`} className="product-link">
                                    <div className="product-image">
                                        <img src={product.images[0]} alt={product.title} />
                                        {/* <span className="category-tag">{product.category}</span> */}
                                    </div>
                                    <div className="product-info">
                                        <h3>{product.title}</h3>
                                        <p className="price">₹{product.price}</p>
                                        <div className="product-meta">
                                            <span>{product.location}</span>
                                            <span className="condition">{product.condition}</span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="no-products">
                            <p>No products found. Be the first to list one!</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Store;
