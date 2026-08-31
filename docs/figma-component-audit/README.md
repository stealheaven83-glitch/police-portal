# Figma 공통 컴포넌트 감사 및 생성 — 결과

작업일: 2026-08-28 (금)
Figma: `8mQz91txveSEKO0ky7Ck6V` / `❤️ Component (컴포넌트)` 페이지 `4869:207929`

## 이 폴더에 있는 것
- `MAPPING.md` — **먼저 볼 문서.** Figma 109개 ↔ 코드 202개 전수 매핑 + 판정 근거 + 가정
- `_raw-figma-components.json` — Figma 컴포넌트 413개 원본(재조회 불필요)
- `_component-page-digest.tsv` — Component 페이지 304개 요약(사용횟수·variant·nodeId)

## 요약
| | 개수 |
|---|---|
| Figma 퍼블리시 컴포넌트 | 413 |
| ㄴ Component 페이지 | 304 |
| ㄴㄴ 아이콘 130 / 모바일 24 / 희소 41 제외 → **분석 대상** | **109** |
| A 이미 있음(매핑만) | 36 |
| B 보강 필요(이번엔 손대지 않음) | 3 |
| **C 신규 생성** | **13 — 전부 완료** |
| D 대상외(전역 레이아웃·그리드·화면전용) | 54 |

## C 신규 생성 — 13/13 완료

확인 화면: 앱 실행 후 **`/component/new-components`** (라우터 등록됨, 제목 "Figma 신규 컴포넌트")

| 폴더 | 컴포넌트 | Figma 원본 |
|---|---|---|
| `custom/infobox` | InfoBox | infobox (343:54598) |
| `custom/list` | List, ListGroup | list (324:52107), list_group (727:14880) |
| `custom/empty` | NoData | No Data (10373:41131) |
| `custom/tag` | Tag, TagList | tag (306:26553), tag__list (1037:36138) |
| `custom/spinner` | Spinner | spinner (343:42756) |
| `custom/progress` | ProgressBar | progress_bar (4107:97921) |
| `custom/alert` | CriticalAlert (기존 폴더에 추가) | critical_alerts (343:54455) |
| `custom/disclosure` | Disclosure | disclosure (343:42471) |
| `custom/top-button` | TopButton | top_button (4171:163147) |
| `custom/contextual-help` | ContextualHelp, ContextualHelpTrigger | contextual_help (343:54748), _trigger (1249:53394) |
| `custom/chip` | Chip, ChipGroup | chip__single (317:5069), chip__multi (306:26726) |
| `custom/card` | Card | card (1496:30842) |
| `custom/address` | AddressInput | Adress input (10708:44187) |

### 검증
- `npx vue-tsc --noEmit -p tsconfig.app.json` — **신규 코드 오류 0건**
  (전체 29건은 전부 작업 전부터 있던 `src/views/**`의 TS6133 미사용 변수, 이 작업과 무관)
- `npx vite build` — **성공** (NewComponents 청크 29.55 kB)

### 판단이 필요했던 곳 — 멈추지 않고 진행한 뒤 여기 적어 둠
1. **AddressInput** — 우편번호 API가 저장소에 없다(`daum`/`kakao`/`juso` 검색 0건).
   `@search` 이벤트만 내보내고 팝업 연결은 화면 몫으로 뒀다. PM-PUB-0103의
   `NewDiagnosisDialog.vue`에 인라인으로 있던 조합을 그대로 뽑아낸 것이라 그 화면부터
   이 컴포넌트로 교체할 수 있다 — **아직 교체하지 않았다**(다른 사람 작업 파일이라 손대지 않음).
2. **ContextualHelpTrigger** — Figma `Type(3)` 3종의 구분을 확인하지 못해 label 유무로 갈음했다.
3. **InfoBox 구분선** — Figma가 SVG 이미지로 내보내는데 점선이라 `border-dotted`로 대체했다.
4. **Spinner medium(32px)** — 원본이 별도 SVG라 굵기를 3으로 보간했다. large/small은 원본 값 그대로.
5. **Chip size 철자** — Figma는 `samll`(오타)인데 코드는 `small`로 바로잡았다.
6. **Card** — boolean variant 8개를 각각 prop으로 두는 대신 슬롯 유무로 판단하게 했다.
7. **없는 색 토큰** — `#d6e0eb`는 police-style.css에 대응 토큰이 없어 hex를 그대로 썼다
   (선례: `Badge.vue`의 `#fff6e5`).

## 이름이 비슷해 헷갈리는 것 — 구분 기준
새로 만든 것 중 기존 컴포넌트와 이름이 겹쳐 보이는 3쌍. 각 `index.ts` 주석에도 같은 내용이 있다.

- **Badge vs Tag** — Badge는 상태 표시(읽기 전용), Tag는 누르거나 지울 수 있는 키워드.
- **FilterChip vs Chip** — FilterChip은 목록 위에 얹어 "선택하면 걸러지는" 둥근 토글(개수 표시),
  Chip은 폼 안에서 값을 고르는 입력 컨트롤(체크 시 파란 테두리 + 체크 아이콘).
- **Alert vs InfoBox vs CriticalAlert** — Alert은 결과/경고, InfoBox는 설명 덧붙임,
  CriticalAlert은 좌측 색 배지("긴급"/"안전"/"안내") + "자세히보기"가 붙은 공지 띠.
- **Accordion vs Disclosure** — Accordion은 테두리 있는 여러 항목 묶음, Disclosure는 테두리 없이
  한 덩어리만 여닫는 "더보기".

