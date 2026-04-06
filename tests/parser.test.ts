/**
 * パーサーのテスト
 */

import { describe, test, expect } from 'bun:test';
import { extractViewState, parseSearchResults, parseSyllabusDetail } from '../src/parser.ts';

describe('extractViewState', () => {
  test('ViewState情報を正しく抽出できる', () => {
    const html = `
      <html>
        <body>
          <form>
            <input type="hidden" id="__VIEWSTATE" value="test_viewstate" />
            <input type="hidden" id="__VIEWSTATEGENERATOR" value="test_generator" />
            <input type="hidden" id="__EVENTVALIDATION" value="test_validation" />
          </form>
        </body>
      </html>
    `;

    const result = extractViewState(html);

    expect(result.__VIEWSTATE).toBe('test_viewstate');
    expect(result.__VIEWSTATEGENERATOR).toBe('test_generator');
    expect(result.__EVENTVALIDATION).toBe('test_validation');
  });

  test('ViewState情報が不足している場合はエラーを投げる', () => {
    const html = '<html><body></body></html>';

    expect(() => extractViewState(html)).toThrow('ViewState情報の取得に失敗しました');
  });
});

describe('parseSearchResults', () => {
  test('検索結果が空の場合は空配列を返す', () => {
    const html = '<html><body><p>検索結果がありません</p></body></html>';

    const results = parseSearchResults(html);

    expect(results).toEqual([]);
  });

  test('検索結果テーブルから情報を抽出できる', () => {
    const html = `
      <html>
        <body>
          <table id="gvList">
            <tr>
              <th>科目名</th>
              <th>教員名</th>
            </tr>
            <tr>
              <td><a onclick="syllabusopen('12345')">プログラミング基礎</a></td>
              <td>山田太郎</td>
              <td>情報学部</td>
              <td>1年次</td>
              <td>2単位</td>
              <td>前期</td>
              <td>専門科目</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const results = parseSearchResults(html);

    expect(results.length).toBe(1);
    expect(results[0]?.syllabusNo).toBe('12345');
    expect(results[0]?.kamokuMei).toContain('プログラミング基礎');
    expect(results[0]?.kyoinMei).toBe('山田太郎');
  });
});

describe('parseSyllabusDetail', () => {
  test('詳細情報を抽出できる', () => {
    const html = `
      <html>
        <body>
          <table>
            <tr>
              <td>科目名</td>
              <td>プログラミング基礎</td>
            </tr>
            <tr>
              <td>教員名</td>
              <td>山田太郎</td>
            </tr>
            <tr>
              <td>授業の目的・概要</td>
              <td>プログラミングの基礎を学ぶ</td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const detail = parseSyllabusDetail(html);

    expect(detail.kamokuMei).toBe('プログラミング基礎');
    expect(detail.kyoinMei).toBe('山田太郎');
    expect(detail.mokutekiGaiyo).toBe('プログラミングの基礎を学ぶ');
  });

  test('情報が不足している場合でも基本構造を返す', () => {
    const html = '<html><body></body></html>';

    const detail = parseSyllabusDetail(html);

    expect(detail).toHaveProperty('syllabusNo');
    expect(detail).toHaveProperty('kamokuMei');
    expect(detail).toHaveProperty('kyoinMei');
  });
});
