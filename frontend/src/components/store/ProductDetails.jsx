import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import './Store.css';

const ProductDetails = () => {
    const { getAccessTokenSilently } = useAuth0();
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = await getAccessTokenSilently({
                    audience: "http://localhost:5000/api/v2",
                });
                const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/store/product/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setProduct(data.product);
                    setMainImage(data.product.images[0]);
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleContactSeller = async () => {
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });
            const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/store/conversation`,
                { productId: product._id },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            if (data.success) {
                navigate('/store/chat');
                // You might want to pass the conversationId to open that specific chat immediately
                // but since StoreChat lists all, it's fine for now.
            }
        } catch (error) {
            if (error.response?.status === 400) {
                alert("You cannot message yourself!");
            } else {
                console.error("Error starting conversation:", error);
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Product not found</div>;

    return (
        <div className="store-container">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            <div className="product-details-layout">
                {/* Image Gallery */}
                <div className="image-gallery">
                    <div className="main-image">
                        <img src={mainImage} alt={product.title} />
                    </div>
                    <div className="thumbnail-list">
                        {product.images.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Thumbnail ${index}`}
                                className={mainImage === img ? 'active' : ''}
                                onClick={() => setMainImage(img)}
                            />
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="product-info-panel">
                    <h1>{product.title}</h1>
                    <p className="price-large">₹{product.price}</p>

                    <div className="meta-tags">
                        <span className="tag">{product.category}</span>
                        <span className="tag condition-tag">{product.condition}</span>
                        <span className="tag location-tag">📍 {product.location}</span>
                    </div>

                    <div className="seller-box">
                        <img src={product.seller.picture} alt={product.seller.fullname} className="seller-avatar" />
                        <div>
                            <p className="seller-name">{product.seller.fullname}</p>
                            <p className="seller-sub">Seller</p>
                        </div>
                    </div>

                    <button className="contact-btn" onClick={handleContactSeller}>
                        Message Seller
                    </button>

                    <div className="description-section">
                        <h3>Description</h3>
                        <p>{product.description}</p>
                    </div>

                    <p className="posted-date">Posted on: {new Date(product.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
