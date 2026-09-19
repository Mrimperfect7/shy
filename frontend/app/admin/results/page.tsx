"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Image as ImageIcon, Eye, EyeOff, LayoutGrid, X, Trash2, Upload } from "lucide-react";
import { createCustomerResultAction } from "@/app/actions/admin-results";

type CustomerResult = {
  id: string;
  imageUrl: string;
  description: string | null;
  displayOrder: number;
  isPublished: boolean;
};

export default function CustomerResultsPage() {
  const [results, setResults] = useState<CustomerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [newDescription, setNewDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/admin/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch customer results", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/results/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentlyPublished })
      });
      if (res.ok) {
        setResults(results.map(r => r.id === id ? { ...r, isPublished: !currentlyPublished } : r));
      }
    } catch (err) {
      console.error("Failed to toggle publish status", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const res = await fetch(`/api/admin/results/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setResults(results.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete result", err);
    }
  };

  const handleAddResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageFile) return;
    
    setIsAdding(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("image", newImageFile);
      formData.append("description", newDescription);
      formData.append("isPublished", "true");

      const data = await createCustomerResultAction(formData);
      
      if (data.success && data.result) {
        setResults([...results, data.result]);
        setIsModalOpen(false);
        setNewImageFile(null);
        setNewImagePreview(null);
        setNewDescription("");
      } else {
        setError(data.error || "Failed to add image");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--charcoal)" }}>Customer Results</h1>
          <p className="font-sans text-sm text-gray-500">Manage before & after result images shown on product pages.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md transition-opacity hover:opacity-90"
          style={{ background: "var(--forest)" }}
        >
          <Plus size={16} />
          Add Image
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--forest)] rounded-full animate-spin"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-12 text-center bg-white">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No images added</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">Upload or link before & after customer result images to display on your product pages.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md transition-opacity hover:opacity-90"
            style={{ background: "var(--forest)" }}
          >
            <Plus size={16} />
            Add First Image
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((result) => (
            <div key={result.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
              <div className="aspect-[4/5] bg-gray-100 relative">
                <img 
                  src={result.imageUrl} 
                  alt={result.description || "Customer Result"} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
                    {result.description || "Before & After Image"}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button 
                    onClick={() => handleTogglePublish(result.id, result.isPublished)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                      result.isPublished 
                        ? "text-forest bg-green-50 hover:bg-green-100" 
                        : "text-gray-500 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {result.isPublished ? <><Eye size={14} /> Published</> : <><EyeOff size={14} /> Hidden</>}
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(result.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>Add Result Image</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddResult} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Customer Photo *
                  </label>
                  
                  {newImagePreview ? (
                    <div className="relative aspect-square w-full sm:w-1/2 max-w-[200px] rounded-lg overflow-hidden border border-gray-200">
                      <img src={newImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => {
                          setNewImageFile(null);
                          setNewImagePreview(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[var(--forest)] transition-colors cursor-pointer"
                    >
                      <Upload size={24} className="mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Click to upload photo</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Description / Caption
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g., 4 weeks of consistent use"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--forest)]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding || !newImageFile}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                  style={{ background: "var(--forest)" }}
                >
                  {isAdding ? "Adding..." : "Add Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
