import { Loader2 } from "lucide-react";

export default function InfluencerLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-12 h-12 text-[#0A2612] animate-spin" />
      <h2 className="text-xl font-serif text-[#1A1A1A] animate-pulse">Loading Dashboard...</h2>
      <p className="text-sm text-gray-500 font-sans">Getting your data ready</p>
    </div>
  );
}
