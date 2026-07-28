#!/bin/bash
# 一键部署：构建 → 同步 dist 到 gh-pages 分支 → 推送
set -e
cd "$(dirname "$0")/.."

npm run build

WT=/tmp/historyle-pages
git worktree remove --force "$WT" 2>/dev/null || true
git worktree add "$WT" gh-pages --quiet

rsync -a --delete --exclude '.git' --exclude '.gitignore' dist/ "$WT"/
touch "$WT/.nojekyll"

cd "$WT"
git add -A
if git diff --cached --quiet; then
  echo '无变化，跳过提交'
else
  git -c user.email="dev@local" -c user.name="shutong" commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" --quiet
  git push origin gh-pages
  echo "已部署 → https://stjiao14.github.io/historyle/"
fi

cd - >/dev/null
git worktree remove --force "$WT"
