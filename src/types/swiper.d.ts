/**
 * 퍼블리싱 원본에서 가져온 swiper-bundle.min.js 는 index.html 에서
 * 일반 <script> 로 로드되어 전역 Swiper 를 노출한다. (npm 패키지 미사용)
 */
export {}

declare global {
  interface SwiperInstance {
    destroy(deleteInstance?: boolean, cleanStyles?: boolean): void
    [key: string]: any
  }

  interface SwiperConstructor {
    new (selector: string | HTMLElement, options?: Record<string, any>): SwiperInstance
  }

  interface Window {
    Swiper?: SwiperConstructor
  }
}
