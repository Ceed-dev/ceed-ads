// -----------------------------------------------------------------------------
// Programming Learning Scenario (Demo Conversation Script)
// Used for the fake chat simulation in /sdk-test.
//
// The final user message intentionally includes keywords such as
// "AI", "coding", and "course". These keywords match the tags defined
// in the programming-related ad documents, so the backend keyword-based
// ad decider will return a relevant ad at that point.
// -----------------------------------------------------------------------------

import type { ChatMessageUserAi } from "@/../sdk/core/types";

export const programmingScenarioJa: ChatMessageUserAi[] = [
  {
    id: "u1",
    role: "user",
    text: "テック業界に興味があるのですが、どこから始めればいいのか分かりません。何かアドバイスはありますか？",
  },
  {
    id: "a1",
    role: "ai",
    text: "まずは基本的な問題解決力やロジックを理解することが良い入口になります。多くの初心者は、簡単な課題から始めて自信をつけています。",
  },
  {
    id: "u2",
    role: "user",
    text: "最初は概念の理解を重視したほうがいいですか？それとも、すぐに何か作ってみるべきでしょうか？",
  },
  {
    id: "a2",
    role: "ai",
    text: "小さなハンズオンの練習から始めるのがおすすめです。実際に手を動かしながら、自然と考え方を身につけられます。",
  },
  {
    id: "u3",
    role: "user",
    text: "難しくなると、モチベーションが下がってしまうことがあります。何か良い対処法はありますか？",
  },
  {
    id: "a3",
    role: "ai",
    text: "小さくて明確な目標を設定することが大切です。1日に1つ簡単なタスクを終えるだけでも、着実な前進になります。",
  },
  {
    id: "u4",
    role: "user",
    text: "ミスを修正するときに詰まってしまいます。どうすればいいでしょうか？",
  },
  {
    id: "a4",
    role: "ai",
    text: "問題を細かく分解して、一つずつ確認していくと、原因が見えてくることが多いです。",
  },

  // ---------------------------------------------------------------------------
  // Trigger message:
  // This user message includes keywords such as "AI", "coding", and "course".
  // These will match the ad's tags (e.g. ["ai", "coding", "course"]),
  // causing the backend keyword-based ad decider to return a programming ad here.
  // ---------------------------------------------------------------------------
  {
    id: "u5",
    role: "user",
    text: "学習を早く進められる、良いAIコーディングコースを知っていますか？",
  },
  {
    id: "a5",
    role: "ai",
    text: "学習スタイルによっていくつか選択肢があります。少し調べてみますね。",
    // ← This is where the Action Card ad will be injected later.
  },
];
