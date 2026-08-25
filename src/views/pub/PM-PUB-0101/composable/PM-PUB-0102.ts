import { computed, reactive, ref } from 'vue'
import { toast } from 'vue-sonner'
import { reasonOptions, typeOptions, type DiagnosisHistoryRow, type SelectOption } from './PM-PUB-0101'

/**
 * 간소화 상세(PM-PUB-0102) 팝업 상태.
 * useDiagnosisList() 가 이걸 펼쳐서 함께 내보내고, 팝업 컴포넌트는 DiagnosisListKey 로
 * inject 해서 같은 인스턴스를 쓴다. (PC-LPO-0701 의 팝업 구성과 같은 방식)
 */

/** 참고사항 지표 한 칸 — 라벨 · 등급 · 수치 */
export interface StatItem {
  label: string
  grade: string
  value: number
}

/** 예방자료 설문 한 문항 */
export interface SurveyQuestion {
  id: string
  text: string
}

/** 예방자료 한 묶음 — 대표 항목(종합) + 하위 문항 */
export interface SurveySection {
  id: string
  title: string
  questions: SurveyQuestion[]
}

/** 사진 슬롯 하나 */
export interface DetailPhoto {
  key: string
  label: string
  /** 미리보기 URL. null 이면 No Image */
  url: string | null
  /** 브라우저가 만든 blob URL 인지 — 교체·해제 시 revoke 대상 */
  isObjectUrl: boolean
  takenAt: string
}

/** 112사건 한 건 */
export interface IncidentRow {
  no: string
  content: string
}

export interface DiagnosisDetailForm {
  dept: string
  managementNo: string
  type: string
  diagnosedAt: string
  /** 현금다액업소 여부 — 'Y' | 'N' */
  cashIntensive: string
  reason: string
  addressRoad: string
  addressDetail: string
  bizName: string
  district: string
  /** 취약지역 판단 통보 여부 */
  notify: boolean
  notifyDept: string
  notifyStaff: string
  opinion: string
  note: string
  /** 설문 응답 — questionId → 1~10 */
  survey: Record<string, number | undefined>
}

/** '전체'는 검색 전용이라 상세 폼 셀렉트에서는 뺀다 */
const withoutAll = (options: SelectOption[]) => options.filter((option) => option.value !== 'all')

export const detailTypeOptions = withoutAll(typeOptions)
export const detailReasonOptions = withoutAll(reasonOptions)

export const notifyDeptOptions: SelectOption[] = [
  { label: '범죄예방계', value: 'prevention' },
  { label: '생활안전계', value: 'safety' },
  { label: '여성청소년계', value: 'youth' },
]

export const notifyStaffOptions: SelectOption[] = [
  { label: '홍길동', value: 'hong' },
  { label: '김철수', value: 'kim' },
]

/** 1~10 점 척도 */
export const surveyScale = Array.from({ length: 10 }, (_, index) => index + 1)

/** TODO: API 연동 전까지 쓰는 참고사항 지표 더미 */
export const crimeStats: StatItem[] = [
  { label: '강력/절도/폭력/지능범죄', grade: '보통', value: 618 },
  { label: '112신고(Code()/1/2)', grade: '보통', value: 8823 },
]

export const demographicStats: StatItem[] = [
  { label: '인구 밀도', grade: '보통', value: 6729 },
  { label: '지역 결속력', grade: '보통', value: 111 },
  { label: '기초생활수급자수', grade: '보통', value: 111 },
  { label: '1인가구 비율', grade: '위험', value: 0 },
  { label: '외국인 비율', grade: '양호', value: 0 },
  { label: '관리대상자수', grade: '위험', value: 0 },
  { label: '풍속업소 수', grade: '보통', value: 173 },
  { label: '설문조사 결과', grade: '보통', value: 0 },
]

export const surveySections: SurveySection[] = [
  {
    id: 'safety',
    title: '체감 안전도',
    questions: [
      {
        id: 'safety-1',
        text: '귀하는 지난 1년동안(재진단시3개월) 범죄 또는 범죄에 대한 두려움으로 일상활동이 어려운 적이 있었나요?',
      },
      { id: 'safety-2', text: '지난 1년동안(재진단시 3개월) 귀하의 지역사회가 더 안전해졌나요?' },
      { id: 'safety-3', text: '귀하의 지역사회는 타지역에 비해 안전하다고 생각하나요?' },
    ],
  },
  {
    id: 'awareness',
    title: '범죄예방의식도',
    questions: [
      {
        id: 'awareness-1',
        text: '귀하는 지역사회의 범죄예방 및 안전과 관련된 정보(카카오톡, SNS, 문자 등) 획득에 적극적인가요?',
      },
      {
        id: 'awareness-2',
        text: '귀하의 건물(또는 대상지)은 범죄로부터 안전하다고 생각하나요(출입문,방범창,경보장치,CCTV 등 고려)?',
      },
      { id: 'awareness-3', text: '귀하는 범죄예방을 위한 생활습관을 잘 알고 있나요?' },
    ],
  },
]

