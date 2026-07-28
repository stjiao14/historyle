// 首发题库：古代 + 近现代知名中国历史人物
import { FIGURES_EXTRA } from './figures_extra.js'
import { TAGS } from './tags.js'
// 字段说明：
//   dynasty  朝代（用于精确匹配，绿色）
//   era      细分时期（相邻时期算"相近"，黄色；由 dynasty 推导，见 PERIOD_OF_DYNASTY）
//   birth    出生年（公元前为负数）
//   domains  身份/领域标签（多选，集合相等为绿、有交集为黄）
//   province 籍贯/主要成长地对应的现代省份
//   region   大区域（同区域不同省份为黄）
//   ethnicity 民族（一致为绿，无黄）
//   tags     主题标签（集合相等非空为绿、有交集为黄，存于 tags.js）
//   emperor  是否称帝/称汗
//   intro    一句话简介（揭晓答案时展示）

// 细分时期（按时间顺序，相邻即"相近"）
export const PERIODS = ['春秋', '战国', '秦', '西汉', '东汉', '三国', '两晋', '南北朝', '隋', '唐', '五代十国', '宋辽金', '元', '明', '清', '近现代']

// 朝代 → 细分时期
export const PERIOD_OF_DYNASTY = {
  春秋: '春秋', 战国: '战国', 秦: '秦',
  西汉: '西汉', 东汉: '东汉', 三国: '三国',
  西晋: '两晋', 东晋: '两晋', 南北朝: '南北朝',
  隋: '隋', 唐: '唐', 五代: '五代十国',
  北宋: '宋辽金', 南宋: '宋辽金', 辽: '宋辽金', 金: '宋辽金', 西夏: '宋辽金',
  元: '元', 明: '明', 清: '清', 近现代: '近现代',
}

