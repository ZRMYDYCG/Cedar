# Cedar 线上部署方案（Vercel）

仓库：[ZRMYDYCG/Cedar](https://github.com/ZRMYDYCG/Cedar)

推荐平台：**Vercel**（Postgres 用 `@payloadcms/db-vercel-postgres`；媒体走 Gitee 私有仓库 + 本站代理）。

---

## 架构

```text
访客 → Vercel (Next.js)
         ├─ 前台页面 /        ← 读 Payload（已发布文章）
         └─ CMS /admin        ← 写稿、上传媒体
              ↓
         Vercel Postgres / Neon
              ↓
         Gitee 私有仓库（封面 / 附件）
              ↑
         /api/media/file/... 代理读图（规避防盗链）
```

日常发文只走 `/admin`，**不必重新部署**。改代码才 `git push` 触发构建。

---

## 一、在 Vercel 导入项目

1. 打开 [vercel.com](https://vercel.com) → **Add New Project**
2. Import `ZRMYDYCG/Cedar`
3. 配置：
   - Framework：Next.js
   - Root Directory：`.`
   - Install Command：`pnpm install`
   - Build Command：`pnpm run ci`（仓库已带 `vercel.json`，会自动用这个；作用是先 `payload migrate` 建表，再 `next build`）
4. **先不要 Deploy**，先完成下面的 Storage / 环境变量

---

## 二、创建托管资源

### Postgres

在 Vercel 项目 → **Storage** 创建 **Postgres**（Neon 或 Vercel Postgres），环境变量 `POSTGRES_URL` 一般会自动注入；确认 **Production**（和 Preview，如需要）都勾选了。

### Gitee 图床（手工）

1. 在 Gitee 新建一个**私有**空仓库（例如 `cedar-assets`）
2. 账号设置 → 私人令牌，勾选仓库 `projects` 权限，生成 `GITEE_TOKEN`
3. 将 owner / repo / token 配到 Vercel 环境变量（见下表）

Gitee Contents API 最终文件需 ≤ **2MB**。上传时会用 sharp 自动压缩/转 WebP（原图可到约 40MB）；SVG/GIF 不压缩，仍须 ≤2MB。

---

## 三、环境变量

在 Project → **Settings → Environment Variables** 补齐：

| 变量 | 说明 | 示例 |
|------|------|------|
| `POSTGRES_URL` | 数据库连接串 | Storage 自动注入 |
| `GITEE_OWNER` | Gitee 用户名或组织 | `your-name` |
| `GITEE_REPO` | 私有资源仓库名 | `cedar-assets` |
| `GITEE_TOKEN` | Gitee 私人令牌 | `xxxxxxxx` |
| `GITEE_BRANCH` | 可选，默认 `master` | `master` |
| `PAYLOAD_SECRET` | Payload 加密密钥（**生产专用长随机串**） | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SERVER_URL` | 站点公网地址 | `https://cedar-xxx.vercel.app` |

注意：

- `PAYLOAD_SECRET` **不要**用本地 `.env` 里那串
- 自定义域名绑定后，把 `NEXT_PUBLIC_SERVER_URL` 改成 `https://你的域名` 并 **Redeploy**
- 不再需要 `BLOB_READ_WRITE_TOKEN`
---

## 四、首次部署

1. 确认仓库已包含 `src/migrations/`（初始建表 SQL）和 `vercel.json`（构建前跑 migrate）
2. 点 **Deploy**（或 push 任意提交触发）
3. 构建日志里应出现 `Migrating: ..._initial` / `Migrated`
4. 构建成功后打开：
   - 站点：`https://<项目名>.vercel.app`
   - CMS：`https://<项目名>.vercel.app/admin`
5. **创建第一个管理员账号**（仅首次）
6. 在 Admin 里建 Posts / Categories / Tags / Media → **Publish**
7. 刷新前台即可看到内容

以后改了 Collection / 字段：本地跑 `pnpm payload migrate:create`，把生成的 migration 一并 commit，再部署。

---

## 五、自定义域名（可选）

1. Vercel → Project → **Domains** → 添加域名
2. 按提示改 DNS（A / CNAME）
3. 更新环境变量：
   ```bash
   NEXT_PUBLIC_SERVER_URL=https://你的域名
   ```
4. Redeploy 一次

---

## 六、日常流程

```text
改代码：本地修改 → git push → Vercel 自动构建预览/生产
写文章：打开 /admin → 编辑 → Publish → 前台立即可见
```

**不要**在生产环境跑 `pnpm seed`（那是本地演示数据）。

---

## 七、本地与线上对照

| 项 | 本地 | 线上 |
|----|------|------|
| 数据库 | Docker Postgres | Vercel Postgres / Neon |
| 媒体 | 配齐 `GITEE_*` 后走 Gitee；未配置则本地 `media/` | Gitee 私有仓库 + `/api/media/file` 代理 |
| 密钥 | `.env`（不进仓库） | Vercel Env Vars |
| 地址 | `http://localhost:3000` | `NEXT_PUBLIC_SERVER_URL` |

两套数据互不相通；本地测通后再在线上 Admin 发正式内容。

---

## 八、常见问题

**构建失败：缺少 `POSTGRES_URL` / `PAYLOAD_SECRET`**  
→ 环境变量未配齐，或未勾选 Production。

**Admin 打不开 / 500 / Application error（Digest …）**  
→ 看 Vercel 函数日志。常见原因：
1. 数据库连不上或 `PAYLOAD_SECRET` 为空  
2. **生产库还没建表**：Postgres 在生产不会自动 `push`。确认 Build Command 是 `pnpm run ci`，且构建日志跑过 `payload migrate`。缺 migration 时本地执行 `pnpm payload migrate:create` 后重新部署。

**上传图片失败 / `ERR_CONNECTION_CLOSED` / Admin 报 `reading 'doc'`**  
→ 多为 Vercel 函数超时（504）或上传后二次 `payload.update` 在慢 Gitee 请求后 Not Found。当前策略：入库前压成约 ≤512KB WebP，Gitee 上传后不再 update。重新部署后再试。其它常见原因：
1. 未配齐 `GITEE_OWNER` / `GITEE_REPO` / `GITEE_TOKEN`，或 Token 无仓库写权限  
2. 文件超过 **2MB**（硬限制；上传会尽量压到约 512KB）  
3. `413` / `FUNCTION_PAYLOAD_TOO_LARGE`：仍可能被 Vercel 函数体限制挡住，请先压图  
4. 构建/运行日志应出现 `[Cedar] Gitee media storage enabled`；若出现 missing 警告则环境变量未注入  
5. Alt 必填：抽屉里直接传图时会用文件名自动填充

**前台看不到文章**  
→ 确认 Admin 里状态是 **Published**（草稿不会出现在前台）。

**改了 `NEXT_PUBLIC_*` 不生效**  
→ 这类变量打进客户端包，必须 Redeploy。

---

## 九、检查清单

- [ ] GitHub 仓库已推送：`ZRMYDYCG/Cedar`
- [ ] Vercel 已 Import 并关联仓库
- [ ] Postgres 已创建并连接到项目
- [ ] Gitee 私有仓库 + `GITEE_*` / `PAYLOAD_SECRET` / `NEXT_PUBLIC_SERVER_URL` 已配置
- [ ] 已提交 `src/migrations/`，Build Command 为 `pnpm run ci`
- [ ] 首次 Deploy 成功（日志含 migrate）
- [ ] `/admin` 已创建管理员
- [ ] 已 Publish 至少一篇文章验证前台
- [ ] （可选）自定义域名 + 更新 `NEXT_PUBLIC_SERVER_URL`
