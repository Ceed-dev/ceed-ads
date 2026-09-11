# 廃止記録 (2026-09-11)

Ceed Ads は **2026-09-11 に完全終了**した。駿冴の判断 (「完全に終わったプロダクト」) による。

**GCP 上のリソースとデータは全て削除済み。本リポジトリ群のコードと本ファイルが唯一の記録である。**

2026-09-10 開始の GCP 全体棚卸し (アカウント `pochi@0xqube.xyz`) の一環。同じ棚卸しの他の記録は [`Ceed-dev/data-collection`](https://github.com/Ceed-dev/data-collection/blob/main/docs/decommission-log.md) と [`Ceed-dev/InvoiceFlow`](https://github.com/Ceed-dev/InvoiceFlow/blob/main/DECOMMISSION.md) にある。

## 1. 構成

AI チャットの会話文脈に合わせて広告を配信するプラットフォーム。4 リポジトリで構成されていた。

| リポジトリ | 役割 | 最終 push |
|---|---|---|
| [`ceed-ads`](https://github.com/Ceed-dev/ceed-ads) (本リポジトリ) | バックエンド API (Next.js) + Web SDK `@ceedhq/ads-web-sdk` | 2026-04-02 |
| [`ceed-ads-ios-sdk`](https://github.com/Ceed-dev/ceed-ads-ios-sdk) | iOS ネイティブアプリ向け SDK | 2026-01-31 |
| [`ceed-publisher-console`](https://github.com/Ceed-dev/ceed-publisher-console) | 媒体社向けダッシュボード | 2026-02-07 |
| [`ads-dashboard`](https://github.com/Ceed-dev/ads-dashboard) | 社内用の広告・広告主管理ダッシュボード | 2026-02-03 |
| [`CeedAdsIOSSample`](https://github.com/Ceed-dev/CeedAdsIOSSample) | iOS SDK のサンプルアプリ | 2026-02-03 |

### GCP プロジェクト `ceed-ads` (project number `741640952617`)

Firebase ベース。**VM / Cloud Run / Cloud SQL は一切無し**。

| 要素 | 内容 |
|---|---|
| Firestore | Native モード、`asia-northeast1` |
| Firebase Hosting | `https://ceed-ads.web.app` (DEFAULT_SITE 1 件) |
| Cloud Functions | `ext-firestore-send-email-processqueue` (Firebase Extension「Trigger Email」、2026-02-02 更新) |
| GCS バケット | `gcf-v2-sources-741640952617-{asia-northeast1,us-central1}` (Functions のソース置き場のみ) |
| Artifact Registry | `gcf-artifacts` × 2、いずれも 0 バイト |
| BigQuery | データセット無し |
| サービスアカウント | `translation-api@` / `ext-firestore-send-email@` / `firebase-adminsdk-fbsvc@` / デフォルト compute |
| API キー | `Browser key (auto created by Firebase)` 1 本。**リファラ制限なし** |
| 登録アプリ | Web アプリ `AI Ads` 1 件のみ。iOS / Android アプリの登録は **0 件** (iOS SDK は別リポジトリに存在するが Firebase には未登録) |
| Hosting のカスタムドメイン | 無し。`ceed-ads.web.app` 自体も削除前時点で **HTTP 404** = 何もデプロイされていなかった |

### 残骸の網羅確認 (2026-09-11 実施)

削除前に、Ceed Ads 関連の資産が他に無いことを確認した。

- 全 GCP プロジェクトを `ads` / `ceed` で検索 → 該当は `ceed-ads` のみ (他の `ceed-*` プロジェクトは別用途)
- Apps Script プロジェクト 6 件を全件確認 → Ceed Ads 関連は無し
- Hosting のカスタムドメイン無し、外部 DNS への影響も無し

**したがって GCP プロジェクトの削除だけで、クラウド側の資産は全て消える。**

### Firestore のデータ構造 (削除時点)

| コレクション | 件数 | 想定される役割 |
|---|---|---|
| `ads` | 5 | 広告クリエイティブ |
| `advertisers` | 1 | 広告主 |
| `apps` | 2 | 広告を掲載するアプリ |
| `organizations` | 2 | 組織 |
| `organizationMembers` | 5 | 組織メンバー |
| `adminUsers` | 2 | 管理者 |
| `requests` | 16 | 申請 / リクエスト |
| `events` | 18 | イベント (表示・クリック等) |
| `auditLogs` | 17 | 監査ログ |
| `mail` | 1 | Trigger Email 拡張の送信キュー |
| **合計** | **69** | |

**全体で 69 ドキュメント。試作・検証段階のまま本番運用には至らなかった**ことを示す規模。

## 2. 終了時点の稼働状況 (実測)

| 観点 | 実測値 |
|---|---|
| Firestore 読み取り (直近 30 日) | **0 件** |
| Firestore 書き込み (直近 30 日) | **0 件** |
| コードの最終更新 | 4 リポジトリとも **2026-01〜04** で停止 |
| 課金 | サーバーレス構成かつ無トラフィックのため、Firestore の保存容量分のみ (無料枠内と推定) |

## 3. 実施した作業

| 日時 (JST) | 操作 | 結果 |
|---|---|---|
| 2026-09-11 | 全コレクションの全ドキュメントを REST API で書き出し | 69 件 (80,308 B) をローカルへ退避 |
| 2026-09-11 | 本記録を作成し GitHub へ集約 | 本ファイル |
| 2026-09-11 | **GCP プロジェクト `ceed-ads` を削除** | Firestore / Hosting / Functions / GCS / サービスアカウントを含む全リソースが対象 |
| 2026-09-11 | ローカルに退避したデータを削除 | **「コードと作業ログは GitHub のみに残す」という駿冴の方針**に従い、控えも残さない |

**データは意図的に完全消去した。復元はできない。** 広告主 1 社・広告 5 件・イベント 18 件規模の検証データであり、保存する業務上の必要が無いと判断された。

## 4. 再開する場合

コードは全てリポジトリに残っているため、再構築は可能。

1. 新規 Firebase プロジェクトを作成 (Firestore Native / `asia-northeast1`)
2. 本リポジトリの `src` (Next.js バックエンド API) と `sdk` (Web SDK) をデプロイ
3. Firestore のコレクションを上表の構造で再作成
4. Firebase Extension「Trigger Email」を導入 (メール通知を使う場合)
5. 管理画面は `ads-dashboard` / `ceed-publisher-console` を、iOS 組込は `ceed-ads-ios-sdk` を参照

**注意**: 旧環境の Firestore セキュリティルール・インデックス定義・Firebase Extension の設定値はプロジェクト削除とともに失われている。リポジトリに定義ファイルが含まれていない場合は作り直しになる。
