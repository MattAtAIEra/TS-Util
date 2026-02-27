<p align="center">
  <img src="https://raw.githubusercontent.com/MattAtAIEra/TS-Util/main/docs/banner.svg" alt="TS-Util — Agent Discipline for Humans and AI" width="100%" />
</p>

<p align="center">
  <strong>하나의 파이프라인. 동일한 가드레일. 팀이든 AI 에이전트든.</strong>
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

코드 품질 문제가 아닙니다. **일관성 문제**입니다.

10명의 엔지니어가 10가지 다른 AJAX 호출을 작성합니다. 10개의 AI 에이전트가 10가지 다른 fetch 패턴을 생성합니다. 폼 유효성 검사를 하는 사람도 있고 안 하는 사람도 있습니다. 로딩 오버레이를 보여주는 사람도 있고 잊는 사람도 있습니다. 에러를 우아하게 처리하는 사람도 있고 조용히 삼키는 사람도 있습니다.

코드 리뷰는 일부를 잡아냅니다. **아키텍처는 전부를 잡아냅니다.**

| 진짜 문제 | 실제로 일어나는 일 |
|---|---|
| "개발자마다 AJAX 방식이 다르다." | 유효성 검사가 생략됨. 로딩 스피너가 불일치. 에러 처리는 동전 던지기. |
| "AI 에이전트가 장황하고 반복적인 코드를 생성한다." | 각 에이전트가 `fetch` + 유효성 검사 + 에러 처리 + 로딩을 처음부터 전개하며 보일러플레이트에 컨텍스트 토큰을 소비. |
| "새 팀원이 관례를 깨뜨린다." | 관례가 있다는 것조차 몰랐다 — 그것은 구전된 부족 지식이지 강제된 인프라가 아니었다. |
| "에이전트가 무언가를 빠뜨렸는지 알 수 없다." | 생성된 모든 함수를 감사해야 한다. 대규모에서는 불가능. |

**해결책은 더 많은 코드 리뷰가 아닙니다. 잘못된 코드를 작성하는 것 자체를 불가능하게 만드는 것입니다.**

---

## 2. 작동 방식

