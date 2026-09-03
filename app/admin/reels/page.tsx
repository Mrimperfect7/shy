"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Video, Eye, EyeOff, LayoutGrid, X } from "lucide-react";

type Reel = {
  id: string;
  instagramUrl: string;
  title: string | null;
  displayOrder: number;
  isPublished: boolean;
};

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReelUrl, setNewReelUrl] = useState("");
  const [newReelTitle, setNewReelTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchReels = async () => {
    try {
      const res = await fetch("/api/admin/reels");
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.reels || []).sort((a: Reel, b: Reel) => a.displayOrder - b.displayOrder);
        setReels(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch reels", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleTogglePublish = async (id: string, currentlyPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/reels/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentlyPublished })
      });
      if (res.ok) {
        setReels(reels.map(r => r.id === id ? { ...r, isPublished: !currentlyPublished } : r));
      }
    } catch (err) {
      console.error("Failed to toggle publish status", err);
    }
  };

  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReelUrl) return;
    
    setIsAdding(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          instagramUrl: newReelUrl,
          title: newReelTitle,
          isPublished: true
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setReels([...reels, data.reel]);
        setIsModalOpen(false);
        setNewReelUrl("");
        setNewReelTitle("");
      } else {
        setError(data.error || "Failed to add reel");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reel?")) return;
    try {
      const res = await fetch(`/api/admin/reels/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setReels(reels.filter(r => r.id !== id));
      } else {
        alert("Failed to delete reel");
      }
    } catch (err) {
      alert("Error deleting reel");
    }
  };

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const saveOrder = async (reorderedReels: Reel[]) => {
    try {
      await fetch("/api/admin/reels/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: reorderedReels.map(r => ({ id: r.id, displayOrder: r.displayOrder }))
        })
      });
    } catch (err) {
      console.error("Failed to save reordered reels", err);
      alert("Failed to save order");
    }
  };

  const handleDragEnd = async () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const copyReels = [...reels];
      const dragItemContent = copyReels[dragItem.current];
      copyReels.splice(dragItem.current, 1);
      copyReels.splice(dragOverItem.current, 0, dragItemContent);
      
      const reorderedReels = copyReels.map((reel, index) => ({
        ...reel,
        displayOrder: index
      }));
      
      setReels(reorderedReels);
      await saveOrder(reorderedReels);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl mb-2" style={{ color: "var(--charcoal)" }}>Instagram Reels</h1>
          <p className="font-sans text-sm text-gray-500">Manage the video carousel displayed on your storefront homepage.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-md transition-opacity hover:opacity-90"
          style={{ background: "var(--charcoal)" }}
        >
          <Plus size={16} />
          <span>Add Reel</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border flex flex-col flex-1 overflow-hidden" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        
        {/* Table */}
        <div className="overflow-x-auto flex-1">
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[1, 2].map(i => (
                <div key={i} className="h-20 bg-gray-100 rounded-md"></div>
              ))}
            </div>
          ) : reels.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Video size={32} className="text-gray-400" />
              </div>
              <h3 className="font-serif text-lg mb-1" style={{ color: "var(--charcoal)" }}>No reels added</h3>
              <p className="text-sm text-gray-500 max-w-md">Embed Instagram Reels onto your storefront by adding their URLs here.</p>
            </div>
          ) : (
            <table className="w-full text-left font-sans text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b sticky top-0 z-10" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
                <tr>
                  <th className="px-6 py-4 font-medium text-gray-500 w-16">Order</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Instagram Reel</th>
                  <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(26,26,26,0.05)" }}>
                {reels.map((reel, index) => (
                  <tr 
                    key={reel.id} 
                    className="hover:bg-gray-50 transition-colors"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <LayoutGrid size={16} className="cursor-grab" />
                        <span className="font-medium text-gray-700">{reel.displayOrder}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium mb-1" style={{ color: "var(--charcoal)" }}>
                        {reel.title || "Untitled Reel"}
                      </div>
                      <a href={reel.instagramUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        View on Instagram
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleTogglePublish(reel.id, reel.isPublished)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          reel.isPublished 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {reel.isPublished ? <Eye size={14}/> : <EyeOff size={14}/>}
                        {reel.isPublished ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDeleteReel(reel.id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                        title="Delete Reel"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Reel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="font-serif text-xl" style={{ color: "var(--charcoal)" }}>Add Instagram Reel</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddReel} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL *</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://www.instagram.com/reel/..."
                  value={newReelUrl}
                  onChange={(e) => setNewReelUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Paste the full URL of the reel</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hair Oiling Routine"
                  value={newReelTitle}
                  onChange={(e) => setNewReelTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:border-gray-500"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isAdding}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md transition-opacity disabled:opacity-70"
                  style={{ background: "var(--charcoal)" }}
                >
                  {isAdding ? "Adding..." : "Add Reel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
