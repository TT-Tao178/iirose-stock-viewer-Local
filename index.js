const http = require('http');

exports.name = 'stock-viewer';

exports.apply = (ctx) => {
  const logger = ctx.logger('stock-viewer');

  const MAX_POINTS = 200;   // 最多保存200条历史数据
  const PORT = 5858;        // 独立端口（请确保无冲突）

  // 内存存储
  let priceHistory = [];
  let timeHistory = [];
  let lastFullData = null;

  // 监听股票更新事件
  ctx.on('iirose/stock-update', (data) => {
    lastFullData = data;
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    priceHistory.push(data.unitPrice);
    timeHistory.push(timeStr);
    if (priceHistory.length > MAX_POINTS) {
      priceHistory.shift();
      timeHistory.shift();
    }
    logger.debug(`📈 股票更新: ${data.unitPrice} 钞 (共 ${priceHistory.length} 条记录)`);
  });

  // HTTP 服务器
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 数据接口
    if (req.url === '/data') {
      const exportData = {
        lastUpdate: new Date().toISOString(),
        current: lastFullData || { unitPrice: 0, totalStock: 0, totalMoney: 0 },
        history: {
          prices: priceHistory,
          times: timeHistory
        }
      };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(exportData));
      return;
    }

    // 提供 HTML 页面
    if (req.url === '/' || req.url === '/stock') {
      const fs = require('fs');
      const path = require('path');
      const htmlPath = path.join(__dirname, 'stock.html');
      fs.readFile(htmlPath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end(`HTML file not found: ${htmlPath}`);
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  server.listen(PORT, () => {
    logger.info(`✅ 股票看板已启动 → http://localhost:${PORT}`);
    logger.info(`📊 历史数据上限 ${MAX_POINTS} 条，重启后清空`);
  });

  ctx.on('dispose', () => {
    server.close();
    logger.info('股票看板服务器已关闭');
  });
};