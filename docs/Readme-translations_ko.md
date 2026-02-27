<p align="center">
  <img src="https://raw.githubusercontent.com/MattAtAIEra/TS-Util/main/docs/banner.svg" alt="TS-Util — Agent Discipline for Humans and AI" width="100%" />
</p>

<p align="center">
  <strong>프레임워크 하나. 가드레일 하나. 사람이든 AI든, 예외 없이.</strong>
</p>

<p align="center">
  <a href="https://github.com/MattAtAIEra/TS-Util#readme">English</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_zh.md">繁體中文</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_jp.md">日本語</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_es.md">Español</a>&ensp;&bull;&ensp;
  <a href="Readme-translations_de.md">Deutsch</a>
</p>

---

## 1. 왜 Agent Discipline이 필요한가?

코드가 못나서가 아닙니다. **제각각이라서** 문제입니다.

엔지니어 10명이 모이면 AJAX 호출도 10가지입니다. AI 에이전트 10개를 풀어놓으면 fetch 패턴도 10가지입니다. 누구는 폼 유효성 검사를 붙이고, 누구는 빼먹습니다. 누구는 로딩 오버레이를 띄우고, 누구는 까맣게 잊습니다. 누구는 에러를 정성껏 처리하고, 누구는 아무 말 없이 삼켜버립니다.

코드 리뷰로는 일부만 걸러냅니다. **아키텍처는 전부를 막아냅니다.**

| 익숙한 고민 | 현실에서 벌어지는 일 |
|---|---|
| "개발자마다 AJAX 호출이 제각각이다." | 유효성 검사는 빠지고, 로딩 스피너는 들쭉날쭉, 에러 처리는 운에 맡기는 수준. |
| "AI 에이전트가 뻔한 코드를 끝없이 늘어놓는다." | 에이전트마다 `fetch` + 유효성 검사 + 에러 처리 + 로딩을 매번 처음부터 펼치느라 컨텍스트 토큰을 보일러플레이트에 낭비. |
| "새로 온 사람이 관례를 깨뜨린다." | 관례가 있는 줄도 몰랐다 — 입에서 입으로 전해진 부족 지식이었지, 시스템이 강제하는 규칙이 아니었으니까. |
| "에이전트가 뭘 빼먹었는지 확인할 길이 없다." | 생성된 함수를 전수 검사해야 하는데, 규모가 커지면 사실상 불가능. |

**답은 리뷰를 더 하는 게 아닙니다. 애초에 잘못된 코드가 나올 수 없게 만드는 것입니다.**

---

## 2. 작동 방식

TS-Util은 AJAX, VIEW, 유효성 검사, 포맷팅, 메시징을 **빠져나갈 수 없는 하나의 통합 프레임워크**에 녹여 넣었습니다. 사람이든 AI든 `AJAX.request()`만 호출하면 나머지는 알아서 돌아갑니다:

```
   AJAX.request({ url, form })
          │
          ▼
   ┌─ 1. 폼 유효성 검사 ────── 건너뛸 수 없음
   ├─ 2. ajax:before 발생 ──── 로딩 오버레이
   ├─ 3. 직렬화 + POST ────── 일관된 포맷
   ├─ 4. ajax:after 발생 ───── 오버레이 숨김
   └─ 5. 에러 브로드캐스트 ─── 중앙 집중 처리
```

```typescript
// 엔지니어나 AI 에이전트가 작성해야 하는 전부:
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('저장되었습니다!', { autoclose: 3000 }),
});

// 나머지 모든 것 — 유효성 검사, 로딩 상태, 에러 이벤트,
// 데이터 직렬화 — 은 프레임워크가 처리합니다.
```

`VIEW.load()`도 같은 철학입니다 — 동적으로 불러온 HTML 프래그먼트에 제약 조건 바인딩, 입력 포맷팅, 커스텀 훅이 자동으로 걸립니다. 수동 초기화 따위 필요 없습니다. 새 콘텐츠에 유효성 검사를 "깜빡하는" 일 자체가 불가능합니다.

