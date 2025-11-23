"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
  onSave: (audioDataUrl: string) => void;
  onCancel: () => void;
};

export default function VoiceRecorder({ onSave, onCancel }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Convertir en data URL pour sauvegarder
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          // On garde l'URL pour la prévisualisation
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Démarrer le timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Erreur d'accès au microphone:", err);
      setError("Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleSave = () => {
    if (audioURL) {
      // Convertir l'audio en data URL
      fetch(audioURL)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            onSave(reader.result as string);
          };
        });
    }
  };

  const handleRestart = () => {
    setAudioURL("");
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Visualisation du statut */}
      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-xl border-2 border-amber-200 dark:border-amber-700">
        <div className="flex items-center justify-center gap-4 mb-4">
          {isRecording && !isPaused && (
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          )}
          {isRecording && isPaused && (
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          )}
          {!isRecording && audioURL && (
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          )}
          <span className="text-2xl font-mono font-bold text-gray-800 dark:text-gray-200">
            {formatTime(recordingTime)}
          </span>
        </div>

        {/* Contrôles d'enregistrement */}
        {!audioURL && (
          <div className="flex justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold flex items-center gap-2 transition-all"
              >
                🎤 Commencer l'enregistrement
              </button>
            ) : (
              <>
                <button
                  onClick={pauseRecording}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition-all"
                >
                  {isPaused ? "▶️ Reprendre" : "⏸️ Pause"}
                </button>
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-full font-semibold transition-all"
                >
                  ⏹️ Terminer
                </button>
              </>
            )}
          </div>
        )}

        {/* Lecteur audio après enregistrement */}
        {audioURL && (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <span className="text-green-600 dark:text-green-400 font-semibold">
                ✅ Enregistrement terminé
              </span>
            </div>
            <audio controls src={audioURL} className="w-full rounded-lg">
              Votre navigateur ne supporte pas la lecture audio.
            </audio>
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                🔄 Réenregistrer
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                ✅ Utiliser cet enregistrement
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bouton annuler */}
      <button
        onClick={onCancel}
        className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all"
      >
        Annuler
      </button>

      {/* Informations */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        💡 Astuce : Assurez-vous d'être dans un endroit calme pour un meilleur enregistrement
      </div>
    </div>
  );
}
