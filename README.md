# Fireworks

キャンバス上で花火のアニメーションを表示するWebアプリケーション

🎆 **[デモを見る](https://hanabi-taikai.pages.dev/)**

## 概要

2018年に作成したJavaScriptベースの花火アニメーションプロジェクトを、2025年にTypeScriptとモダンな開発環境でリファクタリングしました。

## 技術スタック

- **TypeScript** - 型安全性の向上
- **Vite** - 高速なビルドツール
- **Canvas API** - アニメーション描画
- **Cloudflare Pages** - ホスティング・自動デプロイ

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

## プロジェクト構成

```
src/
├── fireworks.ts      # メインエントリーポイント
├── Canvas.ts         # キャンバス管理
├── Firework.ts       # 花火クラス
├── Particle.ts       # 爆発パーティクル
├── Launch.ts         # 打ち上げパーティクル
├── constants.ts      # 定数定義
└── types.ts          # 型定義
```

## 主なリファクタリング内容

### フェーズ1：基本的な現代化
- ES5からES6+への移行（var → const/let、プロトタイプ → クラス構文）
- JavaScriptからTypeScriptへの完全移行
- requestAnimationFrameによるアニメーション最適化
- Viteによるモダンなビルド環境

### フェーズ2：コード品質の向上
- アロー関数の採用
- any型の排除と厳密な型定義
- マジックナンバーの定数化
- テンプレートリテラルとnullish coalescingの活用

### フェーズ3：モジュール化とコード整理
- 命名規則の統一（camelCase）
- 型定義の分離（types.ts）
- クラスの個別ファイル化
- srcディレクトリへの整理

### ドキュメント
- 全コードに日本語JSDocコメントを追加

## デプロイ

masterブランチへのpush時に、Cloudflare Pagesが自動的にビルドしてデプロイします。

## ライセンス

ISC
