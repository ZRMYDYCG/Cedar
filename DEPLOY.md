# Cedar 线上部署方案（Vercel）

仓库：[ZRMYDYCG/Cedar](https://github.com/ZRMYDYCG/Cedar)

推荐平台：**Vercel**（已使用 `@payloadcms/db-vercel-postgres` + Vercel Blob）。

---

## 架构

```text
访客 → Vercel (Next.js)
         ├─ 前台页面 /        ← 读 Payload（已发布文章）
         └─ CMS /admin        ← 写稿、上传媒体
              ↓
         Vercel Postgres / Neon
              ↓
         Vercel Blob（封面 / 附件）
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
   - Build Command：`pnpm build`
4. **先不要 Deploy**，先完成下面的 Storage / 环境变量

---

## 二、创建托管资源（Storage）

在 Vercel 项目 → **Storage**：

| 资源 | 用途 | 环境变量 |
|------|------|----------|
| **Postgres**（Neon 或 Vercel Postgres） | Payload 数据 | `POSTGRES_URL` |
| **Blob** | 图片 / 媒体上传 | `BLOB_READ_WRITE_TOKEN` |

创建后一般会自动注入到项目环境变量；确认 **Production**（和 Preview，如需要）都勾选了。

---

## 三、环境变量

在 Project → **Settings → Environment Variables** 补齐：

| 变量 | 说明 | 示例 |
|------|------|------|
| `POSTGRES_URL` | 数据库连接串 | Storage 自动注入 |
| `BLOB_READ_WRITE_TOKEN` | Blob 读写令牌 | Storage 自动注入 |
| `PAYLOAD_SECRET` | Payload 加密密钥（**生产专用长随机串**） | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SERVER_URL` | 站点公网地址 | `https://cedar-xxx.vercel.app` |

注意：

- `PAYLOAD_SECRET` **不要**用本地 `.env` 里那串
- 自定义域名绑定后，把 `NEXT_PUBLIC_SERVER_URL` 改成 `https://你的域名` 并 **Redeploy**

---

## 四、首次部署

1. 点 **Deploy**（或 push 任意提交触发）
2. 构建成功后打开：
   - 站点：`https://<项目名>.vercel.app`
   - CMS：`https://<项目名>.vercel.app/admin`
3. **创建第一个管理员账号**（仅首次）
4. 在 Admin 里建 Posts / Categories / Tags / Media → **Publish**
5. 刷新前台即可看到内容

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
| 媒体 | 本地 `media/`（已 gitignore） | Vercel Blob |
| 密钥 | `.env`（不进仓库） | Vercel Env Vars |
| 地址 | `http://localhost:3000` | `NEXT_PUBLIC_SERVER_URL` |

两套数据互不相通；本地测通后再在线上 Admin 发正式内容。

---

## 八、常见问题

**构建失败：缺少 `POSTGRES_URL` / `PAYLOAD_SECRET`**  
→ 环境变量未配齐，或未勾选 Production。

**Admin 打不开 / 500**  
→ 看 Vercel 函数日志；多数是数据库连不上或 `PAYLOAD_SECRET` 为空。

**上传图片失败**  
→ 未配 `BLOB_READ_WRITE_TOKEN`，或 Blob 未绑定到该项目。

**前台看不到文章**  
→ 确认 Admin 里状态是 **Published**（草稿不会出现在前台）。

**改了 `NEXT_PUBLIC_*` 不生效**  
→ 这类变量打进客户端包，必须 Redeploy。

---

## 九、检查清单

- [ ] GitHub 仓库已推送：`ZRMYDYCG/Cedar`
- [ ] Vercel 已 Import 并关联仓库
- [ ] Postgres + Blob 已创建并连接到项目
- [ ] 四个环境变量已配置（含生产专用 `PAYLOAD_SECRET`）
- [ ] 首次 Deploy 成功
- [ ] `/admin` 已创建管理员
- [ ] 已 Publish 至少一篇文章验证前台
- [ ] （可选）自定义域名 + 更新 `NEXT_PUBLIC_SERVER_URL`
