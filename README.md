# kindai-syllabus

近畿大学のシラバス検索システムをTypeScriptで扱うためのライブラリです。

## 特徴

- TypeScript完全対応（型安全な検索）
- Bunランタイムで高速動作
- 学部・科目名・教員名などの柔軟な検索条件
- シラバス詳細情報の取得
- HTMLを構造化データ（JSON）にパース

## インストール

```bash
bun add kindai-syllabus
```

または、このリポジトリをクローンして使用：

```bash
git clone <repository-url>
cd kindai-syllabus
bun install
```

## 基本的な使い方

### 1. クライアントの作成

```typescript
import { KindaiSyllabusClient } from 'kindai-syllabus';

const client = new KindaiSyllabusClient();
```

### 2. シラバス検索

```typescript
// 学部で検索
const results = await client.search({
  gakubuCode: '11N', // 情報学部
});

console.log(`検索結果: ${results.length}件`);
results.forEach(result => {
  console.log(`${result.kamokuMei} - ${result.kyoinMei}`);
});
```

### 3. 詳細情報の取得

```typescript
// シラバス番号から詳細を取得
const detail = await client.getDetail(syllabusNo);

console.log(`科目名: ${detail.kamokuMei}`);
console.log(`教員名: ${detail.kyoinMei}`);
console.log(`授業の目的: ${detail.mokutekiGaiyo}`);
```

## 検索条件

### SearchParams

```typescript
interface SearchParams {
  gakubuCode?: GakubuCode;      // 学部コード
  kamokuMei?: string;            // 科目名
  kyoinMei?: string;             // 教員名
  keyword?: string;              // キーワード
  sort?: SortOrder;              // ソート順
  nenzi?: Nenzi[];               // 年次（複数選択可）
  tani?: Tani[];                 // 単位数（複数選択可）
  kaikoki?: Kaikoki[];           // 開講期間（複数選択可）
  bunya?: Bunya[];               // 分野（複数選択可）
  kamokuKubun?: KamokuKubun[];   // 科目区分（複数選択可）
}
```

### 学部コード例

- `'111'` - 法学部
- `'113'` - 経済学部
- `'114'` - 経営学部
- `'115'` - 理工学部
- `'11N'` - 情報学部
- `'11G'` - 建築学部

完全なリストは `GAKUBU_NAMES` をインポートして確認できます。

## 使用例

### 科目名で検索

```typescript
const results = await client.search({
  kamokuMei: 'プログラミング',
});
```

### 教員名で検索

```typescript
const results = await client.search({
  kyoinMei: '田中',
});
```

### 複数条件を組み合わせた検索

```typescript
const results = await client.search({
  gakubuCode: '11N',      // 情報学部
  nenzi: ['001'],          // 1年次
  kaikoki: ['009'],        // 前期
  tani: ['002'],           // 2単位
});
```

### 詳細情報の取得

```typescript
const results = await client.search({ gakubuCode: '11N' });

if (results[0]) {
  const detail = await client.getDetail(results[0].syllabusNo);

  console.log('科目詳細:');
  console.log(`科目名: ${detail.kamokuMei}`);
  console.log(`教員: ${detail.kyoinMei}`);
  console.log(`目的: ${detail.mokutekiGaiyo}`);
  console.log(`評価: ${detail.seisekiHyoka}`);
}
```

## エラーハンドリング

### メンテナンス時のエラー

システムがメンテナンス中の場合、エラーが発生します：

```typescript
try {
  const results = await client.search({ gakubuCode: '11N' });
} catch (error) {
  console.error(error.message);
  // "システムがメンテナンス中です。メンテナンス時間: 02:00 ～ 07:00"
}
```

### メンテナンスチェック

事前にメンテナンス中かどうかをチェックすることもできます：

```typescript
import { isMaintenancePage } from 'kindai-syllabus';

const response = await fetch('https://syllabus.itp.kindai.ac.jp/customer/Form/sy01000.aspx');
const html = await response.text();

if (isMaintenancePage(html)) {
  console.log('現在メンテナンス中です');
}
```

## API仕様

### KindaiSyllabusClient

#### `search(params?: SearchParams): Promise<SyllabusResult[]>`

シラバスを検索します。

**パラメータ:**
- `params` - 検索条件（省略可）

**戻り値:**
- シラバス検索結果の配列

#### `getDetail(syllabusNo: string): Promise<SyllabusDetail>`

シラバスの詳細情報を取得します。

**パラメータ:**
- `syllabusNo` - シラバス番号

**戻り値:**
- シラバス詳細情報

#### `resetSession(): void`

セッションをリセットします（新しい検索セッションを開始する場合に使用）。

## 型定義

### SyllabusResult

```typescript
interface SyllabusResult {
  syllabusNo: string;      // シラバス番号
  kamokuMei: string;       // 科目名
  kyoinMei: string;        // 教員名
  gakubuGakka?: string;    // 学部・学科
  nenzi?: string;          // 年次
  tani?: string;           // 単位数
  kaikoki?: string;        // 開講期間
  kamokuKubun?: string;    // 科目区分
}
```

### SyllabusDetail

```typescript
interface SyllabusDetail {
  syllabusNo: string;           // シラバス番号
  kamokuMei: string;            // 科目名
  kyoinMei: string;             // 教員名
  gakubuGakka?: string;         // 学部・学科
  nenzi?: string;               // 年次
  tani?: string;                // 単位数
  kaikoki?: string;             // 開講期間
  kamokuKubun?: string;         // 科目区分
  mokutekiGaiyo?: string;       // 授業の目的・概要
  toutatsumokuhyo?: string;     // 到達目標
  jugyoNaiyo?: string;          // 授業内容・授業計画
  seisekiHyoka?: string;        // 成績評価の方法
  kyokasho?: string;            // 教科書
  sankosho?: string;            // 参考書
  rishuChuui?: string;          // 履修上の注意
  sonotaJoho?: string;          // その他の情報
  biko?: string;                // 備考
}
```

## 開発

### テストの実行

```bash
bun test
```

### 使用例の実行

```bash
bun run example
```

### ビルド

```bash
bun run build
```

## 技術仕様

- **ランタイム**: Bun 1.3+
- **言語**: TypeScript 5.9+
- **依存関係**:
  - cheerio: HTMLパース
- **対象システム**: 近畿大学シラバス検索システム（ASP.NET WebForms）

## 注意事項

- このライブラリは非公式であり、近畿大学とは無関係です
- シラバスシステムの仕様変更により動作しなくなる可能性があります
- **システムメンテナンス時間**: 毎日 02:00 ～ 07:00（この時間帯はアクセスできません）
- 過度なリクエストはサーバーに負荷をかけるため、適切な間隔を空けて使用してください
- 取得したデータの利用は自己責任で行ってください

## ライセンス

MIT

## 貢献

Issues や Pull Requests は歓迎します。

## 関連リンク

- [近畿大学シラバス検索](https://syllabus.itp.kindai.ac.jp/customer/Form/sy01000.aspx)
- [Bun](https://bun.sh/)