## 2차 배치 (2026-08-31) — B 검증 및 보강

**08-28의 "B 3건"은 검증한 수가 아니라 의심 목록이었다.** 08-31에 실제로 props를 대조했다.
자세한 근거는 `MAPPING.md`의 B절에 있고, 결과만 옮기면:

- **갭 아님 5건** — `button`, `file_upload`, `search__pc`, `tooltip__plan`, `tooltip__rich`
  (그중 `search__pc`는 애초에 `SearchWrapper`로 매핑한 게 오류였다. 헤더 통합검색이고
  `PortalHeader.vue`에 이미 구현돼 있다.)
- **보강 2건 완료** — `tabs`에 `tone` 축 추가, `switch`에 `xl` 크기 추가
- **C로 재분류 1건** — `select_text`는 `ui/native-select`가 아니라 테두리 없는 텍스트형
  셀렉트였다. 신규 생성 → `custom/select/TextSelect.vue`

### 기존 화면이 깨지지 않게 한 방법
`tab`은 여러 화면이 쓰고 있어서 **덮어쓰지 않는 축**으로 넣었다. `tone`의 기본값 `inherit`는
클래스를 하나도 추가하지 않아 기존 렌더 결과가 완전히 동일하다. 새 화면에서만
`tone="primary"` / `tone="secondary"`로 명시해 쓴다. `switch`의 `xl`도 순수 추가라
`default`/`lg`는 그대로다. (`type`이 아니라 `tone`인 이유: `type`은 `<button>`의 네이티브
속성이라 reka-ui가 그대로 DOM에 흘려보낸다.)

토큰 정리도 같이 했다 — `tabs/index.ts`의 하드코딩 hex 6종(`#023F88` `#0054A6` `#CDD1D5`
`#EEF2F7` `#464C53` `#B1B8BE`)을 **값이 완전히 같은** `police-style.css` 토큰으로 교체했다.
색이 바뀌지 않는 치환이다.

## 3차 배치 (2026-08-31) — 중복된 라벨-값 시스템 제거

`FlexCol`에 `type="title"/"value"`가 있어서 **라벨-값 표를 만드는 방법이 두 가지**였다
(`InfoTable`+`InfoField` 17개 화면 vs `FlexCol type=` 1개 화면). 실제로 `PC-LPO-0701`의 상세
팝업 6개 중 `EquipmentDetailDialog` 하나만 다른 방식으로 만들어져 있었다 — 같은 화면군 안에서
구현이 갈린 상태였다.

- `InfoTable`에 `columns: 3 | 4` 추가(기존 1·2에서 확장). `.cols3`/`.cols4` CSS.
  반응형은 `@media (max-width: 62.5rem)`가 `.grid`에 걸려 있어 3·4열도 자동으로 1열이 된다.
- `EquipmentDetailDialog`를 형제 5개와 같은 `InfoTable`+`InfoField` 형태로 이관
  (필드 11개·순서·전체폭 5개·필수표시 8개 대조 확인)
- `FlexCol`에서 `type`/`layout`/`for`/`required` prop과 관련 CSS 제거 →
  `FlexRow`/`FlexCol`은 **자유 배치 전용** 레이아웃 프리미티브로 남겼다
- 경계는 `component-guide.md` §4에 명시했다

> 이 과정에서 `FlexGrid.vue`(여러 FlexRow를 감싸는 wrapper)를 만들었다가 되돌렸다.
> `.row`가 `flex-wrap: wrap`이라 **한 FlexRow 안에서 size 합이 12를 넘으면 알아서 줄이 바뀐다** —
> 줄마다 wrapper를 둘 이유가 없었다. 같은 판단을 반복하지 않도록 남겨 둔다.

## 아직 안 한 것
- **아이콘 130개 미매핑** — `custom/icon/icons.ts`에 현재 6개만 등록돼 있다.
- **모바일 전용 24개(`__mo`)** — 반응형 파일이라 PC/모바일 2벌이다. 지역경찰 페이지 화면 91장 중
  16장이 `MO_`다. 24개 중 8개는 사용 0회(KRDS 잔재). MO 화면 작업 시작 시 별도 배치.
- **`select_text`의 State 네 번째 값** — Figma에서 이름이 `select_text`(컴포넌트명과 동일)라
  의미가 불명확해 "선택 완료"로 보고 `selected`로 옮겼다. 디자인 확인 필요.
- **기존 화면 교체 안 함** — 새 컴포넌트로 바꿀 수 있는 인라인 구현이 몇 군데 있으나
  동시 작업 중인 파일이라 건드리지 않았다.

## 다음 세션이 이어받는 법
1. `_raw-figma-components.json`에서 대상 nodeId 확인
2. `get_design_context(fileKey, nodeId)` — **호출 전 `skill://figma/figma-design-to-code/SKILL.md` 필독**
3. house style: 폴더당 `index.ts`(cva + 한글 설명 주석) + `.vue`(`cn()` 사용).
   기준 파일은 `custom/alert/`, `custom/badge/`. 아이콘은 `lucide-vue-next`.
4. 루트 폰트 10px — Figma 15px = `text-[1.5rem]`, 17px = `text-[1.7rem]`, 19px = `text-[1.9rem]`
5. 색은 `police-style.css` 토큰 우선, 없을 때만 hex
6. 화면(`views/**`)에는 테일윈드 유틸 금지 — `style/*.module.css`에 이름 있는 클래스로
   (`NewComponents.vue` + `style/NewComponents.module.css`가 그 예)