```typescript
// HTML 프래그먼트 로드 — 유효성 검사 + 포맷팅 자동 초기화
await VIEW.load(container, { url: '/api/partial-view' });
```

---

## 3. 장점

### 엔지니어링 팀을 위해

| 이전 | 이후 |
|--------|-------|
| 엔지니어 10명, AJAX 패턴도 10가지 | API 하나: `AJAX.request()` |
| 신입이 흩어진 패턴 10개를 더듬더듬 읽음 | 신입이 예제 1개 보고 첫날부터 배포 |
| "로딩 오버레이 넣었어?" | 로딩 오버레이는 자동 — 빼먹을 수가 없음 |
| "폼 유효성 검사 했어?" | 유효성 검사는 자동 — 건너뛸 수가 없음 |
| 코드 리뷰에서 스타일 논쟁 | 아키텍처가 스타일을 못 박음 |

- **갈림길 제거**: API 하나만 익히면 됩니다. "이 경우엔 어떤 패턴을 쓰지?"라는 고민 자체가 사라집니다.
- **일관성 보장**: 모든 요청이 같은 프레임워크를 타기 때문에 로딩 오버레이 누락, 유효성 검사 생략 같은 실수가 구조적으로 차단됩니다.
- **온보딩 시간 단축**: 새 팀원은 `AJAX.request()` 예제 하나만 보면 바로 뛰어들 수 있습니다. 코드베이스 곳곳에 숨은 10가지 패턴을 해독할 필요가 없습니다.

### AI 에이전트를 위해

| 이전 | 이후 |
|--------|-------|
| 에이전트가 fetch + 유효성 검사 + 에러 처리로 15줄을 늘어놓음 | 에이전트 출력은 단 1줄: `AJAX.request({ url, form })` |
| 컨텍스트 윈도우가 보일러플레이트에 잠식당함 | 토큰이 비즈니스 로직에 온전히 쓰임 |
| 에이전트마다 제각각인 패턴 | 어떤 에이전트든 같은 프레임워크 호출 |
| 에이전트 출력마다 빠진 단계가 없는지 전수 검사 | 프레임워크가 완전성을 보장 — **설계 자체가 가드레일** |
| 에이전트가 로딩 오버레이를 "깜빡함" | 깜빡할 수가 없음 — 아키텍처가 강제하니까 |

AI 에이전트 여럿이 함께 코드를 짜는 시대, 이 추상화 레이어의 가치는 더 커집니다:

- **토큰 효율성**: 에이전트가 내놓을 코드는 `AJAX.request({ url, form })` 한 줄이면 충분합니다. `fetch` + 유효성 검사 + 에러 처리 + 로딩을 매번 처음부터 펼칠 이유가 없습니다. 컨텍스트 윈도우는 AI에게 가장 귀한 자원이고, 토큰을 아끼는 것이 곧 품질을 지키는 길입니다.
- **예측 가능한 동작**: 어떤 에이전트가 만든 코드든 같은 프레임워크를 타므로 결과가 균일합니다. 에이전트별로 로딩 오버레이를 제대로 붙였는지 하나하나 확인할 필요가 없습니다.
- **가드레일 효과**: 추상화 레이어 그 자체가 가드레일입니다. 에이전트가 폼 유효성 검사를 "잊는" 건 불가능합니다 — `AJAX.request()`가 알아서 실행하니까요. 규율은 기억력이 아니라 아키텍처가 책임집니다.

### 핵심 통찰

> **규율이란 "올바른 걸 기억해내는 것"이 아닙니다. 올바른 것만 일어날 수밖에 없게 판을 짜는 것입니다.**
>
> TS-Util이 하는 일이 바로 그것입니다 — 오늘의 팀을 위해, 그리고 내일 코드의 대부분을 써내려갈 AI 에이전트를 위해.

