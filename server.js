const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('./'));

// ==============================================
// 🔐 管理后台配置
// ==============================================
const ADMIN_PASSWORD = 'admin123';  // 管理后台密码，改成你自己的

// ==============================================
// 💾 本地JSON数据库（简单可靠！）
// ==============================================
const DB_FILE = path.join(__dirname, 'leads.json');

function readLeads() {
  if (!fs.existsSync(DB_FILE)) return [];
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveLeads(leads) {
  fs.writeFileSync(DB_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

function addLead(data) {
  const leads = readLeads();
  leads.unshift({
    id: Date.now(),
    ...data,
    status: '待联系'
  });
  saveLeads(leads);
  return leads;
}

// ==============================================
// 🎯 多种通知方案 - 选择你喜欢的一种就行
// ==============================================

// =============== 方案0：微信推送（个人用户首选！）===============
const SERVERCHAN_SENDKEY = 'SCTxxxxxxxxxxxxxxxxxxxxxxxxxx';

// =============== 方案1：邮件通知 ===============
const RESEND_API_KEY = 're_xxxxxxxxxx';
const NOTIFY_EMAIL = '你的邮箱@公司.com';

// =============== 方案2：企业微信群机器人 ===============
const WECOM_WEBHOOK = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=你的key';

// =============== 方案3：飞书群机器人（个人也能用）===============
const FEISHU_WEBHOOK = 'https://open.feishu.cn/open-apis/bot/v2/hook/你的飞书机器人key';

// 提交接口
app.post('/api/submit', async (req, res) => {
  const data = req.body;
  console.log('📥 收到新客户预约:', data);

  try {
    // 💾 第一步：保存到本地数据库
    addLead(data);
    console.log('💾 客户已保存到本地数据库');

    // 💬 方案0：微信推送（个人用户首选！）
    if (!SERVERCHAN_SENDKEY.includes('xxxxxx')) {
      await fetch(`https://sctapi.ftqq.com/${SERVERCHAN_SENDKEY}.send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `🏢 新客户：${data.name} - ${data.phone}`,
          desp: `### 客户预约信息\n\n| 项目 | 内容 |\n|------|------|\n| 👤 客户 | ${data.name} |\n| 📞 电话 | ${data.phone} |\n| 📐 面积 | ${data.area || '未填写'} |\n| 💺 工位 | ${data.workstations || '未填写'} |\n| 🚪 隔断 | ${data.partitions || '未填写'} |\n| 📍 区域 | ${data.region || '未填写'} |\n| ⏰ 时间 | ${data.time} |\n\n👉 管理后台：${req.headers.origin || '部署后你的域名'}/admin.html`
        })
      });
      console.log('✅ 微信通知已发送');
    }

    // 📧 方案1：发邮件通知
    if (!RESEND_API_KEY.includes('xxxxxx')) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: '办公室预约 <onboarding@resend.dev>',
          to: NOTIFY_EMAIL,
          subject: `🏢 新客户预约：${data.name}`,
          html: `
            <div style="padding:20px; max-width:600px;">
              <h2 style="color:#2563eb;">🏢 新客户预约提醒</h2>
              <table style="width:100%; border-collapse:collapse;">
                <tr style="background:#f8fafc;"><td style="padding:10px; border:1px solid #e2e8f0;">👤 客户</td><td style="padding:10px; border:1px solid #e2e8f0;"><strong>${data.name}</strong></td></tr>
                <tr><td style="padding:10px; border:1px solid #e2e8f0;">📞 电话</td><td style="padding:10px; border:1px solid #e2e8f0;"><strong>${data.phone}</strong></td></tr>
                <tr style="background:#f8fafc;"><td style="padding:10px; border:1px solid #e2e8f0;">📐 面积</td><td style="padding:10px; border:1px solid #e2e8f0;">${data.area || '未填写'}</td></tr>
                <tr><td style="padding:10px; border:1px solid #e2e8f0;">💺 工位</td><td style="padding:10px; border:1px solid #e2e8f0;">${data.workstations || '未填写'}</td></tr>
                <tr style="background:#f8fafc;"><td style="padding:10px; border:1px solid #e2e8f0;">🚪 隔断</td><td style="padding:10px; border:1px solid #e2e8f0;">${data.partitions || '未填写'}</td></tr>
                <tr><td style="padding:10px; border:1px solid #e2e8f0;">📍 区域</td><td style="padding:10px; border:1px solid #e2e8f0;">${data.region || '未填写'}</td></tr>
                <tr style="background:#f8fafc;"><td style="padding:10px; border:1px solid #e2e8f0;">⏰ 提交时间</td><td style="padding:10px; border:1px solid #e2e8f0;">${data.time}</td></tr>
              </table>
            </div>
          `
        })
      });
      console.log('✅ 邮件已发送到', NOTIFY_EMAIL);
    }

    // 💬 方案2：推送到企业微信群
    if (!WECOM_WEBHOOK.includes('你的key')) {
      await fetch(WECOM_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msgtype: 'markdown',
          markdown: {
            content: `🏢 **新客户预约提醒**\n\n👤 客户：<font color=\"info\">${data.name}</font>\n📞 电话：<font color=\"comment\">${data.phone}</font>\n\n📐 面积：${data.area || '未填写'}\n💺 工位：${data.workstations || '未填写'}\n🚪 隔断：${data.partitions || '未填写'}\n📍 区域：${data.region || '未填写'}\n\n⏰ 时间：${data.time}`
          }
        })
      });
      console.log('✅ 已推送到企业微信群');
    }

    // 🦜 方案3：推送到飞书群
    if (!FEISHU_WEBHOOK.includes('你的飞书')) {
      await fetch(FEISHU_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_type: 'interactive',
          card: {
            header: { title: { tag: 'plain_text', content: '🏢 新客户预约提醒' }, template: 'blue' },
            elements: [
              { tag: 'div', text: { tag: 'lark_md', content: `👤 **客户**: ${data.name}\n📞 **电话**: ${data.phone}` } },
              { tag: 'div', text: { tag: 'lark_md', content: `📐 **面积**: ${data.area || '未填写'}\n💺 **工位**: ${data.workstations || '未填写'}` } },
              { tag: 'div', text: { tag: 'lark_md', content: `🚪 **隔断**: ${data.partitions || '未填写'}\n📍 **区域**: ${data.region || '未填写'}\n⏰ 提交时间: ${data.time}` } }
            ]
          }
        })
      });
      console.log('✅ 推送到飞书群成功');
    }

    res.json({ success: true, message: '提交成功' });
  } catch (err) {
    console.log('❌ 通知失败:', err.message || err);
    res.json({ success: true, message: '提交成功' });
  }
});

// ==============================================
// 📊 客户管理后台 API
// ==============================================

app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: '密码错误' });
  }
});

app.get('/api/admin/leads', (req, res) => {
  res.json(readLeads());
});

app.post('/api/admin/leads/:id/status', (req, res) => {
  const leads = readLeads();
  const lead = leads.find(l => l.id === parseInt(req.params.id));
  if (lead) {
    lead.status = req.body.status;
    saveLeads(leads);
  }
  res.json({ success: true });
});

app.delete('/api/admin/leads/:id', (req, res) => {
  let leads = readLeads();
  leads = leads.filter(l => l.id !== parseInt(req.params.id));
  saveLeads(leads);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 服务已启动                               ║
║                                               ║
║   客户表单: http://localhost:${PORT}            ║
║   管理后台: http://localhost:${PORT}/admin.html ║
║   后台密码: ${ADMIN_PASSWORD}                           ║
║                                               ║
╚═══════════════════════════════════════════════╝
  `);
});
