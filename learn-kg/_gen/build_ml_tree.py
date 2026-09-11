# -*- coding: utf-8 -*-
"""Build expanded ML knowledge tree (SQL-aligned depth), then inject."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LESSONS = Path(__file__).resolve().parent / "lessons"


def lesson(id_, title, level, content, children=None, lesson_parent=False):
    d = {
        "id": id_,
        "title": title,
        "level": level,
        "content": content,
        "children": children or [],
    }
    if lesson_parent:
        d["lessonParent"] = True
    return d


def leaf(id_, title, level, defn, core, code, u1, u2, u3, n1, n2, n3, lang="python"):
    content = f"""### 是什么

- **一句话定义**：{defn}
- **核心要素**：{core}

### 怎么写

```{lang}
{code}
```

### 用在哪

1. {u1}
2. {u2}
3. {u3}

### 注意啥

- {n1}
- {n2}
- {n3}"""
    return lesson(id_, title, level, content, [])


def chapter(id_, title, level, goal, prep, kids):
    content = f"""### {title} · 章节导读

**学习目标**：{goal}

**先修**：{prep}

点下方绿色叶节点进入各讲义。"""
    return lesson(id_, title, level, content, kids, lesson_parent=True)


def domain(id_, title, level, blurb, kids, sector=None):
    d = lesson(id_, title, level, f"### {title}\n\n{blurb}", kids)
    if sector:
        d["sector"] = sector
    return d


TREE = lesson(
    "ml-root",
    "机器学习/算法",
    "?",
    """### 机器学习知识图谱

四层结构：**领域 → 主题 → 知识点**（对齐 SQL 教程树）。

- 点中心 **机器学习/算法** 展开一级领域
- 再点某一级查看其二级主题
- **倒数第二层**打开章节导读 + 子课列表
- **叶节点**打开完整讲义（是什么 / 怎么写 / 用在哪 / 注意啥）

建议路径：基础范式 → 特征工程 → 核心任务 → 经典/深度模型 → 推荐·文本·时序·异常 → 评估落地。""",
    [
        # ── 1. 基础范式 ──────────────────────────────────────────
        domain(
            "ml-foundation",
            "基础范式",
            "?",
            "先分清学习范式与训练纪律，再谈特征与模型——这是整棵树的地基。",
            [
                chapter(
                    "ml-paradigm",
                    "学习范式",
                    "?",
                    "能判断业务该用监督、无监督、半监督还是强化学习思路。",
                    "无。",
                    [
                        leaf(
                            "ml-supervised",
                            "监督学习",
                            "?",
                            "用带标签样本学习映射 \\(f(X)\\to y\\)，用于分类与回归。",
                            "特征 \\(X\\)、标签 \\(y\\)、模型、损失函数、泛化评估。",
                            """from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, shuffle=False)
clf = LogisticRegression(max_iter=1000).fit(Xtr, ytr)
print(clf.score(Xte, yte))""",
                            "**风控打标**：历史案件作标签，训欺诈分类。",
                            "**转化预测**：是否下单/是否留存。",
                            "**回归估值**：预测销量、时长、金额。",
                            "标签定义必须与业务一致，含糊标签会毁模型。",
                            "按时间切分，禁止随机打乱造成穿越。",
                            "有可靠标签优先监督学习，不要硬上无监督。",
                        ),
                        leaf(
                            "ml-unsupervised",
                            "无监督学习",
                            "?",
                            "无标签时发现结构：聚类、降维、密度异常等。",
                            "相似度/距离、簇数或密度参数、可解释的画像。",
                            """from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
Xs = StandardScaler().fit_transform(X)
km = KMeans(n_clusters=4, n_init=10, random_state=42).fit(Xs)
print(km.labels_[:20])""",
                            "**用户分群**：RFM 聚类做运营分层。",
                            "**主题发现**：文本/行为降维观察结构。",
                            "**异常初筛**：远离主簇进入人工核查。",
                            "无统一「准确率」，要用业务能否讲清每簇。",
                            "特征尺度不同必须标准化。",
                            "已有标签时应走监督，不要用聚类硬当分类。",
                        ),
                        leaf(
                            "ml-semisupervised",
                            "半监督学习",
                            "??",
                            "少量有标签 + 大量无标签，用无标签结构提升模型。",
                            "伪标签、一致性正则、自训练、标签传播。",
                            """# 自训练示意：先用有标数据训基线，再给高置信无标签打伪标
