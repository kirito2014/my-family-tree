这是一个基于 **Next.js App Router** 架构开发的**SaaS化多人协作家族树（Family Tree）应用**的技术与业务文档。

# 家族树 (Family Tree) - 技术与业务白皮书

## 1. 项目概述

本项目是一个支持多租户（多家族）、多用户协作的在线家族树构建平台。用户可以注册账户，创建或加入特定的“家族”空间，在空间内以图形化的方式共同维护家族成员信息及人物关系。

核心价值在于数据的**家族隔离**与**可视化交互**，支持从零开始构建复杂的亲属关系网络。

---

## 2. 技术栈 (Technology Stack)

### 前端架构 (Frontend)

* **框架**: **Next.js 14** (App Router 模式)
* 利用 React Server Components (RSC) 进行服务端渲染，提升首屏性能。
* 使用 Client Components 处理交互逻辑（拖拽、缩放、表单）。
* **语言**: **TypeScript**


* **UI 库**: **React 19**，**Lucide React**
* 使用新版 Hooks: `useActionState` (原 `useFormState`), `useFormStatus` 处理表单提交状态。


* **样式方案**: **Tailwind CSS**
* 原子化 CSS，用于构建响应式布局和卡片样式。


* **图标库**: **@heroicons/react**
* **图形渲染**: **SVG + CSS Absolute Positioning**
* 自定义实现的画布（Canvas），支持无限画布的平移（Pan）与缩放（Zoom）。
* 使用 SVG 贝塞尔曲线（Bezier Curves）绘制成员间的连线。



### 后端架构 (Backend)

* **运行时**: Next.js Server Actions
* 替代传统的 API Routes，直接在服务端函数中处理数据库逻辑，类型安全且简化了前后端交互。


* **身份认证 (Auth)**:
* **Encryption**: `bcryptjs` (密码哈希)。
* **Session**: `jose` (轻量级 JWT 库，支持 Edge Runtime)。
* **Storage**: HTTP-Only Secure Cookies。


* **数据验证**: **Zod**
* 用于后端 API 输入参数的严格校验（Schema Validation）。



### 数据持久层 (Database)

* **ORM**: **Prisma**
* 类型安全的数据库客户端。


* **数据库**: **SQLite** (开发环境) / 可无缝迁移至 PostgreSQL 或 MySQL。
* **Schema 设计**: 包含用户、角色、家族、成员、关系等多张表。

---

## 3. 核心业务流程 (Core Business Processes)

### 3.1 用户引导与入驻 (Onboarding)

这是系统区分多租户的核心流程：

1. **注册/登录**: 用户通过 `username`/`password` 进行认证。
2. **中间件检查**: `middleware.ts` 拦截路由，验证 Session 有效性。
3. **家族状态检查**: 登录后，系统检查 `FamilyUser` 表。
* **无家族归属**: 强制重定向至 `/onboarding` 页面。
* **已有家族**: 允许进入首页 `/`。


4. **创建/加入**:
* **创建新家族**: 用户填写家族名，系统生成唯一 `shareCode`，并将该用户设为 **OWNER**。
* **加入家族**: 用户输入 6 位邀请码，系统验证通过后，将用户关联至该家族，默认角色为 **MEMBER**。



### 3.2 家族树编辑 (Tree Editing)

只有拥有 `OWNER` 或 `ADMIN` 权限的用户可进行此操作：

1. **新增成员**: 点击 FAB (悬浮按钮) -> 填写信息 -> Server Action 写入 `Member` 表（包含初始 `x,y` 坐标）。
2. **画布交互**:
* **拖拽节点**: 鼠标按住节点移动 -> 实时更新本地 State -> 鼠标松开触发 `updateMemberPosition` Action -> 持久化 `x,y` 坐标。
* **缩放/平移**: 鼠标滚轮或拖拽背景 -> 修改 CSS `transform: scale() translate()`。


3. **建立关系**: 选择两个成员 -> 选择关系类型（父子/配偶等）-> Server Action 写入 `Connection` 表 -> 前端 SVG 重新渲染连线。

### 3.3 权限管理 (RBAC)

系统基于 **Role (角色)** 进行权限控制：

* **OWNER (拥有者)**: 拥有所有权限，可踢人、任命管理员、删除家族。
* **ADMIN (管理员)**: 可编辑家族树数据（增删改成员/关系），可管理普通成员。
* **MEMBER (成员)**: 仅拥有家族树的**只读权限**（可查看详情）。
* **VIEWER (访客)**: 仅查看。

