import { createContext, useContext, useEffect, useState } from 'react';
import { getProducts } from '../services/productService';
import imageMap from '../services/imageMap';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(res => {
        console.log('🔍 p.image exemplos:', res.data.slice(0, 3).map(p => p.image));
        const mapped = res.data.map(p => {
          const imagePath = p.image || '';
          // Busca a imagem local pelo caminho salvo no banco.
          // Se não achar no mapa, fica null (mostra placeholder).
          const imageSource = imageMap[imagePath] || null;
          return {
            ...p,
            imageSource, // use this in ALL components: <Image source={p.imageSource} />
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