<p align="center">
  <img src="https://raw.githubusercontent.com/MattAtAIEra/TS-Util/main/docs/banner.svg" alt="TS-Util — Agent Discipline for Humans and AI" width="100%" />
</p>

<p align="center">
  <strong>1つのパイプライン。同じガードレール。チームでもAIエージェントでも。</strong>
</p>

<p align="center">
  <a href="https://github.com/MattAtAIEra/TS-Util#readme">English</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_zh.md">繁體中文</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_ko.md">한국어</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_es.md">Español</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_de.md">Deutsch</a>
</p>

---

## 1. なぜ Agent Discipline が必要なのか？

コード品質の問題ではありません。**一貫性の問題**です。

10人のエンジニアが10種類の AJAX 呼び出しを書きます。10のAIエージェントが10種類の fetch パターンを生成します。フォームバリデーションをする人もいれば、しない人もいます。ローディングオーバーレイを表示する人もいれば、忘れる人もいます。エラーを適切に処理する人もいれば、黙って握りつぶす人もいます。

コードレビューは一部を捕捉します。**アーキテクチャはすべてを捕捉します。**

| 本当の問題 | 実際に起こること |
|---|---|
| 「開発者ごとに AJAX の書き方が違う。」 | バリデーションが省略される。ローディングスピナーが不統一。エラー処理は運任せ。 |
| 「AIエージェントが冗長で繰り返しの多いコードを生成する。」 | 各エージェントが `fetch` + バリデーション + エラー処理 + ローディングをゼロから展開し、ボイラープレートにコンテキストトークンを消費する。 |
| 「新メンバーが慣習を壊す。」 | 慣習があることすら知らなかった——それは口伝の部族知識であり、強制されたインフラではなかった。 |
| 「エージェントが何かを忘れたかどうか判断できない。」 | 生成されたすべての関数を監査する必要がある。大規模では不可能。 |

**解決策はコードレビューを増やすことではありません。間違ったコードを書くこと自体を不可能にすることです。**

---

## 2. 仕組み

TS-Util は AJAX、VIEW、バリデーション、フォーマット、メッセージングを**1つの強制パイプライン**にまとめます。誰であれ——人間でもAIでも——`AJAX.request()` を呼び出すと、以下が自動的に実行されます：

```
   AJAX.request({ url, form })
          │
          ▼
   ┌─ 1. フォームバリデーション ── スキップ不可
   ├─ 2. ajax:before 発火 ────── ローディングオーバーレイ
   ├─ 3. シリアライズ + POST ─── 一貫したフォーマット
   ├─ 4. ajax:after 発火 ─────── オーバーレイ非表示
   └─ 5. エラーブロードキャスト ─ 集中処理
```

```typescript
// エンジニアやAIエージェントが書く必要があるのはこれだけ：
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('保存しました！', { autoclose: 3000 }),
});

// その他すべて——バリデーション、ローディング状態、エラーイベント、
// データシリアライズ——はパイプラインが処理します。
```

同じ原則が `VIEW.load()` にも適用されます——動的に読み込まれたすべての HTML フラグメントは、制約バインディング、入力フォーマット、カスタムフック実行を自動的に通過します。手動の初期化は不要です。新しいコンテンツにバリデーションを設定し「忘れる」こともありません。

```typescript
// HTMLフラグメントを読み込み——バリデーション + フォーマットが自動初期化
await VIEW.load(container, { url: '/api/partial-view' });
```

---

## 3. 利点

### エンジニアリングチーム向け

| 以前 | 以後 |
|--------|-------|
| 10人のエンジニア、10のAJAXパターン | 1つのAPI：`AJAX.request()` |
| 新入社員が10の散在するパターンを読む | 新入社員が1つの例を読み、初日から出荷 |
| 「ローディングオーバーレイを追加した？」 | ローディングオーバーレイは自動——忘れることは不可能 |
| 「フォームバリデーションをした？」 | バリデーションは自動——スキップ不可能 |
| コードレビューでスタイルを議論 | アーキテクチャがスタイルを強制 |

- **分岐の排除**：エンジニアは1つのAPIを学ぶだけで済み、実装の詳細を議論する必要がありません。
- **一貫性の強制**：すべてのリクエストが同じパイプラインを通り、ローディングオーバーレイの漏れやバリデーションの省略を防ぎます。
- **オンボーディングコストの削減**：新メンバーは `AJAX.request()` の例を1つ読めば始められます。散在する10のパターンを解読する必要はありません。

### AIエージェント向け

