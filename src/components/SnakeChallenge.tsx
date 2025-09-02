// components/SnakeChallenge.tsx
import  { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, SectionTitle } from "./ui";

/**
 * 極簡可嵌入的貪吃蛇（Snake）小遊戲
 * - 與 ChallengeRun 相容：以 onFinish(score, timeUsed) 回傳結果
 * - 預設限時 60 秒，目標 10 分（吃到 10 顆蘋果）
 * - 可用鍵盤（↑↓←→ / WASD）與行動裝置螢幕上的方向鍵
 * - 解析度自動縮放（邏輯格 20x20）
 */

export type SnakeChallengeProps = {
  title?: string;
  totalTime?: number; // 限時秒數（預設 60）
  targetScore?: number; // 預設 10（與既有關卡分數一致）
  speedMs?: number; // 蛇移動間隔（毫秒）
  onFinish: (score: number, timeUsed: number) => void;
};

const GRID = 20; // 20x20 格
const DIRS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

type Pos = { x: number; y: number };

function randCell(exclude: Pos[]): Pos {
  while (true) {
    const p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    if (!exclude.some((e) => e.x === p.x && e.y === p.y)) return p;
  }
}

export default function SnakeChallenge({
  title = "第 2–3 關：貪吃蛇",
  totalTime = 60,
  targetScore = 10,
  speedMs = 120,
  onFinish,
}: SnakeChallengeProps) {
  //——— UI 與時間 ——–
  const [started, setStarted] = useState(false);
  const [left, setLeft] = useState(totalTime);
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    setLeft(totalTime);
  }, [totalTime]);

  //——— 遊戲狀態 ——–
  const [dir, setDir] = useState<Pos>(DIRS.RIGHT);
  const [nextDir, setNextDir] = useState<Pos>(DIRS.RIGHT);
  const [snake, setSnake] = useState<Pos[]>(() => [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ]);
  const [food, setFood] = useState<Pos>(() => randCell([]));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  //——— 畫布大小自適應 ——–
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const size = useMemo(() => 400, []); // 基準尺寸

  //——— 鍵盤與行動裝置控制 ——–
  const steer = useCallback((dx: number, dy: number) => {
    // 禁止 180 度回頭
    if (dx + dir.x === 0 && dy + dir.y === 0) return;
    setNextDir({ x: dx, y: dy });
  }, [dir.x, dir.y]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (["arrowup", "w"].includes(k)) steer(0, -1);
      else if (["arrowdown", "s"].includes(k)) steer(0, 1);
      else if (["arrowleft", "a"].includes(k)) steer(-1, 0);
      else if (["arrowright", "d"].includes(k)) steer(1, 0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steer]);

  //——— 倒數計時 ——–
  useEffect(() => {
    if (!started || gameOver) return;
    timerRef.current = window.setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000) as any;
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [started, gameOver]);

  useEffect(() => {
    if (started && left === 0) {
      setGameOver(true);
      onFinish(score, totalTime);
    }
  }, [left, started, score, totalTime, onFinish]);

  //——— 主迴圈（移動） ——–
  const loopRef = useRef<number | null>(null);
  useEffect(() => {
    if (!started || gameOver) return;

    const step = () => {
      setDir(nextDir); // 每格只採用一次最新方向
      setSnake((prev) => {
        const head = { x: prev[0].x + nextDir.x, y: prev[0].y + nextDir.y };

        // 撞牆 / 撞到自己
        if (head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID) {
          setGameOver(true);
          onFinish(score, totalTime - left);
          return prev;
        }
        if (prev.some((p) => p.x === head.x && p.y === head.y)) {
          setGameOver(true);
          onFinish(score, totalTime - left);
          return prev;
        }

        // 吃到食物：加分、變長、重新擺放食物
        if (head.x === food.x && head.y === food.y) {
          const next = [head, ...prev];
          setScore((s) => s + 1);
          setFood(randCell(next));
          if (score + 1 >= targetScore) {
            setGameOver(true);
            onFinish(score + 1, totalTime - left);
          }
          return next; // 不移除尾巴 -> 變長
        }

        // 正常前進：頭 + 身體其餘向前
        const next = [head, ...prev.slice(0, -1)];
        return next;
      });
    };

    const id = window.setInterval(step, speedMs) as unknown as number;
    loopRef.current = id;
    return () => window.clearInterval(id);
  }, [started, gameOver, nextDir, food, score, totalTime, left, speedMs, onFinish]);

  //——— 繪圖 ——–
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    // 背景
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = "#f8fafc"; // slate-50
    ctx.fillRect(0, 0, cv.width, cv.height);

    const cell = Math.floor(cv.width / GRID);

    // 棋盤淡淡格線（可關閉）
    ctx.strokeStyle = "#e5e7eb"; // neutral-200
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell + 0.5, 0);
      ctx.lineTo(i * cell + 0.5, cv.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cell + 0.5);
      ctx.lineTo(cv.width, i * cell + 0.5);
      ctx.stroke();
    }

    // 食物
    ctx.fillStyle = "#ef4444"; // red-500
    ctx.beginPath();
    ctx.arc((food.x + 0.5) * cell, (food.y + 0.5) * cell, Math.floor(cell * 0.35), 0, Math.PI * 2);
    ctx.fill();

    // 蛇
    ctx.fillStyle = "#0ea5e9"; // sky-500
    snake.forEach((p, i) => {
      const r = Math.floor(cell * (i === 0 ? 0.48 : 0.42));
      ctx.beginPath();
      ctx.arc((p.x + 0.5) * cell, (p.y + 0.5) * cell, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [snake, food]);

  //——— 重新開始 ——–
  const reset = useCallback(() => {
    setStarted(false);
    setLeft(totalTime);
    setDir(DIRS.RIGHT);
    setNextDir(DIRS.RIGHT);
    setSnake([
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ]);
    setFood(randCell([]));
    setScore(0);
    setGameOver(false);
  }, [totalTime]);

  //——— 行動裝置 D-Pad ——–
  const DPad = (
    <div className="grid grid-cols-3 gap-2 w-40 select-none">
      <div />
      <button aria-label="up" onClick={() => steer(0, -1)} className="px-3 py-2 rounded-xl border">↑</button>
      <div />
      <button aria-label="left" onClick={() => steer(-1, 0)} className="px-3 py-2 rounded-xl border">←</button>
      <div />
      <button aria-label="right" onClick={() => steer(1, 0)} className="px-3 py-2 rounded-xl border">→</button>
      <div />
      <button aria-label="down" onClick={() => steer(0, 1)} className="px-3 py-2 rounded-xl border">↓</button>
      <div />
    </div>
  );

  //——— 外觀 ——–
  return (
    <Card>
      <div className="flex items-center justify-between">
        <SectionTitle title={`${title}`} desc={`限時 ${totalTime} 秒 · 目標 ${targetScore} 分`} />
        <div className={`px-3 py-1 rounded-xl text-sm font-semibold ${left <= 10 ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-700"}`}>
          ⏱ 剩餘 {left}s
        </div>
      </div>

      {/* 畫布 + 控制區 */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div ref={wrapperRef} className="w-full max-w-[480px] aspect-square">
          <canvas ref={canvasRef} width={size} height={size} className="w-full h-full rounded-2xl border border-neutral-200 bg-white" />
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="text-xl font-semibold">得分：{score}</div>
          {!started ? (
            <button onClick={() => setStarted(true)} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm">開始</button>
          ) : (
            <button onClick={reset} className="px-4 py-2 rounded-xl border text-sm">重新開始</button>
          )}
          {DPad}
          <p className="text-xs text-neutral-500">鍵盤（WASD / 方向鍵）亦可操作</p>
        </div>
      </div>

      {/* 結算蓋板 */}
      {gameOver && (
        <div className="mt-4 p-4 rounded-xl bg-neutral-50 border text-center">
          <div className="text-lg font-semibold mb-1">挑戰結束</div>
          <div className="text-sm text-neutral-600 mb-3">得分 {score} / {targetScore} · 用時 {totalTime - left}s</div>
          <div className="flex justify-center gap-3">
            <button onClick={reset} className="px-4 py-2 rounded-xl border text-sm">再玩一次</button>
          </div>
        </div>
      )}
    </Card>
  );
}
