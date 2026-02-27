<p align="center">
  <img src="https://raw.githubusercontent.com/MattAtAIEra/TS-Util/main/docs/banner.svg" alt="TS-Util — Agent Discipline for Humans and AI" width="100%" />
</p>

<p align="center">
  <strong>一套框架，同一套護欄——不管寫程式的是你的團隊，還是 AI Agent。</strong>
</p>

<p align="center">
  <a href="https://github.com/MattAtAIEra/TS-Util#readme">English</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_jp.md">日本語</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_ko.md">한국어</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_es.md">Español</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_de.md">Deutsch</a>
</p>

---

## 1. 為什麼需要 Agent Discipline？

你的問題不在程式碼品質，而在**一致性。**

十個工程師，寫出十種 AJAX 呼叫方式。十個 AI Agent，生出十種 fetch 寫法。有人乖乖驗證表單，有人直接略過；有人記得加 loading 遮罩，有人壓根忘了；有人細心處理錯誤，有人一聲不吭地吞掉。

Code review 只能亡羊補牢。**架構才能釜底抽薪。**

| 你常聽到的痛點 | 背後真正發生的事 |
|---|---|
| 「每個人的 AJAX 寫法都不一樣。」 | 驗證想跳就跳、loading 有的加有的沒加、錯誤處理全憑運氣。 |
| 「AI Agent 產出的程式碼又臭又長。」 | 每個 Agent 各自從零展開 `fetch` + 驗證 + 錯誤處理 + loading，寶貴的 context token 全燒在樣板程式碼上。 |
| 「新人一來就踩雷。」 | 他們根本不知道有慣例——那只是老鳥之間口耳相傳的默契，從來沒有被寫進架構裡強制執行。 |
| 「不確定 Agent 有沒有漏掉什麼。」 | 你得逐個函式審查 Agent 的產出。專案一大，根本不可能。 |

**答案不是加更多 code review，而是從架構上讓錯誤的寫法根本不存在。**

---

## 2. 運作方式

TS-Util 把 AJAX、VIEW、驗證、格式化和訊息通知收攏成**一套統一框架**。不管是人還是 AI，只要呼叫 `AJAX.request()`，以下步驟就會自動跑完：

```
   AJAX.request({ url, form })
          │
          ▼
   ┌─ 1. 驗證表單 ──────────── 無法跳過
   ├─ 2. 發出 ajax:before ──── loading 遮罩
   ├─ 3. 序列化 + POST ────── 一致的格式
   ├─ 4. 發出 ajax:after ───── 遮罩隱藏
   └─ 5. 錯誤廣播 ──────────── 集中處理
```

```typescript
// 這是工程師或 AI Agent 需要寫的全部程式碼：
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('已儲存！', { autoclose: 3000 }),
});

// 其他一切——驗證、loading 狀態、錯誤事件、
// 資料序列化——都由框架處理。
```

`VIEW.load()` 也是同樣的道理——每一段動態載入的 HTML 都會自動走完約束綁定、輸入格式化、自訂 hook。不用手動初始化，想漏也漏不了。

```typescript
// 載入 HTML 片段——驗證 + 格式化自動初始化
await VIEW.load(container, { url: '/api/partial-view' });
```

---

## 3. 優勢

### 對工程團隊

| 之前 | 之後 |
|--------|-------|
| 10 個工程師，10 種 AJAX 模式 | 1 個 API：`AJAX.request()` |
| 新人讀 10 種散落各處的寫法 | 新人讀 1 個範例，第一天就能上線 |
| 「你有加 loading 遮罩嗎？」 | Loading 遮罩是自動的——不可能忘記 |
| 「你有驗證表單嗎？」 | 驗證是自動的——不可能跳過 |
| Code review 爭論風格 | 架構強制風格 |

- **消滅分歧**：全隊只有一套 API 要學，沒有「我習慣這樣寫」的爭議空間。
- **一致性靠架構，不靠自律**：所有請求走同一套框架，loading 遮罩不可能漏、驗證不可能跳——因為框架替你做了。
- **新人即戰力**：看一個 `AJAX.request()` 範例就能上手，不必在散落各處的十種寫法裡考古。

