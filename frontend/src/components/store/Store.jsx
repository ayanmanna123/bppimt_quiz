import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import { Search, Filter, Plus, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Store = () => {
    const { getAccessTokenSilently, user } = useAuth0();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('all'); // 'all' or 'my_listings'
    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        minPrice: '',
        maxPrice: '',
        sortBy: 'createdAt_desc'
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            let url = `${import.meta.env.VITE_BACKEND_URL}/store/all`;

            if (viewMode === 'my_listings') {
                url = `${import.meta.env.VITE_BACKEND_URL}/store/my-products`;
            } else {
                // Build query string only for public store
                const queryParams = new URLSearchParams();
                if (filters.category && filters.category !== 'all') queryParams.append('category', filters.category);
                if (filters.search) queryParams.append('search', filters.search);
                if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
                if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
                if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
                url = `${url}?${queryParams.toString()}`;
            }

            const { data } = await axios.get(url, {
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
    }, [filters, viewMode]);

    const handleMarkSold = async (productId, e) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();

        try {
            const token = await getAccessTokenSilently({
                audience: "http://localhost:5000/api/v2",
            });

            const { data } = await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/store/product/${productId}/sold`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                // Refresh list
                fetchProducts();
            }
        } catch (error) {
            console.error("Error marking as sold:", error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50 overflow-hidden">
            {/* Sidebar Filters */}
            <aside className="w-80 bg-white border-r border-border flex-col hidden md:flex shrink-0">
                <div className="p-6 border-b border-border">
                    <div className="flex items-center gap-2 font-bold text-lg text-foreground">
                        <Filter className="w-5 h-5 text-primary" /> Filters
                    </div>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                        <Select
                            value={filters.category}
                            onValueChange={(val) => handleFilterChange('category', val)}
                        >
                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                <SelectItem value="Books">Books</SelectItem>
                                <SelectItem value="Electronics">Electronics</SelectItem>
                                <SelectItem value="Stationery">Stationery</SelectItem>
                                <SelectItem value="Uniform">Uniform</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Price Range (₹)</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                className="bg-slate-50 border-slate-200"
                            />
                            <Input
                                type="number"
                                placeholder="Max"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                className="bg-slate-50 border-slate-200"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Sort By</label>
                        <Select
                            value={filters.sortBy}
                            onValueChange={(val) => handleFilterChange('sortBy', val)}
                        >
                            <SelectTrigger className="bg-slate-50 border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="createdAt_desc">Newest First</SelectItem>
                                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
                {/* Header Toolbar */}
                <div className="h-20 bg-white border-b border-border flex items-center justify-between px-8 shrink-0">
                    <div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Campus Store
                        </h1>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                            {products.length} {products.length === 1 ? 'item' : 'items'} available for sale
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant={viewMode === 'my_listings' ? "secondary" : "ghost"}
                            className="font-semibold"
                            onClick={() => setViewMode(viewMode === 'all' ? 'my_listings' : 'all')}
                        >
                            {viewMode === 'all' ? 'My Ads' : 'Browse Store'}
                        </Button>
                        <Link to="/store/sell">
                            <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 font-bold">
                                <Plus className="w-4 h-4 mr-2" /> Sell Product
                            </Button>
                        </Link>
                        <Link to="/store/chat">
                            <Button variant="outline" className="border-border text-foreground hover:bg-slate-50 font-semibold">
                                <MessageCircle className="w-4 h-4 mr-2" /> Chats
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="bg-white rounded-2xl border border-border h-[340px] animate-pulse shadow-sm" />
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                            {products.map(product => (
                                <Link
                                    to={`/store/product/${product._id}`}
                                    key={product._id}
                                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                        <img
                                            src={product.images[0]}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0 font-medium">
                                                {product.category}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 truncate">{product.title}</h3>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-xl font-black text-primary">₹{product.price}</span>
                                                {product.status === 'Sold' ? (
                                                    <Badge variant="destructive" className="uppercase font-bold tracking-wider">
                                                        SOLD OUT
                                                    </Badge>
                                                ) : viewMode === 'my_listings' ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        onClick={(e) => handleMarkSold(product._id, e)}
                                                    >
                                                        Mark Sold
                                                    </Button>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs border-primary/20 text-primary bg-primary/5 uppercase font-bold tracking-wider">
                                                        {product.condition}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                {product.location || 'Campus'}
                                            </div>
                                            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 mx-auto max-w-2xl">
                            <div className="w-20 h-20 bg-indigo-50 text-primary rounded-full flex items-center justify-center mb-6">
                                <Search className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">No products found</h3>
                            <p className="text-slate-500 mt-2 mb-8 max-w-md">
                                We couldn't find any products matching your filters. Try adjusting your search or be the first to sell something!
                            </p>
                            <Link to="/store/sell">
                                <Button size="lg" className="font-bold">List an Item</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Store;
