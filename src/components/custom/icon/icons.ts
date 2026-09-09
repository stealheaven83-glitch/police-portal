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

// Figma icon/system-info — 채워진 원 안의 i. currentColor 라 글자색을 따라간다
import SystemInfoIcon from '@/assets/images/icons/systemInfo.svg?component'


export const icons = {
  search: SearchIcon,
  calendar: CalendarIcon,
  closePop: ClosePopIcon,
  arrowDown: ArrowDownIcon,
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
}

export type IconName = keyof typeof icons
