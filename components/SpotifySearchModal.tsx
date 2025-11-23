"use client";

import { useState } from "react";
import { type PlanKey } from "@/lib/plan-theme";

type SpotifyTrack = {
  id: string;
  name: string;
  artist: string;
  album?: string;
  albumArt?: string;
  previewUrl?: string;
  spotifyUrl: string;
  uri: string;
  duration?: number;
  mp3Url?: string;
  downloadUrl?: string;
};

type Props = {
  plan: PlanKey;
  onSelect: (track: SpotifyTrack) => void;
  onClose: () => void;
};

export default function SpotifySearchModal({ plan, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/spotify/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche");
      }

      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (err) {
      setError("Impossible de rechercher sur Spotify. Réessayez.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPreview = (previewUrl: string, trackId: string) => {
    // Arrêter la lecture en cours
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    if (playingPreview === trackId) {
      setPlayingPreview(null);
      setAudioElement(null);
      return;
    }

    // Lire le nouveau preview
    const audio = new Audio(previewUrl);
    audio.play();
    audio.onended = () => {
      setPlayingPreview(null);
      setAudioElement(null);
    };
    
    setAudioElement(audio);
    setPlayingPreview(trackId);
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    // Arrêter la lecture
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    
    onSelect(track);
    onClose();
  };

  const isPremium = plan === "plan_premium";
  const bgGradient = isPremium 
    ? "bg-gradient-to-br from-[#fbeedc] to-[#fff7ee]" 
    : "bg-gradient-to-br from-[#f4f6fb] to-white";
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${bgGradient} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-black/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎵</span>
              <h2 className="text-2xl font-bold text-gray-800">Recherche Spotify</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom de la chanson, artiste..."
              className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                color: '#4a0808'
              }}
            >
              {loading ? "..." : "🔍"}
            </button>
          </form>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">🎵</div>
              <p className="text-gray-900 font-medium">Recherche en cours...</p>
            </div>
          )}

          {!loading && tracks.length === 0 && query && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-800 font-medium">Aucun résultat trouvé</p>
            </div>
          )}

          {!loading && tracks.length === 0 && !query && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎼</div>
              <p className="text-gray-800 font-medium">Recherchez une chanson pour commencer</p>
            </div>
          )}

          {tracks.length > 0 && (
            <div className="space-y-3">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-[#d4af37] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Album Art */}
                    {track.albumArt && (
                      <img
                        src={track.albumArt}
                        alt={track.album || "Album"}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    
                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{track.name}</h3>
                      <p className="text-sm text-gray-800 truncate">{track.artist}</p>
                      {track.album && (
                        <p className="text-xs text-gray-700 truncate">{track.album}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Preview button */}
                      {track.previewUrl && (
                        <button
                          onClick={() => handlePlayPreview(track.previewUrl!, track.id)}
                          className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                          title="Écouter un extrait"
                        >
                          {playingPreview === track.id ? "⏸️" : "▶️"}
                        </button>
                      )}

                      {/* Select button */}
                      <button
                        onClick={() => handleSelectTrack(track)}
                        className="px-4 py-2 rounded-full font-bold transition-all hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)',
                          color: '#4a0808'
                        }}
                      >
                        Choisir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/10 bg-gray-50/50 text-center text-xs text-gray-800">
          Propulsé par Spotify 🎵
        </div>
      </div>
    </div>
  );
}
