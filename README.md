# kindai-syllabus

近畿大学のシラバス検索システムをTypeScriptで扱うためのライブラリです。CLI・MCPサーバーとしても利用できます。

## CLIで使う

```bash
bunx github:hirossan4049/kinsira search --faculty 11N
bunx github:hirossan4049/kinsira search --faculty 11N --course "プログラミング"
bunx github:hirossan4049/kinsira search --instructor "田中"
bunx github:hirossan4049/kinsira detail --id 2611N00213
bunx github:hirossan4049/kinsira faculties
```

### CLIオプション

| コマンド | 説明 |
|---|---|
| `search` | シラバスを検索 |
| `detail` | シラバスの詳細情報を取得 |
| `faculties` | 学部コード一覧を表示 |
| `mcp` | MCPサーバーを起動 |

| 検索オプション | 説明 |
|---|---|
| `--faculty <code>` | 学部コード (例: `11N`) |
| `--course <name>` | 科目名 (部分一致) |
| `--instructor <name>` | 教員名 (部分一致) |
| `--keyword <word>` | キーワード |
| `--year <code>` | 年次コード (例: `001`=1年次) |
| `--term <code>` | 開講期間コード (例: `009`=前期, `010`=後期) |

| 共通オプション | 説明 |
|---|---|
| `--json` | JSON形式で出力 |

### JSON出力

`--json` フラグを付けると、`search` と `detail` の結果をJSON形式で出力できます。

```bash
bunx github:hirossan4049/kinsira search --faculty 11N --json
bunx github:hirossan4049/kinsira detail --id 2611N00213 --json
```

## MCPサーバーとして使う

Claude DesktopなどのMCPクライアントからシラバス検索が可能です。

### GitHub から直接利用

```json
{
  "mcpServers": {
    "kindai-syllabus": {
      "command": "bunx",
      "args": ["github:hirossan4049/kinsira", "mcp"]
    }
  }
}
```

### ローカルで利用

```json
{
  "mcpServers": {
    "kindai-syllabus": {
      "command": "bun",
      "args": ["run", "/path/to/kinsira/src/cli.ts", "mcp"]
    }
  }
}
```

### 提供ツール

| ツール | 説明 |
|---|---|
| `list_faculties` | 学部・研究科コード一覧を返す |
| `search_syllabus` | シラバスを検索（学部・科目名・教員名等で絞り込み） |
| `get_syllabus_detail` | シラバス番号から詳細情報を取得 |

## ライブラリとして使う

### インストール

```bash
bun add kindai-syllabus
```

### 基本的な使い方

```typescript
import { KindaiSyllabusClient } from 'kindai-syllabus';

const client = new KindaiSyllabusClient();

// 学部で検索
const results = await client.search({
  gakubuCode: '11N', // 情報学部
});

console.log(`検索結果: ${results.length}件`);
results.forEach(result => {
  console.log(`${result.kamokuMei} - ${result.kyoinMei}`);
});

// 詳細情報を取得
const detail = await client.getDetail(results[0].syllabusNo);
console.log(`授業の目的: ${detail.mokutekiGaiyo}`);
```

### 検索条件

```typescript
const results = await client.search({
  gakubuCode: '11N',      // 学部コード
  kamokuMei: 'プログラミング', // 科目名（部分一致）
  kyoinMei: '田中',        // 教員名（部分一致）
  keyword: 'AI',           // キーワード
  nenzi: ['001'],          // 年次（1年次）
  kaikoki: ['009'],        // 開講期間（前期）
  tani: ['002'],           // 単位数（2単位）
});
```

### 学部コード例

| コード | 学部 |
|---|---|
| `111` | 法学部 |
| `113` | 経済学部 |
| `114` | 経営学部 |
| `115` | 理工学部 |
| `11N` | 情報学部 |
| `11G` | 建築学部 |

完全なリストは `GAKUBU_NAMES` をインポートして確認できます。

## 開発

```bash
bun test          # テスト
bun run example   # 使用例の実行
bun run mcp       # MCPサーバー起動
```

## 注意事項

- このライブラリは非公式であり、近畿大学とは無関係です
- シラバスシステムの仕様変更により動作しなくなる可能性があります
- **メンテナンス時間**: 毎日 02:00 〜 07:00（アクセス不可）
- 過度なリクエストは避けてください

## ライセンス

MIT
