/**
 * クライアントのテスト
 */

import { describe, test, expect } from 'bun:test';
import { KindaiSyllabusClient } from '../src/client.ts';

describe('KindaiSyllabusClient', () => {
  test('クライアントを作成できる', () => {
    const client = new KindaiSyllabusClient();
    expect(client).toBeInstanceOf(KindaiSyllabusClient);
  });

  test('resetSessionでセッションをリセットできる', () => {
    const client = new KindaiSyllabusClient();
    client.resetSession();
    // エラーが発生しないことを確認
    expect(true).toBe(true);
  });

  // 注意: 以下のテストは実際のネットワークリクエストを行うため、
  // 環境によっては失敗する可能性があります

  test.skip('search() - 実際の検索が動作する（統合テスト）', async () => {
    const client = new KindaiSyllabusClient();

    // 情報学部で検索
    const results = await client.search({
      gakubuCode: '11N',
    });

    expect(Array.isArray(results)).toBe(true);
    // 結果が返ってくることを期待（空の可能性もあり）
    console.log(`検索結果: ${results.length}件`);
  }, 30000); // タイムアウト30秒

  test.skip('getDetail() - 詳細情報を取得できる（統合テスト）', async () => {
    const client = new KindaiSyllabusClient();

    // まず検索して、最初の結果の詳細を取得
    const results = await client.search({
      gakubuCode: '11N',
    });

    if (results.length > 0 && results[0]) {
      const detail = await client.getDetail(results[0].syllabusNo);
      expect(detail).toHaveProperty('kamokuMei');
      expect(detail.syllabusNo).toBe(results[0].syllabusNo);
      console.log('詳細情報:', detail);
    }
  }, 30000);
});
