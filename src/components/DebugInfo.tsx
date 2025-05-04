"use client";

interface DebugInfoProps {
  data: any;
  title?: string;
  show?: boolean;
}

export function DebugInfo({ data, title = "Debug Information", show = true }: DebugInfoProps) {
  if (!show) return null;
  
  return (
    <div className="mt-4 p-4 bg-slate-800 text-white rounded-md text-xs">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <pre className="overflow-auto max-h-60 bg-slate-900 p-2 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
} 