| 以前 | 以後 |
|--------|-------|
| エージェントが fetch + バリデーション + エラー処理で15行を展開 | エージェントが1行を出力：`AJAX.request({ url, form })` |
| コンテキストウィンドウがボイラープレートに消費される | トークンがビジネスロジックに保持される |
| 異なるエージェントが異なるパターンを生成 | すべてのエージェントが同一のパイプライン呼び出しを生成 |
| すべてのエージェント出力を手順漏れがないか監査 | パイプラインが完全性を保証——**設計によるガードレール** |
| エージェントがローディングオーバーレイを「忘れる」 | 不可能——アーキテクチャが強制 |

複数のAIエージェントが共同でコードを生成する場合、この抽象化レイヤーはさらに重要になります：

- **トークン効率**：エージェントは `AJAX.request({ url, form })` の1行を出力するだけで済みます。毎回 `fetch` + バリデーション + エラー処理 + ローディングの完全なロジックを展開する必要はありません。コンテキストウィンドウはAIの最も貴重なリソースであり、トークンの節約は品質の維持を意味します。
- **予測可能な動作**：異なるエージェントが生成したコードが同じパイプラインを通るため、結果の一貫性が保証されます。各エージェントがローディングオーバーレイを正しく実装したかどうかを個別に監査する必要はありません。
- **ガードレール効果**：抽象化レイヤー自体がガードレールとして機能します。エージェントがフォームバリデーションを「忘れる」ことはできません。`AJAX.request()` が自動的に実行するからです。規律は記憶ではなくアーキテクチャによって強制されます。

### 核心的な洞察

> **規律とは「正しいことを覚えておく」ことではありません。規律とは、正しいことだけが起こりうるようにすることです。**
>
> それがTS-Utilの役割です——今日のチームのために、そして明日のコードの大部分を書くAIエージェントのために。

---

## クイックスタート

### インストール

```bash
npm install ts-util-core
```

### 必要なモジュールをインポート

```typescript
import { AJAX, VIEW, MSG, Validation, Formatter, Events } from 'ts-util-core';
```

### またはグローバル名前空間を使用（レガシー `<script>` タグ）

```html
<script type="module" src="dist/index.js"></script>
<script>
  const { AJAX, MSG } = window['#'];
</script>
```

### 実際の例

```typescript
import { AJAX, MSG, Events } from 'ts-util-core';

// ライフサイクルイベントを監視
Events.on('ajax:before', ({ url }) => showSpinner(url));
Events.on('ajax:after',  ({ url }) => hideSpinner(url));

// 自動バリデーション付きでフォームを送信
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('注文を保存しました！', { autoclose: 3000 }),
});
```

この1つの `AJAX.request()` 呼び出しで：
1. フォーム内のすべての `constraint="required"` フィールドをバリデーション
2. `ajax:before` を発火（スピナーが表示）
3. フォームをJSONにシリアライズしてPOST
4. `ajax:after` を発火（スピナーが非表示）
5. `success` コールバックを呼び出し

---

## ライブデモ

> **[`demo.html` を開く](../demo.html)** — すべてのモジュールにライブ出力コンソールがある対話型シングルページガイド。
>
> ```bash
> npx serve .        # その後 http://localhost:3000/demo.html を開く
> ```

デモでは Events、AJAX、Validation、Formatting、MSG ダイアログ、VIEW インジェクション、ユーティリティ関数をクリックして体験できます——コードスニペットとリアルタイムの結果が並んで表示されます。

---

## アーキテクチャ

```
                        ┌─────────────────┐
                        │  EventEmitter   │  ← 型付き中央バス
                        │  (Mediator)     │
                        └──┬──┬──┬──┬─────┘
                  ┌────────┘  │  │  └────────┐
                  ▼           ▼  ▼           ▼
             ┌────────┐  ┌──────┐  ┌───────────┐  ┌───────────┐
             │  AJAX  │  │ VIEW │  │ Validation │  │ Formatter │
             │Facade +│  │Observ│  │ Strategy + │  │ Registry  │
             │Template│  │  er  │  │ Decorator  │  │  Pattern  │
             └────────┘  └──────┘  └───────────┘  └───────────┘
                  │           │          │               │
                  └─────┬─────┘     ┌────┘               │
                        ▼           ▼                    ▼
                    ┌───────┐  ┌──────────┐     ┌──────────────┐
                    │  MSG  │  │  Utils   │     │ HTML attrs   │
                    │Dialogs│  │sprintf,  │     │ constraint=  │
                    └───────┘  │formToJSON│     │ format=      │
                               └──────────┘     └──────────────┘
```

