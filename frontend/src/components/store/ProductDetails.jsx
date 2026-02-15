import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import { MessageCircle, MapPin, Tag, Clock, User, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProductDetails = () => {
    const { getAccessTokenSilently } = useAuth0();
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');
    const [contacting, setContacting] = useState(false);

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
        setContacting(true);
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
        } finally {
            setContacting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );

    if (!product) return (
        <div className="container mx-auto p-4 pt-24 text-center">
            <h2 className="text-xl font-bold text-foreground">Product not found</h2>
            <Button variant="link" onClick={() => navigate('/store')} className="mt-4">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Store
            </Button>
        </div>
    );

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/store')}
                    className="mb-8 hover:bg-white hover:text-primary rounded-xl font-bold text-slate-500"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back to Campus Store
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery - Left Side */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 aspect-square flex items-center justify-center p-8 relative group">
                            <img
                                src={mainImage}
                                alt={product.title}
                                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4">
                                <Badge variant="secondary" className="bg-black/80 text-white backdrop-blur-md border-0 px-3 py-1 text-sm font-bold">
                                    {product.category}
                                </Badge>
                            </div>
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setMainImage(img)}
                                        className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${mainImage === img
                                            ? 'border-primary ring-4 ring-primary/10'
                                            : 'border-white bg-white shadow-sm hover:border-slate-300'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info - Right Side */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 leading-tight">{product.title}</h1>
                                    <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            {product.location}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-primary" />
                                            Posted {new Date(product.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-primary">₹{product.price}</p>
                                    <Badge variant="outline" className="mt-2 border-slate-200 text-slate-500 uppercase tracking-widest font-bold text-[10px]">
                                        {product.condition}
                                    </Badge>
                                </div>
                            </div>

                            <Card className="bg-slate-50/50 border-slate-100 mb-8 overflow-hidden hover:border-primary/20 transition-colors">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
                                            <AvatarImage src={product.seller.picture} />
                                            <AvatarFallback className="bg-indigo-100 text-primary font-bold">
                                                {product.seller.fullname.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-slate-900">{product.seller.fullname}</p>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seller</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleContactSeller}
                                        disabled={contacting}
                                        size="lg"
                                        className="rounded-xl font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg shadow-primary/25"
                                    >
                                        {contacting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                                        Chat Now
                                    </Button>
                                </div>
                            </Card>

                            <div className="space-y-4">
                                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-primary" />
                                    Description
                                </h3>
                                <p className="text-slate-600 leading-8 whitespace-pre-wrap text-base">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        {/* Safety Tips or Extras could go here */}
                        <div className="bg-indigo-50/50 rounded-2xl border border-indigo-100 p-6">
                            <h4 className="font-bold text-indigo-900 mb-2 text-sm uppercase tracking-wide">Safety Tips</h4>
                            <ul className="text-sm text-indigo-800/80 space-y-2 list-disc pl-4">
                                <li>Meet in a safe, public place like the library or cafeteria.</li>
                                <li>Check the item properly before making any payment.</li>
                                <li>Avoid sharing sensitive personal information.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
