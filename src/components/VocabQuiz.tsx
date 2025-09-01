import {  useState } from "react";
import type { MCQ } from "../types";
import { Card, SectionTitle } from "./ui";


type Props = { questions: MCQ[]; onFinished: (score: number) => void };


export default function VocabQuiz({ questions, onFinished }: Props) {
const [idx, setIdx] = useState(0);
const [picked, setPicked] = useState<number | null>(null);
const [score, setScore] = useState(0);
const cur = questions[idx];


function choose(i: number) {
if (picked !== null) return;
setPicked(i);
const correct = i === cur.correctIndex;
if (correct) setScore((s) => s + 1);
setTimeout(() => {
if (idx + 1 >= questions.length) onFinished(correct ? score + 1 : score);
else { setIdx((x) => x + 1); setPicked(null); }
}, 650);
}


return (
<Card>
<SectionTitle title={`單字小測 (${idx + 1}/${questions.length})`} desc={`目前得分：${score}`} />
<div className="text-base font-medium mb-3">{cur.prompt}</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
{cur.choices.map((c, i) => {
const correct = picked !== null && i === cur.correctIndex;
const wrong = picked !== null && i === picked && i !== cur.correctIndex;
return (
<button key={i} onClick={() => choose(i)}
className={`p-3 rounded-xl border text-left transition ${correct ? "bg-green-100 border-green-300" : wrong ? "bg-red-100 border-red-300" : "bg-white border-neutral-200 hover:bg-neutral-50"}`}>
{String.fromCharCode(65 + i)}. {c}
</button>
);
})}
</div>
{picked !== null && cur.explain && (<div className="text-sm text-neutral-500 mt-3">提示：{cur.explain}</div>)}
</Card>
);
}