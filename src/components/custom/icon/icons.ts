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
}

export type IconName = keyof typeof icons