const FIGURES_BASE = [
  // ── 先秦 ──────────────────────────────────────────────
  { id: 1, name: '孔子', dynasty: '春秋', era: '先秦', birth: -551, death: -479, domains: ['思想'], province: '山东', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '儒家学派创始人，被尊为"至圣先师"，《论语》记录其言行。' },
  { id: 2, name: '老子', dynasty: '春秋', era: '先秦', birth: -571, death: -471, domains: ['思想'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '道家学派创始人，著有《道德经》。' },
  { id: 3, name: '孟子', dynasty: '战国', era: '先秦', birth: -372, death: -289, domains: ['思想'], province: '山东', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '儒家代表人物，被尊为"亚圣"，主张性善论与仁政。' },
  { id: 4, name: '庄子', dynasty: '战国', era: '先秦', birth: -369, death: -286, domains: ['思想', '文学'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '道家代表人物，《庄子》一书汪洋恣肆，"庄周梦蝶"广为流传。' },
  { id: 5, name: '屈原', dynasty: '战国', era: '先秦', birth: -340, death: -278, domains: ['文学', '政治'], province: '湖北', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '楚国诗人、政治家，作《离骚》，投汨罗江而亡，端午节因他而来。' },
  { id: 6, name: '孙武', dynasty: '春秋', era: '先秦', birth: -545, death: -470, domains: ['军事'], province: '山东', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '兵家至圣，著有《孙子兵法》。' },
  { id: 7, name: '商鞅', dynasty: '战国', era: '先秦', birth: -390, death: -338, domains: ['政治'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '在秦国主持变法，奠定秦统一六国的基础，后被车裂。' },
  { id: 8, name: '西施', dynasty: '春秋', era: '先秦', birth: -506, death: -473, domains: ['外交'], province: '浙江', region: '华东', gender: '女', ethnicity: '汉', emperor: false, intro: '中国古代四大美女之首，越国献给吴王夫差，"沉鱼"之姿。' },

  // ── 秦汉 ──────────────────────────────────────────────
  { id: 10, name: '秦始皇', dynasty: '秦', era: '秦汉', birth: -259, death: -210, domains: ['政治', '军事'], province: '陕西', region: '西北', gender: '男', ethnicity: '汉', emperor: true, intro: '嬴政，中国第一位皇帝，扫灭六国，统一文字、度量衡。' },
  { id: 11, name: '李斯', dynasty: '秦', era: '秦汉', birth: -284, death: -208, domains: ['政治'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '秦朝丞相，力推郡县制、统一文字为小篆，后被赵高所害。' },
  { id: 12, name: '刘邦', dynasty: '西汉', era: '秦汉', birth: -256, death: -195, domains: ['政治', '军事'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: true, intro: '汉高祖，出身亭长，击败项羽建立汉朝。' },
  { id: 13, name: '项羽', dynasty: '秦', era: '秦汉', birth: -232, death: -202, domains: ['军事'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '西楚霸王，巨鹿之战破釜沉舟，最终垓下自刎乌江。' },
  { id: 14, name: '汉武帝', dynasty: '西汉', era: '秦汉', birth: -156, death: -87, domains: ['政治', '军事'], province: '陕西', region: '西北', gender: '男', ethnicity: '汉', emperor: true, intro: '刘彻，北击匈奴、开拓西域，罢黜百家独尊儒术。' },
  { id: 15, name: '司马迁', dynasty: '西汉', era: '秦汉', birth: -145, death: -86, domains: ['文学'], province: '陕西', region: '西北', gender: '男', ethnicity: '汉', emperor: false, intro: '忍辱负重著《史记》，被誉为"史家之绝唱，无韵之离骚"。' },
  { id: 16, name: '张骞', dynasty: '西汉', era: '秦汉', birth: -164, death: -114, domains: ['外交'], province: '陕西', region: '西北', gender: '男', ethnicity: '汉', emperor: false, intro: '两次出使西域，开辟丝绸之路。' },
  { id: 17, name: '王昭君', dynasty: '西汉', era: '秦汉', birth: -54, death: -19, domains: ['外交'], province: '湖北', region: '华中', gender: '女', ethnicity: '汉', emperor: false, intro: '四大美女之"落雁"，出塞和亲，促进汉匈和平。' },
  { id: 18, name: '蔡伦', dynasty: '东汉', era: '秦汉', birth: 61, death: 121, domains: ['科技'], province: '湖南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '改进造纸术，"蔡侯纸"推动了世界文明传播。' },
  { id: 19, name: '张衡', dynasty: '东汉', era: '秦汉', birth: 78, death: 139, domains: ['科技', '文学'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '发明地动仪、浑天仪，兼善辞赋，文理全才。' },
  { id: 20, name: '华佗', dynasty: '东汉', era: '秦汉', birth: 145, death: 208, domains: ['医学'], province: '安徽', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '外科鼻祖，创麻沸散与五禽戏，被曹操所杀。' },
  { id: 21, name: '曹操', dynasty: '东汉', era: '秦汉', birth: 155, death: 220, domains: ['政治', '军事', '文学'], province: '安徽', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '挟天子以令诸侯，统一北方，建安文学代表人物。' },
  { id: 22, name: '关羽', dynasty: '东汉', era: '秦汉', birth: 160, death: 219, domains: ['军事'], province: '山西', region: '华北', gender: '男', ethnicity: '汉', emperor: false, intro: '蜀汉名将，义薄云天，后世尊为"武圣"、"关公"。' },
  { id: 23, name: '蔡文姬', dynasty: '东汉', era: '秦汉', birth: 177, death: 249, domains: ['文学', '艺术'], province: '河南', region: '华中', gender: '女', ethnicity: '汉', emperor: false, intro: '蔡邕之女，作《悲愤诗》与《胡笳十八拍》，曾被掳至匈奴。' },

  // ── 魏晋南北朝 ────────────────────────────────────────
  { id: 30, name: '诸葛亮', dynasty: '三国', era: '魏晋南北朝', birth: 181, death: 234, domains: ['政治', '军事'], province: '山东', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '蜀汉丞相，"鞠躬尽瘁，死而后已"，智慧与忠诚的化身。' },
  { id: 31, name: '刘备', dynasty: '三国', era: '魏晋南北朝', birth: 161, death: 223, domains: ['政治', '军事'], province: '河北', region: '华北', gender: '男', ethnicity: '汉', emperor: true, intro: '蜀汉昭烈帝，三顾茅庐得诸葛亮，以仁义立身处世。' },
  { id: 32, name: '孙权', dynasty: '三国', era: '魏晋南北朝', birth: 182, death: 252, domains: ['政治', '军事'], province: '浙江', region: '华东', gender: '男', ethnicity: '汉', emperor: true, intro: '东吴大帝，坐断东南，赤壁联刘破曹。' },
  { id: 33, name: '司马懿', dynasty: '三国', era: '魏晋南北朝', birth: 179, death: 251, domains: ['政治', '军事'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '曹魏权臣，隐忍善谋，其孙司马炎建立晋朝。' },
  { id: 34, name: '王羲之', dynasty: '东晋', era: '魏晋南北朝', birth: 303, death: 361, domains: ['艺术'], province: '山东', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '"书圣"，《兰亭集序》被誉为天下第一行书。' },
  { id: 35, name: '陶渊明', dynasty: '东晋', era: '魏晋南北朝', birth: 365, death: 427, domains: ['文学'], province: '江西', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '田园诗派鼻祖，"采菊东篱下，悠然见南山"，不为五斗米折腰。' },
  { id: 36, name: '祖冲之', dynasty: '南北朝', era: '魏晋南北朝', birth: 429, death: 500, domains: ['科技'], province: '河北', region: '华北', gender: '男', ethnicity: '汉', emperor: false, intro: '将圆周率精确到小数点后七位，领先世界近千年。' },
  // ── 隋唐五代 ──────────────────────────────────────────
  { id: 40, name: '隋文帝', dynasty: '隋', era: '隋唐五代', birth: 541, death: 604, domains: ['政治'], province: '陕西', region: '西北', gender: '男', ethnicity: '汉', emperor: true, intro: '杨坚，结束三百年分裂重建统一，开创科举雏形与开皇之治。' },
  { id: 41, name: '唐太宗', dynasty: '唐', era: '隋唐五代', birth: 598, death: 649, domains: ['政治', '军事'], province: '陕西', region: '西北', gender: '男', ethnicity: '汉', emperor: true, intro: '李世民，玄武门之变后即位，开创"贞观之治"，天可汗。' },
  { id: 42, name: '玄奘', dynasty: '唐', era: '隋唐五代', birth: 602, death: 664, domains: ['思想', '外交'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '西行五万里赴天竺取经，译经千卷，《西游记》唐僧原型。' },
  { id: 43, name: '武则天', dynasty: '唐', era: '隋唐五代', birth: 624, death: 705, domains: ['政治'], province: '山西', region: '华北', gender: '女', ethnicity: '汉', emperor: true, intro: '中国历史上唯一正统女皇帝，改国号为周，留无字碑。' },
  { id: 44, name: '唐玄宗', dynasty: '唐', era: '隋唐五代', birth: 685, death: 762, domains: ['政治'], province: '陕西', region: '西北', gender: '男', ethnicity: '汉', emperor: true, intro: '李隆基，开创开元盛世，晚年酿成安史之乱。' },
  { id: 45, name: '李白', dynasty: '唐', era: '隋唐五代', birth: 701, death: 762, domains: ['文学'], province: '四川', region: '西南', gender: '男', ethnicity: '汉', emperor: false, intro: '"诗仙"，豪放飘逸，"天生我材必有用，千金散尽还复来"。' },
  { id: 46, name: '杜甫', dynasty: '唐', era: '隋唐五代', birth: 712, death: 770, domains: ['文学'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '"诗圣"，诗史沉郁顿挫，"安得广厦千万间，大庇天下寒士俱欢颜"。' },
  { id: 47, name: '杨贵妃', dynasty: '唐', era: '隋唐五代', birth: 719, death: 756, domains: ['艺术'], province: '山西', region: '华北', gender: '女', ethnicity: '汉', emperor: false, intro: '四大美女之"羞花"，善歌舞音律，殒命马嵬驿。' },
  { id: 48, name: '安禄山', dynasty: '唐', era: '隋唐五代', birth: 703, death: 757, domains: ['军事'], province: '辽宁', region: '东北', gender: '男', ethnicity: '粟特', emperor: false, intro: '发动"安史之乱"，盛唐由盛转衰的转折点。' },
  { id: 49, name: '白居易', dynasty: '唐', era: '隋唐五代', birth: 772, death: 846, domains: ['文学'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '新乐府运动倡导者，《长恨歌》《琵琶行》老妪能解。' },

  // ── 宋辽金元 ──────────────────────────────────────────
  { id: 50, name: '赵匡胤', dynasty: '北宋', era: '宋辽金元', birth: 927, death: 976, domains: ['政治', '军事'], province: '河北', region: '华北', gender: '男', ethnicity: '汉', emperor: true, intro: '宋太祖，陈桥兵变黄袍加身，杯酒释兵权。' },
  { id: 51, name: '毕昇', dynasty: '北宋', era: '宋辽金元', birth: 972, death: 1051, domains: ['科技'], province: '湖北', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '发明活字印刷术，比欧洲早四百年。' },
  { id: 52, name: '范仲淹', dynasty: '北宋', era: '宋辽金元', birth: 989, death: 1052, domains: ['政治', '文学'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '"先天下之忧而忧，后天下之乐而乐"，主持庆历新政。' },
  { id: 53, name: '包拯', dynasty: '北宋', era: '宋辽金元', birth: 999, death: 1062, domains: ['政治'], province: '安徽', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '"包青天"，铁面无私、刚正不阿的清官象征。' },
  { id: 54, name: '司马光', dynasty: '北宋', era: '宋辽金元', birth: 1019, death: 1086, domains: ['政治', '文学'], province: '山西', region: '华北', gender: '男', ethnicity: '汉', emperor: false, intro: '主编《资治通鉴》，幼年"砸缸救友"家喻户晓。' },
  { id: 55, name: '王安石', dynasty: '北宋', era: '宋辽金元', birth: 1021, death: 1086, domains: ['政治', '文学'], province: '江西', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '主持熙宁变法，唐宋八大家之一，"春风又绿江南岸"。' },
  { id: 56, name: '苏轼', dynasty: '北宋', era: '宋辽金元', birth: 1037, death: 1101, domains: ['文学', '艺术'], province: '四川', region: '西南', gender: '男', ethnicity: '汉', emperor: false, intro: '号东坡居士，诗词文书画皆绝，"大江东去，浪淘尽"。' },
  { id: 57, name: '李清照', dynasty: '南宋', era: '宋辽金元', birth: 1084, death: 1155, domains: ['文学'], province: '山东', region: '华东', gender: '女', ethnicity: '汉', emperor: false, intro: '"千古第一才女"，婉约词宗，"寻寻觅觅，冷冷清清"。' },
  { id: 58, name: '岳飞', dynasty: '南宋', era: '宋辽金元', birth: 1103, death: 1142, domains: ['军事'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '抗金名将，精忠报国，以"莫须有"罪名遇害于风波亭。' },
  { id: 59, name: '朱熹', dynasty: '南宋', era: '宋辽金元', birth: 1130, death: 1200, domains: ['思想'], province: '福建', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '理学集大成者，"格物致知"，影响东亚思想数百年。' },
  { id: 60, name: '辛弃疾', dynasty: '南宋', era: '宋辽金元', birth: 1140, death: 1207, domains: ['文学', '军事'], province: '山东', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '豪放词派代表，"醉里挑灯看剑，梦回吹角连营"。' },
  { id: 61, name: '成吉思汗', dynasty: '元', era: '宋辽金元', birth: 1162, death: 1227, domains: ['军事', '政治'], province: '内蒙古', region: '华北', gender: '男', ethnicity: '蒙古', emperor: true, intro: '铁木真，统一蒙古诸部，建立横跨欧亚的蒙古帝国。' },
  { id: 62, name: '忽必烈', dynasty: '元', era: '宋辽金元', birth: 1215, death: 1294, domains: ['政治', '军事'], province: '内蒙古', region: '华北', gender: '男', ethnicity: '蒙古', emperor: true, intro: '建立元朝，定都大都（今北京），统一全中国。' },
  { id: 63, name: '文天祥', dynasty: '南宋', era: '宋辽金元', birth: 1236, death: 1283, domains: ['政治', '文学', '军事'], province: '江西', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '抗元名臣，"人生自古谁无死，留取丹心照汗青"。' },
  { id: 64, name: '关汉卿', dynasty: '元', era: '宋辽金元', birth: 1234, death: 1300, domains: ['文学'], province: '北京', region: '华北', gender: '男', ethnicity: '汉', emperor: false, intro: '元曲四大家之首，《窦娥冤》感天动地。' },

  // ── 明清 ──────────────────────────────────────────────
  { id: 70, name: '朱元璋', dynasty: '明', era: '明清', birth: 1328, death: 1398, domains: ['政治', '军事'], province: '安徽', region: '华东', gender: '男', ethnicity: '汉', emperor: true, intro: '明太祖，从乞丐到开国皇帝，驱逐蒙元恢复中华。' },
  { id: 71, name: '朱棣', dynasty: '明', era: '明清', birth: 1360, death: 1424, domains: ['政治', '军事'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: true, intro: '永乐帝，靖难夺位，迁都北京，派郑和下西洋、修《永乐大典》。' },
  { id: 72, name: '郑和', dynasty: '明', era: '明清', birth: 1371, death: 1433, domains: ['外交', '军事'], province: '云南', region: '西南', gender: '男', ethnicity: '汉', emperor: false, intro: '七下西洋，宝船队远航至非洲东岸，世界航海史壮举。' },
  { id: 73, name: '唐伯虎', dynasty: '明', era: '明清', birth: 1470, death: 1524, domains: ['艺术', '文学'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '江南四大才子之首，诗书画三绝，"别人笑我太疯癫"。' },
  { id: 74, name: '王阳明', dynasty: '明', era: '明清', birth: 1472, death: 1529, domains: ['思想', '军事'], province: '浙江', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '心学集大成者，"知行合一""致良知"，立德立功立言三不朽。' },
  { id: 75, name: '李时珍', dynasty: '明', era: '明清', birth: 1518, death: 1593, domains: ['医学'], province: '湖北', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '历时二十七载著《本草纲目》，东方药物学巨典。' },
  { id: 76, name: '张居正', dynasty: '明', era: '明清', birth: 1525, death: 1582, domains: ['政治'], province: '湖北', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '万历首辅，推行"一条鞭法"改革，为明朝续命数十年。' },
  { id: 77, name: '戚继光', dynasty: '明', era: '明清', birth: 1528, death: 1588, domains: ['军事'], province: '山东', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '抗倭名将，练戚家军、创鸳鸯阵，"封侯非我意，但愿海波平"。' },
  { id: 78, name: '徐光启', dynasty: '明', era: '明清', birth: 1562, death: 1633, domains: ['科技'], province: '上海', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '与利玛窦合译《几何原本》，著《农政全书》，西学东渐先驱。' },
  { id: 79, name: '康熙帝', dynasty: '清', era: '明清', birth: 1654, death: 1722, domains: ['政治'], province: '北京', region: '华北', gender: '男', ethnicity: '满', emperor: true, intro: '玄烨，在位六十一年，平三藩、收台湾，开创康乾盛世。' },
  { id: 80, name: '曹雪芹', dynasty: '清', era: '明清', birth: 1715, death: 1763, domains: ['文学'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '披阅十载著《红楼梦》，中国古典小说巅峰。' },
  { id: 81, name: '乾隆帝', dynasty: '清', era: '明清', birth: 1711, death: 1799, domains: ['政治', '文学'], province: '北京', region: '华北', gender: '男', ethnicity: '满', emperor: true, intro: '弘历，实际执政六十三年，十全武功，亦留"弹幕式"题跋美名。' },
  { id: 82, name: '林则徐', dynasty: '清', era: '明清', birth: 1785, death: 1850, domains: ['政治', '外交'], province: '福建', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '虎门销烟，"苟利国家生死以，岂因祸福避趋之"。' },
  { id: 83, name: '曾国藩', dynasty: '清', era: '明清', birth: 1811, death: 1872, domains: ['政治', '军事'], province: '湖南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '创办湘军平定太平天国，洋务运动先驱，"中兴第一名臣"。' },
  { id: 84, name: '李鸿章', dynasty: '清', era: '明清', birth: 1823, death: 1901, domains: ['政治', '外交'], province: '安徽', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '洋务运动领袖，办实业建北洋水师，一生签署诸多条约。' },
  { id: 85, name: '慈禧太后', dynasty: '清', era: '明清', birth: 1835, death: 1908, domains: ['政治'], province: '北京', region: '华北', gender: '女', ethnicity: '满', emperor: false, intro: '叶赫那拉氏，垂帘听政近半个世纪，晚清实际最高统治者。' },

  // ── 近现代 ────────────────────────────────────────────
  { id: 90, name: '袁世凯', dynasty: '近现代', era: '近现代', birth: 1859, death: 1916, domains: ['政治', '军事'], province: '河南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '北洋军阀领袖，逼迫清帝退位，后因称帝失败众叛亲离。' },
  { id: 91, name: '孙中山', dynasty: '近现代', era: '近现代', birth: 1866, death: 1925, domains: ['政治', '思想'], province: '广东', region: '华南', gender: '男', ethnicity: '汉', emperor: false, intro: '辛亥革命领袖，中华民国国父，"革命尚未成功，同志仍须努力"。' },
  { id: 92, name: '蔡元培', dynasty: '近现代', era: '近现代', birth: 1868, death: 1940, domains: ['思想', '政治'], province: '浙江', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '北大校长，倡导"思想自由，兼容并包"，现代教育的奠基人。' },
  { id: 93, name: '秋瑾', dynasty: '近现代', era: '近现代', birth: 1875, death: 1907, domains: ['政治', '文学'], province: '浙江', region: '华东', gender: '女', ethnicity: '汉', emperor: false, intro: '"鉴湖女侠"，为革命与女权奔走的烈士，从容就义于绍兴轩亭口。' },
  { id: 94, name: '鲁迅', dynasty: '近现代', era: '近现代', birth: 1881, death: 1936, domains: ['文学', '思想'], province: '浙江', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '原名周树人，《呐喊》《彷徨》，"横眉冷对千夫指"，民族魂。' },
  { id: 95, name: '蒋介石', dynasty: '近现代', era: '近现代', birth: 1887, death: 1975, domains: ['政治', '军事'], province: '浙江', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '黄埔军校校长，领导北伐与抗战，国共内战后退守台湾。' },
  { id: 96, name: '毛泽东', dynasty: '近现代', era: '近现代', birth: 1893, death: 1976, domains: ['政治', '军事', '文学'], province: '湖南', region: '华中', gender: '男', ethnicity: '汉', emperor: false, intro: '中华人民共和国主要缔造者，"数风流人物，还看今朝"。' },
  { id: 97, name: '梅兰芳', dynasty: '近现代', era: '近现代', birth: 1894, death: 1961, domains: ['艺术'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '京剧"四大名旦"之首，梅派艺术创始人，抗战蓄须明志。' },
  { id: 98, name: '徐悲鸿', dynasty: '近现代', era: '近现代', birth: 1895, death: 1953, domains: ['艺术'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '现代美术教育奠基人，以画奔马闻名，融中西画法。' },
  { id: 99, name: '周恩来', dynasty: '近现代', era: '近现代', birth: 1898, death: 1976, domains: ['政治', '外交'], province: '江苏', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '新中国首任总理，"为中华之崛起而读书"，外交风范举世敬仰。' },
  { id: 100, name: '老舍', dynasty: '近现代', era: '近现代', birth: 1899, death: 1966, domains: ['文学'], province: '北京', region: '华北', gender: '男', ethnicity: '满', emperor: false, intro: '"人民艺术家"，《骆驼祥子》《茶馆》，京味文学大师。' },
  { id: 101, name: '张学良', dynasty: '近现代', era: '近现代', birth: 1901, death: 2001, domains: ['军事', '政治'], province: '辽宁', region: '东北', gender: '男', ethnicity: '汉', emperor: false, intro: '"少帅"，发动西安事变促成抗日统一战线，被软禁半生。' },
  { id: 102, name: '邓小平', dynasty: '近现代', era: '近现代', birth: 1904, death: 1997, domains: ['政治'], province: '四川', region: '西南', gender: '男', ethnicity: '汉', emperor: false, intro: '改革开放总设计师，"不管黑猫白猫，捉到老鼠就是好猫"。' },
  { id: 103, name: '林徽因', dynasty: '近现代', era: '近现代', birth: 1904, death: 1955, domains: ['艺术', '科技'], province: '浙江', region: '华东', gender: '女', ethnicity: '汉', emperor: false, intro: '建筑学家、诗人，参与设计国徽与人民英雄纪念碑，"你是人间四月天"。' },
  { id: 104, name: '钱学森', dynasty: '近现代', era: '近现代', birth: 1911, death: 2009, domains: ['科技'], province: '上海', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '"中国航天之父""火箭之王"，冲破阻挠归国效力。' },
  { id: 105, name: '邓稼先', dynasty: '近现代', era: '近现代', birth: 1924, death: 1986, domains: ['科技'], province: '安徽', region: '华东', gender: '男', ethnicity: '汉', emperor: false, intro: '"两弹元勋"，隐姓埋名二十八年研制原子弹与氢弹。' },
  { id: 106, name: '袁隆平', dynasty: '近现代', era: '近现代', birth: 1930, death: 2021, domains: ['科技'], province: '北京', region: '华北', gender: '男', ethnicity: '汉', emperor: false, intro: '"杂交水稻之父"，让亿万人把饭碗端在自己手里。' },
]

// 首发精选 + Wikidata 扩充（era 由 dynasty 推导为细分时期；tags 来自 tags.js）
const withMeta = (f) => ({ ...f, era: PERIOD_OF_DYNASTY[f.dynasty] || f.era, tags: TAGS[f.name] || [] })
export const FIGURES = [...FIGURES_BASE.map(withMeta), ...FIGURES_EXTRA.map(withMeta)]

// 每日一题题库：首发精选 + 扩展库中知名度高（core 标记）的人物
export const FIGURES_CORE = [...FIGURES_BASE.map(withMeta), ...FIGURES_EXTRA.filter((f) => f.core).map(withMeta)]

// 省份 → 大区域 校验表（数据维护时参考）
export const PROVINCE_REGION = {
  北京: '华北', 天津: '华北', 河北: '华北', 山西: '华北', 内蒙古: '华北',
  辽宁: '东北', 吉林: '东北', 黑龙江: '东北',
  山东: '华东', 江苏: '华东', 上海: '华东', 浙江: '华东', 安徽: '华东', 江西: '华东', 福建: '华东',
  河南: '华中', 湖北: '华中', 湖南: '华中',
  广东: '华南', 广西: '华南', 海南: '华南', 香港: '华南', 澳门: '华南', 台湾: '华南',
  四川: '西南', 重庆: '西南', 贵州: '西南', 云南: '西南', 西藏: '西南',
  陕西: '西北', 甘肃: '西北', 宁夏: '西北', 新疆: '西北', 青海: '西北',
}