---

## 빠른 시작

### 설치

```bash
npm install ts-util-core
```

### 필요한 모듈 가져오기

```typescript
import { AJAX, VIEW, MSG, Validation, Formatter, Events } from 'ts-util-core';
```

### 또는 전역 네임스페이스 사용 (레거시 `<script>` 태그)

```html
<script type="module" src="dist/index.js"></script>
<script>
  const { AJAX, MSG } = window['#'];
</script>
```

### 실제 예제

```typescript
import { AJAX, MSG, Events } from 'ts-util-core';

// 라이프사이클 이벤트 감시
Events.on('ajax:before', ({ url }) => showSpinner(url));
Events.on('ajax:after',  ({ url }) => hideSpinner(url));

// 자동 유효성 검사로 폼 제출
await AJAX.request({
  url: '/api/orders',
  form: document.getElementById('order-form')!,
  success: () => MSG.info('주문이 저장되었습니다!', { autoclose: 3000 }),
});
```

`AJAX.request()` 한 번이면 이 모든 일이 벌어집니다:
1. 폼의 모든 `constraint="required"` 필드를 유효성 검사
2. `ajax:before` 발생 (스피너 표시)
3. 폼을 JSON으로 직렬화하여 POST
4. `ajax:after` 발생 (스피너 숨김)
5. `success` 콜백 호출

---

## 라이브 데모

> **[`demo.html` 열기](../demo.html)** — 모든 모듈에 라이브 출력 콘솔이 있는 대화형 단일 페이지 가이드.
>
> ```bash
> npx serve .        # 그런 다음 http://localhost:3000/demo.html 열기
> ```

Events, AJAX, Validation, Formatting, MSG 대화상자, VIEW 주입, 유틸리티 함수를 직접 클릭하며 체험해 보세요 — 코드 스니펫 바로 옆에서 실시간 결과를 확인할 수 있습니다.

---

## 아키텍처

```
                        ┌─────────────────┐
                        │  EventEmitter   │  ← 타입 안전 중앙 버스
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

모든 모듈은 타입 안전 `EventEmitter`를 매개로 소통하며, 서로를 직접 임포트하지 않습니다. 덕분에 각 모듈을 독립적으로 테스트하고 자유롭게 교체할 수 있습니다.

---

## 모듈

### Events — 중앙 버스

```typescript
// 완전한 타입 안전으로 구독 — 이벤트 이름과 페이로드가 검사됨
Events.on('ajax:before', ({ url }) => console.log(url));     // url: string
Events.on('ajax:error',  ({ url, error }) => log(error));    // error: Error

// 구독 해제
const off = Events.on('ajax:after', handler);
off(); // 완료
```

**사용 가능한 이벤트:**

| 이벤트 | 페이로드 | 발생 시점 |
|-------|---------|------------|
| `ajax:before` | `{ url }` | 요청 시작 (`noblock` 제외) |
| `ajax:after` | `{ url }` | 요청 완료 |
| `ajax:error` | `{ url, error }` | 요청 실패 |
| `view:beforeLoad` | `{ context }` | 새 DOM 프래그먼트 초기화 |
| `validation:invalid` | `{ labelNames, elements }` | 필수 필드 미입력 |
| `validation:textareaTooLong` | `{ labelNames, maxlengths, elements }` | 텍스트영역 제한 초과 |

---

### AJAX — 라이프사이클이 있는 fetch

```typescript
// 간단한 POST
await AJAX.request({
  url: '/api/save',
  data: { name: 'Alice' },
  success: (res) => console.log('완료'),
});

// 자동 유효성 검사 + 폼 직렬화 POST
await AJAX.request({
  url: '/api/save',
  form: document.getElementById('myForm')!,
});

