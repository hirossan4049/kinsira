/**
 * 近畿大学シラバス検索ライブラリ
 * @packageDocumentation
 */

// メインクライアントのエクスポート
export { KindaiSyllabusClient } from './client.ts';

// 型定義のエクスポート
export type {
  GakubuCode,
  SortOrder,
  Nenzi,
  Tani,
  Kaikoki,
  Bunya,
  KamokuKubun,
  SearchParams,
  SyllabusResult,
  SyllabusDetail,
  ViewStateInfo,
} from './types.ts';

// 定数のエクスポート
export {
  BASE_URL,
  SEARCH_PAGE_URL,
  DETAIL_PAGE_URL,
  GAKUBU_NAMES,
} from './constants.ts';

// パーサー関数のエクスポート（高度な使用ケース向け）
export {
  isMaintenancePage,
  extractViewState,
  parseSearchResults,
  parseSyllabusDetail,
  extractErrorMessage,
} from './parser.ts';
