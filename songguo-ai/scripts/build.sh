#!/bin/bash
# ===== 松果AI 构建部署脚本 =====
# 用法: bash scripts/build.sh [push]
# - 无参数: 仅本地构建检查
# - push: 构建并推送到GitHub

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "===== 松果AI 构建 ====="
echo "项目目录: $PROJECT_DIR"

# Step 1: 检查文件完整性
echo ""
echo "[1/4] 检查文件完整性..."
REQUIRED_FILES=(
  "index.html"
  "assets/css/main.css"
  "assets/js/roles.js"
  "assets/js/compliance.js"
  "assets/js/chat.js"
  "assets/js/app.js"
)
for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$PROJECT_DIR/$f" ]; then
    echo "  [ERROR] 缺少文件: $f"
    exit 1
  fi
  echo "  [OK] $f"
done

# Step 2: 清理旧文件
echo ""
echo "[2/4] 清理旧文件..."
if [ -f "$PROJECT_DIR/assets/index.html" ]; then
  rm "$PROJECT_DIR/assets/index.html"
  echo "  [OK] 已删除 assets/index.html (旧版本)"
fi

# Step 3: 统计代码行数
echo ""
echo "[3/4] 代码统计..."
CSS_LINES=$(wc -l < "$PROJECT_DIR/assets/css/main.css")
JS_LINES=$(cat "$PROJECT_DIR/assets/js/"*.js | wc -l)
HTML_LINES=$(wc -l < "$PROJECT_DIR/index.html")
echo "  CSS: ${CSS_LINES} 行 (assets/css/main.css)"
echo "  JS:  ${JS_LINES} 行 (4个模块)"
echo "  HTML: ${HTML_LINES} 行 (index.html)"
echo "  总计: $((CSS_LINES + JS_LINES + HTML_LINES)) 行"

# Step 4: Git push
if [ "$1" = "push" ]; then
  echo ""
  echo "[4/4] 推送到GitHub..."
  cd "$PROJECT_DIR"
  git add -A
  git status
  git commit -m "refactor: 模块化架构重构 (CSS/JS分离)"
  git push origin main
  echo ""
  echo "===== 推送完成 ====="
  echo "等待1-2分钟后访问: https://lgtgongtai.github.io/songguo-ai/"
else
  echo ""
  echo "[4/4] 跳过推送 (使用 'bash scripts/build.sh push' 推送)"
fi

echo ""
echo "===== 构建完成 ====="