// 타입 안전 JSON 응답
const user = await AJAX.requestJSON<User>({
  url: '/api/user/1',
  success: (data) => { /* data는 User 타입, unknown이 아님 */ },
});
```

---

### Validation — 선언적 제약 조건

HTML에 선언만 해두면 나머지는 라이브러리가 알아서 합니다:

```html
<input constraint="required"             labelName="이름" />
<input constraint="required number"      labelName="금액" />
<input constraint="required upperCase onlyEn" labelName="코드" />
<input constraint="date"                 labelName="시작일" />
<input constraint="time"                 labelName="회의 시간" />
```

**내장 제약 조건:** `required` `number` `date` `time` `upperCase` `onlyEn`

**커스텀 제약 조건 추가:**

```typescript
Validation.addConstraint({
  name: 'email',
  attach(el) {
    el.addEventListener('change', () => {
      if (el.value && !el.value.includes('@')) el.value = '';
    });
  },
});
// 사용법: <input constraint="required email" labelName="Email" />
```

**에러 처리 커스터마이즈:**

```typescript
Validation.setRequiredInvalidCallback((labelNames, elements) => {
  // 기본 alert를 커스텀 UI로 대체
  showToast(`미입력: ${labelNames.join(', ')}`);
  elements[0]?.focus();
});
```

---

### Formatting — 입력 마스크

HTML에서 선언:

```html
<input format="idNumber" />   <!-- A123456789 -->
<input format="date" />       <!-- 2026-02-24 (대시 자동 삽입) -->
<input format="time" />       <!-- 14:30 (콜론 자동 삽입) -->
```

**커스텀 포맷터 등록:**

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

### MSG — 바닐라 DOM 대화상자

```typescript
// 자동 닫힘 알림
MSG.info('저장되었습니다!', { title: '성공', autoclose: 3000 });

// 모달 (확인 클릭 필수)
MSG.modal('세션이 만료되었습니다.', { title: '경고' });

// 확인 대화상자
MSG.confirm('삭제', '정말 삭제하시겠습니까?', () => {
  deleteRecord();
});

// 프로그래밍 방식으로 닫기
MSG.dismissModal();
```

---

### VIEW — 자동 초기화 동적 콘텐츠

```typescript
// HTML 프래그먼트 로드 — 제약 조건 + 포맷터 자동 초기화
await VIEW.load(document.getElementById('container')!, {
  url: '/api/partial-view',
});

// 또는 수동 주입 후 훅 트리거
container.innerHTML = htmlString;
VIEW.invokeBeforeLoad(container);

// 커스텀 훅 등록
VIEW.addBeforeLoad((context) => {
  context.querySelectorAll('.tooltip').forEach(initTooltip);
});
```

---

### 유틸리티

```typescript
import { sprintf, formToJSON, isDateValid } from 'ts-util-core';

sprintf('안녕하세요 %s, %d살이시군요', 'Alice', 30);
// → "안녕하세요 Alice, 30살이시군요"

sprintf('가격: $%.2f', 9.5);
// → "가격: $9.50"

const data = formToJSON(formElement);
// → { username: "alice", role: "viewer" }

