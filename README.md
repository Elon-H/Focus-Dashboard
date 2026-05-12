# Focus Projects

一个本地优先的番茄钟 + 项目待办管理 App。第一版是 React + Vite + TypeScript 网页端，可以在 Mac 本地浏览器运行，数据保存在浏览器 `localStorage` 中，不需要后端、登录、数据库服务器或外部 API。

## 功能

- 番茄钟倒计时
  - 默认 Focus 30 分钟、Short Break 5 分钟、Long Break 15 分钟。
  - 支持开始、暂停、继续、重置。
  - 支持自定义三种模式时长。
  - 首次点击开始或继续时会自动请求浏览器 notification 权限；倒计时结束后显示页面提示，并在授权后发送浏览器 notification。
  - 记录当天完成的 Focus session 数。

- 项目 Dashboard
  - 首页显示所有项目卡片。
  - 首页集中展示所有项目里的 in-progress todo，并在下方展示所有待开始的 todo。
  - 可以在首页直接点击 `todo` / `in-progress` 状态按钮，让任务按 `todo -> in-progress -> done -> todo` 流转。
  - 项目卡片保持紧凑，只展示项目名称、描述、未完成 todo 数和最近 DDL。
  - 支持创建项目、加载 demo 项目、进入详情页。

- 项目详情页
  - Ideas: 新增、编辑、删除 idea。
  - Todo List: 新增、编辑、删除 todo。
  - Todo 字段包含 title、description、status、ddl、expectedFinishTime、priority、createdAt、updatedAt。
  - 支持按状态筛选、按 DDL 排序，过期 DDL 会高亮提示。
  - 点击 todo 的 status badge 可以按 `todo -> in-progress -> done -> todo` 快速流转。
  - Done 任务会自动进入默认折叠的 Done Archive。
  - References: 新增、编辑、删除参考资料，URL 可点击打开。

- 日历视图
  - 独立 Calendar 页面显示月视图。
  - 按日期展示所有项目 todo 的 DDL 和 expectedFinishTime。
  - 每天显示 Focus session 数、过期 todo 和高优先级提示。
  - 点击日期可以查看当天详情，并从 todo 跳转回项目详情页。

- 本地持久化
  - `src/lib/storage.ts` 封装 `localStorage` 读写。
  - 刷新页面后项目、ideas、todos、references、timer 设置和当天 Focus session 计数会保留。

## 目录结构

```text
src/
  components/       UI 组件和表单
  hooks/            番茄钟倒计时 hook
  lib/              storage、日期工具、demo 数据
  pages/            Dashboard、Calendar 和 Project Detail 页面
  stores/           React Context 状态管理
  types/            TypeScript 核心数据结构
```

## 本地运行

```bash
npm install
npm run dev
```

启动后打开终端输出中的本地地址，固定是:

```text
http://127.0.0.1:5173/
```

这个项目固定使用 `127.0.0.1:5173` 保存浏览器本地数据。不要改用 Vite 自动漂移出来的 5174、5175 等端口，否则浏览器会把它们当成不同站点，`localStorage` 数据也会分开。

## 双击启动

Mac 上可以直接双击项目根目录里的 `Start Focus Projects.command`。

它会自动完成这些步骤:

1. 进入当前项目目录。
2. 如果没有 `node_modules`，先运行 `npm install`。
3. 如果 `http://127.0.0.1:5173/` 已经是 Focus Projects，就直接打开浏览器。
4. 如果 5173 被其他本地服务占用，会提示你先关闭那个服务。
5. 否则运行 `npm run dev:open` 并自动打开浏览器访问本地页面。

如果 macOS 首次提示脚本无法打开，可以在 Finder 中右键 `Start Focus Projects.command`，选择“打开”，再确认允许执行。启动后保持终端窗口打开即可继续运行本地服务，关闭终端或按 `Control+C` 可以停止服务。

## Dock App 启动

可以生成一个本地自用的 `Focus Projects.app`，然后拖到 Dock:

```bash
npm run build:mac-app
```

生成后，项目根目录会出现:

