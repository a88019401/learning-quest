# LearningQuest
可模組化的英語學習網站（React + TypeScript + Vite + Tailwind v4）

- 三大區域：**學習區**（單字 / 文法 / 課文）、**挑戰區**（限時 4 選 1 題庫）、**獎章區**
- 遊戲化：XP、星等、限時挑戰、徽章解鎖
- 完全**資料驅動**：僅需編輯 `src/data/units.ts` 就能替換 6 個單元的內容
- 進度**本機儲存**（`localStorage`），可一鍵重置

---

## 目錄
- [功能特色](#功能特色)
- [技術棧](#技術棧)
- [檔案結構](#檔案結構)
- [快速開始](#快速開始)
- [Tailwind v4 設定](#tailwind-v4-設定)
- [如何客製內容](#如何客製內容)
- [進度與徽章規則](#進度與徽章規則)
- [常見問題（Troubleshooting）](#常見問題troubleshooting)
- [部署](#部署)

---

## 功能特色
### 1) 學習區（6 個單元）
- **單字**：單字集（點擊翻面）、4 選 1 小測
- **文法**：重點說明、重組句子小遊戲
- **課文**：故事閱讀、句型排列遊戲

### 2) 挑戰區
- 與單元對應的題庫（10 題）  
- **60 秒**限時、即時計分、得分加成 XP

### 3) 獎章區
- 依據學習/挑戰紀錄自動解鎖：`FIRST_STEPS`、`VOCAB_NOVICE`、`GRAMMAR_APPRENTICE`、`STORY_EXPLORER`、`SPEEDSTER`、`PERFECT_10`、`UNIT_MASTER`

---

## 技術棧
- **Vite**（開發/建置）
- **React + TypeScript**
- **Tailwind CSS v4**
- 本機儲存：`localStorage`

---

## 檔案結構
learning-quest/
├─ public/
├─ src/
│ ├─ components/
│ │ ├─ ArrangeSentencesGame.tsx
│ │ ├─ BadgesView.tsx
│ │ ├─ ChallengeRun.tsx
│ │ ├─ GrammarExplain.tsx
│ │ ├─ ReorderSentenceGame.tsx
│ │ ├─ StoryViewer.tsx
│ │ ├─ VocabQuiz.tsx
│ │ ├─ VocabSet.tsx
│ │ └─ ui.tsx
│ ├─ data/
│ │ └─ units.ts # ✅ 只改這裡就能換教材內容
│ ├─ lib/
│ │ └─ questionGen.ts # 題庫生成（單字/文法/課文/挑戰）
│ ├─ state/
│ │ └─ progress.ts # 進度與徽章邏輯（useProgress hook）
│ ├─ types.ts # 型別定義
│ ├─ App.tsx
│ ├─ main.tsx
│ └─ index.css # Tailwind 及自訂樣式（遊戲化 UI）
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.js
└─ README.md


---

## 快速開始
> 需要 **Node.js 20.19+ 或 22.12+**  
> 建議用 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) 管理版本

```bash
# 安裝依賴
npm install

# 開發
npm run dev
# 打開瀏覽器：http://localhost:5173/

# 建置
npm run build

# 本地預覽打包結果
npm run preview


Tailwind v4 設定

Tailwind 4 把 PostCSS 外掛移到 @tailwindcss/postcss，本專案已使用 v4 寫法：

postcss.config.js

export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

tailwind.config.js

@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;600;700&display=swap');
@import "tailwindcss";

/* 遊戲化元件（卡片/按鈕/答案狀態/倒數徽章/動畫） */
:root{ --brand-1:#8b5cf6; --brand-2:#f472b6; }
/* ...完整樣式已在專案內 index.css 提供，可直接調色與延伸 */

如何客製內容

教材內容集中在 src/data/units.ts：

import type { UnitConfig, UnitId } from "../types";

const mkUnit = (id: UnitId, title: string): UnitConfig => ({
  id,
  title,
  words: [
    { term: "hello", def: "你好", example: "Hello, my name is Tom." },
    // ...
  ],
  grammar: [
    { point: "be 動詞 (am/is/are)", desc: "主詞 + be + 補語。", examples: ["I am a student.", ...] },
  ],
  story: {
    title: `${title} — A New Friend`,
    paragraphs: ["Tom is new at school...", "..."],
    sentencesForArrange: ["Tom is new at school.", "..."],
  },
});

export const UNITS: UnitConfig[] = [
  mkUnit(1, "Unit 1: Greetings"),
  // 2~6 ...
];

---

單字小測、文法題、課文題會由 lib/questionGen.ts 自動組合

想調整挑戰題題數/限時，改 components/ChallengeRun.tsx

進度與徽章規則

儲存在 localStorage（key：learningquest-progress-v1）

Hook：useProgress() 暴露 progress / addXP / patchUnit / awardBadge / reset

星等由最佳表現粗略推算（可在 computeStars() 客製）

徽章在 state/progress.ts 的 evaluateBadges() 控制

常見問題（Troubleshooting）

Vite 要求 Node 版本

錯誤：Vite requires Node.js version 20.19+ or 22.12+

解法：升級 Node（建議 nvm install 22.12.0 && nvm use 22.12.0）

Tailwind v4 + PostCSS

錯誤：It looks like you're trying to use tailwindcss directly as a PostCSS plugin

解法：安裝 @tailwindcss/postcss 並使用上面提供的 postcss.config.js

CSS 匯入順序

錯誤：@import must precede all other statements

解法：把 @import 放到 index.css 最上方

找不到工具類

錯誤：unknown utility class 'text-neutral-900'

解法：確認 index.css 有 @import "tailwindcss"，且 tailwind.config.js 的 content 指到 ./src/**/*

Windows 刪除 node_modules

PowerShell 指令：Remove-Item -Recurse -Force node_modules

匯入錯誤

錯誤：does not provide an export named ...

解法：確認檔名/路徑大小寫、匯出名稱（export default vs export const）

部署
Vercel

新增專案 → 連接 GitHub Repo

Framework 選 Vite

Build Command：npm run build

Output Dir：dist

Netlify

New site from Git → 選 Repo

Build Command：npm run build

Publish directory：dist