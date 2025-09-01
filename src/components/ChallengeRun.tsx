import React, { useEffect, useMemo, useRef, useState } from "react";
import type { UnitConfig } from "../types";
import { Card, SectionTitle } from "./ui";
import { makeChallengeSet } from "../lib/questionGen";


function useCountdown(secs: number, running: boolean) {
const [left, setLeft] = useState(secs);
const ref = useRef<number | null>(null);
useEffect(() => {
if (!running) return; setLeft(secs);
const tick = () => setLeft((l) => (l <= 0 ? 0 : l - 1));
ref.current = window.setInterval(tick, 1000);
return () => { if (ref.current) window.clearInterval(ref.current) };
}, [secs, running]);
return left;
}


type Props = { unit: UnitConfig; onFinish: (score: number, timeUsed: number) => void; totalTime?: number };


export default function ChallengeRun({ unit, onFinish, totalTime = 60 }: Props) {
const QUESTIONS = useMemo(() => makeChallengeSet(unit, 10), [unit.id]);
const [idx, setIdx] = useState(0);
const [score, setScore] = useState(0);
const [started, setStarted] = useState(false);
const left = useCountdown(totalTime, started);


useEffect(() => { if (started && left === 0) onFinish(score, totalTime); }, [left, started]);


const cur = QUESTIONS[idx];
function start() { setStarted(true); }
function choose(i: number) {
if (!started) return;
const correct = i === cur.correctIndex;
if (correct) setScore((s) => s + 1);
setTimeout(() => {
if (idx + 1 >= QUESTIONS.length) onFinish(correct ? score + 1 : score, totalTime - left);
else setIdx(idx + 1);
}, 250);
}


return (
<Card>
<div className="flex items-center justify-between">
<SectionTitle title={`挑戰題 (${idx + 1}/${QUESTIONS.length})`} desc={`限時 ${totalTime} 秒`} />
<div className={`px-3 py-1 rounded-xl text-sm font-semibold ${left <= 10 ? "bg-red-100 text-red-700" : "bg-neutral-100 text-neutral-700"}`}>⏱ 剩餘 {left}s</div>
</div>
{!started ? (
<button onClick={start} className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-sm">開始挑戰</button>
) : (
<>
<div className="text-base font-medium mb-3">{cur.prompt}</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
{cur.choices.map((c, i) => (
<button key={i} onClick={() => choose(i)} className="p-3 rounded-xl border bg-white hover:bg-neutral-50 text-left">
{String.fromCharCode(65 + i)}. {c}
</button>
))}
</div>
</>
)}
</Card>
);
}