```text
Focus Projects.app
```

双击这个 app 或从 Dock 点击它时，会复用固定地址 `http://127.0.0.1:5173/`。如果本地服务已经运行，它会直接打开浏览器；如果没有运行，它会在后台启动 Vite 服务并打开浏览器。后台日志写入 `logs/focus-projects.log`。

启动器会先尝试在 ChatGPT Atlas 中找到已经打开的 Focus Projects 标签页并切过去；找不到时会明确在 Atlas 打开新页面。如果 Atlas 不可用，会退回 Safari，然后再退回系统默认浏览器。

第一次控制 ChatGPT Atlas 或 Safari 时，macOS 可能会弹出 Automation 权限提示。允许后，Dock app 才能切到已有标签页；如果拒绝权限，启动器仍会打开页面，但可能会新开标签页。

如果 macOS 首次提示无法打开这个 app，可以在 Finder 中右键 `Focus Projects.app`，选择“打开”，再确认允许执行。这个 app 是用 macOS 自带 `osacompile` 生成的本机启动器，不是签名/公证后的分发包；在当前 `Documents` 目录中，`codesign --verify` 可能会因为 macOS 自动附加的 Finder/provenance 扩展属性失败，但不影响本机点击启动。

## 构建

```bash
npm run build
```

生成 Dock 启动器:

```bash
npm run build:mac-app
```

## Smoke test

```bash
npm run smoke
```

这个脚本会检查核心文件、路由入口和 storage layer 是否存在。更完整的手动验证步骤:

1. `npm run dev` 启动页面。
2. 在 Dashboard 创建一个项目。
3. 点击项目卡片进入详情页。
4. 分别新增一个 idea、todo、reference。
5. 给 todo 设置 `ddl` 和 `expectedFinishTime`，切换状态筛选和 DDL 排序。
6. 点击 todo 的 status badge 改变状态，再刷新页面，确认状态仍然保留。
7. 回到 Dashboard，确认 In Progress / Todo 汇总和项目卡片未完成数量同步更新。
8. 修改番茄钟时长，开始、暂停、继续、重置，刷新页面后确认设置仍然保留。
9. 打开 Calendar，确认 todo 日期事件和 Focus session 统计正确显示。
10. 双击 `Start Focus Projects.command`，确认浏览器自动打开本地页面。
11. 开始 Focus timer 后进入项目详情、编辑项目或切到 Calendar，确认倒计时不会重置。
12. 从 Calendar 点击侧边栏 Timer / Projects，确认会回到首页对应区域。
13. 运行 `npm run build:mac-app`，确认生成 `Focus Projects.app`。
14. 双击 `Focus Projects.app` 或拖到 Dock 后点击，确认打开 `http://127.0.0.1:5173/`。
15. Focus Projects 已经打开时再次点击 Dock app，确认优先切到已有标签页。
16. 在项目详情页点击 todo 的 status badge，确认按 `todo -> in-progress -> done -> todo` 循环。
17. 确认 done 任务进入默认折叠的 Done Archive，点回 todo 后回到主 Todo List。
18. 创建或编辑多个 in-progress todo，确认它们会集中出现在 Dashboard 的 In Progress 区域。
19. 创建或编辑多个 todo 状态任务，确认它们会集中出现在 Dashboard 的 Todo 区域。
20. 在 Dashboard 点击 `todo` 状态按钮，确认任务移动到 In Progress；再点击 `in-progress`，确认任务变为 done 并从首页汇总消失。
21. 确认 Dashboard 项目卡片只显示未完成 todo 数和最近 DDL。
22. 清空或输入非法 timer 时长后保存，确认不会出现 `NaN:NaN`。
23. 删除 idea、todo 或 reference 时，确认会先弹出确认框。

## 后续增强方向

- 使用 IndexedDB 支持更大数据量和导入导出。
- 增加 PWA manifest、离线缓存和安装到 Dock。
- 加入搜索、标签、项目归档和周视图/拖拽排期。
- 将相同状态层迁移到 Tauri 或 Electron，扩展为 Mac 桌面 App。
