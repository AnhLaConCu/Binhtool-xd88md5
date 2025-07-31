const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const API_URL = "https://taixiumd5.system32-cloudfare-356783752985678522.monster/api/md5luckydice/GetSoiCau";

const getTaiXiu = sum => (sum >= 11 ? 't' : 'x');

function buildPattern(data) {
  return data.map(item => getTaiXiu(item.DiceSum)).join('');
}

function predictNext(pattern) {
  const order = 3;
  const map = {};

  for (let i = 0; i < pattern.length - order; i++) {
    const prefix = pattern.slice(i, i + order);
    const next = pattern[i + order];
    if (!map[prefix]) map[prefix] = { t: 0, x: 0 };
    map[prefix][next]++;
  }

  const last = pattern.slice(-order);
  const predict = map[last];

  if (!predict) return '';

  return predict.t > predict.x ? 't' : 'x';
}

app.get("/api/taixiu", async (req, res) => {
  try {
    const response = await axios.get(API_URL);
    const list = response.data;

    if (!Array.isArray(list) || list.length === 0) {
      return res.status(500).json({ error: "Không có dữ liệu hợp lệ từ API" });
    }

    const current = list[0];
    const pattern = buildPattern(list);
    const duDoan = predictNext(pattern);

    res.json({
      id: "binhtool90",
      Phien: current.SessionId,
      Xuc_xac_1: current.FirstDice,
      Xuc_xac_2: current.SecondDice,
      Xuc_xac_3: current.ThirdDice,
      Tong: current.DiceSum,
      Ket_qua: getTaiXiu(current.DiceSum) === 't' ? 'Tài' : 'Xỉu',
      Pattern: pattern,
      Du_doan: duDoan === 't' ? 'Tài' : duDoan === 'x' ? 'Xỉu' : ''
    });

  } catch (err) {
    res.status(500).json({ error: "Lỗi khi fetch dữ liệu", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}/api/taixiu`);
});
