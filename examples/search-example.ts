/**
 * 近畿大学シラバス検索ライブラリの使用例
 */

import { KindaiSyllabusClient, GAKUBU_NAMES } from '../src/index.ts';

async function main() {
  // クライアントを作成
  const client = new KindaiSyllabusClient();

  console.log('=== 近畿大学シラバス検索 ===\n');

  // 例1: 学部で検索
  console.log('【例1】情報学部のシラバスを検索');
  try {
    const results1 = await client.search({
      gakubuCode: '11N', // 情報学部
    });

    console.log(`検索結果: ${results1.length}件`);
    console.log('最初の5件:');
    results1.slice(0, 5).forEach((result, index) => {
      console.log(`${index + 1}. ${result.kamokuMei} (${result.kyoinMei})`);
      console.log(`   年次: ${result.nenzi}, 単位: ${result.tani}, 期間: ${result.kaikoki}`);
    });
  } catch (error) {
    console.error('検索エラー:', error);
  }

  console.log('\n---\n');

  // 例2: 科目名で検索
  console.log('【例2】"プログラミング"を含む科目を検索');
  try {
    const results2 = await client.search({
      kamokuMei: 'プログラミング',
    });

    console.log(`検索結果: ${results2.length}件`);
    results2.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. ${result.kamokuMei}`);
      console.log(`   学部: ${result.gakubuGakka}, 教員: ${result.kyoinMei}`);
    });
  } catch (error) {
    console.error('検索エラー:', error);
  }

  console.log('\n---\n');

  // 例3: 教員名で検索
  console.log('【例3】特定の教員の科目を検索');
  try {
    const results3 = await client.search({
      kyoinMei: '田中', // 教員名の一部
    });

    console.log(`検索結果: ${results3.length}件`);
    results3.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. ${result.kamokuMei} (${result.kyoinMei})`);
    });
  } catch (error) {
    console.error('検索エラー:', error);
  }

  console.log('\n---\n');

  // 例4: 詳細条件で検索
  console.log('【例4】詳細条件で検索（情報学部、1年次、前期）');
  try {
    const results4 = await client.search({
      gakubuCode: '11N', // 情報学部
      nenzi: ['001'], // 1年次
      kaikoki: ['009'], // 前期
    });

    console.log(`検索結果: ${results4.length}件`);
    results4.slice(0, 3).forEach((result, index) => {
      console.log(`${index + 1}. ${result.kamokuMei} (${result.tani})`);
    });
  } catch (error) {
    console.error('検索エラー:', error);
  }

  console.log('\n---\n');

  // 例5: 詳細情報を取得
  console.log('【例5】シラバスの詳細情報を取得');
  try {
    // まず検索
    const results5 = await client.search({
      gakubuCode: '11N',
    });

    if (results5.length > 0 && results5[0]) {
      const firstResult = results5[0];
      console.log(`取得対象: ${firstResult.kamokuMei}`);

      // 詳細情報を取得
      const detail = await client.getDetail(firstResult.syllabusNo);

      console.log('\n詳細情報:');
      console.log(`科目名: ${detail.kamokuMei}`);
      console.log(`教員名: ${detail.kyoinMei}`);
      console.log(`学部・学科: ${detail.gakubuGakka}`);
      console.log(`年次: ${detail.nenzi}`);
      console.log(`単位数: ${detail.tani}`);
      console.log(`開講期間: ${detail.kaikoki}`);

      if (detail.mokutekiGaiyo) {
        console.log(`\n授業の目的・概要:`);
        console.log(detail.mokutekiGaiyo.slice(0, 100) + '...');
      }

      if (detail.seisekiHyoka) {
        console.log(`\n成績評価の方法:`);
        console.log(detail.seisekiHyoka.slice(0, 100) + '...');
      }
    } else {
      console.log('検索結果がありませんでした');
    }
  } catch (error) {
    console.error('詳細取得エラー:', error);
  }

  console.log('\n---\n');

  // 学部一覧を表示
  console.log('【参考】学部コード一覧:');
  Object.entries(GAKUBU_NAMES).slice(0, 10).forEach(([code, name]) => {
    console.log(`  ${code}: ${name}`);
  });
  console.log('  ...');
}

// 実行
main().catch(console.error);
