// utils/time.js
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// 輸出澳門時區標準時間
export function nowMacau(format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs().tz('Asia/Macau').format(format);
}

// 輸出多久前（分鐘）
export function minsAgoMacau(dt) {
  if (!dt) return '--';
  const now = dayjs().tz('Asia/Macau');
  const t = dayjs.tz(dt, 'Asia/Macau');
  return Math.max(0, now.diff(t, 'minute'));
}

// 輸出距離多久後（分鐘:秒）
export function untilMacau(dt) {
  if (!dt) return '--:--';
  const now = dayjs().tz('Asia/Macau');
  const t = dayjs.tz(dt, 'Asia/Macau');
  let diff = Math.floor(t.diff(now, 'second'));
  if (diff <= 0) return '00:00';
  const mm = String(Math.floor(diff/60)).padStart(2,'0');
  const ss = String(diff%60).padStart(2,'0');
  return `${mm}:${ss}`;
}
///// the end of utils/time.js
