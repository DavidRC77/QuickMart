import { useState, useEffect, useCallback } from 'react';
import { Product, Category } from '../lib/models/types';
import { ProductModel } from '../lib/models/productModel';
import { CategoryModel } from '../lib/models/categoryModel';
import { mockStore } from '../lib/supabase/mockStore';

export function useProductsController() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([ProductModel.getAll(), CategoryModel.getAll()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: any) {
      showToast('Error cargando productos/categorías: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = mockStore.subscribe(() => {
      loadData();
    });
    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Filtrado reactivo de productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.codigo_barras.includes(searchQuery.trim());
    const matchesCategory = selectedCategory === 'all' || p.categoria_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Crear o Editar producto
  const saveProduct = async (productData: Partial<Product>, isEditing: boolean, id?: string) => {
    try {
      if (isEditing && id) {
        await ProductModel.update(id, productData);
        showToast('Producto actualizado correctamente.', 'success');
      } else {
        await ProductModel.create(productData as Omit<Product, 'id'>);
        showToast('Producto creado exitosamente.', 'success');
      }
      loadData();
    } catch (err: any) {
      showToast('Error guardando producto: ' + err.message, 'error');
      throw err;
    }
  };

  // Eliminar producto
  const deleteProduct = async (id: string) => {
    try {
      await ProductModel.delete(id);
      showToast('Producto eliminado del inventario.', 'success');
      loadData();
    } catch (err: any) {
      showToast('Error al eliminar producto: ' + err.message, 'error');
    }
  };

  return {
    products: filteredProducts,
    categories,
    loading,
    searchQuery,
    selectedCategory,
    toast,
    setSearchQuery,
    setSelectedCategory,
    saveProduct,
    deleteProduct,
    refreshProducts: loadData,
  };
}
