'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync logic: Fetch from Supabase if authenticated, else localStorage
  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      if (isAuthenticated && user) {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('user_wishlist')
          .select('product_id, products(*)')
          .eq('user_id', user.id);
          
        if (!error && data && active) {
          // Format the data mapping to just the product objects
          const dbWishlist = data.map(item => item.products).filter(Boolean);
          setWishlist(dbWishlist);
          
          // Optionally, we could merge any existing local wishlist here, 
          // but for simplicity we'll just use the DB one.
        }
        setIsLoaded(true);
      } else {
        // Fallback to localStorage
        let saved = [];
        try {
          const raw = localStorage.getItem('saved_products_v2');
          const parsed = JSON.parse(raw || '[]');
          if (Array.isArray(parsed)) saved = parsed;
        } catch {
          localStorage.removeItem('saved_products_v2');
        }
        if (active) {
          setWishlist(saved);
          setIsLoaded(true);
        }
      }
    }

    loadWishlist();

    return () => { active = false; };
  }, [isAuthenticated, user]);

  // Save to localStorage ONLY if NOT authenticated
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      localStorage.setItem('saved_products_v2', JSON.stringify(wishlist));
    }
  }, [wishlist, isLoaded, isAuthenticated]);

  const toggleWishlist = async (product) => {
    const exists = wishlist.find(item => item.id === product.id);
    
    // Optimistic UI update
    setWishlist(prev => {
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });

    // DB sync
    if (isAuthenticated && user) {
      if (exists) {
        await supabase
          .from('user_wishlist')
          .delete()
          .match({ user_id: user.id, product_id: product.id });
      } else {
        await supabase
          .from('user_wishlist')
          .insert({ user_id: user.id, product_id: product.id });
      }
    }
  };

  const isInWishlist = (id) => {
    return wishlist.some(item => item.id === id);
  };

  const removeFromWishlist = async (id) => {
    // Optimistic cache
    setWishlist(prev => prev.filter(item => item.id !== id));
    
    if (isAuthenticated && user) {
      await supabase
        .from('user_wishlist')
        .delete()
        .match({ user_id: user.id, product_id: id });
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      toggleWishlist, 
      isInWishlist, 
      removeFromWishlist,
      count: wishlist.length 
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
