/**
 * 学习路径应用：总览 + 单课 + 小测门禁 + 靶场 TOKEN
 */
(function () {
  "use strict";

  const CUR = () => window.LEARN_CURRICULUM || { lessons: [], industries: {}, storageKey: "dnexus-learn" };
  const QUIZ = () => window.LEARN_QUIZZES || {};
  const LAB_TOKENS = {
    dau: "dnexus-lab-dau-v1-PASS",
    vod: "dnexus-lab-vod-v1-PASS",
    funnel: "dnexus-lab-funnel-v1-PASS",
    front: "dnexus-lab-front-v1-PASS",
  };

  const TRACK_FILTERS = {
    all: { label: "全部", match: () => true },
    de: {
      label: "DE 主线",
      match: (t) => ["de-core", "de-eng", "de-lab", "de-mid"].includes(t),
    },
    fullstack: { label: "全栈", match: (t) => t === "fullstack" },
    tools: {
      label: "工具/对照",
      match: (t) => ["meta", "contrast", "review", "analyst"].includes(t),
    },
  };

  function getTrackFilter() {
    try {
      return localStorage.getItem("dnexus-learn-track-filter") || "all";
    } catch (_) {
      return "all";
    }
  }

  function setTrackFilter(v) {
    try {
      localStorage.setItem("dnexus-learn-track-filter", v);
    } catch (_) { /* ignore */ }
  }

  function loadProgress() {
    try {
      return JSON.parse(localStorage.getItem(CUR().storageKey) || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveProgress(p) {
    localStorage.setItem(CUR().storageKey, JSON.stringify(p));
  }

  function loadLabs() {
    try {
      return JSON.parse(localStorage.getItem("dnexus-learn-labs-v1") || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveLabs(labs) {
    localStorage.setItem("dnexus-learn-labs-v1", JSON.stringify(labs));
  }

  function markDone(id, extra) {
    const p = loadProgress();
    p[id] = Object.assign({ done: true, at: Date.now() }, extra || {});
    saveProgress(p);
    return p;
  }

  function doneCount() {
    const p = loadProgress();
    return CUR().lessons.filter((l) => p[l.id]?.done).length;
  }

  function getIndustry() {
    const q = new URLSearchParams(location.search).get("industry");
    if (q && CUR().industries[q]) return q;
    try {
      return localStorage.getItem("dnexus-learn-industry") || "internet";
    } catch (_) {
      return "internet";
    }
  }

  function setIndustry(code) {
    try {
      localStorage.setItem("dnexus-learn-industry", code);
    } catch (_) { /* ignore */ }
  }

  function canMarkDone(lessonId) {
    const quiz = QUIZ()[lessonId];
    const p = loadProgress();
    const entry = p[lessonId] || {};
    if (!quiz) return { ok: true };
    if (!entry.quizPass) {
      return { ok: false, reason: "请先完成本章小测（达到及格分）。" };
    }
    if (quiz.requireLab) {
      const labs = loadLabs();
      if (!labs[quiz.requireLab]) {
        return {
          ok: false,
          reason: "请先粘贴并验证靶场 LAB_TOKEN（" + quiz.requireLab + "）。",
        };
      }
    }
    return { ok: true };
  }

  function renderQuiz(lessonId) {
    const quiz = QUIZ()[lessonId];
    if (!quiz || !quiz.questions || !quiz.questions.length) return "";
    const labs = loadLabs();
    const labBlock = quiz.requireLab
      ? `<div class="learn-lab-token">
          <label>靶场 TOKEN（${quiz.requireLab}）
            <input type="text" id="learn-lab-token-input" placeholder="运行 run_lab.py 后复制 LAB_TOKEN= 后面的值" value="" />
          </label>
          <button type="button" class="learn-btn" id="learn-lab-token-btn">验证 TOKEN</button>
          <span class="learn-gate-status" id="learn-lab-token-status">${
            labs[quiz.requireLab] ? "已解锁 " + quiz.requireLab : "未解锁"
          }</span>
        </div>`
      : "";

    return `
      <section class="learn-quiz no-print" id="learn-quiz">
        <h2>章末小测（门禁）</h2>
        <p class="learn-jumps-hint">答对至少 <strong>${quiz.passScore}</strong> 题方可标记本课完成。${
          quiz.requireLab ? "本课还需靶场 TOKEN。" : ""
        }</p>
        ${labBlock}
        <ol class="learn-quiz-list">
          ${quiz.questions
            .map(
              (item, qi) => `
            <li class="learn-quiz-item" data-qi="${qi}">
              <p class="learn-quiz-q">${item.q}</p>
              <div class="learn-quiz-choices">
                ${(item.choices || [])
                  .map(
                    (c, ci) =>
                      `<label class="learn-quiz-choice"><input type="radio" name="q${qi}" value="${ci}" /> ${c}</label>`
                  )
                  .join("")}
              </div>
            </li>`
            )
            .join("")}
        </ol>
        <button type="button" class="learn-btn learn-btn-primary" id="learn-quiz-submit">提交小测</button>
        <p class="learn-gate-status" id="learn-quiz-result"></p>
      </section>`;
  }

  function wireQuiz(lessonId) {
    const quiz = QUIZ()[lessonId];
    if (!quiz) return;

    document.getElementById("learn-lab-token-btn")?.addEventListener("click", () => {
      const raw = (document.getElementById("learn-lab-token-input")?.value || "").trim();
      const expect = LAB_TOKENS[quiz.requireLab];
      const status = document.getElementById("learn-lab-token-status");
      const ok =
        raw === expect ||
        raw === "LAB_TOKEN=" + expect ||
        raw === "FRONT_TOKEN=" + expect;
      if (ok) {
        const labs = loadLabs();
        labs[quiz.requireLab] = { at: Date.now() };
        saveLabs(labs);
        if (status) status.textContent = "已解锁 " + quiz.requireLab;
      } else if (status) {
        status.textContent = "TOKEN 不正确（应对: " + expect + "）";
      }
    });

    document.getElementById("learn-quiz-submit")?.addEventListener("click", () => {
      let score = 0;
      quiz.questions.forEach((item, qi) => {
        const picked = document.querySelector(`input[name="q${qi}"]:checked`);
        if (picked && Number(picked.value) === item.answer) score += 1;
      });
      const pass = score >= quiz.passScore;
      const result = document.getElementById("learn-quiz-result");
      if (result) {
        result.textContent = pass
          ? `通过：${score}/${quiz.questions.length}`
          : `未通过：${score}/${quiz.questions.length}（需≥${quiz.passScore}）`;
        result.className = "learn-gate-status " + (pass ? "is-pass" : "is-fail");
      }
      if (pass) {
        const p = loadProgress();
        p[lessonId] = Object.assign({}, p[lessonId], { quizPass: true, quizScore: score, quizAt: Date.now() });
        saveProgress(p);
      }
    });
  }

  function renderHub() {
    const root = document.getElementById("learn-hub");
    if (!root) return;
    const cur = CUR();
    const progress = loadProgress();
    const total = cur.lessons.length;
    const done = doneCount();
    const industry = getIndustry();
    const labs = loadLabs();
    const trackFilter = getTrackFilter();
    const filterFn = TRACK_FILTERS[trackFilter]?.match || TRACK_FILTERS.all.match;
    const visible = cur.lessons.filter((l) => filterFn(l.track));

    root.innerHTML = `
      <header class="learn-hero">
        <p class="learn-eyebrow">LEARNING PATH · HUD · GATED</p>
        <h1>${cur.title}</h1>
        <p class="learn-sub">${cur.subtitle}</p>
        <div class="learn-stat-row" aria-label="学习仪表">
          <div class="learn-stat"><span class="learn-stat__k">Progress</span><span class="learn-stat__v">${done}/${total}</span></div>
          <div class="learn-stat"><span class="learn-stat__k">Lab DAU</span><span class="learn-stat__v">${labs.dau ? "PASS" : "—"}</span></div>
          <div class="learn-stat"><span class="learn-stat__k">Lab VOD</span><span class="learn-stat__v">${labs.vod ? "PASS" : "—"}</span></div>
          <div class="learn-stat"><span class="learn-stat__k">Funnel/Front</span><span class="learn-stat__v">${(labs.funnel ? "F" : "—") + "/" + (labs.front ? "UI" : "—")}</span></div>
        </div>
        <div class="learn-progress-bar" aria-label="学习进度">
          <div class="learn-progress-fill" style="width:${total ? Math.round((done / total) * 100) : 0}%"></div>
        </div>
        <p class="learn-progress-meta">已完成 <strong>${done}</strong> / ${total} · 当前筛选显示 <strong>${visible.length}</strong> 课</p>
        <div class="learn-pin-links">
          <a href="learn-lesson.html?id=00b&industry=${encodeURIComponent(industry)}">三层现实</a>
          <a href="learn-lesson.html?id=00c&industry=${encodeURIComponent(industry)}">A/B/C对照</a>
          <a href="learn-lesson.html?id=CAL&industry=${encodeURIComponent(industry)}">7日日历</a>
          <a href="learn-lesson.html?id=DEF&industry=${encodeURIComponent(industry)}">答辩脚本</a>
          <a href="learn-lesson.html?id=FS0&industry=${encodeURIComponent(industry)}">全栈导读</a>
        </div>
        <div class="learn-industry-chips" role="tablist" aria-label="轨筛选">
          ${Object.entries(TRACK_FILTERS)
            .map(
              ([k, v]) =>
                `<button type="button" class="learn-chip ${k === trackFilter ? "is-on" : ""}" data-track-filter="${k}">${v.label}</button>`
            )
            .join("")}
        </div>
        <div class="learn-industry-chips" role="tablist" aria-label="对照行业" style="margin-top:8px">
          ${Object.entries(cur.industries)
            .map(
              ([k, v]) =>
                `<button type="button" class="learn-chip ${k === industry ? "is-on" : ""}" data-industry="${k}">${v.name}</button>`
            )
            .join("")}
        </div>
      </header>
      <ol class="learn-lesson-list">
        ${visible
          .map((l) => {
            const idx = cur.lessons.findIndex((x) => x.id === l.id);
            const isDone = !!progress[l.id]?.done;
            const trackLabel = (cur.tracks && l.track && cur.tracks[l.track]) || "";
            return `
            <li class="learn-lesson-card ${isDone ? "is-done" : ""}">
              <a class="learn-lesson-link" href="learn-lesson.html?id=${encodeURIComponent(l.id)}&industry=${encodeURIComponent(industry)}">
                <span class="learn-lesson-idx">${String(idx).padStart(2, "0")}</span>
                <span class="learn-lesson-main">
                  <span class="learn-lesson-title">${l.title}</span>
                  <span class="learn-lesson-meta">${trackLabel ? `<span class="learn-track-pill">${trackLabel}</span>` : ""}${l.duration || ""} · ${(l.tags || []).join(" · ")}</span>
                </span>
                <span class="learn-lesson-status">${isDone ? "DONE" : progress[l.id]?.quizPass ? "QUIZ" : "START"}</span>
              </a>
            </li>`;
          })
          .join("")}
      </ol>
      <p class="learn-footnote">强制刷新 · :5101/:5100 · 表名以 DDL 为准。</p>
    `;

    root.querySelectorAll("[data-track-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setTrackFilter(btn.dataset.trackFilter);
        renderHub();
      });
    });

    root.querySelectorAll("[data-industry]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setIndustry(btn.dataset.industry);
        location.search = "?industry=" + encodeURIComponent(btn.dataset.industry);
      });
    });
  }

  function renderJumps(lesson, industry) {
    const jumps = (lesson.jumps && lesson.jumps[industry]) || [];
    if (!jumps.length) return "";
    return `
      <section class="learn-jumps learn-lab">
        <h2>作品集实验台</h2>
        <p class="learn-jumps-hint">先完成上文与小测，再打开页面验证（当前：${CUR().industries[industry]?.name || industry}）。</p>
        <div class="learn-jump-btns">
          ${jumps
            .map(
              (j) =>
                `<a class="learn-jump-btn" href="${j.href}" target="_blank" rel="noopener">${j.label} ↗</a>`
            )
            .join("")}
        </div>
      </section>`;
  }

  async function renderLesson() {
    const root = document.getElementById("learn-lesson");
    if (!root) return;
    const cur = CUR();
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "00";
    let industry = params.get("industry") || getIndustry();
    if (!cur.industries[industry]) industry = "internet";
    setIndustry(industry);

    const lesson = cur.lessons.find((l) => l.id === id) || cur.lessons[0];
    const idx = cur.lessons.findIndex((l) => l.id === lesson.id);
    const prev = cur.lessons[idx - 1];
    const next = cur.lessons[idx + 1];
    const progress = loadProgress();
    const gate = canMarkDone(lesson.id);

    root.innerHTML = `
      <div class="learn-lesson-toolbar no-print">
        <a class="learn-back" href="learn.html?industry=${encodeURIComponent(industry)}">← 课表</a>
        <div class="learn-industry-chips">
          ${Object.entries(cur.industries)
            .map(
              ([k, v]) =>
                `<button type="button" class="learn-chip ${k === industry ? "is-on" : ""}" data-switch-ind="${k}">${v.name}</button>`
            )
            .join("")}
        </div>
        <div class="learn-toolbar-actions">
          <button type="button" class="learn-btn" id="learn-mark-done" ${
            progress[lesson.id]?.done ? "disabled" : ""
          }>${progress[lesson.id]?.done ? "已标记完成" : "标记本课完成"}</button>
          <button type="button" class="learn-btn learn-btn-primary" id="learn-print">导出 PDF</button>
        </div>
      </div>
      <article class="learn-article">
        <header class="learn-article-head">
          <p class="learn-eyebrow">CHAPTER ${lesson.id} · ${(cur.tracks && lesson.track && cur.tracks[lesson.track]) || "LESSON"}</p>
          <h1>${lesson.title}</h1>
          <p class="learn-sub">${lesson.duration || ""} · ${(lesson.tags || []).join(" · ")}</p>
        </header>
        <div id="learn-md-body" class="learn-md-body"><p class="learn-loading">加载课文…</p></div>
        <div id="learn-quiz-slot"></div>
        <div id="learn-lab-slot"></div>
      </article>
      <nav class="learn-pager no-print">
        ${
          prev
            ? `<a href="learn-lesson.html?id=${prev.id}&industry=${industry}">← ${prev.title}</a>`
            : "<span></span>"
        }
        ${
          next
            ? `<a href="learn-lesson.html?id=${next.id}&industry=${industry}">${next.title} →</a>`
            : "<span></span>"
        }
      </nav>
    `;

    const quizSlot = document.getElementById("learn-quiz-slot");
    if (quizSlot) quizSlot.innerHTML = renderQuiz(lesson.id);
    wireQuiz(lesson.id);

    const labSlot = document.getElementById("learn-lab-slot");
    if (labSlot) labSlot.innerHTML = renderJumps(lesson, industry);

    root.querySelectorAll("[data-switch-ind]").forEach((btn) => {
      btn.addEventListener("click", () => {
        location.href =
          "learn-lesson.html?id=" +
          encodeURIComponent(lesson.id) +
          "&industry=" +
          encodeURIComponent(btn.dataset.switchInd);
      });
    });

    const markBtn = document.getElementById("learn-mark-done");
    markBtn?.addEventListener("click", () => {
      const g = canMarkDone(lesson.id);
      if (!g.ok) {
        alert(g.reason);
        return;
      }
      markDone(lesson.id);
      markBtn.textContent = "已标记完成";
      markBtn.disabled = true;
    });
    if (!progress[lesson.id]?.done && !gate.ok && markBtn) {
      markBtn.title = gate.reason || "";
    }

    document.getElementById("learn-print")?.addEventListener("click", () => {
      document.querySelectorAll("details.learn-answer").forEach((d) => {
        d.open = true;
      });
      window.print();
    });

    const body = document.getElementById("learn-md-body");
    const mdUrl = "../learn/" + lesson.file + "?v=1.5";
    try {
      const res = await fetch(mdUrl);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const text = await res.text();
      body.innerHTML = window.LearnMD.render(text);
    } catch (err) {
      body.innerHTML =
        '<div class="learn-error"><p>无法加载课文 <code>' +
        lesson.file +
        "</code>：" +
        String(err.message || err) +
        "</p><p>请用 :5100 / :5101 打开作品集。</p></div>";
    }
  }

  window.LearnApp = { renderHub, renderLesson, loadProgress, markDone };

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("learn-hub")) renderHub();
    if (document.getElementById("learn-lesson")) renderLesson();
  });
})();