---

## 4. 功能模块技术详解

### 4.1 认证模块 (`app/actions/auth.ts` & `lib/session.ts`)

* **功能**: 注册、登录、登出、Session 校验。
* **技术点**:
* 使用 `jose` 生成带有过期时间（7天）的 JWT。
* 使用 `cookies()` API 设置 `httpOnly` Cookie，防止 XSS 攻击。
* `verifySession` 函数在每一个 Server Action 和 Page 中调用，确保请求合法。



### 4.2 家族树视图模块 (`views/TreeView.tsx`)

* **功能**: 核心图形化界面。
* **技术点**:
* **状态管理**: 使用 `useState` 管理 `members`, `connections`, `viewState` (scale/offset)。
* **坐标系转换**: 处理鼠标事件（MouseEvent）的 `clientX/Y` 到 SVG 内部坐标系的映射（`(clientX - offset.x) / scale`）。
* **性能优化**: 拖拽过程中仅更新 React State，仅在 `onMouseUp` 时触发网络请求。



### 4.3 成员管理模块 (`app/actions/member.ts`)

* **功能**: 成员的 CRUD。
* **技术点**:
* **强制多租户隔离**: 所有的 Prisma 查询 (`findMany`, `create`) 必须包含 `where: { familyId }`，防止数据越权。
* **原子操作**: 使用 Prisma 的关联查询一次性拉取成员及其坐标。
* **轻量级更新**: 专门拆分出 `updateMemberPosition` Action，仅更新 `x, y` 字段，减少数据传输量。



### 4.4 个人中心与设置 (`app/profile` & `components/ProfileForm.tsx`)

* **功能**: 修改用户昵称、头像、密码。
* **技术点**: 使用 Next.js 的 Form Action 和 `useActionState` 实现无 JS 降级支持（Progressive Enhancement）及加载状态反馈。

---

## 5. 数据库设计 (Database Schema)

基于最新的 Schema 设计，核心实体关系如下：

| 表名 (Model) | 描述 | 关键字段 | 关联关系 |
| --- | --- | --- | --- |
| **User** | 系统注册用户 | `id`, `username`, `password`, `email` | 1:N `FamilyUser` |
| **Family** | 租户/家族空间 | `id`, `name`, `shareCode`, `creatorId` | 1:N `Member`, 1:N `Connection` |
| **Role** | 权限角色 | `id`, `name` (OWNER/ADMIN...) | 1:N `FamilyUser` |
| **FamilyUser** | 用户-家族关联表 | `userId`, `familyId`, `roleId` | 多对多中间表 |
| **Member** | 家族树节点 (人物) | `firstName`, `birthDate`, `x`, `y`, `familyId` | 属于一个 Family |
| **Connection** | 家族树连线 (关系) | `fromId`, `toId`, `type`, `familyId` | 属于一个 Family |

---

## 6. 接口规范 (Server Actions)

系统不使用 RESTful API，而是通过 Server Actions 直接调用。

| Action 文件 | 函数名 | 作用 | 权限要求 |
| --- | --- | --- | --- |
| `actions/auth.ts` | `login`, `signup` | 登录注册 | 公开 |
| `actions/family.ts` | `createFamily` | 创建新家族 | 登录用户 |
| `actions/family.ts` | `joinFamily` | 加入家族 | 登录用户 |
| `actions/member.ts` | `getFamilyTreeData` | 获取全量树数据 | 家族成员 |
| `actions/member.ts` | `addMember` | 新增节点 | OWNER/ADMIN |
| `actions/member.ts` | `updateMemberPosition` | 更新节点坐标 | OWNER/ADMIN |
| `actions/family-admin.ts` | `removeUserFromFamily` | 移除家族成员 | OWNER/ADMIN |

---

## 7. 后续优化建议

1. **布局算法**: 目前采用手动拖拽或简单的网格布局。未来可引入 `dagre` 或 `elkjs` 实现一键自动排版。
2. **图片存储**: 目前头像字段可能仅存储 URL 字符串。建议集成 AWS S3 或类似的对象存储服务来上传真实图片。
3. **实时协作**: 引入 WebSocket 或 SSE (Server-Sent Events)，实现当一个管理员移动节点时，其他成员屏幕上实时同步移动。
4. **导入/导出**: 支持 GEDCOM 标准格式的导入导出，以便与其他家谱软件互通。