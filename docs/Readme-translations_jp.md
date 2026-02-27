<p align="center">
  <img src="https://raw.githubusercontent.com/MattAtAIEra/TS-Util/main/docs/banner.svg" alt="TS-Util — Agent Discipline for Humans and AI" width="100%" />
</p>

<p align="center">
  <strong>パイプラインはひとつ。ガードレールも同じ。人が書いても、AIが書いても。</strong>
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

問題の本質はコード品質ではない。**一貫性**である。

10人のエンジニアがいれば、AJAX の書き方は10通りに散らばる。AIエージェントが10体いれば、fetchパターンも10通りだ。バリデーションをかける人もいれば、すっ飛ばす人もいる。ローディングオーバーレイを出す人もいれば、忘れる人もいる。エラーを丁寧に捌く人もいれば、黙って握りつぶす人もいる。

コードレビューで拾えるのは、その一部にすぎない。**アーキテクチャなら、すべてを拾える。**

| よくある悩み | 現場で実際に起きていること |
|---|---|
| 「開発者ごとにAJAXの書き方がバラバラ」 | バリデーションは抜け落ち、スピナーの挙動はまちまち、エラー処理は運次第。 |
| 「AIが冗長で重複だらけのコードを吐く」 | エージェントのたびに `fetch` + バリデーション + エラー処理 + ローディングをイチから組み立て、貴重なコンテキストトークンをボイラープレートで食い潰す。 |
| 「新メンバーが暗黙のルールを壊す」 | そもそもルールの存在を知らなかった——口伝の部族知識であって、強制力のあるインフラではなかったのだから。 |
| 「エージェントの抜け漏れを見抜けない」 | 生成された関数をひとつひとつ監査するしかない。規模が大きくなれば、もう追いつけない。 |

**答えは「レビューを増やす」ことではない。そもそも間違ったコードが書けない構造にすることだ。**

---

## 2. 仕組み

TS-Util は AJAX・VIEW・バリデーション・フォーマット・メッセージングを**ひとつの強制パイプライン**に統合する。人間だろうとAIだろうと、`AJAX.request()` を呼んだ瞬間に、以下がすべて自動で走る：

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

同じ原則は `VIEW.load()` にもそのまま当てはまる。動的に読み込まれたHTMLフラグメントはすべて、制約バインディング・入力フォーマット・カスタムフックを自動で通過する。手動の初期化は要らない。新しいコンテンツにバリデーションをかけ忘れる、ということ自体が起こりえない。

```typescript
// HTMLフラグメントを読み込み——バリデーション + フォーマットが自動初期化
await VIEW.load(container, { url: '/api/partial-view' });
```

---

## 3. 利点

### エンジニアリングチーム向け

| 以前 | 以後 |
|--------|-------|
| 10人のエンジニア、10通りのAJAXパターン | APIはひとつ：`AJAX.request()` |
| 新人が散在する10パターンを読み解く | 新人は例をひとつ読むだけ。初日から出荷できる |
| 「ローディングオーバーレイ付けた？」 | 自動で付く——忘れようがない |
| 「フォームバリデーションした？」 | 自動で走る——スキップしようがない |
| コードレビューでスタイルを延々と議論 | アーキテクチャがスタイルを強制する |

- **分岐をなくす**：エンジニアが覚えるAPIはひとつだけ。「どう実装するか」の議論そのものが消える。
- **一貫性を構造で担保**：すべてのリクエストが同じパイプラインを通る。ローディングオーバーレイの付け忘れも、バリデーションの抜け漏れも、構造的に起こりえない。
- **オンボーディングを最短に**：新メンバーは `AJAX.request()` の例をひとつ読めばすぐ動ける。散在する10パターンを解読する苦行は不要だ。

### AIエージェント向け

| 以前 | 以後 |
|--------|-------|
| エージェントが fetch + バリデーション + エラー処理で15行を展開 | たった1行：`AJAX.request({ url, form })` |
| コンテキストウィンドウがボイラープレートで埋まる | トークンをビジネスロジックに集中できる |
| エージェントごとにパターンがバラバラ | どのエージェントも同一のパイプラインを呼ぶ |
| 全出力を手順漏れがないか逐一監査 | パイプラインが完全性を保証——**設計によるガードレール** |
| エージェントがローディングオーバーレイを「忘れる」 | 忘れようがない——アーキテクチャが許さない |

