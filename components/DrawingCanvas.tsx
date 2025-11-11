"use client";

import { useRef, useState, useEffect } from "react";

type DrawingCanvasProps = {
  onSave: (dataUrl: string) => void;
  initialDrawing?: string;
};

export default function DrawingCanvas({ onSave, initialDrawing }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#0f5132");
  const [brushSize, setBrushSize] = useState(3);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    ctxRef.current = context;

    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;

    // Set white background
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Load initial drawing if provided
    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = initialDrawing;
    }

    // Configure context
    context.lineCap = "round";
    context.lineJoin = "round";
  }, [initialDrawing]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current;
    if (!isDrawing || !ctx) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    setIsDrawing(false);
    ctx.closePath();
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    if (!ctx || !canvasRef.current) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };

  const colors = [
    { name: "Sapin", value: "#0f5132" },
    { name: "Vert", value: "#d3d4d4" },
    { name: "Bleu", value: "#2563eb" },
    { name: "Rose", value: "#db2777" },
    { name: "Violet", value: "#9333ea" },
    { name: "Orange", value: "#ea580c" },
    { name: "Jaune", value: "#ca8a04" },
    { name: "Noir", value: "#000000" },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-red-50 to-green-50 dark:from-red-950 dark:to-green-950 p-4 rounded-xl space-y-4">
        {/* Colors */}
        <div>
          <label className="block text-sm font-semibold mb-2">🎨 Couleur</label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-10 h-10 rounded-full border-4 transition-all ${
                  color === c.value
                    ? "border-gray-800 dark:border-white scale-110"
                    : "border-gray-300 dark:border-gray-600 hover:scale-105"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Brush size */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            ✏️ Taille du pinceau: {brushSize}px
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-semibold"
          >
            🗑️ Effacer
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
          >
            💾 Sauvegarder le dessin
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border-4 border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden shadow-lg bg-white">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full h-auto cursor-crosshair"
          style={{ touchAction: "none" }}
        />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        💡 Astuce : Dessinez avec votre souris ou trackpad pour créer une illustration unique !
      </p>
    </div>
  );
}
