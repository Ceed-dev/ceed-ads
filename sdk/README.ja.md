[English](https://github.com/Ceed-dev/ceed-ads/blob/main/sdk/README.md) | **日本語**

# Ceed Ads Web SDK

チャット形式のWebアプリケーションにコンテキスト連動型広告を組み込むためのTypeScript SDKです。

> ⚠️ **対応言語**: 現在、広告配信およびクリエイティブにおいて**英語と日本語**に対応しています。今後のリリースで対応言語を追加予定です。

## 目次

- [インストール](#インストール)
- [クイックスタート](#クイックスタート)
- [APIリファレンス](#apiリファレンス)
  - [initialize()](#1-initializeappid-apibaseurl)
  - [requestAd()](#2-requestadoptions)
  - [renderAd()](#3-renderadad-targetelement-requestid)
  - [showAd()](#4-showadoptions)
- [広告フォーマット](#広告フォーマット)
  - [Action Card](#action_card)
  - [Lead Gen](#lead_gen)
  - [Static](#static)
  - [Followup](#followup)
- [フォーマット指定方法](#フォーマット指定方法)
- [イベントトラッキング](#イベントトラッキング)
- [TypeScript型定義](#typescript型定義)
- [エラーハンドリング](#エラーハンドリング)
- [実装例](#実装例)
- [ローカル開発](#ローカル開発)

---

## インストール

```bash
npm install @ceedhq/ads-web-sdk
```

---

## クイックスタート

```typescript
import { initialize, showAd } from "@ceedhq/ads-web-sdk";

// 1. アプリ起動時に一度だけ初期化
initialize("your-app-id");

// 2. ユーザーメッセージ後に広告を表示
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "プログラミングを学びたい",
  targetElement: document.getElementById("ad-slot"),
});
```

---

## APIリファレンス

### 1. `initialize(appId, apiBaseUrl?)`

**他のSDK呼び出しの前に必須です。**

以降のAPIリクエストで使用されるグローバル設定をセットアップします。

```typescript
initialize(appId: string, apiBaseUrl?: string): void
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `appId` | `string` | はい | アプリケーション識別子 |
| `apiBaseUrl` | `string` | いいえ | API URLの上書き（開発用） |

**例：**

```typescript
// 本番環境（デフォルトAPI使用）
initialize("my-app");

// 開発環境（ローカルAPI）
initialize("my-app", "/api");
```

---

### 2. `requestAd(options)`

会話のコンテキストに基づいて広告を取得します。**レンダリングは行いません。**

レンダリングを完全に制御したい場合に使用します。

```typescript
async requestAd(options: {
  conversationId: string;
  messageId: string;
  contextText: string;
  userId?: string;
  formats?: AdFormat[];
}): Promise<{ ad: ResolvedAd | null; requestId: string | null }>
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `conversationId` | `string` | はい | チャットセッションの一意ID |
| `messageId` | `string` | はい | メッセージの一意ID |
| `contextText` | `string` | はい | キーワードマッチングに使用するユーザーメッセージ |
| `userId` | `string` | いいえ | オプションのユーザー識別子 |
| `formats` | `AdFormat[]` | いいえ | 取得したい広告フォーマットの配列 |

**例：**

```typescript
const { ad, requestId } = await requestAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "フライトを予約するにはどうすればいいですか？",
});

if (ad) {
  console.log(`広告フォーマット: ${ad.format}`);
  console.log(`広告主: ${ad.advertiserName}`);
}
```

---

### 3. `renderAd(ad, targetElement, requestId?)`

広告をDOMにレンダリングし、インプレッションとクリックを自動的にトラッキングします。

```typescript
renderAd(
  ad: ResolvedAd,
  targetElement: HTMLElement,
  requestId?: string | null
): RenderedAd
```

| パラメータ | 型 | 必須 | 説明 |
|-----------|------|------|------|
| `ad` | `ResolvedAd` | はい | `requestAd()`から取得した広告オブジェクト |
| `targetElement` | `HTMLElement` | はい | レンダリング先のDOM要素 |
| `requestId` | `string \| null` | いいえ | イベントトラッキング用のリクエストID |

**例：**

```typescript
const container = document.getElementById("ad-slot");
container.innerHTML = ""; // 前の広告をクリア

renderAd(ad, container, requestId);
```

---

### 4. `showAd(options)`

取得 + レンダリング + トラッキングを1回の呼び出しで行う**便利メソッド**です。

広告を統合する最もシンプルな方法です。

```typescript
async showAd(options: {
  conversationId: string;
  messageId: string;
  contextText: string;
  targetElement: HTMLElement;
  userId?: string;
  formats?: AdFormat[];
}): Promise<void>
```

**例：**

```typescript
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: userMessage,
  targetElement: document.getElementById("ad-slot"),
});
```

---

## 広告フォーマット

SDKは4つの広告フォーマットをサポートしており、それぞれ異なるユースケース向けに設計されています。

### `action_card`

**デフォルトフォーマット** — タイトル、説明、CTAボタンを持つカードです。

```
┌─────────────────────────────────┐
│ ● 広告主名                   Ad  │
├─────────────────────────────────┤
│ 広告タイトル                     │
│ 広告の説明文がここに             │
│ 入ります。                       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │     コールトゥアクション      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**ユースケース:** 明確なCTAを持つ標準的なプロモーション広告。

**動作:**
- レンダリング時にインプレッションをトラッキング
- CTAボタンクリック時にクリックをトラッキング
- `ctaUrl`を新しいタブで開く

---

### `lead_gen`

**リードジェネレーションフォーマット** — 成功メッセージ付きのメール収集フォームです。

```
┌─────────────────────────────────┐
│ ● 広告主名                   Ad  │
├─────────────────────────────────┤
│ 無料ガイドをダウンロード         │
│ メールアドレスを入力して         │
│ チュートリアルを受け取る。       │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ メールアドレスを入力...      │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │         登録する             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

送信後:
┌─────────────────────────────────┐
│ ✓ ありがとうございます！        │
└─────────────────────────────────┘
```

**ユースケース:** ニュースレター登録、リード獲得、コンテンツダウンロード。

**動作:**
- レンダリング時にインプレッションをトラッキング
- フォーム送信時にメールアドレスとともにsubmitイベントをトラッキング
- 送信後に成功メッセージを表示
- `autocomplete`属性をサポート

**必須設定:**

```typescript
leadGenConfig: {
  placeholder: string;       // 入力フィールドのプレースホルダー
  submitButtonText: string;  // ボタンラベル
  autocompleteType: "email" | "name" | "tel" | "off";
  successMessage: string;    // 送信後に表示
}
```

---

### `static`

**ディスプレイフォーマット** — ページロード時に即座に表示、通常はテキスト入力フィールドの下に配置。

```
┌─────────────────────────────────┐
│ AIに何でも聞いてください...   [+] │  ← 入力フィールド
└─────────────────────────────────┘
┌─────────────────────────────────┐
│ ● 広告主名                   Ad  │
├─────────────────────────────────┤
│ スペシャルオファー               │
│ 期間限定で選りすぐりの           │
│ 商品を割引中。                   │
│                                 │
│ ┌─────────────────────────────┐ │
│ │        今すぐ購入            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

**ユースケース:** ユーザーの過去の会話履歴と広告行動データに基づいてターゲティングされる、テキスト入力インターフェース周辺に表示される広告。

**動作:**
- ユーザー操作なしにページロード時に即座に表示
- `action_card`と同じカードレンダリング
- バックエンドで異なるターゲティングロジック（ユーザー履歴、キーワード、地域、デバイスタイプ）
- レンダリング時にインプレッションをトラッキング
- CTAクリック時にクリックをトラッキング

**オプション設定:**

```typescript
staticConfig: {
  displayPosition: "top" | "bottom" | "inline" | "sidebar";
  targetingParams?: {
    keywords?: string[];
    geo?: string[];
    deviceTypes?: ("desktop" | "mobile" | "tablet")[];
  }
}
```

---

### `followup`

**スポンサード質問フォーマット** — 会話フローのためのタップ可能な質問カード。

```
┌─────────────────────────────────┐
│ ● 広告主名                   Ad  │
├─────────────────────────────────┤
│ 私たちの語学コースについて       │
│ もっと知りたいですか？           │
│                                 │
│ → タップして詳しく見る           │
└─────────────────────────────────┘
```

**ユースケース:** 広告主がスポンサーする提案型フォローアップ質問。

**動作:**
- カード全体がタップ可能（ボタンだけではない）
- カード枠にホバーエフェクト
- タップ時にクリックイベントをトラッキング
- タップアクションは設定可能:
  - `redirect`: URLを新しいタブで開く
  - `expand`: ホストアプリが展開を処理
  - `submit`: ホストアプリが送信を処理

**必須設定:**

```typescript
followupConfig: {
  questionText: string;      // スポンサード質問
  tapAction: "expand" | "redirect" | "submit";
  tapActionUrl?: string;     // tapActionが"redirect"の場合は必須
}
```

---

## フォーマット指定方法

開発者は `formats` パラメータを使用して、取得したい広告フォーマットを指定できます。

### 特定のフォーマットのみをリクエスト

```typescript
// action_card と lead_gen のみをリクエスト
const { ad, requestId } = await requestAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "英語を学びたい",
  formats: ["action_card", "lead_gen"],
});

// showAd でも同様に指定可能
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "英語を学びたい",
  targetElement: document.getElementById("ad-slot"),
  formats: ["action_card", "lead_gen"],
});
```

### 全フォーマットをリクエスト（デフォルト）

```typescript
// formats を指定しない場合、全フォーマットが対象
const { ad, requestId } = await requestAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "英語を学びたい",
});
```

### 利用可能なフォーマット値

| 値 | 説明 |
|---|------|
| `"action_card"` | 標準CTAカード |
| `"lead_gen"` | メール収集フォーム |
| `"static"` | バナースタイル広告 |
| `"followup"` | スポンサード質問 |

---

## イベントトラッキング

SDKは以下のイベントを自動的にトラッキングします：

| イベント | トリガー | 説明 |
|---------|---------|------|
| `impression` | レンダリング時 | 広告がユーザーに表示された |
| `click` | CTAクリック時 | ユーザーがCTAボタンをクリックした |
| `submit` | フォーム送信時 | ユーザーがlead_genフォームを送信した |

**自動重複排除:** インプレッションは広告+requestIdのペアごとに重複排除され、重複トラッキングを防ぎます（例：React StrictModeの二重レンダリング）。

### 手動トラッキング（上級者向け）

手動で制御が必要な場合、個別のレンダラーをインポートできます：

```typescript
import {
  renderActionCard,
  renderLeadGenCard,
  renderStaticCard,
  renderFollowupCard,
} from "@ceedhq/ads-web-sdk";
```

---

## TypeScript型定義

### コア型

```typescript
import type {
  ResolvedAd,
  AdFormat,
  ResolvedLeadGenConfig,
  ResolvedFollowupConfig,
  StaticConfig,
} from "@ceedhq/ads-web-sdk";
```

### ResolvedAd

`requestAd()`から返されるメインの広告ペイロード：

```typescript
interface ResolvedAd {
  id: string;
  advertiserId: string;
  advertiserName: string;
  format: AdFormat;  // "action_card" | "lead_gen" | "static" | "followup"
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
  leadGenConfig?: ResolvedLeadGenConfig;
  staticConfig?: StaticConfig;
  followupConfig?: ResolvedFollowupConfig;
}
```

### フォーマット固有の設定

```typescript
// Lead Gen
interface ResolvedLeadGenConfig {
  placeholder: string;
  submitButtonText: string;
  autocompleteType: "email" | "name" | "tel" | "off";
  successMessage: string;
}

// Static
interface StaticConfig {
  displayPosition: "top" | "bottom" | "inline" | "sidebar";
  targetingParams?: {
    keywords?: string[];
    geo?: string[];
    deviceTypes?: ("desktop" | "mobile" | "tablet")[];
  };
}

// Followup
interface ResolvedFollowupConfig {
  questionText: string;
  tapAction: "expand" | "redirect" | "submit";
  tapActionUrl?: string;
}
```

---

## エラーハンドリング

### 初期化エラー

```typescript
try {
  initialize(""); // 空のappId
} catch (error) {
  // "CeedAds.initialize: appId is required"
}
```

### 広告がない場合

```typescript
const { ad, requestId } = await requestAd({...});

if (!ad) {
  // このコンテキストにマッチする広告がない
  // これは正常です — 広告は常に利用可能とは限りません
  return;
}
```

### フォーマット設定が不足している場合

```typescript
// ad.formatが"lead_gen"だがleadGenConfigがない場合:
renderAd(ad, container, requestId);
// エラー: "leadGenConfig is required for lead_gen format"
```

---

## 実装例

### React統合

```tsx
import { useRef, useEffect, useState } from "react";
import { initialize, requestAd, renderAd } from "@ceedhq/ads-web-sdk";
import type { ResolvedAd } from "@ceedhq/ads-web-sdk";

// 一度だけ初期化
initialize("your-app-id");

function ChatMessage({ message }: { message: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const [ad, setAd] = useState<ResolvedAd | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAd() {
      const result = await requestAd({
        conversationId: "chat-123",
        messageId: crypto.randomUUID(),
        contextText: message,
      });
      setAd(result.ad);
      setRequestId(result.requestId);
    }
    fetchAd();
  }, [message]);

  useEffect(() => {
    if (ad && adRef.current) {
      adRef.current.innerHTML = "";
      renderAd(ad, adRef.current, requestId);
    }
  }, [ad, requestId]);

  return (
    <div>
      <p>{message}</p>
      <div ref={adRef} />
    </div>
  );
}
```

### バニラJavaScript

```html
<div id="ad-container"></div>

<script type="module">
  import { initialize, showAd } from "@ceedhq/ads-web-sdk";

  initialize("demo-app");

  document.getElementById("send-btn").addEventListener("click", async () => {
    const message = document.getElementById("input").value;

    await showAd({
      conversationId: "demo-session",
      messageId: Date.now().toString(),
      contextText: message,
      targetElement: document.getElementById("ad-container"),
    });
  });
</script>
```

---

## ローカル開発

SDKをローカルAPIサーバーに向ける：

```typescript
// 開発モード
initialize("test-app", "http://localhost:3000/api");

// または相対パス（同一オリジン）
initialize("test-app", "/api");
```

### デモページ

SDKの動作を確認：

- [デモ動画](https://drive.google.com/file/d/1EBDielkMjenRoehv24jBn9sRLou0MCs-/view?usp=sharing)
- [デモソースコード](https://github.com/Ceed-dev/ceed-ads/blob/main/src/app/sdk-test/page.tsx)

---

## スタイリング

すべての広告カードはダークテーマを使用し、以下のCSSクラスを持ちます：

| クラス | 説明 |
|-------|------|
| `.ceed-ads-card` | ベースカードコンテナ |
| `.ceed-ads-action-card` | Action Cardフォーマット |
| `.ceed-ads-lead-gen` | Lead Genフォーマット |
| `.ceed-ads-static` | Staticフォーマット |
| `.ceed-ads-followup` | Followupフォーマット |

カードの最大幅は460pxで、一貫性のためにインラインスタイルを使用しています。

---

## ライセンス

MIT © Ceed
