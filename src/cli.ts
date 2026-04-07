#!/usr/bin/env bun

import { KindaiSyllabusClient, GAKUBU_NAMES } from './index.ts';
import type { SearchParams } from './types.ts';

const args = process.argv.slice(2);
const command = args[0];

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      flags.json = 'true';
    } else if (arg.startsWith('--') && i + 1 < args.length) {
      flags[arg.slice(2)] = args[++i];
    }
  }
  return flags;
}

function printUsage() {
  console.log(`Usage: kindai-syllabus <command> [options]

Commands:
  search       シラバスを検索
  detail       シラバスの詳細情報を取得
  faculties    学部コード一覧を表示
  mcp          MCPサーバーを起動

Search options:
  --faculty <code>       学部コード (例: 11N)
  --course <name>        科目名 (部分一致)
  --instructor <name>    教員名 (部分一致)
  --keyword <word>       キーワード
  --year <code>          年次コード (例: 001=1年次)
  --term <code>          開講期間コード (例: 009=前期, 010=後期)

Detail options:
  --id <syllabusNo>      シラバス番号

Global options:
  --json                 JSON形式で出力

Examples:
  kindai-syllabus search --faculty 11N
  kindai-syllabus search --faculty 11N --course "プログラミング"
  kindai-syllabus search --instructor "田中"
  kindai-syllabus detail --id 2611N00213
  kindai-syllabus faculties
  kindai-syllabus mcp`);
}

async function runSearch(flags: Record<string, string>) {
  const client = new KindaiSyllabusClient();
  const params: SearchParams = {};

  if (flags.faculty) params.gakubuCode = flags.faculty as SearchParams['gakubuCode'];
  if (flags.course) params.kamokuMei = flags.course;
  if (flags.instructor) params.kyoinMei = flags.instructor;
  if (flags.keyword) params.keyword = flags.keyword;
  if (flags.year) params.nenzi = [flags.year] as SearchParams['nenzi'];
  if (flags.term) params.kaikoki = [flags.term] as SearchParams['kaikoki'];

  const results = await client.search(params);

  if (flags.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  console.log(`検索結果: ${results.length}件\n`);

  for (const r of results) {
    console.log(`  [${r.syllabusNo}] ${r.kamokuMei}`);
    console.log(`    教員: ${r.kyoinMei} | ${r.gakubuGakka} | ${r.nenzi} | ${r.tani} | ${r.kaikoki}`);
  }
}

async function runDetail(flags: Record<string, string>) {
  if (!flags.id) {
    console.error('エラー: --id <syllabusNo> を指定してください');
    process.exit(1);
  }

  const client = new KindaiSyllabusClient();
  const detail = await client.getDetail(flags.id);

  if (flags.json) {
    console.log(JSON.stringify(detail, null, 2));
    return;
  }

  console.log(`科目名: ${detail.kamokuMei}`);
  console.log(`教員名: ${detail.kyoinMei}`);
  if (detail.gakubuGakka) console.log(`学部・学科: ${detail.gakubuGakka}`);
  if (detail.nenzi) console.log(`年次: ${detail.nenzi}`);
  if (detail.tani) console.log(`単位: ${detail.tani}`);
  if (detail.kaikoki) console.log(`開講期間: ${detail.kaikoki}`);
  if (detail.mokutekiGaiyo) console.log(`\n授業の目的・概要:\n${detail.mokutekiGaiyo}`);
  if (detail.seisekiHyoka) console.log(`\n成績評価:\n${detail.seisekiHyoka}`);
}

function showFaculties() {
  console.log('学部コード一覧:\n');
  for (const [code, name] of Object.entries(GAKUBU_NAMES)) {
    if (name) console.log(`  ${code}  ${name}`);
  }
}

async function startMcp() {
  // MCP サーバーを動的にインポートして起動
  await import('./mcp.ts');
}

switch (command) {
  case 'search':
    await runSearch(parseFlags(args.slice(1)));
    break;
  case 'detail':
    await runDetail(parseFlags(args.slice(1)));
    break;
  case 'faculties':
    showFaculties();
    break;
  case 'mcp':
    await startMcp();
    break;
  default:
    printUsage();
    break;
}