TS-Util은 AJAX, VIEW, 유효성 검사, 포맷팅, 메시징을 **하나의 강제 파이프라인**으로 통합합니다. 누구든 — 사람이든 AI든 — `AJAX.request()`를 호출하면 다음이 자동으로 실행됩니다:

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
// 데이터 직렬화 — 은 파이프라인이 처리합니다.
```

동일한 원칙이 `VIEW.load()`에도 적용됩니다 — 동적으로 로드된 모든 HTML 프래그먼트는 자동으로 제약 조건 바인딩, 입력 포맷팅, 커스텀 훅 실행을 거칩니다. 수동 초기화가 필요 없습니다. 새 콘텐츠에 유효성 검사를 설정하는 것을 "잊는" 일도 없습니다.

```typescript
// HTML 프래그먼트 로드 — 유효성 검사 + 포맷팅 자동 초기화
await VIEW.load(container, { url: '/api/partial-view' });
```

---

## 3. 장점

### 엔지니어링 팀을 위해

| 이전 | 이후 |
|--------|-------|
| 10명의 엔지니어, 10가지 AJAX 패턴 | 1개의 API: `AJAX.request()` |
| 신입이 흩어진 10가지 패턴을 읽음 | 신입이 1개 예제를 읽고 첫날부터 배포 |
| "로딩 오버레이 추가했어?" | 로딩 오버레이는 자동 — 잊을 수 없음 |
| "폼 유효성 검사 했어?" | 유효성 검사는 자동 — 건너뛸 수 없음 |
| 코드 리뷰에서 스타일 논쟁 | 아키텍처가 스타일을 강제 |

- **분기 제거**: 엔지니어는 하나의 API만 배우면 되며 구현 세부 사항에 대한 논쟁이 필요 없습니다.
- **일관성 강제**: 모든 요청이 동일한 파이프라인을 통과하여 로딩 오버레이 누락이나 유효성 검사 생략을 방지합니다.
- **온보딩 비용 절감**: 새 팀원은 `AJAX.request()` 예제 하나만 읽으면 바로 시작할 수 있으며, 여기저기 흩어진 10가지 패턴을 해독할 필요가 없습니다.

### AI 에이전트를 위해

| 이전 | 이후 |
|--------|-------|
| 에이전트가 fetch + 유효성 검사 + 에러 처리로 15줄 전개 | 에이전트가 1줄 출력: `AJAX.request({ url, form })` |
| 컨텍스트 윈도우가 보일러플레이트에 소비 | 토큰이 비즈니스 로직에 보존 |
| 다른 에이전트가 다른 패턴 생성 | 모든 에이전트가 동일한 파이프라인 호출 생성 |
| 모든 에이전트 출력에서 누락 단계 감사 필요 | 파이프라인이 완전성 보장 — **설계에 의한 가드레일** |
| 에이전트가 로딩 오버레이를 "잊음" | 불가능 — 아키텍처가 강제 |

여러 AI 에이전트가 공동으로 코드를 생성할 때, 이 추상화 레이어는 더욱 중요해집니다:

- **토큰 효율성**: 에이전트는 `AJAX.request({ url, form })` 한 줄만 출력하면 됩니다. 매번 `fetch` + 유효성 검사 + 에러 처리 + 로딩의 전체 로직을 전개할 필요가 없습니다. 컨텍스트 윈도우는 AI의 가장 소중한 자원이며, 토큰 절약은 곧 품질 유지를 의미합니다.
- **예측 가능한 동작**: 서로 다른 에이전트가 생성한 코드가 동일한 파이프라인을 통과하므로 일관된 결과가 보장됩니다. 각 에이전트가 로딩 오버레이를 올바르게 구현했는지 일일이 감사할 필요가 없습니다.
- **가드레일 효과**: 추상화 레이어 자체가 가드레일 역할을 합니다. 에이전트는 폼 유효성 검사를 "잊을" 수 없습니다. `AJAX.request()`가 자동으로 실행하기 때문입니다. 규율은 기억이 아닌 아키텍처에 의해 강제됩니다.

### 핵심 통찰

> **규율은 "올바른 일을 기억하는 것"이 아닙니다. 규율은 올바른 일만이 일어날 수 있도록 만드는 것입니다.**
>
> 이것이 TS-Util이 하는 일입니다 — 오늘의 팀을 위해, 그리고 내일 대부분의 코드를 작성할 AI 에이전트를 위해.

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

이 하나의 `AJAX.request()` 호출은:
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

데모에서 Events, AJAX, Validation, Formatting, MSG 대화상자, VIEW 주입, 유틸리티 함수를 클릭하여 체험할 수 있습니다 — 코드 스니펫 옆에 실시간 결과가 표시됩니다.

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

모든 모듈은 타입 안전 `EventEmitter`를 통해 통신하며 모듈이 다른 모듈을 직접 가져오지 않습니다. 이를 통해 각 부품을 독립적으로 테스트하고 교체할 수 있습니다.

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

HTML에서 선언하면 라이브러리가 나머지를 처리:

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

### 싱글톤 (사전 배선, 즉시 사용 가능)

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

이 라이브러리는 교육에 적합한 코드베이스입니다. 각 모듈은 명명된 GoF 패턴을 구현합니다:

| 패턴 | 모듈 | 학습 내용 |
|---------|--------|----------------|
| **Mediator** | `EventEmitter` | 느슨한 결합의 모듈 간 통신 |
| **Facade** | `AJAX`, `MSG` | 다단계 복잡성을 하나의 호출 뒤에 숨김 |
| **Template Method** | `requestJSON()` | 기본 알고리즘을 재사용하고 한 단계를 커스터마이즈 |
| **Observer** | `VIEW.addBeforeLoad()` | 결합 없는 플러그인 등록 |
| **Strategy** | `setRequiredInvalidCallback()` | 소스 수정 없이 동작 교체 |
| **Registry** | `Formatter` | 확장 가능한 키 기반 조회 |
| **Decorator** | `constraint="..."` 속성 | HTML을 통한 조합 가능한 동작 |

심화 문서:
- **[Before (jQuery)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-before.md)** — 원본 코드베이스의 패턴
- **[After (TypeScript)](https://github.com/MattAtAIEra/TS-Util/blob/main/docs/good-design-pattern-implementation-after.md)** — TypeScript로 더 안전하게

---

## 라이선스

MIT
