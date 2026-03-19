import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch products with standard state management and race-condition protection.
 * @param {Object} filters - Query parameters for the API
 * @param {Array} dependencyArray - Values that trigger a re-fetch
 * @param {Array} initialData - Initial data for hydration
 */
export function useProducts(filters = {}, dependencyArray = [], initialData = null) {
  const [data, setData] = useState({
    products: initialData || [],
    loading: !initialData,
    error: null
  });

  const [isFirstMount, setIsFirstMount] = useState(true);

  const fetchProducts = useCallback(async (signal) => {
    // If we have initial data and it's the first mount, skip the fetch
    if (isFirstMount && initialData) {
      setIsFirstMount(false);
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/products?${params.toString()}`, { signal });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const products = await response.json();
      setData({ products, loading: false, error: null });
    } catch (err) {
      if (err.name === 'AbortError') return;
      
      console.error('Fetch products error:', err);
      setData({ products: [], loading: false, error: err.message });
    } finally {
      setIsFirstMount(false);
    }
  }, [JSON.stringify(filters), initialData, isFirstMount]);

  useEffect(() => {
    const controller = new AbortController();
    
    // Add a small debounce if search is present
    const timer = setTimeout(() => {
      fetchProducts(controller.signal);
    }, filters.search ? 400 : 0);
    
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [...dependencyArray, fetchProducts, filters.search]);

  return data;
}