### 對 AI Agent

| 之前 | 之後 |
|--------|-------|
| Agent 展開 15 行 fetch + 驗證 + 錯誤處理 | Agent 產出 1 行：`AJAX.request({ url, form })` |
| Context window 燒在樣板程式碼上 | Token 保留給業務邏輯 |
| 不同 Agent 產出不同模式 | 所有 Agent 產出相同的框架呼叫 |
| 必須審查每個 Agent 的輸出是否遺漏步驟 | 框架保證完整性——**設計即護欄** |
| Agent「忘記」loading 遮罩 | 不可能——架構強制執行 |

當多個 AI Agent 同時在產出程式碼，這層封裝的價值只會更大：

- **省 token 就是省品質**：Agent 只要吐出 `AJAX.request({ url, form })` 一行，不必每次從頭展開 `fetch` + 驗證 + 錯誤處理 + loading。Context window 是 AI 最稀缺的資源，省下的 token 都能拿去處理真正的業務邏輯。
- **誰寫的都一樣**：不同 Agent 的產出全部走同一套框架，結果天然一致。你不需要挨個檢查「這個 Agent 有沒有忘記加 loading」。
- **護欄即架構**：封裝層本身就是護欄。Agent 想「忘記」驗證表單？不可能——`AJAX.request()` 替它做了。紀律不靠記性，靠的是架構。

### 一句話說完

> **紀律，不是「提醒自己做對的事」。紀律，是讓對的事成為唯一能做的事。**
>
> 這就是 TS-Util 的意義所在——為今天的團隊，也為明天替你寫程式的 AI Agent。

---

## 快速開始

### 安裝

```bash
npm install ts-util-core
```

### 匯入你需要的模組

```typescript
import { AJAX, VIEW, MSG, Validation, Formatter, Events } from 'ts-util-core';
```

### 或使用全域命名空間（傳統 `<script>` 標籤）

```html
<script type="module" src="dist/index.js"></script>
<script>
  const { AJAX, MSG } = window['#'];
</script>
```

### 實際範例

```typescript
import { AJAX, MSG, Events } from 'ts-util-core';

// 監聽生命週期事件
Events.on('ajax:before', ({ url }) => showSpinner(url));
Events.on('ajax:after',  ({ url }) => hideSpinner(url));

// 提交表單並自動驗證
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('訂單已儲存！', { autoclose: 3000 }),
});
```

就這麼一個 `AJAX.request()` 呼叫，背後自動完成：
1. 驗證表單中所有 `constraint="required"` 的欄位
2. 發出 `ajax:before`（你的 spinner 出現）
3. 將表單序列化為 JSON 並 POST
4. 發出 `ajax:after`（spinner 隱藏）
5. 呼叫你的 `success` 回呼

---

## 互動展示

> **[開啟 `demo.html`](../demo.html)** — 每個模組都有即時輸出控制台的互動式單頁指南。
>
> ```bash
> npx serve .        # 然後開啟 http://localhost:3000/demo.html
> ```

在展示頁裡，你可以逐一操作 Events、AJAX、Validation、Formatting、MSG 對話框、VIEW 注入和工具函式——每段程式碼旁邊都有即時執行結果。

---

## 架構

```
                        ┌─────────────────┐
                        │  EventEmitter   │  ← 型別化的中央匯流排
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

所有模組透過型別化的 `EventEmitter` 溝通，彼此之間沒有直接 import。這代表每個元件都能獨立測試、隨時替換。

---

## 模組

### Events — 中央事件匯流排

```typescript
// 完全型別安全的訂閱——事件名稱和 payload 都會被檢查
Events.on('ajax:before', ({ url }) => console.log(url));     // url: string
Events.on('ajax:error',  ({ url, error }) => log(error));    // error: Error