from sklearn.semi_supervised import SelfTrainingClassifier
from sklearn.linear_model import LogisticRegression
base = LogisticRegression(max_iter=1000)
st = SelfTrainingClassifier(base, threshold=0.9)
st.fit(X_all, y_partial)  # y_partial 中无标签为 -1""",
                            "**标注贵**：客服意图/质检只有少量人工标。",
                            "**冷启动业务**：新场景标签稀缺。",
                            "**医学影像等**：专家标注成本高。",
                            "伪标签错了会自我强化，阈值要严。",
                            "无标签分布必须与上线分布一致。",
                            "最终仍要用真标签集做验收。",
                        ),
                        leaf(
                            "ml-rl-intro",
                            "强化学习入门",
                            "???",
                            "智能体在环境中试错，最大化长期回报（不是一次预测标签）。",
                            "状态、动作、奖励、策略、探索与利用。",
                            """# 概念对照（非完整训练代码）
# state: 用户上下文 / 库存
# action: 推哪张券 / 哪个价格档
# reward: 点击、成交、长期 LTV（可延迟）
# policy: 从 state 选 action 的规则或模型""",
                            "**动态出价/定价**。",
                            "**推荐探索**：多臂老虎机平衡新内容。",
                            "**对话/游戏策略**优化。",
                            "奖励设计比算法更关键，错奖会学歪。",
                            "离线日志有偏差，直接模仿学习会踩坑。",
                            "多数表格业务仍先用监督学习，RL 是进阶选项。",
                        ),
                    ],
                ),
                chapter(
                    "ml-train-discipline",
                    "训练纪律",
                    "??",
                    "建立可复现的训练闭环，理解过拟合与偏差-方差。",
                    "监督学习概念。",
                    [
                        leaf(
                            "ml-pipeline",
                            "训练流水线",
                            "??",
                            "把预处理与模型串成可复现的 Pipeline，避免泄漏与手工不一致。",
                            "`Pipeline`/`ColumnTransformer`、fit 仅在训练集、同一管道用于预测。",
                            """from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import HistGradientBoostingClassifier
pipe = Pipeline([
    ("sc", StandardScaler()),
    ("clf", HistGradientBoostingClassifier(max_depth=6)),
])
pipe.fit(X_train, y_train)
proba = pipe.predict_proba(X_test)[:, 1]""",
                            "**基线模型**：快速跑通评估闭环。",
                            "**特征+模型一体**：上线与离线同构。",
                            "**交叉验证**：管道整体进 CV，防预处理泄漏。",
                            "标准化/编码只能在训练折 fit。",
                            "线上推理必须加载同一管道产物。",
                            "超参搜索要对整条管道，而不是只对最后一步。",
                        ),
                        leaf(
                            "ml-bias-variance",
                            "偏差与方差",
                            "??",
                            "误差可拆成偏差（欠拟合）与方差（过拟合），指导加复杂或加正则。",
                            "欠拟合、过拟合、模型复杂度、样本量、正则化。",
                            """# 诊断思路
# 训练分很低 + 验证分也很低 → 偏差大：加特征/换强模型
# 训练分很高 + 验证分很低 → 方差大：正则/减特征/加数据
from sklearn.model_selection import learning_curve
# learning_curve(estimator, X, y, cv=5) 观察曲线形态""",
                            "**调参决策**：该加深树还是剪枝。",
                            "**加数据 vs 加模型**：看学习曲线。",
                            "**评审会**：用偏差-方差语言对齐预期。",
                            "只看训练集分数会误判过拟合。",
                            "业务指标与损失不完全一致时，以业务为准。",
                            "换指标后要重新诊断，不要沿用旧结论。",
                        ),
                        leaf(
                            "ml-overfit-reg",
                            "过拟合与正则",
                            "??",
                            "模型记住噪声；用 L1/L2、早停、降复杂度、更多数据压制。",
                            "正则强度、早停、Dropout、剪枝、交叉验证选参。",
                            """from sklearn.linear_model import LogisticRegression
# C 越小正则越强（sklearn 逻辑回归）
clf = LogisticRegression(C=0.1, penalty="l2", max_iter=1000)
clf.fit(X_train, y_train)""",
                            "**高维稀疏特征**：广告/文本 one-hot。",
                            "**小样本场景**：必须强正则。",
                            "**树模型**：限制深度/叶子最小样本。",
                            "正则不是越大越好，要用验证集选。",
                            "L1 可做特征选择，但不稳定时慎用。",
                            "早停的监控指标要与上线目标相关。",
                        ),
                        leaf(
                            "ml-train-val-test",
                            "训练/验证/测试",
                            "?",
                            "三套数据分工：训练拟合、验证选模、测试只做一次最终验收。",
                            "切分策略、禁止用测试调参、时间切优先。",
                            """# 时序三切（示意）
# train: t < T1 | valid: T1..T2 | test: T2..T3
train = df[df.dt < "2025-01-01"]
valid = df[(df.dt >= "2025-01-01") & (df.dt < "2025-02-01")]
test  = df[df.dt >= "2025-02-01"]""",
                            "**模型选型**：验证集比 AUC/LogLoss。",
                            "**汇报口径**：测试集只报一次。",
                            "**回测窗口**：多段测试防单月运气。",
                            "测试集反复调参等于泄漏。",
                            "验证与测试分布要接近上线。",
                            "类别极不均衡时分层或按时间保留比例。",
                        ),
                    ],
                ),
            ],
            sector="foundation",
        ),
        # ── 2. 特征工程 ──────────────────────────────────────────
        domain(
            "ml-feature",
            "特征工程",
            "??",
            "表格模型里特征往往比算法更决定上限；工程与防泄漏是硬功夫。",
            [
                chapter(
                    "ml-feature-build",
                    "特征构建",
                    "??",
                    "会做数值/类别/缺失处理，并写出无穿越的聚合特征。",
                    "Pipeline、训练切分。",
                    [
                        leaf(
                            "ml-feature-eng",
                            "特征工程总览",
                            "??",
                            "把原始字段变成模型可学、稳定且无泄漏的特征。",
                            "数值变换、类别编码、交叉特征、聚合窗口、缺失处理。",
                            """import pandas as pd
feat = (
    events[events["dt"] < pred_date]
    .groupby("user_id")
    .agg(pay_7d=("amount", "sum"), cnt_7d=("event_id", "count"))
    .reset_index()
)""",
                            "**表格模型**：树模型吃交叉与分桶特征。",
                            "**行为序列**：滑动窗口计数/金额。",
                            "**冷启动**：内容/画像特征兜底。",
                            "聚合窗口右边界不能越过预测时刻。",
                            "高基数类别慎用独热，优先目标编码并做好 CV。",
                            "特征要可监控：分布漂移要能报警。",
                        ),
                        leaf(
                            "ml-missing",
                            "缺失值处理",
                            "??",
                            "缺失本身可能是信号；填充策略必须与模型类型匹配。",
                            "删除、常数/中位数填充、缺失指示列、模型原生支持。",
                            """import pandas as pd
from sklearn.impute import SimpleImputer
X = X.copy()
X["age_isna"] = X["age"].isna().astype(int)
imp = SimpleImputer(strategy="median")
X[["age"]] = imp.fit_transform(X[["age"]])""",
                            "**问卷/表单**：未填项当单独类别。",
                            "**传感器**：短缺失插值，长缺失丢弃。",
                            "**树模型**：可直接吃 NaN（如 HGB/LightGBM）。",
                            "用全局统计填充前确认无泄漏。",
                            "测试集填充只能用训练集统计量。",
                            "「用标签均值填」几乎必泄漏。",
                        ),
                        leaf(
                            "ml-encoding",
                            "类别编码",
                            "??",
                            "把类别字段变成数值：独热、序号、目标编码、哈希等。",
                            "基数、稀有类、目标编码 CV、未见类别。",
                            """from sklearn.preprocessing import OneHotEncoder
enc = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
Xtr_cat = enc.fit_transform(train[["city", "channel"]])
Xte_cat = enc.transform(test[["city", "channel"]])""",
                            "**低基数**：城市等级、渠道 — 独热。",
                            "**高基数**：店铺/商品 ID — 目标编码或哈希。",
                            "**树模型**：有时直接吃整数码也行。",
                            "目标编码必须按折计算，防泄漏。",
                            "线上出现新类别要有兜底桶。",
                            "独热爆炸维度时改用其他编码。",
                        ),
                        leaf(
                            "ml-scaling",
                            "标准化与缩放",
                            "?",
                            "让不同量纲特征可比；线性/距离模型几乎必需，树模型通常不需要。",
                            "StandardScaler、MinMax、稳健缩放、仅训练集 fit。",
                            """from sklearn.preprocessing import StandardScaler
sc = StandardScaler()
Xtr_s = sc.fit_transform(X_train)
Xte_s = sc.transform(X_test)""",
                            "**逻辑回归/SVM/KNN/神经网络**。",
                            "**聚类、PCA** 前。",
                            "**梯度下降优化**更稳。",
                            "树模型一般跳过缩放，省算力。",
                            "有极端异常值时考虑 RobustScaler。",
                            "缩放器必须进 Pipeline，禁止先全表缩放。",
                        ),
                    ],
                ),
                chapter(
                    "ml-feature-risk",
                    "特征风险",
                    "??",
                    "能识别泄漏、漂移，并做基础特征选择。",
                    "特征构建、时间切分。",
                    [
                        leaf(
                            "ml-leakage",
                            "数据泄露",
                            "??",
                            "训练时误用「预测时点之后才知道」的信息，导致虚高离线分、上线崩盘。",
                            "时间对齐、可用字段截止、目标泄漏、预处理泄漏。",
                            """# 错误：全表目标均值
# df["city_rate"] = df.groupby("city")["y"].transform("mean")
means = train.groupby("city")["y"].mean()
val["city_mean"] = val["city"].map(means)""",
                            "**特征评审**：上线前排查穿越字段。",
                            "**管道审查**：Scaler/编码器是否 fit 了测试集。",
                            "**业务对拍**：离在线指标差过大时优先查泄漏。",
                            "随机切分时序问题几乎必穿，改用时间切。",
                            "「是否成交」衍生的事后字段不能进预测特征。",
                            "交叉验证每一折都要重算统计特征。",
                        ),
                        leaf(
                            "ml-feat-selection",
                            "特征选择",
                            "??",
                            "去掉噪声与冗余特征，提升稳定性、速度与可解释性。",
                            "过滤法、包裹法、嵌入法、业务黑白名单。",
                            """from sklearn.feature_selection import mutual_info_classif
mi = mutual_info_classif(X_train, y_train, random_state=42)
ranked = sorted(zip(feature_names, mi), key=lambda x: -x[1])
print(ranked[:20])""",
                            "**高维表格**：先滤再训。",
                            "**解释性要求高**：留可讲清的特征。",
                            "**线上成本**：砍掉计算贵、增益低的特征。",
                            "只看训练集重要性会过拟合选择。",
                            "相关≠因果，勿删业务硬约束特征。",
                            "选择结果要随数据重跑，不是一次定终身。",
                        ),
                        leaf(
                            "ml-feat-drift",
                            "特征漂移",
                            "???",
                            "线上特征分布相对训练期发生变化，模型分数失效。",
                            "PSI/KL、分位数监控、分段报警、再训练触发。",
                            """import numpy as np
def psi(expected, actual, bins=10):
    qs = np.linspace(0, 100, bins + 1)
    cuts = np.percentile(expected, qs)
    e_hist = np.histogram(expected, bins=cuts)[0] + 1e-6
    a_hist = np.histogram(actual, bins=cuts)[0] + 1e-6
    e_p, a_p = e_hist / e_hist.sum(), a_hist / a_hist.sum()
    return np.sum((a_p - e_p) * np.log(a_p / e_p))""",
                            "**日更打分表**：监控 top 特征 PSI。",
                            "**活动/疫情冲击**后诊断。",
                            "**新渠道流量**占比变化。",
                            "PSI 高不等于一定掉业务，要联看效果指标。",
                            "离散特征用占比变化，不要硬套数值 PSI。",
                            "先修数据质量，再怪模型。",
                        ),
                    ],
                ),
            ],
            sector="foundation",
        ),
        # ── 3. 核心任务 ──────────────────────────────────────────
        domain(
            "ml-tasks",
            "核心任务",
            "?",
            "分类 / 回归 / 聚类 / 排序——先选对问题类型，再谈模型与指标。",
            [
                chapter(
                    "ml-classify-ch",
                    "分类",
                    "??",
                    "能完成二/多分类基线，并按业务选阈值与指标。",
                    "监督学习、Pipeline。",
                    [
                        leaf(
                            "ml-classify",
                            "分类总览",
                            "??",
                            "根据已有标签，把样本分到离散类别（如作弊/正常、流失/留存）。",
                            "特征 \\(X\\)、类别标签 \\(y\\)、分类器、概率阈值、评估指标。",
                            """from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, roc_auc_score
clf = Pipeline([
    ("sc", StandardScaler()),
    ("lr", LogisticRegression(class_weight="balanced", max_iter=1000)),
])
clf.fit(Xtr, ytr)
proba = clf.predict_proba(Xte)[:, 1]
print(classification_report(yte, (proba >= 0.5).astype(int)))
print("AUC", roc_auc_score(yte, proba))""",
                            "**风控审核**：交易是否欺诈。",
                            "**用户运营**：是否高意向。",
                            "**内容审核**：是否违规。",
                            "时间切分；禁止打乱造成穿越。",
                            "类别不平衡时别只报 Accuracy。",
                            "阈值要按成本/收益定，不是默认 0.5。",
                        ),
                        leaf(
                            "ml-multiclass",
                            "多分类",
                            "??",
                            "标签超过两类：一对其余、一对一或多类损失直接优化。",
                            "类别数、混淆矩阵、宏/微平均、类别不平衡。",
                            """from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report
clf = HistGradientBoostingClassifier(max_depth=6)
clf.fit(X_train, y_train)
print(classification_report(y_test, clf.predict(X_test)))""",
                            "**意图识别**：多类客服意图。",
                            "**商品类目预测**。",
                            "**故障类型诊断**。",
                            "稀有类要单独看召回，别只看整体 Accuracy。",
                            "类别过多时可先分层/先召回候选。",
                            "标签体系变更要重训并做映射。",
                        ),
                        leaf(
                            "ml-threshold",
                            "阈值与决策",
                            "??",
                            "模型输出分数，业务用阈值（或代价矩阵）变成动作。",
                            "精确率-召回率权衡、成本敏感、校准。",
                            """import numpy as np
from sklearn.metrics import precision_recall_curve
prec, rec, thr = precision_recall_curve(y_true, proba)
# 例：召回 >= 0.8 时精确率最高的阈值
ok = np.where(rec[:-1] >= 0.8)[0]
best = ok[np.argmax(prec[ok])]
print("thr", thr[best], "P", prec[best], "R", rec[best])""",
                            "**审核队列**：控制人工量（精确率）。",
                            "**风控拦截**：控制漏放（召回）。",
                            "**营销触达**：控制打扰与预算。",
                            "换季节/流量后阈值要重标定。",
                            "分数未校准时，阈值不可跨模型复用。",
                            "线上用同一套特征与同一分数定义。",
                        ),
                        leaf(
                            "ml-imbalance",
                            "样本不平衡",
                            "??",
                            "正负比例悬殊时，默认准确率失效，需重采样、权重或专用指标。",
                            "class_weight、欠/过采样、阈值、PR-AUC、业务代价。",
                            """from sklearn.linear_model import LogisticRegression
clf = LogisticRegression(class_weight="balanced", max_iter=1000)
clf.fit(X_train, y_train)
# 评估用 PR-AUC / Recall@FPR，而不是 Accuracy""",
                            "**欺诈/盗号**：正例极少。",
                            "**罕见故障**检测。",
                            "**医疗阳性**筛查。",
                            "盲目 SMOTE 可能引入假模式，优先试 class_weight。",
                            "采样只在训练集做，验证/测试保持真实比例。",
                            "最终以业务代价或约束下的指标选型。",
                        ),
                        leaf(
                            "ml-metrics-clf",
                            "分类指标",
                            "??",
                            "Accuracy/Precision/Recall/F1/AUC/PR-AUC 各自回答不同问题。",
                            "混淆矩阵、排序能力、阈值相关指标。",
                            """from sklearn.metrics import roc_auc_score, average_precision_score, f1_score
print("AUC", roc_auc_score(y, p))
print("PR-AUC", average_precision_score(y, p))
print("F1@0.5", f1_score(y, p >= 0.5))""",
                            "**排序选人**：看 AUC。",
                            "**极端不平衡**：看 PR-AUC。",
                            "**固定动作成本**：看指定阈值下的 P/R。",
                            "不要只报一个好看的数。",
                            "AUC 高也可能业务阈值下很差。",
                            "多分类写明 macro/micro/weighted。",
                        ),
                    ],
                ),
                chapter(
                    "ml-regress-ch",
                    "回归",
                    "??",
                    "能建立回归基线并选择合适误差指标。",
                    "监督学习、特征缩放。",
                    [
                        leaf(
                            "ml-predict",
                            "回归预测",
                            "??",
                            "预测连续值：销量、时长、金额、温度等。",
                            "损失（MSE/MAE）、特征、残差诊断、区间预测。",
                            """from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
reg = HistGradientBoostingRegressor(max_depth=6)
reg.fit(X_train, y_train)
pred = reg.predict(X_test)
print("MAE", mean_absolute_error(y_test, pred))
print("RMSE", mean_squared_error(y_test, pred) ** 0.5)""",
                            "**销量/库存**预测。",
                            "**完单时长**预估。",
                            "**定价/估值**辅助。",
                            "目标长尾时考虑 log1p 变换。",
                            "业务更关心相对误差时用 MAPE（注意零值）。",
                            "同样要防时间穿越特征。",
                        ),
                        leaf(
                            "ml-metrics-reg",
                            "回归指标",
                            "??",
                            "MAE/RMSE/MAPE/R² 衡量不同误差形态。",
                            "绝对误差、平方惩罚离群、相对误差、可释方差。",
                            """from sklearn.metrics import mean_absolute_error, r2_score
mae = mean_absolute_error(y, pred)
r2 = r2_score(y, pred)
mape = (abs(y - pred) / y.clip(lower=1e-6)).mean()
print(mae, r2, mape)""",
                            "**调度容忍绝对误差**：看 MAE。",
                            "**重罚大错**：看 RMSE。",
                            "**跨品类对比**：谨慎用 MAPE。",
                            "R² 低不一定不能用，看业务门槛。",
                            "有零或负值时 MAPE 失真。",
                            "分段/分群报指标，避免被头部样本主导。",
                        ),
                        leaf(
                            "ml-quantile-reg",
                            "分位数回归",
                            "???",
                            "预测条件分位数，给出区间或偏保守/激进的点估计。",
                            "分位数 \\(q\\)、非对称损失、上下界。",
                            """from sklearn.ensemble import GradientBoostingRegressor
# 预测 10% / 90% 分位作区间
low = GradientBoostingRegressor(loss="quantile", alpha=0.1).fit(X, y)
high = GradientBoostingRegressor(loss="quantile", alpha=0.9).fit(X, y)
interval = list(zip(low.predict(Xte), high.predict(Xte)))""",
                            "**库存安全库存**上界。",
                            "**ETA**：给用户区间而不是单点。",
                            "**风控金额**保守估计。",
                            "分位数模型要分别训练或用专用框架。",
                            "覆盖率要在验证集校准。",
                            "极值分位需要更多数据。",
                        ),
                    ],
                ),
                chapter(
                    "ml-cluster-ch",
                    "聚类",
                    "??",
                    "会做可解释分群，并理解簇数与距离的选择。",
                    "无监督、标准化。",
                    [
                        leaf(
                            "ml-cluster",
                            "聚类总览",
                            "??",
                            "按相似度把样本分成若干组，用于画像与探索。",
                            "距离、簇数、标准化、业务可解释性。",
                            """from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
Xs = StandardScaler().fit_transform(X)
km = KMeans(n_clusters=5, n_init=10, random_state=42).fit(Xs)
labels = km.labels_""",
                            "**用户分层运营**。",
                            "**商品/内容主题簇**。",
                            "**异常粗筛**。",
                            "结果必须能用业务语言讲清。",
                            "特征尺度混杂时先标准化。",
                            "簇数不是越大越好。",
                        ),
                        leaf(
                            "ml-cluster-k",
                            "K-Means 实务",
                            "??",
                            "最常用质心聚类；用肘部/轮廓系数辅助选 K，多次初始化。",
                            "`n_clusters`、`n_init`、惯性、轮廓系数。",
                            """from sklearn.metrics import silhouette_score
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(Xs)
    print(k, km.inertia_, silhouette_score(Xs, km.labels_))""",
                            "**快速基线分群**。",
                            "**大数据预分桶**再精细运营。",
                            "**向量量化**粗糙量化。",
                            "假设球状簇，复杂形状看 DBSCAN。",
                            "对异常值敏感，可先裁剪。",
                            "类别特征需先编码再进 K-Means。",
                        ),
                        leaf(
                            "ml-dbscan",
                            "密度聚类 DBSCAN",
                            "??",
                            "按密度连成任意形状簇，并能标出噪声点。",
                            "`eps`、`min_samples`、噪声标签 -1。",
                            """from sklearn.cluster import DBSCAN
db = DBSCAN(eps=0.8, min_samples=20).fit(Xs)
print(set(db.labels_))  # -1 为噪声""",
                            "**地理围栏/轨迹**聚集。",
                            "**异常点**顺带检出。",
                            "**非球状**簇结构。",
                            "eps 依赖尺度，必须先标准化/调参。",
                            "高维效果变差，可先降维。",
                            "密度不均时可能碎裂或粘连。",
                        ),
                    ],
                ),
                chapter(
                    "ml-rank-ch",
                    "排序学习",
                    "???",
                    "理解推荐/搜索里的排序目标与 pairwise/listwise 思路。",
                    "分类概率、推荐业务背景。",
                    [
                        leaf(
                            "ml-ltr-intro",
                            "Learning to Rank",
                            "???",
                            "直接优化排序质量（不是单点分类），常见于搜索与推荐精排。",
                            "pointwise / pairwise / listwise、NDCG、曝光偏差。",
                            """# pointwise 近似：把「是否点击」当二分类
# pairwise 思路：同 query 下正样本分 > 负样本分
# 损失示意：max(0, margin - (s_pos - s_neg))
margin = 1.0
loss = max(0.0, margin - (s_pos - s_neg))""",
                            "**搜索结果精排**。",
                            "**推荐精排模型**。",
                            "**广告排序**。",
                            "日志有位置偏差，需逆倾向或位置特征。",
                            "离线 NDCG 高不等于在线 CTR 升。",
                            "候选集变化时排序模型要重评。",
                        ),
                        leaf(
                            "ml-ndcg",
                            "NDCG 与排序指标",
                            "???",
                            "衡量排序列表与理想序的接近程度，强调头部位置。",
                            "DCG/NDCG、MAP、MRR、TopK。",
                            """import numpy as np
def dcg(rels):
    rels = np.asarray(rels, dtype=float)
    return np.sum((2 ** rels - 1) / np.log2(np.arange(2, rels.size + 2)))
def ndcg(rels, ideal):
    return dcg(rels) / (dcg(sorted(ideal, reverse=True)) + 1e-9)""",
                            "**搜索/推荐离线评估**。",
                            "**多级相关性**标注集。",
                            "**不同 K** 的头部质量对比。",
                            "标注不一致会淹没模型差异。",
                            "只看 NDCG@K 时说明 K。",
                            "要按 query/会话加权，避免被热门 query 主导。",
                        ),
                    ],
                ),
            ],
            sector="advanced",
        ),
        # ── 4. 经典模型 ──────────────────────────────────────────
        domain(
            "ml-models",
            "经典模型",
            "??",
            "线性族、树与提升、近邻与 SVM——表格场景最常用的武器库。",
            [
                chapter(
                    "ml-linear-ch",
                    "线性族",
                    "??",
                    "掌握逻辑回归与线性回归，理解正则化选型。",
                    "特征缩放、训练/验证切分。",
                    [
                        leaf(
                            "ml-logreg",
                            "逻辑回归",
                            "??",
                            "用线性打分 + Sigmoid 输出概率的经典分类器，可解释性强。",
                            "权重、正则、概率校准、特征尺度。",
                            """from sklearn.linear_model import LogisticRegression
clf = LogisticRegression(C=1.0, max_iter=1000, class_weight="balanced")
clf.fit(X_train, y_train)
print(dict(zip(feat_names, clf.coef_[0].round(4))))""",
                            "**风控评分卡**基线。",
                            "**可解释分类**需要看系数。",
                            "**在线更新**的简单 CTR 模型。",
                            "特征需缩放；类别要编码。",
                            "非线性关系需交叉特征或换树模型。",
                            "系数解释前注意共线性。",
                        ),
                        leaf(
                            "ml-linear-reg",
                            "线性回归",
                            "??",
                            "用线性组合拟合连续目标，是回归问题的起点。",
                            "最小二乘、正则、残差、多重共线性。",
                            """from sklearn.linear_model import Ridge
reg = Ridge(alpha=1.0)
reg.fit(X_train, y_train)
print(reg.score(X_test, y_test))""",
                            "**基线预测**任何数值目标。",
                            "**因果/解释**导向的简单建模。",
                            "**特征筛选**后的透明模型。",
                            "有共线性用 Ridge/Lasso。",
                            "残差有结构说明欠拟合。",
                            "目标变换后记得反变换评估。",
                        ),
                        leaf(
                            "ml-ridge-lasso",
                            "Ridge / Lasso",
                            "??",
                            "L2 收缩系数（Ridge）与 L1 稀疏（Lasso），对抗过拟合与共线。",
                            "`alpha`、稀疏解、标准化、交叉验证选参。",
                            """from sklearn.linear_model import RidgeCV, LassoCV
ridge = RidgeCV(alphas=[0.1, 1, 10]).fit(X_train, y_train)
lasso = LassoCV(cv=5).fit(X_train, y_train)
print("ridge", ridge.alpha_, "lasso nnz", (lasso.coef_ != 0).sum())""",
                            "**高维回归**稳定化。",
                            "**自动筛特征**（Lasso）。",
                            "**评分卡**约束复杂度。",
                            "Lasso 选中的特征不稳定时改 ElasticNet。",
                            "必须先标准化再比系数。",
                            "分类场景对应 Logistic 的 L1/L2。",
                        ),
                    ],
                ),
                chapter(
                    "ml-tree-ch",
                    "树与提升",
                    "??",
                    "从单棵树到随机森林与 GBDT，覆盖表格王者路线。",
                    "特征工程、分类/回归任务。",
                    [
                        leaf(
                            "ml-decision-tree",
                            "决策树",
                            "??",
                            "按特征阈值递归划分，规则可打印，易过拟合。",
                            "深度、叶子最小样本、信息增益/Gini、剪枝。",
                            """from sklearn.tree import DecisionTreeClassifier, export_text
tree = DecisionTreeClassifier(max_depth=4, min_samples_leaf=50)
tree.fit(X_train, y_train)
print(export_text(tree, feature_names=list(feat_names)))""",
                            "**规则解释**给业务。",
                            "**教学与基线**。",
                            "**特征交互**直观查看。",
                            "深度一大极易过拟合。",
                            "对特征尺度不敏感，但类别需编码。",
                            "单独用树很少上生产，更多作森林/提升的基学习器。",
                        ),
                        leaf(
                            "ml-random-forest",
                            "随机森林",
                            "??",
                            "多棵树袋装 + 特征随机，降方差，稳健好用。",
                            "`n_estimators`、`max_features`、袋外误差、并行。",
                            """from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(
    n_estimators=300, max_depth=12, min_samples_leaf=20,
    n_jobs=-1, random_state=42,
)
rf.fit(X_train, y_train)""",
                            "**强基线**：表格分类/回归。",
                            "**特征重要性**初探。",
                            "**缺值不多**的结构化数据。",
                            "默认参数往往已不错，先别狂调。",
                            "高基数类别要小心。",
                            "概率校准一般弱于 GBDT，必要时 CalibratedClassifier。",
                        ),
                        leaf(
                            "ml-gbdt",
                            "GBDT / 梯度提升",
                            "??",
                            "串行拟合残差的提升树，表格竞赛与工业界主力。",
                            "学习率、深度、子采样、早停、类别特征。",
                            """from sklearn.ensemble import HistGradientBoostingClassifier
gbm = HistGradientBoostingClassifier(
    max_depth=6, learning_rate=0.08, max_iter=300,
    early_stopping=True, validation_fraction=0.1,
)
gbm.fit(X_train, y_train)""",
                            "**CTR/转化**模型。",
                            "**风控排序**。",
                            "**大多数表格竞赛**第一选择。",
                            "学习率小配更多树，注意过拟合。",
                            "工业常用 XGBoost/LightGBM/CatBoost。",
                            "推理延迟要求高时需压缩或蒸馏。",
                        ),
                        leaf(
                            "ml-feat-importance",
                            "特征重要性",
                            "??",
                            "量化各特征对模型的贡献，用于解释与裁剪。",
                            "impurity 重要性、置换重要性、SHAP（进阶）。",
                            """from sklearn.inspection import permutation_importance
r = permutation_importance(model, X_val, y_val, n_repeats=8, random_state=42)
for i in r.importances_mean.argsort()[::-1][:15]:
    print(feat_names[i], round(r.importances_mean[i], 4))""",
                            "**特征评审**删低价值字段。",
                            "**业务解释**Top 驱动因素。",
                            "**监控名单**选重要特征。",
                            "训练重要性偏爱高基数特征，优先置换重要性。",
                            "相关特征会分摊重要性。",
                            "解释≠因果。",
                        ),
                    ],
                ),
                chapter(
                    "ml-other-models",
                    "近邻与SVM",
                    "??",
                    "理解基于距离与间隔的经典算法适用边界。",
                    "特征缩放。",
                    [
                        leaf(
                            "ml-knn",
                            "K 近邻",
                            "??",
                            "用最相似的 K 个训练样本投票或平均，惰性学习。",
                            "`k`、距离度量、缩放、KD/球树。",
                            """from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
knn = Pipeline([
    ("sc", StandardScaler()),
    ("knn", KNeighborsClassifier(n_neighbors=15, weights="distance")),
])
knn.fit(X_train, y_train)""",
                            "**小数据集**快速基线。",
                            "**异常**：远离邻居的点。",
                            "**推荐召回**的相似度思想同源。",
                            "高维会失效（维度灾难）。",
                            "预测期要扫训练集，大数据慢。",
                            "必须标准化。",
                        ),
                        leaf(
                            "ml-svm",
                            "支持向量机",
                            "??",
                            "最大化间隔的分类器；核技巧处理非线性。",
                            "`C`、核函数、支持向量、缩放。",
                            """from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
svm = Pipeline([
    ("sc", StandardScaler()),
    ("clf", SVC(C=1.0, kernel="rbf", probability=True)),
])
svm.fit(X_train, y_train)""",
                            "**中小样本**高维分类。",
                            "**文本 TF-IDF + 线性 SVM**。",
                            "**边界清晰**的二分类。",
                            "大数据上比不过线性模型/GBDT。",
                            "概率需额外校准。",
                            "核与 C 要用验证集选。",
                        ),
                    ],
                ),
            ],
            sector="advanced",
        ),
        # ── 5. 深度学习入门 ──────────────────────────────────────
        domain(
            "ml-deep",
            "深度学习入门",
            "???",
            "神经网络基础与嵌入——为推荐、文本、图像打底（偏应用直觉）。",
            [
                chapter(
                    "ml-nn-ch",
                    "神经网络基础",
                    "???",
                    "理解 MLP、激活、过拟合抑制与嵌入向量。",
                    "特征缩放、训练/验证。",
                    [
                        leaf(
                            "ml-mlp",
                            "多层感知机 MLP",
                            "???",
                            "全连接层堆叠的神经网络，可拟合复杂非线性。",
                            "层宽、激活、学习率、正则/Dropout、早停。",
                            """from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
mlp = Pipeline([
    ("sc", StandardScaler()),
    ("nn", MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=200, early_stopping=True)),
])
mlp.fit(X_train, y_train)""",
                            "**中等规模表格**非线性建模。",
                            "**教学基线**理解反向传播直觉。",
                            "**与 GBDT 对照**看是否值得上深度。",
                            "表格数据多数情况 GBDT 仍更强。",
                            "必须缩放；调参成本高于树模型。",
                            "样本少时极易过拟合。",
                        ),
                        leaf(
                            "ml-embedding",
                            "Embedding 嵌入",
                            "???",
                            "把离散 ID（用户/商品/词）映到稠密向量，便于相似与神经网络输入。",
                            "维度、共享嵌入、相似度、冷启动。",
                            """import numpy as np
# 示意：随机初始化的 embedding 表
n_items, dim = 10000, 32
emb = np.random.randn(n_items, dim).astype("float32") * 0.01
vec = emb[item_id]
# 相似：vec @ emb.T 取 TopK""",
                            "**推荐双塔**用户/物品向量。",
                            "**NLP 词向量**输入。",
                            "**高基数 ID** 替代巨型独热。",
                            "未见 ID 要有默认向量。",
                            "维度过大易过拟合、过小欠表达。",
                            "线上要版本化 embedding 表。",
                        ),
                        leaf(
                            "ml-nn-regularize",
                            "Dropout 与早停",
                            "???",
                            "深度网络常用的正则手段：随机失活与验证集早停。",
                            "dropout 率、patience、监控指标、检查点。",
                            """# PyTorch 风格示意
# nn.Dropout(p=0.3)
# 训练循环：若 val_loss 连续 patience 轮不降 → stop，加载 best ckpt
best, patience, bad = 1e9, 5, 0
# for epoch in ...:
#   if val < best: best, bad, save = val, 0, ckpt
#   else: bad += 1
#   if bad >= patience: break""",
                            "**MLP/深度 CTR**训练。",
                            "**文本/图像**网络防过拟合。",
                            "**资源有限**时节省无效 epoch。",
                            "dropout 只在训练开，推理关。",
                            "早停监控指标要贴近业务。",
                            "学习率过大时早停会过早。",
                        ),
                    ],
                ),
            ],
            sector="advanced",
        ),
        # ── 6. 推荐系统 ──────────────────────────────────────────
        domain(
            "ml-recsys",
            "推荐系统",
            "???",
            "召回 → 精排 → 重排的工业链路；冷启动与多样性同样关键。",
            [
                chapter(
                    "ml-rec-ch",
                    "推荐总览",
                    "???",
                    "能说清推荐目标与协同/内容两条经典路线。",
                    "排序指标、特征工程。",
                    [
                        leaf(
                            "ml-recommend",
                            "推荐总览",
                            "???",
                            "在海量候选中为用户排序下一步最可能感兴趣的物品。",
                            "召回、精排、重排；协同/内容；离线 NDCG 与在线 CTR。",
                            """import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
matrix = pd.DataFrame(
    [[1,1,0,0],[1,0,1,0],[0,1,1,0],[0,0,1,1]],
    columns=list("ABCD"), index=["u1","u2","u3","u4"],
)
sim = cosine_similarity(matrix.T)
print(pd.DataFrame(sim, index=matrix.columns, columns=matrix.columns).round(2))""",
                            "**电商猜你喜欢**。",
                            "**内容 Feed 分发**。",
                            "**购物车交叉销售**。",
                            "只推热门会越推越窄，需探索与打散。",
                            "冷启动靠内容与热门兜底。",
                            "库存/合规在重排硬过滤。",
                        ),
                        leaf(
                            "ml-cf",
                            "协同过滤",
                            "???",
                            "用「人与人 / 物与物」行为相似做推荐，不强依赖内容文本。",
                            "UserCF/ItemCF、共现、相似度、隐式反馈。",
                            """# ItemCF 示意：共现矩阵 → 相似度 → 按用户历史加权召回
# score(u,i) = sum_{j in history(u)} sim(i,j) * w(u,j)
sim_ij = 0.8  # 物品相似度
score = sim_ij * user_weight_on_j""",
                            "**有丰富交互**的成熟业务。",
                            "**相关推荐**「看了又看」。",
                            "**无文本侧信息**时的主力。",
                            "稀疏与冷启动弱。",
                            "流行度偏差要压制。",
                            "隐式反馈（点击）≠ 真实喜欢。",
                        ),
                        leaf(
                            "ml-content-rec",
                            "内容推荐",
                            "???",
                            "用物品属性/文本/画像相似度推荐，擅长冷启动。",
                            "内容向量、标签、相似度、可解释。",
                            """# 用物品标签向量做相似
# item_vec = multi-hot(tags) 或 text embedding
# score = cosine(user_profile_vec, item_vec)
score = float((u_vec * i_vec).sum())""",
                            "**新物品冷启动**。",
                            "**主题/频道**内推荐。",
                            "**可解释**「因为你关注了…」。",
                            "内容同质化易审美疲劳。",
                            "标签质量决定上限。",
                            "常与协同结果融合。",
                        ),
                    ],
                ),
                chapter(
                    "ml-rec-funnel",
                    "召回与精排",
                    "???",
                    "理解漏斗分工：召回保覆盖，精排保精度，重排保体验。",
                    "推荐总览、LTR。",
                    [
                        leaf(
                            "ml-recall-rank",
                            "召回与精排",
                            "???",
                            "召回从百万级收到千级；精排对候选精细打分排序。",
                            "多路召回、融合、精排特征、重排规则。",
                            """# 多路召回伪代码
cands = set()
cands |= set(itemcf_top(u, 200))
cands |= set(hot_top(100))
cands |= set(ann_search(user_emb, 200))
# 精排
scores = ranker.predict(features(u, list(cands)))
top = sorted(zip(cands, scores), key=lambda x: -x[1])[:50]""",
                            "**信息流/电商主推荐**。",
                            "**搜索的召回-排序**同构。",
                            "**广告候选**生成。",
                            "召回互斥或重复要去重计量。",
                            "精排特征不能穿越曝光后信息。",
                            "重排打散、频控、合规不能省。",
                        ),
                        leaf(
                            "ml-cold-start",
                            "冷启动",
                            "???",
                            "新用户/新物品交互不足时的推荐策略。",
                            "热门兜底、内容特征、探索流量、跨域迁移。",
                            """# 策略组合
# 1) 热门 + 类目热门
# 2) 注册画像/兴趣标签 → 内容召回
# 3) 小流量探索（epsilon-greedy）收集反馈
if user_events < 3:
    return mix(hot(50), content_by_profile(u, 50), explore(20))""",
                            "**新 App 用户首屏**。",
                            "**新品上架**曝光。",
                            "**季节性新品**。",
                            "纯热门会马太效应。",
                            "探索要设体验与风控护栏。",
                            "冷启动策略要单独看留存/点击。",
                        ),
                        leaf(
                            "ml-diversity",
                            "多样性与打散",
                            "???",
                            "避免列表同质；在相关与多样之间折中，提升长期体验。",
                            "MMR、类目打散、作者频控、兴趣覆盖。",
                            """# 简易类目打散
picked = []
for item in ranked:
    if category_count(picked, item.cat) >= 2:
        continue
    picked.append(item)
    if len(picked) == 20:
        break""",
                            "**Feed 流**重排。",
                            "**相关推荐**防重复。",
                            "**长期留存**优化。",
                            "打散过强会伤短期 CTR。",
                            "规则要可配置可实验。",
                            "多样性指标与业务北极星一起看。",
                        ),
                    ],
                ),
            ],
            sector="practice",
        ),
        # ── 7. 文本挖掘 ──────────────────────────────────────────
        domain(
            "ml-nlp",
            "文本挖掘",
            "???",
            "从词袋到向量：分类、关键词与基础情感——数据岗常用文本技能。",
            [
                chapter(
                    "ml-text-ch",
                    "文本表示与分类",
                    "???",
                    "会用 TF-IDF + 线性模型做文本分类基线。",
                    "分类任务、正则。",
                    [
                        leaf(
                            "ml-tfidf",
                            "词袋与 TF-IDF",
                            "??",
                            "把文档变成稀疏词权重向量，强调有区分度的词。",
                            "分词、N-gram、DF、TF-IDF、停用词。",
                            """from sklearn.feature_extraction.text import TfidfVectorizer
vec = TfidfVectorizer(max_features=50000, ngram_range=(1, 2), min_df=3)
X = vec.fit_transform(texts_train)""",
                            "**工单/评论分类**基线。",
                            "**检索粗排**词匹配。",
                            "**主题词**观察。",
                            "中文需分词；语言要统一。",
                            "词典外词与短文本效果有限。",
                            "先强基线再上 Transformer。",
                        ),
                        leaf(
                            "ml-text-clf",
                            "文本分类",
                            "???",
                            "对句子/文档打标签：意图、舆情、违规等。",
                            "TF-IDF+线性模型、分层切分、宏平均 F1。",
                            """from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
pipe = Pipeline([
    ("tfidf", TfidfVectorizer(max_features=80000, ngram_range=(1, 2))),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
])
pipe.fit(text_train, y_train)""",
                            "**客服意图**识别。",
                            "**评论情感/主题**。",
                            "**违规文本**初筛。",
                            "泄漏：别把未来工单结论当特征。",
                            "类别极多时分层标签体系。",
                            "线上要有关键词规则兜底。",
                        ),
                        leaf(
                            "ml-sentiment",
                            "情感分析",
                            "???",
                            "判断文本正负/多级情感，服务舆情与口碑。",
                            "标签体系、领域词典、阈值、抽样质检。",
                            """# 复用文本分类管道；标签: -1/0/1 或 1-5 星
preds = pipe.predict(comments)
# 业务侧可再加领域情感词典矫正""",
                            "**品牌舆情**监测。",
                            "**售后评论**挖掘。",
                            "**问卷开放题**量化。",
                            "讽刺与否定句易错。",
                            "跨领域模型不能直接套。",
                            "抽检混淆矩阵，别只看准确率。",
                        ),
                    ],
                ),
            ],
            sector="practice",
        ),
        # ── 8. 时序预测 ──────────────────────────────────────────
        domain(
            "ml-timeseries",
            "时序预测",
            "???",
            "按时间依赖建模：切分、滞后特征与业务预测闭环。",
            [
                chapter(
                    "ml-ts-ch",
                    "时序基础",
                    "???",
                    "会做时间切分与滞后特征，避免未来函数。",
                    "回归任务、泄漏意识。",
                    [
                        leaf(
                            "ml-ts-split",
                            "时序切分",
                            "??",
                            "验证/测试必须用未来时间段，禁止打乱行。",
                            "滚动原点、回测窗口、季节性。",
                            """# 滚动回测示意
# for origin in origins:
#   train = df[df.dt < origin]
#   test  = df[(df.dt >= origin) & (df.dt < origin + horizon)]
#   fit(train); evaluate(test)""",
                            "**销量/DAU**预测验收。",
                            "**活动前后**分段评估。",
                            "**多序列**（多门店）统一回测。",
                            "随机 K 折对时序基本错误。",
                            "节假日要显式特征或分层。",
                            "报告多原点平均，防单次运气。",
                        ),
                        leaf(
                            "ml-lag-features",
                            "滞后与窗口特征",
                            "???",
                            "用历史 lag/rolling 统计当特征，严格对齐预测时刻。",
                            "lag、rolling mean/std、缺口填充。",
                            """import pandas as pd
g = df.sort_values("dt").groupby("series_id")
df["y_lag1"] = g["y"].shift(1)
df["y_roll7"] = g["y"].transform(lambda s: s.shift(1).rolling(7).mean())""",
                            "**短周期销量**。",
                            "**指标异常伴生**特征。",
                            "**多步预测**的递归/直接策略。",
                            "shift 少了就会泄漏。",
                            "窗口在序列开头会产生 NaN，要处理。",
                            "不同系列不要串统计。",
                        ),
                        leaf(
                            "ml-ts-forecast",
                            "业务预测闭环",
                            "???",
                            "把预测接入补货/排班等决策，用业务误差而非只看 RMSE。",
                            "预测视野、分层预测、人工修正、库存代价。",
                            """# 决策示意：预测需求 → 安全库存 → 下单量
# order_qty = max(0, forecast + safety - on_hand - in_transit)
order_qty = max(0, yhat + safety - on_hand - in_transit)""",
                            "**零售补货**。",
                            "**运力/人力**排班。",
                            "**预算与目标**拆解。",
                            "优化指标要贴缺货/积压成本。",
                            "人工调整要留痕迹便于复盘。",
                            "换货规则变化后模型要重评。",
                        ),
                    ],
                ),
            ],
            sector="practice",
        ),
        # ── 9. 异常检测 ──────────────────────────────────────────
        domain(
            "ml-anomaly-domain",
            "异常检测",
            "???",
            "无标/弱标场景找离群；落地关键是阈值、核查与误报成本。",
            [
                chapter(
                    "ml-anomaly-ch",
                    "检测方法",
                    "???",
                    "会用隔离森林等做无监督异常分，并设定业务阈值。",
                    "无监督、特征缩放。",
                    [
                        leaf(
                            "ml-anomaly",
                            "异常检测总览",
                            "???",
                            "找出与多数行为显著不同的样本，供风控或运维核查。",
                            "无监督分数、标签稀缺、阈值、人工反馈闭环。",
                            """from sklearn.ensemble import IsolationForest
iso = IsolationForest(n_estimators=200, contamination=0.01, random_state=42)
scores = -iso.fit(X).score_samples(X)  # 越大越异常""",
                            "**账户盗用/刷单**初筛。",
                            "**指标/日志**尖刺。",
                            "**设备故障**征兆。",
                            "contamination 只是先验，最终看业务。",
                            "概念漂移后要重训。",
                            "高分必须进人工/规则，不能自动全杀。",
                        ),
                        leaf(
                            "ml-isolation-forest",
                            "隔离森林",
                            "???",
                            "随机划分下异常点更容易被早隔离，适合表格无监督异常。",
                            "`n_estimators`、`contamination`、score_samples。",
                            """from sklearn.ensemble import IsolationForest
clf = IsolationForest(n_estimators=300, random_state=42)
clf.fit(X_train_normal)  # 尽量用「相对正常」窗口拟合
score = -clf.score_samples(X_today)""",
                            "**高维表格**异常分。",
                            "**日批风控**扫描。",
                            "**资源有限**的基线方案。",
                            "类别特征需先编码。",
                            "训练期若已大量掺异常会变钝。",
                            "解释性弱，需配套规则说明。",
                        ),
                        leaf(
                            "ml-alert-threshold",
                            "告警阈值",
                            "???",
                            "把异常分映射为告警；平衡漏报与误报成本。",
                            "分位数阈值、预算（日告警条数）、分级响应。",
                            """import numpy as np
thr = np.quantile(score_hist, 0.995)
alerts = df.loc[score >= thr, ["id", "score"]].sort_values("score", ascending=False)""",
                            "**安全运营**工单量控制。",
                            "**SLO 值班**告警降噪。",
                            "**人审队列**灌入。",
                            "固定阈值会随分布漂移失效。",
                            "按业务线分阈值，别一刀切。",
                            "保留抽检负反馈用于迭代。",
                        ),
                    ],
                ),
            ],
            sector="practice",
        ),
        # ── 10. 评估与落地 ───────────────────────────────────────
        domain(
            "ml-eval-ops",
            "评估与落地",
            "???",
            "离线评估、校准、AB、训推一致与监控——模型变成生产力的最后一公里。",
            [
                chapter(
                    "ml-eval-ch",
                    "离线评估",
                    "???",
                    "掌握时间切分、校准与实验设计，避免虚高上线。",
                    "任务指标、Pipeline。",
                    [
                        leaf(
                            "ml-time-split",
                            "时间切分评估",
                            "??",
                            "用过去训、未来验，模拟上线后的真实泛化。",
                            "切点、窗口、多段回测、泄漏检查。",
                            """cutoff = "2025-06-01"
tr = df[df.dt < cutoff]
te = df[df.dt >= cutoff]
model.fit(tr[feats], tr[y])
print(metric(te[y], model.predict_proba(te[feats])[:, 1]))""",
                            "**所有时序敏感业务**的默认评估。",
                            "**活动模型**上线前。",
                            "**替换旧策略**对比。",
                            "切点刚好落在大活动上要谨慎解读。",
                            "特征必须只用 cutoff 前可得信息。",
                            "多切点平均更稳。",
                        ),
                        leaf(
                            "ml-calibration",
                            "概率校准",
                            "???",
                            "让预测概率接近真实频率，便于阈值与期望收益计算。",
                            "可靠性曲线、Platt/Isotonic、分段统计。",
                            """from sklearn.calibration import CalibratedClassifierCV
cal = CalibratedClassifierCV(model, method="isotonic", cv="prefit")
cal.fit(X_val, y_val)
proba = cal.predict_proba(X_test)[:, 1]""",
                            "**按概率排期/额度**。",
                            "**期望收益** = p × 价值。",
                            "**多模型分数**对齐。",
                            "校准集不能与测试重叠。",
                            "分布变了要重校准。",
                            "树模型概率常需校准。",
                        ),
                        leaf(
                            "ml-ab-test",
                            "上线与A/B",
                            "???",
                            "用对照实验验证模型对业务指标的真实增益。",
                            "流量拆分、护栏指标、显著性、最小检测效应。",
                            """# 实验记录（示意）
# exp_id, variant=control|model, user_id, clicked, paid
# 对比 CTR / GMV，同时看退款率等护栏""",
                            "**推荐/搜索排序上线**。",
                            "**转化模型替换阈值策略**。",
                            "**召回通道加减**。",
                            "样本量不够别急着下结论。",
                            "注意新奇效应与季节性。",
                            "先小流量，设好回滚开关。",
                        ),
                    ],
                ),
                chapter(
                    "ml-mlops-ch",
                    "MLOps入门",
                    "???",
                    "理解训练产物如何变成可监控的线上服务。",
                    "Pipeline、评估切分。",
                    [
                        leaf(
                            "ml-train-serve",
                            "训练与推理",
                            "???",
                            "训练产出模型工件；推理服务按同一特征契约打分。",
                            "模型注册、版本、特征契约、批量/实时推理。",
                            """import joblib
joblib.dump(pipe, "model_v3.joblib")
pipe = joblib.load("model_v3.joblib")
score = pipe.predict_proba(feat_row)[:, 1]""",
                            "**在线打分 API**。",
                            "**离线批量灌分**进仓表。",
                            "**影子流量**对比新旧模型。",
                            "特征契约变更必须升版本。",
                            "训练环境与线上依赖要锁定。",
                            "失败要有降级策略（规则/旧模型）。",
                        ),
                        leaf(
                            "ml-monitor",
                            "监控与漂移",
                            "???",
                            "持续监视分数、特征与业务指标，异常时告警或回滚。",
                            "分数分布、PSI、业务 KPI、延迟与失败率。",
                            """# 日监控清单（示意）
# 1) score mean/p95  vs 基线
# 2) top 特征 PSI
# 3) 业务：CTR/通过率/投诉
# 4) 系统：QPS/P99/错误率""",
                            "**模型值班**常态。",
                            "**大促/故障**后复盘。",
                            "**自动再训练**触发条件。",
                            "只盯 AUC 不够，要盯业务。",
                            "报警要可行动，避免噪声。",
                            "回滚演练比文档重要。",
                        ),
                        leaf(
                            "ml-feature-store",
                            "特征仓库入门",
                            "???",
                            "统一管理特征定义与离在线读取，减少训推不一致。",
                            "特征注册、点查/批查、时间旅行、版本。",
                            """# 概念 API（示意）
# fs.get_offline_features(entity_df, feature_refs)  # 训练
# fs.get_online_features(entity_rows, feature_refs)  # 推理
# 同一特征名、同一计算逻辑、可回放到历史时点""",
                            "**多模型共享**用户特征。",
                            "**实时特征**点查。",
                            "**审计**特征血缘。",
                            "没有治理的「仓库」只是另一张表。",
                            "点查 SLA 与一致性要设计清楚。",
                            "先规范化高频特征，再铺量。",
                        ),
                    ],
                ),
            ],
            sector="practice",
        ),
    ],
)


def main():
    LESSONS.mkdir(parents=True, exist_ok=True)
    out = LESSONS / "ml.json"
    out.write_text(json.dumps(TREE, ensure_ascii=False, indent=2), encoding="utf-8")

    def count(n, d=0, acc=None):
        if acc is None:
            acc = {"L1": 0, "L2": 0, "leaf": 0}
        ch = n.get("children") or []
        if d == 1:
            acc["L1"] += 1
        if d == 2:
            acc["L2"] += 1
        if d > 0 and not ch:
            acc["leaf"] += 1
        for c in ch:
            count(c, d + 1, acc)
        return acc

    stats = count(TREE)
    print(f"wrote {out} L1={stats['L1']} chapters={stats['L2']} leaves={stats['leaf']}")
    r = subprocess.run([sys.executable, str(ROOT / "_gen" / "inject_lessons.py")], cwd=str(ROOT))
    if r.returncode != 0:
        print("inject failed")
        sys.exit(r.returncode)
    r2 = subprocess.run([sys.executable, str(ROOT / "_gen" / "patch_ml_sectors.py")], cwd=str(ROOT))
    if r2.returncode != 0:
        print("sector patch failed")
        sys.exit(r2.returncode)


if __name__ == "__main__":
    main()
