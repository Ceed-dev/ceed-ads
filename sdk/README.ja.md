[English](./README.md) | **日本語**

# Ceed Ads Web SDK

> ⚠️ 対応言語（現在）
>
> Ceed Ads Web SDK は現在、広告配信およびクリエイティブにおいて**英語と日本語**に対応しています。
> 今後のリリースで対応言語を追加予定です。

<a href="https://github.com/Ceed-dev/ceed-ads" target="_blank">
  📦 GitHub リポジトリ
</a>

チャット形式のアプリケーションに**コンテキスト連動型のチャット内アクションカード広告**を簡単に組み込める、軽量な JavaScript/TypeScript SDK です。

この SDK は以下の機能を提供します：

- アプリの初期化（`initialize`）
- ユーザーメッセージのコンテキストに基づく広告リクエスト（`requestAd`）
- 広告の DOM へのレンダリング（`renderAd`）
- 広告の取得・レンダリング・トラッキングを自動で行う便利メソッド（`showAd`）

## 🎥 デモ動画 — アクションカードの動作例

チャット UI 内でアクションカードがどのように表示されるかをご覧ください：

<a href="https://drive.google.com/file/d/1EBDielkMjenRoehv24jBn9sRLou0MCs-/view?usp=sharing" target="_blank">
  👉 デモ動画を見る
</a>

### 🧩 デモのソースコード

<a href="https://github.com/Ceed-dev/ceed-ads/blob/main/src/app/sdk-test/page.tsx" target="_blank">
  👉 デモ用チャットページのソースコードを見る
</a>

## 📦 インストール

```bash
npm install @ceedhq/ads-web-sdk
```

## 🚀 クイックスタート

以下は、Ceed Ads をアプリケーションに組み込むための**最小限のセットアップ**です。

### **1. SDK をインポート**

```ts
import { initialize, requestAd, renderAd, showAd } from "@ceedhq/ads-web-sdk";
```

### **2. SDK を初期化（ページ読み込み時に一度だけ呼び出し）**

```ts
initialize("your-app-id");
```

オプション：

- `appId`（**必須**）– アプリケーションを一意に識別する ID。
- `apiBaseUrl`（任意）– ローカルテスト用にバックエンド URL を上書き。

例：

```ts
initialize("demo-app"); // デフォルトの本番 API を使用
initialize("demo-app", "/api"); // ローカル API を使用（開発時のみ）
```

## 📘 パブリック API

SDK は**4つのコア関数**を提供します。

### 1. `initialize(appId, apiBaseUrl?)`

以降の SDK 呼び出しで使用されるグローバル設定をセットアップします。

#### 例：

```ts
initialize("my-app-id");
```

この呼び出し後：

- すべての広告リクエストに自動的に appId が含まれます。
- インプレッション・クリックイベント用のトラッカーが初期化されます。

### 2. `requestAd(options)`

ユーザーメッセージのコンテキストに基づいて広告を取得します。
**レンダリングは行いません。**

#### パラメータ：

```ts
{
  conversationId: string;   // チャットルーム/スレッドごとの一意な ID
  messageId: string;        // メッセージごとの一意な ID
  contextText: string;      // キーワードマッチングに使用するユーザーメッセージテキスト
  userId?: string;          // 任意のユーザー識別子
}
```

#### 例：

```ts
const { ad, requestId } = await requestAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: "I want to learn English",
});
```

戻り値：

```ts
{
  ad: ResolvedAd | null,
  requestId: string | null
}
```

### 3. `renderAd(ad, targetElement, requestId?)`

広告を DOM 要素にレンダリングし、インプレッション/クリックのトラッキングを設定します。

#### 例：

```ts
const container = document.getElementById("ad-slot");

renderAd(ad, container, requestId);
```

### 4. `showAd(options)` — 便利メソッド

**SDK を使う最もシンプルな方法です。**

この関数は以下を行います：

1. 広告を取得
2. ターゲット要素にレンダリング
3. インプレッション・クリックイベントをトラッキング

#### 例：

```ts
await showAd({
  conversationId: "chat-123",
  messageId: crypto.randomUUID(),
  contextText: userMessage,
  targetElement: document.getElementById("ad-slot"),
});
```

## 🧠 広告コンテキストの仕組み

バックエンドは以下に基づいて広告の適切性を判断します：

- **キーワードマッチング**（`contextText`）
- **会話レベルのクールダウン**（広告の連続表示を防止）
- **シナリオ固有のターゲティングロジック**

アプリケーション側でこれらのルールを管理する必要はありません —
ユーザーメッセージごとに `requestAd(...)` を呼び出すだけです。

## 💬 完全な統合例（チャットアプリ）

```ts
import { initialize, requestAd, renderAd } from "@ceedhq/ads-web-sdk";

initialize("test-app"); // 一度だけ実行

async function handleUserMessage(text: string) {
  const { ad, requestId } = await requestAd({
    conversationId: "demo-conv",
    messageId: crypto.randomUUID(),
    contextText: text,
  });

  if (!ad) return;

  const slot = document.getElementById("ad-container");
  slot.innerHTML = "";

  renderAd(ad, slot, requestId);
}
```

## 🧩 例：React でインライン広告をレンダリング

```tsx
function InlineAdCard({ ad, requestId }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = "";
    renderAd(ad, ref.current, requestId);
  }, [ad, requestId]);

  return <div ref={ref} />;
}
```

## 📡 バックエンドの動作概要

`requestAd()` を呼び出すと：

- バックエンドがメッセージコンテキストを評価します。
- 広告が適切な場合：
  - `{ ad, requestId }` を返します
- 適切でない場合：
  - `{ ad: null }` を返します

`renderAd()` を呼び出すと：

- UI アクションカードが自動生成されます。
- インプレッショントラッキングがトリガーされます。
- CTA 要素にクリックトラッキングが設定されます。

## 🔧 ローカル開発のヒント

SDK を本番ではなく**ローカル** API に向けるには：

```ts
initialize("test-app", "/api");
```

## 📄 TypeScript サポート

```ts
import type { ResolvedAd } from "@ceedhq/ads-web-sdk";
```

## 🪪 ライセンス

MIT © Ceed