// 取消訂閱
const off = Events.on('ajax:after', handler);
off(); // 完成
```

**可用事件：**

| 事件 | Payload | 觸發時機 |
|-------|---------|------------|
| `ajax:before` | `{ url }` | 請求開始（除非 `noblock`） |
| `ajax:after` | `{ url }` | 請求完成 |
| `ajax:error` | `{ url, error }` | 請求失敗 |
| `view:beforeLoad` | `{ context }` | 新 DOM 片段初始化 |
| `validation:invalid` | `{ labelNames, elements }` | 必填欄位遺漏 |
| `validation:textareaTooLong` | `{ labelNames, maxlengths, elements }` | 文字區域超過限制 |

---

### AJAX — 帶生命週期的 fetch

```typescript
// 簡單 POST
await AJAX.request({
  url: '/api/save',
  data: { name: 'Alice' },
  success: (res) => console.log('完成'),
});

// 帶自動驗證 + 表單序列化的 POST
await AJAX.request({
  url: '/api/save',
  form: document.getElementById('myForm')!,
});

// 型別化的 JSON 回應
const user = await AJAX.requestJSON<User>({
  url: '/api/user/1',
  success: (data) => { /* data 是 User 型別，不是 unknown */ },
});
```

---

### Validation — 宣告式約束

只要在 HTML 上標記，其餘全交給程式庫：

```html
<input constraint="required"             labelName="姓名" />
<input constraint="required number"      labelName="金額" />
<input constraint="required upperCase onlyEn" labelName="代碼" />
<input constraint="date"                 labelName="開始日期" />
<input constraint="time"                 labelName="會議時間" />
```

**內建約束：** `required` `number` `date` `time` `upperCase` `onlyEn`

**新增自訂約束：**

```typescript
Validation.addConstraint({
  name: 'email',
  attach(el) {
    el.addEventListener('change', () => {
      if (el.value && !el.value.includes('@')) el.value = '';
    });
  },
});
// 現在可以使用：<input constraint="required email" labelName="Email" />
```

**自訂錯誤處理：**

```typescript
Validation.setRequiredInvalidCallback((labelNames, elements) => {
  // 用你自己的 UI 取代預設的 alert
  showToast(`缺少：${labelNames.join(', ')}`);
  elements[0]?.focus();
});
```

---

### Formatting — 輸入遮罩

在 HTML 中宣告：

```html
<input format="idNumber" />   <!-- A123456789 -->
<input format="date" />       <!-- 2026-02-24（自動插入破折號） -->
<input format="time" />       <!-- 14:30（自動插入冒號） -->
```

**註冊自訂格式器：**

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

### MSG — 原生 DOM 對話框

```typescript
// 自動關閉的通知
MSG.info('已儲存！', { title: '成功', autoclose: 3000 });

// 強制回應對話框（必須點擊確定）
MSG.modal('連線已過期。', { title: '警告' });

// 確認對話框
MSG.confirm('刪除', '確定要刪除嗎？', () => {
  deleteRecord();
});

// 程式化關閉
MSG.dismissModal();
```

---

### VIEW — 帶自動初始化的動態內容

```typescript
// 載入 HTML 片段——約束 + 格式器自動初始化
await VIEW.load(document.getElementById('container')!, {
  url: '/api/partial-view',
});

// 或手動注入並觸發 hook
container.innerHTML = htmlString;
VIEW.invokeBeforeLoad(container);

// 註冊你自己的 hook
VIEW.addBeforeLoad((context) => {
  context.querySelectorAll('.tooltip').forEach(initTooltip);
});
```

---

### 工具函式

```typescript
import { sprintf, formToJSON, isDateValid } from 'ts-util-core';

sprintf('你好 %s，你 %d 歲', 'Alice', 30);
// → "你好 Alice，你 30 歲"

sprintf('價格：$%.2f', 9.5);
// → "價格：$9.50"

const data = formToJSON(formElement);
// → { username: "alice", role: "viewer" }

