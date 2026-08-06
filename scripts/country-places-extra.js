/* ============================================================
   国家详情「城市与风景」补充数据（23 国 · 尚无城市探索数据）
   每国 3 个热门城市 + 3 处代表风景。
   en 字段用于 Wikimedia Commons 检索真实地点图片。
   与 30 国已有 cities.js 数据合并生成 country-places.js。
   ============================================================ */

module.exports = {
  EXTRA: [
    {
      id: 'mx', cn: '墨西哥', en: 'Mexico',
      cities: [
        { n: '墨西哥城', en: 'Mexico City', note: '首都与历史文化中心，融合阿兹特克遗迹与现代都市' },
        { n: '坎昆', en: 'Cancun', note: '加勒比海滨度假胜地，白色沙滩与珊瑚海' },
        { n: '瓜达拉哈拉', en: 'Guadalajara', note: '墨西哥第二大城市，玛利亚奇音乐与龙舌兰文化' }
      ],
      scenery: [
        { n: '奇琴伊察', en: 'Chichen Itza', note: '玛雅文明世界遗产，库库尔坎金字塔' },
        { n: '特奥蒂瓦坎', en: 'Teotihuacan', note: '太阳金字塔与亡灵大道所在的古城' },
        { n: '图卢姆', en: 'Tulum', note: '加勒比海岸悬崖上的玛雅遗址' }
      ]
    },
    {
      id: 'lu', cn: '卢森堡', en: 'Luxembourg',
      cities: [
        { n: '卢森堡市', en: 'Luxembourg City', note: '首都，峡谷之上的金融与历史古城' },
        { n: '阿尔泽特河畔埃施', en: 'Esch-sur-Alzette', note: '南部工业转型的多元文化城市' },
        { n: '埃希特纳赫', en: 'Echternach', note: '东部千年古城与修道院文化' }
      ],
      scenery: [
        { n: '阿道夫桥', en: 'Adolphe Bridge', note: '横跨佩特吕斯峡谷的百年拱桥' },
        { n: '博克要塞', en: 'Bock Casemates', note: '联合国教科文组织世界遗产地下要塞' },
        { n: '菲安登城堡', en: 'Vianden Castle', note: '中世纪山巅城堡，俯瞰乌尔河小镇' }
      ]
    },
    {
      id: 'cy', cn: '塞浦路斯', en: 'Cyprus',
      cities: [
        { n: '尼科西亚', en: 'Nicosia', note: '首都，地中海东部历史与商贸交汇之城' },
        { n: '利马索尔', en: 'Limassol', note: '南部海滨城市与游艇港口' },
        { n: '拉纳卡', en: 'Larnaca', note: '机场门户城市，海滨长廊与圣拉撒路教堂' }
      ],
      scenery: [
        { n: '帕福斯考古公园', en: 'Paphos Archaeological Park', note: '马赛克遗迹与希腊神话之地' },
        { n: '特罗多斯山', en: 'Troodos Mountains', note: '雪山、修道院与彩色村庄' },
        { n: '拉纳卡盐湖', en: 'Larnaca Salt Lake', note: '冬季火烈鸟栖息地' }
      ]
    },
    {
      id: 'mt', cn: '马耳他', en: 'Malta',
      cities: [
        { n: '瓦莱塔', en: 'Valletta', note: '首都，骑士团建造的巴洛克海港古城' },
        { n: '斯利马', en: 'Sliema', note: '海滨商业区与购物长廊' },
        { n: '圣朱利安斯', en: "St Julian's", note: '海湾度假区与夜生活中心' }
      ],
      scenery: [
        { n: '蓝洞', en: 'Blue Grotto Malta', note: '天然海蚀洞穴与碧蓝海水' },
        { n: '姆迪纳', en: 'Mdina', note: '中世纪“静城”，马耳他旧都' },
        { n: '大力水手村', en: 'Popeye Village', note: '电影取景地的彩色渔村' }
      ]
    },
    {
      id: 'hr', cn: '克罗地亚', en: 'Croatia',
      cities: [
        { n: '萨格勒布', en: 'Zagreb', note: '首都，中欧风情与上城历史街区' },
        { n: '杜布罗夫尼克', en: 'Dubrovnik', note: '亚得里亚海明珠，城墙环绕的古城' },
        { n: '斯普利特', en: 'Split', note: '戴克里先宫所在的达尔马提亚海港' }
      ],
      scenery: [
        { n: '杜布罗夫尼克老城', en: 'Dubrovnik Old Town', note: '世界遗产城墙与橙红屋顶' },
        { n: '普利特维采湖群', en: 'Plitvice Lakes', note: '十六湖国家公园，层层瀑布与碧湖' },
        { n: '赫瓦尔岛', en: 'Hvar Island', note: '阳光海岛，薰衣草与老城港口' }
      ]
    },
    {
      id: 'si', cn: '斯洛文尼亚', en: 'Slovenia',
      cities: [
        { n: '卢布尔雅那', en: 'Ljubljana', note: '首都，龙桥与河畔咖啡馆的绿色之城' },
        { n: '马里博尔', en: 'Maribor', note: '第二大城市，葡萄园环绕的古城' },
        { n: '皮兰', en: 'Piran', note: '亚得里亚海岸的威尼斯风格小镇' }
      ],
      scenery: [
        { n: '布莱德湖', en: 'Lake Bled', note: '湖心教堂与阿尔卑斯山景' },
        { n: '波斯托伊纳溶洞', en: 'Postojna Cave', note: '欧洲著名喀斯特溶洞' },
        { n: '特里格拉夫峰', en: 'Mount Triglav', note: '斯洛文尼亚最高峰与朱利安阿尔卑斯山' }
      ]
    },
    {
      id: 'sk', cn: '斯洛伐克', en: 'Slovakia',
      cities: [
        { n: '布拉迪斯拉发', en: 'Bratislava', note: '首都，多瑙河畔的城堡与老城' },
        { n: '科希策', en: 'Kosice', note: '东部文化中心，哥特式大教堂之城' },
        { n: '波普拉德', en: 'Poprad', note: '塔特拉山门户城市' }
      ],
      scenery: [
        { n: '布拉迪斯拉发城堡', en: 'Bratislava Castle', note: '多瑙河畔的白色四塔城堡' },
        { n: '斯皮什城堡', en: 'Spiš Castle', note: '中东欧最大的中世纪城堡群之一' },
        { n: '塔特拉山', en: 'High Tatras', note: '雪山湖泊与徒步天堂' }
      ]
    },
    {
      id: 'ee', cn: '爱沙尼亚', en: 'Estonia',
      cities: [
        { n: '塔林', en: 'Tallinn', note: '首都，中世纪老城与数字创新并存' },
        { n: '塔尔图', en: 'Tartu', note: '大学城与爱沙尼亚文化摇篮' },
        { n: '派尔努', en: 'Parnu', note: '夏季海滨度假城市' }
      ],
      scenery: [
        { n: '塔林老城', en: 'Tallinn Old Town', note: '世界遗产，尖塔与石板路' },
        { n: '卡德里奥格宫', en: 'Kadriorg Palace', note: '彼得大帝为皇后修建的巴洛克宫殿' },
        { n: '萨雷马岛', en: 'Saaremaa', note: '风车与陨石坑的波罗的海大岛' }
      ]
    },
    {
      id: 'lt', cn: '立陶宛', en: 'Lithuania',
      cities: [
        { n: '维尔纽斯', en: 'Vilnius', note: '首都，巴洛克老城与活力街区' },
        { n: '考纳斯', en: 'Kaunas', note: '第二大城市，装饰艺术建筑之城' },
        { n: '克莱佩达', en: 'Klaipeda', note: '波罗的海港口城市' }
      ],
      scenery: [
        { n: '特拉凯城堡', en: 'Trakai Island Castle', note: '湖中红色城堡，立陶宛地标' },
        { n: '维尔纽斯老城', en: 'Vilnius Old Town', note: '世界遗产巴洛克古城' },
        { n: '库尔什沙嘴', en: 'Curonian Spit', note: '沙丘与松林的联合国教科文组织遗产' }
      ]
    },
    {
      id: 'lv', cn: '拉脱维亚', en: 'Latvia',
      cities: [
        { n: '里加', en: 'Riga', note: '首都，新艺术建筑与老城并存的港口' },
        { n: '尤尔马拉', en: 'Jurmala', note: '波罗的海海滨温泉度假城' },
        { n: '采西斯', en: 'Cesis', note: '中世纪城堡与山谷小镇' }
      ],
      scenery: [
        { n: '里加老城', en: 'Riga Old Town', note: '世界遗产，教堂尖塔与广场' },
        { n: '伦达尔宫', en: 'Rundale Palace', note: '拉脱维亚的“凡尔赛宫”' },
        { n: '戈雅国家公园', en: 'Gauja National Park', note: '砂岩峭壁与中世纪城堡' }
      ]
    },
    {
      id: 'ro', cn: '罗马尼亚', en: 'Romania',
      cities: [
        { n: '布加勒斯特', en: 'Bucharest', note: '首都，小巴黎与宏伟大厦并存' },
        { n: '布拉索夫', en: 'Brasov', note: '特兰西瓦尼亚的哥特式古城' },
        { n: '克卢日-纳波卡', en: 'Cluj-Napoca', note: '西北部大学城与科技中心' }
      ],
      scenery: [
        { n: '布朗城堡', en: 'Bran Castle', note: '传说中的“德古拉城堡”' },
        { n: '锡吉什瓦拉', en: 'Sighisoara', note: '中世纪要塞老城，世界遗产' },
        { n: '多瑙河三角洲', en: 'Danube Delta', note: '欧洲最大湿地与鸟类天堂' }
      ]
    },
    {
      id: 'bg', cn: '保加利亚', en: 'Bulgaria',
      cities: [
        { n: '索非亚', en: 'Sofia', note: '首都，山脚下的东正教之城' },
        { n: '普罗夫迪夫', en: 'Plovdiv', note: '欧洲最古老城市之一，罗马剧场与老城' },
        { n: '瓦尔纳', en: 'Varna', note: '黑海海滨城市与考古博物馆' }
      ],
      scenery: [
        { n: '里拉修道院', en: 'Rila Monastery', note: '保加利亚最重要的世界遗产修道院' },
        { n: '普罗夫迪夫老城', en: 'Plovdiv Old Town', note: '复兴时期彩色老屋与石板巷' },
        { n: '内塞伯尔', en: 'Nessebar', note: '黑海半岛上的千年古城' }
      ]
    },
    {
      id: 'cz', cn: '捷克', en: 'Czechia',
      cities: [
        { n: '布拉格', en: 'Prague', note: '首都，百塔之城与伏尔塔瓦河' },
        { n: '布尔诺', en: 'Brno', note: '第二大城市，现代建筑与传统市集' },
        { n: '卡罗维发利', en: 'Karlovy Vary', note: '温泉小镇与彩色回廊' }
      ],
      scenery: [
        { n: '布拉格城堡', en: 'Prague Castle', note: '世界上最大的古城堡建筑群' },
        { n: '查理大桥', en: 'Charles Bridge', note: '伏尔塔瓦河上的百年石桥与雕像' },
        { n: '克鲁姆洛夫', en: 'Cesky Krumlov', note: '蜿蜒河谷中的世界遗产小镇' }
      ]
    },
    {
      id: 'hu', cn: '匈牙利', en: 'Hungary',
      cities: [
        { n: '布达佩斯', en: 'Budapest', note: '首都，多瑙河两岸的“东欧巴黎”' },
        { n: '德布勒森', en: 'Debrecen', note: '东部大平原上的文化名城' },
        { n: '埃格尔', en: 'Eger', note: '葡萄酒与温泉的历史小镇' }
      ],
      scenery: [
        { n: '渔人堡', en: 'Fisherman Bastion', note: '俯瞰布达佩斯全景的白色观景台' },
        { n: '匈牙利国会大厦', en: 'Hungarian Parliament Building', note: '多瑙河畔的哥特复兴地标' },
        { n: '巴拉顿湖', en: 'Lake Balaton', note: '中欧最大湖泊与度假胜地' }
      ]
    },
    {
      id: 'gr', cn: '希腊', en: 'Greece',
      cities: [
        { n: '雅典', en: 'Athens', note: '首都，西方文明摇篮与卫城' },
        { n: '塞萨洛尼基', en: 'Thessaloniki', note: '北部文化中心与美食之城' },
        { n: '圣托里尼', en: 'Santorini', note: '爱琴海蓝白小镇与火山悬崖' }
      ],
      scenery: [
        { n: '雅典卫城', en: 'Acropolis of Athens', note: '帕特农神庙所在的古希腊圣地' },
        { n: '圣托里尼', en: 'Santorini', note: '爱琴海日落与蓝顶教堂' },
        { n: '德尔斐', en: 'Delphi', note: '阿波罗神谕圣地与山景' }
      ]
    },
    {
      id: 'il', cn: '以色列', en: 'Israel',
      cities: [
        { n: '特拉维夫', en: 'Tel Aviv', note: '地中海之滨的现代都市' },
        { n: '耶路撒冷', en: 'Jerusalem', note: '三大宗教圣地，老城与哭墙' },
        { n: '海法', en: 'Haifa', note: '卡梅尔山下的港口城市与巴哈伊花园' }
      ],
      scenery: [
        { n: '西墙', en: 'Western Wall Jerusalem', note: '耶路撒冷圣殿山下的千年石墙' },
        { n: '马萨达', en: 'Masada', note: '死海之滨的犹大沙漠要塞' },
        { n: '死海', en: 'Dead Sea', note: '地球最低点，漂浮体验与盐晶' }
      ]
    },
    {
      id: 'qa', cn: '卡塔尔', en: 'Qatar',
      cities: [
        { n: '多哈', en: 'Doha', note: '首都，海湾天际线与伊斯兰艺术' },
        { n: '珍珠岛', en: 'The Pearl-Qatar', note: '人工岛屿上的高端滨海社区' },
        { n: '卡塔拉文化村', en: 'Katara Cultural Village', note: '文化演出与海滨艺术区' }
      ],
      scenery: [
        { n: '伊斯兰艺术博物馆', en: 'Museum of Islamic Art Doha', note: '贝聿铭设计的海湾文化地标' },
        { n: '卡塔尔国家博物馆', en: 'National Museum of Qatar', note: '沙漠玫瑰造型的建筑杰作' },
        { n: '内海', en: 'Khor Al Adaid', note: '沙漠与海水交汇的“内海”奇景' }
      ]
    },
    {
      id: 'sa', cn: '沙特阿拉伯', en: 'Saudi Arabia',
      cities: [
        { n: '利雅得', en: 'Riyadh', note: '首都，沙漠中的摩天都市' },
        { n: '吉达', en: 'Jeddah', note: '红海门户与历史古城' },
        { n: '麦地那', en: 'Medina', note: '伊斯兰圣城与先知清真寺' }
      ],
      scenery: [
        { n: '黑格拉', en: "Hegra Mada'in Salih", note: '纳巴泰人的岩石凿刻墓群，世界遗产' },
        { n: '吉达古城', en: 'Al-Balad Jeddah', note: '珊瑚石老屋与露天市场' },
        { n: '德拉伊耶', en: 'Diriyah', note: '沙特王朝发源地，泥砖古城' }
      ]
    },
    {
      id: 'ph', cn: '菲律宾', en: 'Philippines',
      cities: [
        { n: '马尼拉', en: 'Manila', note: '首都，西班牙殖民遗产与都会活力' },
        { n: '宿务', en: 'Cebu City', note: '南部枢纽与麦哲伦十字架之城' },
        { n: '长滩岛', en: 'Boracay', note: '白沙滩与水上活动的度假天堂' }
      ],
      scenery: [
        { n: '长滩岛白沙滩', en: 'White Beach Boracay', note: '世界上最美的沙滩之一' },
        { n: '巧克力山', en: 'Chocolate Hills', note: '保和岛上的圆锥形山丘群' },
        { n: '巴纳韦梯田', en: 'Banaue Rice Terraces', note: '高山稻作梯田，世界遗产' }
      ]
    },
    {
      id: 'id', cn: '印度尼西亚', en: 'Indonesia',
      cities: [
        { n: '雅加达', en: 'Jakarta', note: '首都，东南亚商业与都会中心' },
        { n: '巴厘岛', en: 'Bali', note: '海岛度假与文化信仰交融之地' },
        { n: '日惹', en: 'Yogyakarta', note: '爪哇文化中心与寺庙之门' }
      ],
      scenery: [
        { n: '婆罗浮屠', en: 'Borobudur', note: '世界最大佛教寺庙遗迹' },
        { n: '普兰巴南', en: 'Prambanan', note: '爪哇印度教神庙群' },
        { n: '海神庙', en: 'Tanah Lot', note: '巴厘岛海中神庙与日落' }
      ]
    },
    {
      id: 'in', cn: '印度', en: 'India',
      cities: [
        { n: '新德里', en: 'New Delhi', note: '首都，莫卧儿与现代建筑并存' },
        { n: '孟买', en: 'Mumbai', note: '金融之都与宝莱坞所在' },
        { n: '斋浦尔', en: 'Jaipur', note: '粉色之城，拉贾斯坦邦门户' }
      ],
      scenery: [
        { n: '泰姬陵', en: 'Taj Mahal', note: '莫卧儿王朝的白色大理石陵墓' },
        { n: '琥珀堡', en: 'Amber Fort', note: '斋浦尔山巅的拉杰普特城堡' },
        { n: '瓦拉纳西', en: 'Varanasi', note: '恒河圣城与夜祭' }
      ]
    },
    {
      id: 'ar', cn: '阿根廷', en: 'Argentina',
      cities: [
        { n: '布宜诺斯艾利斯', en: 'Buenos Aires', note: '首都，探戈与欧式街区之城' },
        { n: '门多萨', en: 'Mendoza', note: '安第斯山麓的葡萄酒之都' },
        { n: '巴里洛切', en: 'San Carlos de Bariloche', note: '湖区度假小镇与瑞士风情' }
      ],
      scenery: [
        { n: '伊瓜苏瀑布', en: 'Iguazu Falls', note: '世界最壮观的瀑布群之一' },
        { n: '莫雷诺冰川', en: 'Perito Moreno Glacier', note: '巴塔哥尼亚仍在前进的冰川' },
        { n: '七月九日大道', en: 'Avenida 9 de Julio', note: '世界上最宽的林荫大道与方尖碑' }
      ]
    },
    {
      id: 'cl', cn: '智利', en: 'Chile',
      cities: [
        { n: '圣地亚哥', en: 'Santiago', note: '首都，雪山环绕的现代都市' },
        { n: '瓦尔帕莱索', en: 'Valparaiso', note: '山海之间的彩色涂鸦之城' },
        { n: '阿塔卡马圣佩德罗', en: 'San Pedro de Atacama', note: '沙漠小镇，观星与盐湖' }
      ],
      scenery: [
        { n: '百内国家公园', en: 'Torres del Paine', note: '巴塔哥尼亚花岗岩峰与冰川湖' },
        { n: '复活节岛', en: 'Easter Island Moai', note: '摩艾石像所在的太平洋孤岛' },
        { n: '阿塔卡马沙漠', en: 'Atacama Desert', note: '世界最干旱沙漠与月球谷' }
      ]
    }
  ]
};