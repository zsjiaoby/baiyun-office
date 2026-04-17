const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// ==============================================
// 🦜 飞书配置 - 个人用户完美方案
// ==============================================
// 1. 飞书建一个只有你自己的群
// 2. 群设置 → 机器人 → 添加自定义机器人 → 复制下面这个地址
const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/替换成你的机器人key';

// 提交接口
app.post('/api/submit', async (req, res) => {
  const data = req.body;
  console.log('📥 收到新客户预约:', data.name, data.phone);

  try {
    // 🦜 推送到飞书群
    if (!FEISHU_WEBHOOK.includes('替换成你的')) {
      await fetch(FEISHU_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'interactive',
          card: {
            header: {
              title: { tag: 'plain_text', content: '🏢 新客户预约提醒' },
              template: 'blue'
            },
            elements: [
              { tag: 'div', text: { tag: 'lark_md', content: `👤 **客户**: ${data.name}\n📞 **电话**: ${data.phone}` } },
              { tag: 'div', text: { tag: 'lark_md', content: `📐 **面积**: ${data.area || '未填写'}\n💺 **工位**: ${data.workstations || '未填写'}` } },
              { tag: 'div', text: { tag: 'lark_md', content: `🚪 **隔断**: ${data.partitions || '未填写'}\n❓ **换房原因**: ${data.reason || '未填写'}` } },
              { tag: 'div', text: { tag: 'lark_md', content: `📍 **区域**: ${data.region || '未填写'}\n⏰ **提交时间**: ${data.time}` } },
              { tag: 'hr' },
              { tag: 'action', actions: [
                { tag: 'button', text: { tag: 'plain_text', content: '📞 立即回电' }, type: 'primary', url: `tel:${data.phone}` },
                { tag: 'button', text: { tag: 'plain_text', content: '📋 查看所有客户' }, url: 'https://bytedance.feishu.cn/base/替换成你的多维表格地址' }
              ]}
            ]
          }
        })
      });
      console.log('✅ 已推送到飞书群');
    }

    res.json({ success: true, message: '提交成功' });
  } catch (err) {
    console.log('❌ 推送失败:', err.message || err);
    res.json({ success: true, message: '提交成功' });
  }
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🦜 飞书版本已启动                            ║
║                                               ║
║   客户表单: http://localhost:${PORT}            ║
║                                               ║
║   配置说明:                                    ║
║   1. 修改 server-feishu-only.js 第14行        ║
║   2. 替换成你的飞书机器人 webhook 地址        ║
║                                               ║
║   📤 部署方式: Vercel 一键部署，免费          ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});
