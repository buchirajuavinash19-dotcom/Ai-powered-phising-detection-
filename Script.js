const scanForm = document.getElementById("scanForm");
const urlInput = document.getElementById("urlInput");
const resultBox = document.getElementById("result");
const historyList = document.getElementById("historyList");

let history = [];
let lastResult = null;
let counts = { total: 0, safe: 0, threat: 0 };

function analyzeURL(value) {
  const raw = value.trim();

  if (!raw) {
    throw new Error("Please enter a URL.");
  }

  let url;

  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL. Include https:// or http://");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
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

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    reasons.push("URL uses an IP address as its hostname");
  }

  if (/(login|verify|account|password|secure|update)/i.test(
    url.hostname + url.pathname
  )) {
    reasons.push("Contains a keyword sometimes used in phishing");
  }

  let status = "Safe";

  if (reasons.length >= 2) {
    status = "Suspicious";
  } else if (reasons.length === 1) {
    status = "Suspicious";
  }

  return {
    url: raw,
    status,
    reasons: reasons.length ? reasons : [
      "No basic warning signs detected"
    ],
    time: new Date().toLocaleString()
  };
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
    <h3>Demo Analysis Result: ${item.status}</h3>
    <p><strong>URL:</strong> ${escapeHTML(item.url)}</p>
    <p><strong>Time:</strong> ${escapeHTML(item.time)}</p>
    <p><strong>Observations:</strong></p>
    <ul>
      ${item.reasons.map(reason =>
        `<li>${escapeHTML(reason)}</li>`
      ).join("")}
    </ul>
    <p><small>This is a heuristic demo, not a verified security verdict.</small></p>
  `;
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

function saveResult(item) {
  history.unshift(item);
  counts.total++;

  if (item.status === "Safe") {
    counts.safe++;
  } else {
    counts.threat++;
  }

  document.getElementById("totalScans").textContent = counts.total;
  document.getElementById("safeCount").textContent = counts.safe;
  document.getElementById("threatCount").textContent = counts.threat;

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

scanForm.addEventListener("submit", event => {
  event.preventDefault();

  try {
    const item = analyzeURL(urlInput.value);
    lastResult = item;
    showResult(item);
    saveResult(item);
  } catch (error) {
    resultBox.className = "result suspicious";
    resultBox.textContent = error.message;
  }
});

document.getElementById("bulkButton").addEventListener("click", () => {
  const urls = document.getElementById("bulkInput").value
    .split(/\r?\n/)
    .map(url => url.trim())
    .filter(Boolean);

  const output = document.getElementById("bulkResults");

  if (!urls.length) {
    output.textContent = "Please enter at least one URL.";
    return;
  }

  output.innerHTML = "";

  urls.forEach(value => {
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
    }
  });
});

document.getElementById("reportButton").addEventListener("click", () => {
  if (!lastResult) {
    alert("Please scan a URL before downloading the report.");
    return;
  }

  const content = [
    ["Field", "Value"],
    ["Project", "AI Powered Phishing Detection System"],
    ["URL", lastResult.url],
    ["Demo Result", lastResult.status],
    ["Time", lastResult.time],
    ["Observations", lastResult.reasons.join("; ")],
    ["Disclaimer", "Frontend heuristic demo; not a verified security verdict"]
  ];

  const csv = content.map(row =>
    row.map(value =>
      '"' + String(value).replace(/"/g, '""') + '"'
    ).join(",")
  ).join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "phishing-scan-report.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

document.getElementById("clearHistory").addEventListener("click", () => {
  history = [];
  counts = { total: 0, safe: 0, threat: 0 };
  lastResult = null;

  document.getElementById("totalScans").textContent = "0";
  document.getElementById("safeCount").textContent = "0";
  document.getElementById("threatCount").textContent = "0";

  renderHistory();
});

document.getElementById("qrInput").addEventListener("change", async event => {
  const file = event.target.files[0];

  if (!file) return;

  if (!("BarcodeDetector" in window)) {
    alert("QR image reading is not supported in this browser. Use your existing QR scanner module.");
    event.target.value = "";
    return;
  }

  try {
    const detector = new BarcodeDetector({ formats: ["qr_code"] });
    const bitmap = await createImageBitmap(file);
    const codes = await detector.detect(bitmap);

    if (!codes.length) {
      alert("No QR code found in this image.");
    } else {
      urlInput.value = codes[0].rawValue;
      alert("QR content loaded. Check the URL before scanning.");
    }

    bitmap.close();
  } catch {
    alert("Unable to read this QR image.");
  }

  event.target.value = "";
});

renderHistory();
    