/** 112사건 목록 컬럼 (custom/table 의 TableWrapper 규격) */
export const incidentColumns = [
  { key: 'no', label: '사건번호', width: '20rem' },
  { key: 'content', label: '신고내용' },
]

const PHOTO_SLOTS: Array<Pick<DetailPhoto, 'key' | 'label'>> = [
  { key: 'weak-1', label: '취약상황사진 1' },
  { key: 'weak-2', label: '취약상황사진 2' },
  { key: 'improved-1', label: '개선상황사진 1' },
  { key: 'improved-2', label: '개선상황사진 2' },
]

function createPhotos(): DetailPhoto[] {
  // 화살표에 반환 타입을 붙여야 url: null 이 any 로 넓어지지 않는다(strictNullChecks 미사용 프로젝트)
  return PHOTO_SLOTS.map(
    (slot): DetailPhoto => ({ ...slot, url: null, isObjectUrl: false, takenAt: '2026-06-12' }),
  )
}

function createForm(): DiagnosisDetailForm {
  return {
    dept: '',
    managementNo: '',
    type: detailTypeOptions[0]?.value as string,
    diagnosedAt: '',
    cashIntensive: 'Y',
    reason: detailReasonOptions[0]?.value as string,
    addressRoad: '',
    addressDetail: '',
    bizName: '',
    district: '',
    notify: false,
    notifyDept: notifyDeptOptions[0].value as string,
    notifyStaff: '',
    opinion: '',
    note: '',
    survey: {},
  }
}

export function useDiagnosisDetail() {
  const detailOpen = ref(false)
  const detailForm = reactive<DiagnosisDetailForm>(createForm())
  const detailPhotos = ref<DetailPhoto[]>(createPhotos())
  /** 112사건 목록 — 등록 팝업(별도 화면)에서 채워질 자리 */
  const detailIncidents = ref<IncidentRow[]>([])

  /** 카드 제목 괄호에 붙는 유형명. 유형을 바꾸면 같이 바뀐다 */
  const detailTypeLabel = computed(
    () => detailTypeOptions.find((option) => option.value === detailForm.type)?.label ?? '',
  )

  function revokePhotoUrls() {
    detailPhotos.value.forEach((photo) => {
      if (photo.isObjectUrl && photo.url) URL.revokeObjectURL(photo.url)
    })
  }

  /**
   * 이력에서 고른 건으로 폼을 채우고 연다.
   * TODO: 실제로는 관리번호로 상세를 조회해 와야 한다.
   */
  function openDetail(row: DiagnosisHistoryRow) {
    revokePhotoUrls()
    Object.assign(detailForm, createForm(), {
      dept: '부산청 부산중부서 남포지구대',
      managementNo: String(2026000000 + row.no),
      diagnosedAt: row.diagnosedAt,
      bizName: row.bizName,
      addressRoad: row.address,
      addressDetail: '101호',
      district: '광희동',
      reason:
        detailReasonOptions.find((option) => option.label === row.reason)?.value ??
        (detailReasonOptions[0]?.value as string),
    })
    detailPhotos.value = createPhotos()
    detailIncidents.value = []
    detailOpen.value = true
  }

  function closeDetail() {
    detailOpen.value = false
  }

  /** 사진 교체 — 고른 파일을 미리보기로 걸고 이전 blob URL 은 회수한다 */
  function changePhoto(key: string, file: File) {
    const photo = detailPhotos.value.find((item) => item.key === key)
    if (!photo) return

    if (photo.isObjectUrl && photo.url) URL.revokeObjectURL(photo.url)
    photo.url = URL.createObjectURL(file)
    photo.isObjectUrl = true
    photo.takenAt = new Date().toISOString().slice(0, 10)
  }

  function removePhoto(key: string) {
    const photo = detailPhotos.value.find((item) => item.key === key)
    if (!photo) return

    if (photo.isObjectUrl && photo.url) URL.revokeObjectURL(photo.url)
    photo.url = null
    photo.isObjectUrl = false
  }

  function addIncident() {
    // TODO: 112신고 등록 팝업 연결
    toast.info('112신고 등록 화면은 준비 중입니다.')
  }

  function saveDetail() {
    // TODO: API 연동
    toast.success('저장되었습니다.')
    closeDetail()
  }

  return {
    detailOpen,
    detailForm,
    detailPhotos,
    detailIncidents,
    detailTypeLabel,
    openDetail,
    closeDetail,
    changePhoto,
    removePhoto,
    addIncident,
    saveDetail,
    revokePhotoUrls,
  }
}
