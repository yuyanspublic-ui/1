/**
 * 2026暑假課程報名資料收集後端
 * 使用方式：
 * 1. 建立 Google 試算表，命名例如：2026暑假課程報名資料
 * 2. 試算表上方選單：擴充功能 → Apps Script
 * 3. 貼上本檔內容並儲存
 * 4. 部署 → 新部署作業 → 類型選「網頁應用程式」
 * 5. 執行身分選「我」，誰可以存取選「任何人」
 * 6. 複製 /exec 結尾的 Web app URL，貼回 index.html 的 GOOGLE_SCRIPT_URL
 */

const SHEET_NAME = '報名資料';

function doGet(e) {
  return json_({
    ok: true,
    message: '2026暑假課程報名資料收集後端運作中。請用網頁表單送出資料。'
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet_();
    ensureHeaders_(sheet);

    const payloadText = (e && e.postData && e.postData.contents) || (e && e.parameter && e.parameter.payload) || '{}';
    const data = JSON.parse(payloadText);

    sheet.appendRow(buildRow_(data));

    return json_({
      ok: true,
      id: data.id || '',
      message: 'saved'
    });
  } catch (err) {
    return json_({
      ok: false,
      error: String(err && err.message ? err.message : err)
    });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const headers = [
    '寫入時間',
    '報名編號',
    '家長送出時間',
    '學生姓名',
    '家長電話',
    '就讀學校',
    '年級',
    '身分證字號',
    '出生年月日',
    '已選日期數',
    '總堂數',
    '7月合計',
    '8月合計',
    '總金額',
    '勾選日期',
    '課程明細',
    '費用明細',
    '來源網址'
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    return;
  }

  const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const needsHeader = existing.every(cell => cell === '');
  if (needsHeader) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

function buildRow_(data) {
  const selections = Array.isArray(data.selections) ? data.selections : [];
  const feeLines = Array.isArray(data.feeLines) ? data.feeLines : [];
  const mealDates = Array.isArray(data.mealDates) ? data.mealDates : [];

  const selectedDateSet = {};
  selections.forEach(item => {
    const key = `${item.date || ''} ${item.weekday || ''}`.trim();
    if (key) selectedDateSet[key] = true;
  });
  mealDates.forEach(date => {
    if (date) selectedDateSet[date] = true;
  });

  const courseDetail = selections.map(item => {
    return [
      item.date || '',
      item.weekday || '',
      item.periodName || '',
      item.time || '',
      item.route || '',
      item.course || '',
      item.unitPrice ? `$${item.unitPrice}` : ''
    ].filter(Boolean).join(' ');
  }).join('；');

  const feeDetail = feeLines.map(item => {
    return [
      item.month || '',
      item.type || '',
      item.name || '',
      `數量${item.qty || 0}`,
      `單價${item.unit || 0}`,
      `小計${item.amount || 0}`
    ].join(' ');
  }).join('；');

  return [
    new Date(),
    data.id || '',
    data.createdAtText || data.submittedAtISO || '',
    data.studentName || '',
    data.parentPhone || '',
    data.schoolName || '',
    data.grade || '',
    data.insuranceInfo && data.insuranceInfo.idNumber ? data.insuranceInfo.idNumber : '',
    data.insuranceInfo && data.insuranceInfo.birthDate ? data.insuranceInfo.birthDate : '',
    data.selectedDateCount || Object.keys(selectedDateSet).length || 0,
    data.selectedSessionCount || selections.length || 0,
    data.monthTotals && data.monthTotals['2026-07'] ? data.monthTotals['2026-07'] : 0,
    data.monthTotals && data.monthTotals['2026-08'] ? data.monthTotals['2026-08'] : 0,
    data.totalAmount || 0,
    Object.keys(selectedDateSet).join('、'),
    courseDetail,
    feeDetail,
    data.submittedFrom || ''
  ];
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
