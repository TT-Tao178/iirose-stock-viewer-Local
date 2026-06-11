// index.js
const fs = require('fs');
const path = require('path');
const http = require('http');

exports.name = 'stock-viewer';

exports.apply = (ctx) => {
  const logger = ctx.logger('stock-viewer');

  // 存储历史数据（最多 100 条）
  let priceHistory = [];
  let timeHistory = [];
  const MAX_POINTS = 100;

  // 数据文件保存路径（用于持久化，可选）
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  const dataFilePath = path.join(dataDir, 'stock_data.json');

  // 监听股票更新事件
  ctx.on('iirose/stock-update', (data) => {
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    priceHistory.push(data.unitPrice);
    timeHistory.push(timeStr);

    if (priceHistory.length > MAX_POINTS) {
      priceHistory.shift();
      timeHistory.shift();
    }

    const exportData = {
      lastUpdate: now.toISOString(),
      current: data,
      history: { prices: priceHistory, times: timeHistory }
    };

    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(exportData, null, 2));
      logger.debug(`数据已更新: 股价 ${data.unitPrice}`);
    } catch (err) {
      logger.error('写入文件失败', err);
    }
  });

  // ---------- 独立 HTTP 服务器 ----------
  const PORT = 3000;  // 可以改成其他未占用的端口，比如 8080
  const server = http.createServer((req, res) => {
    // 处理跨域（允许本地网页直接访问）
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 路由：提供 HTML 页面
    if (req.url === '/' || req.url === '/stock') {
      const htmlPath = path.join(__dirname, 'stock.html');
      fs.readFile(htmlPath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('HTML file not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
    }
    // 路由：提供 JSON 数据
    else if (req.url === '/data') {
      fs.readFile(dataFilePath, (err, content) => {
        if (err) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '暂无数据' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(content);
      });
    }
    else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  server.listen(PORT, () => {
    logger.info(`独立股票服务器已启动，请访问 http://localhost:${PORT} 查看图表`);
  });

  // 可选：在插件卸载时关闭服务器（避免端口残留）
  ctx.on('dispose', () => {
    server.close();
    logger.info('独立服务器已关闭');
  });
};