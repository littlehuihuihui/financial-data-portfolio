/**
 * 轻量 Markdown → HTML（教程专用，覆盖标题/列表/表格/代码/引用/细节折叠）
 */
(function (global) {
  "use strict";

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function inline(s) {
    let t = esc(s);
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  }

  function renderTable(rows) {
    if (rows.length < 2) return "";
    const head = rows[0].split("|").map((c) => c.trim()).filter(Boolean);
    const body = rows.slice(2).map((r) => r.split("|").map((c) => c.trim()).filter(Boolean));
    let html = "<div class=\"learn-table-wrap\"><table class=\"learn-table\"><thead><tr>";
    head.forEach((h) => { html += "<th>" + inline(h) + "</th>"; });
    html += "</tr></thead><tbody>";
    body.forEach((cols) => {
      html += "<tr>";
      cols.forEach((c) => { html += "<td>" + inline(c) + "</td>"; });
      html += "</tr>";
    });
    html += "</tbody></table></div>";
    return html;
  }

  function mdToHtml(src) {
    const lines = String(src || "").replace(/\r\n/g, "\n").split("\n");
    const out = [];
    let i = 0;
    let inCode = false;
    let codeLang = "";
    let codeBuf = [];
    let listType = null;
    let listBuf = [];
    let tableBuf = [];
    let inDetails = false;
    let detailsSummary = "";
    let detailsBuf = [];

    function flushList() {
      if (!listType) return;
      const tag = listType === "ol" ? "ol" : "ul";
      out.push("<" + tag + ">");
      listBuf.forEach((item) => out.push("<li>" + inline(item) + "</li>"));
      out.push("</" + tag + ">");
      listType = null;
      listBuf = [];
    }

    function flushTable() {
      if (!tableBuf.length) return;
      out.push(renderTable(tableBuf));
      tableBuf = [];
    }

    function flushDetails() {
      if (!inDetails) return;
      const body = detailsBuf.join("\n");
      out.push(
        '<details class="learn-answer"><summary>' +
          inline(detailsSummary || "参考答案") +
          "</summary><div class=\"learn-answer-body\">" +
          mdToHtml(body) +
          "</div></details>"
      );
      inDetails = false;
      detailsSummary = "";
      detailsBuf = [];
    }

    while (i < lines.length) {
      const line = lines[i];

      if (inCode) {
        if (line.startsWith("```")) {
          out.push(
            '<pre class="learn-code"><code class="lang-' +
              esc(codeLang) +
              '">' +
              esc(codeBuf.join("\n")) +
              "</code></pre>"
          );
          inCode = false;
          codeBuf = [];
          codeLang = "";
        } else {
          codeBuf.push(line);
        }
        i += 1;
        continue;
      }

      if (line.startsWith("```")) {
        flushList();
        flushTable();
        inCode = true;
        codeLang = line.slice(3).trim();
        i += 1;
        continue;
      }

      // :::answer 标题  ... :::
      if (/^:::answer\b/.test(line)) {
        flushList();
        flushTable();
        inDetails = true;
        detailsSummary = line.replace(/^:::answer\s*/, "").trim() || "参考答案";
        detailsBuf = [];
        i += 1;
        continue;
      }
      if (inDetails) {
        if (line.trim() === ":::") {
          flushDetails();
        } else {
          detailsBuf.push(line);
        }
        i += 1;
        continue;
      }

      if (/^\|/.test(line)) {
        flushList();
        tableBuf.push(line);
        i += 1;
        continue;
      }
      if (tableBuf.length) flushTable();

      if (/^#{1,4}\s+/.test(line)) {
        flushList();
        const m = line.match(/^(#{1,4})\s+(.*)$/);
        const level = m[1].length;
        out.push("<h" + level + ">" + inline(m[2]) + "</h" + level + ">");
        i += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        flushList();
        out.push("<blockquote>" + inline(line.replace(/^>\s?/, "")) + "</blockquote>");
        i += 1;
        continue;
      }

      if (/^[-*]\s+/.test(line)) {
        if (listType && listType !== "ul") flushList();
        listType = "ul";
        listBuf.push(line.replace(/^[-*]\s+/, ""));
        i += 1;
        continue;
      }
      if (/^\d+\.\s+/.test(line)) {
        if (listType && listType !== "ol") flushList();
        listType = "ol";
        listBuf.push(line.replace(/^\d+\.\s+/, ""));
        i += 1;
        continue;
      }

      if (listType) flushList();

      if (/^---+$/.test(line.trim())) {
        out.push("<hr />");
        i += 1;
        continue;
      }

      if (!line.trim()) {
        out.push("");
        i += 1;
        continue;
      }

      out.push("<p>" + inline(line) + "</p>");
      i += 1;
    }

    flushList();
    flushTable();
    if (inDetails) flushDetails();
    if (inCode) {
      out.push("<pre class=\"learn-code\"><code>" + esc(codeBuf.join("\n")) + "</code></pre>");
    }

    return out.join("\n");
  }

  global.LearnMD = { render: mdToHtml };
})(window);
