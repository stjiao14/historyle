#!/usr/bin/env python3
"""合并流水线：candidates.json + 现有 figures.js → src/data/figures_extra.js

- 繁简归一去重（OpenCC + 手工别名表）
- 扩展地名映射 + 手工省份/领域补丁
- 批量拉取 Wikidata 中文描述作为简介
- 按 sitelinks 排序补齐到目标总数
"""

import json
import re
import time
import urllib.parse
import urllib.request

from opencc import OpenCC

from build_pool import POB_MAP, REGION_OF, map_domains, map_dynasty, map_province

CC = OpenCC('t2s')
API = 'https://www.wikidata.org/w/api.php'
UA = 'historyle-dataset-builder/0.1 (contact: local dev)'
TARGET_TOTAL = 520

# 进入「每日一题」题库的知名度门槛（sitelinks）
CORE_SITELINKS = 40

# ── 别名（归一后 → 现有题库用名）─────────────────────────
ALIASES = {
    '蒋中正': '蒋介石',
    '孙中山': '孙中山',  # 孙文 → 见下
    '孙文': '孙中山',
    '毛泽东': '毛泽东',
    '毛主席': '毛泽东',
    '周总理': '周恩来',
    '康熙帝': '康熙帝',
    '乾隆帝': '乾隆帝',
    '汉光武帝': '刘秀',
    '秋墐': '秋瑾',
    '宋太祖': '赵匡胤',
    '杨坚': '隋文帝',
    '赵孟𫖯': '赵孟頫',
    '玉实甫': '王实甫',
}

# ── 扩展地名 → 省份（先于 POB_MAP 匹配）───────────────────
EXTRA_POB = {
    '兴京': '辽宁', '赫图阿拉': '辽宁', '海城市': '辽宁', '錦州': '辽宁',
    '故宫': '北京', '圆明园': '北京', '西城区': '北京', '金中都': '北京', '紫禁城': '北京',
    '浏阳市': '湖南', '韶山市': '湖南', '耒阳市': '湖南', '宁乡市': '湖南',
    '红安县': '湖北', '黄陂区': '湖北',
    '孟州市': '河南', '温县': '河南', '巩义市': '河南', '偃师区': '河南', '项城市': '河南',
    '永济市': '山西', '定襄县': '山西', '交城县': '山西',
    '南海区': '广东', '番禺区': '广东', '翠亨村': '广东',
    '临川区': '江西', '奉新县': '江西',
    '海宁市': '浙江', '诸暨市': '浙江', '溪口镇': '浙江', '富阳区': '浙江',
    '临海市': '浙江', '东阳市': '浙江',
    '闽侯县': '福建', '晋江市': '福建', '尤溪县': '福建', '龙溪县': '福建',
    '吴县': '江苏', '吳縣': '江苏', '盐城市': '江苏', '淮安区': '江苏', '宜兴市': '江苏',
    '休宁县': '安徽', '亳州市': '安徽', '卜洲村': '安徽',
    '菏泽市': '山东', '巨野县': '山东', '诸城市': '山东', '聊城市': '山东',
    '蒙古': '内蒙古', '蒙兀': '内蒙古', '金帳汗國': '内蒙古', '金帐汗国': '内蒙古',
    '东方省': '内蒙古', '東方省': '内蒙古', '戈壁': '内蒙古', '漠北': '内蒙古',
    '碎葉城': '新疆', '碎叶城': '新疆',
    '扶绥县': '广西',
    '广元市': '四川', '广安市': '四川', '成都府': '四川',
    '渭南县': '陕西', '韩城市': '陕西', '米脂县': '陕西',
    '榆次区': '山西', '五台县': '山西',
    '蓟州区': '天津',
}

