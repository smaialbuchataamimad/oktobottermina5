'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Pin, Calendar } from 'lucide-react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  color: string;
  connections: number[];
}

interface BubblemapsProps {
  tokenSymbol: string;
  onClose: () => void;
}

export function Bubblemaps({ tokenSymbol, onClose }: BubblemapsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Generate bubble data
    const mainBubble: Bubble = {
      x: 500,
      y: 300,
      radius: 120,
      color: '#854d0e',
      connections: [],
    };

    const secondaryBubbles: Bubble[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 200;
      const radius = 40 + Math.random() * 60;

      return {
        x: mainBubble.x + Math.cos(angle) * distance,
        y: mainBubble.y + Math.sin(angle) * distance,
        radius,
        color: i % 2 === 0 ? '#854d0e' : '#1e3a8a',
        connections: [0],
      };
    });

    const smallBubbles: Bubble[] = Array.from({ length: 15 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 350 + Math.random() * 150;

      return {
        x: mainBubble.x + Math.cos(angle) * distance,
        y: mainBubble.y + Math.sin(angle) * distance,
        radius: 15 + Math.random() * 30,
        color: '#1e3a8a',
        connections: [Math.floor(Math.random() * 8) + 1],
      };
    });

    setBubbles([mainBubble, ...secondaryBubbles, ...smallBubbles]);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || bubbles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1000;
    canvas.height = 600;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    bubbles.forEach((bubble, i) => {
      bubble.connections.forEach(targetIndex => {
        const target = bubbles[targetIndex];
        if (!target) return;

        ctx.beginPath();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.moveTo(bubble.x, bubble.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });
    });

    // Draw bubbles
    bubbles.forEach((bubble, i) => {
      // Draw glow
      const gradient = ctx.createRadialGradient(
        bubble.x,
        bubble.y,
        0,
        bubble.x,
        bubble.y,
        bubble.radius
      );
      gradient.addColorStop(0, bubble.color + '66');
      gradient.addColorStop(0.7, bubble.color + '22');
      gradient.addColorStop(1, bubble.color + '00');

      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw border
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.strokeStyle = bubble.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw small connection nodes
      if (i > 0) {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
      }
    });
  }, [bubbles]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0f172a] rounded-lg w-full max-w-6xl border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
              {tokenSymbol.substring(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{tokenSymbol} Bubblemaps</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Top 80 Holders + 45 👥</span>
                <Calendar className="h-3 w-3" />
                <span>Dec 14, 2025</span>
                <span>a few seconds ago</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-purple-600/20 text-purple-400 rounded hover:bg-purple-600/30">
              <Pin className="h-4 w-4" />
            </button>
            <button className="p-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700">
              🗑️
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-800 text-gray-400 rounded hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ maxHeight: '600px' }}
          />

          {/* Address List Button */}
          <button className="absolute top-4 right-4 px-4 py-2 bg-gray-900/90 border border-gray-700 text-white rounded-lg hover:bg-gray-800">
            Address List 📋
          </button>
        </div>
      </div>
    </div>
  );
}
