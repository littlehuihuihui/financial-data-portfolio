/**
 * 平台知识图谱 · 着陆 → 概览 → 聚焦三层（密度可控）
 * 数据：window.PLATFORM_KG_DATA
 * 引擎：vis-network
 */
(function () {
  "use strict";

  var TYPE = {
    dashboard: { key: "dashboard", label: "看板", color: "#f472b6", dark: "#db2777", glow: "rgba(244,114,182,0.55)", cls: "db", icon: "📊" },
    methodology: { key: "methodology", label: "分析方法", color: "#10b981", dark: "#059669", glow: "rgba(16,185,129,0.55)", cls: "md", icon: "📐" },
    warehouse: { key: "warehouse", label: "五层数仓", color: "#f59e0b", dark: "#d97706", glow: "rgba(245,158,11,0.55)", cls: "wh", icon: "🗄️" },
    metric: { key: "metric", label: "指标", color: "#3b82f6", dark: "#2563eb", glow: "rgba(59,130,246,0.55)", cls: "mt", icon: "📈" },
  };
  var TYPE_ORDER = ["dashboard", "methodology", "warehouse", "metric"];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function trunc(s, n) {
    s = String(s || "");
    return s.length > n ? s.slice(0, n - 1) + "…" : s;
  }

  function densityCfg(DATA) {
    var d = (DATA.meta && DATA.meta.density) || {};
    return {
      l2: d.l2PerTypeDefault != null ? d.l2PerTypeDefault : 4,
      l3: d.l3PerTypeDefault != null ? d.l3PerTypeDefault : 3,
      l3Max: d.l3MaxTotal != null ? d.l3MaxTotal : 15,
      focusMax: d.focusMaxVisible != null ? d.focusMaxVisible : 35,
    };
  }

  window.initPlatformKnowledgeGraph = function (userOpts) {
    var DATA = window.PLATFORM_KG_DATA;
    if (!DATA) {
      console.error("PlatformKG: PLATFORM_KG_DATA missing");
      return null;
    }
    var dens = densityCfg(DATA);
    var opts = Object.assign({ root: "#pkgRoot", startModule: null, startNode: null }, userOpts || {});
    var mount = typeof opts.root === "string" ? document.querySelector(opts.root) : opts.root;
    if (!mount) return null;

    var visLoading = null;
    function resolveVisUrls() {
      var local = "../../../vendor/vis-network.min.js";
      try {
        var scripts = document.getElementsByTagName("script");
        for (var si = 0; si < scripts.length; si++) {
          var src = scripts[si].src || "";
          if (src.indexOf("platform-knowledge-graph.js") >= 0) {
            local = src.replace(/js\/platform-knowledge-graph\.js[^/]*$/, "vendor/vis-network.min.js");
            break;
          }
        }
      } catch (e) {}
      return [
        local,
        "https://cdn.jsdelivr.net/npm/vis-network@9.1.9/standalone/umd/vis-network.min.js",
        "https://unpkg.com/vis-network@9.1.9/standalone/umd/vis-network.min.js",
      ];
    }
    function ensureVis() {
      if (typeof vis !== "undefined") return Promise.resolve();
      if (visLoading) return visLoading;
      visLoading = new Promise(function (resolve, reject) {
        var urls = resolveVisUrls();
        var i = 0;
        function tryNext() {
          if (i >= urls.length) {
            reject(new Error("vis-network load failed"));
            return;
          }
          var s = document.createElement("script");
          s.src = urls[i++];
          s.async = true;
          s.onload = function () { resolve(); };
          s.onerror = tryNext;
          document.head.appendChild(s);
        }
        tryNext();
      });
      return visLoading;
    }

    mount.classList.add("kg-embed", "is-on", "pkg-root");
    mount.innerHTML =
      '<div class="kg2-page" id="kg2Root">' +
      '  <div class="kg2-bgfx"><div class="kg2-particles" id="kg2Particles"></div></div>' +
      '  <div class="kg2-stage" id="kg2Stage"></div>' +
      "</div>";
    var stageEl = mount.querySelector("#kg2Stage");
    var particles = mount.querySelector("#kg2Particles");
    var particleN = (window.matchMedia && window.matchMedia("(max-width: 900px)").matches) ? 0 : 6;
    for (var i = 0; i < particleN; i++) {
      var sp = document.createElement("span");
      sp.style.left = Math.random() * 100 + "%";
      sp.style.animationDelay = Math.random() * 16 + "s";
      sp.style.animationDuration = 12 + Math.random() * 10 + "s";
      particles.appendChild(sp);
    }

    var byId = new Map(DATA.nodes.map(function (n) { return [n.id, n]; }));
    var adj = new Map();
    function addAdj(a, b) {
      if (!adj.has(a)) adj.set(a, new Set());
      adj.get(a).add(b);
    }
    DATA.edges.forEach(function (e) {
      addAdj(e.source, e.target);
      addAdj(e.target, e.source);
    });
    DATA.nodes.forEach(function (n) {
      (n.crossRefs || []).forEach(function (id) {
        addAdj(n.id, id);
        addAdj(id, n.id);
      });
      (n.childrenIds || []).forEach(function (id) {
        addAdj(n.id, id);
        addAdj(id, n.id);
      });
    });

    var stage = "landing";
    var overviewModule = null;
    var overviewCat = null;
    var centerId = null;
    var selectedId = null;
    var expandedId = null;
    var layerOf = {};
    var sideCollapsed = false;
    var panelCollapsed = false;
    var history = [];
    var showMore = {};
    var showMoreL3 = {};
    TYPE_ORDER.forEach(function (t) {
      showMore[t] = dens.l2;
      showMoreL3[t] = dens.l3;
    });
    var network = null;
    var nodesDS = null;
    var edgesDS = null;

    function isNarrow() {
      try { return window.matchMedia && window.matchMedia("(max-width: 900px)").matches; }
      catch (e) { return window.innerWidth <= 900; }
    }
    function syncDrawerUi() {
      var focus = stageEl.querySelector(".kg2-focus");
      if (!focus) return;
      focus.classList.toggle("is-side-collapsed", sideCollapsed);
      focus.classList.toggle("is-panel-collapsed", panelCollapsed);
      focus.classList.toggle("is-drawer-open", !sideCollapsed || !panelCollapsed);
      var side = stageEl.querySelector("#kg2Side");
      var panel = stageEl.querySelector("#kg2Panel");
      if (side) side.classList.toggle("is-collapsed", sideCollapsed);
      if (panel) panel.classList.toggle("is-collapsed", panelCollapsed);
      var railL = stageEl.querySelector("#kg2ToggleSide");
      var railR = stageEl.querySelector("#kg2TogglePanel");
      if (railL) railL.textContent = sideCollapsed ? "»" : "«";
      if (railR) railR.textContent = panelCollapsed ? "«" : "»";
      var mSide = stageEl.querySelector("#kg2MobSide");
      var mPanel = stageEl.querySelector("#kg2MobPanel");
      if (mSide) mSide.classList.toggle("is-on", !sideCollapsed);
      if (mPanel) mPanel.classList.toggle("is-on", !panelCollapsed);
    }
    function setSideOpen(open) {
      sideCollapsed = !open;
      if (open && isNarrow()) panelCollapsed = true;
      syncDrawerUi();
    }
    function setPanelOpen(open) {
      panelCollapsed = !open;
      if (open && isNarrow()) sideCollapsed = true;
      syncDrawerUi();
    }

    function resetShowMore() {
      TYPE_ORDER.forEach(function (t) {
        showMore[t] = dens.l2;
        showMoreL3[t] = dens.l3;
      });
    }

    function leavesOfType(type) {
      return DATA.nodes.filter(function (n) {
        return n.type === type && !n.isRoot && !n.isCategory;
      });
    }

    function catsOfModule(type) {
      return DATA.nodes.filter(function (n) {
        return n.isCategory && n.type === type;
      });
    }

    function destroyNet() {
      if (network) {
        try { network.destroy(); } catch (e) {}
        network = null;
        nodesDS = null;
        edgesDS = null;
      }
    }

    function relatedFor(center) {
      var byType = { dashboard: [], methodology: [], warehouse: [], metric: [] };
      var seen = {};
      function push(n) {
        if (!n || n.id === center.id || seen[n.id] || n.isRoot || n.isCategory) return;
        if (!TYPE[n.type]) return;
        seen[n.id] = true;
        byType[n.type].push(n);
      }
      (adj.get(center.id) || []).forEach(function (id) { push(byId.get(id)); });
      // weak fill by name tokens if sparse
      function fill(type, need) {
        if (byType[type].length >= need) return;
        var tokens = String(center.name || "").replace(/[（）()\s/·]+/g, " ").split(" ").filter(function (t) { return t.length >= 2; });
        var pool = leavesOfType(type).filter(function (n) { return !seen[n.id]; });
        pool.sort(function (a, b) {
          var sa = 0, sb = 0;
          tokens.forEach(function (t) {
            if (a.name.indexOf(t) >= 0) sa += 2;
            if (b.name.indexOf(t) >= 0) sb += 2;
          });
          return sb - sa;
        });
        while (byType[type].length < need && pool.length) {
          var n = pool.shift();
          push(n);
        }
      }
      TYPE_ORDER.forEach(function (t) { fill(t, dens.l2); });
      return byType;
    }

    function render() {
      if (stage === "landing") renderLanding();
      else if (stage === "overview") renderOverview();
      else renderFocus();
    }

    function hilite(name, q) {
      var s = esc(name);
      var qq = String(q || "").trim();
      if (!qq) return s;
      try {
        var re = new RegExp("(" + qq.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
        return s.replace(re, "<mark>$1</mark>");
      } catch (e) {
        return s;
      }
    }

    function wireSearch(input, drop) {
      if (!input || !drop) return;
      function run() {
        var q = (input.value || "").trim();
        if (!q) {
          drop.classList.remove("open");
          drop.style.display = "none";
          drop.innerHTML = "";
          return;
        }
        var ql = q.toLowerCase();
        var scored = { dashboard: [], methodology: [], warehouse: [], metric: [] };
        DATA.nodes.forEach(function (n) {
          if (n.isRoot || n.isCategory || !TYPE[n.type]) return;
          var nm = String(n.name || "").toLowerCase();
          var blob = String(n.description || (n.detail && n.detail.definition) || "").toLowerCase();
          var sc = 0;
          if (nm.indexOf(ql) >= 0) sc += 40;
          else if (blob.indexOf(ql) >= 0) sc += 10;
          if (sc <= 0) return;
          scored[n.type].push({ n: n, sc: sc });
        });
        var html = "";
        TYPE_ORDER.forEach(function (t) {
          scored[t].sort(function (a, b) { return b.sc - a.sc; });
          var list = scored[t].slice(0, 8).map(function (x) { return x.n; });
          if (!list.length) return;
          html += '<div class="kg2-search-group">' + TYPE[t].label + "</div>";
          list.forEach(function (n) {
            html += '<div class="kg2-search-item" data-id="' + n.id + '">' + hilite(n.name, q) + "</div>";
          });
        });
        drop.innerHTML = html || '<div class="kg2-search-item">无匹配结果</div>';
        drop.classList.add("open");
        drop.style.display = "block";
        drop.querySelectorAll("[data-id]").forEach(function (el) {
          el.addEventListener("click", function () {
            drop.classList.remove("open");
            drop.style.display = "none";
            input.value = "";
            enterFocus(el.getAttribute("data-id"), true);
          });
        });
      }
      input.addEventListener("input", run);
      input.addEventListener("focus", run);
      document.addEventListener("click", function (e) {
        if (!e.target.closest(".kg2-search-hero") && !e.target.closest(".kg2-search-mini") && !e.target.closest(".kg2-search-drop")) {
          drop.classList.remove("open");
          drop.style.display = "none";
        }
      });
    }

    function renderLanding() {
      destroyNet();
      var counts = DATA.meta.counts || {};
      var cards = TYPE_ORDER.map(function (t) {
        var meta = TYPE[t];
        var n = leavesOfType(t).length;
        return (
          '<div class="kg2-card ' + meta.cls + '" data-mod="' + t + '">' +
          '<div class="ico">' + meta.icon + "</div><h3>" + esc(meta.label) + "</h3>" +
          '<div class="num">' + n + '</div><div class="hint">点击进入</div></div>'
        );
      }).join("");
      stageEl.innerHTML =
        '<div class="kg2-landing kg2-landing--under-header">' +
        '  <div class="kg2-page-head">' +
        '    <div class="kg2-page-head-main">' +
        '      <h1 class="kg2-landing-title">' + esc((DATA.meta && DATA.meta.title) || "平台知识图谱") + "</h1>" +
        '      <p class="kg2-landing-sub">从看板、分析方法、五层数仓、指标任意入口出发，辐射式探索关联</p>' +
        "    </div>" +
        '    <div class="kg2-page-stats">' +
        '      <div class="kg2-ps"><div class="n">' + (counts.dashboards || 0) + '</div><div class="l">看板</div></div>' +
        '      <div class="kg2-ps"><div class="n">' + (counts.playbooks || 0) + '</div><div class="l">分析场景</div></div>' +
        '      <div class="kg2-ps"><div class="n">' + (counts.metrics || 0) + '</div><div class="l">指标</div></div>' +
        '      <div class="kg2-ps"><div class="n">' + (counts.warehouseTables || 0) + '</div><div class="l">仓表</div></div>' +
        "    </div>" +
        "  </div>" +
        '  <div class="kg2-search-hero">' +
        '    <input id="kg2HeroSearch" type="search" placeholder="搜索看板、分析方法、数仓表、指标…" autocomplete="off" />' +
        '    <div class="kg2-search-drop" id="kg2HeroDrop"></div>' +
        "  </div>" +
        '  <div class="kg2-cards kg2-cards-4">' + cards + "</div>" +
        '  <div class="kg2-hot"><h4>热门入口</h4><div class="kg2-hot-tags" id="kg2Hot"></div></div>' +
        '  <p class="kg2-landing-tip">全库约 ' + (counts.leaves || 0) + " 个叶子 · 同时可见 ≤" + dens.focusMax + " · 外环 ≤" + dens.l3Max + "</p>" +
        "</div>";
      stageEl.querySelectorAll(".kg2-card[data-mod]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          overviewModule = btn.getAttribute("data-mod");
          overviewCat = null;
          var cats = catsOfModule(overviewModule);
          if (cats.length === 1) overviewCat = cats[0].id;
          stage = "overview";
          render();
        });
      });
      wireSearch(stageEl.querySelector("#kg2HeroSearch"), stageEl.querySelector("#kg2HeroDrop"));
      var hotHints = ["经营总览", "杜邦", "毛利率", "GMV", "留存", "北极星", "ODS", "ADS", "现金流", "库存"];
      var hotEl = stageEl.querySelector("#kg2Hot");
      var usedHot = {};
      hotHints.forEach(function (hint) {
        var node = DATA.nodes.find(function (n) {
          return !n.isRoot && !n.isCategory && !usedHot[n.id] && n.name && n.name.indexOf(hint) >= 0;
        });
        if (!node) return;
        usedHot[node.id] = true;
        var b = document.createElement("button");
        b.type = "button";
        b.textContent = trunc(node.name, 14);
        b.addEventListener("click", function () { enterFocus(node.id, true); });
        hotEl.appendChild(b);
      });
      if (!hotEl.children.length) {
        leavesOfType("dashboard").slice(0, 6).forEach(function (n) {
          var b = document.createElement("button");
          b.type = "button";
          b.textContent = trunc(n.name, 14);
          b.addEventListener("click", function () { enterFocus(n.id, true); });
          hotEl.appendChild(b);
        });
      }
    }

    function renderOverview() {
      destroyNet();
      var mod = overviewModule;
      var meta = TYPE[mod];
      var cats = catsOfModule(mod);
      var leaves = [];
      if (overviewCat) {
        leaves = (byId.get(overviewCat).childrenIds || []).map(function (id) { return byId.get(id); }).filter(Boolean);
      } else if (cats.length) {
        // show category grid
      } else {
        leaves = leavesOfType(mod);
      }

      var catHtml = cats.map(function (c) {
        var cnt = (c.childrenIds || []).length;
        var on = overviewCat === c.id ? " is-on" : "";
        return '<button type="button" class="kg2-cat-chip' + on + '" data-cat="' + c.id + '">' + esc(c.name) + " · " + cnt + "</button>";
      }).join("");

      var listHtml = leaves.map(function (n) {
        return (
          '<button type="button" class="kg2-leaf" data-id="' + n.id + '">' +
          '<span class="kg2-leaf-name">' + esc(n.name) + "</span>" +
          '<span class="kg2-leaf-desc">' + esc(trunc(n.description || (n.detail && n.detail.definition) || "", 48)) + "</span>" +
          "</button>"
        );
      }).join("");

      stageEl.innerHTML =
        '<div class="kg2-overview">' +
        '  <div class="kg2-overview-bar">' +
        '    <button type="button" class="kg2-btn" id="pkgBackLanding">← 模块选择</button>' +
        '    <h2 class="kg2-overview-title">' + meta.icon + " " + esc(meta.label) + "</h2>" +
        "  </div>" +
        (cats.length ? '<div class="kg2-cat-row">' + catHtml + "</div>" : "") +
        (overviewCat || !cats.length
          ? '<div class="kg2-leaf-grid">' + (listHtml || '<div class="kg2-empty">该分类暂无节点</div>') + "</div>"
          : '<div class="kg2-empty">请选择上方分类查看列表</div>') +
        "</div>";

      stageEl.querySelector("#pkgBackLanding").addEventListener("click", function () {
        stage = "landing";
        overviewModule = null;
        overviewCat = null;
        render();
      });
      stageEl.querySelectorAll("[data-cat]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          overviewCat = btn.getAttribute("data-cat");
          renderOverview();
        });
      });
      stageEl.querySelectorAll(".kg2-leaf").forEach(function (btn) {
        btn.addEventListener("click", function () {
          enterFocus(btn.getAttribute("data-id"), true);
        });
      });
    }

    function enterFocus(id, pushHist) {
      var node = byId.get(id);
      if (!node || node.isRoot || node.isCategory) return;
      if (pushHist && centerId && centerId !== id) history.push(centerId);
      centerId = id;
      selectedId = id;
      expandedId = null;
      layerOf = {};
      resetShowMore();
      if (isNarrow()) {
        sideCollapsed = true;
        panelCollapsed = true;
      }
      stage = "focus";
      renderFocus();
    }

    function selectNode(id) {
      var node = byId.get(id);
      if (!node || node.isRoot || node.isCategory) return;
      selectedId = id;
      if (isNarrow()) setPanelOpen(true);
      renderPanel(node);
      highlightSelection();
      syncDrawerUi();
    }

    function renderPanel(node) {
      var panel = stageEl.querySelector("#kg2Panel");
      if (!panel || !node) return;
      var meta = TYPE[node.type] || TYPE.metric;
      var d = node.detail || {};
      var links = "";
      if (node.href) {
        links += '<a class="kg2-panel-link" href="' + esc(node.href) + '">打开关联页 →</a>';
      }
      if (node.dictHref) {
        links += '<a class="kg2-panel-link" href="' + esc(node.dictHref) + '">数据字典 →</a>';
      }
      var steps = (d.steps || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
      panel.className = "kg2-panel open " + (panelCollapsed ? "is-collapsed " : "") + meta.cls;
      panel.innerHTML =
        '<div class="kg2-panel-inner">' +
        '  <div class="kg2-panel-badge" style="background:' + meta.color + '">' + esc(meta.label) + "</div>" +
        "  <h3>" + esc(node.name) + "</h3>" +
        '  <p class="kg2-panel-def">' + esc(d.definition || node.description || "") + "</p>" +
        (d.formula ? '<div class="kg2-panel-block"><div class="lbl">公式 / 口径</div><code>' + esc(d.formula) + "</code></div>" : "") +
        (d.notes ? '<div class="kg2-panel-block"><div class="lbl">说明</div><p>' + esc(d.notes) + "</p></div>" : "") +
        (steps ? '<div class="kg2-panel-block"><div class="lbl">步骤</div><ol>' + steps + "</ol></div>" : "") +
        '  <div class="kg2-panel-actions">' +
        '    <button type="button" class="kg2-btn primary" id="pkgRecenter">以此为中心</button>' +
        links +
        "  </div>" +
        "</div>";
      var btn = panel.querySelector("#pkgRecenter");
      if (btn) {
        btn.addEventListener("click", function () {
          enterFocus(node.id, true);
        });
      }
    }

    function highlightSelection() {
      if (!nodesDS) return;
      nodesDS.getIds().forEach(function (id) {
        var n = byId.get(id);
        if (!n) return;
        var layer = layerOf[id] || (id === centerId ? 1 : 2);
        var meta = TYPE[n.type] || TYPE.metric;
        var isCenter = layer === 1;
        var isSel = id === selectedId;
        var isExp = id === expandedId;
        var base = isCenter ? 62 : layer === 3 ? 20 : 30;
        try {
          if (isCenter) {
            nodesDS.update({
              id: id,
              size: isSel ? 68 : 62,
              borderWidth: isSel ? 4 : 3,
              color: { background: "#a855f7", border: isSel ? "#fff" : "#e9d5ff" },
            });
          } else {
            nodesDS.update({
              id: id,
              size: isSel ? base + 5 : isExp ? base + 3 : base,
              borderWidth: isSel || isExp ? 3 : 2,
              color: {
                background: isSel || isExp ? meta.color : meta.dark,
                border: isSel || isExp ? "#fff" : meta.color,
              },
            });
          }
        } catch (e) {}
      });
    }

    function sectorAngle(type) {
      if (type === "dashboard") return (150 * Math.PI) / 180;
      if (type === "methodology") return (40 * Math.PI) / 180;
      if (type === "warehouse") return (220 * Math.PI) / 180;
      return (300 * Math.PI) / 180;
    }

    function collectL3(parent, occupied) {
      var rel = relatedFor(parent);
      var out = [];
      TYPE_ORDER.forEach(function (t) {
        (rel[t] || []).forEach(function (n) {
          if (occupied[n.id] || n.id === centerId) return;
          out.push(n);
        });
      });
      var capped = [];
      var used = { dashboard: 0, methodology: 0, warehouse: 0, metric: 0 };
      out.forEach(function (n) {
        if (used[n.type] >= showMoreL3[n.type]) return;
        if (capped.length >= dens.l3Max) return;
        used[n.type] += 1;
        capped.push(n);
      });
      return capped;
    }

    function drawGraph(center) {
      var rel = relatedFor(center);
      var nodeObjs = [];
      var edgeObjs = [];
      layerOf = {};
      layerOf[center.id] = 1;
      var occupied = {};
      occupied[center.id] = true;

      nodeObjs.push({
        id: center.id,
        label: trunc(center.name, 8),
        title: center.name + "（第1层·中心）",
        x: 0, y: 0, fixed: true,
        shape: "dot",
        size: 65,
        color: {
          background: "#a855f7",
          border: "#e9d5ff",
          highlight: { background: "#c084fc", border: "#fff" },
          hover: { background: "#c084fc", border: "#fff" }
        },
        borderWidth: 3,
        font: { color: "#fff", size: 12, face: "Noto Sans SC, Microsoft YaHei, sans-serif", strokeWidth: 2, strokeColor: "rgba(10,14,26,0.8)" },
        shadow: { enabled: true, color: "rgba(168,85,247,0.65)", size: 32, x: 0, y: 0 },
        mass: 4
      });

      var l2Positions = {};
      var visibleCount = 1;

      TYPE_ORDER.forEach(function (t) {
        var list = (rel[t] || []).slice(0, showMore[t]);
        var base = sectorAngle(t);
        var meta = TYPE[t];
        var n = list.length;
        var spread = Math.min(0.85, 0.16 * Math.max(n, 1));
        list.forEach(function (node, i) {
          if (occupied[node.id] || visibleCount >= dens.focusMax) return;
          occupied[node.id] = true;
          layerOf[node.id] = 2;
          visibleCount += 1;
          var ang = n === 1 ? base : base - spread / 2 + (spread * i) / Math.max(n - 1, 1);
          var rScale = isNarrow() ? 0.72 : 1;
          var r = (210 + (i % 3) * 24) * rScale;
          var x = Math.cos(ang) * r;
          var y = -Math.sin(ang) * r;
          l2Positions[node.id] = { x: x, y: y, ang: ang, r: r };
          var isExp = expandedId === node.id;
          nodeObjs.push({
            id: node.id,
            label: trunc(node.name, 6),
            title: node.name + (isExp ? "（第2层·已展开）" : "（第2层·点击展开第3层）"),
            x: x, y: y, fixed: false,
            shape: "dot",
            size: isExp ? 34 : 30,
            color: {
              background: isExp ? meta.color : meta.dark,
              border: isExp ? "#fff" : meta.color,
              highlight: { background: meta.color, border: "#fff" },
              hover: { background: meta.color, border: "#fff" }
            },
            borderWidth: isExp ? 3 : 2,
            font: { color: "#f8fafc", size: 11, face: "Noto Sans SC, Microsoft YaHei, sans-serif", strokeWidth: 2, strokeColor: "rgba(10,14,26,0.75)" },
            shadow: { enabled: true, color: meta.glow, size: isExp ? 20 : 16, x: 0, y: 0 },
            mass: 1.2
          });
          edgeObjs.push({
            id: "e_" + center.id + "_" + node.id,
            from: center.id,
            to: node.id,
            color: { color: meta.color, highlight: "#fff", hover: "#fff", opacity: 0.7 },
            width: 2.4,
            smooth: { enabled: true, type: "curvedCW", roundness: 0.28 },
            arrows: { to: { enabled: true, scaleFactor: 0.4 } }
          });
        });
      });

      // cross edges among visible L2 (网状：A1 可连 B1)；按 id 去重，避免 DataSet.add 整批失败
      var edgeSeen = {};
      edgeObjs.forEach(function (e) { edgeSeen[e.id] = true; });
      DATA.edges.forEach(function (e) {
        if (!e.cross && e.style !== "dashed") return;
        if (!occupied[e.source] || !occupied[e.target]) return;
        if (e.source === center.id || e.target === center.id) return;
        var cid = "cx_" + e.source + "_" + e.target;
        if (edgeSeen[cid]) return;
        edgeSeen[cid] = true;
        edgeObjs.push({
          id: cid,
          from: e.source,
          to: e.target,
          color: { color: "#94a3b8", highlight: "#e2e8f0", hover: "#e2e8f0", opacity: 0.55 },
          width: 1.5,
          dashes: true,
          smooth: { enabled: true, type: "curvedCW", roundness: 0.35 },
        });
      });

      if (expandedId && !l2Positions[expandedId]) expandedId = null;

      if (expandedId && l2Positions[expandedId]) {
        var parent = byId.get(expandedId);
        var pos = l2Positions[expandedId];
        var l3list = collectL3(parent, occupied);
        var n3 = l3list.length;
        var fan = Math.min(1.0, 0.2 * Math.max(n3, 1));
        l3list.forEach(function (child, j) {
          if (visibleCount >= dens.focusMax) return;
          occupied[child.id] = true;
          layerOf[child.id] = 3;
          visibleCount += 1;
          var meta3 = TYPE[child.type] || TYPE.metric;
          var ang3 = n3 === 1 ? pos.ang : pos.ang - fan / 2 + (fan * j) / Math.max(n3 - 1, 1);
          var r3 = pos.r + (isNarrow() ? 78 : 110) + (j % 2) * 16;
          nodeObjs.push({
            id: child.id,
            label: trunc(child.name, 5),
            title: child.name + "（第3层·查看详情；跨支虚线若存在会显示）",
            x: Math.cos(ang3) * r3,
            y: -Math.sin(ang3) * r3,
            fixed: false,
            shape: "dot",
            size: 20,
            color: {
              background: meta3.dark,
              border: "rgba(255,255,255,0.4)",
              highlight: { background: meta3.color, border: "#fff" },
              hover: { background: meta3.color, border: "#fff" }
            },
            borderWidth: 1.5,
            font: { color: "#e2e8f0", size: 10, face: "Noto Sans SC, Microsoft YaHei, sans-serif", strokeWidth: 2, strokeColor: "rgba(10,14,26,0.75)" },
          });
          var e3id = "e3_" + expandedId + "_" + child.id;
          if (!edgeSeen[e3id]) {
            edgeSeen[e3id] = true;
            edgeObjs.push({
              id: e3id,
              from: expandedId,
              to: child.id,
              color: { color: meta3.color, highlight: "#fff", hover: "#fff", opacity: 0.45 },
              width: 1.5,
              dashes: true,
              smooth: { enabled: true, type: "curvedCW", roundness: 0.32 },
              arrows: { to: { enabled: true, scaleFactor: 0.35 } }
            });
          }
          // cross to visible L2 (e.g. AA → B1)
          DATA.edges.forEach(function (e) {
            if (!e.cross && e.style !== "dashed") return;
            var other = null;
            if (e.source === child.id && occupied[e.target] && layerOf[e.target] === 2) other = e.target;
            if (e.target === child.id && occupied[e.source] && layerOf[e.source] === 2) other = e.source;
            if (!other || other === expandedId) return;
            var c3 = "cx3_" + child.id + "_" + other;
            if (edgeSeen[c3]) return;
            edgeSeen[c3] = true;
            edgeObjs.push({
              id: c3,
              from: child.id,
              to: other,
              color: { color: "#94a3b8", highlight: "#e2e8f0", hover: "#e2e8f0", opacity: 0.7 },
              width: 1.4,
              dashes: true,
            });
          });
        });
      }

      var netEl = stageEl.querySelector("#kg2Net");
      if (!netEl) return;
      if (network && network.body && network.body.container && network.body.container !== netEl) destroyNet();

      if (!nodesDS || !network) {
        nodesDS = new vis.DataSet([]);
        edgesDS = new vis.DataSet([]);
        network = new vis.Network(netEl, { nodes: nodesDS, edges: edgesDS }, {
          interaction: { hover: true, dragNodes: true, dragView: true, zoomView: true, tooltipDelay: 80 },
          edges: {
            inheritColor: false,
            selectionWidth: 3,
            hoverWidth: 2,
            smooth: { enabled: true, type: "continuous" },
          },
          physics: {
            enabled: true,
            barnesHut: { gravitationalConstant: -1600, centralGravity: 0.06, springLength: 110, springConstant: 0.04, damping: 0.5, avoidOverlap: 0.65 },
            stabilization: { enabled: true, iterations: 50, fit: true },
            maxVelocity: 28,
            minVelocity: 0.4,
          },
          layout: { improvedLayout: false },
        });
        network.on("click", function (p) {
          if (!p.nodes || !p.nodes.length) return;
          var id = p.nodes[0];
          var layer = layerOf[id] || 2;
          if (layer === 2) {
            if (expandedId === id) expandedId = null;
            else expandedId = id;
            drawGraph(byId.get(centerId));
            selectNode(id);
            updateMoreButtons(byId.get(centerId));
          } else {
            selectNode(id);
          }
        });
      }
      nodesDS.clear();
      edgesDS.clear();
      nodesDS.add(nodeObjs);
      try {
        edgesDS.add(edgeObjs);
      } catch (err) {
        // 兜底：逐条写入，跳过重复 id，避免整批连线丢失
        edgeObjs.forEach(function (e) {
          try {
            if (!edgesDS.get(e.id)) edgesDS.add(e);
          } catch (e2) {}
        });
      }
      setTimeout(function () {
        try { network.fit({ animation: { duration: 280 } }); } catch (e) {}
      }, 80);
    }

    function updateMoreButtons(center) {
      var box = stageEl.querySelector("#kg2More");
      if (!box) return;
      box.innerHTML = "";
      var rel = relatedFor(center);
      TYPE_ORDER.forEach(function (t) {
        var total = (rel[t] || []).length;
        if (total <= showMore[t]) return;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = "显示更多" + TYPE[t].label + "（" + showMore[t] + "/" + total + "）";
        btn.addEventListener("click", function () {
          showMore[t] = Math.min(total, showMore[t] + 3);
          drawGraph(center);
          highlightSelection();
          updateMoreButtons(center);
        });
        box.appendChild(btn);
      });
      if (expandedId && byId.get(expandedId)) {
        var collapse = document.createElement("button");
        collapse.type = "button";
        collapse.textContent = "收起第3层（" + trunc(byId.get(expandedId).name, 12) + "）";
        collapse.addEventListener("click", function () {
          expandedId = null;
          drawGraph(center);
          highlightSelection();
          updateMoreButtons(center);
        });
        box.appendChild(collapse);
      }
      var tip = document.createElement("div");
      tip.className = "pkg-density-tip";
      tip.textContent = "密度上限：同时可见 ≤" + dens.focusMax + " · 外环 ≤" + dens.l3Max;
      box.appendChild(tip);
    }

    function renderFocus() {
      var center = byId.get(centerId);
      if (!center) {
        stage = "landing";
        renderLanding();
        return;
      }
      if (!selectedId || !byId.get(selectedId)) selectedId = centerId;
      var panelNode = byId.get(selectedId) || center;
      destroyNet();

      var drawerOpen = !sideCollapsed || !panelCollapsed;
      stageEl.innerHTML =
        '<div class="kg2-focus' + (sideCollapsed ? " is-side-collapsed" : "") + (panelCollapsed ? " is-panel-collapsed" : "") + (drawerOpen ? " is-drawer-open" : "") + '">' +
        '  <button type="button" class="kg2-scrim" id="kg2Scrim" aria-label="关闭浮层"></button>' +
        '  <aside class="kg2-side' + (sideCollapsed ? " is-collapsed" : "") + '" id="kg2Side">' +
        '    <button type="button" class="kg2-btn" id="kg2Back">← 返回</button>' +
        '    <div class="kg2-search-mini"><input id="kg2FocusSearch" type="search" placeholder="搜索节点…" /></div>' +
        '    <div class="kg2-search-drop" id="kg2FocusDrop" style="display:none"></div>' +
        '    <div class="kg2-legend-box">' +
        TYPE_ORDER.map(function (t) {
          return '<div class="row"><span class="kg2-dot" style="background:' + TYPE[t].color + '"></span>' + TYPE[t].label + "</div>";
        }).join("") +
        '      <div class="row"><span class="kg2-dot" style="background:#a855f7"></span>当前中心（第1层）</div>' +
        '      <div class="row"><span class="kg2-dot" style="background:#94a3b8"></span>周围关联（第2层）</div>' +
        '      <div class="row"><span class="kg2-dot" style="background:#64748b"></span>展开外环（第3层）</div>' +
        "    </div>" +
        '    <div class="kg2-more-btns" id="kg2More"></div>' +
        '    <div class="kg2-path-hist"><div style="margin-bottom:4px;font-weight:600">探索路径</div><div id="kg2Hist"></div></div>' +
        "  </aside>" +
        '  <div class="kg2-canvas-wrap">' +
        '    <div class="kg2-mobile-bar">' +
        '      <button type="button" class="kg2-mbtn" id="kg2MobBack">← 返回</button>' +
        '      <button type="button" class="kg2-mbtn' + (sideCollapsed ? "" : " is-on") + '" id="kg2MobSide">图例</button>' +
        '      <span class="kg2-mbtn-spacer"></span>' +
        '      <button type="button" class="kg2-mbtn' + (panelCollapsed ? "" : " is-on") + '" id="kg2MobPanel">详情</button>' +
        "    </div>" +
        '    <button type="button" class="kg2-rail-btn kg2-rail-left" id="kg2ToggleSide">' + (sideCollapsed ? "»" : "«") + "</button>" +
        '    <div class="kg2-network" id="kg2Net"></div>' +
        '    <div class="kg2-canvas-hint">点第2层展开第3层 · 虚线=跨类型关联 · 手机点「图例/详情」</div>' +
        '    <div class="kg2-ctrl"><button type="button" id="kg2ZoomIn">＋</button><button type="button" id="kg2ZoomOut">－</button><button type="button" id="kg2Fit">◎</button></div>' +
        '    <button type="button" class="kg2-rail-btn kg2-rail-right" id="kg2TogglePanel">' + (panelCollapsed ? "«" : "»") + "</button>" +
        "  </div>" +
        '  <aside class="kg2-panel open' + (panelCollapsed ? " is-collapsed" : "") + '" id="kg2Panel"></aside>' +
        "</div>";

      function refit() {
        setTimeout(function () {
          try { if (network) network.fit({ animation: { duration: 260 } }); } catch (e) {}
        }, 280);
      }
      function goBackFocus() {
        if (history.length) {
          centerId = history.pop();
          selectedId = centerId;
          expandedId = null;
          resetShowMore();
          renderFocus();
        } else if (overviewModule) {
          stage = "overview";
          render();
        } else {
          stage = "landing";
          render();
        }
      }
      stageEl.querySelector("#kg2ToggleSide").addEventListener("click", function () {
        setSideOpen(sideCollapsed);
        refit();
      });
      stageEl.querySelector("#kg2TogglePanel").addEventListener("click", function () {
        setPanelOpen(panelCollapsed);
        refit();
      });
      var mobSide = stageEl.querySelector("#kg2MobSide");
      var mobPanel = stageEl.querySelector("#kg2MobPanel");
      var mobBack = stageEl.querySelector("#kg2MobBack");
      var scrim = stageEl.querySelector("#kg2Scrim");
      if (mobSide) mobSide.addEventListener("click", function () { setSideOpen(sideCollapsed); refit(); });
      if (mobPanel) mobPanel.addEventListener("click", function () { setPanelOpen(panelCollapsed); refit(); });
      if (mobBack) mobBack.addEventListener("click", goBackFocus);
      if (scrim) scrim.addEventListener("click", function () {
        sideCollapsed = true;
        panelCollapsed = true;
        syncDrawerUi();
        refit();
      });
      stageEl.querySelector("#kg2Back").addEventListener("click", goBackFocus);

      var pathIds = history.concat([centerId]);
      var histEl = stageEl.querySelector("#kg2Hist");
      histEl.innerHTML = pathIds.map(function (id, idx) {
        var n = byId.get(id);
        return '<button type="button" data-hist="' + id + '" data-idx="' + idx + '">' + (idx + 1) + ". " + esc(trunc(n ? n.name : id, 16)) + "</button>";
      }).join("");
      histEl.querySelectorAll("[data-hist]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var idx = +btn.getAttribute("data-idx");
          history = pathIds.slice(0, idx);
          enterFocus(btn.getAttribute("data-hist"), false);
        });
      });

      wireSearch(stageEl.querySelector("#kg2FocusSearch"), stageEl.querySelector("#kg2FocusDrop"));

      renderPanel(panelNode);
      updateMoreButtons(center);

      var netHost = stageEl.querySelector("#kg2Net");
      function bootGraph() {
        drawGraph(center);
        highlightSelection();
      }
      if (typeof vis === "undefined") {
        if (netHost) {
          netHost.innerHTML = '<div class="kg2-loading" role="status">正在加载图谱引擎（首次约需数秒）…</div>';
        }
        ensureVis().then(bootGraph).catch(function () {
          if (netHost) {
            netHost.innerHTML = '<div class="kg2-empty">图谱引擎加载失败。请刷新重试；若仍失败请检查 vendor/vis-network.min.js 是否已部署。</div>';
          }
        });
      } else {
        bootGraph();
      }

      stageEl.querySelector("#kg2ZoomIn").addEventListener("click", function () {
        if (network) network.moveTo({ scale: Math.min(2.4, network.getScale() * 1.2), animation: { duration: 180 } });
      });
      stageEl.querySelector("#kg2ZoomOut").addEventListener("click", function () {
        if (network) network.moveTo({ scale: Math.max(0.3, network.getScale() / 1.2), animation: { duration: 180 } });
      });
      stageEl.querySelector("#kg2Fit").addEventListener("click", function () {
        if (network) network.fit({ animation: { duration: 320 } });
      });
    }

    // deep link：?node= 定位到对应星点（支持 dash:/tbl:/pb: 与表名、中文名别名）
    try {
      var params = new URLSearchParams(location.search);
      var mod = opts.startModule || params.get("module");
      var nodeRaw = opts.startNode || params.get("node");

      function resolveDeepNode(raw) {
        if (!raw) return null;
        var s = String(raw).trim();
        try { s = decodeURIComponent(s); } catch (e1) { /* keep */ }
        if (byId.get(s)) return s;
        var cleaned = s
          .replace(/（[^）]*）/g, "")
          .replace(/\([^)]*\)/g, "")
          .replace(/看板$/g, "")
          .replace(/视图$/g, "")
          .trim();
        if (byId.get(cleaned)) return cleaned;
        var token = cleaned.split(/[\s,，、]+/)[0] || "";
        if (/^(ods_|dim_|dwd_|dws_|v_|fact_|ads_)/i.test(token) && byId.get("tbl:" + token)) {
          return "tbl:" + token;
        }
        if (/^metric:/i.test(s)) {
          var mname = s.slice(7);
          if (byId.get("metric:" + mname)) return "metric:" + mname;
          var mfound = null;
          byId.forEach(function (n, id) {
            if (mfound || !n || n.type !== "metric") return;
            if (String(n.name || "").toLowerCase() === mname.toLowerCase()) mfound = id;
          });
          if (mfound) return mfound;
          byId.forEach(function (n, id) {
            if (mfound || !n || n.type !== "metric") return;
            var nm = String(n.name || "").toLowerCase();
            if (nm && (nm.indexOf(mname.toLowerCase()) >= 0 || mname.toLowerCase().indexOf(nm) >= 0)) mfound = id;
          });
          if (mfound) return mfound;
        }
        if (/^[a-z][a-z0-9_-]*$/i.test(token) && byId.get("dash:" + token.toLowerCase())) {
          return "dash:" + token.toLowerCase();
        }
        var lower = cleaned.toLowerCase();
        var found = null;
        byId.forEach(function (n, id) {
          if (found || !n || n.isRoot || n.isCategory) return;
          var nm = String(n.name || "").toLowerCase();
          if (nm === lower) found = id;
        });
        if (found) return found;
        byId.forEach(function (n, id) {
          if (found || !n || n.isRoot || n.isCategory) return;
          var nm = String(n.name || "").toLowerCase();
          if (nm && (nm.indexOf(lower) >= 0 || lower.indexOf(nm) >= 0)) found = id;
        });
        return found;
      }

      var node = resolveDeepNode(nodeRaw);
      if (node && byId.get(node)) {
        overviewModule = byId.get(node).type;
        enterFocus(node, false);
      } else if (mod && TYPE[mod]) {
        overviewModule = mod;
        var cats = catsOfModule(mod);
        if (cats.length === 1) overviewCat = cats[0].id;
        stage = "overview";
        render();
      } else {
        render();
      }
    } catch (e) {
      render();
    }

    // 空闲时预拉图谱引擎，减少点进聚焦时的等待
    var idle = window.requestIdleCallback || function (cb) { setTimeout(cb, 1200); };
    idle(function () { ensureVis().catch(function () {}); }, { timeout: 2500 });

    return { render: render, enterFocus: enterFocus };
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector("#pkgRoot") && window.PLATFORM_KG_DATA) {
      window.initPlatformKnowledgeGraph({ root: "#pkgRoot" });
    }
  });
})();
