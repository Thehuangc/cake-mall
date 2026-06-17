export interface DistrictItem {
  name: string
}

export interface CityItem {
  name: string
  districts: DistrictItem[]
}

export interface ProvinceItem {
  name: string
  cities: CityItem[]
}

export const regions: ProvinceItem[] = [
  {
    name: '北京市',
    cities: [
      { name: '北京市', districts: [
        { name: '东城区' }, { name: '西城区' }, { name: '朝阳区' }, { name: '丰台区' },
        { name: '石景山区' }, { name: '海淀区' }, { name: '门头沟区' }, { name: '房山区' },
        { name: '通州区' }, { name: '顺义区' }, { name: '昌平区' }, { name: '大兴区' },
        { name: '怀柔区' }, { name: '平谷区' }, { name: '密云区' }, { name: '延庆区' },
      ]},
    ],
  },
  {
    name: '上海市',
    cities: [
      { name: '上海市', districts: [
        { name: '黄浦区' }, { name: '徐汇区' }, { name: '长宁区' }, { name: '静安区' },
        { name: '普陀区' }, { name: '虹口区' }, { name: '杨浦区' }, { name: '闵行区' },
        { name: '宝山区' }, { name: '嘉定区' }, { name: '浦东新区' }, { name: '金山区' },
        { name: '松江区' }, { name: '青浦区' }, { name: '奉贤区' }, { name: '崇明区' },
      ]},
    ],
  },
  {
    name: '天津市',
    cities: [
      { name: '天津市', districts: [
        { name: '和平区' }, { name: '河东区' }, { name: '河西区' }, { name: '南开区' },
        { name: '河北区' }, { name: '红桥区' }, { name: '东丽区' }, { name: '西青区' },
        { name: '津南区' }, { name: '北辰区' }, { name: '武清区' }, { name: '宝坻区' },
        { name: '滨海新区' }, { name: '宁河区' }, { name: '静海区' }, { name: '蓟州区' },
      ]},
    ],
  },
  {
    name: '重庆市',
    cities: [
      { name: '重庆市', districts: [
        { name: '万州区' }, { name: '涪陵区' }, { name: '渝中区' }, { name: '大渡口区' },
        { name: '江北区' }, { name: '沙坪坝区' }, { name: '九龙坡区' }, { name: '南岸区' },
        { name: '北碚区' }, { name: '渝北区' }, { name: '巴南区' }, { name: '长寿区' },
        { name: '江津区' }, { name: '合川区' }, { name: '永川区' }, { name: '南川区' },
        { name: '綦江区' }, { name: '大足区' }, { name: '璧山区' }, { name: '铜梁区' },
        { name: '潼南区' }, { name: '荣昌区' }, { name: '开州区' }, { name: '梁平区' },
      ]},
    ],
  },
  {
    name: '河北省',
    cities: [
      { name: '石家庄市', districts: [
        { name: '长安区' }, { name: '桥西区' }, { name: '新华区' }, { name: '井陉矿区' },
        { name: '裕华区' }, { name: '藁城区' }, { name: '鹿泉区' }, { name: '栾城区' },
      ]},
      { name: '唐山市', districts: [
        { name: '路南区' }, { name: '路北区' }, { name: '古冶区' }, { name: '开平区' },
        { name: '丰南区' }, { name: '丰润区' }, { name: '曹妃甸区' },
      ]},
      { name: '保定市', districts: [
        { name: '竞秀区' }, { name: '莲池区' }, { name: '满城区' }, { name: '清苑区' },
        { name: '徐水区' },
      ]},
      { name: '邯郸市', districts: [
        { name: '邯山区' }, { name: '丛台区' }, { name: '复兴区' }, { name: '峰峰矿区' },
        { name: '肥乡区' }, { name: '永年区' },
      ]},
    ],
  },
  {
    name: '山西省',
    cities: [
      { name: '太原市', districts: [
        { name: '小店区' }, { name: '迎泽区' }, { name: '杏花岭区' }, { name: '尖草坪区' },
        { name: '万柏林区' }, { name: '晋源区' },
      ]},
      { name: '大同市', districts: [
        { name: '新荣区' }, { name: '平城区' }, { name: '云冈区' }, { name: '云州区' },
      ]},
    ],
  },
  {
    name: '辽宁省',
    cities: [
      { name: '沈阳市', districts: [
        { name: '和平区' }, { name: '沈河区' }, { name: '大东区' }, { name: '皇姑区' },
        { name: '铁西区' }, { name: '苏家屯区' }, { name: '浑南区' }, { name: '于洪区' },
      ]},
      { name: '大连市', districts: [
        { name: '中山区' }, { name: '西岗区' }, { name: '沙河口区' }, { name: '甘井子区' },
        { name: '旅顺口区' }, { name: '金州区' },
      ]},
    ],
  },
  {
    name: '吉林省',
    cities: [
      { name: '长春市', districts: [
        { name: '南关区' }, { name: '宽城区' }, { name: '朝阳区' }, { name: '二道区' },
        { name: '绿园区' }, { name: '双阳区' }, { name: '九台区' },
      ]},
    ],
  },
  {
    name: '黑龙江省',
    cities: [
      { name: '哈尔滨市', districts: [
        { name: '道里区' }, { name: '南岗区' }, { name: '道外区' }, { name: '平房区' },
        { name: '松北区' }, { name: '香坊区' }, { name: '呼兰区' }, { name: '阿城区' },
      ]},
    ],
  },
  {
    name: '江苏省',
    cities: [
      { name: '南京市', districts: [
        { name: '玄武区' }, { name: '秦淮区' }, { name: '建邺区' }, { name: '鼓楼区' },
        { name: '浦口区' }, { name: '栖霞区' }, { name: '雨花台区' }, { name: '江宁区' },
        { name: '六合区' }, { name: '溧水区' }, { name: '高淳区' },
      ]},
      { name: '苏州市', districts: [
        { name: '虎丘区' }, { name: '吴中区' }, { name: '相城区' }, { name: '姑苏区' },
        { name: '吴江区' }, { name: '苏州工业园区' },
      ]},
      { name: '无锡市', districts: [
        { name: '锡山区' }, { name: '惠山区' }, { name: '滨湖区' }, { name: '梁溪区' },
        { name: '新吴区' },
      ]},
      { name: '常州市', districts: [
        { name: '天宁区' }, { name: '钟楼区' }, { name: '新北区' }, { name: '武进区' },
        { name: '金坛区' },
      ]},
    ],
  },
  {
    name: '浙江省',
    cities: [
      { name: '杭州市', districts: [
        { name: '上城区' }, { name: '拱墅区' }, { name: '西湖区' }, { name: '滨江区' },
        { name: '萧山区' }, { name: '余杭区' }, { name: '富阳区' }, { name: '临安区' },
        { name: '临平区' }, { name: '钱塘区' },
      ]},
      { name: '宁波市', districts: [
        { name: '海曙区' }, { name: '江北区' }, { name: '北仑区' }, { name: '镇海区' },
        { name: '鄞州区' }, { name: '奉化区' },
      ]},
      { name: '温州市', districts: [
        { name: '鹿城区' }, { name: '龙湾区' }, { name: '瓯海区' }, { name: '洞头区' },
      ]},
      { name: '嘉兴市', districts: [
        { name: '南湖区' }, { name: '秀洲区' },
      ]},
    ],
  },
  {
    name: '安徽省',
    cities: [
      { name: '合肥市', districts: [
        { name: '瑶海区' }, { name: '庐阳区' }, { name: '蜀山区' }, { name: '包河区' },
        { name: '长丰县' }, { name: '肥东县' }, { name: '肥西县' }, { name: '庐江县' },
      ]},
      { name: '芜湖市', districts: [
        { name: '镜湖区' }, { name: '弋江区' }, { name: '鸠江区' }, { name: '湾沚区' },
        { name: '繁昌区' },
      ]},
    ],
  },
  {
    name: '福建省',
    cities: [
      { name: '福州市', districts: [
        { name: '鼓楼区' }, { name: '台江区' }, { name: '仓山区' }, { name: '马尾区' },
        { name: '晋安区' }, { name: '长乐区' },
      ]},
      { name: '厦门市', districts: [
        { name: '思明区' }, { name: '海沧区' }, { name: '湖里区' }, { name: '集美区' },
        { name: '同安区' }, { name: '翔安区' },
      ]},
      { name: '泉州市', districts: [
        { name: '鲤城区' }, { name: '丰泽区' }, { name: '洛江区' }, { name: '泉港区' },
        { name: '晋江市' }, { name: '石狮市' }, { name: '南安市' },
      ]},
      { name: '漳州市', districts: [
        { name: '芗城区' }, { name: '龙文区' }, { name: '龙海区' }, { name: '长泰区' },
      ]},
      { name: '莆田市', districts: [
        { name: '城厢区' }, { name: '涵江区' }, { name: '荔城区' }, { name: '秀屿区' },
      ]},
      { name: '三明市', districts: [
        { name: '三元区' }, { name: '沙县区' },
      ]},
      { name: '南平市', districts: [
        { name: '延平区' }, { name: '建阳区' },
      ]},
      { name: '龙岩市', districts: [
        { name: '新罗区' }, { name: '永定区' },
      ]},
      { name: '宁德市', districts: [
        { name: '蕉城区' },
      ]},
    ],
  },
  {
    name: '江西省',
    cities: [
      { name: '南昌市', districts: [
        { name: '东湖区' }, { name: '西湖区' }, { name: '青云谱区' }, { name: '青山湖区' },
        { name: '新建区' }, { name: '红谷滩区' },
      ]},
    ],
  },
  {
    name: '山东省',
    cities: [
      { name: '济南市', districts: [
        { name: '历下区' }, { name: '市中区' }, { name: '槐荫区' }, { name: '天桥区' },
        { name: '历城区' }, { name: '长清区' }, { name: '章丘区' },
      ]},
      { name: '青岛市', districts: [
        { name: '市南区' }, { name: '市北区' }, { name: '黄岛区' }, { name: '崂山区' },
        { name: '李沧区' }, { name: '城阳区' }, { name: '即墨区' },
      ]},
    ],
  },
  {
    name: '河南省',
    cities: [
      { name: '郑州市', districts: [
        { name: '中原区' }, { name: '二七区' }, { name: '管城回族区' }, { name: '金水区' },
        { name: '上街区' }, { name: '惠济区' },
      ]},
      { name: '洛阳市', districts: [
        { name: '老城区' }, { name: '西工区' }, { name: '瀍河回族区' }, { name: '涧西区' },
        { name: '洛龙区' },
      ]},
    ],
  },
  {
    name: '湖北省',
    cities: [
      { name: '武汉市', districts: [
        { name: '江岸区' }, { name: '江汉区' }, { name: '硚口区' }, { name: '汉阳区' },
        { name: '武昌区' }, { name: '青山区' }, { name: '洪山区' }, { name: '东西湖区' },
        { name: '蔡甸区' }, { name: '江夏区' }, { name: '黄陂区' }, { name: '新洲区' },
      ]},
    ],
  },
  {
    name: '湖南省',
    cities: [
      { name: '长沙市', districts: [
        { name: '芙蓉区' }, { name: '天心区' }, { name: '岳麓区' }, { name: '开福区' },
        { name: '雨花区' }, { name: '望城区' },
      ]},
    ],
  },
  {
    name: '广东省',
    cities: [
      { name: '广州市', districts: [
        { name: '荔湾区' }, { name: '越秀区' }, { name: '海珠区' }, { name: '天河区' },
        { name: '白云区' }, { name: '黄埔区' }, { name: '番禺区' }, { name: '花都区' },
        { name: '南沙区' }, { name: '从化区' }, { name: '增城区' },
      ]},
      { name: '深圳市', districts: [
        { name: '罗湖区' }, { name: '福田区' }, { name: '南山区' }, { name: '宝安区' },
        { name: '龙岗区' }, { name: '盐田区' }, { name: '龙华区' }, { name: '坪山区' },
        { name: '光明区' },
      ]},
      { name: '东莞市', districts: [
        { name: '东莞市' },
      ]},
      { name: '佛山市', districts: [
        { name: '禅城区' }, { name: '南海区' }, { name: '顺德区' }, { name: '三水区' },
        { name: '高明区' },
      ]},
      { name: '珠海市', districts: [
        { name: '香洲区' }, { name: '斗门区' }, { name: '金湾区' },
      ]},
    ],
  },
  {
    name: '广西壮族自治区',
    cities: [
      { name: '南宁市', districts: [
        { name: '兴宁区' }, { name: '青秀区' }, { name: '江南区' }, { name: '西乡塘区' },
        { name: '良庆区' }, { name: '邕宁区' },
      ]},
    ],
  },
  {
    name: '海南省',
    cities: [
      { name: '海口市', districts: [
        { name: '秀英区' }, { name: '龙华区' }, { name: '琼山区' }, { name: '美兰区' },
      ]},
      { name: '三亚市', districts: [
        { name: '海棠区' }, { name: '吉阳区' }, { name: '天涯区' }, { name: '崖州区' },
      ]},
    ],
  },
  {
    name: '四川省',
    cities: [
      { name: '成都市', districts: [
        { name: '锦江区' }, { name: '青羊区' }, { name: '金牛区' }, { name: '武侯区' },
        { name: '成华区' }, { name: '龙泉驿区' }, { name: '青白江区' }, { name: '新都区' },
        { name: '温江区' }, { name: '双流区' }, { name: '郫都区' },
      ]},
    ],
  },
  {
    name: '贵州省',
    cities: [
      { name: '贵阳市', districts: [
        { name: '南明区' }, { name: '云岩区' }, { name: '花溪区' }, { name: '乌当区' },
        { name: '白云区' }, { name: '观山湖区' },
      ]},
    ],
  },
  {
    name: '云南省',
    cities: [
      { name: '昆明市', districts: [
        { name: '五华区' }, { name: '盘龙区' }, { name: '官渡区' }, { name: '西山区' },
        { name: '东川区' }, { name: '呈贡区' },
      ]},
    ],
  },
  {
    name: '陕西省',
    cities: [
      { name: '西安市', districts: [
        { name: '新城区' }, { name: '碑林区' }, { name: '莲湖区' }, { name: '灞桥区' },
        { name: '未央区' }, { name: '雁塔区' }, { name: '阎良区' }, { name: '临潼区' },
        { name: '长安区' }, { name: '高陵区' }, { name: '鄠邑区' },
      ]},
    ],
  },
  {
    name: '甘肃省',
    cities: [
      { name: '兰州市', districts: [
        { name: '城关区' }, { name: '七里河区' }, { name: '西固区' }, { name: '安宁区' },
        { name: '红古区' },
      ]},
    ],
  },
  {
    name: '青海省',
    cities: [
      { name: '西宁市', districts: [
        { name: '城东区' }, { name: '城中区' }, { name: '城西区' }, { name: '城北区' },
      ]},
    ],
  },
  {
    name: '内蒙古自治区',
    cities: [
      { name: '呼和浩特市', districts: [
        { name: '新城区' }, { name: '回民区' }, { name: '玉泉区' }, { name: '赛罕区' },
      ]},
      { name: '包头市', districts: [
        { name: '东河区' }, { name: '昆都仑区' }, { name: '青山区' }, { name: '石拐区' },
        { name: '九原区' },
      ]},
    ],
  },
  {
    name: '西藏自治区',
    cities: [
      { name: '拉萨市', districts: [
        { name: '城关区' }, { name: '堆龙德庆区' }, { name: '达孜区' },
      ]},
    ],
  },
  {
    name: '宁夏回族自治区',
    cities: [
      { name: '银川市', districts: [
        { name: '兴庆区' }, { name: '西夏区' }, { name: '金凤区' },
      ]},
    ],
  },
  {
    name: '新疆维吾尔自治区',
    cities: [
      { name: '乌鲁木齐市', districts: [
        { name: '天山区' }, { name: '沙依巴克区' }, { name: '新市区' }, { name: '水磨沟区' },
        { name: '头屯河区' }, { name: '达坂城区' }, { name: '米东区' },
      ]},
    ],
  },
  {
    name: '台湾省',
    cities: [
      { name: '台北市', districts: [
        { name: '中正区' }, { name: '大同区' }, { name: '中山区' }, { name: '万华区' },
        { name: '信义区' }, { name: '松山区' }, { name: '大安区' }, { name: '南港区' },
        { name: '北投区' }, { name: '内湖区' }, { name: '士林区' }, { name: '文山区' },
      ]},
    ],
  },
  {
    name: '香港特别行政区',
    cities: [
      { name: '香港', districts: [
        { name: '中西区' }, { name: '湾仔区' }, { name: '东区' }, { name: '南区' },
        { name: '油尖旺区' }, { name: '深水埗区' }, { name: '九龙城区' }, { name: '黄大仙区' },
        { name: '观塘区' }, { name: '荃湾区' }, { name: '屯门区' }, { name: '元朗区' },
        { name: '北区' }, { name: '大埔区' }, { name: '沙田区' }, { name: '西贡区' },
      ]},
    ],
  },
  {
    name: '澳门特别行政区',
    cities: [
      { name: '澳门', districts: [
        { name: '花地玛堂区' }, { name: '花王堂区' }, { name: '望德堂区' }, { name: '大堂区' },
        { name: '风顺堂区' },
      ]},
    ],
  },
]
