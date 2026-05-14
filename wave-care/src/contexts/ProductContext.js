import { createContext, useContext, useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import { BASE_URL } from '../services/api';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(res => {
        const mapped = res.data.map(p => {
          const imagePath = p.image || p.imageUrl || p.img || '';
          const imageUrl = imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
          return {
            ...p,
            imageUrl: imageUrl,
            image: imageUrl,
          };
        });
        setProducts(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  const getBySeason = (season) =>
    products.filter(p => p.season.toLowerCase() === season.toLowerCase());

  return (
    <ProductContext.Provider value={{ products, loading, getBySeason }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);