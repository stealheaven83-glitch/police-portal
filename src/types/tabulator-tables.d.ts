/**
 * tabulator-tables 6.5.x 는 이 버전에서 자체 타입 선언(.d.ts)을 포함하지 않는다.
 * vue-tsc 빌드 시 TS7016(선언 파일 없음) 에러를 막기 위한 모듈 shim.
 * 본문을 비워두면 모듈 전체가 any 로 취급된다.
 */
declare module 'tabulator-tables'