# ── 手工省份补丁（top 人物，自动映射失败时用）─────────────
MANUAL_PROV = {
    '洪秀全': '广东',      # 花县（今广州花都区）
    '陈独秀': '安徽',      # 怀宁
    '郭沫若': '四川',      # 乐山
    '顾维钧': '上海',      # 嘉定
    '蒲松龄': '山东',      # 淄川
    '茅盾': '浙江',        # 桐乡
    '李渔': '浙江',        # 兰溪
    '周有光': '江苏',      # 常州
    '杨尚昆': '重庆',      # 潼南
    '宋太祖': '河南',      # 生于洛阳
    '秦二世': '陕西',
    '阿里不哥': '内蒙古',
    '布袋和尚': '浙江',    # 明州奉化
    '第六世达赖喇嘛': '西藏',
    '秋瑾': '浙江',        # 籍贯绍兴（生于福建）
    '郎世宁': '北京',      # 意大利人，清廷宫廷画家，按主要活动地
    '元明宗': '内蒙古',    # 生于漠北
    '元文宗': '内蒙古',
    '唐宪宗': '陕西',      # 生于长安
    '曹芳': '河南',        # 生于洛阳
    '曹髦': '河南',
    '孙休': '江苏',        # 生于建业
}

# ── 手工领域补丁 ────────────────────────────────────────
MANUAL_DOMAINS = {
    '宋太祖': ['政治', '军事'],
    '秦二世': ['政治'],
    '元成宗': ['政治'],
    '元明宗': ['政治'],
    '明仁宗': ['政治'],
    '陈省身': ['科技'],
    '刘徽': ['科技'],
    '布袋和尚': ['思想'],
    '第六世达赖喇嘛': ['思想'],
    '阿八哈': ['政治'],
    '邵逸夫': ['艺术'],
    '唐武宗': ['政治'],
    '曹芳': ['政治'],
    '曹髦': ['政治', '文学'],
    '孙休': ['政治'],
}

# ── 手工民族补丁（Wikidata P172 覆盖极低，非汉人物主要靠这里）──
MANUAL_ETH = {
    # 蒙古/元朝
    '成吉思汗': '蒙古', '窝阔台': '蒙古', '拖雷': '蒙古', '蒙哥': '蒙古', '忽必烈': '蒙古',
    '术赤': '蒙古', '拔都': '蒙古', '旭烈兀': '蒙古', '贵由': '蒙古', '阿里不哥': '蒙古',
    '速不台': '蒙古', '怯的不花': '蒙古', '那海': '蒙古', '阿鲁浑': '蒙古', '阿八哈': '蒙古',
    '孛儿帖': '蒙古', '元成宗': '蒙古', '元明宗': '蒙古', '元文宗': '蒙古', '元顺帝': '蒙古',
    '元武宗': '蒙古', '元仁宗': '蒙古', '元泰定帝': '蒙古', '元宁宗': '蒙古',
    '札尼别': '蒙古', '王汗': '蒙古', '海都': '蒙古', '唆鲁禾帖尼': '蒙古',
    '昔班': '蒙古', '木华黎': '蒙古', '拉班·扫马': '维吾尔',
    '脱脱': '蒙古', '扩廓帖木儿': '蒙古', '伯颜': '蒙古',
    # 契丹/女真/党项/鲜卑等
    '耶律阿保机': '契丹', '耶律楚材': '契丹', '萧太后': '契丹',
    '完颜阿骨打': '女真', '完颜亮': '女真', '金兀术': '女真',
    '李元昊': '党项', '拓跋珪': '鲜卑', '北魏孝文帝': '鲜卑', '宇文泰': '鲜卑',
    # 清（满洲）
    '努尔哈赤': '满', '皇太极': '满', '顺治帝': '满', '康熙帝': '满', '雍正帝': '满',
    '乾隆帝': '满', '嘉庆帝': '满', '道光帝': '满', '咸丰帝': '满', '同治帝': '满',
    '光绪帝': '满', '溥仪': '满', '多尔衮': '满', '孝庄文皇后': '蒙古', '慈禧太后': '满',
    '和珅': '满', '纳兰性德': '满', '川岛芳子': '满', '老舍': '满',
    # 其他
    '第六世达赖喇嘛': '门巴', '仓央嘉措': '门巴', '安禄山': '粟特', '郑和': '回',
    '贺龙': '土家', '韦拔群': '壮', '石达开': '汉',
}

