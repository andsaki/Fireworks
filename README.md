# Fireworks

キャンバス上で花火のアニメーションを表示するWebアプリケーション

## 概要

2018年に作成したJavaScriptベースの花火アニメーションプロジェクトを、2025年にTypeScriptとモダンな開発環境でリファクタリングしました。

## 開発環境

- TypeScript
- Vite
- Canvas API

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## 主なリファクタリング内容

- ES5からES6+への移行（var → const/let、プロトタイプ → クラス構文）
- JavaScriptからTypeScriptへの完全移行
- requestAnimationFrameによるアニメーション最適化
- Viteによるモダンなビルド環境
- 日本語JSDocドキュメントの追加

## ライセンス

ISC
