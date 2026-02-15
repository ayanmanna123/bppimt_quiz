import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import './Store.css';

const SellProduct = () => {
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Books',
        condition: 'Good',
        location: '',
        images: []
    });
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.images.length > 5) {
            alert("Maximum 5 images allowed");
            return;
        }

        setFormData({ ...formData, images: [...formData.images, ...files] });

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('category', formData.category);
        data.append('condition', formData.condition);
        data.append('location', formData.location);

        formData.images.forEach(image => {
            data.append('images', image);
        });

        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/store/create`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success) {
                navigate('/store');
            }
        } catch (error) {
            console.error("Error creating product:", error);
            alert("Failed to list product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="store-container">
            <div className="sell-form-container">
                <h2>List a Product</h2>
                <form onSubmit={handleSubmit} className="sell-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" name="title" required value={formData.title} onChange={handleChange} />
                    </div>

                    <div className="form-section-row">
                        <div className="form-group">
                            <label>Price (₹)</label>
                            <input type="number" name="price" required value={formData.price} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Location (e.g., Library)</label>
                            <input type="text" name="location" required value={formData.location} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-section-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange}>
                                <option value="Books">Books</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Stationery">Stationery</option>
                                <option value="Uniform">Uniform</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Condition</label>
                            <select name="condition" value={formData.condition} onChange={handleChange}>
                                <option value="New">New</option>
                                <option value="Like New">Like New</option>
                                <option value="Good">Good</option>
                                <option value="Fair">Fair</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" rows="4" required value={formData.description} onChange={handleChange}></textarea>
                    </div>

                    <div className="form-group">
                        <label>Images (Max 5)</label>
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                        <div className="image-previews">
                            {imagePreviews.map((src, i) => (
                                <img key={i} src={src} alt="Preview" className="preview-thumb" />
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Listing...' : 'List Data'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SellProduct;
