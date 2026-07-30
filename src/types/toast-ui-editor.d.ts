/**
 * @toast-ui/editor 3.2.x 는 자체 타입 선언을 포함하지만(types/index.d.ts),
 * package.json 의 "exports" 필드에 "types" 조건이 없어
 * moduleResolution: bundler 환경에서 선언 파일을 찾지 못한다(TS7016).
 * 번들 타입을 재노출해 타입 안정성을 유지하기 위한 shim.
 */
declare module '@toast-ui/editor' {
  export * from '@toast-ui/editor/types/index'
  import Editor from '@toast-ui/editor/types/index'
  export default Editor
}

/** i18n 언어팩(부수효과 import)은 타입 선언이 없으므로 모듈 shim 처리 */
declare module '@toast-ui/editor/dist/i18n/ko-kr'
