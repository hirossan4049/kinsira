#!/usr/bin/env bun

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { KindaiSyllabusClient, GAKUBU_NAMES } from './index.ts';
import type { SearchParams } from './types.ts';

const server = new McpServer({
  name: 'kindai-syllabus',
  version: '0.1.0',
});

const client = new KindaiSyllabusClient();

// 学部コード一覧
server.tool(
  'list_faculties',
  '近畿大学の学部・研究科コード一覧を返す',
  {},
  async () => ({
    content: [{ type: 'text', text: JSON.stringify(GAKUBU_NAMES, null, 2) }],
  }),
);

// シラバス検索
server.tool(
  'search_syllabus',
  '近畿大学のシラバスを検索する。学部コードはlist_facultiesで取得可能',
  {
    gakubuCode: z.string().optional().describe('学部コード (例: "11N"=情報学部)。list_facultiesで一覧取得可能'),
    kamokuMei: z.string().optional().describe('科目名 (部分一致)'),
    kyoinMei: z.string().optional().describe('教員名 (部分一致)'),
    keyword: z.string().optional().describe('キーワード'),
    sort: z.enum(['001', '002', '003', '004']).optional().describe('ソート順: 001=学科名, 002=科目名, 003=教員名, 004=氏名'),
    nenzi: z.array(z.string()).optional().describe('年次コード配列 (例: ["001"]=1年次, ["002"]=2年次)'),
    tani: z.array(z.string()).optional().describe('単位数コード配列 (例: ["002"]=2単位)'),
    kaikoki: z.array(z.string()).optional().describe('開講期間コード配列 (例: ["009"]=前期, ["010"]=後期, ["011"]=通年)'),
    bunya: z.array(z.string()).optional().describe('分野コード配列'),
    kamokuKubun: z.array(z.string()).optional().describe('科目区分コード配列'),
  },
  async (params) => {
    try {
      const results = await client.search(params as SearchParams);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ count: results.length, results }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `エラー: ${(error as Error).message}` }],
        isError: true,
      };
    }
  },
);

// シラバス詳細取得
server.tool(
  'get_syllabus_detail',
  'シラバス番号から詳細情報を取得する。search_syllabusの結果に含まれるsyllabusNoを指定',
  {
    syllabusNo: z.string().describe('シラバス番号 (例: "2611N00213")'),
  },
  async ({ syllabusNo }) => {
    try {
      const detail = await client.getDetail(syllabusNo);
      return {
        content: [{ type: 'text', text: JSON.stringify(detail, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `エラー: ${(error as Error).message}` }],
        isError: true,
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
