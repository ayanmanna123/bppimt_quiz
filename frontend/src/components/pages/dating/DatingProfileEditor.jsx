import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, User, MapPin, Briefcase, Heart, Plus, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import './../../../styles/dating.css';

const DatingProfileEditor = () => {
    const { getAccessTokenSilently } = useAuth0();
    const [profile, setProfile] = useState({
        bio: '',
        age: 18,
        job: '',
        gender: 'male',
        interests: [],
        datingPhotos: [],
        datingPreferences: {
            gender: 'all',
            ageRange: { min: 18, max: 100 },
            maxDistance: 50
        }
    });
    const [newInterest, setNewInterest] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await getAccessTokenSilently();
            // Using existing user profile fetch and picking dating fields
            // Note: The original implementation used /api/v1/user/profile/me
            // We'll update to use the full URL pattern
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL} /user/profile / me`, {
                headers: { Authorization: `Bearer ${token} ` }
            });
            if (response.data.success) {
                const user = response.data.user;
                setProfile({
                    bio: user.bio || '',
                    age: user.age || 18,
                    job: user.job || '',
                    gender: user.gender || 'male',
                    interests: user.interests || [],
                    datingPhotos: user.datingPhotos || [],
                    datingPreferences: user.datingPreferences || {
                        gender: 'all',
                        ageRange: { min: 18, max: 100 },
                        maxDistance: 50
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = await getAccessTokenSilently();
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.url) {
                setProfile(prev => ({
                    ...prev,
                    datingPhotos: [...prev.datingPhotos, response.data.url]
                }));
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Failed to upload photo.");
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await getAccessTokenSilently();
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/dating/profile`, profile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                alert("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    const addInterest = () => {
        if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
            setProfile({ ...profile, interests: [...profile.interests, newInterest.trim()] });
            setNewInterest('');
        }
    };

    const removeInterest = (interest) => {
        setProfile({ ...profile, interests: profile.interests.filter(i => i !== interest) });
    };

    if (loading) return <div className="dating-container flex items-center justify-center pt-20">Loading...</div>;

    return (
        <div className="dating-container pt-10 pb-20 px-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-black neon-text-pink mb-10 flex items-center gap-3">
                    <User className="w-10 h-10" /> Profile Settings
                </h1>

                <div className="space-y-8">
                    {/* Photos Section */}
                    <section className="glass-morphism p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-pink-500" /> Your Photos
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            {profile.datingPhotos.map((photo, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden neon-border">
                                    <img src={photo} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setProfile({ ...profile, datingPhotos: profile.datingPhotos.filter((_, i) => i !== index) })}
                                        className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-red-500 hover:bg-black"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {profile.datingPhotos.length < 6 && (
                                <button
                                    onClick={triggerFileInput}
                                    disabled={uploading}
                                    className="aspect-square rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center hover:bg-white/5 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-500"></div>
                                    ) : (
                                        <>
                                            <Plus className="w-8 h-8 opacity-40 mb-2" />
                                            <span className="text-xs opacity-40 uppercase font-bold tracking-widest">Upload</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </section>

                    {/* Basic Info */}
                    <section className="glass-morphism p-8 space-y-6">
                        <div>
                            <label className="block text-sm opacity-60 mb-2">About Me</label>
                            <textarea
                                value={profile.bio}
                                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:neon-border outline-none transition-all h-32"
                                placeholder="Write something about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm opacity-60 mb-2">Age</label>
                                <input
                                    type="number"
                                    value={profile.age}
                                    onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:neon-border outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm opacity-60 mb-2">Job Title</label>
                                <input
                                    type="text"
                                    value={profile.job}
                                    onChange={(e) => setProfile({ ...profile, job: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:neon-border outline-none transition-all"
                                    placeholder="Software Engineer, Student, etc."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm opacity-60 mb-2">Interests</label>
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={newInterest}
                                    onChange={(e) => setNewInterest(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 focus:neon-border outline-none transition-all"
                                    placeholder="Add an interest (e.g. Coding, Music)"
                                />
                                <button onClick={addInterest} className="neon-button px-6">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests.map((interest, i) => (
                                    <span key={i} className="interest-tag flex items-center gap-2">
                                        {interest}
                                        <X className="w-3 h-3 cursor-pointer" onClick={() => removeInterest(interest)} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Preferences */}
                    <section className="glass-morphism p-8 space-y-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-pink-500" /> Discovery Preferences
                        </h2>

                        <div>
                            <label className="block text-sm opacity-60 mb-3">I'm interested in</label>
                            <div className="flex gap-4">
                                {['male', 'female', 'other', 'all'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setProfile({ ...profile, datingPreferences: { ...profile.datingPreferences, gender: g } })}
                                        className={`px-6 py-2 rounded-full border border-white/10 transition-all ${profile.datingPreferences.gender === g ? 'bg-pink-500 border-pink-500' : 'bg-white/5 hover:bg-white/10'}`}
                                    >
                                        {g.charAt(0).toUpperCase() + g.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm opacity-60 mb-3">Maximum Distance ({profile.datingPreferences.maxDistance} km)</label>
                            <input
                                type="range"
                                min="1" max="200"
                                value={profile.datingPreferences.maxDistance}
                                onChange={(e) => setProfile({ ...profile, datingPreferences: { ...profile.datingPreferences, maxDistance: parseInt(e.target.value) } })}
                                className="w-full accent-pink-500"
                            />
                        </div>
                    </section>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="neon-button w-full py-5 text-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : <><Save className="w-6 h-6" /> Save Profile</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DatingProfileEditor;
