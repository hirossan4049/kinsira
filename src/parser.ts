/**
 * HTML パーサー
 * シラバスシステムから取得したHTMLをパースして構造化データに変換
 */

import * as cheerio from 'cheerio';
import type { SyllabusResult, SyllabusDetail, ViewStateInfo } from './types.ts';
import { FORM_FIELDS } from './constants.ts';

/**
 * メンテナンスページかどうかをチェック
 */
export function isMaintenancePage(html: string): boolean {
  const $ = cheerio.load(html);
  const title = $('title').text();
  const body = $('body').text();

  return title.includes('メンテナンス') || body.includes('メンテナンス中');
}

/**
 * ViewState情報を抽出
 * ASP.NET WebFormsのセッション管理に必要な隠しフィールドを取得
 */
export function extractViewState(html: string): ViewStateInfo {
  const $ = cheerio.load(html);

  // メンテナンスページチェック
  if (isMaintenancePage(html)) {
    const maintenanceTime = $('#lblMaintenanceTime, [id*="MaintenanceTime"]').text().trim();
    throw new Error(
      `システムがメンテナンス中です。${maintenanceTime ? `メンテナンス時間: ${maintenanceTime}` : ''}`
    );
  }

  const viewstate = $(`#${FORM_FIELDS.VIEWSTATE}`).val() as string;
  const viewstateGenerator = $(`#${FORM_FIELDS.VIEWSTATE_GENERATOR}`).val() as string;
  const eventValidation = $(`#${FORM_FIELDS.EVENT_VALIDATION}`).val() as string;

  if (!viewstate || !viewstateGenerator || !eventValidation) {
    throw new Error('ViewState情報の取得に失敗しました');
  }

  return {
    __VIEWSTATE: viewstate,
    __VIEWSTATEGENERATOR: viewstateGenerator,
    __EVENTVALIDATION: eventValidation,
  };
}

/**
 * 検索結果リストをパース
 * 検索結果ページのHTMLから、シラバス一覧を抽出
 */
export function parseSearchResults(html: string): SyllabusResult[] {
  const $ = cheerio.load(html);
  const results: SyllabusResult[] = [];

  // 検索結果のテーブル（GridView）を探す
  // 実際のHTMLの構造に応じて調整が必要
  const gridView = $('#gvList, [id*="GridView"], table.SearchResultTbl');

  if (gridView.length === 0) {
    // 結果が見つからない場合は空配列を返す
    return results;
  }

  // 各行をパース
  gridView.find('tr').each((_, row) => {
    const $row = $(row);

    // ヘッダー行をスキップ
    if ($row.find('th').length > 0) {
      return;
    }

    const cells = $row.find('td');
    if (cells.length === 0) {
      return;
    }

    // シラバス番号をリンクから抽出（hrefにjavascript:syllabusopen('...')がある）
    const link = $row.find('a[href*="syllabusopen"]');
    const hrefAttr = link.attr('href') || '';
    let syllabusNo = '';

    const match = hrefAttr.match(/syllabusopen\('([^']+)'\)/);
    if (match) {
      syllabusNo = match[1];
    }

    // テーブル列: 学部, 学科, 科目名, 教員名, 開講年次, 単位, 開講期, 分野, 科目区分, 必修選択
    const result: SyllabusResult = {
      syllabusNo,
      kamokuMei: cells.eq(2).text().trim() || '',
      kyoinMei: cells.eq(3).text().trim() || '',
      gakubuGakka: `${cells.eq(0).text().trim()} ${cells.eq(1).text().trim()}`.trim(),
      nenzi: cells.eq(4).text().trim(),
      tani: cells.eq(5).text().trim(),
      kaikoki: cells.eq(6).text().trim(),
      kamokuKubun: cells.eq(8).text().trim(),
    };

    if (syllabusNo) {
      results.push(result);
    }
  });

  return results;
}

/**
 * シラバス詳細ページをパース
 * 詳細ページのHTMLから、授業の詳細情報を抽出
 */
export function parseSyllabusDetail(html: string): SyllabusDetail {
  const $ = cheerio.load(html);

  // 詳細情報を格納するオブジェクト
  const detail: SyllabusDetail = {
    syllabusNo: '',
    kamokuMei: '',
    kyoinMei: '',
  };

  // ラベルとデータのペアを探す
  // ASP.NETのテーブルレイアウトでは、ラベル（td）とデータ（td）が並んでいることが多い
  $('table tr').each((_, row) => {
    const $row = $(row);
    const cells = $row.find('td');

    if (cells.length >= 2) {
      const label = cells.eq(0).text().trim();
      const value = cells.eq(1).text().trim();

      // ラベルに基づいてフィールドを抽出
      if (label.includes('科目名')) {
        detail.kamokuMei = value;
      } else if (label.includes('教員名') || label.includes('担当者')) {
        detail.kyoinMei = value;
      } else if (label.includes('学部') || label.includes('学科')) {
        detail.gakubuGakka = value;
      } else if (label.includes('年次')) {
        detail.nenzi = value;
      } else if (label.includes('単位')) {
        detail.tani = value;
      } else if (label.includes('開講') || label.includes('期間')) {
        detail.kaikoki = value;
      } else if (label.includes('科目区分')) {
        detail.kamokuKubun = value;
      } else if (label.includes('目的') || label.includes('概要')) {
        detail.mokutekiGaiyo = value;
      } else if (label.includes('到達目標')) {
        detail.toutatsumokuhyo = value;
      } else if (label.includes('授業内容') || label.includes('授業計画')) {
        detail.jugyoNaiyo = value;
      } else if (label.includes('成績評価')) {
        detail.seisekiHyoka = value;
      } else if (label.includes('教科書')) {
        detail.kyokasho = value;
      } else if (label.includes('参考書')) {
        detail.sankosho = value;
      } else if (label.includes('履修') && label.includes('注意')) {
        detail.rishuChuui = value;
      } else if (label.includes('その他')) {
        detail.sonotaJoho = value;
      } else if (label.includes('備考')) {
        detail.biko = value;
      } else if (label.includes('シラバス番号') || label.includes('番号')) {
        detail.syllabusNo = value;
      }
    }
  });

  // span要素からも情報を抽出（ASP.NETのラベルコントロール）
  $('span[id*="Label"], span[id*="lbl"]').each((_, elem) => {
    const $elem = $(elem);
    const id = $elem.attr('id') || '';
    const text = $elem.text().trim();

    if (id.toLowerCase().includes('kamoku') && !detail.kamokuMei) {
      detail.kamokuMei = text;
    } else if (id.toLowerCase().includes('kyoin') && !detail.kyoinMei) {
      detail.kyoinMei = text;
    }
  });

  return detail;
}

/**
 * エラーメッセージを抽出
 * ページにエラーメッセージが含まれているかチェック
 */
export function extractErrorMessage(html: string): string | null {
  const $ = cheerio.load(html);

  // 一般的なエラーメッセージの要素を探す
  const errorElements = $(
    '.error, .alert, .warning, ' +
    '[class*="Error"], [class*="error"], ' +
    '[id*="Error"], [id*="error"]'
  );

  if (errorElements.length > 0) {
    return errorElements.first().text().trim();
  }

  return null;
}
