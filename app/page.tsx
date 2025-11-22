"use client";

import { useState } from "react";

type Scene = {
  id: number;
  short_title: string;
  narration: string;
  imageUrl?: string;
};

export default function HomePage() {
  const [character, setCharacter] = useState(
    "A curious teen named Ari, with a red hoodie and sketchbook"
  );
  const [premise, setPremise] = useState(
    "A sci-fi adventure where Ari discovers a secret portal in their city."
  );
  const [sceneCount, setSceneCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState<string | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScenes([]);
    setTitle(null);

    try {
      const res = await fetch("/api/generate-storyboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character,
          premise,
          sceneCount,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      const data = await res.json();
      setTitle(data.title);
      setScenes(data.scenes);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm">
          <span>Sklipt</span>
          <span>🎬</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Turn ideas into visual storyboards.
        </h1>
        <p className="text-sm md:text-base text-slate-500 max-w-2xl">
          Describe a main character and a story premise. Sklipt generates a
          multi-scene storyboard with consistent narration using AI.
        </p>
      </header>

      {/* Form */}
      <section className="max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-5 md:p-6 shadow-sm"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Main character
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              rows={2}
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Story premise
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              rows={3}
              value={premise}
              onChange={(e) => setPremise(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800">
              Number of scenes (3–6)
            </label>
            <input
              type="number"
              min={3}
              max={6}
              className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              value={sceneCount}
              onChange={(e) => setSceneCount(Number(e.target.value) || 3)}
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2">
            <p className="text-xs text-slate-400">
              Sklipt uses AI to generate text. Outputs may not be perfect.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black disabled:opacity-60 disabled:hover:bg-slate-900"
            >
              {loading ? "Generating storyboard…" : "Generate Storyboard"}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-500 pt-1">
              {error}
            </p>
          )}
        </form>
      </section>

      {/* Results */}
      {title && (
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-500">
              Generated storyboard • {scenes.length} scenes
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {scenes.map((scene) => (
              <article
                key={scene.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {scene.imageUrl && (
                  <img
                    src={scene.imageUrl}
                    alt={scene.short_title}
                    className="w-full aspect-video object-cover border-b border-slate-200"
                  />
                )}
                <div className="p-3 md:p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Scene {scene.id}: {scene.short_title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    {scene.narration}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
