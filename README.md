# iirose-stock-viewer-Local

为 Koishi 开发的股票数据实时看板插件，监听 `iirose-stock-monitor` 的更新事件，提供独立的网页图表和崩溃日志。

## ✨ 特性

- 自动监听股票更新，内存保存最多 200 条历史（重启清空）
- 独立 HTTP 服务器（默认端口 `5858`），不依赖 Koishi 控制台路由
- 整体走势图 + 近期波动图（最后 20 笔）
- 实时行情：当前股价、涨跌额/涨跌幅、总股数、总金
- 逐笔历史记录（带涨跌箭头和百分比）
- 崩溃日志（自动记录股价跌回 1 的时刻）
- 深色/浅色主题切换（自动保存）

## 📦 安装与部署

### 1. 下载插件文件夹

将本插件文件夹（例如 `stock-viewer`）复制到你的 Koishi **数据目录的根目录**（即 `koishi.yml` 所在的文件夹）。

通常该目录位于：
- Windows：`C:\Users\你的用户名\AppData\Roaming\Koishi\Desktop\data\instances\default\`
- 或者你自定义的 Koishi 项目文件夹。

### 2. 确认文件夹结构

确保插件文件夹内包含以下两个文件：
```
你的 Koishi 根目录/
├── koishi.yml # 配置文件
├── stock-viewer/ # 插件文件夹（名称可自定义，但需与配置一致）
│ ├── index.js
│ └── stock.html
└── ...其他插件及文件夹
```

### 3. 修改 koishi.yml

在 `plugins` 字段下，使用**相对路径**添加一行（注意缩进为两个空格）：

```yaml
plugins:
  # 你的其他插件...
  ./你的这两个文件所在目录: {}               # 路径相对于 koishi.yml 所在目录
```

### 4. 前置条件
Koishi 正在运行（后台/前台均可）。

- iirose-adapter 插件已正确登录花园房间。

- iirose-stock-monitor 插件已启用，并已通过指令 /iirose.stock.on 开启监听。

- 确保端口 5858 没有被其他程序占用（如果你修改过 index.js 中的 PORT 变量，请使用修改后的端口）。

# 🚀 启动与访问
启动 Koishi（如果已运行，请重启以加载插件）。

查看控制台日志，确认出现类似：

```
[stock-viewer] ✅ 股票看板已启动 → http://localhost:5858
打开浏览器，访问 http://localhost:5858 即可看到实时看板。
```
💡 如果页面无数据，请等待花园股价变动一次（或发送指令触发生成），图表会自动刷新。

🔧 自定义配置
```
编辑 stock-viewer/index.js 文件，修改以下常量：

js
const MAX_POINTS = 200;   // 最大历史记录条数（默认200）
const PORT = 5858;        // HTTP 服务器端口
修改后重启 Koishi 生效。
```