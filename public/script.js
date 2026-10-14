"use strict";

const scanForm = document.getElementById("scanForm");
const urlInput = document.getElementById("urlInput");
const resultBox = document.getElementById("result");
const historyList = document.getElementById("historyList");

let history = [];
let lastResult = null;
let counts = { total: 0, safe: 0, threat: 0 };

const API_BASE = "https://phishguard-backend-17id.onrender.com/api";

console.log("PhishGuard AI updated script loaded");

async function saveScanToBackend(item) {
  const response = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: item.url,
      result: item.status
    })
  });

  if (!response.ok) {
    throw new Error(`Backend HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function loadBackendHistory() {
  try {
    const response = await fetch(`${API_BASE}/history`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log("Backend scan history:", data.history);
    return data.history || [];
  } catch (error) {
    console.error("Backend history unavailable:", error);
    return [];
  }
}

function analyzeURL(value) {
  const raw = value.trim();
  if (!raw) throw new Error("Please enter a URL.");

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL. Include https:// or http://");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  if (!url.hostname || !url.hostname.includes(".")) {
    throw new Error("Please enter a valid domain name.");
  }

  const host = url.hostname.toLowerCase();
  const reasons = [];

  if (url.protocol === "http:") {
    reasons.push("Website does not use HTTPS");
  }
  if (url.username || url.password) {
    reasons.push("URL contains embedded credentials");
  }
  if (host.includes("xn--")) {
    reasons.push("Internationalized domain requires review");
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    reasons.push("URL uses an IP address as its hostname");
  }
  if (/(login|verify|account|password|secure|update)/i.test(
    url.hostname + url.pathname
  )) {
    reasons.push("Contains a keyword sometimes used in phishing");
  }

  return {
    url: raw,
    status: reasons.length ? "Suspicious" : "Safe",
    reasons: reasons.length ? reasons : ["No basic warning signs detected"],
    time: new Date().toLocaleString()
  };
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showResult(item) {
  resultBox.className = "result";

  if (item.status === "Safe") {
    resultBox.classList.add("safe");
  } else if (item.status === "Suspicious") {
    resultBox.classList.add("suspicious");
  } else {
    resultBox.classList.add("phishing");
  }

  resultBox.innerHTML = `
    <h3>Demo Analysis Result: ${escapeHTML(item.status)}</h3>
    <p><strong>URL:</strong> ${escapeHTML(item.url)}</p>
    <p><strong>Time:</strong> ${escapeHTML(item.time)}</p>
    <p><strong>Observations:</strong></p>
    <ul>${item.reasons.map(reason =>
      `<li>${escapeHTML(reason)}</li>`
    ).join("")}</ul>
    <p><small>Heuristic demo only; this is not a verified security verdict.</small></p>
  `;
}

function updateCounts() {
  document.getElementById("totalScans").textContent = counts.total;
  document.getElementById("safeCount").textContent = counts.safe;
  document.getElementById("threatCount").textContent = counts.threat;
}

function saveResult(item) {
  history.unshift(item);
  counts.total++;

  if (item.status === "Safe") {
    counts.safe++;
  } else {
    counts.threat++;
  }

  updateCounts();
  renderHistory();
}

function renderHistory() {
  if (!history.length) {
    historyList.innerHTML =
      '<p class="empty">No scans yet. Start by scanning a URL.</p>';
    return;
  }

  historyList.innerHTML = history.map(item => `
    <div class="history-item">
      <div><strong>${escapeHTML(item.url)}</strong></div>
      <div class="status">${escapeHTML(item.status)}</div>
      <small>${escapeHTML(item.time)}</small>
    </div>
  `).join("");
}

scanForm.addEventListener("submit", async event => {
  event.preventDefault();

  let item;
  try {
    item = analyzeURL(urlInput.value);
  } catch (error) {
    resultBox.className = "result suspicious";
    resultBox.textContent = error.message;
    return;
  }

  lastResult = item;
  showResult(item);
  saveResult(item);

  try {
    await saveScanToBackend(item);
    resultBox.insertAdjacentHTML(
      "beforeend",
      "<p><small>Scan saved to backend history.</small></p>"
    );
  } catch (error) {
    resultBox.insertAdjacentHTML(
      "beforeend",
      "<p><small>Backend save failed. Check the connection.</small></p>"
    );
    console.error("Backend save error:", error);
  }
});

document.getElementById("bulkButton").addEventListener("click", async () => {
  const urls = document.getElementById("bulkInput").value
    .split(/\r?\n/)
    .map(url => url.trim())
    .filter(Boolean);

  const output = document.getElementById("bulkResults");
  output.replaceChildren();

  if (!urls.length) {
    output.textContent = "Please enter at least one URL.";
    return;
  }

  for (const value of urls) {
    let item;

    try {
      item = analyzeURL(value);
    } catch (error) {
      item = {
        url: value,
        status: "Invalid URL",
        reasons: [error.message],
        time: new Date().toLocaleString()
      };
    }

    const row = document.createElement("div");
    row.className = "bulk-item";

    const title = document.createElement("strong");
    title.textContent = item.url;

    const status = document.createElement("p");
    status.textContent = item.status;

    row.append(title, status);
    output.appendChild(row);

    if (item.status !== "Invalid URL") {
      saveResult(item);
      lastResult = item;

      try {
        await saveScanToBackend(item);
      } catch (error) {
        console.error("Bulk scan save error:", error);
      }
    }
  }
});

document.getElementById("reportButton").addEventListener("click", () => {
  if (!lastResult) {
    alert("Please scan a URL before downloading the report.");
    return;
  }

  const rows = [
    ["Field", "Value"],
    ["Project", "AI Powered Phishing Detection System"],
    ["URL", lastResult.url],
    ["Demo Result", lastResult.status],
    ["Time", lastResult.time],
    ["Observations", lastResult.reasons.join("; ")],
    ["Disclaimer", "Heuristic demo; not a verified security verdict"]
  ];

  const csv = rows.map(row =>
    row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const objectURL = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectURL;
  link.download = "phishing-scan-report.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectURL);
});

document.getElementById("clearHistory").addEventListener("click", () => {
  history = [];
  counts = { total: 0, safe: 0, threat: 0 };
  lastResult = null;

  updateCounts();
  renderHistory();
});

document.getElementById("qrInput").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  if (!("BarcodeDetector" in window)) {
    alert("QR image reading is not supported in this browser.");
    event.target.value = "";
    return;
  }

  let bitmap;

  try {
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    bitmap = await createImageBitmap(file);
    const codes = await detector.detect(bitmap);

    if (!codes.length) {
      alert("No QR code found in this image.");
    } else {
      urlInput.value = codes[0].rawValue;
      alert("QR content loaded. Check the URL before scanning.");
    }
  } catch (error) {
    alert("Unable to read this QR image.");
    console.error("QR scan error:", error);
  } finally {
    if (bitmap) bitmap.close();
    event.target.value = "";
  }
});

loadBackendHistory();
renderHistory();
