/**
 * 차량 일일점검 팝업(PC-LPO-0303) — 점검 항목과 폼 값.
 * Figma 15116:130172: 구역 3개(차량 외부 상태 / 차량 내부 상태 / 탑재 장비 등), 2열 표, 항목마다 라디오 두 개.
 */

export interface InspectionOption {
  label: string
  value: string
}

export interface InspectionItem {
  /** 폼 status 의 키. 빈 문자열이면 표의 칸을 맞추기 위한 빈 칸(시안 3행 오른쪽) */
  key: string
  label: string
  options: InspectionOption[]
}

export interface InspectionSection {
  title: string
  /** 2열 표에 왼쪽·오른쪽 번갈아 놓이는 순서 그대로 */
  items: InspectionItem[]
}

const GOOD_BAD: InspectionOption[] = [
  { label: '양호', value: 'good' },
  { label: '불량', value: 'bad' },
]

/** 시안 순서 그대로(왼쪽 열 → 오른쪽 열 순으로 한 행씩). 빈 칸은 key '' */
export const inspectionSections: InspectionSection[] = [
  {
    title: '차량 외부 상태',
    items: [
      { key: 'body', label: '외부차체', options: GOOD_BAD },
      { key: 'lighting', label: '동화장치', options: GOOD_BAD },
      { key: 'tire', label: '타이어', options: GOOD_BAD },
      { key: 'engine', label: '엔진', options: GOOD_BAD },
      { key: 'coolant', label: '냉각수', options: GOOD_BAD },
      { key: '', label: '', options: [] },
    ],
  },
  {
    title: '차량 내부 상태',
    items: [
      { key: 'ignition', label: '시동', options: GOOD_BAD },
      { key: 'fuel', label: '연료량', options: GOOD_BAD },
      { key: 'gauges', label: '각종계기', options: GOOD_BAD },
      { key: 'radio', label: '무전기', options: GOOD_BAD },
      { key: 'rearLock', label: '뒷문잠금장치', options: GOOD_BAD },
      { key: '', label: '', options: [] },
    ],
  },
  {
    title: '탑재 장비 등',
    items: [
      { key: 'equipment', label: '탑재장비', options: GOOD_BAD },
      { key: 'tools', label: '휴대공구', options: GOOD_BAD },
      {
        key: 'wash',
        label: '세차',
        options: [
          { label: '세차', value: 'washed' },
          { label: '미세차', value: 'unwashed' },
        ],
      },
      // 시안 라벨은 '기티'(오타) — '기타' 로 읽었다
      { key: 'etc', label: '기타', options: GOOD_BAD },
    ],
  },
]

export interface VehicleInspectionForm {
  /** 시작/종료 주행거리(Km) — 문자열로 받는다(숫자 검사는 개발팀 몫) */
  kmStart: string
  kmEnd: string
  /** 항목 키 → 고른 값('' 이면 미선택) */
  status: Record<string, string>
  /** 고장 및 수리내역 */
  note: string
}

export function createEmptyInspectionForm(): VehicleInspectionForm {
  const status: Record<string, string> = {}
  for (const section of inspectionSections) {
    for (const item of section.items) if (item.key) status[item.key] = ''
  }
  return { kmStart: '', kmEnd: '', status, note: '' }
}
