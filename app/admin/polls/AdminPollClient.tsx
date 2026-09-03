"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoll, setActivePoll, deletePoll } from "@/app/actions/admin-polls";
import { Plus, Trash2, CheckCircle, Circle, BarChart3, Loader2 } from "lucide-react";

export default function AdminPollClient({ initialPolls }: { initialPolls: any[] }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddOption = () => {
    if (options.length < 4) setOptions([...options, ""]);
  };

  const handleCreate = async () => {
    if (!question || options.some(o => !o.trim())) {
      alert("Please fill out the question and all options.");
      return;
    }
    setLoading(true);
    const res = await createPoll(question, options.filter(o => o.trim()));
    if (!res.success) {
      alert(res.error || "Failed to create poll");
    } else {
      setQuestion("");
      setOptions(["", ""]);
      router.refresh();
    }
    setLoading(false);
  };

  const handleSetActive = async (pollId: string, currentActive: boolean) => {
    const res = await setActivePoll(currentActive ? "" : pollId);
    if (!res.success) {
      alert(res.error || "Failed to set active poll");
    } else {
      router.refresh();
    }
  };

  const handleDelete = async (pollId: string) => {
    if (confirm("Are you sure you want to delete this poll?")) {
      const res = await deletePoll(pollId);
      if (!res.success) {
        alert(res.error || "Failed to delete poll");
      } else {
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Create New Poll */}
      <div className="bg-white rounded-xl shadow-sm border p-6" style={{ borderColor: "rgba(26,26,26,0.1)" }}>
        <h2 className="font-serif text-xl mb-4" style={{ color: "var(--charcoal)" }}>Create New Poll</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Question</label>
            <input 
              type="text" 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              placeholder="e.g., Which new product should we launch next?"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-forest focus:border-forest"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Options</label>
            {options.map((opt, idx) => (
              <input 
                key={idx}
                type="text" 
                value={opt} 
                onChange={e => {
                  const newOpts = [...options];
                  newOpts[idx] = e.target.value;
                  setOptions(newOpts);
                }} 
                placeholder={`Option ${idx + 1}`}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-forest focus:border-forest mb-2"
              />
            ))}
            {options.length < 4 && (
              <button onClick={handleAddOption} className="text-xs font-medium text-forest hover:underline">
                + Add Option
              </button>
            )}
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center gap-2 bg-[#0A2612] text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-[#113A1C] disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Create Poll
          </button>
        </div>
      </div>

      {/* Existing Polls */}
      <div className="space-y-4">
        {initialPolls.map(poll => {
          const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

          return (
            <div key={poll.id} className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${poll.isActive ? 'ring-2 ring-emerald-500 bg-emerald-50/10' : ''}`} style={{ borderColor: "rgba(26,26,26,0.1)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif text-lg font-bold" style={{ color: "var(--charcoal)" }}>{poll.question}</h3>
                  <p className="text-xs text-gray-500 font-sans mt-1 flex items-center gap-1">
                    <BarChart3 size={13} /> {totalVotes} total votes
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleSetActive(poll.id, poll.isActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${poll.isActive ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                  >
                    {poll.isActive ? <CheckCircle size={14} /> : <Circle size={14} />}
                    {poll.isActive ? "Active Poll" : "Set Active"}
                  </button>
                  <button 
                    onClick={() => handleDelete(poll.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-4">
                {poll.options.map((opt: any) => {
                  const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                  return (
                    <div key={opt.id} className="relative w-full bg-gray-50 rounded-lg border border-gray-100 overflow-hidden h-10 flex items-center">
                      <div className="absolute top-0 left-0 bottom-0 bg-emerald-100 transition-all duration-500" style={{ width: `${pct}%` }} />
                      <div className="absolute w-full px-4 flex items-center justify-between text-sm font-sans font-medium text-gray-800">
                        <span>{opt.text}</span>
                        <span className="text-gray-500">{opt.votes} votes ({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {initialPolls.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-sans text-sm border-2 border-dashed rounded-xl">
            No polls created yet.
          </div>
        )}
      </div>
    </div>
  );
}