isDateValid('2026-02-24');  // → true
isDateValid('not-a-date');  // → false
```

---

## API 레퍼런스

### 싱글톤 (이미 연결되어 있어 바로 사용 가능)

| 내보내기 | 타입 | 설명 |
|--------|------|-------------|
| `AJAX` | `Ajax` | 폼 유효성 검사 통합 HTTP 클라이언트 |
| `VIEW` | `View` | 동적 HTML 프래그먼트 로더 |
| `MSG` | `Message` | DOM 대화상자 시스템 |
| `Validation` | `Validator` | 폼 유효성 검사 엔진 |
| `Formatter` | `FormatterRegistry` | 입력 마스크 레지스트리 |
| `Events` | `EventEmitter<AppEventMap>` | 타입 안전 이벤트 버스 |

### 유틸리티 함수

| 내보내기 | 시그니처 | 설명 |
|--------|-----------|-------------|
| `sprintf` | `(fmt: string, ...args) => string` | printf 스타일 문자열 포맷팅 |
| `formToJSON` | `(container: HTMLElement, options?) => FormDataRecord` | 폼 입력을 JSON으로 직렬화 |
| `isDateValid` | `(value: string) => boolean` | 날짜 문자열 유효성 검사 |
| `parseHTML` | `(html: string) => HTMLElement` | HTML 문자열을 DOM으로 파싱 |
| `scrollToElement` | `(el: HTMLElement) => void` | 요소로 부드러운 스크롤 |
| `defaults` | `<T>(base: T, ...overrides: Partial<T>[]) => T` | 기본값과 오버라이드 병합 |

### 클래스 (고급 사용 / 테스트)

| 내보내기 | 설명 |
|--------|-------------|
| `EventEmitter<T>` | 테스트용 독립 이벤트 버스 생성 |
| `Ajax` | 커스텀 emitter로 인스턴스화 |
| `View` | 커스텀 emitter + ajax로 인스턴스화 |
| `Message` | 독립형 대화상자 시스템 |
| `Validator` | 커스텀 emitter의 독립형 유효성 검사기 |
| `FormatterRegistry` | 독립형 포맷터 레지스트리 |

---

## 프로젝트 구조

```
src/
├── index.ts                  # 배럴 내보내기 + 싱글톤 배선
├── types.ts                  # 공유 타입 정의
├── core/
│   ├── event-emitter.ts      # 타입 안전 EventEmitter (Mediator)
│   ├── ajax.ts               # HTTP 클라이언트 (Facade + Template Method)
│   ├── view.ts               # 프래그먼트 로더 (Observer)
│   └── message.ts            # 대화상자 시스템 (Facade)
├── validation/
│   ├── validator.ts           # 유효성 검사 엔진 (Strategy)
│   └── constraints.ts         # 내장 제약 조건 (Decorator)
├── formatting/
│   ├── registry.ts            # 포맷터 레지스트리 (Registry Pattern)
│   └── formatters.ts          # 내장 포맷터
└── utils/
    ├── sprintf.ts             # printf 스타일 포맷팅
    └── dom.ts                 # DOM 헬퍼
```

**12개 소스 파일 · 약 1,600줄 · 엄격한 TypeScript · ES2022 타겟 · 의존성 제로**

---

## 빌드

```bash
npm run build          # 원샷 컴파일
npm run dev            # 워치 모드
```

출력은 `dist/`에 `.js`, `.d.ts`, 소스 맵으로 생성됩니다.

---

## 디자인 패턴

이 라이브러리는 그 자체로 훌륭한 학습 자료이기도 합니다. 각 모듈이 실전에서 GoF 패턴을 어떻게 살려 쓰는지 보여줍니다:

| 패턴 | 모듈 | 학습 내용 |
|---------|--------|----------------|
| **Mediator** | `EventEmitter` | 모듈끼리 직접 엮이지 않고도 대화하는 법 |
| **Facade** | `AJAX`, `MSG` | 여러 단계의 복잡성을 호출 하나 뒤에 감추기 |
| **Template Method** | `requestJSON()` | 뼈대는 재사용하고, 한 단계만 갈아 끼우기 |
| **Observer** | `VIEW.addBeforeLoad()` | 결합 없이 플러그인을 꽂는 구조 |
| **Strategy** | `setRequiredInvalidCallback()` | 소스 코드 건드리지 않고 동작만 바꾸기 |
| **Registry** | `Formatter` | 키 하나로 찾아 쓰는 확장형 저장소 |
| **Decorator** | `constraint="..."` 속성 | HTML 속성으로 동작을 자유롭게 조합 |

더 깊이 들여다보고 싶다면:
- **[Before (jQuery)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-before.md)** — 원본 코드베이스의 패턴
- **[After (TypeScript)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-after.md)** — TypeScript로 더 안전하게

---

## 라이선스

MIT
