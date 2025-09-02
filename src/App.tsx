// App.tsx (整合 SnakeChallenge：第 2 / 3 關改為貪吃蛇)
import { useState, useMemo } from "react";
import { UNITS } from "./data/units";
import type { UnitConfig, UnitId } from "./types";
import { useProgress } from "./state/progress";

import { TabButton, Card, SectionTitle } from "./components/ui";
import VocabSet from "./components/VocabSet";
import VocabQuiz from "./components/VocabQuiz";
import GrammarExplain from "./components/GrammarExplain";
import ReorderSentenceGame from "./components/ReorderSentenceGame";
import StoryViewer from "./components/StoryViewer";
import ArrangeSentencesGame from "./components/ArrangeSentencesGame";
import BadgesView from "./components/BadgesView";

import { makeVocabMCQ } from "./lib/questionGen";

// ✅ React 版挑戰
import ChallengeRun from "./components/ChallengeRun";
import SnakeChallenge from "./components/SnakeChallenge";

type Tab = "learn" | "challenge" | "badges";
type LearnSubTab = "vocab" | "grammar" | "text";
type VocabView = "set" | "quiz";
type GrammarView = "explain" | "reorder";
type TextView = "story" | "arrange";
type ChallengeMode = "select" | "play";

// 關卡星星規則（可自行調整，現為 9/7/4）
function computeLevelStars(score: number) {
  if (score >= 9) return 3;
  if (score >= 7) return 2;
  if (score >= 4) return 1;
  return 0;
}

// 依「前一關 >=2★」規則計算可解鎖到第幾關
function calcUnlockedCount(
  levels: Record<number, { stars: number }> | undefined,
  totalLevels: number
) {
  let unlocked = 1;
  for (let lv = 1; lv <= totalLevels; lv++) {
    const stars = levels?.[lv]?.stars ?? 0;
    if (stars >= 2) unlocked = Math.min(totalLevels, lv + 1);
    else break;
  }
  return unlocked;
}

