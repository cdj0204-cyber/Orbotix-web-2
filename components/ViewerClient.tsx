"use client";

import dynamic from "next/dynamic";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <span className="text-white/20 text-[10px] tracking-[0.5em] font-mono uppercase">
        Initializing
      </span>
    </div>
  ),
});

export default function ViewerClient({ modelPath }: { modelPath?: string }) {
  return <ModelViewer modelPath={modelPath} />;
}