複数のAIエージェントが協調してコードを生成する場面では、この抽象化レイヤーの価値はいっそう際立つ：

- **トークン効率**：エージェントが出力するのは `AJAX.request({ url, form })` の1行だけ。`fetch` + バリデーション + エラー処理 + ローディングを毎回フルで展開する必要はない。コンテキストウィンドウはAIにとって最も貴重な資源であり、トークンを節約することは出力品質を守ることに直結する。
- **予測可能な動作**：どのエージェントが書いたコードも同じパイプラインを通るから、結果は必ず一貫する。「このエージェントはローディングオーバーレイをちゃんと入れたか？」と個別に監査する必要はない。
- **ガードレール効果**：抽象化レイヤーそのものがガードレールとして機能する。エージェントがフォームバリデーションを「忘れる」ことは不可能だ——`AJAX.request()` が自動で実行するのだから。規律を記憶に頼るのではなく、アーキテクチャで強制する。

### 核心にある考え方

> **規律とは「正しいことを覚えておく」ことではない。正しいこと以外が起こりえない状態を作ることだ。**
>
> それこそがTS-Utilの存在意義である——今日のチームのために、そして明日コードの大半を書くことになるAIエージェントのために。

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

### またはグローバル名前空間で使う（レガシー `<script>` タグ）

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

この `AJAX.request()` ひとつで、以下がすべて実行される：
1. フォーム内のすべての `constraint="required"` フィールドをバリデーション
2. `ajax:before` を発火（スピナーが表示）
3. フォームをJSONにシリアライズしてPOST
4. `ajax:after` を発火（スピナーが非表示）
5. `success` コールバックを呼び出し

---

## ライブデモ

> **[`demo.html` を開く](../demo.html)** — 全モジュールをライブ出力コンソール付きで試せる、対話型のシングルページガイド。
>
> ```bash
> npx serve .        # その後 http://localhost:3000/demo.html を開く
> ```

デモでは Events・AJAX・Validation・Formatting・MSG ダイアログ・VIEW インジェクション・ユーティリティ関数を実際にクリックしながら試せる。コードスニペットと実行結果がリアルタイムで並んで表示される。

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

モジュール間の通信はすべて型付き `EventEmitter` を介して行われ、モジュール同士が直接インポートし合うことはない。この設計により、各部品を独立してテスト・差し替えできる。

---

## モジュール

### Events — すべてをつなぐ中央バス

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

### AJAX — ライフサイクルを備えた fetch

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

HTMLで宣言するだけ。あとはライブラリが引き受ける：

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

HTMLで宣言するだけ：

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

### VIEW — 差し込むだけで自動初期化される動的コンテンツ

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

### シングルトン（配線済み・すぐ使える）

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

### クラス（上級者・テスト向け）

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

出力は `dist/` に `.js`・`.d.ts`・ソースマップとして生成される。

---

## デザインパターン

このライブラリは教材としても優れている。各モジュールが明確なGoFパターンを体現しているからだ：

| パターン | モジュール | 学べること |
|---------|--------|----------------|
| **Mediator** | `EventEmitter` | モジュール同士を疎結合のまま連携させる |
| **Facade** | `AJAX`、`MSG` | 複雑な複数ステップを、たった1回の呼び出しに隠す |
| **Template Method** | `requestJSON()` | 基本アルゴリズムを再利用しつつ、1ステップだけ差し替える |
| **Observer** | `VIEW.addBeforeLoad()` | 依存関係なしでプラグインを登録する |
| **Strategy** | `setRequiredInvalidCallback()` | コードを変えずに振る舞いだけを差し替える |
| **Registry** | `Formatter` | キーで引ける、拡張自在なルックアップ |
| **Decorator** | `constraint="..."` 属性 | HTML属性の組み合わせで振る舞いを合成する |

詳しくはこちら：
- **[Before (jQuery)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-before.md)** — 元のコードベースにおけるパターン
- **[After (TypeScript)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-after.md)** — TypeScriptでより安全に書き直した姿

---

## ライセンス

MIT
