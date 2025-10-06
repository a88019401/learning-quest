import { useMemo, useState } from "react";
import { Card, SectionTitle } from "./ui";

type Props = { targets: string[]; onFinished: (score: number) => void };

// 把句子切成詞與標點：Hello, world! → ["Hello", ",", "world", "!"]
function tokenize(sentence: string): string[] {
  const s = sentence.trim().replace(/\s+/g, " ");
  const tokens = s.match(/[\w’']+|[^\s]/g); // 單字(含 ' ’) 或任何非空白字元（標點）
  return tokens ?? [s];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReorderSentenceGame({ targets, onFinished }: Props) {
  const rounds = useMemo(() => shuffle(targets).slice(0, 10), [targets]); // 10 題制
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const current = rounds[roundIdx] ?? "";
  const answerTokens = useMemo(() => tokenize(current), [current]);

  const [tray, setTray] = useState<string[]>(() => {
    let shuffled = shuffle(answerTokens);
    if (shuffled.join("|") === answerTokens.join("|")) {
      shuffled = shuffle(answerTokens);
    }
    return shuffled;
  });
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null); // null: 未檢查, true/false: 檢查結果

  const total = rounds.length;
  const passed = score >= Math.ceil(total * 0.7); // 7/10 過關

  function resetRound() {
    setTray(() => {
      let shuffled = shuffle(answerTokens);
      if (shuffled.join("|") === answerTokens.join("|")) {
        shuffled = shuffle(answerTokens);
      }
      return shuffled;
    });
    setPicked([]);
    setChecked(null);
  }

  function pickToken(t: string, idx: number) {
    if (checked !== null) return;
    setPicked((p) => [...p, t]);
    setTray((arr) => arr.filter((_, i) => i !== idx));
  }

  function unpickToken(idx: number) {
    if (checked !== null) return;
    setTray((arr) => [...arr, picked[idx]]);
    setPicked((p) => p.filter((_, i) => i !== idx));
  }

  function check() {
    if (checked !== null) return;
    const ok =
      picked.length === answerTokens.length &&
      picked.every((t, i) => t === answerTokens[i]);
    setChecked(ok);
    if (ok) setScore((s) => s + 1);
  }

  function next() {
    const isLast = roundIdx + 1 >= total;
    if (isLast) {
      setDone(true);
      onFinished(checked ? score + 1 : score); // 若最後一題剛剛判定正確，要+1
      return;
    }
    setRoundIdx((x) => x + 1);
    setChecked(null);
    setPicked([]);
    setTray(() => {
      const nextAnswer = tokenize(rounds[roundIdx + 1] ?? "");
      let shuffled = shuffle(nextAnswer);
      if (shuffled.join("|") === nextAnswer.join("|")) {
        shuffled = shuffle(nextAnswer);
      }
      return shuffled;
    });
  }

  function restart() {
    setRoundIdx(0);
    setScore(0);
    setDone(false);
    setChecked(null);
    setPicked([]);
    setTray(() => {
      const firstAns = tokenize(rounds[0] ?? "");
      let shuffled = shuffle(firstAns);
      if (shuffled.join("|") === firstAns.join("|")) shuffled = shuffle(firstAns);
      return shuffled;
    });
  }

  // —— 結束畫面 —— //
  if (done) {
    return (
      <Card>
        <div className={`flex items-center gap-3 mb-3 ${passed ? "text-green-700" : "text-amber-700"}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${passed ? "bg-green-100" : "bg-amber-100"}`}>
            {passed ? "✓" : "!"}
          </div>
        </div>
        <SectionTitle title={passed ? "恭喜通關！" : "再接再厲！"} desc={`得分：${score} / ${total}`} />
        <div className="p-4 rounded-xl border bg-white">
          <div className="text-sm text-neutral-600">
            {passed ? "排序很穩！下一輪挑戰更快完成吧！" : "再練一次就上手了！"}
          </div>
          <div className="mt-4">
            <button onClick={restart} className="px-4 py-2 rounded-xl border bg-neutral-900 text-white hover:opacity-90">
              再來一次
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // —— 作答畫面 —— //
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <SectionTitle title={`重組句子 (${roundIdx + 1}/${total})`} desc={`目前得分：${score} / ${total}`} />
        <div className="w-40 h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div className="h-2 bg-neutral-900 transition-all" style={{ width: `${(roundIdx / total) * 100}%` }} />
        </div>
      </div>

      {/* 指示說明（不再直接曝光答案） */}
      <div className="text-xs text-neutral-500 mb-2">請把下方片段點選並排成正確的句子。</div>

      {/* 已選答案區 */}
      <div
        className={`min-h-[56px] p-3 rounded-xl border ${
          checked === null
            ? "bg-white border-neutral-200"
            : checked
            ? "bg-green-50 border-green-300"
            : "bg-red-50 border-red-300"
        }`}
      >
        {picked.length === 0 ? (
          <span className="text-neutral-400 text-sm">點選下方片段來組句</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {picked.map((t, i) => (
              <button
                key={`p-${i}-${t}-${i}`}
                onClick={() => unpickToken(i)}
                className="px-2 py-1 rounded-lg border bg-white hover:bg-neutral-50"
                title="點擊以移回下方"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* ❗錯誤即時回饋：顯示正確排序 */}
        {checked === false && (
          <div className="mt-3 p-2 rounded-lg border bg-amber-50 border-amber-300">
            <div className="text-xs font-medium text-amber-800 mb-1">正確排序：</div>
            <div className="flex flex-wrap gap-2">
              {answerTokens.map((t, i) => (
                <span key={`sol-${i}-${t}-${i}`} className="px-2 py-1 rounded-lg border bg-white">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 候選片段區 */}
      <div className="mt-3 p-3 rounded-xl border bg-white border-neutral-200">
        <div className="flex flex-wrap gap-2">
          {tray.map((t, i) => (
            <button
              key={`t-${i}-${t}-${i}`}
              onClick={() => pickToken(t, i)}
              className="px-2 py-1 rounded-lg border bg-white hover:bg-neutral-50"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 操作列 */}
      <div className="mt-3 flex gap-2">
        {checked === null ? (
          <>
            <button onClick={check} className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90">
              檢查後繳交
            </button>
            <button onClick={resetRound} className="px-4 py-2 rounded-xl border">
              重洗一下
            </button>
          </>
        ) : (
          <button onClick={next} className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:opacity-90">
            下一題
          </button>
        )}
      </div>
    </Card>
  );
}
