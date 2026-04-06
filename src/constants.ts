/**
 * 近畿大学シラバスシステムの定数定義
 */

import type { GakubuCode } from './types.ts';

/**
 * シラバス検索システムのベースURL
 */
export const BASE_URL = 'https://syllabus.itp.kindai.ac.jp/customer/Form';

/**
 * 検索ページのURL
 */
export const SEARCH_PAGE_URL = `${BASE_URL}/sy01000.aspx`;

/**
 * 詳細ページのURL
 */
export const DETAIL_PAGE_URL = `${BASE_URL}/SY01010.aspx`;

/**
 * 学部コードと学部名のマッピング
 */
export const GAKUBU_NAMES: Record<GakubuCode, string> = {
  '111': '法学部',
  '113': '経済学部',
  '114': '経営学部',
  '115': '理工学部',
  '116': '薬学部',
  '117': '農学部',
  '118': '文芸学部',
  '119': '医学部',
  '11A': '生物理工学部',
  '11B': '工学部',
  '11D': '産業理工学部',
  '11F': '総合社会学部',
  '11G': '建築学部',
  '11M': '国際学部',
  '11N': '情報学部',
  '11P': '看護学部',
  '21C': '総合文化研究科',
  '21G': '実学社会起業イノベーション学位プログラム',
  '21H': '建築学研究科',
  '21J': '情報学研究科',
  '221': '医学研究科',
  '231': '法学研究科',
  '232': '商学研究科',
  '233': '経済学研究科',
  '236': '総合理工学研究科',
  '237': '薬学研究科',
  '238': '農学研究科',
  '239': '生物理工学研究科',
  '23B': '産業理工学研究科',
  '23C': 'システム工学研究科',
  '251': '法科大学院',
  '311': '短期大学部',
  '411': '通信教育部',
  'Z11': '共通教養',
  'Z13': '外国語',
  'Z15': '教職課程',
  'Z17': '司書課程',
  'Z19': '生涯スポーツ',
  'Z26': '',
  'Z28': '',
};

/**
 * フォームフィールド名の定数
 */
export const FORM_FIELDS = {
  GAKUBU: 'dropDownListGakubu',
  KAMOKU_MEI: 'txtJoukenKamokuMei',
  KYOIN_MEI: 'txtJoukenKyoinMei',
  KEYWORD: 'txtJoukenKeyword',
  SORT: 'dropDownSort',
  SEARCH_BUTTON: 'btnSearch',
  VIEWSTATE: '__VIEWSTATE',
  VIEWSTATE_GENERATOR: '__VIEWSTATEGENERATOR',
  EVENT_VALIDATION: '__EVENTVALIDATION',
  EVENT_TARGET: '__EVENTTARGET',
  EVENT_ARGUMENT: '__EVENTARGUMENT',
} as const;

/**
 * 年次のチェックボックス名プレフィックス
 */
export const NENZI_PREFIX = 'cbNEZ_';

/**
 * 単位数のチェックボックス名プレフィックス
 */
export const TANI_PREFIX = 'cbTNI_';

/**
 * 開講期間のチェックボックス名プレフィックス
 */
export const KAIKOKI_PREFIX = 'cbKKK_';

/**
 * 分野のチェックボックス名プレフィックス
 */
export const BUNYA_PREFIX = 'cbBNY_';

/**
 * 科目区分のチェックボックス名プレフィックス
 */
export const KAMOKU_KUBUN_PREFIX = 'cbKKB_';

/**
 * HTTPリクエストのデフォルトヘッダー
 */
export const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
  'Content-Type': 'application/x-www-form-urlencoded',
} as const;
