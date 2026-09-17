# -*- coding: utf-8 -*-
"""Tighten KG node spacing to match 行业百科 compact fan layout."""
from pathlib import Path

FILES = [
    Path(r"D:\cursor\数据学习平台\数据知识图谱.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\learn.html"),
    Path(r"D:\cursor\多行业数据平台\portfolio\pages\数据知识图谱.html"),
    Path(r"D:\cursor\financial-data-portfolio-publish\pages\learn.html"),
]

REPLACEMENTS = [
    (
        """        /** 同扇区内节点越多，扇面越宽，避免挤在正下方叠字 */
        function sectorFanSpread(n) {
          if (n <= 1) return 0;
          if (n === 2) return 0.7;
          if (n === 3) return 1.1;
          if (n === 4) return 1.4;
          return Math.min(1.95, 0.4 * n);
        }""",
        """        /** 对齐行业百科：扇面紧凑（百科为 min(0.9, 0.18*n)） */
        function sectorFanSpread(n) {
          if (n <= 1) return 0;
          // 略宽于百科一点，留给中文标签；仍远小于旧版 0.7~1.95
          return Math.min(1.0, 0.20 * Math.max(n, 1));
        }""",
    ),
    (
        """                // 百科同款：同扇区共圆半径，仅极角扇开（避免锯齿半径把线搅乱）
                const ringBoost = key === "practice" ? -12 : 0;
                const baseR = 175 + ringBoost + Math.min(28, Math.max(0, n - 4) * 6);""",
        """                // 百科同款更紧凑：半径约 148，扇内微错层
                const ringBoost = key === "practice" ? -8 : 0;
                const baseR = 148 + ringBoost + (i % 3) * 14;""",
    ),
    (
        """                  const fan3 = Math.min(1.1, 0.22 * Math.max(n3, 1));
                  l3s.forEach((c3, j) => {
                    const ang3 = n3 === 1 ? l2Node.ang : l2Node.ang - fan3 / 2 + (fan3 * j) / Math.max(n3 - 1, 1);
                    const r3 = l2Node.r + 118 + (j % 2) * 16;""",
        """                  const fan3 = Math.min(0.95, 0.20 * Math.max(n3, 1));
                  l3s.forEach((c3, j) => {
                    const ang3 = n3 === 1 ? l2Node.ang : l2Node.ang - fan3 / 2 + (fan3 * j) / Math.max(n3 - 1, 1);
                    const r3 = l2Node.r + 96 + (j % 2) * 12;""",
    ),
    (
        """                      const fan4 = Math.min(0.9, 0.2 * Math.max(n4, 1));
                      l4s.forEach((c4, k) => {
                        const ang4 = n4 === 1 ? ang3 : ang3 - fan4 / 2 + (fan4 * k) / Math.max(n4 - 1, 1);
                        const r4 = r3 + 88 + (k % 2) * 12;""",
        """                      const fan4 = Math.min(0.75, 0.18 * Math.max(n4, 1));
                      l4s.forEach((c4, k) => {
                        const ang4 = n4 === 1 ? ang3 : ang3 - fan4 / 2 + (fan4 * k) / Math.max(n4 - 1, 1);
                        const r4 = r3 + 72 + (k % 2) * 10;""",
    ),
    (
        "              const fan = Math.min(1.35, 0.28 * Math.max(total, 1));",
        "              const fan = Math.min(0.95, 0.20 * Math.max(total, 1));",
    ),
    (
        "            const jitter = (layer >= 3) ? (idx % 2) * 12 : 0;",
        "            const jitter = (layer >= 3) ? (idx % 2) * 8 : 0;",
    ),
    (
        """            .force("collide", d3.forceCollide()
              .radius(d => (d._r || 20) + (d.layer === 2 ? 16 : 11))
              .strength(0.72)
              .iterations(2))
            .force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.045))""",
        """            .force("collide", d3.forceCollide()
              .radius(d => (d._r || 20) + (d.layer === 2 ? 10 : 7))
              .strength(0.7)
              .iterations(2))
            .force("link", d3.forceLink(springs).distance(d => d.dist).strength(0.05))""",
    ),
    (
        "                dist: Math.max(100, Math.min(160, Math.hypot(d.tx - p.tx, d.ty - p.ty) || 120))",
        "                dist: Math.max(72, Math.min(120, Math.hypot(d.tx - p.tx, d.ty - p.ty) || 96))",
    ),
    (
        "              const minR = d.layer === 2 ? 88 : 62;",
        "              const minR = d.layer === 2 ? 72 : 52;",
    ),
    (
        """            .force("x", d3.forceX(d => d.tx).strength(0.055))
            .force("y", d3.forceY(d => d.ty).strength(0.055))""",
        """            .force("x", d3.forceX(d => d.tx).strength(0.12))
            .force("y", d3.forceY(d => d.ty).strength(0.12))""",
    ),
    (
        "            let dy = r + 13;",
        "            let dy = r + 10;",
    ),
    # soft phase also tighten xy anchor
    (
        """              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.04));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.04));""",
        """              kgLiveSim.force("x", d3.forceX(d => d.tx).strength(0.09));
              kgLiveSim.force("y", d3.forceY(d => d.ty).strength(0.09));""",
    ),
]


def main():
    for p in FILES:
        t = p.read_text(encoding="utf-8")
        n = 0
        for old, new in REPLACEMENTS:
            if old in t:
                t = t.replace(old, new)
                n += 1
            else:
                preview = old.split("\n")[0][:50]
                print(p.name, "MISS:", preview)
        p.write_text(t, encoding="utf-8")
        print(
            p.name,
            "n=",
            n,
            "ok",
            "0.20 * Math.max(n, 1)" in t and "148 + ringBoost" in t,
        )


if __name__ == "__main__":
    main()
