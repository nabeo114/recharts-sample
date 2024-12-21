import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended, // 既存のReact設定を引き継ぐ
    rules: {
      ...pluginReact.configs.flat.recommended.rules, // Reactの推奨ルールを引き継ぐ
      
      // 一般的な推奨ルール
      "no-unused-vars": "warn", // 未使用変数を警告
      "react/react-in-jsx-scope": "off", // React 17+で不要なReact importルールを無効化
      "eqeqeq": ["error", "always"], // 厳格な比較（===, !== を推奨）
      "no-console": "warn", // console.logの使用を警告
      "curly": ["error", "all"], // ブロックを常に波括弧で囲む
      "no-debugger": "error", // debuggerの使用をエラーとする
      "prefer-const": "error", // 再代入しない変数にはconstを推奨

      // TypeScript関連の追加ルール
      "@typescript-eslint/explicit-function-return-type": "off", // 関数の戻り値の型定義を必須にしない
      "@typescript-eslint/no-explicit-any": "warn", // any型の使用を警告
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // 未使用の引数を許容（例: _context）

      // React関連の追加ルール
      "react/prop-types": "off", // TypeScriptで型チェックを行う場合、PropTypesを無効化
      "react/jsx-uses-react": "off", // React 17+では不要
      "react/jsx-uses-vars": "warn", // 定義済み変数がJSXで使用されていることを確認
      "react/jsx-no-target-blank": "error", // target="_blank"にrel="noopener"が必要
      "react/no-unknown-property": "error", // 不明なHTML属性をエラーとする
    },
    settings: {
      react: {
        version: "detect", // 自動でReactのバージョンを検出
      },
    },
  },
];