isDateValid('2026-02-24');  // → true
isDateValid('not-a-date');  // → false
```

---

## API 參考

### 單例（預先配線，即可使用）

| 匯出 | 型別 | 說明 |
|--------|------|-------------|
| `AJAX` | `Ajax` | 整合表單驗證的 HTTP 客戶端 |
| `VIEW` | `View` | 動態 HTML 片段載入器 |
| `MSG` | `Message` | DOM 對話框系統 |
| `Validation` | `Validator` | 表單驗證引擎 |
| `Formatter` | `FormatterRegistry` | 輸入遮罩註冊表 |
| `Events` | `EventEmitter<AppEventMap>` | 型別化的事件匯流排 |

### 工具函式

| 匯出 | 簽名 | 說明 |
|--------|-----------|-------------|
| `sprintf` | `(fmt: string, ...args) => string` | printf 風格的字串格式化 |
| `formToJSON` | `(container: HTMLElement, options?) => FormDataRecord` | 將表單輸入序列化為 JSON |
| `isDateValid` | `(value: string) => boolean` | 驗證日期字串 |
| `parseHTML` | `(html: string) => HTMLElement` | 將 HTML 字串解析為 DOM |
| `scrollToElement` | `(el: HTMLElement) => void` | 平滑捲動至元素 |
| `defaults` | `<T>(base: T, ...overrides: Partial<T>[]) => T` | 合併預設值與覆寫值 |

### 類別（進階用途 / 測試）

| 匯出 | 說明 |
|--------|-------------|
| `EventEmitter<T>` | 建立獨立的事件匯流排用於測試 |
| `Ajax` | 以自訂 emitter 實例化 |
| `View` | 以自訂 emitter + ajax 實例化 |
| `Message` | 獨立的對話框系統 |
| `Validator` | 以自訂 emitter 的獨立驗證器 |
| `FormatterRegistry` | 獨立的格式器註冊表 |

---

## 專案結構

```
src/
├── index.ts                  # Barrel export + 單例配線
├── types.ts                  # 共用型別定義
├── core/
│   ├── event-emitter.ts      # 型別化 EventEmitter (Mediator)
│   ├── ajax.ts               # HTTP 客戶端 (Facade + Template Method)
│   ├── view.ts               # 片段載入器 (Observer)
│   └── message.ts            # 對話框系統 (Facade)
├── validation/
│   ├── validator.ts           # 驗證引擎 (Strategy)
│   └── constraints.ts         # 內建約束 (Decorator)
├── formatting/
│   ├── registry.ts            # 格式器註冊表 (Registry Pattern)
│   └── formatters.ts          # 內建格式器
└── utils/
    ├── sprintf.ts             # printf 風格格式化
    └── dom.ts                 # DOM 輔助工具
```

**12 個原始檔 · 約 1,600 行 · 嚴格 TypeScript · ES2022 target · 零依賴**

---

## 建置

```bash
npm run build          # 一次性編譯
npm run dev            # 監聽模式
```

輸出至 `dist/`，包含 `.js`、`.d.ts` 和 source map。

---

## 設計模式

這個程式庫同時也是一份設計模式教材。每個模組都對應一個經典的 GoF 模式：

| 模式 | 模組 | 教學重點 |
|---------|--------|----------------|
| **Mediator** | `EventEmitter` | 解耦的模組間通訊 |
| **Facade** | `AJAX`、`MSG` | 將多步驟複雜性隱藏在一個呼叫後面 |
| **Template Method** | `requestJSON()` | 重用基礎演算法，自訂一個步驟 |
| **Observer** | `VIEW.addBeforeLoad()` | 無耦合的外掛註冊 |
| **Strategy** | `setRequiredInvalidCallback()` | 不修改原始碼即可替換行為 |
| **Registry** | `Formatter` | 可擴展的鍵值查詢 |
| **Decorator** | `constraint="..."` 屬性 | 透過 HTML 組合行為 |

深入文件：
- **[之前 (jQuery)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-before.md)** — 原始程式碼庫中的模式
- **[之後 (TypeScript)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-after.md)** — TypeScript 如何使它們更安全

---

## 授權

MIT
