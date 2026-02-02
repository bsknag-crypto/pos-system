
import React, { useState } from 'react';
import { Product, Category } from '../types';

interface InventoryProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    costPrice: 0,
    category: Category.PRODUCE,
    unit: 'ea',
    stock: 0,
    orderId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || newProduct.price === undefined) return;

    const product: Product = {
      id: Math.random().toString(36).substring(7),
      name: newProduct.name!,
      price: Number(newProduct.price),
      costPrice: Number(newProduct.costPrice) || 0,
      category: newProduct.category as Category,
      unit: newProduct.unit || 'ea',
      stock: Number(newProduct.stock) || 0,
      orderId: newProduct.orderId || `PO-${new Date().getFullYear()}`
    };

    onAddProduct(product);
    setIsAdding(false);
    setNewProduct({ name: '', price: 0, costPrice: 0, category: Category.PRODUCE, unit: 'ea', stock: 0, orderId: '' });
  };

  const inputClasses = "w-full px-4 py-3 bg-slate-100 border-slate-200 border-2 rounded-xl outline-none focus:bg-white focus:border-emerald-500 text-slate-900 font-bold transition-all";

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Inventory Management</h2>
          <p className="text-slate-500 font-medium">No-image fast stock control</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 shadow-xl transition-all">
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white shadow-sm z-10 text-slate-400 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-8 py-5">Product Name</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5 text-emerald-600">Cost Price (RS)</th>
                <th className="px-6 py-5 text-blue-600">Sale Price (RS)</th>
                <th className="px-6 py-5">Margin (RS)</th>
                <th className="px-6 py-5">Stock</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(product => (
                <tr key={product.id} className="group hover:bg-slate-50 transition-all">
                  <td className="px-8 py-4">
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{product.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">BATCH: {product.orderId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">RS {product.costPrice}</td>
                  <td className="px-6 py-4 font-black text-slate-900">RS {product.price}</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-600 font-black text-xs">+RS {product.price - product.costPrice}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-black ${product.stock < 10 ? 'text-red-500' : 'text-slate-800'}`}>
                      {product.stock} <span className="text-[10px] text-slate-400">{product.unit}</span>
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingProduct(product)} className="p-2 text-slate-400 hover:text-emerald-600">✏️</button>
                      <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-500">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 space-y-4">
            <h3 className="text-2xl font-black text-slate-800 mb-6">New Product Entry</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Name</label>
                  <input required className={inputClasses} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Cost (RS)</label>
                  <input required type="number" className={inputClasses} value={newProduct.costPrice} onChange={e => setNewProduct({...newProduct, costPrice: parseFloat(e.target.value)})} />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Sale (RS)</label>
                  <input required type="number" className={inputClasses} value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Stock</label>
                  <input required type="number" className={inputClasses} value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Unit</label>
                  <input className={inputClasses} value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})} />
               </div>
               <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Order ID Reference</label>
                  <input className={inputClasses} value={newProduct.orderId} onChange={e => setNewProduct({...newProduct, orderId: e.target.value})} />
               </div>
            </div>
            <div className="flex gap-4 pt-4">
               <button type="submit" className="flex-1 bg-slate-900 text-white font-black py-4 rounded-2xl">Confirm Addition</button>
               <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Side Drawer */}
      <div className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[110] transform transition-transform duration-300 ease-in-out border-l border-slate-200 ${editingProduct ? 'translate-x-0' : 'translate-x-full'}`}>
        {editingProduct && (
           <div className="p-8 space-y-6">
              <h3 className="text-2xl font-black text-slate-800">Modify SKU</h3>
              <div className="space-y-4">
                 <input className={inputClasses} value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                 <div className="grid grid-cols-2 gap-4">
                    <input type="number" className={inputClasses} value={editingProduct.costPrice} onChange={e => setEditingProduct({...editingProduct, costPrice: parseFloat(e.target.value)})} />
                    <input type="number" className={inputClasses} value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} />
                 </div>
                 <input type="number" className={inputClasses} value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} />
                 <input className={inputClasses} value={editingProduct.orderId} onChange={e => setEditingProduct({...editingProduct, orderId: e.target.value})} />
              </div>
              <div className="pt-6 space-y-3">
                 <button onClick={() => { onUpdateProduct(editingProduct); setEditingProduct(null); }} className="w-full bg-emerald-600 text-white font-black py-4 rounded-2xl">Update Record</button>
                 <button onClick={() => setEditingProduct(null)} className="w-full bg-slate-100 text-slate-500 font-bold py-3 rounded-2xl">Dismiss</button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
