# PHASE 7：内容填充 + 部署上线

> 阶段标签：Phase 7（内容填充 + 部署）
> ⚠️ 用户指示：**部署最后再写，先把网站打磨完**。本卡先做内容填充，部署段（Part B）留到最后执行。

---

## 目标

把真实素材灌进各页（作品、证书、个人、博客），再部署上线到 Cloudflare Pages + 自定义域名 `lszbf.com` + HTTPS。

---

## 对应文档

- `../docs/01-内容结构文档.md` §4（作品四段式）、§6（奖项）、§7（外链）、§8（缺失素材）
- `../docs/03-技术架构文档.md` §5（数据层字段）、§7（部署架构）、§8（验收标准）
- `../docs/PROJECT_STATE.md` §5（已知坑/待补素材清单）

---

## 入场状态

⬜ **未开始**。路由已建（`/works` `/works/[slug]` `/awards` `/contact` `/blog`），但真实内容待灌。

- 数据层已有 4 个项目、奖项、个人信息的骨架数据（`src/data/*.ts`），需核对/补全。
- 部署链路（GitHub + Cloudflare Pages + 域名）尚未搭建。

---

## 执行步骤

### Part A：内容填充（先做）

1. **素材落位**：`public/assets/projects/`（cover/arch/gallery）、`public/assets/awards/`（证书扫描件）、`public/assets/brand/`（head.png / favicon）——英文命名、绝对路径引用。
2. **作品数据**：核对 `projects.ts` 4 个项目四段式（problem/tech/contribution/result），量化成果（35→60FPS、内存↓18%、营收 2.7 万、2 软著）确认无误。
3. **个人数据**：`profile.ts` 核对姓名/教育/技能/外链（github/gitee/email/wechat）。
4. **奖项数据**：`awards.ts` 按 Phase 5 卡补证书、隐藏开关。
5. **博客首批**：`src/content/blog/*.md`（或 `/blog` 数据）写 3 篇——《用 AI 工具链搭游戏客户端作品集》、《流浪尸潮 35→60FPS 优化实录》、《Unity 泛型状态机在肉鸽中的应用》。
6. **待用户提供**（标 `⚠️ 待确认`，不编造）：数模省一证书、建模/剪辑素材、B站/ArtStation/站酷链接、头像/favicon。

### Part B：部署（最后写，见下方「风险与提醒」）

7. GitHub 建仓 + 推送。
8. Cloudflare Pages：Astro preset、Build `npm run build`、Output `dist`、Node 20。
9. 域名：`lszbf.com` + `www`，DNS/NS 指向 Cloudflare，自动 HTTPS，www→apex 重定向。

---

## 验收标准

- [ ] 作品/证书/个人数据完整，链接通、图片不丢（全绝对路径）。
- [ ] 博客 3 篇可正常渲染。
- [ ] GitHub 仓库公开、代码已推送。
- [ ] Cloudflare Pages 自动构建成功，自定义域名 + HTTPS 生效，www 重定向规范。
- [ ] Lighthouse Performance > 85。

---

## 风险与提醒

- **部署放最后**：先把网站打磨完（Phase 1-6 精修收尾）再上线，别边改边部署。
- **全局待用户拍板**（AI 不能替用户决定）：① 校级/院级奖项是否隐藏；② 域名最终选哪个；③ 是否国内备案（影响托管选型）。
- 内容填充涉及真实证书/链接/素材，一律等用户提供，`⚠️ 待确认` 占位，禁止编造。
- 博客内容若涉及本流程复盘，注意别泄露敏感信息。

---

## 完成后 commit 信息

```
Phase 7：内容填充 + 部署上线
```
