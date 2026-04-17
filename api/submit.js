export default async function handler(req, res) {
  // ✅ 手动解析JSON body，Vercel默认不解析！
  let data;
  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString();
    data = JSON.parse(body);
  } catch (e) {
    data = req.body || {};
  }

  console.log('📥 新客户:', data.name, data.phone);

  try {
    const SENDKEY = 'SCT339077T2nj7iSqTglQccCg14lcGsl1t';
    
    await fetch(`https://sctapi.ftqq.com/${SENDKEY}.send`, {
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

    res.status(200).json({ success: true });
  } catch (err) {
    console.log('❌', err.message);
    res.status(200).json({ success: true });
  }
}
