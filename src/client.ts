/**
 * 近畿大学シラバス検索クライアント
 */

import type {
  SearchParams,
  SyllabusResult,
  SyllabusDetail,
  ViewStateInfo,
} from './types.ts';
import {
  SEARCH_PAGE_URL,
  DETAIL_PAGE_URL,
  FORM_FIELDS,
  DEFAULT_HEADERS,
  NENZI_PREFIX,
  TANI_PREFIX,
  KAIKOKI_PREFIX,
  BUNYA_PREFIX,
  KAMOKU_KUBUN_PREFIX,
} from './constants.ts';
import {
  extractViewState,
  parseSearchResults,
  parseSyllabusDetail,
  extractErrorMessage,
} from './parser.ts';

/**
 * 近畿大学シラバス検索クライアント
 */
export class KindaiSyllabusClient {
  private viewState: ViewStateInfo | null = null;
  private cookies: string = '';

  /**
   * シラバスを検索
   * @param params 検索パラメータ
   * @returns 検索結果の配列
   */
  async search(params: SearchParams = {}): Promise<SyllabusResult[]> {
    // まず検索ページにアクセスしてViewStateを取得
    await this.initializeSession();

    if (!this.viewState) {
      throw new Error('セッションの初期化に失敗しました');
    }

    // フォームデータを構築
    const formData = this.buildSearchFormData(params);

    // 検索リクエストを送信（セッションCookieを含める）
    const response = await fetch(SEARCH_PAGE_URL, {
      method: 'POST',
      headers: {
        ...DEFAULT_HEADERS,
        ...(this.cookies ? { Cookie: this.cookies } : {}),
      },
      body: new URLSearchParams(formData).toString(),
    });

    if (!response.ok) {
      throw new Error(`検索リクエストが失敗しました: ${response.status}`);
    }

    const html = await response.text();

    // エラーメッセージをチェック
    const errorMessage = extractErrorMessage(html);
    if (errorMessage) {
      throw new Error(`検索エラー: ${errorMessage}`);
    }

    // 検索結果をパース
    const results = parseSearchResults(html);

    // ViewStateを更新（次のリクエストのため）
    try {
      this.viewState = extractViewState(html);
    } catch {
      // ViewStateの更新に失敗しても検索結果は返す
    }

    return results;
  }

  /**
   * シラバスの詳細情報を取得
   * @param syllabusNo シラバス番号
   * @returns シラバス詳細情報
   */
  async getDetail(syllabusNo: string): Promise<SyllabusDetail> {
    const url = `${DETAIL_PAGE_URL}?syllabusno=${encodeURIComponent(syllabusNo)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': undefined,
      },
    });

    if (!response.ok) {
      throw new Error(`詳細情報の取得に失敗しました: ${response.status}`);
    }

    const html = await response.text();

    // エラーメッセージをチェック
    const errorMessage = extractErrorMessage(html);
    if (errorMessage) {
      throw new Error(`詳細取得エラー: ${errorMessage}`);
    }

    // 詳細情報をパース
    const detail = parseSyllabusDetail(html);
    detail.syllabusNo = syllabusNo;

    return detail;
  }

  /**
   * セッションを初期化（ViewStateを取得）
   * @private
   */
  private async initializeSession(): Promise<void> {
    const response = await fetch(SEARCH_PAGE_URL, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_HEADERS['User-Agent'],
        'Accept': DEFAULT_HEADERS['Accept'],
        'Accept-Language': DEFAULT_HEADERS['Accept-Language'],
      },
    });

    if (!response.ok) {
      throw new Error(`セッション初期化に失敗しました: ${response.status}`);
    }

    // セッションCookieを保存
    const setCookies = response.headers.getSetCookie?.() ?? [];
    if (setCookies.length > 0) {
      this.cookies = setCookies.map(c => c.split(';')[0]).join('; ');
    }

    const html = await response.text();
    this.viewState = extractViewState(html);
  }

  /**
   * 検索フォームデータを構築
   * @private
   */
  private buildSearchFormData(params: SearchParams): Record<string, string> {
    const formData: Record<string, string> = {
      [FORM_FIELDS.VIEWSTATE]: this.viewState!.__VIEWSTATE,
      [FORM_FIELDS.VIEWSTATE_GENERATOR]: this.viewState!.__VIEWSTATEGENERATOR,
      [FORM_FIELDS.EVENT_VALIDATION]: this.viewState!.__EVENTVALIDATION,
      [FORM_FIELDS.EVENT_TARGET]: '',
      [FORM_FIELDS.EVENT_ARGUMENT]: '',
    };

    // 学部コード
    if (params.gakubuCode) {
      formData[FORM_FIELDS.GAKUBU] = params.gakubuCode;
    }

    // 科目名
    if (params.kamokuMei) {
      formData[FORM_FIELDS.KAMOKU_MEI] = params.kamokuMei;
    }

    // 教員名
    if (params.kyoinMei) {
      formData[FORM_FIELDS.KYOIN_MEI] = params.kyoinMei;
    }

    // キーワード
    if (params.keyword) {
      formData[FORM_FIELDS.KEYWORD] = params.keyword;
    }

    // ソート順
    if (params.sort) {
      formData[FORM_FIELDS.SORT] = params.sort;
    }

    // 年次（チェックボックス）
    if (params.nenzi) {
      for (const nenzi of params.nenzi) {
        const fieldName = `${NENZI_PREFIX}${nenzi.padStart(4, '0')}`;
        formData[fieldName] = 'on';
      }
    }

    // 単位数（チェックボックス）
    if (params.tani) {
      for (const tani of params.tani) {
        const fieldName = `${TANI_PREFIX}${tani.padStart(4, '0')}`;
        formData[fieldName] = 'on';
      }
    }

    // 開講期間（チェックボックス）
    if (params.kaikoki) {
      for (const kaikoki of params.kaikoki) {
        const fieldName = `${KAIKOKI_PREFIX}${kaikoki.padStart(3, '0')}`;
        formData[fieldName] = 'on';
      }
    }

    // 分野（チェックボックス）
    if (params.bunya) {
      for (const bunya of params.bunya) {
        const fieldName = `${BUNYA_PREFIX}${bunya.padStart(3, '0')}`;
        formData[fieldName] = 'on';
      }
    }

    // 科目区分（チェックボックス）
    if (params.kamokuKubun) {
      for (const kubun of params.kamokuKubun) {
        const fieldName = `${KAMOKU_KUBUN_PREFIX}${kubun.padStart(3, '0')}`;
        formData[fieldName] = 'on';
      }
    }

    // 検索ボタン
    formData[FORM_FIELDS.SEARCH_BUTTON] = '検索';

    return formData;
  }

  /**
   * ViewStateをリセット（新しいセッションを開始）
   */
  resetSession(): void {
    this.viewState = null;
    this.cookies = '';
  }
}
