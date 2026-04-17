const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// ==============================================
// 📱 只需要配置这一行就行！
// ==============================================
// 打开 https://sct.ftqq.com 微信扫码，复制SendKey
const SERVERCHAN_SENDKEY = 'SCT339077T2nj7iSqTglQccCg14lcGsl1t';


// 提交接口
app.post('/api/submit', async (req, res) => {
  const data = req.body;
  console.log('📥 新客户:', data.name, data.phone);

  try {
    // ✅ 直接推送微信
    if (!SERVERCHAN_SENDKEY.includes('xxxxxx')) {
      await fetch(`https://sctapi.ftqq.com/${SERVERCHAN_SENDKEY}.send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `🏢 新客户：${data.name} - ${data.phone}`,
          desp: `
### 客户预约信息

| 项目 | 内容 |
|------|------|
| 👤 姓名 | ${data.name} |
| 📞 电话 | ${data.phone} |
| 🏭 业态 | ${data.businessType || '未填写'} |
| 📐 面积 | ${data.area || '未填写'} |
| 💺 工位 | ${data.workstations || '未填写'} |
| 🚪 隔断 | ${data.partitions || '未填写'} |
| ❓ 换房原因 | ${data.reason || '未填写'} |
| 📍 区域 | ${data.region || '未填写'} |
| ⏰ 时间 | ${data.time} |
`
        })
      });
      console.log('✅ 微信通知已发送！');
    }

    res.json({ success: true, message: '提交成功' });
  } catch (err) {
    console.log('❌ ', err.message || err);
    res.json({ success: true, message: '提交成功' });
  }
});


// 本地开发用
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`本地启动: http://localhost:${PORT}`);
  });
}

// 微信云托管导出
module.exports = app;
