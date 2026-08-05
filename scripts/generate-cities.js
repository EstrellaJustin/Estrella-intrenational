/* ============================================================
   伊斯特拉国际 · 全球城市探索系统数据生成器（v2 · 图片精确对应）
   30 国 / 215 城 / 每城专属 3 个真实景点
   生成：src/data/cities.json + cities.js + travel-images.json
   图片：国家代表图 / 城市实景图 / 景点实景图（独立管理）
   ============================================================ */

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');

/* 国家数据：
   id/cn/en/flag/region/costTier/visaMode/visaPeriod/visaStay/climate/bestSeason/location/seasons/imgEn
   cities: [{ n: 中文名, en: 英文名, note, pop, f: [特色], attrs: [[中文名, 英文搜索词, 简介, 时间], ...] }] */

const COUNTRIES = [
  {
    id: 'jp', cn: '日本', en: 'Japan', flag: 'jp.svg', region: 'ASIA',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '5–8 个工作日', visaStay: '15–30 天',
    climate: '四季分明，夏季温热多雨，冬季较冷', bestSeason: '3–5 月（樱花）与 10–11 月（红叶）',
    location: '位于东亚太平洋西岸的岛国，由本州、北海道、九州、四国等组成',
    seasons: { spring: '赏樱与城市漫步', summer: '祭典、花火大会与海滨', autumn: '红叶与摄影', winter: '温泉与雪景' },
    imgEn: 'Japan Mount Fuji',
    cities: [
      { n: '东京', en: 'Tokyo', note: '亚洲国际化都市，商务与潮流中心', pop: '约 1400 万（都市圈）', f: ['国际化都市', '购物美食', '商务中心', '适合首访'],
        attrs: [
          ['东京塔', 'Tokyo Tower', '东京地标，红白铁塔与 360 度观景', '2 小时'],
          ['浅草寺', 'Senso-ji', '东京最古老寺庙，雷门与仲见世商店街', '1.5 小时'],
          ['涩谷十字路口', 'Shibuya Crossing', '世界最繁忙十字路口与忠犬八公像', '1 小时']
        ] },
      { n: '大阪', en: 'Osaka', note: '关西美食之都与商业中心', pop: '约 880 万', f: ['美食之都', '商业活力', '城市漫步'],
        attrs: [
          ['大阪城', 'Osaka Castle', '丰臣秀吉时代名城与天守阁', '2 小时'],
          ['道顿堀', 'Dotonbori', '霓虹美食街与格力高广告牌', '1.5 小时'],
          ['通天阁', 'Tsutenkaku Tower', '大阪地标塔与周边新世界街区', '1 小时']
        ] },
      { n: '京都', en: 'Kyoto', note: '千年古都，神社寺庙与庭院文化', pop: '约 146 万', f: ['历史文化', '寺庙庭院', '传统工艺'],
        attrs: [
          ['伏见稻荷大社', 'Fushimi Inari Taisha', '千本鸟居与山间参道', '2 小时'],
          ['金阁寺', 'Kinkaku-ji', '贴金阁楼与镜湖池', '1.5 小时'],
          ['清水寺', 'Kiyomizu-dera', '木造舞台与京都全景', '2 小时']
        ] },
      { n: '札幌', en: 'Sapporo', note: '北海道门户，冰雪节与美食', pop: '约 196 万', f: ['冰雪节', '美食', '自然门户'],
        attrs: [
          ['札幌钟楼', 'Sapporo Clock Tower', '北海道开垦时期地标', '1 小时'],
          ['大通公园', 'Odori Park', '城市中轴线公园与雪祭会场', '1.5 小时'],
          ['白色恋人公园', 'Shiroi Koibito Park', '巧克力工厂与欧式庭院', '2 小时']
        ] },
      { n: '福冈', en: 'Fukuoka', note: '九州门户，屋台文化与活力都市', pop: '约 160 万', f: ['屋台美食', '港口城市', '年轻活力'],
        attrs: [
          ['太宰府天满宫', 'Dazaifu Tenmangu', '学问之神神社与梅园', '2 小时'],
          ['中洲屋台', 'Nakasu Yatai', '河畔屋台小吃街', '1.5 小时'],
          ['福冈塔', 'Fukuoka Tower', '海滨观景塔与夜景', '1 小时']
        ] },
      { n: '冲绳那霸', en: 'Naha', note: '亚热带海岛，琉球文化与海滨', pop: '约 32 万', f: ['海岛度假', '琉球文化', '潜水'],
        attrs: [
          ['首里城', 'Shurijo Castle', '琉球王国都城遗迹', '2 小时'],
          ['国际通', 'Kokusai Dori', '那霸主街购物与美食', '2 小时'],
          ['波之上海滩', 'Naminoue Beach', '城市近郊海滩', '1.5 小时']
        ] },
      { n: '名古屋', en: 'Nagoya', note: '中部经济中心，工业与美食', pop: '约 233 万', f: ['工业都市', '中部枢纽', '味噌美食'],
        attrs: [
          ['名古屋城', 'Nagoya Castle', '金鯱城郭与天守阁', '2 小时'],
          ['热田神宫', 'Atsuta Shrine', '草薙神剑供奉神社', '1.5 小时'],
          ['大须商店街', 'Osu Shopping Street', '传统与现代融合商店街', '2 小时']
        ] },
      { n: '横滨', en: 'Yokohama', note: '港都风情，中华街与海湾夜景', pop: '约 377 万', f: ['港口城市', '中华街', '夜景'],
        attrs: [
          ['横滨中华街', 'Yokohama Chinatown', '日本最大唐人街', '2 小时'],
          ['山下公园', 'Yamashita Park', '海港公园与冰川丸', '1.5 小时'],
          ['横滨红砖仓库', 'Yokohama Red Brick Warehouse', '明治红砖建筑商业区', '1.5 小时']
        ] },
      { n: '广岛', en: 'Hiroshima', note: '濑户内海门户，和平与历史', pop: '约 119 万', f: ['和平纪念', '濑户内海', '历史城市'],
        attrs: [
          ['广岛和平纪念公园', 'Hiroshima Peace Memorial Park', '原爆圆顶馆与和平资料馆', '2 小时'],
          ['严岛神社', 'Itsukushima Shrine', '海上大鸟居与世界遗产', '3 小时'],
          ['广岛城', 'Hiroshima Castle', '重建的战国名城', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'kr', cn: '韩国', en: 'South Korea', flag: 'kr.svg', region: 'ASIA',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '5–10 个工作日', visaStay: '15–30 天',
    climate: '四季分明，冬季寒冷，夏季温热', bestSeason: '4–5 月（樱花）与 9–10 月（秋色）',
    location: '位于东亚朝鲜半岛南部，三面环海',
    seasons: { spring: '樱花与春花', summer: '海岛与海滨度假', autumn: '红叶与登山', winter: '滑雪与温泉' },
    imgEn: 'Seoul South Korea',
    cities: [
      { n: '首尔', en: 'Seoul', note: '韩国首都，潮流、历史与科技中心', pop: '约 950 万', f: ['国际化都市', '潮流购物', '历史遗迹'],
        attrs: [
          ['景福宫', 'Gyeongbokgung Palace', '朝鲜王朝正宫与守门仪式', '2 小时'],
          ['南山首尔塔', 'N Seoul Tower', '城市地标观景塔', '1.5 小时'],
          ['明洞', 'Myeongdong', '购物与街头美食中心', '2 小时']
        ] },
      { n: '釜山', en: 'Busan', note: '第二大城市，海滨与港口', pop: '约 340 万', f: ['海滨城市', '港口', '海鲜美食'],
        attrs: [
          ['海云台', 'Haeundae Beach', '著名海滨与沙滩', '2 小时'],
          ['甘川文化村', 'Gamcheon Culture Village', '彩色山城与艺术壁画', '2 小时'],
          ['札嘎其市场', 'Jagalchi Market', '韩国最大海鲜市场', '1.5 小时']
        ] },
      { n: '济州', en: 'Jeju', note: '火山海岛，自然与度假胜地', pop: '约 67 万', f: ['海岛度假', '自然风光', '徒步'],
        attrs: [
          ['汉拿山', 'Hallasan Mountain', '济州最高峰与火山口', '4 小时'],
          ['城山日出峰', 'Seongsan Ilchulbong', '世界遗产火山峰', '2 小时'],
          ['柱状节理带', 'Jusangjeolli Cliff', '六角形玄武岩柱海岸', '1 小时']
        ] },
      { n: '仁川', en: 'Incheon', note: '国际门户城市，唐人街与海港', pop: '约 295 万', f: ['国际机场门户', '港口城市', '唐人街'],
        attrs: [
          ['仁川唐人街', 'Incheon Chinatown', '韩国最大唐人街', '1.5 小时'],
          ['月尾岛', 'Wolmi Island', '海港公园与游乐园', '2 小时'],
          ['松岛国际城', 'Songdo International Business District', '填海新城区与中央公园', '2 小时']
        ] },
      { n: '大邱', en: 'Daegu', note: '岭南中心，传统市场与美食', pop: '约 240 万', f: ['传统市场', '美食', '区域中心'],
        attrs: [
          ['西门市场', 'Seomun Market', '历史传统市场与小吃', '1.5 小时'],
          ['金光石路', 'Kim Gwangseok-gil Street', '音乐家壁画街', '1.5 小时'],
          ['八公山', 'Palgongsan Mountain', '山寺与缆车', '3 小时']
        ] },
      { n: '庆州', en: 'Gyeongju', note: '千年古都，历史遗迹之城', pop: '约 26 万', f: ['历史文化', '世界遗产', '慢旅行'],
        attrs: [
          ['佛国寺', 'Bulguksa Temple', '世界遗产佛教建筑群', '2 小时'],
          ['石窟庵', 'Seokguram Grotto', '花岗岩佛龛世界遗产', '1.5 小时'],
          ['大陵苑', 'Daereungwon Tomb Complex', '新罗古墓群公园', '1.5 小时']
        ] },
      { n: '全州', en: 'Jeonju', note: '韩屋村与全州拌饭故乡', pop: '约 65 万', f: ['传统韩屋', '美食之都', '文化体验'],
        attrs: [
          ['全州韩屋村', 'Jeonju Hanok Village', '传统韩屋聚落', '2 小时'],
          ['庆基殿', 'Gyeonggijeon Shrine', '朝鲜太祖御真殿', '1.5 小时'],
          ['全州殿洞天主教堂', 'Jeondong Catholic Church', '红砖哥特式教堂', '1 小时']
        ] }
    ]
  },
  {
    id: 'sg', cn: '新加坡', en: 'Singapore', flag: 'sg.svg', region: 'ASIA',
    costTier: 'high', visaMode: 'visa-free', visaPeriod: '无需提前办理', visaStay: '15–30 天',
    climate: '热带气候，全年温暖湿润', bestSeason: '全年皆宜；2–4 月相对干爽',
    location: '位于东南亚马来半岛南端，毗邻马六甲海峡',
    seasons: { spring: '城市花园与滨海漫步', summer: '滨海节庆与购物季', autumn: '美食节与灯光节', winter: '避寒度假与年末促销' },
    imgEn: 'Marina Bay Sands Singapore',
    cities: [
      { n: '滨海湾', en: 'Marina Bay', note: '城市地标区，天际线与滨海花园', pop: '—', f: ['地标天际线', '滨海景观', '商务中心'],
        attrs: [
          ['滨海湾金沙', 'Marina Bay Sands', '三塔顶船形建筑与空中花园', '2 小时'],
          ['滨海湾花园', 'Gardens by the Bay', '超级树与云雾林', '2 小时'],
          ['鱼尾狮公园', 'Merlion Park', '新加坡象征喷水鱼尾狮', '1 小时']
        ] },
      { n: '圣淘沙', en: 'Sentosa', note: '度假岛屿，海滩与主题乐园', pop: '—', f: ['海岛度假', '家庭亲子', '主题乐园'],
        attrs: [
          ['环球影城', 'Universal Studios Singapore', '电影主题乐园', '半天'],
          ['西乐索海滩', 'Siloso Beach', '岛南沙滩与水上活动', '2 小时'],
          ['空中缆车', 'Sentosa Cable Car', '跨海缆车俯瞰全岛', '1 小时']
        ] },
      { n: '牛车水', en: 'Chinatown Singapore', note: '华人文化街区，寺庙与市集', pop: '—', f: ['历史街区', '美食', '文化体验'],
        attrs: [
          ['佛牙寺龙华院', 'Buddha Tooth Relic Temple', '唐式风格佛教寺庙', '1.5 小时'],
          ['牛车水夜市', 'Chinatown Street Market', '传统市集与小吃', '1.5 小时'],
          ['天福宫', 'Thian Hock Keng Temple', '百年妈祖庙', '1 小时']
        ] },
      { n: '小印度', en: 'Little India Singapore', note: '印度风情街区，香料与色彩', pop: '—', f: ['多元文化', '香料市场', '街拍'],
        attrs: [
          ['竹脚中心', 'Tekka Centre', '印度市集与美食中心', '1.5 小时'],
          ['维拉玛卡里雅曼兴都庙', 'Sri Veeramakaliamman Temple', '色彩艳丽的兴都庙', '1 小时'],
          ['慕达发购物中心', 'Mustafa Centre', '24 小时百货中心', '1 小时']
        ] },
      { n: '乌节路', en: 'Orchard Road', note: '购物大道与高端商业', pop: '—', f: ['购物中心', '城市商业', '美食'],
        attrs: [
          ['ION 乌节', 'ION Orchard', '高端购物中心与观景台', '2 小时'],
          ['义安城', 'Ngee Ann City', '大型购物中心', '2 小时'],
          ['乌节中央城', 'Orchard Central', '设计感商场', '1.5 小时']
        ] },
      { n: '克拉码头', en: 'Clarke Quay', note: '河畔餐饮与夜生活', pop: '—', f: ['夜生活', '河畔景观', '餐饮'],
        attrs: [
          ['克拉码头街', 'Clarke Quay Riverside', '彩色伞篷河畔街区', '1.5 小时'],
          ['新加坡河游船', 'Singapore River Cruise', '夜游新加坡河', '1 小时'],
          ['福康宁公园', 'Fort Canning Park', '城市中心历史公园', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'my', cn: '马来西亚', en: 'Malaysia', flag: 'my.svg', region: 'ASIA',
    costTier: 'low', visaMode: 'visa-free', visaPeriod: '无需提前办理', visaStay: '14–30 天',
    climate: '热带雨林气候，全年温暖湿润', bestSeason: '全年皆宜；东海岸 3–10 月较佳',
    location: '位于东南亚，分马来半岛与婆罗洲沙巴、砂拉越',
    seasons: { spring: '城市观光与夜市', summer: '海岛潜水与度假', autumn: '美食节庆', winter: '避寒与海岛' },
    imgEn: 'Kuala Lumpur Petronas Towers',
    cities: [
      { n: '吉隆坡', en: 'Kuala Lumpur', note: '首都与多元文化都市', pop: '约 200 万', f: ['国际化都市', '双子塔', '多元文化'],
        attrs: [
          ['双子塔', 'Petronas Towers', '世界最高双子塔与观景桥', '2 小时'],
          ['独立广场', 'Merdeka Square', '历史地标与殖民建筑', '1.5 小时'],
          ['黑风洞', 'Batu Caves', '石灰岩洞穴与印度教神像', '2 小时']
        ] },
      { n: '槟城乔治市', en: 'George Town Penang', note: '世界遗产老城与美食天堂', pop: '约 70 万', f: ['世界遗产', '街头美食', '历史街区'],
        attrs: [
          ['壁画街', 'Penang Street Art', '乔治市壁画与铁线画', '2 小时'],
          ['极乐寺', 'Kek Lok Si Temple', '东南亚最大佛教寺庙之一', '2 小时'],
          ['姓氏桥', 'Clan Jetties', '海上木屋聚落', '1.5 小时']
        ] },
      { n: '马六甲', en: 'Malacca', note: '历史古城与南洋风情', pop: '约 58 万', f: ['历史文化', '古城漫步', '娘惹文化'],
        attrs: [
          ['荷兰红屋', 'Stadthuys', '红色殖民建筑与广场', '1.5 小时'],
          ['圣保罗教堂', 'St. Paul Church', '山顶教堂遗址', '1 小时'],
          ['鸡场街', 'Jonker Street', '夜市与古董街', '2 小时']
        ] },
      { n: '兰卡威', en: 'Langkawi', note: '免税海岛与自然景观', pop: '约 10 万', f: ['海岛度假', '免税购物', '自然'],
        attrs: [
          ['天空之桥', 'Langkawi Sky Bridge', '高空观景弯桥', '2 小时'],
          ['东方村缆车', 'Langkawi Cable Car', '登马西冈山缆车', '1.5 小时'],
          ['珍南海滩', 'Pantai Cenang', '主海滩与日落', '2 小时']
        ] },
      { n: '沙巴亚庇', en: 'Kota Kinabalu', note: '婆罗洲门户，海岛与神山', pop: '约 45 万', f: ['海岛潜水', '自然生态', '日落'],
        attrs: [
          ['丹绒亚路海滩', 'Tanjung Aru Beach', '世界级日落海滩', '1.5 小时'],
          ['东姑阿都拉曼公园', 'Tunku Abdul Rahman Marine Park', '离岛浮潜群岛', '半天'],
          ['加雅街周日市集', 'Gaya Street Sunday Market', '周末市集与手信', '1.5 小时']
        ] },
      { n: '云顶高原', en: 'Genting Highlands', note: '高原度假与家庭乐园', pop: '—', f: ['高原度假', '家庭亲子', '乐园'],
        attrs: [
          ['云顶天城世界', 'Genting SkyWorlds', '主题乐园', '半天'],
          ['清水岩庙', 'Chin Swee Caves Temple', '山间中式寺庙', '1.5 小时'],
          ['云顶缆车', 'Genting Skyway', '世界最长缆车之一', '1 小时']
        ] },
      { n: '古晋', en: 'Kuching', note: '砂拉越首府，猫城与河畔', pop: '约 60 万', f: ['河畔城市', '自然生态', '慢生活'],
        attrs: [
          ['砂拉越河畔', 'Kuching Waterfront', '河滨长廊与夜景', '1.5 小时'],
          ['古晋猫博物馆', 'Kuching Cat Museum', '主题博物馆', '1 小时'],
          ['巴科国家公园', 'Bako National Park', '红毛猩猩与雨林', '半天']
        ] }
    ]
  },
  {
    id: 'th', cn: '泰国', en: 'Thailand', flag: 'th.svg', region: 'ASIA',
    costTier: 'low', visaMode: 'visa-free', visaPeriod: '无需提前办理', visaStay: '14–30 天',
    climate: '热带气候，全年温暖；分热季、雨季与凉季', bestSeason: '11–2 月（凉季）最舒适',
    location: '位于东南亚中南半岛中部，南临泰国湾与安达曼海',
    seasons: { spring: '泼水节与寺院祈福', summer: '海岛与潜水', autumn: '水灯节与凉季开启', winter: '避寒度假与海岛' },
    imgEn: 'Bangkok Thailand Grand Palace',
    cities: [
      { n: '曼谷', en: 'Bangkok', note: '首都与东南亚活力都市', pop: '约 1060 万', f: ['国际化都市', '寺庙文化', '夜市美食'],
        attrs: [
          ['大皇宫', 'Grand Palace Bangkok', '王室宫殿与玉佛寺', '2 小时'],
          ['卧佛寺', 'Wat Pho', '巨大卧佛与按摩发源地', '1.5 小时'],
          ['郑王庙', 'Wat Arun', '河畔黎明寺', '1.5 小时']
        ] },
      { n: '清迈', en: 'Chiang Mai', note: '北部古城，寺庙与慢生活', pop: '约 130 万', f: ['古城寺庙', '慢生活', '山间自然'],
        attrs: [
          ['双龙寺', 'Wat Phra That Doi Suthep', '素贴山金顶寺庙', '2 小时'],
          ['契迪龙寺', 'Wat Chedi Luang', '古城中心大佛塔', '1.5 小时'],
          ['清迈夜市', 'Chiang Mai Night Bazaar', '手工艺与夜市', '2 小时']
        ] },
      { n: '普吉', en: 'Phuket', note: '安达曼海度假海岛', pop: '约 40 万', f: ['海岛度假', '夜生活', '潜水'],
        attrs: [
          ['芭东海滩', 'Patong Beach', '最热闹海滩与夜生活', '2 小时'],
          ['普吉大佛', 'Big Buddha Phuket', '山顶大佛俯瞰全岛', '1.5 小时'],
          ['攀牙湾', 'Phang Nga Bay', '石灰岩群岛与长尾船', '半天']
        ] },
      { n: '芭堤雅', en: 'Pattaya', note: '海滨度假城与水上活动', pop: '约 12 万', f: ['海滨度假', '水上活动', '夜生活'],
        attrs: [
          ['芭堤雅海滩', 'Pattaya Beach', '城市海滩', '2 小时'],
          ['真理寺', 'Sanctuary of Truth', '全木雕寺庙建筑', '2 小时'],
          ['水上市场', 'Pattaya Floating Market', '河上市场体验', '1.5 小时']
        ] },
      { n: '苏梅岛', en: 'Koh Samui', note: '静谧海滩与奢华度假', pop: '约 6 万', f: ['海岛度假', '蜜月', '潜水'],
        attrs: [
          ['查汶海滩', 'Chaweng Beach', '主海滩与夜生活', '2 小时'],
          ['大佛寺', 'Big Buddha Koh Samui', '金佛与海景', '1 小时'],
          ['祖父祖母石', 'Hin Ta Hin Yai', '海岸奇石', '1 小时']
        ] },
      { n: '清莱', en: 'Chiang Rai', note: '白庙与金三角门户', pop: '约 7 万', f: ['艺术寺庙', '山地部落', '慢旅行'],
        attrs: [
          ['白庙', 'Wat Rong Khun', '白色艺术寺庙', '2 小时'],
          ['蓝庙', 'Wat Rong Suea Ten', '蓝色艺术寺庙', '1.5 小时'],
          ['金三角', 'Golden Triangle', '三国交界与湄公河', '半天']
        ] },
      { n: '华欣', en: 'Hua Hin', note: '皇室度假地，海滨小镇', pop: '约 8 万', f: ['海滨小镇', '皇室度假', '高尔夫'],
        attrs: [
          ['华欣海滩', 'Hua Hin Beach', '安静海滩与骑马', '2 小时'],
          ['华欣火车站', 'Hua Hin Railway Station', '皇室风格老车站', '1 小时'],
          ['拷汪宫', 'Phra Nakhon Khiri', '山丘皇宫', '2 小时']
        ] },
      { n: '大城', en: 'Ayutthaya', note: '暹罗古都，历史遗迹', pop: '约 5 万', f: ['历史文化', '世界遗产', '骑行'],
        attrs: [
          ['玛哈泰寺', 'Wat Mahathat', '树抱佛头遗迹', '1.5 小时'],
          ['帕司山碧寺', 'Wat Phra Si Sanphet', '古都最大佛寺遗迹', '1.5 小时'],
          ['柴瓦塔那兰寺', 'Wat Chaiwatthanaram', '河畔佛塔群', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'vn', cn: '越南', en: 'Vietnam', flag: 'vn.svg', region: 'ASIA',
    costTier: 'low', visaMode: 'evisa', visaPeriod: '3–7 个工作日', visaStay: '15–30 天',
    climate: '南北差异大；北部四季分明，南部常年温暖', bestSeason: '北越 10–4 月，南越 12–4 月',
    location: '位于东南亚中南半岛东部，海岸线绵长',
    seasons: { spring: '古城观光与节庆', summer: '海岛与海滩', autumn: '城市漫步与摄影', winter: '北方山地与避寒南部' },
    imgEn: 'Ha Long Bay Vietnam',
    cities: [
      { n: '河内', en: 'Hanoi', note: '千年古都与法式风情', pop: '约 800 万', f: ['历史古城', '法式建筑', '街头美食'],
        attrs: [
          ['还剑湖', 'Hoan Kiem Lake', '老城中心湖与龟塔', '1.5 小时'],
          ['巴亭广场', 'Ba Dinh Square', '胡志明陵与主席府', '1.5 小时'],
          ['三十六行街', 'Hanoi Old Quarter', '老城街区与夜市', '2 小时']
        ] },
      { n: '胡志明市', en: 'Ho Chi Minh City', note: '南越经济中心与活力都市', pop: '约 900 万', f: ['经济中心', '都市活力', '咖啡文化'],
        attrs: [
          ['中央邮局', 'Saigon Central Post Office', '法式殖民建筑邮局', '1 小时'],
          ['统一宫', 'Reunification Palace', '历史建筑与花园', '1.5 小时'],
          ['滨城市场', 'Ben Thanh Market', '市中心传统市场', '1.5 小时']
        ] },
      { n: '岘港', en: 'Da Nang', note: '海滨城市与现代桥梁', pop: '约 110 万', f: ['海滨度假', '现代建筑', '美食'],
        attrs: [
          ['金桥', 'Golden Bridge Da Nang', '佛手托桥网红地标', '1.5 小时'],
          ['美溪海滩', 'My Khe Beach', '世界级海滩', '2 小时'],
          ['五行山', 'Marble Mountains', '大理石山与洞穴', '2 小时']
        ] },
      { n: '会安', en: 'Hoi An', note: '世界遗产灯笼古镇', pop: '约 15 万', f: ['世界遗产', '灯笼夜景', '定制裁缝'],
        attrs: [
          ['会安古城', 'Hoi An Ancient Town', '灯笼古镇与日式桥', '2 小时'],
          ['来远桥', 'Japanese Covered Bridge', '会安标志廊桥', '1 小时'],
          ['会安夜市', 'Hoi An Night Market', '河畔灯笼夜市', '1.5 小时']
        ] },
      { n: '芽庄', en: 'Nha Trang', note: '海滨度假与潜水天堂', pop: '约 50 万', f: ['海岛潜水', '海滨度假', '泥浆浴'],
        attrs: [
          ['芽庄海滩', 'Nha Trang Beach', '城市海湾海滩', '2 小时'],
          ['婆那加占婆塔', 'Po Nagar Cham Towers', '占婆古塔遗迹', '1.5 小时'],
          ['芽庄大教堂', 'Nha Trang Cathedral', '哥特式石教堂', '1 小时']
        ] },
      { n: '下龙', en: 'Ha Long', note: '海上桂林游船门户', pop: '约 20 万', f: ['自然奇观', '游船', '洞穴'],
        attrs: [
          ['下龙湾游船', 'Ha Long Bay Cruise', '石灰岩群岛游船', '半天'],
          ['惊讶洞', 'Sung Sot Cave', '大型钟乳石洞穴', '1.5 小时'],
          ['天宫洞', 'Thien Cung Cave', '彩灯洞穴', '1.5 小时']
        ] },
      { n: '沙巴', en: 'Sapa', note: '北部山地梯田与少数民族文化', pop: '约 6 万', f: ['山地梯田', '徒步', '民族文化'],
        attrs: [
          ['番西邦峰', 'Fansipan', '中南半岛最高峰与缆车', '半天'],
          ['沙巴梯田', 'Sapa Rice Terraces', '层层梯田景观', '半天'],
          ['猫猫村', 'Cat Cat Village', '黑苗村落徒步', '2 小时']
        ] }
    ]
  }
,
  {

    id: 'ae', cn: '阿联酋', en: 'UAE', flag: 'ae.svg', region: 'ASIA',
    costTier: 'high', visaMode: 'visa-free', visaPeriod: '无需提前办理', visaStay: '15–30 天',
    climate: '热带沙漠气候，夏季酷热，冬季温暖', bestSeason: '11–3 月（冬季）最佳',
    location: '位于阿拉伯半岛东南部，波斯湾沿岸',
    seasons: { spring: '城市观光与购物节', summer: '室内乐园与泳池度假', autumn: '户外体验与海滩', winter: '黄金旅行季与沙漠活动' },
    imgEn: 'Dubai skyline Burj Khalifa',
    cities: [
      { n: '迪拜', en: 'Dubai', note: '沙漠中的现代奇迹与商业中心', pop: '约 340 万', f: ['摩天地标', '奢华购物', '沙漠体验'],
        attrs: [
          ['哈利法塔', 'Burj Khalifa', '世界最高建筑与观景台', '2 小时'],
          ['迪拜购物中心', 'Dubai Mall', '巨型商业综合体', '2 小时'],
          ['朱美拉海滩', 'Jumeirah Beach', '帆船酒店景观海滩', '2 小时']
        ] },
      { n: '阿布扎比', en: 'Abu Dhabi', note: '首都与文化地标之城', pop: '约 150 万', f: ['清真寺', '博物馆', '滨海大道'],
        attrs: [
          ['谢赫扎耶德大清真寺', 'Sheikh Zayed Grand Mosque', '白色大理石清真寺', '2 小时'],
          ['阿布扎比卢浮宫', 'Louvre Abu Dhabi', '穹顶艺术博物馆', '2 小时'],
          ['滨海大道', 'Abu Dhabi Corniche', '海滨步行道', '1.5 小时']
        ] },
      { n: '沙迦', en: 'Sharjah', note: '文化艺术之城', pop: '约 140 万', f: ['文化艺术', '博物馆', '传统市场'],
        attrs: [
          ['沙迦艺术博物馆', 'Sharjah Art Museum', '当代与伊斯兰艺术', '1.5 小时'],
          ['沙迦老集市', 'Sharjah Souk', '传统市场与黄金街', '1.5 小时'],
          ['文化广场', 'Cultural Square', '地标雕塑与广场', '1 小时']
        ] },
      { n: '拉斯海马', en: 'Ras Al Khaimah', note: '北部酋长国，山地与海滩', pop: '约 35 万', f: ['山地探险', '海滩度假', '安静'],
        attrs: [
          ['杰贝勒贾伊斯山', 'Jebel Jais', '阿联酋最高峰与观景台', '半天'],
          ['阿尔马里安岛', 'Al Marjan Island', '人工岛度假区', '2 小时'],
          ['拉斯海马国家博物馆', 'National Museum of Ras Al Khaimah', '古堡改建博物馆', '1.5 小时']
        ] },
      { n: '富查伊拉', en: 'Fujairah', note: '东海岸酋长国，潜水与山峦', pop: '约 15 万', f: ['潜水', '山地风光', '安静海岸'],
        attrs: [
          ['富查伊拉堡', 'Fujairah Fort', '古堡垒与村庄', '1.5 小时'],
          ['富查伊拉海滩', 'Fujairah Beach', '东海岸海滩', '2 小时'],
          ['瓦迪沃里', 'Wadi Wurrayah', '山间溪谷徒步', '2 小时']
        ] }
    ]
  },
  {
    id: 'tr', cn: '土耳其', en: 'Turkey', flag: 'tr.svg', region: 'ASIA',
    costTier: 'low', visaMode: 'evisa', visaPeriod: '电子签 24–72 小时', visaStay: '30 天',
    climate: '地中海气候与大陆性气候并存', bestSeason: '4–5 月与 9–10 月',
    location: '横跨欧亚大陆，北临黑海、南接地中海',
    seasons: { spring: '古城观光与花季', summer: '爱琴海与地中海海滨', autumn: '卡帕多奇亚热气球季', winter: '温泉与滑雪' },
    imgEn: 'Istanbul Turkey Hagia Sophia',
    cities: [
      { n: '伊斯坦布尔', en: 'Istanbul', note: '欧亚交汇的历史之都', pop: '约 1550 万', f: ['历史遗迹', '海峡风光', '美食'],
        attrs: [
          ['圣索菲亚大教堂', 'Hagia Sophia', '拜占庭建筑奇迹', '2 小时'],
          ['蓝色清真寺', 'Blue Mosque Istanbul', '六塔清真寺', '1.5 小时'],
          ['博斯普鲁斯海峡', 'Bosphorus Strait', '欧亚两岸游船', '2 小时']
        ] },
      { n: '卡帕多奇亚', en: 'Cappadocia', note: '奇幻地貌与热气球', pop: '约 8 万', f: ['热气球', '洞穴酒店', '徒步'],
        attrs: [
          ['格雷梅露天博物馆', 'Goreme Open Air Museum', '岩石教堂壁画群', '2 小时'],
          ['热气球飞行', 'Cappadocia hot air balloon', '清晨俯瞰奇特地貌', '3 小时'],
          ['乌奇希萨尔城堡', 'Uchisar Castle', '火山岩城堡观景', '1.5 小时']
        ] },
      { n: '棉花堡', en: 'Pamukkale', note: '白色钙化梯田温泉', pop: '约 1 万', f: ['温泉', '自然奇观', '摄影'],
        attrs: [
          ['棉花堡钙化池', 'Pamukkale travertines', '白色梯田温泉', '2 小时'],
          ['希拉波利斯古城', 'Hierapolis', '罗马温泉古城遗址', '2 小时'],
          ['克利奥帕特拉泳池', 'Cleopatra Pools', '古泳池温泉', '1.5 小时']
        ] },
      { n: '安塔利亚', en: 'Antalya', note: '地中海海滨度假城', pop: '约 130 万', f: ['海滨度假', '古城', '游艇'],
        attrs: [
          ['卡莱伊奇老城', 'Kaleici', '地中海老城与港口', '2 小时'],
          ['杜登瀑布', 'Duden Waterfalls', '入海瀑布', '1.5 小时'],
          ['安塔利亚博物馆', 'Antalya Museum', '古罗马雕像收藏', '2 小时']
        ] },
      { n: '伊兹密尔', en: 'Izmir', note: '爱琴海沿岸大都市', pop: '约 430 万', f: ['海滨城市', '历史遗迹', '美食'],
        attrs: [
          ['以弗所古城', 'Ephesus', '爱琴海畔古罗马遗迹', '半天'],
          ['钟楼广场', 'Konak Square', '城市中心钟楼', '1 小时'],
          ['爱琴海沿岸', 'Izmir seafront', '海滨长廊', '1.5 小时']
        ] },
      { n: '安卡拉', en: 'Ankara', note: '首都与现代城市', pop: '约 580 万', f: ['首都', '博物馆', '现代都市'],
        attrs: [
          ['国父陵', 'Anitkabir', '阿塔图尔克陵墓', '2 小时'],
          ['安纳托利亚文明博物馆', 'Museum of Anatolian Civilizations', '史前文物收藏', '2 小时'],
          ['安卡拉城堡', 'Ankara Castle', '老城山丘城堡', '1.5 小时']
        ] },
      { n: '博德鲁姆', en: 'Bodrum', note: '爱琴海度假小镇', pop: '约 15 万', f: ['海岛度假', '白色小镇', '游艇'],
        attrs: [
          ['博德鲁姆城堡', 'Bodrum Castle', '圣彼得城堡与水下考古', '2 小时'],
          ['博德鲁姆港', 'Bodrum Marina', '游艇港湾', '1.5 小时'],
          ['风车山', 'Bodrum Windmills', '白色风车观景', '1 小时']
        ] }
    ]
  },
  {
    id: 'gb', cn: '英国', en: 'United Kingdom', flag: 'gb.svg', region: 'EUROPE',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–180 天',
    climate: '温带海洋性气候，全年温和湿润', bestSeason: '5–9 月（夏季）',
    location: '位于欧洲西北部，由大不列颠岛与北爱尔兰等组成',
    seasons: { spring: '花园与城市漫步', summer: '节庆、音乐节与湖区', autumn: '红叶与博物馆季', winter: '圣诞市场与戏剧季' },
    imgEn: 'London Tower Bridge',
    cities: [
      { n: '伦敦', en: 'London', note: '全球都市，博物馆与音乐剧', pop: '约 890 万', f: ['国际化都市', '博物馆', '王室文化'],
        attrs: [
          ['伦敦塔桥', 'Tower Bridge', '泰晤士河地标桥梁', '1.5 小时'],
          ['大本钟', 'Big Ben', '议会大厦钟楼', '1 小时'],
          ['伦敦眼', 'London Eye', '河畔摩天轮', '1.5 小时']
        ] },
      { n: '爱丁堡', en: 'Edinburgh', note: '苏格兰首府，古堡与节庆', pop: '约 52 万', f: ['古堡', '艺术节', '历史街区'],
        attrs: [
          ['爱丁堡城堡', 'Edinburgh Castle', '火山岩上的古堡', '2 小时'],
          ['皇家一英里', 'Royal Mile', '老城主街', '1.5 小时'],
          ['亚瑟王座', 'Arthur Seat', '城市山丘观景', '2 小时']
        ] },
      { n: '曼彻斯特', en: 'Manchester', note: '工业之城与足球音乐', pop: '约 55 万', f: ['足球文化', '音乐现场', '工业遗产'],
        attrs: [
          ['老特拉福德球场', 'Old Trafford', '曼联主场', '2 小时'],
          ['科学与工业博物馆', 'Science and Industry Museum', '工业革命遗产', '2 小时'],
          ['曼彻斯特大教堂', 'Manchester Cathedral', '中世纪教堂', '1 小时']
        ] },
      { n: '利物浦', en: 'Liverpool', note: '披头士故乡与海港', pop: '约 50 万', f: ['音乐文化', '港口', '博物馆'],
        attrs: [
          ['披头士故事馆', 'The Beatles Story', '乐队主题博物馆', '2 小时'],
          ['阿尔伯特码头', 'Royal Albert Dock', '历史港口建筑群', '1.5 小时'],
          ['利物浦大教堂', 'Liverpool Cathedral', '英国最大教堂', '1.5 小时']
        ] },
      { n: '巴斯', en: 'Bath', note: '罗马浴场与乔治亚建筑', pop: '约 9 万', f: ['历史温泉', '乔治亚建筑', '慢旅行'],
        attrs: [
          ['罗马浴场', 'Roman Baths', '古罗马温泉遗迹', '2 小时'],
          ['皇家新月楼', 'Royal Crescent', '乔治亚建筑地标', '1 小时'],
          ['巴斯修道院', 'Bath Abbey', '哥特式教堂', '1 小时']
        ] },
      { n: '剑桥', en: 'Cambridge', note: '学府之城与康河撑船', pop: '约 12 万', f: ['学府', '康河', '历史建筑'],
        attrs: [
          ['国王学院礼拜堂', 'King College Chapel', '哥特式教堂', '1.5 小时'],
          ['康河撑船', 'Punting Cambridge', '剑河泛舟', '1.5 小时'],
          ['三一学院', 'Trinity College', '牛顿母校', '1 小时']
        ] },
      { n: '牛津', en: 'Oxford', note: '千年学府与学院建筑', pop: '约 15 万', f: ['学府', '哈利波特取景', '书店'],
        attrs: [
          ['基督教堂学院', 'Christ Church Oxford', '学院与哈利波特食堂', '2 小时'],
          ['博德利图书馆', 'Bodleian Library', '古老图书馆', '1.5 小时'],
          ['拉德克利夫圆楼', 'Radcliffe Camera', '圆顶图书馆地标', '1 小时']
        ] },
      { n: '约克', en: 'York', note: '中世纪古城与城墙', pop: '约 21 万', f: ['中世纪古城', '城墙漫步', '茶室文化'],
        attrs: [
          ['约克大教堂', 'York Minster', '欧洲最大哥特教堂之一', '2 小时'],
          ['肉铺街', 'The Shambles', '哈利波特对角巷原型', '1 小时'],
          ['约克城墙', 'York City Walls', '中世纪城墙漫步', '1.5 小时']
        ] },
      { n: '贝尔法斯特', en: 'Belfast', note: '北爱尔兰首府，泰坦尼克故乡', pop: '约 34 万', f: ['港口城市', '泰坦尼克', '历史'],
        attrs: [
          ['泰坦尼克号博物馆', 'Titanic Belfast', '造船主题博物馆', '2 小时'],
          ['市政厅', 'Belfast City Hall', '文艺复兴风格建筑', '1 小时'],
          ['巨人之路', 'Giant Causeway', '火山岩柱海岸（近郊）', '半天']
        ] }
    ]
  }
,
  {

    id: 'de', cn: '德国', en: 'Germany', flag: 'de.svg', region: 'EUROPE',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带气候，四季分明', bestSeason: '5–9 月；圣诞市场季（12 月）',
    location: '位于欧洲中部，是欧洲经济与交通枢纽',
    seasons: { spring: '樱花与城市漫步', summer: '啤酒节与湖泊度假', autumn: '葡萄酒与城堡', winter: '圣诞市场' },
    imgEn: 'Berlin Brandenburg Gate',
    cities: [
      { n: '柏林', en: 'Berlin', note: '首都，历史与当代艺术', pop: '约 360 万', f: ['历史记忆', '当代艺术', '夜生活'],
        attrs: [
          ['勃兰登堡门', 'Brandenburg Gate', '柏林地标与历史广场', '1 小时'],
          ['柏林墙纪念馆', 'Berlin Wall Memorial', '历史遗迹与纪念地', '2 小时'],
          ['博物馆岛', 'Museum Island', '五大博物馆建筑群', '半天']
        ] },
      { n: '慕尼黑', en: 'Munich', note: '巴伐利亚首府，啤酒节', pop: '约 150 万', f: ['啤酒节', '老城', '博物馆'],
        attrs: [
          ['玛利亚广场', 'Marienplatz', '老城中心与新市政厅', '1.5 小时'],
          ['慕尼黑王宫', 'Munich Residenz', '巴伐利亚王宫', '2 小时'],
          ['英国花园', 'English Garden', '城市大型公园', '2 小时']
        ] },
      { n: '法兰克福', en: 'Frankfurt', note: '金融中心与天际线', pop: '约 76 万', f: ['金融都市', '天际线', '交通枢纽'],
        attrs: [
          ['罗马广场', 'Römer Frankfurt', '中世纪老城广场', '1.5 小时'],
          ['法兰克福大教堂', 'Frankfurt Cathedral', '哥特式皇帝教堂', '1 小时'],
          ['美因塔观景台', 'Main Tower', '城市天际线观景', '1 小时']
        ] },
      { n: '汉堡', en: 'Hamburg', note: '港口城市与仓库城', pop: '约 185 万', f: ['港口', '仓库城', '音乐厅'],
        attrs: [
          ['易北爱乐音乐厅', 'Elbphilharmonie', '波浪形玻璃音乐厅', '2 小时'],
          ['仓库城', 'Speicherstadt', '红砖仓库历史区', '1.5 小时'],
          ['汉堡港', 'Port of Hamburg', '德国最大港口', '1.5 小时']
        ] },
      { n: '科隆', en: 'Cologne', note: '大教堂之城与莱茵河', pop: '约 108 万', f: ['哥特教堂', '河畔', '啤酒文化'],
        attrs: [
          ['科隆大教堂', 'Cologne Cathedral', '哥特式大教堂', '2 小时'],
          ['霍亨索伦桥', 'Hohenzollern Bridge', '爱情锁桥与河景', '1 小时'],
          ['科隆老城', 'Cologne Old Town', '老城广场与啤酒馆', '1.5 小时']
        ] },
      { n: '斯图加特', en: 'Stuttgart', note: '汽车工业之城', pop: '约 63 万', f: ['汽车博物馆', '葡萄酒', '现代建筑'],
        attrs: [
          ['梅赛德斯奔驰博物馆', 'Mercedes-Benz Museum', '汽车历史博物馆', '2 小时'],
          ['保时捷博物馆', 'Porsche Museum', '跑车品牌博物馆', '2 小时'],
          ['斯图加特王宫广场', 'Schlossplatz Stuttgart', '城市中心广场', '1 小时']
        ] },
      { n: '德累斯顿', en: 'Dresden', note: '巴洛克艺术之城', pop: '约 55 万', f: ['巴洛克建筑', '艺术', '易北河'],
        attrs: [
          ['茨温格宫', 'Zwinger', '巴洛克宫殿与画廊', '2 小时'],
          ['圣母教堂', 'Frauenkirche Dresden', '重建的圆顶教堂', '1.5 小时'],
          ['布吕尔平台', 'Brühlsche Terrasse', '易北河畔观景台', '1 小时']
        ] },
      { n: '纽伦堡', en: 'Nuremberg', note: '中世纪老城与圣诞市场', pop: '约 52 万', f: ['中世纪老城', '圣诞市场', '历史'],
        attrs: [
          ['皇帝堡', 'Nuremberg Castle', '山丘古堡与观景', '2 小时'],
          ['圣洛伦茨教堂', 'St Lorenz Church', '哥特式教堂', '1 小时'],
          ['主集市广场', 'Hauptmarkt Nuremberg', '圣诞市场会场', '1 小时']
        ] },
      { n: '莱比锡', en: 'Leipzig', note: '音乐与艺术之城', pop: '约 60 万', f: ['音乐文化', '艺术街区', '历史'],
        attrs: [
          ['圣托马斯教堂', 'St Thomas Church', '巴赫任职教堂', '1 小时'],
          ['莱比锡老市政厅', 'Leipzig Old Town Hall', '文艺复兴建筑', '1 小时'],
          ['莱比锡动物园', 'Leipzig Zoo', '欧洲著名动物园', '半天']
        ] }
    ]
  },
  {
    id: 'fr', cn: '法国', en: 'France', flag: 'fr.svg', region: 'EUROPE',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带海洋性气候与地中海气候并存', bestSeason: '4–6 月与 9–10 月',
    location: '位于欧洲西部，西临大西洋，南接地中海',
    seasons: { spring: '巴黎街头与花园', summer: '南法海滨与薰衣草', autumn: '葡萄酒与城堡', winter: '阿尔卑斯滑雪与圣诞市场' },
    imgEn: 'Paris Eiffel Tower',
    cities: [
      { n: '巴黎', en: 'Paris', note: '艺术、时尚与历史之都', pop: '约 210 万（都会区 1200 万）', f: ['艺术之都', '时尚购物', '博物馆'],
        attrs: [
          ['埃菲尔铁塔', 'Eiffel Tower', '巴黎地标与观景台', '2 小时'],
          ['卢浮宫', 'Louvre Museum', '世界最大艺术博物馆', '3 小时'],
          ['凯旋门', 'Arc de Triomphe', '香榭丽舍大道地标', '1.5 小时']
        ] },
      { n: '尼斯', en: 'Nice', note: '蔚蓝海岸度假之城', pop: '约 34 万', f: ['海滨度假', '海岸线', '美食'],
        attrs: [
          ['天使湾', 'Baie des Anges', '蔚蓝海岸海滩', '2 小时'],
          ['英国人漫步大道', 'Promenade des Anglais', '海滨步道', '1.5 小时'],
          ['尼斯老城', 'Vieux Nice', '彩色老城与市集', '1.5 小时']
        ] },
      { n: '里昂', en: 'Lyon', note: '法国美食之都', pop: '约 51 万', f: ['美食之都', '老城', '丝绸文化'],
        attrs: [
          ['富维耶圣母堂', 'Basilica of Notre-Dame de Fourvière', '山丘白色教堂', '1.5 小时'],
          ['里昂老城', 'Vieux Lyon', '文艺复兴街区', '1.5 小时'],
          ['白莱果广场', 'Place Bellecour', '欧洲最大步行广场', '1 小时']
        ] },
      { n: '波尔多', en: 'Bordeaux', note: '葡萄酒之都', pop: '约 25 万', f: ['葡萄酒', '古典建筑', '河畔'],
        attrs: [
          ['波尔多交易所广场', 'Place de la Bourse', '镜面广场地标', '1 小时'],
          ['圣安德烈大教堂', 'Bordeaux Cathedral', '哥特式教堂', '1 小时'],
          ['波尔多葡萄酒城', 'Cite du Vin', '葡萄酒博物馆', '2 小时']
        ] },
      { n: '马赛', en: 'Marseille', note: '地中海港口城市', pop: '约 86 万', f: ['港口', '地中海', '多元文化'],
        attrs: [
          ['旧港', 'Vieux-Port de Marseille', '历史港口与鱼市', '1.5 小时'],
          ['圣母加德大教堂', 'Basilique Notre-Dame de la Garde', '山顶金圣母像', '1.5 小时'],
          ['卡朗格峡湾', 'Calanques', '海岸峡湾徒步', '半天']
        ] },
      { n: '斯特拉斯堡', en: 'Strasbourg', note: '欧洲议会之都与圣诞市场', pop: '约 29 万', f: ['圣诞市场', '欧式老城', '文化'],
        attrs: [
          ['斯特拉斯堡大教堂', 'Strasbourg Cathedral', '粉砂岩哥特教堂', '1.5 小时'],
          ['小法兰西', 'Petite France', '运河木筋屋街区', '1.5 小时'],
          ['欧洲议会', 'European Parliament', '现代议会建筑', '1 小时']
        ] },
      { n: '阿维尼翁', en: 'Avignon', note: '普罗旺斯古城与教皇宫', pop: '约 9 万', f: ['历史古城', '艺术节', '薰衣草门户'],
        attrs: [
          ['教皇宫', 'Palais des Papes', '中世纪教皇宫殿', '2 小时'],
          ['圣贝内泽桥', 'Pont Saint-Benezet', '断桥地标', '1 小时'],
          ['阿维尼翁城墙', 'Avignon city walls', '环绕古城墙', '1 小时']
        ] },
      { n: '里尔', en: 'Lille', note: '北部文化都市', pop: '约 23 万', f: ['艺术文化', '老城', '美食'],
        attrs: [
          ['里尔老交易所', 'Vieille Bourse', '佛兰德斯建筑广场', '1 小时'],
          ['里尔美术宫', 'Palais des Beaux-Arts de Lille', '重要美术馆', '2 小时'],
          ['戴高乐将军广场', 'Place du General de Gaulle', '城市中心广场', '1 小时']
        ] }
    ]
  },
  {
    id: 'it', cn: '意大利', en: 'Italy', flag: 'it.svg', region: 'EUROPE',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '地中海气候，夏季温暖干燥', bestSeason: '4–6 月与 9–10 月',
    location: '位于南欧亚平宁半岛，地中海中部',
    seasons: { spring: '罗马古城与花季', summer: '海岸与海岛', autumn: '托斯卡纳田园与美食', winter: '威尼斯与阿尔卑斯' },
    imgEn: 'Rome Colosseum',
    cities: [
      { n: '罗马', en: 'Rome', note: '永恒之城与千年遗迹', pop: '约 280 万', f: ['历史遗迹', '艺术', '美食'],
        attrs: [
          ['罗马斗兽场', 'Colosseum', '古罗马圆形剧场', '2 小时'],
          ['万神殿', 'Pantheon', '古罗马神庙建筑', '1.5 小时'],
          ['特雷维喷泉', 'Trevi Fountain', '许愿池', '1 小时']
        ] },
      { n: '佛罗伦萨', en: 'Florence', note: '文艺复兴艺术殿堂', pop: '约 38 万', f: ['文艺复兴', '博物馆', '老城'],
        attrs: [
          ['圣母百花大教堂', 'Florence Cathedral', '红砖穹顶地标', '2 小时'],
          ['乌菲兹美术馆', 'Uffizi Gallery', '文艺复兴名画', '2 小时'],
          ['老桥', 'Ponte Vecchio', '阿尔诺河古桥', '1 小时']
        ] },
      { n: '威尼斯', en: 'Venice', note: '水上城市与运河', pop: '约 26 万', f: ['水城', '运河', '艺术'],
        attrs: [
          ['圣马可广场', 'St Marks Square', '水城中心广场', '2 小时'],
          ['里亚托桥', 'Rialto Bridge', '大运河古桥', '1 小时'],
          ['贡多拉游船', 'Gondola Venice', '运河小船体验', '1 小时']
        ] },
      { n: '米兰', en: 'Milan', note: '时尚与设计之都', pop: '约 140 万', f: ['时尚', '设计', '足球'],
        attrs: [
          ['米兰大教堂', 'Milan Cathedral', '哥特式大理石教堂', '2 小时'],
          ['埃马努埃莱二世长廊', 'Galleria Vittorio Emanuele II', '拱廊购物街', '1.5 小时'],
          ['斯福尔扎城堡', 'Sforza Castle', '中世纪城堡', '2 小时']
        ] },
      { n: '那不勒斯', en: 'Naples', note: '披萨故乡与海湾城市', pop: '约 95 万', f: ['美食', '海湾', '历史'],
        attrs: [
          ['庞贝古城', 'Pompeii', '火山掩埋古城（近郊）', '半天'],
          ['新堡', 'Castel Nuovo', '海滨城堡', '1.5 小时'],
          ['那不勒斯皇宫', 'Royal Palace of Naples', '王宫建筑', '1.5 小时']
        ] },
      { n: '维罗纳', en: 'Verona', note: '罗密欧与朱丽叶之城', pop: '约 26 万', f: ['浪漫之城', '古剧场', '老城'],
        attrs: [
          ['朱丽叶故居', 'Juliet House Verona', '阳台与爱情墙', '1.5 小时'],
          ['维罗纳竞技场', 'Verona Arena', '古罗马圆形剧场', '2 小时'],
          ['老城堡', 'Castelvecchio', '斯卡拉家族城堡', '1.5 小时']
        ] },
      { n: '都灵', en: 'Turin', note: '汽车与巧克力之城', pop: '约 87 万', f: ['汽车博物馆', '巧克力', '巴洛克'],
        attrs: [
          ['国家汽车博物馆', 'Museo Nazionale dell Automobile', '汽车历史博物馆', '2 小时'],
          ['都灵王宫', 'Palazzo Reale di Torino', '萨伏依王宫', '2 小时'],
          ['安托内利尖塔', 'Mole Antonelliana', '城市地标尖塔', '1.5 小时']
        ] },
      { n: '博洛尼亚', en: 'Bologna', note: '大学城与美食之城', pop: '约 39 万', f: ['大学城', '美食', '拱廊'],
        attrs: [
          ['双塔', 'Due Torri Bologna', '倾斜中世纪塔楼', '1.5 小时'],
          ['马焦雷广场', 'Piazza Maggiore', '城市中心广场', '1.5 小时'],
          ['圣白托略大殿', 'Basilica di San Petronio', '大型哥特教堂', '1 小时']
        ] },
      { n: '帕多瓦', en: 'Padua', note: '历史大学城', pop: '约 21 万', f: ['学府', '教堂壁画', '慢旅行'],
        attrs: [
          ['斯科洛文尼礼拜堂', 'Scrovegni Chapel', '乔托壁画杰作', '1.5 小时'],
          ['帕多瓦植物园', 'Orto Botanico di Padova', '世界最古老植物园', '1.5 小时'],
          ['圣安东尼大教堂', 'Basilica of Saint Anthony', '朝圣大教堂', '1 小时']
        ] }
    ]
  }
,
  {

    id: 'es', cn: '西班牙', en: 'Spain', flag: 'es.svg', region: 'EUROPE',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '地中海气候，阳光充足', bestSeason: '4–6 月与 9–10 月',
    location: '位于欧洲西南部伊比利亚半岛',
    seasons: { spring: '节庆与城市漫步', summer: '海岛与海滨', autumn: '美食与艺术', winter: '南方暖阳与滑雪' },
    imgEn: 'Barcelona Sagrada Familia',
    cities: [
      { n: '巴塞罗那', en: 'Barcelona', note: '高迪之城与地中海都市', pop: '约 160 万', f: ['高迪建筑', '海滨', '美食'],
        attrs: [
          ['圣家堂', 'Sagrada Familia', '高迪未完成杰作', '2 小时'],
          ['古埃尔公园', 'Park Guell', '高迪马赛克公园', '2 小时'],
          ['兰布拉大道', 'La Rambla', '城市步行大道', '1.5 小时']
        ] },
      { n: '马德里', en: 'Madrid', note: '首都与艺术中心', pop: '约 320 万', f: ['艺术博物馆', '都市生活', '足球'],
        attrs: [
          ['普拉多博物馆', 'Prado Museum', '西班牙艺术殿堂', '2 小时'],
          ['马德里王宫', 'Royal Palace of Madrid', '王室宫殿', '2 小时'],
          ['太阳门广场', 'Puerta del Sol', '城市中心广场', '1 小时']
        ] },
      { n: '塞维利亚', en: 'Seville', note: '弗拉明戈与摩尔风情', pop: '约 69 万', f: ['弗拉明戈', '摩尔建筑', '历史'],
        attrs: [
          ['塞维利亚王宫', 'Real Alcazar of Seville', '摩尔式宫殿', '2 小时'],
          ['塞维利亚大教堂', 'Seville Cathedral', '世界最大哥特教堂之一', '2 小时'],
          ['西班牙广场', 'Plaza de Espana Seville', '半圆形广场', '1.5 小时']
        ] },
      { n: '瓦伦西亚', en: 'Valencia', note: '科学与艺术城', pop: '约 80 万', f: ['现代建筑', '海鲜饭故乡', '海滨'],
        attrs: [
          ['科学与艺术城', 'City of Arts and Sciences', '未来主义建筑群', '半天'],
          ['瓦伦西亚大教堂', 'Valencia Cathedral', '老城哥特教堂', '1.5 小时'],
          ['马尔瓦罗萨海滩', 'Malvarrosa Beach', '城市海滩', '2 小时']
        ] },
      { n: '格拉纳达', en: 'Granada', note: '阿尔罕布拉宫之城', pop: '约 23 万', f: ['摩尔宫殿', '雪山背景', '小巷'],
        attrs: [
          ['阿尔罕布拉宫', 'Alhambra', '摩尔宫殿与花园', '3 小时'],
          ['阿尔拜辛区', 'Albaicin', '老城街区与观景台', '2 小时'],
          ['格拉纳达大教堂', 'Granada Cathedral', '文艺复兴教堂', '1.5 小时']
        ] },
      { n: '毕尔巴鄂', en: 'Bilbao', note: '古根海姆博物馆之城', pop: '约 35 万', f: ['现代艺术', '美食', '城市更新'],
        attrs: [
          ['古根海姆博物馆', 'Guggenheim Museum Bilbao', '钛金属曲面建筑', '2 小时'],
          ['老城区', 'Casco Viejo Bilbao', '七条街老城', '1.5 小时'],
          ['苏里奥拉桥', 'Zubizuri Bridge', '白色步行桥', '1 小时']
        ] },
      { n: '马拉加', en: 'Malaga', note: '太阳海岸门户', pop: '约 57 万', f: ['海滨度假', '毕加索故乡', '美食'],
        attrs: [
          ['马拉加城堡', 'Alcazaba of Malaga', '摩尔城堡与花园', '2 小时'],
          ['毕加索博物馆', 'Picasso Museum Malaga', '画家故乡博物馆', '1.5 小时'],
          ['马拉加海滩', 'Malagueta Beach', '城市海滩', '2 小时']
        ] },
      { n: '圣地亚哥', en: 'Santiago de Compostela', note: '朝圣之路终点', pop: '约 10 万', f: ['朝圣文化', '古城', '慢旅行'],
        attrs: [
          ['圣地亚哥大教堂', 'Santiago de Compostela Cathedral', '朝圣终点大教堂', '2 小时'],
          ['老城区', 'Santiago de Compostela old town', '石砌老街', '1.5 小时'],
          ['加利西亚博物馆', 'Museo das Peregrinaciones', '朝圣主题博物馆', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'pt', cn: '葡萄牙', en: 'Portugal', flag: 'pt.svg', region: 'EUROPE',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '地中海与海洋性气候并存，冬季温和', bestSeason: '4–6 月与 9–10 月',
    location: '位于欧洲西南端，伊比利亚半岛西部',
    seasons: { spring: '城市漫步与花季', summer: '阿尔加维海岸', autumn: '葡萄酒与蛋挞', winter: '南部暖阳' },
    imgEn: 'Lisbon Portugal Belem Tower',
    cities: [
      { n: '里斯本', en: 'Lisbon', note: '山丘、电车与海风之都', pop: '约 54 万', f: ['老城', '电车', '海景'],
        attrs: [
          ['贝伦塔', 'Belem Tower', '大航海时代地标', '1.5 小时'],
          ['热罗尼莫斯修道院', 'Jerónimos Monastery', '曼努埃尔式建筑', '1.5 小时'],
          ['圣胡斯塔升降机', 'Santa Justa Lift', '老城观景升降机', '1 小时']
        ] },
      { n: '波尔图', en: 'Porto', note: '酒庄与杜罗河之城', pop: '约 24 万', f: ['波特酒', '河景', '瓷砖艺术'],
        attrs: [
          ['路易一世大桥', 'Dom Luis I Bridge', '双层铁桥与河景', '1 小时'],
          ['克莱里戈斯塔', 'Clérigos Tower', '城市地标塔', '1 小时'],
          ['圣本图火车站', 'Sao Bento Station', '蓝白瓷砖车站', '1 小时']
        ] },
      { n: '辛特拉', en: 'Sintra', note: '童话宫殿与森林', pop: '约 38 万', f: ['宫殿', '自然', '浪漫'],
        attrs: [
          ['佩纳宫', 'Pena Palace', '彩色童话宫殿', '2 小时'],
          ['摩尔人城堡', 'Castle of the Moors', '山脊古城墙', '1.5 小时'],
          ['雷加莱拉庄园', 'Quinta da Regaleira', '神秘庄园与深井', '2 小时']
        ] },
      { n: '法鲁', en: 'Faro', note: '阿尔加维首府与海岸', pop: '约 6 万', f: ['海滨', '老城', '岛屿'],
        attrs: [
          ['法鲁老城', 'Faro Old Town', '城墙环绕老城', '1.5 小时'],
          ['法鲁大教堂', 'Faro Cathedral', '老城大教堂', '1 小时'],
          ['荒岛海滩', 'Ilha Deserta', '近海沙洲海滩', '半天']
        ] },
      { n: '科英布拉', en: 'Coimbra', note: '大学城与历史', pop: '约 14 万', f: ['学府', '历史', '慢旅行'],
        attrs: [
          ['科英布拉大学', 'University of Coimbra', '世界遗产大学', '2 小时'],
          ['若昂尼娜图书馆', 'Joanina Library', '巴洛克图书馆', '1 小时'],
          ['老教堂', 'Old Cathedral of Coimbra', '罗马式教堂', '1 小时']
        ] },
      { n: '埃武拉', en: 'Evora', note: '古罗马与中世纪古城', pop: '约 5 万', f: ['世界遗产', '罗马遗迹', '古城'],
        attrs: [
          ['戴安娜神庙', 'Temple of Diana Evora', '古罗马神殿遗迹', '1 小时'],
          ['埃武拉大教堂', 'Evora Cathedral', '哥特式教堂', '1 小时'],
          ['人骨教堂', 'Capela dos Ossos', '人骨装饰礼拜堂', '1 小时']
        ] }
    ]
  },
  {
    id: 'ch', cn: '瑞士', en: 'Switzerland', flag: 'ch.svg', region: 'EUROPE',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '山地气候，夏季凉爽，冬季多雪', bestSeason: '6–9 月（徒步）与 12–3 月（滑雪）',
    location: '位于欧洲中部阿尔卑斯山区',
    seasons: { spring: '湖畔与城市', summer: '高山徒步', autumn: '金色山谷与葡萄酒', winter: '滑雪与圣诞市场' },
    imgEn: 'Matterhorn Switzerland',
    cities: [
      { n: '苏黎世', en: 'Zurich', note: '金融都市与湖光山色', pop: '约 43 万', f: ['金融都市', '湖畔', '老城'],
        attrs: [
          ['班霍夫大街', 'Bahnhofstrasse', '购物大道', '1.5 小时'],
          ['苏黎世大教堂', 'Grossmunster', '双塔教堂与老城', '1 小时'],
          ['苏黎世湖', 'Lake Zurich', '湖畔游船', '2 小时']
        ] },
      { n: '日内瓦', en: 'Geneva', note: '国际都市与日内瓦湖', pop: '约 20 万', f: ['国际组织', '湖景', '大喷泉'],
        attrs: [
          ['大喷泉', 'Jet d Eau', '日内瓦湖地标喷泉', '1 小时'],
          ['花钟', 'Flower Clock Geneva', '植物钟', '0.5 小时'],
          ['联合国万国宫', 'Palace of Nations', '联合国欧洲总部', '2 小时']
        ] },
      { n: '琉森', en: 'Lucerne', note: '湖畔古城与雪山门户', pop: '约 8 万', f: ['湖景', '老城', '雪山'],
        attrs: [
          ['卡佩尔桥', 'Chapel Bridge', '木桥与八角水塔', '1 小时'],
          ['琉森湖游船', 'Lake Lucerne cruise', '湖区游船', '2 小时'],
          ['垂死狮子像', 'Lion Monument', '狮子纪念碑', '0.5 小时']
        ] },
      { n: '因特拉肯', en: 'Interlaken', note: '户外运动与少女峰门户', pop: '约 6 万', f: ['户外运动', '少女峰', '滑翔伞'],
        attrs: [
          ['少女峰', 'Jungfraujoch', '欧洲之巅观景台', '1 天'],
          ['哈德库尔姆观景台', 'Harder Kulm', '两湖观景台', '2 小时'],
          ['布里恩茨湖', 'Lake Brienz', '绿松石湖泊', '半天']
        ] },
      { n: '伯尔尼', en: 'Bern', note: '首都与中世纪老城', pop: '约 14 万', f: ['世界遗产老城', '熊苑', '联邦大厦'],
        attrs: [
          ['钟楼', 'Zytglogge', '中世纪天文钟塔', '1 小时'],
          ['联邦国会大厦', 'Federal Palace Bern', '瑞士议会建筑', '1.5 小时'],
          ['伯尔尼熊苑', 'BarenPark Bern', '城市熊苑', '1 小时']
        ] },
      { n: '采尔马特', en: 'Zermatt', note: '马特洪峰山麓小镇', pop: '约 6 千', f: ['雪山', '滑雪', '无车小镇'],
        attrs: [
          ['马特洪峰', 'Matterhorn', '标志性尖峰', '1 天'],
          ['戈尔内格拉特', 'Gornergrat', '观景台与徒步', '半天'],
          ['采尔马特小镇', 'Zermatt village', '无车高山小镇', '2 小时']
        ] },
      { n: '洛桑', en: 'Lausanne', note: '湖畔文化与奥运之都', pop: '约 14 万', f: ['奥运博物馆', '湖景', '美食'],
        attrs: [
          ['奥林匹克博物馆', 'Olympic Museum Lausanne', '奥运主题博物馆', '2 小时'],
          ['洛桑大教堂', 'Lausanne Cathedral', '哥特式大教堂', '1 小时'],
          ['乌希码头', 'Ouchy', '湖畔码头', '1.5 小时']
        ] }
    ]
  }
,
  {

    id: 'nl', cn: '荷兰', en: 'Netherlands', flag: 'nl.svg', region: 'EUROPE',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带海洋性气候，四季温和多雨', bestSeason: '4–5 月（郁金香）与 6–9 月',
    location: '位于欧洲西北部，莱茵河入海口',
    seasons: { spring: '郁金香花田', summer: '运河游船与海滩', autumn: '博物馆与红叶', winter: '圣诞市场与运河灯光' },
    imgEn: 'Amsterdam canals Netherlands',
    cities: [
      { n: '阿姆斯特丹', en: 'Amsterdam', note: '运河之都与自由文化', pop: '约 87 万', f: ['运河', '博物馆', '自行车'],
        attrs: [
          ['运河带', 'Amsterdam canal ring', '环状运河与船屋', '2 小时'],
          ['梵高博物馆', 'Van Gogh Museum', '梵高作品收藏', '2 小时'],
          ['安妮之家', 'Anne Frank House', '二战历史纪念馆', '1.5 小时']
        ] },
      { n: '鹿特丹', en: 'Rotterdam', note: '现代建筑之港', pop: '约 65 万', f: ['现代建筑', '港口', '设计'],
        attrs: [
          ['方块屋', 'Cube Houses', '倾斜立方体建筑', '1 小时'],
          ['市场大厅', 'Markthal Rotterdam', '拱形美食市场', '1.5 小时'],
          ['欧洲桅杆', 'Euromast', '城市观景塔', '1.5 小时']
        ] },
      { n: '海牙', en: 'The Hague', note: '政治中心与海滨', pop: '约 54 万', f: ['国际法院', '海滨', '博物馆'],
        attrs: [
          ['和平宫', 'Peace Palace', '国际法院所在地', '1.5 小时'],
          ['莫瑞泰斯美术馆', 'Mauritshuis', '戴珍珠耳环少女藏馆', '2 小时'],
          ['席凡宁根海滩', 'Scheveningen', '北海海滨度假区', '2 小时']
        ] },
      { n: '乌得勒支', en: 'Utrecht', note: '大学城与运河码头', pop: '约 36 万', f: ['学府', '运河', '老城'],
        attrs: [
          ['主教塔', 'Dom Tower Utrecht', '荷兰最高教堂塔', '1.5 小时'],
          ['运河码头', 'Oudegracht', '双层运河码头街', '1.5 小时'],
          ['米菲博物馆', 'Nijntje Museum', '米菲兔主题博物馆', '1.5 小时']
        ] },
      { n: '代尔夫特', en: 'Delft', note: '蓝陶与运河小镇', pop: '约 10 万', f: ['蓝陶', '运河小镇', '慢旅行'],
        attrs: [
          ['代尔夫特新教堂', 'Nieuwe Kerk Delft', '皇家教堂与塔楼', '1.5 小时'],
          ['皇家代尔夫特蓝陶工厂', 'Royal Delft', '蓝陶工坊参观', '1.5 小时'],
          ['运河街区', 'Delft canals', '运河与老城漫步', '1.5 小时']
        ] },
      { n: '埃因霍温', en: 'Eindhoven', note: '设计与科技之城', pop: '约 23 万', f: ['设计', '科技', '夜生活'],
        attrs: [
          ['飞利浦博物馆', 'Philips Museum', '电子工业历史', '1.5 小时'],
          ['斯特莱普S', 'Strijp-S', '创意园区', '1.5 小时'],
          ['埃因霍温灯塔', 'Eindhoven light tower', '城市地标灯塔', '1 小时']
        ] }
    ]
  },
  {
    id: 'se', cn: '瑞典', en: 'Sweden', flag: 'se.svg', region: 'EUROPE',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带气候，冬季寒冷，夏季凉爽', bestSeason: '5–9 月（夏季）',
    location: '位于北欧斯堪的纳维亚半岛东部',
    seasons: { spring: '老城与群岛初春', summer: '极昼、群岛与仲夏节', autumn: '森林与极光前奏', winter: '极光、滑雪与冰雪酒店' },
    imgEn: 'Stockholm Sweden Gamla Stan',
    cities: [
      { n: '斯德哥尔摩', en: 'Stockholm', note: '北方威尼斯，群岛之都', pop: '约 98 万', f: ['群岛', '博物馆', '设计'],
        attrs: [
          ['老城', 'Gamla Stan', '中世纪老城与王宫', '2 小时'],
          ['瓦萨博物馆', 'Vasa Museum', '17 世纪战舰', '2 小时'],
          ['斯德哥尔摩市政厅', 'Stockholm City Hall', '诺贝尔晚宴场地', '1.5 小时']
        ] },
      { n: '哥德堡', en: 'Gothenburg', note: '西岸港口与美食', pop: '约 58 万', f: ['港口', '海鲜', '设计'],
        attrs: [
          ['里瑟本游乐园', 'Liseberg', '北欧大型游乐园', '半天'],
          ['鱼教堂市场', 'Feskekorka', '海鲜市场', '1 小时'],
          ['哥德堡艺术博物馆', 'Gothenburg Museum of Art', '北欧艺术收藏', '1.5 小时']
        ] },
      { n: '马尔默', en: 'Malmo', note: '南部都市与厄勒海峡', pop: '约 34 万', f: ['现代建筑', '海峡', '多元文化'],
        attrs: [
          ['旋转大厦', 'Turning Torso', '扭曲摩天楼', '1 小时'],
          ['厄勒海峡大桥', 'Oresund Bridge', '跨海大桥', '1 小时'],
          ['老城广场', 'Stortorget Malmo', '城市中心广场', '1 小时']
        ] },
      { n: '乌普萨拉', en: 'Uppsala', note: '大学城与维京历史', pop: '约 23 万', f: ['学府', '维京历史', '慢生活'],
        attrs: [
          ['乌普萨拉大教堂', 'Uppsala Cathedral', '北欧最大教堂', '1.5 小时'],
          ['乌普萨拉大学', 'Uppsala University', '北欧最古老大学', '1.5 小时'],
          ['古斯塔维纳姆博物馆', 'Gustavianum', '大学博物馆', '1 小时']
        ] },
      { n: '维斯比', en: 'Visby', note: '中世纪老城与玫瑰', pop: '约 2.5 万', f: ['世界遗产', '中世纪', '海岛'],
        attrs: [
          ['维斯比古城墙', 'Visby city wall', '中世纪城墙', '1.5 小时'],
          ['维斯比大教堂', 'Visby Cathedral', '哥特式教堂', '1 小时'],
          ['哥特兰博物馆', 'Gotland Museum', '维京与中世纪文物', '1.5 小时']
        ] },
      { n: '林雪平', en: 'Linkoping', note: '科技与航空之城', pop: '约 16 万', f: ['科技', '航空博物馆', '老城'],
        attrs: [
          ['瑞典空军博物馆', 'Swedish Air Force Museum', '航空主题博物馆', '2 小时'],
          ['老城区', 'Gamla Linkoping', '露天老城街区', '1.5 小时'],
          ['大教堂', 'Linkoping Cathedral', '哥特式教堂', '1 小时']
        ] }
    ]
  },
  {
    id: 'no', cn: '挪威', en: 'Norway', flag: 'no.svg', region: 'EUROPE',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带与亚寒带气候，冬季寒冷', bestSeason: '5–9 月（峡湾季）',
    location: '位于北欧，西临大西洋与挪威海',
    seasons: { spring: '峡湾苏醒与瀑布', summer: '峡湾游船与极昼', autumn: '秋色与三文鱼', winter: '极光与滑雪' },
    imgEn: 'Geirangerfjord Norway',
    cities: [
      { n: '奥斯陆', en: 'Oslo', note: '首都与峡湾门户', pop: '约 70 万', f: ['现代建筑', '博物馆', '峡湾'],
        attrs: [
          ['奥斯陆歌剧院', 'Oslo Opera House', '海滨白色建筑', '1.5 小时'],
          ['维格兰雕塑公园', 'Vigeland Park', '人生主题雕塑', '2 小时'],
          ['阿克斯胡斯城堡', 'Akershus Fortress', '海滨古堡', '1.5 小时']
        ] },
      { n: '卑尔根', en: 'Bergen', note: '峡湾之都与彩色木屋', pop: '约 28 万', f: ['峡湾', '彩色木屋', '海鲜'],
        attrs: [
          ['布吕根', 'Bryggen', '彩色木屋世界遗产', '1.5 小时'],
          ['弗洛伊恩山', 'Floyen', '缆车观景', '2 小时'],
          ['卑尔根鱼市', 'Bergen Fish Market', '港口海鲜市场', '1.5 小时']
        ] },
      { n: '特罗姆瑟', en: 'Tromso', note: '北极圈极光之城', pop: '约 8 万', f: ['极光', '北极圈', '观鲸'],
        attrs: [
          ['北极大教堂', 'Arctic Cathedral', '三角形现代教堂', '1 小时'],
          ['斯托尔斯蒂恩山缆车', 'Fjellheisen', '城市观景缆车', '2 小时'],
          ['极光观测', 'Northern Lights Tromso', '冬季极光之旅', '半天']
        ] },
      { n: '斯塔万格', en: 'Stavanger', note: '石油之城与布道石', pop: '约 14 万', f: ['布道石', '石油博物馆', '老城'],
        attrs: [
          ['布道石', 'Preikestolen', '吕瑟峡湾悬崖', '1 天'],
          ['挪威石油博物馆', 'Norwegian Petroleum Museum', '能源主题博物馆', '1.5 小时'],
          ['斯塔万格老城', 'Gamle Stavanger', '白色木屋老城', '1.5 小时']
        ] },
      { n: '罗弗敦', en: 'Lofoten', note: '北极渔村群岛', pop: '约 2.4 万', f: ['极光', '渔村', '徒步'],
        attrs: [
          ['雷讷渔村', 'Reine', '世界级渔村景观', '半天'],
          ['亨宁斯维尔足球场', 'Henningsvaer football field', '海中足球场', '1 小时'],
          ['罗弗敦冲浪', 'Unstad Beach', '北极冲浪海滩', '2 小时']
        ] },
      { n: '奥勒松', en: 'Alesund', note: '新艺术风格海滨小镇', pop: '约 4 万', f: ['新艺术建筑', '峡湾', '观景'],
        attrs: [
          ['阿克斯拉观景台', 'Aksla viewpoint', '城市全景观景台', '1.5 小时'],
          ['新艺术中心', 'Jugendstilsenteret', '新艺术建筑博物馆', '1.5 小时'],
          ['大西洋之路', 'Atlantic Ocean Road', '海上公路景观', '半天']
        ] }
    ]
  }
,
  {

    id: 'dk', cn: '丹麦', en: 'Denmark', flag: 'dk.svg', region: 'EUROPE',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带海洋性气候，温和湿润', bestSeason: '5–9 月（夏季）',
    location: '位于北欧，日德兰半岛与众多岛屿组成',
    seasons: { spring: '城市花园与骑行', summer: '海滩与仲夏节', autumn: '设计展与红叶', winter: '圣诞市场与烛光' },
    imgEn: 'Copenhagen Nyhavn Denmark',
    cities: [
      { n: '哥本哈根', en: 'Copenhagen', note: '设计之都与幸福城市', pop: '约 64 万', f: ['设计', '骑行', '新北欧美食'],
        attrs: [
          ['新港', 'Nyhavn', '彩色港口街区', '1.5 小时'],
          ['小美人鱼雕像', 'The Little Mermaid', '滨海地标雕像', '1 小时'],
          ['蒂沃利乐园', 'Tivoli Gardens', '历史游乐园', '半天']
        ] },
      { n: '奥胡斯', en: 'Aarhus', note: '第二大城市与文化之都', pop: '约 28 万', f: ['博物馆', '大学城', '海滨'],
        attrs: [
          ['老城博物馆', 'Den Gamle By', '露天城市博物馆', '2 小时'],
          ['ARoS 艺术博物馆', 'ARoS Aarhus', '彩虹全景走廊', '2 小时'],
          ['奥胡斯大教堂', 'Aarhus Cathedral', '丹麦最长教堂', '1 小时']
        ] },
      { n: '欧登塞', en: 'Odense', note: '安徒生故乡', pop: '约 20 万', f: ['童话文化', '老城', '慢生活'],
        attrs: [
          ['安徒生博物馆', 'Hans Christian Andersen Museum', '童话作家生平', '2 小时'],
          ['安徒生故居', 'Andersen childhood home', '作家童年小屋', '1 小时'],
          ['欧登塞动物园', 'Odense Zoo', '家庭动物园', '2 小时']
        ] },
      { n: '奥尔堡', en: 'Aalborg', note: '北部活力城市', pop: '约 11 万', f: ['海滨', '现代建筑', '夜生活'],
        attrs: [
          ['乌松中心', 'Utzon Center', '悉尼歌剧院建筑师作品', '1.5 小时'],
          ['老城街区', 'Aalborg old town', '木屋老城', '1.5 小时'],
          ['林峡湾', 'Limfjord', '海峡滨水区', '1.5 小时']
        ] },
      { n: '比隆', en: 'Billund', note: '乐高乐园所在地', pop: '约 6.6 万', f: ['乐高乐园', '家庭亲子'],
        attrs: [
          ['乐高乐园', 'LEGO House', '乐高主题乐园', '半天'],
          ['乐高之家', 'LEGOLAND Billund', '乐高体验中心', '半天'],
          ['乐高酒店', 'LEGOLAND Hotel', '主题酒店', '1 小时']
        ] },
      { n: '罗斯基勒', en: 'Roskilde', note: '维京历史之城', pop: '约 5 万', f: ['维京船博物馆', '大教堂', '音乐节'],
        attrs: [
          ['维京船博物馆', 'Viking Ship Museum', '出土维京长船', '2 小时'],
          ['罗斯基勒大教堂', 'Roskilde Cathedral', '皇室安葬大教堂', '1.5 小时'],
          ['罗斯基勒音乐节', 'Roskilde Festival', '北欧音乐节', '1 天']
        ] }
    ]
  },
  {
    id: 'fi', cn: '芬兰', en: 'Finland', flag: 'fi.svg', region: 'EUROPE',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带与亚寒带气候，冬季严寒漫长', bestSeason: '6–8 月（夏季）与 12–3 月（极光）',
    location: '位于北欧，东邻俄罗斯，西临波的尼亚湾',
    seasons: { spring: '湖泊与森林初春', summer: '极昼、湖区与桑拿', autumn: '秋色与浆果', winter: '极光、圣诞老人与雪村' },
    imgEn: 'Helsinki Finland cathedral',
    cities: [
      { n: '赫尔辛基', en: 'Helsinki', note: '设计、建筑与群岛之都', pop: '约 66 万', f: ['设计', '建筑', '桑拿'],
        attrs: [
          ['赫尔辛基大教堂', 'Helsinki Cathedral', '白色教堂与广场', '1.5 小时'],
          ['岩石教堂', 'Temppeliaukio Church', '岩洞中的教堂', '1 小时'],
          ['芬兰堡', 'Suomenlinna', '海上要塞世界遗产', '3 小时']
        ] },
      { n: '坦佩雷', en: 'Tampere', note: '湖畔工业转型之城', pop: '约 24 万', f: ['湖畔', '工业遗产', '博物馆'],
        attrs: [
          ['坦佩雷大教堂', 'Tampere Cathedral', '民族浪漫主义教堂', '1 小时'],
          ['萨卡昆塔观景塔', 'Pyynikki Observation Tower', '湖区观景与甜甜圈', '1.5 小时'],
          ['芬兰蒸汽船博物馆', 'Sarkanniemi', '湖区游乐园', '半天']
        ] },
      { n: '图尔库', en: 'Turku', note: '历史古城与群岛门户', pop: '约 19 万', f: ['中世纪古城', '群岛', '城堡'],
        attrs: [
          ['图尔库城堡', 'Turku Castle', '中世纪城堡', '2 小时'],
          ['图尔库大教堂', 'Turku Cathedral', '芬兰国家圣殿', '1 小时'],
          ['奥拉河畔', 'Aurajoki riverfront', '河畔老城漫步', '1.5 小时']
        ] },
      { n: '罗瓦涅米', en: 'Rovaniemi', note: '圣诞老人故乡与北极圈', pop: '约 6 万', f: ['圣诞老人村', '极光', '驯鹿'],
        attrs: [
          ['圣诞老人村', 'Santa Claus Village', '北极圈圣诞主题村', '3 小时'],
          ['北极圈线', 'Arctic Circle line', '跨越北极圈标志', '1 小时'],
          ['驯鹿农场', 'reindeer farm Rovaniemi', '驯鹿雪橇体验', '2 小时']
        ] },
      { n: '波尔沃', en: 'Porvoo', note: '木屋老城与巧克力', pop: '约 5 万', f: ['木屋老城', '慢旅行', '咖啡'],
        attrs: [
          ['波尔沃老城', 'Porvoo Old Town', '红色木屋老城', '2 小时'],
          ['波尔沃大教堂', 'Porvoo Cathedral', '老城大教堂', '1 小时'],
          ['Brunberg 巧克力店', 'Brunberg candy shop', '百年巧克力工坊', '1 小时']
        ] },
      { n: '奥卢', en: 'Oulu', note: '北部科技城市', pop: '约 20 万', f: ['科技', '河畔', '极光门户'],
        attrs: [
          ['奥卢市场大厅', 'Oulu Market Hall', '百年市场', '1 小时'],
          ['奥卢城堡公园', 'Oulu Castle Park', '河畔城堡遗址公园', '1.5 小时'],
          ['北极光观测', 'Northern lights Oulu', '冬季极光体验', '半天']
        ] }
    ]
  },
  {
    id: 'ie', cn: '爱尔兰', en: 'Ireland', flag: 'ie.svg', region: 'EUROPE',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带海洋性气候，温和湿润', bestSeason: '5–9 月（夏季）',
    location: '位于欧洲西北部爱尔兰岛',
    seasons: { spring: '绿野与城市', summer: '海岸与节庆', autumn: '文学与威士忌', winter: '酒吧文化与圣诞' },
    imgEn: 'Dublin Ireland Trinity College',
    cities: [
      { n: '都柏林', en: 'Dublin', note: '文学与酒吧文化之都', pop: '约 55 万', f: ['文学', '酒吧', '学府'],
        attrs: [
          ['圣三一学院', 'Trinity College Dublin', '学府与凯尔斯之书', '2 小时'],
          ['都柏林城堡', 'Dublin Castle', '历史城堡与花园', '1.5 小时'],
          ['健力士仓库', 'Guinness Storehouse', '啤酒博物馆', '2 小时']
        ] },
      { n: '科克', en: 'Cork', note: '美食与河畔之城', pop: '约 21 万', f: ['美食', '河畔', '市场'],
        attrs: [
          ['英国市场', 'English Market Cork', '传统食品市场', '1.5 小时'],
          ['圣芬巴尔大教堂', 'Saint Fin Barre Cathedral', '哥特式大教堂', '1 小时'],
          ['科克市政厅', 'Cork City Hall', '河畔市政建筑', '1 小时']
        ] },
      { n: '高威', en: 'Galway', note: '艺术与音乐之城', pop: '约 8 万', f: ['音乐节', '海滨', '艺术'],
        attrs: [
          ['西班牙拱门', 'Spanish Arch', '中世纪城墙拱门', '1 小时'],
          ['盐山散步道', 'Salthill Promenade', '海滨步道', '1.5 小时'],
          ['莫赫悬崖', 'Cliffs of Moher', '大西洋悬崖（近郊）', '半天']
        ] },
      { n: '利默里克', en: 'Limerick', note: '历史与河畔城市', pop: '约 9 万', f: ['城堡', '河畔', '慢生活'],
        attrs: [
          ['约翰王城堡', 'King Johns Castle', '中世纪城堡', '2 小时'],
          ['亨特博物馆', 'Hunt Museum', '艺术文物收藏', '1.5 小时'],
          ['香农河畔', 'River Shannon', '河畔步道', '1.5 小时']
        ] },
      { n: '基拉尼', en: 'Killarney', note: '国家公园门户小镇', pop: '约 1.5 万', f: ['国家公园', '湖泊', '徒步'],
        attrs: [
          ['基拉尼国家公园', 'Killarney National Park', '湖泊与森林公园', '半天'],
          ['罗斯城堡', 'Ross Castle', '湖畔古堡', '1.5 小时'],
          ['莫克罗丝修道院', 'Muckross Abbey', '森林修道院遗迹', '1 小时']
        ] },
      { n: '沃特福德', en: 'Waterford', note: '水晶与海港城市', pop: '约 5 万', f: ['水晶工艺', '海港', '老城'],
        attrs: [
          ['沃特福德水晶工厂', 'House of Waterford Crystal', '水晶吹制工坊', '2 小时'],
          ['摄政塔', 'Reginald Tower', '中世纪塔楼', '1 小时'],
          ['沃特福德博物馆', 'Waterford Museum', '城市历史博物馆', '1.5 小时']
        ] }
    ]
  }
,
  {

    id: 'at', cn: '奥地利', en: 'Austria', flag: 'at.svg', region: 'EUROPE',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带大陆性气候，冬季寒冷多雪', bestSeason: '5–9 月与 12–3 月（滑雪）',
    location: '位于中欧阿尔卑斯山区',
    seasons: { spring: '音乐之都与花园', summer: '湖区与徒步', autumn: '咖啡与艺术季', winter: '滑雪与圣诞市场' },
    imgEn: 'Vienna Austria Schonbrunn',
    cities: [
      { n: '维也纳', en: 'Vienna', note: '音乐之都与帝国遗产', pop: '约 190 万', f: ['音乐', '咖啡文化', '宫殿'],
        attrs: [
          ['美泉宫', 'Schonbrunn Palace', '哈布斯堡夏宫与花园', '半天'],
          ['斯蒂芬大教堂', 'St Stephens Cathedral', '哥特式地标教堂', '1.5 小时'],
          ['维也纳国家歌剧院', 'Vienna State Opera', '世界级歌剧院', '1.5 小时']
        ] },
      { n: '萨尔茨堡', en: 'Salzburg', note: '莫扎特故乡与要塞', pop: '约 15 万', f: ['音乐', '要塞', '老城'],
        attrs: [
          ['萨尔茨堡要塞', 'Hohensalzburg Fortress', '山顶古要塞', '2 小时'],
          ['莫扎特故居', 'Mozart Residence', '音乐家故居', '1.5 小时'],
          ['米拉贝尔宫', 'Mirabell Palace', '音乐之声取景花园', '1 小时']
        ] },
      { n: '因斯布鲁克', en: 'Innsbruck', note: '阿尔卑斯山城', pop: '约 13 万', f: ['滑雪', '山景', '水晶'],
        attrs: [
          ['黄金屋顶', 'Golden Roof', '城市地标金色屋顶', '1 小时'],
          ['北链山缆车', 'Nordkette', '城市直达雪山缆车', '半天'],
          ['施华洛世奇水晶世界', 'Swarovski Kristallwelten', '水晶艺术博物馆', '2 小时']
        ] },
      { n: '格拉茨', en: 'Graz', note: '联合国遗产老城', pop: '约 29 万', f: ['老城', '现代艺术', '大学城'],
        attrs: [
          ['钟楼', 'Uhrturm Graz', '老城地标钟楼', '1 小时'],
          ['格拉茨城堡山', 'Schlossberg', '山顶观景与步道', '1.5 小时'],
          ['格拉茨艺术馆', 'Kunsthaus Graz', '外星船造型建筑', '1.5 小时']
        ] },
      { n: '哈尔施塔特', en: 'Hallstatt', note: '湖畔童话小镇', pop: '约 800', f: ['湖景', '盐矿', '摄影'],
        attrs: [
          ['哈尔施塔特湖', 'Hallstatter See', '高山湖泊小镇全景', '2 小时'],
          ['盐矿', 'Hallstatt Salt Mine', '千年盐矿探险', '2 小时'],
          ['人骨教堂', 'Karner Hallstatt', '小型人骨礼拜堂', '1 小时']
        ] },
      { n: '林茨', en: 'Linz', note: '多瑙河畔科技艺术城', pop: '约 20 万', f: ['科技艺术', '河畔', '美食'],
        attrs: [
          ['林茨电子艺术中心', 'Ars Electronica Center', '科技艺术博物馆', '2 小时'],
          ['林茨主广场', 'Hauptplatz Linz', '老城中心广场', '1 小时'],
          ['多瑙河畔', 'Danube riverbank Linz', '河畔步道', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'be', cn: '比利时', en: 'Belgium', flag: 'be.svg', region: 'EUROPE',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带海洋性气候，温和湿润', bestSeason: '4–6 月与 9–10 月',
    location: '位于欧洲西北部，与法国、荷兰、德国相邻',
    seasons: { spring: '城市漫步与巧克力', summer: '啤酒节与海滨', autumn: '博物馆与美食', winter: '圣诞市场与热巧' },
    imgEn: 'Brussels Belgium Grand Place',
    cities: [
      { n: '布鲁塞尔', en: 'Brussels', note: '欧盟之都与巧克力', pop: '约 120 万', f: ['欧盟中心', '巧克力', '大广场'],
        attrs: [
          ['大广场', 'Grand Place Brussels', '世界遗产金饰广场', '1.5 小时'],
          ['原子球塔', 'Atomium', '现代地标建筑', '2 小时'],
          ['圣米歇尔圣古都勒大教堂', 'Cathedral of St Michel', '哥特式大教堂', '1 小时']
        ] },
      { n: '布鲁日', en: 'Bruges', note: '中世纪运河之城', pop: '约 12 万', f: ['运河', '中世纪', '蕾丝'],
        attrs: [
          ['布鲁日钟楼', 'Belfry of Bruges', '老城钟楼登顶', '1.5 小时'],
          ['运河游船', 'Bruges canal cruise', '中世纪运河游船', '1 小时'],
          ['圣血圣殿', 'Basilica of the Holy Blood', '圣血教堂', '1 小时']
        ] },
      { n: '安特卫普', en: 'Antwerp', note: '钻石与时尚之港', pop: '约 52 万', f: ['钻石', '时尚', '港口'],
        attrs: [
          ['安特卫普圣母教堂', 'Cathedral of Our Lady Antwerp', '哥特式大教堂', '1.5 小时'],
          ['中央车站', 'Antwerp Central Station', '百年火车站', '1 小时'],
          ['MAS 博物馆', 'Museum aan de Stroom', '河畔现代博物馆', '2 小时']
        ] },
      { n: '根特', en: 'Ghent', note: '大学城与中世纪', pop: '约 26 万', f: ['学府', '中世纪建筑', '美食'],
        attrs: [
          ['圣巴沃大教堂', 'Saint Bavo Cathedral', '神秘羔羊之爱藏馆', '1.5 小时'],
          ['根特钟楼', 'Belfry of Ghent', '老城钟楼', '1 小时'],
          ['伯爵城堡', 'Gravensteen', '中世纪水城城堡', '2 小时']
        ] },
      { n: '列日', en: 'Liege', note: '东部城市与市场', pop: '约 20 万', f: ['市场', '老城', '美食'],
        attrs: [
          ['列日大教堂', 'Liege Cathedral', '圣保罗大教堂', '1 小时'],
          ['布埃伦山', 'Montagne de Bueren', '374 级台阶观景', '1 小时'],
          ['列日市场', 'La Batte Market', '周日河边集市', '1.5 小时']
        ] },
      { n: '那慕尔', en: 'Namur', note: '瓦隆区首府与城堡', pop: '约 11 万', f: ['城堡', '河畔', '慢生活'],
        attrs: [
          ['那慕尔城堡', 'Citadel of Namur', '山丘古堡', '2 小时'],
          ['圣欧班大教堂', 'Saint-Aubins Cathedral', '老城大教堂', '1 小时'],
          ['桑布尔河畔', 'Sambre riverfront', '河畔漫步', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'pl', cn: '波兰', en: 'Poland', flag: 'pl.svg', region: 'EUROPE',
    costTier: 'low', visaMode: 'visa', visaPeriod: '10–15 个工作日', visaStay: '30–90 天',
    climate: '温带大陆性气候，四季分明', bestSeason: '5–9 月（夏季）',
    location: '位于中欧，北临波罗的海',
    seasons: { spring: '老城与公园', summer: '湖区与波罗的海', autumn: '红叶与历史', winter: '圣诞市场与滑雪' },
    imgEn: 'Warsaw Poland old town',
    cities: [
      { n: '华沙', en: 'Warsaw', note: '首都与重生之城', pop: '约 179 万', f: ['老城', '博物馆', '都市生活'],
        attrs: [
          ['华沙老城', 'Warsaw Old Town', '重建的世界遗产老城', '2 小时'],
          ['皇家城堡', 'Royal Castle Warsaw', '老城王宫', '1.5 小时'],
          ['科学文化宫', 'Palace of Culture and Science', '城市地标建筑', '1.5 小时']
        ] },
      { n: '克拉科夫', en: 'Krakow', note: '文化古都与学府', pop: '约 77 万', f: ['老城', '大学城', '历史'],
        attrs: [
          ['中央集市广场', 'Main Market Square Krakow', '欧洲最大中世纪广场', '2 小时'],
          ['瓦维尔城堡', 'Wawel Castle', '王室城堡与大教堂', '2 小时'],
          ['圣玛丽教堂', 'St Marys Basilica', '哥特式教堂与号声', '1 小时']
        ] },
      { n: '格但斯克', en: 'Gdansk', note: '波罗的海港口与琥珀', pop: '约 47 万', f: ['港口', '琥珀', '老城'],
        attrs: [
          ['长街', 'Dluga Street', '老城主街与市政厅', '1.5 小时'],
          ['格但斯克起重机', 'Gdansk Crane', '港口中世纪起重机', '1 小时'],
          ['莫特拉瓦河畔', 'Motlawa riverfront', '河畔彩色建筑', '1.5 小时']
        ] },
      { n: '弗罗茨瓦夫', en: 'Wroclaw', note: '河上之城与百桥', pop: '约 64 万', f: ['桥', '小矮人', '大学城'],
        attrs: [
          ['中央广场', 'Rynek Wroclaw', '彩色老城广场', '1.5 小时'],
          ['小矮人铜像', 'Wroclaw dwarfs', '城市小铜像寻宝', '1.5 小时'],
          ['弗罗茨瓦夫大学', 'University of Wroclaw', '巴洛克大学建筑', '1.5 小时']
        ] },
      { n: '波兹南', en: 'Poznan', note: '贸易与历史之城', pop: '约 53 万', f: ['老城广场', '贸易', '美食'],
        attrs: [
          ['老城广场', 'Poznan Old Market Square', '彩色市政厅广场', '1.5 小时'],
          ['波兹南大教堂', 'Poznan Cathedral', '奥斯特鲁姆岛大教堂', '1 小时'],
          ['帝国城堡', 'Imperial Castle Poznan', '20 世纪初城堡', '1.5 小时']
        ] },
      { n: '卡托维兹', en: 'Katowice', note: '上西里西亚文化城', pop: '约 29 万', f: ['音乐', '工业转型', '现代建筑'],
        attrs: [
          ['西里西亚博物馆', 'Silesian Museum', '工业遗产改造博物馆', '2 小时'],
          ['卡托维兹音乐厅', 'Narodowa Orkiestra Symfoniczna', '现代音乐厅', '1.5 小时'],
          ['斯波德克体育馆', 'Spodek', '飞碟造型场馆', '1 小时']
        ] }
    ]
  }
,
  {

    id: 'us', cn: '美国', en: 'United States', flag: 'us.svg', region: 'NORTH AMERICA',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–20 个工作日（面签约期另计）', visaStay: 'B1/B2 多次往返，单次最长 180 天',
    climate: '气候多样：东部四季分明，西部干燥，南部温暖，北部寒冷', bestSeason: '5–10 月（多数地区）',
    location: '位于北美洲中部，东临大西洋，西临太平洋',
    seasons: { spring: '国家公园与城市樱花', summer: '公路旅行与海滨', autumn: '秋叶与音乐节', winter: '滑雪与城市灯光' },
    imgEn: 'New York City Manhattan skyline',
    cities: [
      { n: '纽约', en: 'New York City', note: '世界都市，百老汇与天际线', pop: '约 830 万', f: ['国际化都市', '艺术', '购物'],
        attrs: [
          ['时代广场', 'Times Square', '霓虹中心广场', '1.5 小时'],
          ['中央公园', 'Central Park', '城市绿肺', '2 小时'],
          ['自由女神像', 'Statue of Liberty', '纽约港自由象征', '2 小时']
        ] },
      { n: '洛杉矶', en: 'Los Angeles', note: '好莱坞与海滩之城', pop: '约 390 万', f: ['好莱坞', '海滩', '主题乐园'],
        attrs: [
          ['好莱坞标志', 'Hollywood Sign', '山间电影地标', '1 小时'],
          ['圣莫尼卡码头', 'Santa Monica Pier', '海滨码头游乐园', '2 小时'],
          ['格里菲斯天文台', 'Griffith Observatory', '城市观景天文台', '2 小时']
        ] },
      { n: '旧金山', en: 'San Francisco', note: '金门大桥与湾区科技', pop: '约 87 万', f: ['地标大桥', '湾区', '多元文化'],
        attrs: [
          ['金门大桥', 'Golden Gate Bridge', '红色悬索桥地标', '1.5 小时'],
          ['渔人码头', 'Fishermans Wharf', '海滨码头与海狮', '1.5 小时'],
          ['九曲花街', 'Lombard Street', '弯曲花园街道', '1 小时']
        ] },
      { n: '西雅图', en: 'Seattle', note: '咖啡与科技之城', pop: '约 73 万', f: ['科技', '咖啡', '雨城'],
        attrs: [
          ['太空针塔', 'Space Needle', '城市地标观景塔', '1.5 小时'],
          ['派克市场', 'Pike Place Market', '海鲜市场与咖啡起源', '2 小时'],
          ['奇胡利玻璃艺术馆', 'Chihuly Garden and Glass', '玻璃艺术展', '1.5 小时']
        ] },
      { n: '迈阿密', en: 'Miami', note: '热带海滨与拉丁风情', pop: '约 44 万', f: ['海滩', '拉丁文化', '夜生活'],
        attrs: [
          ['南海滩', 'South Beach Miami', '装饰艺术海滩区', '2 小时'],
          ['小哈瓦那', 'Little Havana', '古巴风情街区', '1.5 小时'],
          ['维兹卡亚花园博物馆', 'Vizcaya Museum', '海滨庄园博物馆', '2 小时']
        ] },
      { n: '拉斯维加斯', en: 'Las Vegas', note: '娱乐之都与沙漠奇迹', pop: '约 65 万', f: ['娱乐', '酒店', '演出'],
        attrs: [
          ['拉斯维加斯大道', 'Las Vegas Strip', '霓虹酒店大道', '2 小时'],
          ['贝拉吉奥喷泉', 'Bellagio Fountains', '音乐喷泉秀', '1 小时'],
          ['胡佛水坝', 'Hoover Dam', '近郊工程奇观', '半天']
        ] },
      { n: '波士顿', en: 'Boston', note: '学府之城与历史', pop: '约 68 万', f: ['大学城', '历史', '体育'],
        attrs: [
          ['自由之路', 'Freedom Trail', '历史遗址步行线', '2 小时'],
          ['波士顿公共花园', 'Boston Public Garden', '城市公园', '1 小时'],
          ['哈佛大学', 'Harvard University', '世界学府（近郊）', '2 小时']
        ] },
      { n: '芝加哥', en: 'Chicago', note: '建筑之都与湖滨', pop: '约 270 万', f: ['建筑', '湖滨', '美食'],
        attrs: [
          ['云门', 'Cloud Gate', '大豆子雕塑', '1 小时'],
          ['威利斯大厦观景台', 'Skydeck Chicago', '玻璃悬空观景台', '1.5 小时'],
          ['千禧公园', 'Millennium Park', '湖畔公园', '1.5 小时']
        ] },
      { n: '华盛顿', en: 'Washington DC', note: '首都与博物馆群', pop: '约 70 万', f: ['白宫', '博物馆', '纪念碑'],
        attrs: [
          ['国家广场', 'National Mall', '纪念碑与博物馆大道', '2 小时'],
          ['美国国会大厦', 'US Capitol', '国会建筑', '1.5 小时'],
          ['林肯纪念堂', 'Lincoln Memorial', '纪念堂与倒影池', '1 小时']
        ] },
      { n: '檀香山', en: 'Honolulu', note: '夏威夷海岛度假', pop: '约 35 万', f: ['海岛', '威基基海滩', '冲浪'],
        attrs: [
          ['威基基海滩', 'Waikiki Beach', '世界著名海滩', '2 小时'],
          ['钻石头山', 'Diamond Head', '火山口徒步观景', '2 小时'],
          ['珍珠港纪念馆', 'Pearl Harbor', '历史纪念馆', '2 小时']
        ] },
      { n: '丹佛', en: 'Denver', note: '落基山门户', pop: '约 72 万', f: ['山地户外', '啤酒', '高原'],
        attrs: [
          ['丹佛艺术博物馆', 'Denver Art Museum', '现代建筑博物馆', '2 小时'],
          ['红岩剧场', 'Red Rocks Amphitheatre', '天然岩石剧场', '1.5 小时'],
          ['丹佛联合车站', 'Union Station Denver', '历史车站街区', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'ca', cn: '加拿大', en: 'Canada', flag: 'ca.svg', region: 'NORTH AMERICA',
    costTier: 'high', visaMode: 'visa', visaPeriod: '10–20 个工作日', visaStay: '多次往返，单次最长 180 天',
    climate: '四季分明，冬季寒冷，夏季温和', bestSeason: '6–9 月（户外）与 12–3 月（滑雪）',
    location: '位于北美洲北部，是世界面积第二大国',
    seasons: { spring: '樱花与城市', summer: '国家公园与湖泊', autumn: '枫叶季', winter: '滑雪与极光' },
    imgEn: 'Banff Canada lake louise',
    cities: [
      { n: '多伦多', en: 'Toronto', note: '最大城市与多元文化', pop: '约 293 万', f: ['国际化都市', '多元文化', 'CN 塔'],
        attrs: [
          ['CN 塔', 'CN Tower', '城市地标观景塔', '1.5 小时'],
          ['尼亚加拉大瀑布', 'Niagara Falls', '跨国瀑布（近郊）', '半天'],
          ['多伦多群岛', 'Toronto Islands', '湖心岛与城市天际线', '2 小时']
        ] },
      { n: '温哥华', en: 'Vancouver', note: '山海相依的宜居都市', pop: '约 68 万', f: ['山海', '户外', '美食'],
        attrs: [
          ['史丹利公园', 'Stanley Park', '城市森林与海堤', '2 小时'],
          ['卡皮拉诺吊桥', 'Capilano Suspension Bridge', '森林吊桥', '2 小时'],
          ['格兰维尔岛', 'Granville Island', '市场与艺术区', '1.5 小时']
        ] },
      { n: '蒙特利尔', en: 'Montreal', note: '法式风情与节庆之都', pop: '约 178 万', f: ['法式文化', '音乐节', '老城'],
        attrs: [
          ['蒙特利尔老城', 'Old Montreal', '法式老城与港口', '2 小时'],
          ['圣母大教堂', 'Notre-Dame Basilica', '金碧辉煌教堂', '1.5 小时'],
          ['皇家山', 'Mount Royal', '城市观景山丘', '2 小时']
        ] },
      { n: '卡尔加里', en: 'Calgary', note: '牛仔之城与落基山门户', pop: '约 133 万', f: ['牛仔节', '落基山', '能源'],
        attrs: [
          ['卡尔加里牛仔节', 'Calgary Stampede', '世界牛仔节（7 月）', '1 天'],
          ['卡尔加里塔', 'Calgary Tower', '城市观景塔', '1 小时'],
          ['斯蒂芬大道', 'Stephen Avenue', '步行购物街', '1.5 小时']
        ] },
      { n: '渥太华', en: 'Ottawa', note: '首都与运河之城', pop: '约 101 万', f: ['国会', '博物馆', '运河'],
        attrs: [
          ['国会山', 'Parliament Hill', '哥特式国会建筑', '2 小时'],
          ['里多运河', 'Rideau Canal', '冬季溜冰世界遗产', '1.5 小时'],
          ['加拿大国家美术馆', 'National Gallery of Canada', '玻璃穹顶美术馆', '2 小时']
        ] },
      { n: '班夫', en: 'Banff', note: '落基山脉度假小镇', pop: '约 1 万', f: ['国家公园', '徒步', '滑雪'],
        attrs: [
          ['班夫国家公园', 'Banff National Park', '落基山脉国家公园', '1 天'],
          ['路易斯湖', 'Lake Louise', '冰川湖与城堡酒店', '2 小时'],
          ['硫磺山缆车', 'Banff Gondola', '小镇观景缆车', '2 小时']
        ] },
      { n: '魁北克城', en: 'Quebec City', note: '北美最古老法式城市', pop: '约 54 万', f: ['古城', '城堡酒店', '枫叶'],
        attrs: [
          ['芳堤娜城堡酒店', 'Chateau Frontenac', '地标城堡酒店', '1 小时'],
          ['小香普兰街', 'Quartier Petit Champlain', '鹅卵石老城街区', '1.5 小时'],
          ['星形城堡', 'Citadelle of Quebec', '山丘军事城堡', '1.5 小时']
        ] },
      { n: '哈利法克斯', en: 'Halifax', note: '大西洋海港城市', pop: '约 43 万', f: ['海港', '龙虾', '历史'],
        attrs: [
          ['哈利法克斯海港', 'Halifax Waterfront', '海港木栈道', '1.5 小时'],
          ['城堡山', 'Citadel Hill Halifax', '星形堡垒', '1.5 小时'],
          ['佩吉湾', 'Peggy Cove', '灯塔海岬（近郊）', '2 小时']
        ] },
      { n: '维多利亚', en: 'Victoria BC', note: '花园城市与英式风情', pop: '约 38 万', f: ['花园', '英式建筑', '海边'],
        attrs: [
          ['布查特花园', 'Butchart Gardens', '世界级花园', '2 小时'],
          ['省议会大厦', 'BC Parliament Buildings', '英式议会建筑', '1 小时'],
          ['渔人码头', 'Fisherman Wharf Victoria', '彩色浮屋码头', '1.5 小时']
        ] }
    ]
  }
,
  {

    id: 'au', cn: '澳大利亚', en: 'Australia', flag: 'au.svg', region: 'OCEANIA',
    costTier: 'high', visaMode: 'evisa', visaPeriod: '电子签证 1–3 周', visaStay: '3–12 个月',
    climate: '四季与北半球相反；北部热带，南部温带', bestSeason: '9–11 月与 3–5 月（春秋）',
    location: '位于南半球大洋洲，独占澳洲大陆',
    seasons: { spring: '野花与城市', summer: '海滩与圣诞盛夏', autumn: '酒庄与红叶', winter: '北部热带与滑雪' },
    imgEn: 'Sydney Opera House',
    cities: [
      { n: '悉尼', en: 'Sydney', note: '海港之都与歌剧院', pop: '约 530 万', f: ['海港', '地标建筑', '海滩'],
        attrs: [
          ['悉尼歌剧院', 'Sydney Opera House', '世界遗产建筑地标', '2 小时'],
          ['海港大桥', 'Sydney Harbour Bridge', '攀桥与海港景观', '1.5 小时'],
          ['邦迪海滩', 'Bondi Beach', '冲浪海滩', '2 小时']
        ] },
      { n: '墨尔本', en: 'Melbourne', note: '咖啡与艺术文化之都', pop: '约 500 万', f: ['咖啡', '艺术', '体育'],
        attrs: [
          ['联邦广场', 'Federation Square', '现代广场地标', '1.5 小时'],
          ['大洋路', 'Great Ocean Road', '十二门徒海岸公路', '1 天'],
          ['维多利亚女王市场', 'Queen Victoria Market', '百年露天市场', '2 小时']
        ] },
      { n: '布里斯班', en: 'Brisbane', note: '阳光之城与河畔', pop: '约 250 万', f: ['阳光', '河畔', '近海'],
        attrs: [
          ['南岸公园', 'South Bank Brisbane', '河畔公园与泳池', '2 小时'],
          ['故事桥', 'Story Bridge', '城市地标桥', '1 小时'],
          ['龙柏考拉保护区', 'Lone Pine Koala Sanctuary', '考拉与袋鼠', '2 小时']
        ] },
      { n: '珀斯', en: 'Perth', note: '西澳阳光海岸', pop: '约 210 万', f: ['阳光', '海滩', '罗特尼斯岛'],
        attrs: [
          ['国王公园', 'Kings Park', '城市公园与天际线', '2 小时'],
          ['科茨洛海滩', 'Cottesloe Beach', '日落海滩', '2 小时'],
          ['罗特尼斯岛', 'Rottnest Island', '短尾矮袋鼠岛', '1 天']
        ] },
      { n: '黄金海岸', en: 'Gold Coast', note: '主题乐园与冲浪海岸', pop: '约 65 万', f: ['冲浪', '主题乐园', '度假'],
        attrs: [
          ['冲浪者天堂', 'Surfers Paradise', '冲浪海滩与高层建筑', '2 小时'],
          ['华纳兄弟电影世界', 'Warner Bros Movie World', '电影主题乐园', '半天'],
          ['库兰加塔海滩', 'Coolangatta', '南端海滩', '2 小时']
        ] },
      { n: '凯恩斯', en: 'Cairns', note: '大堡礁门户', pop: '约 15 万', f: ['大堡礁', '雨林', '潜水'],
        attrs: [
          ['大堡礁游船', 'Great Barrier Reef Cairns', '世界最大珊瑚礁', '1 天'],
          ['库兰达雨林缆车', 'Skyrail Rainforest Cableway', '雨林缆车', '半天'],
          ['埃斯普拉纳德海滨', 'Cairns Esplanade', '海滨步道与泳池', '1.5 小时']
        ] },
      { n: '阿德莱德', en: 'Adelaide', note: '酒庄与节庆之城', pop: '约 140 万', f: ['酒庄', '节庆', '慢生活'],
        attrs: [
          ['阿德莱德山', 'Adelaide Hills', '酒庄与田园', '半天'],
          ['巴罗萨谷', 'Barossa Valley', '葡萄酒产区', '1 天'],
          ['阿德莱德中央市场', 'Adelaide Central Market', '美食市场', '1.5 小时']
        ] },
      { n: '霍巴特', en: 'Hobart', note: '塔斯马尼亚首府', pop: '约 24 万', f: ['自然', '海鲜', '历史'],
        attrs: [
          ['萨拉曼卡广场', 'Salamanca Place', '乔治亚建筑市场', '2 小时'],
          ['威灵顿山', 'Mount Wellington', '城市观景山', '2 小时'],
          ['古今艺术博物馆', 'MONA', '现代艺术博物馆', '2 小时']
        ] },
      { n: '达尔文', en: 'Darwin', note: '北领地热带门户', pop: '约 15 万', f: ['热带', '鳄鱼', '原住民文化'],
        attrs: [
          ['明迪尔海滩日落市场', 'Mindil Beach Sunset Market', '夜市与日落', '2 小时'],
          ['卡卡杜国家公园', 'Kakadu National Park', '湿地与岩画（近郊）', '1 天'],
          ['鳄鱼湾', 'Crocosaurus Cove', '城市鳄鱼体验', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'nz', cn: '新西兰', en: 'New Zealand', flag: 'nz.svg', region: 'OCEANIA',
    costTier: 'high', visaMode: 'evisa', visaPeriod: '电子签证 1–3 周', visaStay: '3–9 个月',
    climate: '温带海洋性气候，四季温和', bestSeason: '11–4 月（夏季）',
    location: '位于南太平洋，由北岛与南岛组成',
    seasons: { spring: '樱花与牧场', summer: '湖泊与徒步', autumn: '金色山谷与酒庄', winter: '滑雪与星空' },
    imgEn: 'Queenstown New Zealand lake',
    cities: [
      { n: '奥克兰', en: 'Auckland', note: '帆船之都与最大城市', pop: '约 170 万', f: ['海港', '帆船', '多元文化'],
        attrs: [
          ['天空塔', 'Sky Tower Auckland', '城市地标观景塔', '1.5 小时'],
          ['使命湾', 'Mission Bay', '海滨街区', '2 小时'],
          ['怀希基岛', 'Waiheke Island', '酒庄与海滩岛屿', '1 天']
        ] },
      { n: '皇后镇', en: 'Queenstown', note: '冒险与湖景之都', pop: '约 1.7 万', f: ['极限运动', '湖景', '滑雪'],
        attrs: [
          ['瓦卡蒂普湖', 'Lake Wakatipu', '冰川湖泊', '2 小时'],
          ['天空缆车', 'Skyline Queenstown', '湖景缆车与滑板车', '2 小时'],
          ['米尔福德峡湾', 'Milford Sound', '世界遗产峡湾（近郊）', '1 天']
        ] },
      { n: '基督城', en: 'Christchurch', note: '花园城市与南岛门户', pop: '约 39 万', f: ['花园', '重建活力', '艺术'],
        attrs: [
          ['植物园', 'Christchurch Botanic Gardens', '城市花园', '2 小时'],
          ['纸板大教堂', 'Cardboard Cathedral', '重建临时教堂', '1 小时'],
          ['基督城电车', 'Christchurch Tram', '老城观光电车', '1.5 小时']
        ] },
      { n: '惠灵顿', en: 'Wellington', note: '风都与电影文化', pop: '约 21 万', f: ['电影', '咖啡', '博物馆'],
        attrs: [
          ['蒂帕帕国家博物馆', 'Te Papa', '国家博物馆', '2 小时'],
          ['缆车', 'Wellington Cable Car', '城市观景缆车', '1.5 小时'],
          ['维塔工作室', 'Weta Workshop', '电影特效工作室', '2 小时']
        ] },
      { n: '罗托鲁瓦', en: 'Rotorua', note: '地热与毛利文化', pop: '约 6 万', f: ['地热', '毛利文化', '温泉'],
        attrs: [
          ['蒂普亚地热村', 'Te Puia', '间歇泉与毛利工艺', '2 小时'],
          ['怀奥塔普地热世界', 'Wai-O-Tapu', '彩色地热池', '2 小时'],
          ['波利尼西亚温泉', 'Polynesian Spa', '湖畔温泉', '2 小时']
        ] },
      { n: '陶朗加', en: 'Tauranga', note: '阳光海港城市', pop: '约 15 万', f: ['海滩', '港口', '果园'],
        attrs: [
          ['芒格努伊山', 'Mount Maunganui', '海滩与火山丘', '2 小时'],
          ['陶朗加海滨', 'Tauranga waterfront', '海港步道', '1.5 小时'],
          ['霍比特人村', 'Hobbiton Movie Set', '电影取景地（近郊）', '3 小时']
        ] },
      { n: '纳皮尔', en: 'Napier', note: '装饰艺术之城', pop: '约 6 万', f: ['装饰艺术', '葡萄酒', '海岸'],
        attrs: [
          ['装饰艺术街区', 'Napier Art Deco', '1930 年代建筑群', '2 小时'],
          ['海洋步道', 'Napier Marine Parade', '海滨步道', '1.5 小时'],
          ['霍克湾酒庄', 'Hawkes Bay wineries', '葡萄酒产区', '半天']
        ] }
    ]
  },
  {
    id: 'br', cn: '巴西', en: 'Brazil', flag: 'br.svg', region: 'SOUTH AMERICA',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–20 个工作日', visaStay: '30–90 天',
    climate: '热带气候为主，全年温暖', bestSeason: '12–3 月（夏季/狂欢节）',
    location: '位于南美洲东部，是南美最大国家',
    seasons: { spring: '城市与海滩', summer: '狂欢节与海滨', autumn: '瀑布与雨林', winter: '南部凉爽与温泉' },
    imgEn: 'Rio de Janeiro Christ the Redeemer',
    cities: [
      { n: '里约热内卢', en: 'Rio de Janeiro', note: '基督像与狂欢节之城', pop: '约 670 万', f: ['海滩', '狂欢节', '足球'],
        attrs: [
          ['基督救世主像', 'Christ the Redeemer', '山巅巨型雕像', '2 小时'],
          ['科帕卡巴纳海滩', 'Copacabana Beach', '新月形海滩', '2 小时'],
          ['面包山', 'Sugarloaf Mountain', '海湾观景缆车', '2 小时']
        ] },
      { n: '圣保罗', en: 'Sao Paulo', note: '南美经济中心', pop: '约 1230 万', f: ['经济中心', '艺术', '美食'],
        attrs: [
          ['圣保罗艺术博物馆', 'MASP', '悬挑建筑美术馆', '2 小时'],
          ['伊比拉普埃拉公园', 'Ibirapuera Park', '城市公园', '2 小时'],
          ['保利斯塔大道', 'Paulista Avenue', '城市大道', '1.5 小时']
        ] },
      { n: '萨尔瓦多', en: 'Salvador', note: '非洲文化传承之城', pop: '约 290 万', f: ['历史城区', '非洲文化', '音乐'],
        attrs: [
          ['佩洛尼奥', 'Pelourinho', '彩色历史城区', '2 小时'],
          ['圣弗朗西斯科教堂', 'Church of Sao Francisco', '黄金装饰教堂', '1 小时'],
          ['邦芬教堂', 'Bonfim Church', '彩带许愿教堂', '1 小时']
        ] },
      { n: '伊瓜苏', en: 'Iguazu', note: '瀑布之城', pop: '约 26 万', f: ['大瀑布', '自然', '生态'],
        attrs: [
          ['伊瓜苏瀑布', 'Iguazu Falls', '世界最大瀑布群', '1 天'],
          ['鸟园', 'Parque das Aves', '热带鸟类公园', '2 小时'],
          ['三国界碑', 'Three Borders Landmark', '三国交界地标', '1 小时']
        ] },
      { n: '巴西利亚', en: 'Brasilia', note: '现代规划首都', pop: '约 300 万', f: ['现代建筑', '世界遗产', '政治中心'],
        attrs: [
          ['大教堂', 'Cathedral of Brasilia', '皇冠造型教堂', '1 小时'],
          ['三权广场', 'Praca dos Tres Poderes', '政府建筑群', '1.5 小时'],
          ['JK 纪念堂', 'JK Memorial', '总统纪念建筑', '1 小时']
        ] },
      { n: '福塔莱萨', en: 'Fortaleza', note: '东北海岸度假城', pop: '约 270 万', f: ['海滩', '帆板', '夜生活'],
        attrs: [
          ['伊拉斯米纳海滩', 'Praia de Iracema', '城市海滩与灯塔', '1.5 小时'],
          ['穆库里佩海滩', 'Praia do Mucuripe', '渔港海滩', '1.5 小时'],
          ['市场大楼', 'Mercado Central Fortaleza', '手工艺市场', '1 小时']
        ] },
      { n: '库里蒂巴', en: 'Curitiba', note: '绿色环保之城', pop: '约 190 万', f: ['环保公交', '公园', '宜居'],
        attrs: [
          ['植物园', 'Jardim Botanico de Curitiba', '玻璃温室花园', '1.5 小时'],
          ['奥斯卡尼迈耶博物馆', 'Museu Oscar Niemeyer', '眼睛造型博物馆', '1.5 小时'],
          ['市政公园', 'Parque Barigui', '城市公园', '1.5 小时']
        ] }
    ]
  },
  {
    id: 'za', cn: '南非', en: 'South Africa', flag: 'za.svg', region: 'AFRICA',
    costTier: 'mid', visaMode: 'visa', visaPeriod: '10–20 个工作日', visaStay: '30–90 天',
    climate: '地中海气候与亚热带气候并存', bestSeason: '5–10 月（观兽季）',
    location: '位于非洲大陆最南端，三面环海',
    seasons: { spring: '花海与城市', summer: '海滩与观兽', autumn: '酒庄与温和天气', winter: '观兽季与鲸鱼' },
    imgEn: 'Cape Town Table Mountain',
    cities: [
      { n: '开普敦', en: 'Cape Town', note: '桌山脚下的彩虹之城', pop: '约 43 万', f: ['桌山', '海滩', '酒庄'],
        attrs: [
          ['桌山', 'Table Mountain', '平顶山与缆车', '半天'],
          ['好望角', 'Cape of Good Hope', '非洲大陆西南角', '3 小时'],
          ['维多利亚码头', 'V&A Waterfront', '海滨码头区', '2 小时']
        ] },
      { n: '约翰内斯堡', en: 'Johannesburg', note: '经济中心与金矿之城', pop: '约 570 万', f: ['经济中心', '博物馆', '曼德拉足迹'],
        attrs: [
          ['宪法山', 'Constitution Hill', '历史法院与博物馆', '2 小时'],
          ['曼德拉故居', 'Mandela House', '索韦托故居博物馆', '2 小时'],
          ['种族隔离博物馆', 'Apartheid Museum', '历史主题博物馆', '2 小时']
        ] },
      { n: '德班', en: 'Durban', note: '印度洋海岸城市', pop: '约 390 万', f: ['海滩', '印度文化', '冲浪'],
        attrs: [
          ['黄金一英里', 'Golden Mile Durban', '海滨步道', '2 小时'],
          ['摩西马布海达球场', 'Moses Mabhida Stadium', '拱门观景缆车', '1.5 小时'],
          ['德班植物园', 'Durban Botanic Gardens', '老植物园', '1.5 小时']
        ] },
      { n: '斯泰伦博斯', en: 'Stellenbosch', note: '葡萄酒庄园小镇', pop: '约 15 万', f: ['酒庄', '大学城', '美食'],
        attrs: [
          ['橡木大道', 'Oak Avenue Stellenbosch', '老城橡树大道', '1.5 小时'],
          ['酒庄品鉴', 'Stellenbosch wine farms', '葡萄酒庄园', '半天'],
          ['乡村博物馆', 'Village Museum', '历史民居博物馆', '1.5 小时']
        ] },
      { n: '克鲁格', en: 'Kruger National Park', note: '野生动物保护区门户', pop: '—', f: ['观兽', '自然', '奢华营地'],
        attrs: [
          ['五大兽游猎', 'Big Five safari', '非洲五霸观兽', '1 天'],
          ['萨比沙保护区', 'Sabi Sand Game Reserve', '私人保护区营地', '1 天'],
          ['布莱德河峡谷', 'Blyde River Canyon', '世界第三大峡谷', '半天']
        ] },
      { n: '太阳城', en: 'Sun City', note: '度假综合体与失落之城', pop: '—', f: ['度假', '主题乐园', '高尔夫'],
        attrs: [
          ['失落之城', 'Palace of the Lost City', '主题宫殿度假村', '2 小时'],
          ['水上乐园', 'Valley of Waves', '波浪泳池乐园', '半天'],
          ['皮拉内斯堡保护区', 'Pilanesberg Game Reserve', '火山口保护区', '1 天']
        ] }
    ]
  }
];

/* ---------- 预算 / 签证 / 内容生成（与图片独立） ---------- */
const BUDGET = {
  high: {
    economy: { name: '经济型', items: { 住宿: '500–900 元/晚', 交通: '80–150 元/天', 餐饮: '200–350 元/天', 门票: '60–120 元/天' }, daily: '约 1000–1600 元/天' },
    standard: { name: '普通型', items: { 住宿: '900–1600 元/晚', 交通: '120–250 元/天', 餐饮: '350–600 元/天', 门票: '100–200 元/天' }, daily: '约 1800–3000 元/天' },
    premium: { name: '高品质', items: { 住宿: '1800 元+/晚', 交通: '300 元+/天', 餐饮: '700 元+/天', 门票: '200 元+/天' }, daily: '约 3500 元+/天' }
  },
  mid: {
    economy: { name: '经济型', items: { 住宿: '300–600 元/晚', 交通: '50–100 元/天', 餐饮: '150–250 元/天', 门票: '40–80 元/天' }, daily: '约 600–1000 元/天' },
    standard: { name: '普通型', items: { 住宿: '600–1200 元/晚', 交通: '80–160 元/天', 餐饮: '250–450 元/天', 门票: '60–120 元/天' }, daily: '约 1200–2200 元/天' },
    premium: { name: '高品质', items: { 住宿: '1300 元+/晚', 交通: '200 元+/天', 餐饮: '500 元+/天', 门票: '150 元+/天' }, daily: '约 2600 元+/天' }
  },
  low: {
    economy: { name: '经济型', items: { 住宿: '150–350 元/晚', 交通: '30–60 元/天', 餐饮: '80–150 元/天', 门票: '20–50 元/天' }, daily: '约 300–600 元/天' },
    standard: { name: '普通型', items: { 住宿: '350–700 元/晚', 交通: '50–100 元/天', 餐饮: '150–280 元/天', 门票: '40–80 元/天' }, daily: '约 650–1200 元/天' },
    premium: { name: '高品质', items: { 住宿: '800 元+/晚', 交通: '120 元+/天', 餐饮: '300 元+/天', 门票: '100 元+/天' }, daily: '约 1500 元+/天' }
  }
};

function visaRec(c) {
  const base = { type: '旅游签证', suitable: '短期旅行者', period: c.visaPeriod, stay: c.visaStay, conditions: ['有效护照', '财力证明', '行程计划', '住宿证明', '往返安排'] };
  if (c.visaMode === 'visa-free') return { ...base, type: '免签（短期）', period: '无需提前办理', conditions: ['有效护照', '往返机票', '住宿安排'] };
  if (c.visaMode === 'evisa') return { ...base, type: '电子签证（在线申请）', period: c.visaPeriod, conditions: ['有效护照', '在线申请表', '行程与住宿证明', '往返机票'] };
  if (c.visaMode === 'on-arrival') return { ...base, type: '落地签', period: '抵达时办理', conditions: ['有效护照', '往返机票', '住宿安排', '照片与费用'] };
  return base;
}

function build() {
  const cities = [];
  const imageDb = [];
  let total = 0;

  COUNTRIES.forEach((c) => {
    /* 国家代表图 */
    imageDb.push({ id: c.id, type: 'country', country: c.cn, city: '', name: c.cn + ' 国家代表图', image: `assets/images/travel/country/${c.id}.jpg`, description: `${c.cn}国家代表图`, search: c.imgEn });

    c.cities.forEach((city, i) => {
      const id = `${c.id}-${String(i + 1).padStart(2, '0')}`;
      const cityImg = `assets/images/travel/city/${id}.jpg`;

      const attrs = (city.attrs || []).map((a, k) => ({
        name: a[0], intro: a[2], time: a[3],
        image: `assets/images/travel/attractions/${id}-${k + 1}.jpg`
      }));

      /* 城市实景图 */
      imageDb.push({ id: `${id}-city`, type: 'city', country: c.cn, city: city.n, name: `${c.cn}·${city.n} 城市实景图`, image: cityImg, description: city.note, search: `${city.en}, ${c.en}` });
      /* 景点实景图 */
      (city.attrs || []).forEach((a, k) => {
        imageDb.push({ id: `${id}-a${k + 1}`, type: 'attraction', country: c.cn, city: city.n, name: a[0], image: `assets/images/travel/attractions/${id}-${k + 1}.jpg`, description: a[2], search: a[1] });
      });

      const routes = [
        { name: '一日经典路线', items: [`上午 · ${attrs[0] ? attrs[0].name : city.n}核心地标`, `下午 · ${attrs[1] ? attrs[1].name : '老城街区'}`, `晚上 · ${attrs[2] ? attrs[2].name : '当地夜市/街区'}`] },
        { name: '三日深度路线', items: [`第 1 天 · ${attrs[0] ? attrs[0].name : '城市地标'} + 老城街区`, `第 2 天 · ${attrs[1] ? attrs[1].name : '博物馆'} + 当地市集与美食`, `第 3 天 · ${attrs[2] ? attrs[2].name : '城市周边'} + 观景与返程`] },
        { name: '五日沉浸路线', items: [`第 1–2 天 · 城市核心区与地标`, `第 3 天 · 城市周边一日游`, `第 4 天 · 博物馆、艺术区与特色街区`, `第 5 天 · 休闲购物与返程准备`] },
        { name: '深度旅行路线', items: [`慢节奏街区漫步与当地人生活体验`, `美食探索：市场、街头小吃与特色餐厅`, `文化体验：节庆、手工艺或演出`, `周边延伸：根据季节选择山海或乡村线路`] }
      ];

      const budgetTpl = BUDGET[c.costTier] || BUDGET.mid;
      const budget = { levels: [
        { name: budgetTpl.economy.name, daily: budgetTpl.economy.daily, items: budgetTpl.economy.items },
        { name: budgetTpl.standard.name, daily: budgetTpl.standard.daily, items: budgetTpl.standard.items },
        { name: budgetTpl.premium.name, daily: budgetTpl.premium.daily, items: budgetTpl.premium.items }
      ] };

      const suitable = [];
      if (city.f.some((x) => x.includes('国际化') || x.includes('商务'))) suitable.push('商务人士');
      if (city.f.some((x) => x.includes('适合首访') || x.includes('地标') || x.includes('都市'))) suitable.push('第一次到访' + c.cn + '的旅行者');
      if (city.f.some((x) => x.includes('美食'))) suitable.push('美食爱好者');
      if (city.f.some((x) => x.includes('历史') || x.includes('文化') || x.includes('古城') || x.includes('遗产'))) suitable.push('文化与历史爱好者');
      if (city.f.some((x) => x.includes('海滩') || x.includes('海岛') || x.includes('海滨') || x.includes('自然') || x.includes('山'))) suitable.push('自然与户外爱好者');
      if (city.f.some((x) => x.includes('家庭') || x.includes('乐园'))) suitable.push('家庭游客');
      if (city.f.some((x) => x.includes('学府') || x.includes('大学'))) suitable.push('学生与访学者');
      if (city.f.some((x) => x.includes('夜生活') || x.includes('年轻'))) suitable.push('年轻游客');
      if (city.f.some((x) => x.includes('慢') || x.includes('宁静') || x.includes('小镇'))) suitable.push('慢旅行与深度体验者');
      if (!suitable.length) suitable.push('各类旅行者');

      cities.push({
        id,
        country: { id: c.id, cn: c.cn, en: c.en, flag: c.flag },
        city: city.n,
        description: `${city.n}是${c.cn}${city.note}，人口${city.pop || '以当地统计为准'}。作为${city.f.join('、')}的代表城市，这里兼具城市活力与旅行体验，适合从一日到多日的不同行程安排。`,
        population: city.pop || '以当地统计为准',
        features: city.f,
        location: c.location,
        climate: c.climate,
        bestSeason: c.bestSeason,
        seasonTips: c.seasons,
        attractions: attrs,
        routes,
        budget,
        suitable,
        visaRecommendation: visaRec(c),
        relatedProjects: [`${c.id}-work-highskill`, `${c.id}-edu-master`, `${c.id}-pr-apply`],
        image: cityImg
      });
      total++;
    });
  });

  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(path.join(DATA, 'cities.json'), JSON.stringify(cities, null, 2));
  fs.writeFileSync(path.join(DATA, 'cities.js'), '/* 全球城市探索数据库（源文件 cities.json） */\nwindow.Istra = window.Istra || {};\nIstra.cities = ' + JSON.stringify(cities) + ';\n');
  fs.writeFileSync(path.join(DATA, 'travel-images.json'), JSON.stringify(imageDb, null, 2));

  const perCountry = {};
  cities.forEach((ct) => { perCountry[ct.country.cn] = (perCountry[ct.country.cn] || 0) + 1; });
  const attrsTotal = cities.reduce((n, x) => n + x.attractions.length, 0);
  console.log('城市总数：', total);
  console.log('景点总数：', attrsTotal);
  console.log('图片条目（国家/城市/景点）：', imageDb.length);
  console.log('覆盖国家：', Object.keys(perCountry).length);
}

build();
