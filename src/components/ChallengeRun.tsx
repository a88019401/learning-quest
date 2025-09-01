// components/ChallengeRun.tsx
import { useEffect, useMemo, useRef, useState } from "react";import type { UnitConfig } from "../types";
import { Card, SectionTitle } from "./ui";
import { makeChallengeSet } from "../lib/questionGen";

function useCountdown(secs: number, running: boolean) {
  const [left, setLeft] = useState(secs);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    if (!running) return;
    setLeft(secs);
    const tick = () => setLeft((l) => (l <= 0 ? 0 : l - 1));
    ref.current = window.setInterval(tick, 1000) as unknown as number;
    return () => {
      if (ref.current) window.clearInterval(ref.current);
    };
  }, [secs, running]);
  return left;
}

type Props = {
  unit: UnitConfig;
  onFinish: (score: number, timeUsed: number) => void;
  totalTime?: number;
};

export default function ChallengeRun({ unit, onFinish, totalTime = 60 }: Props) {
  const QUESTIONS = useMemo(() => makeChallengeSet(unit, 10), [unit.id]);

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);

  const left = useCountdown(totalTime, started);

  // 時間到：結束（timeUsed = totalTime）
  useEffect(() => {
    if (started && left === 0) {
      onFinish(score, totalTime);
    }
  }, [left, started]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = QUESTIONS[idx];

  function start() {
    setStarted(true);
    setIdx(0);
    setScore(0);
    setSelectedIdx(null);
    setReveal(false);
  }

  function choose(i: number) {
    if (!started || reveal) return;
    setSelectedIdx(i);
    const correct = i === cur.correctIndex;

    // 分數先加起來（之後 450ms 進下一題）
    if (correct) setScore((s) => s + 1);

    // 顯示即時回饋：選到者紅或綠 & 正解一定綠
    setReveal(true);

    setTimeout(() => {
      // 進下一題或結束
      if (idx + 1 >= QUESTIONS.length) {
        const timeUsed = totalTime - left;
        const finalScore = correct ? score + 1 : score; // 這題若對，已上面 setScore，但保險起見
        onFinish(finalScore, timeUsed);
      } else {
        setIdx((n) => n + 1);
        setSelectedIdx(null);
        setReveal(false);
      }
    }, 450);
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <SectionTitle
          title={`挑戰題 (${idx + 1}/${QUESTIONS.length})`}
          desc={`限時 ${totalTime} 秒`}
        />
        <div
          className={`px-3 py-1 rounded-xl text-sm font-semibold ${
            left <= 10 ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-700"
          }`}
        >
          ⏱ 剩餘 {left}s
        </div>
      </div>

      {!started ? (
        <button
          onClick={start}
          className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm"
        >
          開始挑戰
        </button>
      ) : (
        <>
          <div className="text-base font-semibold mb-3">{cur.prompt}</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {cur.choices.map((c, i) => {
              const isCorrect = i === cur.correctIndex;
              const isPicked = i === selectedIdx;

              // 回饋樣式
              let cls =
                "p-3 rounded-xl border text-left transition select-none focus:outline-none";
              if (reveal) {
                if (isCorrect) {
                  cls += " bg-green-50 border-green-400 ring-1 ring-green-300 animate-pulse";
                } else if (isPicked) {
                  cls += " bg-red-50 border-red-400 ring-1 ring-red-300 animate-pulse";
                } else {
                  cls += " bg-white opacity-80";
                }
              } else {
                cls += " bg-white hover:bg-neutral-50";
              }

              return (
                <button
                  key={i}
                  disabled={reveal} // 顯示回饋期間先鎖點
                  onClick={() => choose(i)}
                  className={cls}
                >
                  {String.fromCharCode(65 + i)}. {c}
                </button>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
