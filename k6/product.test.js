import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: "30s", target: 10 }, // tăng dần lên 10 users
    { duration: "60s", target: 30 }, // tăng lên 30 users
    { duration: "60s", target: 30 }, // giữ ổn định
    { duration: "30s", target: 0 },  // giảm về 0
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],   // < 1% request lỗi
    http_req_duration: ["p(95)<500"], // 95% request < 500ms
  },
};

export default function () {
  const url =
    'http://localhost:3000/api/products?q=áo&page=1&limit=12';

  const res = http.get(url);

  // ✅ Kiểm tra kết quả trả về
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'data exists': (r) => r.json('data') !== undefined,
  });

  sleep(1); // giả lập người dùng nghĩ 1 giây
}
