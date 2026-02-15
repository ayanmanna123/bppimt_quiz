import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { Upload, X, DollarSign, Tag, MapPin, Type, FileText, Loader2, IndianRupee, ImagePlus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const SellProduct = () => {
    const { getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: 'Used',
        location: ''
    });
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleValueChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            alert("Maximum 5 images allowed");
            return;
        }

        setImages(prev => [...prev, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        images.forEach(image => data.append('images', image));

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
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-white border-slate-200 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white p-8">
                    <CardTitle className="text-2xl font-black flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                            <Upload className="w-6 h-6" />
                        </div>
                        List Item for Sale
                    </CardTitle>
                    <CardDescription className="text-indigo-100 text-base font-medium">
                        Fill in the details below to post your product on the campus store.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-slate-700 font-bold">Product Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Engineering Mathematics Vol 1"
                                className="h-12 border-slate-200 bg-slate-50 focus-visible:ring-primary font-medium"
                                required
                            />
                        </div>

                        {/* Price & Category */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-slate-700 font-bold">Price (₹)</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="pl-9 h-12 border-slate-200 bg-slate-50 focus-visible:ring-primary font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-slate-700 font-bold">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                >
                                    <SelectTrigger className="h-12 border-slate-200 bg-slate-50 focus-visible:ring-primary font-medium">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Books">Books</SelectItem>
                                        <SelectItem value="Electronics">Electronics</SelectItem>
                                        <SelectItem value="Stationery">Stationery</SelectItem>
                                        <SelectItem value="Uniform">Uniform</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Condition & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="condition" className="text-slate-700 font-bold">Condition</Label>
                                <Select
                                    value={formData.condition}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                                >
                                    <SelectTrigger className="h-12 border-slate-200 bg-slate-50 focus-visible:ring-primary font-medium">
                                        <SelectValue placeholder="Select Condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="Like New">Like New</SelectItem>
                                        <SelectItem value="Good">Good</SelectItem>
                                        <SelectItem value="Fair">Fair</SelectItem>
                                        <SelectItem value="Poor">Poor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location" className="text-slate-700 font-bold">Pickup Location (Optional)</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Main Library"
                                        className="pl-9 h-12 border-slate-200 bg-slate-50 focus-visible:ring-primary font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-slate-700 font-bold">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your item, condition, and any other details..."
                                className="min-h-[120px] border-slate-200 bg-slate-50 focus-visible:ring-primary font-medium resize-none p-4"
                                required
                            />
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <Label className="text-slate-700 font-bold">Product Images</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {imagePreviews.map((src, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                        <img src={src} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 4 && (
                                    <label className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-primary/50 cursor-pointer transition-all group">
                                        <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                            <ImagePlus className="w-6 h-6 text-primary" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Add Photo</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={loading}
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 font-medium">
                                * Upload up to 4 images. First image will be the cover.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-lg shadow-primary/25 rounded-xl transition-all hover:scale-[1.01]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Listing...
                                </>
                            ) : (
                                "List Now"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SellProduct;
