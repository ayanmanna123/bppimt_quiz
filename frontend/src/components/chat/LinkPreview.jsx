import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { ExternalLink, Loader2 } from 'lucide-react';

const LinkPreview = ({ url }) => {
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                setLoading(true);
                const token = await getAccessTokenSilently();
                const res = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/chat/link-preview/metadata?url=${encodeURIComponent(url)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMetadata(res.data);
            } catch (err) {
                console.error('Failed to fetch link preview', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (url) {
            fetchMetadata();
        }
    }, [url, getAccessTokenSilently]);

    if (loading) {
        return (
            <div className="mt-2 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-center min-h-[80px] animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error || !metadata || (!metadata.title && !metadata.image)) {
        return null; // Don't show anything if we can't get basic info
    }

    return (
        <a
            href={metadata.url || url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors shadow-sm group"
        >
            <div className="flex flex-col sm:flex-row">
                {metadata.image && (
                    <div className="w-full sm:w-32 h-32 sm:h-auto shrink-0 relative overflow-hidden bg-slate-100">
                        <img
                            src={metadata.image}
                            alt={metadata.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                )}
                <div className="p-3 flex-1 min-w-0">
                    {metadata.siteName && (
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 block">
                            {metadata.siteName}
                        </span>
                    )}
                    <h4 className="text-sm font-bold text-slate-900 truncate mb-1 flex items-center gap-1.5">
                        {metadata.title || 'Untitled'}
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                    </h4>
                    {metadata.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {metadata.description}
                        </p>
                    )}
                    <span className="text-[10px] text-slate-400 mt-2 block truncate">
                        {new URL(url).hostname}
                    </span>
                </div>
            </div>
        </a>
    );
};

export default LinkPreview;