# ── 排除名单（不宜入题/质量不佳）─────────────────────────
EXCLUDE = {
    '阮惠',   # 越南君主，非中国历史人物
    '阿八哈', # 伊利汗国，过于冷僻
    '兀剌不花', # Wikidata 生卒年倒挂
    '公孙渊',   # Wikidata 生卒年倒挂
}


def load_existing_names():
    src = open('src/data/figures.js', encoding='utf-8').read()
    return set(re.findall(r"name: '([^']+)'", src))


def load_existing_intros():
    """保留现有 figures_extra.js 里的简介（含手工修改），避免每次重拉"""
    src = open('src/data/figures_extra.js', encoding='utf-8').read()
    intros = {}
    for entry in re.findall(r'\{ [^}]+ \}', src):
        m_name = re.search(r"name: '([^']+)'", entry)
        m_intro = re.search(r"intro: '(.*)' \},?$", entry)
        if m_name and m_intro:
            intros[m_name.group(1)] = m_intro.group(1)
    return intros


def norm_name(name):
    n = CC.convert(name).strip()
    return ALIASES.get(n, n)


def province_of(pob, adm_chain=''):
    if pob:
        for k, v in EXTRA_POB.items():
            if k in pob:
                return v
    return map_province(pob, adm_chain)


def fetch_descriptions(qids):
    descs = {}
    for i in range(0, len(qids), 50):
        batch = qids[i : i + 50]
        params = {
            'action': 'wbgetentities',
            'ids': '|'.join(batch),
            'props': 'descriptions',
            'languages': 'zh',
            'format': 'json',
        }
        url = API + '?' + urllib.parse.urlencode(params)
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.load(r)
            for qid, ent in data['entities'].items():
                d = ent.get('descriptions', {}).get('zh', {}).get('value', '')
                descs[qid] = d
        except Exception as e:
            print(f'  描述拉取失败（{batch[0]} 起）: {e}')
        time.sleep(1)
    return descs


