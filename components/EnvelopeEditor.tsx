"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PLAN_APPEARANCE, type PlanKey } from "@/lib/plan-theme";
import SpotifySearchModal from "./SpotifySearchModal";
import VoiceRecorder from "./VoiceRecorder";

type DayContent = {
  type: "photo" | "message" | "drawing" | "music" | "voice" | "ai_photo";
  content: string;
  title?: string;
};

type Props = {
  day: number;
  initialContent: DayContent | null;
  allowMusic: boolean;
  plan: PlanKey;
  onSave: (content: DayContent) => void;
  onClose: () => void;
};

export default function EnvelopeEditor({ day, initialContent, allowMusic, plan, onSave, onClose }: Props) {
  const [selectedType, setSelectedType] = useState<DayContent["type"] | null>(initialContent?.type || null);
  const [content, setContent] = useState(initialContent?.content || "");
  const [title, setTitle] = useState(initialContent?.title || "");
  const [uploadedFileName, setUploadedFileName] = useState(
    initialContent?.type === "photo" ? "Photo importée" : ""
  );
  const [drawingFileName, setDrawingFileName] = useState(
    initialContent?.type === "drawing" ? "Dessin importé" : ""
  );
  // --- IA Photo (nano-banana) ---
  const [aiPhotoFile, setAiPhotoFile] = useState<File | null>(null);
  const [aiPhotoPrompt, setAiPhotoPrompt] = useState("");
  const [aiPhotoUrl, setAiPhotoUrl] = useState<string | null>(null);
  const [aiPhotoLoading, setAiPhotoLoading] = useState(false);

  async function handleGenerateAiPhoto() {
    setAiPhotoLoading(true);
    setAiPhotoUrl(null);
    try {
      const formData = new FormData();
      formData.append("prompt", aiPhotoPrompt);
      if (aiPhotoFile) formData.append("image", aiPhotoFile);
      const res = await fetch("/api/ai-photo", {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error("Erreur API: " + (await res.text()));
      const data = await res.json();
      if (!data.url) throw new Error("Aucune image générée");
      setAiPhotoUrl(data.url);
    } catch (e: any) {
      alert("Erreur lors de la génération IA: " + (e.message || e));
    } finally {
      setAiPhotoLoading(false);
    }
  }
  
  // Pour la musique : détecter si c'est un MP3 (fichier encodé, lien .mp3, ou URL de téléchargement)
  const [mp3Url, setMp3Url] = useState(() => {
    if (initialContent?.type === "music" && initialContent.content) {
      const url = initialContent.content;
      // Vérifier si c'est un fichier audio ou un lien de téléchargement MP3
      if (url.startsWith("data:audio") || 
          url.endsWith(".mp3") ||
          url.includes("download") || 
          url.includes("spotify-api") ||
          url.includes("mybackend.in") ||
          url.includes("cloudfront") || 
          url.includes("cdn.")) {
        return url;
      }
    }
    return "";
  });
  
  const [showSpotifySearch, setShowSpotifySearch] = useState(false);
  const photoUploadLabelId = useId();
  const drawingUploadLabelId = useId();
  const planTheme = PLAN_APPEARANCE[plan];
  const headerSurface = plan === "plan_premium" ? "bg-[#fbeedc] text-[#5c3b1d]" : "bg-[#f4f6fb] text-[#1f232b]";
  const closeSurface = plan === "plan_premium" ? "bg-[#f3d6b7] text-[#5c3b1d]" : "bg-[#e5e9ef] text-[#4d5663]";
  const selectionHover = plan === "plan_premium" ? "hover:border-[#f5e0c6] hover:bg-[#fff7ee]" : "hover:border-[#d7dde5] hover:bg-[#f5f7fb]";
  const ctaClasses = `${planTheme.ctaBg} ${planTheme.ctaHover} ${planTheme.ctaText}`;
  const selectionButtonClass = `h-full text-left p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all group flex flex-col justify-between ${selectionHover} dark:hover:bg-gray-900/40`;

  const handleSave = () => {
    if (!selectedType || !content) return;

    // Pour la musique, si on a un lien MP3, l'utiliser en priorité
    const finalContent = selectedType === "music" && mp3Url ? mp3Url : content;

    onSave({
      type: selectedType,
      content: finalContent,
      title: title || undefined
    });
    onClose();
  };

  const handleFileUpload =
    (type: DayContent["type"]) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (type === "photo") {
        setUploadedFileName(file.name);
      }
      if (type === "drawing") {
        setDrawingFileName(file.name);
      }
      if (type === "music") {
        setMp3Url("");
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setContent(event.target?.result as string);
        if (type === "music") {
          setMp3Url((event.target?.result as string) || "");
        }
      };
      reader.readAsDataURL(file);
    };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container mx-auto px-2 sm:px-4 pt-16 sm:pt-24 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl mx-auto">
          <div className={`${headerSurface} p-4 sm:p-6 rounded-t-2xl border-b border-black/5`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold">Jour {day}</h2>
              <button
                onClick={onClose}
                className={`${closeSurface} w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors flex-shrink-0`}
              >
                ✕
              </button>
            </div>
            <p className="mt-2 opacity-80 text-sm sm:text-base">Choisissez le type de contenu</p>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
          {!selectedType && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" style={{ gridAutoRows: "1fr" }}>
              <SelectionButton
                type="photo"
                label="Photo ou Vidéo"
                description="Ajouter une image"
                icon="📷"
                onSelect={setSelectedType}
                className={selectionButtonClass}
              />
              <SelectionButton
                type="message"
                label="Message"
                description="Écrire un mot"
                icon="💌"
                onSelect={setSelectedType}
                className={selectionButtonClass}
              />
              <SelectionButton
                type="drawing"
                label="Dessin"
                description="Créer un dessin"
                icon="🎨"
                onSelect={setSelectedType}
                className={selectionButtonClass}
              />
              {allowMusic && (
                <>
                  <SelectionButton
                    type="music"
                    label="Musique"
                    description="Ajouter un son"
                    icon="🎵"
                    onSelect={setSelectedType}
                    className={selectionButtonClass}
                  />
                  <SelectionButton
                    type="voice"
                    label="Messages vocaux"
                    description="Enregistrer une note audio"
                    icon="🎙️"
                    onSelect={setSelectedType}
                    className={selectionButtonClass}
                  />
                  <SelectionButton
                    type="ai_photo"
                    label="Photos IA"
                    description="Générer une image magique"
                    icon="🤖"
                    onSelect={setSelectedType}
                    className={selectionButtonClass}
                  />
                </>
              )}
            </div>
          )}

          {selectedType === "photo" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setContent("");
                    setTitle("");
                    setUploadedFileName("");
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  🔄 Changer de type
                </button>
              </div>

              <label className="block cursor-pointer" htmlFor={photoUploadLabelId}>
                <span className="block text-sm font-medium mb-2">Télécharger une photo</span>
                <div className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 flex items-center justify-between text-sm transition-colors hover:border-gray-300 dark:hover:border-gray-600">
                  <span className={uploadedFileName ? "text-gray-800 dark:text-gray-100" : "text-gray-400"}>
                    {uploadedFileName || "Uploader la photo"}
                  </span>
                  <span className="text-xs font-semibold text-[#d4af37]">Importer</span>
                </div>
                <input
                  id={photoUploadLabelId}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload("photo")}
                  className="sr-only"
                />
              </label>

              {content && (
                <div className="relative rounded-lg overflow-hidden max-h-64">
                  <img src={content} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Titre (optionnel)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 ${title ? "text-black dark:text-white" : ""}`}
                  />
                  {!title && (
                    <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400 dark:text-gray-500 text-base">
                      Votre texte...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedType === "message" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setContent("");
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  🔄 Changer de type
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Votre message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Votre texte..."
                  rows={6}
                  className={`w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 resize-none text-black dark:text-white placeholder:text-gray-400 placeholder:dark:text-gray-500`}
                />
              </div>
            </div>
          )}

          {selectedType === "drawing" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setContent("");
                    setDrawingFileName("");
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  🔄 Changer de type
                </button>
              </div>

              <div className="bg-white/80 dark:bg-gray-900/70 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-lg text-[#4a0808] mb-3">Dessinez comme sur Paint</h3>
                <DrawingPad
                  initialImage={content}
                  onSave={(data) => {
                    setContent(data);
                    setDrawingFileName("Dessin enregistré");
                  }}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Ou importez un dessin existant</p>
                <label className="block cursor-pointer" htmlFor={drawingUploadLabelId}>
                  <div className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 bg-white dark:bg-gray-900 flex items-center justify-between text-sm transition-colors hover:border-gray-300 dark:hover:border-gray-600">
                    <span className={drawingFileName ? "text-gray-800 dark:text-gray-100" : "text-gray-400"}>
                      {drawingFileName || "Uploader le dessin"}
                    </span>
                    <span className="text-xs font-semibold text-[#d4af37]">Importer</span>
                  </div>
                  <input
                    id={drawingUploadLabelId}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload("drawing")}
                    className="sr-only"
                  />
                </label>
              </div>

              {content && (
                <div className="relative rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 p-4">
                  <img src={content} alt="Drawing preview" className="w-full h-auto" />
                </div>
              )}
            </div>
          )}

          {selectedType === "music" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (content) {
                      // Si une musique est déjà sélectionnée, rouvrir le modal Spotify
                      setShowSpotifySearch(true);
                    } else {
                      // Sinon, retour au choix du type de contenu
                      setSelectedType(null);
                    }
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setContent("");
                    setTitle("");
                    setMp3Url("");
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  🔄 Changer de type
                </button>
              </div>

              {!content ? (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">🎵</div>
                    <h3 className="text-xl font-bold mb-2">Choisissez votre musique</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Cherchez sur Spotify la chanson parfaite pour cette case.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setShowSpotifySearch(true)}
                        className="px-8 py-4 rounded-full font-bold transition-all hover:scale-105"
                        style={{
                          background: "linear-gradient(135deg, #d4af37 0%, #e8d5a8 50%, #d4af37 100%)",
                          color: "#4a0808"
                        }}
                      >
                        🔍 Rechercher sur Spotify
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl">✅</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {title || "Chanson sélectionnée"}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {mp3Url ? "Fichier audio" : "Spotify"}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Titre:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 break-all">{title}</p>
                      </div>

                      {mp3Url && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">🎵 Lecteur audio:</p>
                          <audio controls className="w-full mt-2" src={mp3Url}>
                            Votre navigateur ne supporte pas l'élément audio.
                          </audio>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">✅ Fichier MP3 prêt à être écouté</p>
                        </div>
                      )}

                      {!mp3Url && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ⚠️ MP3 non disponible pour cette chanson.
                            <br />
                            Lien Spotify: <span className="font-mono text-xs">{content}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Champ de message optionnel */}
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
                      Message avec la musique (optionnel) 💌
                    </label>
                    <textarea
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ajoute un petit mot pour accompagner cette chanson..."
                      rows={4}
                      className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900 resize-none text-gray-900 dark:text-gray-100 placeholder:text-gray-500"
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setContent("");
                        setTitle("");
                        setMp3Url("");
                        setShowSpotifySearch(true);
                      }}
                      className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
                    >
                      ← Changer de musique
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedType === "voice" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setContent("");
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  🔄 Changer de type
                </button>
              </div>

              {!content ? (
                <VoiceRecorder
                  onSave={(audioDataUrl) => {
                    setContent(audioDataUrl);
                  }}
                  onCancel={() => setSelectedType(null)}
                />
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-700">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">🎤</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Message vocal enregistré</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Prêt à être ajouté au calendrier</p>
                      </div>
                    </div>
                    <audio controls src={content} className="w-full rounded-lg" />
                  </div>
                  
                  <button
                    onClick={() => setContent("")}
                    className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
                  >
                    🔄 Réenregistrer
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedType === "ai_photo" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  ← Retour
                </button>
                <button
                  onClick={() => {
                    setSelectedType(null);
                    setContent("");
                    setAiPhotoFile(null);
                    setAiPhotoUrl(null);
                    setAiPhotoPrompt("");
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  🔄 Changer de type
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Image de base (optionnel)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) setAiPhotoFile(e.target.files[0]);
                  }}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
                {aiPhotoFile && (
                  <img src={URL.createObjectURL(aiPhotoFile)} alt="Aperçu upload" className="max-h-40 rounded-lg border mt-2" />
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Prompt IA</label>
                <input
                  type="text"
                  value={aiPhotoPrompt}
                  onChange={e => setAiPhotoPrompt(e.target.value)}
                  placeholder="Ex: mets la personne sur la photo dans un traîneau de noël dans la neige"
                  className="w-full border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-900"
                />
                <div className="flex flex-wrap gap-2 mt-1">
                  {["mets la personne sur la photo dans un traîneau de noël dans la neige", "transforme la photo en style cartoon de noël", "ajoute un bonnet de noël à la personne"].map(sugg => (
                    <button key={sugg} type="button" onClick={() => setAiPhotoPrompt(sugg)} className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs border border-amber-200 hover:bg-amber-100">{sugg}</button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGenerateAiPhoto}
                  disabled={aiPhotoLoading || !aiPhotoPrompt}
                  className="w-full py-3 rounded-lg font-bold bg-amber-500 hover:bg-yellow-500 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiPhotoLoading ? "Génération en cours..." : "✨ Générer l'image IA"}
                </button>
              </div>

              {aiPhotoUrl && (
                <div className="space-y-2">
                  <img src={aiPhotoUrl} alt="Aperçu IA" className="max-h-60 rounded-xl border mx-auto" />
                  <button
                    type="button"
                    onClick={() => {
                      setContent(aiPhotoUrl);
                      setAiPhotoFile(null);
                      setAiPhotoPrompt("");
                    }}
                    className="w-full py-3 rounded-lg font-bold bg-green-600 hover:bg-green-700 text-white transition-all"
                  >
                    ✅ Utiliser cette image
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedType && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={!content}
                className={`flex-1 py-3 rounded-lg font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${ctaClasses}`}
              >
                Enregistrer
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-[#4a0808] text-[#4a0808] rounded-lg font-semibold bg-white hover:bg-[#4a0808]/10 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Spotify Search Modal */}
      {showSpotifySearch && (
        <SpotifySearchModal
          plan={plan}
          onSelect={(track) => {
            setContent(track.spotifyUrl);
            setMp3Url(track.mp3Url || track.downloadUrl || "");
            setTitle(`${track.name} - ${track.artist}`);
            setShowSpotifySearch(false);
          }}
          onClose={() => setShowSpotifySearch(false)}
        />
      )}
    </div>
  );
}

type SelectionButtonProps = {
  type: DayContent["type"];
  label: string;
  description: string;
  icon: string;
  onSelect: (type: DayContent["type"]) => void;
  className: string;
};

function SelectionButton({ type, label, description, icon, onSelect, className }: SelectionButtonProps) {
  return (
    <button onClick={() => onSelect(type)} className={className}>
      <div className="text-5xl mb-3">{icon}</div>
      <div className="font-bold text-lg text-[#6b0f0f] dark:text-[#f5dada]">{label}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
    </button>
  );
}

type DrawingPadProps = {
  initialImage: string | null;
  onSave: (dataUrl: string) => void;
};

function DrawingPad({ initialImage, onSave }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState("#4a0808");
  const [brushSize, setBrushSize] = useState(4);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 320;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (initialImage) {
      const img = new Image();
      img.src = initialImage;
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    ctxRef.current = ctx;
  }, [initialImage]);

  const getPosition = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in event) {
      const touch = event.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    setStatus(null);
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getPosition(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    event.preventDefault();
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getPosition(event);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    onSave(data);
    setStatus("Dessin enregistré !");
    setTimeout(() => setStatus(null), 2000);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSave("");
    setStatus("Toile réinitialisée");
    setTimeout(() => setStatus(null), 1500);
  };

  const colors = ["#4a0808", "#d97706", "#b45309", "#78350f", "#f4f1eb", "#1f2937"];
  const [customColor, setCustomColor] = useState("#4a0808");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setBrushColor(color)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition ${brushColor === color ? "border-[#4a0808]" : "border-transparent"}`}
              style={{ backgroundColor: color }}
            />
          ))}
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Palette
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                setBrushColor(e.target.value);
              }}
              className="h-9 w-9 cursor-pointer rounded-full border-2 border-gray-400 p-0 appearance-none bg-transparent
                         [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0
                         [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0"
              style={{ backgroundColor: customColor }}
              aria-label="Choisir une couleur personnalisée"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          Taille
          <input
            type="range"
            min={2}
            max={20}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32"
          />
        </label>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border-2 border-gray-200 rounded-2xl bg-white shadow-inner"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: "none" }}
        />
        {status && (
          <div className="absolute top-3 right-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#4a0808] shadow">
            {status}
          </div>
        )}
      </div>
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 min-w-[180px] rounded-full bg-[#4a0808] text-white font-semibold py-2 px-4 hover:bg-[#701010] transition-colors"
        >
          Enregistrer mon dessin
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
        >
          Effacer
        </button>
      </div>
    </div>
  );
}
