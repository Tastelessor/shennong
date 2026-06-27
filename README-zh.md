<div align="center">

# 神农中医

**中医诊所管理平台**

[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Rolldown-646cff?logo=vite)](https://vitejs.dev)
[![.NET](https://img.shields.io/badge/.NET-8-512bd4?logo=dotnet)](https://dotnet.microsoft.com)
[![SignalR](https://img.shields.io/badge/SignalR-实时通信-007acc)](https://learn.microsoft.com/aspnet/core/signalr)

**[English](./README.md)** · **[中文](./README-zh.md)** · **[বাংলা](./README-bn.md)**

预约管理 · 合伙人推荐系统 · 实时聊天 · 多语言支持

</div>

---

## 关于

神农中医是为孟加拉国锡尔赫特的中医诊所开发的商业演示平台。系统提供患者预约管理、多层级合伙人推荐网络、患者与客服实时聊天、诊所位置管理等功能，支持三语界面切换。

## 快速开始

```bash
# 前端
cd frontend && npm install && npm run dev

# 后端
cd backend/Shennong.Api && dotnet run
```

前端: `http://localhost:5173` · API: `http://localhost:5000`

## 系统架构

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────┐
│   React 19 SPA   │──────▶│  ASP.NET Core 8 API  │──────▶│  SQL Server  │
│   Vite + Tailwind│  REST │  SignalR · JWT · EF  │  TCP  │  (或 SQLite) │
└──────────────────┘       └──────────────────────┘       └──────────────┘
        │                          │
        │   @microsoft/signalr     │   WebSocket
        └──────────────────────────┘
```

## 功能特性

| | |
|---|---|
| 🏥 **患者门户** | 预约管理、历史记录、常用就诊人保存 |
| 👥 **合伙人系统** | 多层级推荐网络，递归团队树可视化 |
| 💬 **实时聊天** | 患者与客服实时消息（SignalR） |
| 📊 **管理后台** | 用户管理、预约处理、合伙人审批、数据分析 |
| 🗺️ **诊所地图** | Leaflet 交互地图，多位置导航 |
| 🔐 **身份认证** | JWT 认证，角色访问控制（用户/客服/管理员） |
| 🌐 **国际化** | 英文、中文、孟加拉语 — 运行时切换 |

## 项目结构

```
shennong/
├── frontend/                # React 19 单页应用
│   ├── src/
│   │   ├── api/             # Axios API 客户端
│   │   ├── features/        # 功能模块（认证、聊天、预约、国际化、用户）
│   │   ├── pages/           # 路由页面（首页、管理后台、客服工作台）
│   │   ├── layouts/         # 布局组件
│   │   ├── providers/       # Context 提供者（认证、Socket、国际化）
│   │   ├── components/      # 共享 UI 组件
│   │   └── utils/           # 工具函数
│   └── vite.config.js
│
├── backend/
│   ├── Shennong.Api/        # ASP.NET Core 8 Web API
│   │   ├── Controllers/     # 9 个 API 控制器
│   │   ├── Models/          # EF Core 实体
│   │   ├── DTOs/            # 请求/响应记录
│   │   ├── Data/            # DbContext
│   │   ├── Services/        # JWT、ID 生成
│   │   ├── Hubs/            # SignalR 聊天 Hub
│   │   └── Program.cs       # 依赖注入 + 中间件管道
│   └── Shennong.sln
│
├── terraform/               # AWS 基础设施（ECS、RDS、ALB、VPC）
└── README-zh.md
```

## 技术栈

| 层级 | 技术 |
|-------|-----------|
| 前端 | React 19, Vite (Rolldown), Tailwind CSS, Framer Motion, Recharts, Leaflet |
| 后端 | ASP.NET Core 8, Entity Framework Core, SignalR, BCrypt |
| 认证 | JWT Bearer 令牌，角色授权 |
| 数据库 | SQLite（开发）→ SQL Server（生产） |
| 基础设施 | Terraform → AWS（ECS Fargate, RDS, ALB, Route 53） |
| 实时通信 | SignalR（WebSocket + 长轮询降级） |

## 技术决策

### 前端

**为什么选择 React 19（而非 Next.js）？**
这是一个单页应用，不需要 SSR/SSG — 内容是动态的（预约、聊天、仪表盘），不依赖 SEO。Next.js 会增加不必要的服务器复杂度。React + Vite 保持构建简单，部署到 S3/CloudFront 也很直接。

**为什么选择 Vite + Rolldown（而非 Webpack/CRA）？**
Vite 的开发服务器通过原生 ESM 在毫秒级启动。Rolldown（基于 Rust 的打包器）提供快速的生产构建。CRA 已死；Webpack 对这个项目来说过于复杂。

**为什么选择 Tailwind CSS（而非 styled-components/CSS modules）？**
原子化 CSS 消除了命名决策，保持样式与标记共存。对于单人开发的项目，减少上下文切换比 CSS-in-JS 的灵活性更重要。

**为什么选择 Framer Motion？**
页面过渡和模态框动画。诊所品牌形象需要流畅、精致的体验。Framer Motion 是 React 动画的标准选择 — 声明式、高性能、通过 tree-shaking 保持包体积小巧。

**为什么选择 Leaflet（而非 Google Maps）？**
免费、开源、无需 API 密钥。诊所位置是静态坐标 — 不需要 Google 的路径规划或地点 API。Leaflet + OpenStreetMap 瓦片足够使用且零成本。

**为什么选择 Recharts？**
管理后台需要图表（用户活跃度、预约趋势）。Recharts 是 React 原生组件，可组合，覆盖我们的需求（折线图、面积图、柱状图），无需 D3 的重量级依赖。

**为什么选择 `@microsoft/signalr`（而非 socket.io）？**
后端是 ASP.NET Core — SignalR 是原生选择。它自动处理 WebSocket/长轮询/SSE 协商，集成 ASP.NET 认证中间件，保持技术栈在微软生态内。socket.io 需要在服务端使用第三方桥接。

### 后端

**为什么选择 ASP.NET Core 8（而非 Node.js/Express）？**
原始后端是 Node.js。迁移到 C# 是刻意的决定：
- **类型安全** — 合伙人树递归和邀请统计逻辑在 JS 中有隐蔽的 bug，TypeScript/C# 会在编译时捕获
- **async/await 一致性** — 每个 I/O 操作都是真正的异步，没有回调地狱
- **EF Core 迁移** — 无需手写 ALTER TABLE 语句的 Schema 管理
- **SignalR** — 第一方实时支持，不依赖 socket.io
- **简历价值** — 展示企业级 .NET 技能，符合新西兰就业市场需求

**为什么选择 EF Core（而非 Dapper/原生 SQL）？**
Code First 迁移消除手动 Schema 管理。数据模型足够简单，EF 的开销可以忽略。对于递归合伙人树查询，我们回退到内存遍历 — EF 不原生支持递归 CTE，且用户量不需要优化。

**为什么选择 SQLite（开发）→ SQL Server（生产）？**
SQLite 零配置 — `dotnet run` 即可创建数据库。EF Core 的提供程序模型使切换只需更改连接字符串。生产环境选择 SQL Server 因为 Azure 上免费（最多 10 vCore），集成 AWS/Azure 生态，支持并发写入而无 SQLite 的锁定问题。

**为什么选择 JWT（而非 Session Cookie）？**
前端是与 API 分离部署的 SPA。JWT 令牌跨域工作，无需处理 CORS Cookie 复杂性。7 天过期 + 登录时刷新平衡安全性和用户体验 — 预约患者不想每天重新认证。

**为什么选择 BCrypt（而非 ASP.NET Identity）？**
ASP.NET Identity 带来完整用户管理系统（确认、锁定、双因素），但项目不需要。认证流程简单：注册 → 登录 → 验证。BCrypt 提供密码哈希，无需 Identity 框架的 Schema 和中间件开销。

### 基础设施

**为什么选择 Terraform（而非 CDK/Pulumi/控制台）？**
基础设施即代码对可复现性至关重要。Terraform 云无关（今天 AWS，明天 Azure），拥有最大的提供程序生态，HCL 语法可读。CDK/Pulumi 允许用通用语言编写基础设施，但这是我们不需要的特性 — HCL 的约束保持配置声明式和可审查。

**为什么选择 AWS ECS Fargate（而非 EC2/Lambda）？**
Fargate 提供容器编排而无需管理 EC2 实例。API 是长运行服务器（SignalR WebSocket 连接），Lambda 的冷启动模型不适合。Fargate 的按请求计费适合低流量诊所应用。

**为什么不用 Docker Compose？**
开发环境零外部依赖 — SQLite 嵌入，前端是静态开发服务器。Docker Compose 会增加无谓的复杂性。生产部署通过 Terraform → ECS，而非 docker-compose。

## API

RESTful API，JWT 认证。

| 模块 | 端点 | 描述 |
|--------|-----------|-------------|
| 认证 | `POST /api/auth/register`, `/login`, `GET /verify` | JWT 认证 |
| 用户 | `GET /api/user/profile/:id`, `POST /bind-inviter` | 个人资料 & 推荐绑定 |
| 预约 | `GET/POST /api/appointments` | 预约 & 历史 |
| 就诊人 | `GET/POST/DELETE /api/visitors` | 常用就诊人管理 |
| 合伙人 | `POST /api/partner/apply`, `GET /tree/:id` | 申请 & 层级 |
| 管理 | `GET /api/admin/all`, `/stats`, `/partners-detailed` | 系统数据 |
| 客服 | `GET /api/agent/sessions` | 聊天会话管理 |
| 聊天 | `GET /api/chat/history`, `POST /read` + SignalR hub | 实时消息 |

## 部署

基础设施通过 `terraform/` 中的 Terraform 管理。目标：AWS ECS Fargate + RDS + ALB + Route 53。

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## 许可证

专有软件。保留所有权利。这是一个商业演示 — 非开源。
