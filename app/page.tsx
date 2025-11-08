"use client";
import { useEffect, useRef, useState } from "react";

const WIDTH = 960;
const HEIGHT = 540;

function formatTimestamp(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [recording, setRecording] = useState(true);
  const [ts, setTs] = useState(() => formatTimestamp(new Date()));

  useEffect(() => {
    const interval = setInterval(() => setTs(formatTimestamp(new Date())), 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame = 0;
    let running = true;

    const scene = {
      dog: {
        x: WIDTH * 0.45,
        y: HEIGHT * 0.63,
        baseScale: 1,
      },
      burger: {
        x: WIDTH * 0.62,
        y: HEIGHT * 0.7,
        size: 120,
        bites: 0,
      },
      env: {
        doorX: WIDTH * 0.12,
        doorW: 140,
        lawnY: HEIGHT * 0.72,
      }
    } as const;

    function drawBackground(g: CanvasRenderingContext2D, t: number) {
      // Distant street + house facade
      g.fillStyle = "#1a2029";
      g.fillRect(0, 0, WIDTH, HEIGHT);

      // Concrete porch
      g.fillStyle = "#2b3442";
      g.fillRect(0, scene.env.lawnY - 12, WIDTH, HEIGHT - (scene.env.lawnY - 12));

      // Grass
      g.fillStyle = "#1e311f";
      g.fillRect(0, scene.env.lawnY - 90, WIDTH, 90);

      // Door frame
      g.fillStyle = "#3c4656";
      g.fillRect(scene.env.doorX - 16, 80, scene.env.doorW + 32, HEIGHT - 160);
      g.fillStyle = "#596479";
      g.fillRect(scene.env.doorX, 100, scene.env.doorW, HEIGHT - 200);

      // Fence slats
      g.fillStyle = "#243042";
      for (let i = 0; i < 12; i++) {
        const x = 40 + i * 75 + Math.sin(t * 0.0008 + i) * 2;
        g.fillRect(x, 220, 40, 160);
      }

      // Subtle moving clouds
      g.fillStyle = "#263140";
      for (let i = 0; i < 4; i++) {
        const cx = (t * 0.02 + i * 240) % (WIDTH + 200) - 100;
        const cy = 120 + i * 18;
        g.beginPath();
        g.ellipse(cx, cy, 70, 24, 0, 0, Math.PI * 2);
        g.ellipse(cx + 50, cy + 8, 60, 20, 0, 0, Math.PI * 2);
        g.ellipse(cx - 50, cy + 6, 55, 18, 0, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawBurger(g: CanvasRenderingContext2D, x: number, y: number, baseSize: number, bites: number) {
      const remaining = Math.max(0.25, 1 - bites * 0.08);
      const size = baseSize * remaining;
      const wobble = Math.sin(perfNow * 0.008) * 2;

      g.save();
      g.translate(x, y + wobble);

      // Bottom bun
      g.fillStyle = "#b07d3a";
      g.beginPath();
      g.ellipse(0, 0, size * 0.55, size * 0.18, 0, 0, Math.PI * 2);
      g.fill();

      // Patty
      g.fillStyle = "#5a3a2a";
      g.beginPath();
      g.ellipse(0, -size * 0.08, size * 0.6, size * 0.12, 0, 0, Math.PI * 2);
      g.fill();

      // Cheese
      g.fillStyle = "#e9b949";
      g.beginPath();
      g.moveTo(-size * 0.4, -size * 0.18);
      g.lineTo(size * 0.4, -size * 0.18);
      g.lineTo(size * 0.35, -size * 0.06);
      g.lineTo(-size * 0.35, -size * 0.06);
      g.closePath();
      g.fill();

      // Lettuce
      g.fillStyle = "#2f7d32";
      for (let i = -3; i <= 3; i++) {
        g.beginPath();
        g.ellipse(i * size * 0.1, -size * 0.12, size * 0.12, size * 0.04, 0, 0, Math.PI * 2);
        g.fill();
      }

      // Top bun with sesame
      g.fillStyle = "#c5893c";
      g.beginPath();
      g.ellipse(0, -size * 0.26, size * 0.58, size * 0.22, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#f1d7a6";
      for (let i = 0; i < 16; i++) {
        const ax = (Math.random() - 0.5) * size * 0.8;
        const ay = -size * 0.26 + (Math.random() - 0.5) * size * 0.2;
        g.fillRect(ax, ay, 2, 3);
      }

      g.restore();
    }

    function drawDog(g: CanvasRenderingContext2D, t: number, x: number, y: number, scale: number, isEating: boolean) {
      g.save();
      g.translate(x, y);
      g.scale(scale, scale);

      const breath = Math.sin(t * 0.003) * 2;
      const chew = isEating ? (Math.sin(t * 0.025) * 8 + 8) : 0;
      const wag = Math.sin(t * 0.06) * 18;

      // Shadow
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.beginPath();
      g.ellipse(0, 40, 110, 24, 0, 0, Math.PI * 2);
      g.fill();

      // Body
      g.fillStyle = "#9c835f";
      g.beginPath();
      g.ellipse(-40, -10 + breath * 0.3, 110, 60, 0.08, 0, Math.PI * 2);
      g.fill();

      // Tail
      g.save();
      g.translate(-100, -22);
      g.rotate((wag * Math.PI) / 180);
      g.fillStyle = "#8c7456";
      g.beginPath();
      g.ellipse(0, 0, 10, 36, 0.2, 0, Math.PI * 2);
      g.fill();
      g.restore();

      // Legs
      g.fillStyle = "#8c7456";
      g.fillRect(-60, 20, 16, 40);
      g.fillRect(-10, 20, 16, 40);

      // Head group
      g.save();
      g.translate(70, -30 + breath * 0.5);

      // Ear
      g.fillStyle = "#7b6448";
      g.beginPath();
      g.moveTo(-20, -36);
      g.lineTo(-2, -24);
      g.lineTo(-18, -10);
      g.closePath();
      g.fill();

      // Head
      g.fillStyle = "#9c835f";
      g.beginPath();
      g.ellipse(0, 0, 48, 42, 0, 0, Math.PI * 2);
      g.fill();

      // Snout
      g.fillStyle = "#b79c78";
      g.beginPath();
      g.ellipse(20, 10, 38, 22 + chew * 0.2, 0, 0, Math.PI * 2);
      g.fill();

      // Mouth open/close
      g.fillStyle = "#3a2a2a";
      g.beginPath();
      g.ellipse(28, 16 + chew * 0.3, 26, 10 + chew * 0.4, 0, 0, Math.PI * 2);
      g.fill();

      // Nose
      g.fillStyle = "#2a2a2a";
      g.beginPath();
      g.ellipse(40, -4, 8, 6, 0.1, 0, Math.PI * 2);
      g.fill();

      // Eye
      g.fillStyle = "#111";
      g.beginPath();
      g.arc(6, -8, 4, 0, Math.PI * 2);
      g.fill();

      // Collar
      g.fillStyle = "#2c4eaa";
      g.fillRect(-22, 18, 46, 6);

      g.restore();

      g.restore();
    }

    function addVignetteAndNoise(g: CanvasRenderingContext2D) {
      const img = g.getImageData(0, 0, WIDTH, HEIGHT);
      const data = img.data;
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const i = (y * WIDTH + x) * 4;
          // subtle dynamic noise
          const n = (Math.random() - 0.5) * 8;
          data[i] = Math.min(255, Math.max(0, data[i] + n));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
        }
      }
      g.putImageData(img, 0, 0);
    }

    let perfNow = 0;

    function loop(tsNow: number) {
      if (!running) return;
      perfNow = tsNow;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      drawBackground(ctx, tsNow);

      const isEating = (Math.floor(tsNow / 2000) % 3) !== 0;
      drawDog(ctx, tsNow, scene.dog.x, scene.dog.y, scene.dog.baseScale, isEating);

      // progressively reduce burger on each chew interval
      if (isEating && Math.floor(tsNow / 700) % 2 === 0 && scene.burger.bites < 8) {
        scene.burger.bites += 0.01;
      }
      drawBurger(ctx, scene.burger.x, scene.burger.y, scene.burger.size, scene.burger.bites);

      // Camera framing lines
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(20.5, 20.5, WIDTH - 41, HEIGHT - 41);

      addVignetteAndNoise(ctx);

      animationFrame = requestAnimationFrame(loop);
    }

    animationFrame = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <div className="brand">Door Cam</div>
          <div className="controls">
            <button className="button" onClick={() => setRecording(v => !v)}>
              {recording ? "Stop" : "Record"}
            </button>
          </div>
        </div>

        <div className="canvasWrap vignette scanlines" style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}>
          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />

          <div className="overlay">
            <div className="hud">
              <span className="dot" style={{ opacity: recording ? 1 : 0.3 }} />
              <span className="rec">REC</span>
              <span style={{ marginLeft: 10, color: "#cbd5e1" }}>DOOR CAMERA 01</span>
            </div>

            <div className="battery">
              <span style={{ fontSize: 12, color: "#cbd5e1" }}>BAT</span>
              <span className="bars">
                <span className={`bar on`} />
                <span className={`bar on`} />
                <span className={`bar on`} />
                <span className={`bar ${recording ? "on" : ""}`} />
              </span>
            </div>

            <div className="timestamp">{ts}</div>
          </div>
        </div>

        <div className="footer">Simulated recording: a dog eating a burger outside the door, in a stylized door-cam aesthetic.</div>
      </div>
    </div>
  );
}