def main():
    candidates = json.load(open('scripts/candidates.json', encoding='utf-8'))
    existing = load_existing_names()
    old_intros = load_existing_intros()
    print(f'现有题库 {len(existing)} 人，候选 {len(candidates)} 人，可复用简介 {len(old_intros)} 条')

    # 归一、去重、重映射
    pool = []
    seen_names = set(existing)
    for r in sorted(candidates, key=lambda x: -x['sitelinks']):
        name = norm_name(r['name'])
        if name in seen_names or name in EXCLUDE:
            continue
        seen_names.add(name)
        province = province_of(r.get('pob'), r.get('admChain', '') or '') or MANUAL_PROV.get(name)
        # 用最新规则重算领域，这样只改 OCC_RULES 不必重跑 SPARQL
        domains = map_domains(r.get('occs', '')) or r['domains'] or MANUAL_DOMAINS.get(name, [])
        dynasty, era = r['dynasty'], r['era']
        if not (dynasty and r['birth'] is not None and r['death'] and r['gender']):
            continue
        pool.append({
            **r,
            'name': name,
            'province': province,
            'region': REGION_OF.get(province),
            'domains': domains,
            'dynasty': dynasty,
            'era': era,
            'ethnicity': r.get('ethnicity') or MANUAL_ETH.get(name) or '汉',
        })

    need = TARGET_TOTAL - len(existing)
    print(f'去重后可补充 {len(pool)} 人，目标补 {need} 人')

    # 先取字段齐全者，不够再放宽（缺省份/领域的留待手工补丁后重跑）
    complete = [p for p in pool if p['province'] and p['domains']]
    incomplete = [p for p in pool if not (p['province'] and p['domains'])]

    # 按时期限流挑选，避免近现代（sitelinks 天然偏高）挤占其他时代
    per_era_cap = max(30, round(need * 0.18))
    selected, era_counts, chosen = [], {}, set()
    for p in complete:
        if len(selected) >= need:
            break
        if era_counts.get(p['era'], 0) >= per_era_cap:
            continue
        era_counts[p['era']] = era_counts.get(p['era'], 0) + 1
        chosen.add(p['name'])
        selected.append(p)
    for p in complete:  # 名额没满则放开限流补齐
        if len(selected) >= need:
            break
        if p['name'] not in chosen:
            chosen.add(p['name'])
            selected.append(p)
    print(f'字段齐全 {len(complete)} 人，本轮入选 {len(selected)} 人（每时期上限 {per_era_cap}）')
    print('时期分布:', {e: era_counts.get(e, 0) for e in sorted(era_counts)})

    # 简介：优先复用旧的，只给新人物拉取
    need_fetch = [p['qid'] for p in selected if p['name'] not in old_intros]
    print(f'需新拉简介 {len(need_fetch)} 条')
    descs = fetch_descriptions(need_fetch)
    entries = []
    for i, p in enumerate(selected):
        if p['name'] in old_intros:
            intro = old_intros[p['name']]
        else:
            intro = CC.convert(descs.get(p['qid'], '').strip())
            if len(intro) < 6:
                intro = f'{p["dynasty"]}时期{"、".join(p["domains"])}人物。'
            elif not intro.endswith(('。', '！', '？')):
                intro += '。'
        e = {
            'id': 200 + i,
            'name': p['name'],
            'dynasty': p['dynasty'],
            'era': p['era'],
            'birth': p['birth'],
            'death': p['death'],
            'domains': p['domains'],
            'province': p['province'],
            'region': p['region'],
            'gender': p['gender'],
            'emperor': p['emperor'],
            'ethnicity': p['ethnicity'],
            'intro': intro,
        }
        if p['sitelinks'] >= CORE_SITELINKS:
            e['core'] = True
        entries.append(e)

    # 输出 JS
    def js_entry(e):
        doms = ', '.join(f"'{d}'" for d in e['domains'])
        emp = 'true' if e['emperor'] else 'false'
        core = ', core: true' if e.get('core') else ''
        intro = e['intro'].replace("'", '’')
        return (
            f"  {{ id: {e['id']}, name: '{e['name']}', dynasty: '{e['dynasty']}', era: '{e['era']}', "
            f"birth: {e['birth']}, death: {e['death']}, domains: [{doms}], province: '{e['province']}', "
            f"region: '{e['region']}', gender: '{e['gender']}', ethnicity: '{e['ethnicity']}', emperor: {emp}{core}, intro: '{intro}' }},"
        )

    js = '// 由 scripts/merge_pool.py 从 Wikidata 生成，手工复核后使用\nexport const FIGURES_EXTRA = [\n'
    js += '\n'.join(js_entry(e) for e in entries)
    js += '\n]\n'
    with open('src/data/figures_extra.js', 'w', encoding='utf-8') as f:
        f.write(js)

    # 复核报告
    with open('scripts/selected_report.txt', 'w', encoding='utf-8') as f:
        for e in entries:
            f.write(f"{e['id']} {e['name']} | {e['dynasty']} {e['birth']}~{e['death']} | {'、'.join(e['domains'])} | {e['province']} | {e['ethnicity']} | {'帝' if e['emperor'] else ''} | {e['intro']}\n")
        f.write('\n── 字段不全被跳过的 top 50 ──\n')
        for p in incomplete[:50]:
            f.write(f"{p['sitelinks']} {p['name']} | 缺: {'省份' if not p['province'] else ''}{'领域' if not p['domains'] else ''} | pob={p.get('pob')} occs={p.get('occs')}\n")

    print(f'已生成 src/data/figures_extra.js（{len(entries)} 人），复核清单见 scripts/selected_report.txt')


if __name__ == '__main__':
    main()
