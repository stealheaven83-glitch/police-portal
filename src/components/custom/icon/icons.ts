// src/components/custom/icon/icons.ts
import SearchIcon from '@/assets/images/icons/search.svg?component'
import ClosePopIcon from '@/assets/images/icons/closePop.svg?component'
import CalendarIcon from '@/assets/images/icons/calendar.svg?component'
import ArrowDownIcon from '@/assets/images/icons/arrowDown.svg?component'
import ArrowRightIcon from '@/assets/images/icons/arrowRight.svg?component'
import ArrowNextIcon from '@/assets/images/icons/arrowNext.svg?component'
import ArrowLeftIcon from '@/assets/images/icons/arrowLeft.svg?component'
import ArrowTopIcon from '@/assets/images/icons/arrowTop.svg?component'
import MenuIcon from '@/assets/images/icons/menu.svg?component'
// Figma icon/annotation — 말풍선 + 물음표(도움말). 말풍선만 currentColor 라 글자색을 따라간다
import AnnotationIcon from '@/assets/images/icons/annotation.svg?component'
import StarIcon from '@/assets/images/icons/star.svg?component'
import StarFillIcon from '@/assets/images/icons/starFill.svg?component'
import AttachIcon from '@/assets/images/icons/attach.svg?component'
// Figma icon/Check — 표에서 "해당됨"을 뜻하는 체크 표시(근무일지 인수인계 열 등)
import CheckIcon from '@/assets/images/icons/check.svg?component'
import ShareIcon from '@/assets/images/icons/share.svg?component'
// Figma file_upload__atomic__pc 의 '삭제' 옆 아이콘 — 회색 원 + x
import DeleteCircleIcon from '@/assets/images/icons/deleteCircle.svg?component'

// Figma icon/arrow-drop-down — 속이 찬 삼각형. 좌우 화살표는 이걸 90도 돌려 쓴다
import ArrowDropDownIcon from '@/assets/images/icons/arrowDropDown.svg?component'

// Figma icon/system-info — 채워진 원 안의 i. currentColor 라 글자색을 따라간다
import SystemInfoIcon from '@/assets/images/icons/systemInfo.svg?component'

// Figma icon/Minus · icon/Plus — 사이트맵(Menu)의 하위메뉴 접기/펼치기 토글
import MinusIcon from '@/assets/images/icons/minus.svg?component'
import PlusIcon from '@/assets/images/icons/plus.svg?component'
// Figma icon/open-new-window — 외부 사이트로 나가는 링크 표시(새 창)
import OpenNewWindowIcon from '@/assets/images/icons/openNewWindow.svg?component'

// Figma icon/inquiry — 말풍선 안에 점 3개(댓글/답글 수). currentColor 라 글자색을 따라간다
import InquiryIcon from '@/assets/images/icons/inquiry.svg?component'

// Figma (댓글 영역 대댓글 화살표) — 답글임을 표시하는 꺾인 연결선. #CDD1D5 고정색
import ReplyArrowIcon from '@/assets/images/icons/replyArrow.svg?component'

// Figma (댓글 "..." 팝오버 메뉴) — 수정(연필) / 삭제(휴지통)
import EditIcon from '@/assets/images/icons/edit.svg?component'
import TrashIcon from '@/assets/images/icons/trash.svg?component'
// Figma icon/ellipsis_vertical — 세로 점 3개(댓글 "..." 메뉴 트리거). 24×24 프레임 기준, currentColor 라 글자색을 따라간다
import EllipsisVerticalIcon from '@/assets/images/icons/ellipsisVertical.svg?component'


export const icons = {
  search: SearchIcon,
  calendar: CalendarIcon,
  closePop: ClosePopIcon,
  arrowDown: ArrowDownIcon,
  arrowDropDown: ArrowDropDownIcon,
  arrowRight: ArrowRightIcon,
  arrowNext: ArrowNextIcon,
  arrowLeft: ArrowLeftIcon,
  arrowTop: ArrowTopIcon,
  menu: MenuIcon,
  annotation: AnnotationIcon,
  star: StarIcon,
  starFill: StarFillIcon,
  attach: AttachIcon,
  check: CheckIcon,
  share: ShareIcon,
  deleteCircle: DeleteCircleIcon,
  systemInfo: SystemInfoIcon,
  minus: MinusIcon,
  plus: PlusIcon,
  openNewWindow: OpenNewWindowIcon,
  inquiry: InquiryIcon,
  replyArrow: ReplyArrowIcon,
  edit: EditIcon,
  trash: TrashIcon,
  ellipsisVertical: EllipsisVerticalIcon,
}

export type IconName = keyof typeof icons
