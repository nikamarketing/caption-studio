"use client";

import { useState, useEffect } from "react";
import { Trash2, RotateCcw, FolderOpen } from "lucide-react";
import { loadProjects, deleteProject, type SavedProject } from "@/lib/storage";
import { PLATFORMS } from "@/lib/types";

interface Props {
  onRestore: (project: SavedProject) => void;
  refreshKey: number;
}

export function ProjectHistory({ onRestore, refreshKey }: Props) {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    setProjects(loadProjects());
  }, [refreshKey]);

  if (projects.length === 0) return null;

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <section className="mt-10 border-t border-[#2e2e3a] pt-8">
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="h-4 w-4 text-brand-400" />
        <h2 className="text-sm font-semibold text-gray-300">Saved Projects</h2>
        <span className="rounded-full bg-[#2e2e3a] px-2 py-0.5 text-[10px] text-gray-500">
          {projects.length}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const platform = PLATFORMS.find((pl) => pl.id === p.platform);
          const date = new Date(p.savedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={p.id}
              className="rounded-xl border border-[#2e2e3a] bg-[#18181f] p-3.5 flex gap-3 hover:border-gray-600 transition-colors"
            >
              {p.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.thumbnail}
                  alt=""
                  className="h-14 w-14 flex-shrink-0 rounded-lg object-cover border border-[#2e2e3a]"
                />
              ) : (
                <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-[#2e2e3a] flex items-center justify-center text-2xl">
                  {platform?.icon ?? "🖼"}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{platform?.icon}</span>
                  <span className="text-[10px] font-medium text-gray-400">{platform?.label}</span>
                  <span className="ml-auto text-[10px] text-gray-600 whitespace-nowrap">{date}</span>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-2">
                  {p.caption}
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onRestore(p)}
                    className="flex items-center gap-1 rounded-md bg-brand-600/20 border border-brand-500/20 px-2 py-1 text-[10px] text-brand-400 hover:bg-brand-600/30 transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="flex items-center gap-1 rounded-md border border-[#2e2e3a] px-2 py-1 text-[10px] text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