すべてのモジュールは型付き `EventEmitter` を通じて通信し、モジュール同士が直接インポートすることはありません。これにより各部品が独立してテスト・交換可能になります。

---

## モジュール

### Events — 中央バス

```typescript
// 完全な型安全でサブスクライブ——イベント名とペイロードがチェックされる
Events.on('ajax:before', ({ url }) => console.log(url));     // url: string
Events.on('ajax:error',  ({ url, error }) => log(error));    // error: Error

// サブスクライブ解除
const off = Events.on('ajax:after', handler);
off(); // 完了
```

**利用可能なイベント：**

| イベント | ペイロード | 発火タイミング |
|-------|---------|------------|
| `ajax:before` | `{ url }` | リクエスト開始（`noblock` 以外） |
| `ajax:after` | `{ url }` | リクエスト完了 |
| `ajax:error` | `{ url, error }` | リクエスト失敗 |
| `view:beforeLoad` | `{ context }` | 新しいDOMフラグメントの初期化 |
| `validation:invalid` | `{ labelNames, elements }` | 必須フィールドが未入力 |
| `validation:textareaTooLong` | `{ labelNames, maxlengths, elements }` | テキストエリアが上限超過 |

---

### AJAX — ライフサイクル付きfetch

```typescript
// シンプルなPOST
await AJAX.request({
  url: '/api/save',
  data: { name: 'Alice' },
  success: (res) => console.log('完了'),
});

// 自動バリデーション + フォームシリアライズ付きPOST
await AJAX.request({
  url: '/api/save',
  form: document.getElementById('myForm')!,
});

// 型付きJSONレスポンス
const user = await AJAX.requestJSON<User>({
  url: '/api/user/1',
  success: (data) => { /* data は User型、unknown ではない */ },
});
```

---

### Validation — 宣言型制約

HTMLで宣言するだけ、ライブラリが残りを処理：

```html
<input constraint="required"             labelName="名前" />
<input constraint="required number"      labelName="金額" />
<input constraint="required upperCase onlyEn" labelName="コード" />
<input constraint="date"                 labelName="開始日" />
<input constraint="time"                 labelName="会議時間" />
```

**組み込み制約：** `required` `number` `date` `time` `upperCase` `onlyEn`

**カスタム制約の追加：**

```typescript
Validation.addConstraint({
  name: 'email',
  attach(el) {
    el.addEventListener('change', () => {
      if (el.value && !el.value.includes('@')) el.value = '';
    });
  },
});
// 使用方法：<input constraint="required email" labelName="Email" />
```

**エラー処理のカスタマイズ：**

```typescript
Validation.setRequiredInvalidCallback((labelNames, elements) => {
  // デフォルトの alert を独自のUIに置き換え
  showToast(`未入力：${labelNames.join(', ')}`);
  elements[0]?.focus();
});
```

---

### Formatting — 入力マスク

HTMLで宣言：

```html
<input format="idNumber" />   <!-- A123456789 -->
<input format="date" />       <!-- 2026-02-24（ダッシュを自動挿入） -->
<input format="time" />       <!-- 14:30（コロンを自動挿入） -->
```

**カスタムフォーマッターの登録：**

```typescript
Formatter.add({
  key: 'phone',
  format: (el) => {
    el.placeholder = '09XX-XXX-XXX';
    el.addEventListener('input', () => {
      let v = el.value.replace(/\D/g, '');
      if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
      if (v.length > 8) v = v.slice(0, 8) + '-' + v.slice(8);
      el.value = v.slice(0, 12);
    });
  },
});
```

---

### MSG — バニラDOMダイアログ

```typescript
// 自動閉じ通知
MSG.info('保存しました！', { title: '成功', autoclose: 3000 });

// モーダル（OKクリック必須）
MSG.modal('セッションが期限切れです。', { title: '警告' });

// 確認ダイアログ
MSG.confirm('削除', '本当に削除しますか？', () => {
  deleteRecord();
});

// プログラムで閉じる
MSG.dismissModal();
```

---

### VIEW — 自動初期化付き動的コンテンツ

```typescript
// HTMLフラグメントを読み込み——制約 + フォーマッターが自動初期化
await VIEW.load(document.getElementById('container')!, {
  url: '/api/partial-view',
});

// または手動注入してフックをトリガー
container.innerHTML = htmlString;
VIEW.invokeBeforeLoad(container);

// 独自のフックを登録
VIEW.addBeforeLoad((context) => {
  context.querySelectorAll('.tooltip').forEach(initTooltip);
});
```

---

### ユーティリティ