// ---------- React 版關卡選單 ----------
function LevelGrid({
  total = 10,
  unlockedCount,
  starsByLevel,
  onPick,
}: {
  total?: number;
  unlockedCount: number;
  starsByLevel: number[];
  onPick: (level: number) => void;
}) {
  return (
    <Card>
      <SectionTitle title="選擇關卡 (每單元 10 關)" />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {Array.from({ length: total }, (_, i) => {
          const lv = i + 1;
          const unlocked = lv <= Math.max(1, unlockedCount);
          const stars = starsByLevel[i] ?? 0;
          return (
            <button
              key={lv}
              disabled={!unlocked}
              onClick={() => onPick(lv)}
              className={`p-3 rounded-xl border text-left ${
                unlocked
                  ? "bg-white hover:bg-neutral-50"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <div className="text-xs opacity-70">LEVEL {lv}</div>
              <div className="text-sm">
                {"⭐".repeat(stars)}
                {"☆".repeat(3 - stars)}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function App() {
  // 頁籤 / 視圖狀態
  const [tab, setTab] = useState<Tab>("learn");
  const [unitId, setUnitId] = useState<UnitId>(1);
  const [sub, setSub] = useState<LearnSubTab>("vocab");
  const [vocabView, setVocabView] = useState<VocabView>("set");
  const [grammarView, setGrammarView] = useState<GrammarView>("explain");
  const [textView, setTextView] = useState<TextView>("story");

  // 挑戰區
  const [mode, setMode] = useState<ChallengeMode>("select");
  const [level, setLevel] = useState(1);
  // 指定哪些關卡使用貪吃蛇
  const snakeLevels = useMemo(() => new Set<number>([2, 4, 6]), []);
  const isSnakeLevel = snakeLevels.has(level);

  // 資料與進度
  const unit: UnitConfig = UNITS.find((u) => u.id === unitId)!;
  const { progress, addXP, patchUnit, awardBadge, reset } = useProgress();
  const uProg = progress.byUnit[unitId];

  // 10 關的星數
  const starsByLevel = Array.from(
    { length: 10 },
    (_, i) => uProg.challenge.levels?.[i + 1]?.stars ?? 0
  );
  const unlockedCount = calcUnlockedCount(uProg.challenge.levels, 10);

  // —— 把原本 ChallengeRun 的 onFinish 抽成共用函式 ——
  const handleChallengeFinish = (score: number, timeUsed: number) => {
    const stars = computeLevelStars(score);

    // 每關紀錄
    const prevLv = uProg.challenge.levels?.[level];
    const newLv = {
      bestScore: Math.max(prevLv?.bestScore ?? 0, score),
      bestTimeSec: prevLv?.bestTimeSec
        ? Math.min(prevLv.bestTimeSec, timeUsed)
        : timeUsed,
      stars: Math.max(prevLv?.stars ?? 0, stars),
    };

    // 單元彙總
    const bestScore = Math.max(uProg.challenge.bestScore, score);
    const bestTime =
      uProg.challenge.bestTimeSec === 0
        ? timeUsed
        : Math.min(uProg.challenge.bestTimeSec, timeUsed);

    // 產生更新後的 levels，等下拿來算解鎖數
    const nextLevels = {
      ...(uProg.challenge.levels || {}),
      [level]: newLv,
    } as Record<
      number,
      { bestScore: number; bestTimeSec: number; stars: number }
    >;

    const nextUnlocked = calcUnlockedCount(nextLevels, 10);
    const nextCleared = Math.max(
      uProg.challenge.clearedLevels,
      nextUnlocked - 1
    );

    // 寫回進度
    patchUnit(unitId, {
      challenge: {
        clearedLevels: nextCleared,
        bestTimeSec: bestTime,
        bestScore,
        levels: nextLevels,
      },
    });

    // 徽章 & XP（規則保持一致）
    if (score === 10) awardBadge("PERFECT_10");
    if (timeUsed <= 40) awardBadge("SPEEDSTER");
    addXP(unitId, score * 2);

    alert(
      `挑戰完成！\nUnit ${unitId} - Level ${level}\n得分：${score}/10（${newLv.stars}★）\n用時：${timeUsed}s`
    );

    // 回關卡選單並預選下一個可玩的關卡
    setMode("select");
    setLevel(nextUnlocked);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold tracking-tight">LearningQuest</div>
          <div className="text-sm text-neutral-500">
            可模組化英語學習 · 6 單元 · 遊戲化
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TabButton active={tab === "learn"} onClick={() => setTab("learn")}>
            學習區
          </TabButton>
          <TabButton
            active={tab === "challenge"}
            onClick={() => {
              setTab("challenge");
              setMode("select");
              setLevel(unlockedCount); // 預選目前可玩的最後一關（下一關）
            }}
          >
            挑戰區
          </TabButton>
          <TabButton active={tab === "badges"} onClick={() => setTab("badges")}>
            獎章區
          </TabButton>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-10">
        {/* HUD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Card>
            <div className="text-sm text-neutral-500">目前單元</div>
            <div className="text-lg font-semibold">{unit.title}</div>
            <div className="mt-2 text-sm">
              星等：{"⭐".repeat(uProg.stars)}
              {"☆".repeat(3 - uProg.stars)}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-neutral-500">本單元 XP</div>
            <div className="text-2xl font-bold">{uProg.xp}</div>
            <div className="text-sm text-neutral-500">
              總 XP：{progress.totalXP}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-neutral-500">快捷</div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={reset}
                className="px-3 py-2 rounded-xl border text-sm"
              >
                重置進度
              </button>
              <button
                onClick={() =>
                  alert("請在 data/units.ts 中替換成你的題庫即可擴充 6 單元。")
                }
                className="px-3 py-2 rounded-xl border text-sm"
              >
                如何擴充？
              </button>
            </div>
          </Card>
        </div>

        {/* 單元選擇 */}
        <Card>
          <SectionTitle title="選擇單元 (共 6)" />
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {UNITS.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  setUnitId(u.id);
                  if (tab === "challenge") {
                    setMode("select");
                    const unlockedForThisUnit = calcUnlockedCount(
                      progress.byUnit[u.id].challenge.levels,
                      10
                    );
                    setLevel(unlockedForThisUnit);
                  }
                }}
                className={`p-3 rounded-xl border text-left ${
                  u.id === unitId
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white hover:bg-neutral-50"
                }`}
              >
                <div className="text-xs opacity-80">Unit {u.id}</div>
                <div className="font-semibold truncate">
                  {u.title.replace(/^Unit \d+:\s*/, "")}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* 主區域 */}
        <div className="mt-4 space-y-4">
          {/* 學習區 */}
          {tab === "learn" && (
            <>
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <TabButton
                    active={sub === "vocab"}
                    onClick={() => setSub("vocab")}
                  >
                    1. 單字
                  </TabButton>
                  <TabButton
                    active={sub === "grammar"}
                    onClick={() => setSub("grammar")}
                  >
                    2. 文法
                  </TabButton>
                  <TabButton
                    active={sub === "text"}
                    onClick={() => setSub("text")}
                  >
                    3. 課文
                  </TabButton>
                </div>

                {sub === "vocab" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={vocabView === "set"}
                      onClick={() => setVocabView("set")}
                    >
                      單字集
                    </TabButton>
                    <TabButton
                      active={vocabView === "quiz"}
                      onClick={() => setVocabView("quiz")}
                    >
                      4 選 1 小遊戲
                    </TabButton>
                  </div>
                )}

                {sub === "grammar" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={grammarView === "explain"}
                      onClick={() => setGrammarView("explain")}
                    >
                      文法說明
                    </TabButton>
                    <TabButton
                      active={grammarView === "reorder"}
                      onClick={() => setGrammarView("reorder")}
                    >
                      重組句子
                    </TabButton>
                  </div>
                )}

                {sub === "text" && (
                  <div className="flex items-center gap-2">
                    <TabButton
                      active={textView === "story"}
                      onClick={() => setTextView("story")}
                    >
                      課文故事
                    </TabButton>
                    <TabButton
                      active={textView === "arrange"}
                      onClick={() => setTextView("arrange")}
                    >
                      句型排列
                    </TabButton>
                  </div>
                )}
              </Card>

              {/* 內容：單字 */}
              {sub === "vocab" &&
                (vocabView === "set" ? (
                  <VocabSet
                    title={`${unit.title} 單字集`}
                    words={unit.words}
                    onStudied={() => {
                      addXP(unitId, 5);
                      patchUnit(unitId, {
                        vocab: {
                          ...uProg.vocab,
                          studied: uProg.vocab.studied + 1,
                        },
                      });
                    }}
                  />
                ) : (
                  <VocabQuiz
                    questions={makeVocabMCQ(unit, 8)}
                    onFinished={(score) => {
                      addXP(unitId, score);
                      patchUnit(unitId, {
                        vocab: {
                          ...uProg.vocab,
                          quizBest: Math.max(uProg.vocab.quizBest, score),
                        },
                      });
                    }}
                  />
                ))}

              {/* 內容：文法 */}
              {sub === "grammar" &&
                (grammarView === "explain" ? (
                  <GrammarExplain
                    points={unit.grammar}
                    onStudied={() => {
                      addXP(unitId, 5);
                      patchUnit(unitId, {
                        grammar: {
                          ...uProg.grammar,
                          studied: uProg.grammar.studied + 1,
                        },
                      });
                    }}
                  />
                ) : (
                  <ReorderSentenceGame
                    target={unit.grammar[0]?.examples[0] ?? "I am a student."}
                    onFinished={(ok) => {
                      addXP(unitId, ok ? 5 : 2);
                      patchUnit(unitId, {
                        grammar: {
                          ...uProg.grammar,
                          reorderBest: Math.max(
                            uProg.grammar.reorderBest,
                            ok ? 1 : 0
                          ),
                        },
                      });
                    }}
                  />
                ))}

              {/* 內容：課文 */}
              {sub === "text" &&
                (textView === "story" ? (
                  <StoryViewer
                    story={unit.story}
                    onRead={() => {
                      addXP(unitId, 5);
                      patchUnit(unitId, {
                        text: { ...uProg.text, read: uProg.text.read + 1 },
                      });
                    }}
                  />
                ) : (
                  <ArrangeSentencesGame
                    sentences={unit.story.sentencesForArrange}
                    onFinished={(correct) => {
                      addXP(unitId, correct);
                      patchUnit(unitId, {
                        text: {
                          ...uProg.text,
                          arrangeBest: Math.max(
                            uProg.text.arrangeBest,
                            correct
                          ),
                        },
                      });
                    }}
                  />
                ))}
            </>
          )}

          {/* 挑戰區 */}
          {tab === "challenge" &&
            (mode === "select" ? (
              <LevelGrid
                total={10}
                unlockedCount={unlockedCount} // ✅ 兩星解鎖
                starsByLevel={starsByLevel}
                onPick={(lv) => {
                  setLevel(lv);
                  setMode("play");
                }}
              />
            ) : // ✅isSnakeLevel選擇關卡 使用貪吃蛇；其餘關卡維持原本題目挑戰
            isSnakeLevel ? (
              <SnakeChallenge
                key={`snake-${unitId}-${level}`}
                title={`第 ${level} 關：貪吃蛇`}
                totalTime={60}
                targetScore={10}
                onFinish={handleChallengeFinish}
              />
            ) : (
              <ChallengeRun
                key={`${unitId}-${level}`}
                unit={unit}
                totalTime={60}
                onFinish={handleChallengeFinish}
              />
            ))}

          {/* 獎章區 */}
          {tab === "badges" && <BadgesView progress={progress} />}
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} LearningQuest · 可自由調整的模組化原型
      </footer>
    </div>
  );
}