```typescript
import { sprintf, formToJSON, isDateValid } from 'ts-util-core';

sprintf('こんにちは %s、%d 歳ですね', 'Alice', 30);
// → "こんにちは Alice、30 歳ですね"

sprintf('価格：$%.2f', 9.5);
// → "価格：$9.50"

const data = formToJSON(formElement);
// → { username: "alice", role: "viewer" }

isDateValid('2026-02-24');  // → true
isDateValid('not-a-date');  // → false
```

---

## APIリファレンス

### シングルトン（配線済み、すぐに使用可能）

| エクスポート | 型 | 説明 |
|--------|------|-------------|
| `AJAX` | `Ajax` | フォームバリデーション統合済みHTTPクライアント |
| `VIEW` | `View` | 動的HTMLフラグメントローダー |
| `MSG` | `Message` | DOMダイアログシステム |
| `Validation` | `Validator` | フォームバリデーションエンジン |
| `Formatter` | `FormatterRegistry` | 入力マスクレジストリ |
| `Events` | `EventEmitter<AppEventMap>` | 型付きイベントバス |

### ユーティリティ関数

| エクスポート | シグネチャ | 説明 |
|--------|-----------|-------------|
| `sprintf` | `(fmt: string, ...args) => string` | printf スタイルの文字列フォーマット |
| `formToJSON` | `(container: HTMLElement, options?) => FormDataRecord` | フォーム入力をJSONにシリアライズ |
| `isDateValid` | `(value: string) => boolean` | 日付文字列をバリデーション |
| `parseHTML` | `(html: string) => HTMLElement` | HTML文字列をDOMにパース |
| `scrollToElement` | `(el: HTMLElement) => void` | 要素へスムーススクロール |
| `defaults` | `<T>(base: T, ...overrides: Partial<T>[]) => T` | デフォルトとオーバーライドをマージ |

### クラス（上級者向け / テスト用）

| エクスポート | 説明 |
|--------|-------------|
| `EventEmitter<T>` | テスト用に独立したイベントバスを作成 |
| `Ajax` | カスタム emitter でインスタンス化 |
| `View` | カスタム emitter + ajax でインスタンス化 |
| `Message` | スタンドアロンのダイアログシステム |
| `Validator` | カスタム emitter のスタンドアロンバリデーター |
| `FormatterRegistry` | スタンドアロンのフォーマッターレジストリ |

---

## プロジェクト構成

```
src/
├── index.ts                  # バレルエクスポート + シングルトン配線
├── types.ts                  # 共有型定義
├── core/
│   ├── event-emitter.ts      # 型付き EventEmitter (Mediator)
│   ├── ajax.ts               # HTTPクライアント (Facade + Template Method)
│   ├── view.ts               # フラグメントローダー (Observer)
│   └── message.ts            # ダイアログシステム (Facade)
├── validation/
│   ├── validator.ts           # バリデーションエンジン (Strategy)
│   └── constraints.ts         # 組み込み制約 (Decorator)
├── formatting/
│   ├── registry.ts            # フォーマッターレジストリ (Registry Pattern)
│   └── formatters.ts          # 組み込みフォーマッター
└── utils/
    ├── sprintf.ts             # printf スタイルフォーマット
    └── dom.ts                 # DOMヘルパー
```

**12ソースファイル · 約1,600行 · 厳格なTypeScript · ES2022ターゲット · 依存関係ゼロ**

---

## ビルド

```bash
npm run build          # ワンショットコンパイル
npm run dev            # ウォッチモード
```

出力は `dist/` に `.js`、`.d.ts`、ソースマップとして生成されます。

---

## デザインパターン

このライブラリは教育に適したコードベースです。各モジュールは名前付きのGoFパターンを実装しています：

| パターン | モジュール | 学べること |
|---------|--------|----------------|
| **Mediator** | `EventEmitter` | 疎結合なモジュール間通信 |
| **Facade** | `AJAX`、`MSG` | 複数ステップの複雑さを1つの呼び出しに隠蔽 |
| **Template Method** | `requestJSON()` | 基本アルゴリズムを再利用し、1ステップをカスタマイズ |
| **Observer** | `VIEW.addBeforeLoad()` | 結合なしのプラグイン登録 |
| **Strategy** | `setRequiredInvalidCallback()` | ソースを変更せずに動作を置き換え |
| **Registry** | `Formatter` | 拡張可能なキーベースのルックアップ |
| **Decorator** | `constraint="..."` 属性 | HTMLによる合成可能な動作 |

詳細ドキュメント：
- **[Before (jQuery)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-before.md)** — 元のコードベースのパターン
- **[After (TypeScript)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-after.md)** — TypeScriptでより安全に

---

## ライセンス

MIT
