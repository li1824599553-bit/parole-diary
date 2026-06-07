const STORAGE_KEY = "paroleMieWords";
const BACKUP_TIME_KEY = "paroleMieLastBackupAt";
const LOCAL_BEFORE_CLOUD_KEY = "paroleMieWordsBeforeCloud";
const SUPABASE_URL = "https://oqibagjbxmgtjvecbrym.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_0iENUyP41l_P0ZqD7JliCQ_uRUh40Ud";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let currentUser = null;
let isCloudLoading = false;



function today() {
  return new Date().toISOString().slice(0, 10);
}

const starterWords = [
  { italian: "litigare", chinese: "吵架", note: "Non voglio litigare con te.", wrongCount: 0, createdAt: today() },
  { italian: "trasloco", chinese: "搬家", note: "Il trasloco è stato faticoso.", wrongCount: 0, createdAt: today() },
  { italian: "nostalgia", chinese: "怀念 / 乡愁", note: "Ho nostalgia di casa.", wrongCount: 0, createdAt: today() },
  { italian: "colloquio", chinese: "面试 / 谈话", note: "Domani ho un colloquio.", wrongCount: 0, createdAt: today() },
  { italian: "presenza", chinese: "存在 / 出席", note: "La tua presenza è importante.", wrongCount: 0, createdAt: today() }
];


const builtInDictionary = {
  "fuggire": {
    "chinese": "逃跑 / 逃走 / 逃避",
    "note": "Non puoi fuggire dai tuoi problemi."
  },
  "a beneficio di": {
    "chinese": "为了……的利益 / 有利于……",
    "note": "Questa iniziativa è a beneficio degli studenti."
  },
  "litigare": {
    "chinese": "吵架 / 争吵",
    "note": "Non voglio litigare con te."
  },
  "trasloco": {
    "chinese": "搬家",
    "note": "Il trasloco è stato faticoso."
  },
  "nostalgia": {
    "chinese": "怀念 / 乡愁",
    "note": "Ho nostalgia di casa."
  },
  "colloquio": {
    "chinese": "面试 / 谈话",
    "note": "Domani ho un colloquio di lavoro."
  },
  "presenza": {
    "chinese": "存在 / 出席",
    "note": "La tua presenza è importante."
  },
  "perdita": {
    "chinese": "失去 / 损失 / 丧失",
    "note": "La perdita di tempo mi preoccupa."
  },
  "ricerca": {
    "chinese": "寻找 / 研究",
    "note": "Sto facendo una ricerca per la scuola."
  },
  "sennò": {
    "chinese": "否则 / 不然的话",
    "note": "Sbrigati, sennò faremo tardi."
  },
  "malgrado": {
    "chinese": "尽管 / 虽然",
    "note": "Malgrado la pioggia, siamo usciti."
  },
  "benché": {
    "chinese": "尽管 / 虽然",
    "note": "Benché sia stanca, continuo a studiare."
  },
  "sebbene": {
    "chinese": "尽管 / 虽然",
    "note": "Sebbene faccia freddo, esco lo stesso."
  },
  "nonostante": {
    "chinese": "尽管 / 虽然",
    "note": "Nonostante la difficoltà, non mi arrendo."
  },
  "io": {
    "chinese": "我",
    "note": "Io studio italiano ogni giorno."
  },
  "tu": {
    "chinese": "你",
    "note": "Tu parli italiano molto bene."
  },
  "lui": {
    "chinese": "他",
    "note": "Lui vive in Italia."
  },
  "lei": {
    "chinese": "她 / 您",
    "note": "Lei studia a Milano."
  },
  "noi": {
    "chinese": "我们",
    "note": "Noi andiamo a scuola."
  },
  "voi": {
    "chinese": "你们",
    "note": "Voi siete molto gentili."
  },
  "loro": {
    "chinese": "他们 / 她们",
    "note": "Loro parlano con l'insegnante."
  },
  "questo": {
    "chinese": "这个",
    "note": "Questo libro è interessante."
  },
  "questa": {
    "chinese": "这个，阴性",
    "note": "Questa parola è utile."
  },
  "quello": {
    "chinese": "那个",
    "note": "Quello zaino è mio."
  },
  "quella": {
    "chinese": "那个，阴性",
    "note": "Quella casa è bella."
  },
  "chi": {
    "chinese": "谁",
    "note": "Chi è quella persona?"
  },
  "che": {
    "chinese": "什么 / 哪个 / 关系代词",
    "note": "Che cosa fai oggi?"
  },
  "cosa": {
    "chinese": "什么 / 东西",
    "note": "Che cosa significa questa parola?"
  },
  "dove": {
    "chinese": "哪里",
    "note": "Dove abiti?"
  },
  "quando": {
    "chinese": "什么时候",
    "note": "Quando parti?"
  },
  "perché": {
    "chinese": "为什么 / 因为",
    "note": "Perché studi italiano?"
  },
  "come": {
    "chinese": "怎么样 / 如何",
    "note": "Come stai?"
  },
  "quanto": {
    "chinese": "多少",
    "note": "Quanto costa?"
  },
  "quale": {
    "chinese": "哪一个",
    "note": "Quale libro preferisci?"
  },
  "qui": {
    "chinese": "这里",
    "note": "Vieni qui, per favore."
  },
  "lì": {
    "chinese": "那里",
    "note": "Il libro è lì."
  },
  "sempre": {
    "chinese": "总是 / 一直",
    "note": "Studio sempre la sera."
  },
  "mai": {
    "chinese": "从不 / 曾经",
    "note": "Non arrivo mai in ritardo."
  },
  "spesso": {
    "chinese": "经常",
    "note": "Vado spesso al supermercato."
  },
  "raramente": {
    "chinese": "很少",
    "note": "Esco raramente la sera."
  },
  "oggi": {
    "chinese": "今天",
    "note": "Oggi ho lezione."
  },
  "domani": {
    "chinese": "明天",
    "note": "Domani vado a Milano."
  },
  "ieri": {
    "chinese": "昨天",
    "note": "Ieri ho studiato molto."
  },
  "adesso": {
    "chinese": "现在",
    "note": "Adesso sono a casa."
  },
  "ora": {
    "chinese": "小时 / 现在",
    "note": "Che ora è?"
  },
  "presto": {
    "chinese": "早 / 快",
    "note": "Arrivo presto."
  },
  "tardi": {
    "chinese": "晚 / 迟",
    "note": "Arrivo tardi."
  },
  "prima": {
    "chinese": "以前 / 之前 / 先",
    "note": "Prima faccio colazione."
  },
  "dopo": {
    "chinese": "之后 / 后来",
    "note": "Dopo studio italiano."
  },
  "già": {
    "chinese": "已经",
    "note": "Ho già mangiato."
  },
  "ancora": {
    "chinese": "还 / 仍然",
    "note": "Studio ancora."
  },
  "subito": {
    "chinese": "马上 / 立刻",
    "note": "Arrivo subito."
  },
  "insieme": {
    "chinese": "一起",
    "note": "Studiamo insieme."
  },
  "essere": {
    "chinese": "是 / 存在",
    "note": "Sono una studentessa."
  },
  "avere": {
    "chinese": "有",
    "note": "Ho una domanda."
  },
  "fare": {
    "chinese": "做",
    "note": "Faccio i compiti."
  },
  "andare": {
    "chinese": "去",
    "note": "Vado a scuola."
  },
  "venire": {
    "chinese": "来",
    "note": "Vengo da te."
  },
  "stare": {
    "chinese": "待着 / 状态是",
    "note": "Sto bene."
  },
  "potere": {
    "chinese": "能够 / 可以",
    "note": "Posso entrare?"
  },
  "dovere": {
    "chinese": "义务 / 必须",
    "note": "È un dovere importante."
  },
  "volere": {
    "chinese": "想要",
    "note": "Voglio imparare bene l'italiano."
  },
  "sapere": {
    "chinese": "知道 / 会",
    "note": "So parlare un po' italiano."
  },
  "dire": {
    "chinese": "说",
    "note": "Puoi dire questa frase?"
  },
  "parlare": {
    "chinese": "说话 / 谈论",
    "note": "Parlo italiano ogni giorno."
  },
  "chiedere": {
    "chinese": "问 / 请求",
    "note": "Chiedo aiuto all'insegnante."
  },
  "rispondere": {
    "chinese": "回答",
    "note": "Rispondo alla domanda."
  },
  "capire": {
    "chinese": "理解",
    "note": "Capisco questa frase."
  },
  "studiare": {
    "chinese": "学习",
    "note": "Studio italiano."
  },
  "leggere": {
    "chinese": "阅读",
    "note": "Leggo un libro."
  },
  "scrivere": {
    "chinese": "写",
    "note": "Scrivo una frase."
  },
  "ascoltare": {
    "chinese": "听",
    "note": "Ascolto la musica."
  },
  "guardare": {
    "chinese": "看",
    "note": "Guardo un film."
  },
  "vedere": {
    "chinese": "看见",
    "note": "Vedo una persona."
  },
  "sentire": {
    "chinese": "听见 / 感觉",
    "note": "Sento un rumore."
  },
  "mangiare": {
    "chinese": "吃",
    "note": "Mangio la pasta."
  },
  "bere": {
    "chinese": "喝",
    "note": "Bevo un caffè."
  },
  "dormire": {
    "chinese": "睡觉",
    "note": "Dormo otto ore."
  },
  "svegliarsi": {
    "chinese": "醒来",
    "note": "Mi sveglio presto."
  },
  "alzarsi": {
    "chinese": "起床 / 站起来",
    "note": "Mi alzo alle sette."
  },
  "lavarsi": {
    "chinese": "洗自己",
    "note": "Mi lavo la faccia."
  },
  "vestirsi": {
    "chinese": "穿衣服",
    "note": "Mi vesto in fretta."
  },
  "uscire": {
    "chinese": "出去 / 出门",
    "note": "Esco con gli amici."
  },
  "entrare": {
    "chinese": "进入",
    "note": "Entro in classe."
  },
  "tornare": {
    "chinese": "回来",
    "note": "Torno a casa."
  },
  "arrivare": {
    "chinese": "到达",
    "note": "Arrivo alle nove."
  },
  "partire": {
    "chinese": "出发 / 离开",
    "note": "Parto domani."
  },
  "prendere": {
    "chinese": "拿 / 乘坐 / 吃喝",
    "note": "Prendo l'autobus."
  },
  "portare": {
    "chinese": "带 / 携带",
    "note": "Porto una borsa."
  },
  "comprare": {
    "chinese": "购买",
    "note": "Compro un quaderno."
  },
  "vendere": {
    "chinese": "卖",
    "note": "Vendono frutta fresca."
  },
  "pagare": {
    "chinese": "付款",
    "note": "Pago con la carta."
  },
  "costare": {
    "chinese": "花费",
    "note": "Quanto costa questo?"
  },
  "aprire": {
    "chinese": "打开",
    "note": "Apro la finestra."
  },
  "chiudere": {
    "chinese": "关闭",
    "note": "Chiudo la porta."
  },
  "aspettare": {
    "chinese": "等待",
    "note": "Aspetto l'autobus."
  },
  "cercare": {
    "chinese": "寻找 / 尝试",
    "note": "Cerco una parola nel dizionario."
  },
  "trovare": {
    "chinese": "找到",
    "note": "Trovo una soluzione."
  },
  "perdere": {
    "chinese": "丢失 / 失去",
    "note": "Perdo le chiavi."
  },
  "vincere": {
    "chinese": "赢",
    "note": "Voglio vincere la gara."
  },
  "piacere": {
    "chinese": "喜欢 / 使喜欢",
    "note": "Mi piace il cinema."
  },
  "amare": {
    "chinese": "爱 / 喜爱",
    "note": "Amo viaggiare."
  },
  "odiare": {
    "chinese": "讨厌",
    "note": "Odio aspettare troppo."
  },
  "preferire": {
    "chinese": "更喜欢",
    "note": "Preferisco il tè al caffè."
  },
  "pensare": {
    "chinese": "想 / 认为",
    "note": "Penso a questo progetto."
  },
  "credere": {
    "chinese": "相信 / 认为",
    "note": "Credo che sia vero."
  },
  "sperare": {
    "chinese": "希望",
    "note": "Spero di passare l'esame."
  },
  "decidere": {
    "chinese": "决定",
    "note": "Decido di restare a casa."
  },
  "provare": {
    "chinese": "尝试 / 试穿 / 感受",
    "note": "Provo a parlare italiano."
  },
  "aiutare": {
    "chinese": "帮助",
    "note": "Aiuto una mia amica."
  },
  "bisognare": {
    "chinese": "需要，有必要",
    "note": "Bisogna studiare con costanza."
  },
  "servire": {
    "chinese": "需要 / 服务",
    "note": "Mi serve una penna."
  },
  "usare": {
    "chinese": "使用",
    "note": "Uso questo metodo."
  },
  "mettere": {
    "chinese": "放 / 穿戴",
    "note": "Metto il libro sul tavolo."
  },
  "rimanere": {
    "chinese": "留下 / 保持",
    "note": "Rimango a casa."
  },
  "restare": {
    "chinese": "停留 / 保持",
    "note": "Resto qui."
  },
  "vivere": {
    "chinese": "生活 / 居住",
    "note": "Vivo in Italia."
  },
  "abitare": {
    "chinese": "居住",
    "note": "Abito a Milano."
  },
  "lavorare": {
    "chinese": "工作",
    "note": "Lavoro in un ufficio."
  },
  "telefonare": {
    "chinese": "打电话",
    "note": "Telefono a mia madre."
  },
  "mandare": {
    "chinese": "发送 / 派遣",
    "note": "Mando un messaggio."
  },
  "ricevere": {
    "chinese": "收到",
    "note": "Ricevo una email."
  },
  "inviare": {
    "chinese": "发送",
    "note": "Invio il documento."
  },
  "incontrare": {
    "chinese": "遇见 / 见面",
    "note": "Incontro un amico."
  },
  "conoscere": {
    "chinese": "认识 / 了解",
    "note": "Conosco quella ragazza."
  },
  "ricordare": {
    "chinese": "记得 / 提醒",
    "note": "Ricordo questa parola."
  },
  "dimenticare": {
    "chinese": "忘记",
    "note": "Dimentico il numero."
  },
  "imparare": {
    "chinese": "学习 / 学会",
    "note": "Imparo una parola nuova."
  },
  "insegnare": {
    "chinese": "教",
    "note": "L'insegnante insegna italiano."
  },
  "spiegare": {
    "chinese": "解释",
    "note": "Puoi spiegare questa parola?"
  },
  "ripetere": {
    "chinese": "重复 / 复习",
    "note": "Ripeto la frase."
  },
  "cominciare": {
    "chinese": "开始",
    "note": "Comincio a studiare."
  },
  "iniziare": {
    "chinese": "开始",
    "note": "Inizio una nuova lezione."
  },
  "finire": {
    "chinese": "结束 / 完成",
    "note": "Finisco i compiti."
  },
  "continuare": {
    "chinese": "继续",
    "note": "Continuo a leggere."
  },
  "cambiare": {
    "chinese": "改变 / 更换",
    "note": "Cambio idea."
  },
  "diventare": {
    "chinese": "变成",
    "note": "Voglio diventare più brava."
  },
  "succedere": {
    "chinese": "发生",
    "note": "Che cosa è successo?"
  },
  "sembrare": {
    "chinese": "看起来 / 似乎",
    "note": "Sembra difficile."
  },
  "bastare": {
    "chinese": "足够",
    "note": "Basta un minuto."
  },
  "mancare": {
    "chinese": "缺少 / 想念",
    "note": "Mi manca la mia famiglia."
  },
  "accendere": {
    "chinese": "打开，点亮",
    "note": "Accendo la luce."
  },
  "spegnere": {
    "chinese": "关掉",
    "note": "Spengo il computer."
  },
  "cadere": {
    "chinese": "摔倒 / 落下",
    "note": "Sono caduta per strada."
  },
  "correre": {
    "chinese": "跑",
    "note": "Corro al parco."
  },
  "camminare": {
    "chinese": "走路",
    "note": "Cammino ogni giorno."
  },
  "nuotare": {
    "chinese": "游泳",
    "note": "Nuoto in piscina."
  },
  "viaggiare": {
    "chinese": "旅行",
    "note": "Mi piace viaggiare."
  },
  "visitare": {
    "chinese": "参观 / 拜访",
    "note": "Visito un museo."
  },
  "prenotare": {
    "chinese": "预订",
    "note": "Prenoto un tavolo."
  },
  "ordinare": {
    "chinese": "点餐 / 整理 / 命令",
    "note": "Ordino una pizza."
  },
  "cucinare": {
    "chinese": "做饭",
    "note": "Cucino la zuppa."
  },
  "pulire": {
    "chinese": "清洁",
    "note": "Pulisco la camera."
  },
  "lavare": {
    "chinese": "洗",
    "note": "Lavo i piatti."
  },
  "rompere": {
    "chinese": "打破 / 弄坏",
    "note": "Ho rotto un bicchiere."
  },
  "aggiungere": {
    "chinese": "添加",
    "note": "Aggiungo una parola."
  },
  "togliere": {
    "chinese": "拿掉 / 去除",
    "note": "Tolgo il cappotto."
  },
  "scegliere": {
    "chinese": "选择",
    "note": "Scelgo questa risposta."
  },
  "offrire": {
    "chinese": "提供 / 请客",
    "note": "Ti offro un caffè."
  },
  "permettere": {
    "chinese": "允许",
    "note": "Permetto a lei di entrare."
  },
  "consigliare": {
    "chinese": "建议",
    "note": "Ti consiglio questo libro."
  },
  "rifiutare": {
    "chinese": "拒绝",
    "note": "Non voglio rifiutare il tuo aiuto."
  },
  "accettare": {
    "chinese": "接受",
    "note": "Accetto la proposta."
  },
  "condividere": {
    "chinese": "分享",
    "note": "Condivido il file."
  },
  "risolvere": {
    "chinese": "解决",
    "note": "Risolvere il problema è importante."
  },
  "migliorare": {
    "chinese": "改善 / 提高",
    "note": "Voglio migliorare il mio italiano."
  },
  "peggiorare": {
    "chinese": "变差",
    "note": "La situazione peggiora."
  },
  "crescere": {
    "chinese": "成长 / 增长",
    "note": "I bambini crescono velocemente."
  },
  "diminuire": {
    "chinese": "减少",
    "note": "Il rumore diminuisce."
  },
  "aumentare": {
    "chinese": "增加",
    "note": "Il prezzo aumenta."
  },
  "organizzare": {
    "chinese": "组织 / 安排",
    "note": "Organizzo il mio studio."
  },
  "preparare": {
    "chinese": "准备",
    "note": "Preparo l'esame."
  },
  "partecipare": {
    "chinese": "参加",
    "note": "Partecipo a un corso."
  },
  "presentare": {
    "chinese": "介绍 / 呈现",
    "note": "Presento il mio progetto."
  },
  "descrivere": {
    "chinese": "描述",
    "note": "Descrivo una foto."
  },
  "raccontare": {
    "chinese": "讲述",
    "note": "Racconto una storia."
  },
  "discutere": {
    "chinese": "讨论 / 争论",
    "note": "Discutiamo del problema."
  },
  "confrontare": {
    "chinese": "比较 / 对照",
    "note": "Confronto due parole."
  },
  "concludere": {
    "chinese": "总结 / 结束",
    "note": "Concludo il discorso."
  },
  "casa": {
    "chinese": "家 / 房子",
    "note": "La mia casa è piccola."
  },
  "scuola": {
    "chinese": "学校",
    "note": "Vado a scuola."
  },
  "università": {
    "chinese": "大学",
    "note": "Studio all'università."
  },
  "classe": {
    "chinese": "班级 / 教室",
    "note": "Entro in classe."
  },
  "lezione": {
    "chinese": "课",
    "note": "La lezione inizia alle nove."
  },
  "insegnante": {
    "chinese": "老师",
    "note": "L'insegnante è gentile."
  },
  "studente": {
    "chinese": "学生，男",
    "note": "Lo studente legge."
  },
  "studentessa": {
    "chinese": "学生，女",
    "note": "La studentessa scrive."
  },
  "libro": {
    "chinese": "书",
    "note": "Leggo un libro."
  },
  "quaderno": {
    "chinese": "笔记本",
    "note": "Scrivo sul quaderno."
  },
  "penna": {
    "chinese": "笔",
    "note": "Ho una penna."
  },
  "matita": {
    "chinese": "铅笔",
    "note": "Uso una matita."
  },
  "zaino": {
    "chinese": "背包",
    "note": "Porto uno zaino."
  },
  "telefono": {
    "chinese": "电话 / 手机",
    "note": "Il telefono è scarico."
  },
  "cellulare": {
    "chinese": "手机",
    "note": "Il mio cellulare è scarico."
  },
  "computer": {
    "chinese": "电脑",
    "note": "Uso il computer."
  },
  "internet": {
    "chinese": "互联网",
    "note": "Uso internet per studiare."
  },
  "messaggio": {
    "chinese": "消息",
    "note": "Mando un messaggio."
  },
  "email": {
    "chinese": "电子邮件",
    "note": "Ricevo una email."
  },
  "documento": {
    "chinese": "文件 / 证件",
    "note": "Devo portare un documento."
  },
  "passaporto": {
    "chinese": "护照",
    "note": "Il passaporto è nella borsa."
  },
  "permesso": {
    "chinese": "许可 / 居留许可",
    "note": "Ho il permesso di soggiorno."
  },
  "soggiorno": {
    "chinese": "停留 / 居留",
    "note": "Il permesso di soggiorno è importante."
  },
  "borsa": {
    "chinese": "包 / 奖学金",
    "note": "La borsa è sul tavolo."
  },
  "chiave": {
    "chinese": "钥匙",
    "note": "Cerco la chiave."
  },
  "porta": {
    "chinese": "门",
    "note": "Chiudo la porta."
  },
  "finestra": {
    "chinese": "窗户",
    "note": "Apro la finestra."
  },
  "tavolo": {
    "chinese": "桌子",
    "note": "Il libro è sul tavolo."
  },
  "sedia": {
    "chinese": "椅子",
    "note": "Mi siedo sulla sedia."
  },
  "letto": {
    "chinese": "床",
    "note": "Il letto è comodo."
  },
  "camera": {
    "chinese": "房间",
    "note": "Pulisco la camera."
  },
  "bagno": {
    "chinese": "浴室 / 厕所",
    "note": "Vado in bagno."
  },
  "cucina": {
    "chinese": "厨房 / 菜肴",
    "note": "La cucina è luminosa."
  },
  "strada": {
    "chinese": "街道 / 路",
    "note": "Cammino per strada."
  },
  "piazza": {
    "chinese": "广场",
    "note": "Ci vediamo in piazza."
  },
  "città": {
    "chinese": "城市",
    "note": "Milano è una città grande."
  },
  "paese": {
    "chinese": "国家 / 小镇",
    "note": "Questo paese è bello."
  },
  "negozio": {
    "chinese": "商店",
    "note": "Entro in un negozio."
  },
  "supermercato": {
    "chinese": "超市",
    "note": "Vado al supermercato."
  },
  "farmacia": {
    "chinese": "药店",
    "note": "Cerco una farmacia."
  },
  "ospedale": {
    "chinese": "医院",
    "note": "L'ospedale è vicino."
  },
  "stazione": {
    "chinese": "车站",
    "note": "Aspetto alla stazione."
  },
  "aeroporto": {
    "chinese": "机场",
    "note": "Vado all'aeroporto."
  },
  "treno": {
    "chinese": "火车",
    "note": "Prendo il treno."
  },
  "autobus": {
    "chinese": "公交车",
    "note": "Prendo l'autobus."
  },
  "metropolitana": {
    "chinese": "地铁",
    "note": "Uso la metropolitana."
  },
  "macchina": {
    "chinese": "汽车 / 机器",
    "note": "La macchina è nuova."
  },
  "bicicletta": {
    "chinese": "自行车",
    "note": "Vado in bicicletta."
  },
  "biglietto": {
    "chinese": "票",
    "note": "Compro un biglietto."
  },
  "viaggio": {
    "chinese": "旅行",
    "note": "Il viaggio è lungo."
  },
  "vacanza": {
    "chinese": "假期",
    "note": "Sono in vacanza."
  },
  "albergo": {
    "chinese": "酒店",
    "note": "Dormo in albergo."
  },
  "ristorante": {
    "chinese": "餐厅",
    "note": "Ceno al ristorante."
  },
  "bar": {
    "chinese": "酒吧 / 咖啡吧",
    "note": "Prendo un caffè al bar."
  },
  "caffè": {
    "chinese": "咖啡",
    "note": "Bevo un caffè."
  },
  "acqua": {
    "chinese": "水",
    "note": "Bevo acqua."
  },
  "latte": {
    "chinese": "牛奶",
    "note": "Bevo latte."
  },
  "tè": {
    "chinese": "茶",
    "note": "Preferisco il tè."
  },
  "pane": {
    "chinese": "面包",
    "note": "Compro il pane."
  },
  "pasta": {
    "chinese": "意面",
    "note": "Mangio la pasta."
  },
  "riso": {
    "chinese": "米饭",
    "note": "Cucino il riso."
  },
  "carne": {
    "chinese": "肉",
    "note": "Mangio poca carne."
  },
  "pesce": {
    "chinese": "鱼",
    "note": "Il pesce è fresco."
  },
  "verdura": {
    "chinese": "蔬菜",
    "note": "Compro la verdura."
  },
  "frutta": {
    "chinese": "水果",
    "note": "Mangio la frutta."
  },
  "mela": {
    "chinese": "苹果",
    "note": "Mangio una mela."
  },
  "banana": {
    "chinese": "香蕉",
    "note": "Mangio una banana."
  },
  "arancia": {
    "chinese": "橙子",
    "note": "Sbuccio un'arancia."
  },
  "colazione": {
    "chinese": "早餐",
    "note": "Faccio colazione."
  },
  "pranzo": {
    "chinese": "午餐",
    "note": "Il pranzo è pronto."
  },
  "cena": {
    "chinese": "晚餐",
    "note": "Preparo la cena."
  },
  "conto": {
    "chinese": "账单 / 账户",
    "note": "Chiedo il conto."
  },
  "prezzo": {
    "chinese": "价格",
    "note": "Il prezzo è alto."
  },
  "sconto": {
    "chinese": "折扣",
    "note": "C'è uno sconto."
  },
  "denaro": {
    "chinese": "钱",
    "note": "Uso il denaro con attenzione."
  },
  "soldi": {
    "chinese": "钱",
    "note": "Non ho molti soldi."
  },
  "lavoro": {
    "chinese": "工作",
    "note": "Cerco un lavoro."
  },
  "ufficio": {
    "chinese": "办公室",
    "note": "Vado in ufficio."
  },
  "collega": {
    "chinese": "同事",
    "note": "Parlo con un collega."
  },
  "capo": {
    "chinese": "老板 / 头",
    "note": "Il capo è occupato."
  },
  "riunione": {
    "chinese": "会议",
    "note": "Ho una riunione."
  },
  "progetto": {
    "chinese": "项目",
    "note": "Presento un progetto."
  },
  "problema": {
    "chinese": "问题",
    "note": "Ho un problema."
  },
  "soluzione": {
    "chinese": "解决办法",
    "note": "Trovo una soluzione."
  },
  "domanda": {
    "chinese": "问题 / 申请",
    "note": "Ho una domanda."
  },
  "risposta": {
    "chinese": "回答",
    "note": "La risposta è giusta."
  },
  "errore": {
    "chinese": "错误",
    "note": "Correggo un errore."
  },
  "esame": {
    "chinese": "考试",
    "note": "Preparo l'esame."
  },
  "prova": {
    "chinese": "测试 / 尝试",
    "note": "La prova è difficile."
  },
  "voto": {
    "chinese": "分数 / 投票",
    "note": "Ho preso un buon voto."
  },
  "certificato": {
    "chinese": "证书",
    "note": "Ho bisogno del certificato."
  },
  "livello": {
    "chinese": "水平 / 等级",
    "note": "Studio al livello B1."
  },
  "lingua": {
    "chinese": "语言 / 舌头",
    "note": "L'italiano è una lingua bella."
  },
  "parola": {
    "chinese": "单词 / 词语",
    "note": "Aggiungo una parola."
  },
  "frase": {
    "chinese": "句子",
    "note": "Scrivo una frase."
  },
  "testo": {
    "chinese": "文本",
    "note": "Leggo un testo."
  },
  "storia": {
    "chinese": "故事 / 历史",
    "note": "Racconto una storia."
  },
  "cultura": {
    "chinese": "文化",
    "note": "Studio la cultura italiana."
  },
  "arte": {
    "chinese": "艺术",
    "note": "Amo l'arte."
  },
  "cinema": {
    "chinese": "电影",
    "note": "Mi piace il cinema."
  },
  "film": {
    "chinese": "电影",
    "note": "Guardo un film."
  },
  "musica": {
    "chinese": "音乐",
    "note": "Ascolto la musica."
  },
  "foto": {
    "chinese": "照片",
    "note": "Scatto una foto."
  },
  "fotografia": {
    "chinese": "摄影 / 照片",
    "note": "La fotografia è la mia passione."
  },
  "immagine": {
    "chinese": "图像 / 图片",
    "note": "Guardo un'immagine."
  },
  "disegno": {
    "chinese": "绘画 / 设计图",
    "note": "Faccio un disegno."
  },
  "colore": {
    "chinese": "颜色",
    "note": "Mi piace questo colore."
  },
  "forma": {
    "chinese": "形式 / 形状",
    "note": "La forma è semplice."
  },
  "spazio": {
    "chinese": "空间",
    "note": "Questo spazio è luminoso."
  },
  "tempo": {
    "chinese": "时间 / 天气",
    "note": "Non ho tempo."
  },
  "giorno": {
    "chinese": "天 / 日子",
    "note": "Oggi è un bel giorno."
  },
  "settimana": {
    "chinese": "星期",
    "note": "Studio tutta la settimana."
  },
  "mese": {
    "chinese": "月份",
    "note": "Parto il prossimo mese."
  },
  "anno": {
    "chinese": "年",
    "note": "Vivo qui da un anno."
  },
  "mattina": {
    "chinese": "早上",
    "note": "Studio la mattina."
  },
  "pomeriggio": {
    "chinese": "下午",
    "note": "Esco il pomeriggio."
  },
  "sera": {
    "chinese": "晚上",
    "note": "Studio la sera."
  },
  "notte": {
    "chinese": "夜晚",
    "note": "Dormo la notte."
  },
  "famiglia": {
    "chinese": "家庭",
    "note": "La mia famiglia vive lontano."
  },
  "madre": {
    "chinese": "母亲",
    "note": "Mia madre lavora."
  },
  "padre": {
    "chinese": "父亲",
    "note": "Mio padre cucina."
  },
  "genitore": {
    "chinese": "父母之一 / 家长",
    "note": "Un genitore mi accompagna."
  },
  "figlio": {
    "chinese": "儿子 / 孩子",
    "note": "Il figlio è piccolo."
  },
  "figlia": {
    "chinese": "女儿",
    "note": "La figlia studia."
  },
  "fratello": {
    "chinese": "兄弟",
    "note": "Ho un fratello."
  },
  "sorella": {
    "chinese": "姐妹",
    "note": "Ho una sorella."
  },
  "amico": {
    "chinese": "朋友，男",
    "note": "Un amico mi aiuta."
  },
  "amica": {
    "chinese": "朋友，女",
    "note": "Un'amica mi chiama."
  },
  "persona": {
    "chinese": "人",
    "note": "Quella persona è gentile."
  },
  "gente": {
    "chinese": "人们",
    "note": "C'è molta gente."
  },
  "bambino": {
    "chinese": "小孩，男",
    "note": "Il bambino gioca."
  },
  "bambina": {
    "chinese": "小孩，女",
    "note": "La bambina ride."
  },
  "uomo": {
    "chinese": "男人",
    "note": "L'uomo cammina."
  },
  "donna": {
    "chinese": "女人",
    "note": "La donna parla."
  },
  "vita": {
    "chinese": "生活 / 生命",
    "note": "La vita è bella."
  },
  "salute": {
    "chinese": "健康",
    "note": "La salute è importante."
  },
  "medico": {
    "chinese": "医生",
    "note": "Vado dal medico."
  },
  "medicina": {
    "chinese": "药 / 医学",
    "note": "Prendo una medicina."
  },
  "dolore": {
    "chinese": "疼痛",
    "note": "Ho dolore alla testa."
  },
  "testa": {
    "chinese": "头",
    "note": "Mi fa male la testa."
  },
  "occhio": {
    "chinese": "眼睛",
    "note": "Ho gli occhi stanchi."
  },
  "bocca": {
    "chinese": "嘴",
    "note": "Apro la bocca."
  },
  "mano": {
    "chinese": "手",
    "note": "Uso la mano destra."
  },
  "piede": {
    "chinese": "脚",
    "note": "Mi fa male il piede."
  },
  "corpo": {
    "chinese": "身体",
    "note": "Il corpo ha bisogno di riposo."
  },
  "cuore": {
    "chinese": "心",
    "note": "Il cuore batte forte."
  },
  "paura": {
    "chinese": "害怕 / 恐惧",
    "note": "Ho paura del buio."
  },
  "gioia": {
    "chinese": "喜悦",
    "note": "Provo molta gioia."
  },
  "felicità": {
    "chinese": "幸福",
    "note": "Cerco la felicità."
  },
  "tristezza": {
    "chinese": "悲伤",
    "note": "La tristezza passa."
  },
  "rabbia": {
    "chinese": "愤怒",
    "note": "Sento rabbia."
  },
  "ansia": {
    "chinese": "焦虑",
    "note": "Ho ansia per l'esame."
  },
  "stress": {
    "chinese": "压力",
    "note": "Lo stress è alto."
  },
  "sogno": {
    "chinese": "梦 / 梦想",
    "note": "Ho un sogno."
  },
  "desiderio": {
    "chinese": "愿望 / 欲望",
    "note": "Ho un grande desiderio."
  },
  "bisogno": {
    "chinese": "需要",
    "note": "Ho bisogno di aiuto."
  },
  "aiuto": {
    "chinese": "帮助",
    "note": "Chiedo aiuto."
  },
  "cura": {
    "chinese": "照顾 / 治疗",
    "note": "La cura richiede tempo."
  },
  "attenzione": {
    "chinese": "注意 / 关注",
    "note": "Fai attenzione."
  },
  "esperienza": {
    "chinese": "经历 / 经验",
    "note": "È una bella esperienza."
  },
  "opportunità": {
    "chinese": "机会",
    "note": "Questa è una buona opportunità."
  },
  "difficoltà": {
    "chinese": "困难",
    "note": "Ho qualche difficoltà."
  },
  "capacità": {
    "chinese": "能力",
    "note": "Ho capacità creative."
  },
  "possibilità": {
    "chinese": "可能性 / 机会",
    "note": "C'è una possibilità."
  },
  "qualità": {
    "chinese": "质量 / 品质",
    "note": "La qualità è buona."
  },
  "quantità": {
    "chinese": "数量",
    "note": "La quantità è sufficiente."
  },
  "motivo": {
    "chinese": "原因 / 动机",
    "note": "Qual è il motivo?"
  },
  "ragione": {
    "chinese": "理由 / 道理",
    "note": "Hai ragione."
  },
  "risultato": {
    "chinese": "结果",
    "note": "Il risultato è positivo."
  },
  "scelta": {
    "chinese": "选择",
    "note": "La scelta è difficile."
  },
  "decisione": {
    "chinese": "决定",
    "note": "La decisione è importante."
  },
  "cambiamento": {
    "chinese": "变化",
    "note": "Il cambiamento è necessario."
  },
  "sviluppo": {
    "chinese": "发展",
    "note": "Lo sviluppo continua."
  },
  "rapporto": {
    "chinese": "关系 / 报告",
    "note": "Il rapporto è complicato."
  },
  "relazione": {
    "chinese": "关系 / 报告",
    "note": "La relazione è stabile."
  },
  "contatto": {
    "chinese": "联系 / 接触",
    "note": "Mantengo il contatto."
  },
  "informazione": {
    "chinese": "信息",
    "note": "Cerco informazioni."
  },
  "notizia": {
    "chinese": "消息 / 新闻",
    "note": "La notizia è interessante."
  },
  "bello": {
    "chinese": "美丽的 / 好的",
    "note": "Questo posto è bello."
  },
  "brutto": {
    "chinese": "丑的 / 糟糕的",
    "note": "Il tempo è brutto."
  },
  "buono": {
    "chinese": "好的 / 好吃的",
    "note": "Il caffè è buono."
  },
  "cattivo": {
    "chinese": "坏的 / 不好的",
    "note": "È un cattivo esempio."
  },
  "grande": {
    "chinese": "大的 / 伟大的",
    "note": "La città è grande."
  },
  "piccolo": {
    "chinese": "小的",
    "note": "Il tavolo è piccolo."
  },
  "lungo": {
    "chinese": "长的",
    "note": "Il viaggio è lungo."
  },
  "corto": {
    "chinese": "短的",
    "note": "Il testo è corto."
  },
  "alto": {
    "chinese": "高的",
    "note": "Il prezzo è alto."
  },
  "basso": {
    "chinese": "低的 / 矮的",
    "note": "Il volume è basso."
  },
  "nuovo": {
    "chinese": "新的",
    "note": "Ho un libro nuovo."
  },
  "vecchio": {
    "chinese": "旧的 / 老的",
    "note": "Il palazzo è vecchio."
  },
  "giovane": {
    "chinese": "年轻的",
    "note": "Lei è giovane."
  },
  "facile": {
    "chinese": "容易的",
    "note": "Questo esercizio è facile."
  },
  "difficile": {
    "chinese": "困难的",
    "note": "La grammatica è difficile."
  },
  "semplice": {
    "chinese": "简单的",
    "note": "La frase è semplice."
  },
  "complesso": {
    "chinese": "复杂的",
    "note": "Il problema è complesso."
  },
  "importante": {
    "chinese": "重要的",
    "note": "È una parola importante."
  },
  "necessario": {
    "chinese": "必要的",
    "note": "È necessario studiare."
  },
  "possibile": {
    "chinese": "可能的",
    "note": "È possibile cambiare."
  },
  "impossibile": {
    "chinese": "不可能的",
    "note": "Non è impossibile."
  },
  "utile": {
    "chinese": "有用的",
    "note": "Questo metodo è utile."
  },
  "inutile": {
    "chinese": "没用的",
    "note": "È inutile preoccuparsi."
  },
  "interessante": {
    "chinese": "有趣的",
    "note": "Il libro è interessante."
  },
  "noioso": {
    "chinese": "无聊的",
    "note": "Il film è noioso."
  },
  "divertente": {
    "chinese": "有趣的 / 好玩的",
    "note": "Questo film è molto divertente."
  },
  "felice": {
    "chinese": "快乐的",
    "note": "Sono felice."
  },
  "triste": {
    "chinese": "悲伤的",
    "note": "Sono un po' triste."
  },
  "arrabbiato": {
    "chinese": "生气的",
    "note": "Sono arrabbiata."
  },
  "stanco": {
    "chinese": "累的",
    "note": "Sono stanca."
  },
  "occupato": {
    "chinese": "忙的 / 被占用的",
    "note": "Oggi sono molto occupata."
  },
  "libero": {
    "chinese": "自由的 / 空闲的",
    "note": "Sono libera domani."
  },
  "aperto": {
    "chinese": "开着的 / 开放的",
    "note": "Il negozio è aperto."
  },
  "chiuso": {
    "chinese": "关着的 / 关闭的",
    "note": "Il bar è chiuso."
  },
  "caldo": {
    "chinese": "热的",
    "note": "Oggi fa caldo."
  },
  "freddo": {
    "chinese": "冷的",
    "note": "Fa freddo."
  },
  "caro": {
    "chinese": "贵的 / 亲爱的",
    "note": "Questo vestito è caro."
  },
  "economico": {
    "chinese": "便宜的 / 经济的",
    "note": "È un ristorante economico."
  },
  "veloce": {
    "chinese": "快的",
    "note": "Il treno è veloce."
  },
  "lento": {
    "chinese": "慢的",
    "note": "Il computer è lento."
  },
  "vicino": {
    "chinese": "近的",
    "note": "La scuola è vicina."
  },
  "lontano": {
    "chinese": "远的",
    "note": "La stazione è lontana."
  },
  "uguale": {
    "chinese": "相同的",
    "note": "Le due parole sono uguali."
  },
  "diverso": {
    "chinese": "不同的",
    "note": "È un metodo diverso."
  },
  "vero": {
    "chinese": "真的",
    "note": "È vero."
  },
  "falso": {
    "chinese": "假的 / 错误的",
    "note": "La risposta è falsa."
  },
  "giusto": {
    "chinese": "正确的 / 公正的",
    "note": "La risposta è giusta."
  },
  "sbagliato": {
    "chinese": "错误的",
    "note": "Ho scelto la risposta sbagliata."
  },
  "pronto": {
    "chinese": "准备好的",
    "note": "Sono pronta."
  },
  "serio": {
    "chinese": "认真的 / 严肃的",
    "note": "È un problema serio."
  },
  "tranquillo": {
    "chinese": "安静的 / 平静的",
    "note": "Stai tranquilla."
  },
  "gentile": {
    "chinese": "友善的 / 礼貌的",
    "note": "Lei è molto gentile."
  },
  "disponibile": {
    "chinese": "有空的 / 可用的",
    "note": "Sei disponibile domani?"
  },
  "comodo": {
    "chinese": "舒服的 / 方便的",
    "note": "Il letto è comodo."
  },
  "scomodo": {
    "chinese": "不舒服的 / 不方便的",
    "note": "La sedia è scomoda."
  },
  "molto": {
    "chinese": "很 / 非常 / 很多",
    "note": "Studio molto."
  },
  "poco": {
    "chinese": "少 / 不太",
    "note": "Dormo poco."
  },
  "troppo": {
    "chinese": "太 / 过于",
    "note": "È troppo difficile."
  },
  "abbastanza": {
    "chinese": "足够 / 相当",
    "note": "Parlo abbastanza bene."
  },
  "bene": {
    "chinese": "好",
    "note": "Sto bene."
  },
  "male": {
    "chinese": "不好 / 坏",
    "note": "Sto male."
  },
  "meglio": {
    "chinese": "更好",
    "note": "Oggi sto meglio."
  },
  "peggio": {
    "chinese": "更糟",
    "note": "Va peggio di ieri."
  },
  "solo": {
    "chinese": "只 / 独自",
    "note": "Studio solo un'ora."
  },
  "anche": {
    "chinese": "也",
    "note": "Anche io studio italiano."
  },
  "neanche": {
    "chinese": "也不",
    "note": "Neanche io lo so."
  },
  "forse": {
    "chinese": "也许",
    "note": "Forse vengo domani."
  },
  "circa": {
    "chinese": "大约",
    "note": "Costa circa dieci euro."
  },
  "quasi": {
    "chinese": "几乎",
    "note": "Ho quasi finito."
  },
  "almeno": {
    "chinese": "至少",
    "note": "Studio almeno un'ora."
  },
  "invece": {
    "chinese": "相反 / 而是",
    "note": "Io resto, tu invece esci."
  },
  "però": {
    "chinese": "但是",
    "note": "È difficile, però utile."
  },
  "ma": {
    "chinese": "但是",
    "note": "Voglio uscire, ma piove."
  },
  "e": {
    "chinese": "和 / 并且",
    "note": "Studio e lavoro."
  },
  "o": {
    "chinese": "或者",
    "note": "Vuoi tè o caffè?"
  },
  "oppure": {
    "chinese": "或者",
    "note": "Possiamo uscire oppure restare."
  },
  "quindi": {
    "chinese": "所以",
    "note": "Piove, quindi resto a casa."
  },
  "perciò": {
    "chinese": "因此",
    "note": "Sono stanca, perciò dormo."
  },
  "dunque": {
    "chinese": "因此 / 那么",
    "note": "Dunque, iniziamo."
  },
  "infatti": {
    "chinese": "事实上 / 的确",
    "note": "Infatti hai ragione."
  },
  "comunque": {
    "chinese": "无论如何 / 总之",
    "note": "Comunque continuo a studiare."
  },
  "tuttavia": {
    "chinese": "然而",
    "note": "È difficile; tuttavia è utile."
  },
  "mentre": {
    "chinese": "当……时 / 而",
    "note": "Studio mentre ascolto musica."
  },
  "durante": {
    "chinese": "在……期间",
    "note": "Durante la lezione prendo appunti."
  },
  "prima di": {
    "chinese": "在……之前",
    "note": "Prima di uscire, mangio."
  },
  "dopo di": {
    "chinese": "在……之后",
    "note": "Dopo di te entro io."
  },
  "senza": {
    "chinese": "没有",
    "note": "Esco senza ombrello."
  },
  "con": {
    "chinese": "和 / 用 / 带着",
    "note": "Studio con un'amica."
  },
  "per": {
    "chinese": "为了 / 因为 / 去",
    "note": "Studio per l'esame."
  },
  "da": {
    "chinese": "从 / 在某人处 / 自……以来",
    "note": "Vengo da Hangzhou."
  },
  "a": {
    "chinese": "到 / 在 / 给",
    "note": "Vado a scuola."
  },
  "in": {
    "chinese": "在……里 / 去",
    "note": "Vivo in Italia."
  },
  "su": {
    "chinese": "在……上 / 关于",
    "note": "Il libro è sul tavolo."
  },
  "sotto": {
    "chinese": "在……下面",
    "note": "La borsa è sotto la sedia."
  },
  "sopra": {
    "chinese": "在……上方",
    "note": "Il quadro è sopra il letto."
  },
  "dentro": {
    "chinese": "在里面",
    "note": "Il telefono è dentro la borsa."
  },
  "fuori": {
    "chinese": "在外面",
    "note": "Aspetto fuori."
  },
  "tra": {
    "chinese": "在……之间 / 过……时间",
    "note": "Arrivo tra dieci minuti."
  },
  "fra": {
    "chinese": "在……之间 / 过……时间",
    "note": "Ci vediamo fra poco."
  },
  "verso": {
    "chinese": "朝向 / 大约",
    "note": "Vado verso casa."
  },
  "contro": {
    "chinese": "反对 / 撞上",
    "note": "Sono contro questa idea."
  },
  "secondo": {
    "chinese": "根据 / 第二",
    "note": "Secondo me è giusto."
  },
  "attraverso": {
    "chinese": "通过 / 穿过",
    "note": "Passo attraverso il parco."
  },
  "oltre": {
    "chinese": "超过 / 除了",
    "note": "Oltre a questo, studio anche storia."
  },
  "non solo": {
    "chinese": "不仅",
    "note": "Non solo studio, ma lavoro anche."
  },
  "per esempio": {
    "chinese": "例如",
    "note": "Per esempio, questa parola è utile."
  },
  "cioè": {
    "chinese": "也就是说",
    "note": "È difficile, cioè non è semplice."
  },
  "infine": {
    "chinese": "最后",
    "note": "Infine, finisco il lavoro."
  },
  "allora": {
    "chinese": "那么 / 当时",
    "note": "Allora cominciamo."
  },
  "ambiente": {
    "chinese": "环境",
    "note": "L'ambiente è importante."
  },
  "società": {
    "chinese": "社会 / 公司",
    "note": "La società cambia."
  },
  "economia": {
    "chinese": "经济",
    "note": "L'economia cresce."
  },
  "politica": {
    "chinese": "政治 / 政策",
    "note": "La politica è complessa."
  },
  "diritto": {
    "chinese": "权利 / 法律 / 右边",
    "note": "Hai il diritto di scegliere."
  },
  "libertà": {
    "chinese": "自由",
    "note": "La libertà è preziosa."
  },
  "uguaglianza": {
    "chinese": "平等",
    "note": "L'uguaglianza è fondamentale."
  },
  "giustizia": {
    "chinese": "正义 / 司法",
    "note": "La giustizia è importante."
  },
  "responsabilità": {
    "chinese": "责任",
    "note": "Ho una responsabilità."
  },
  "rispetto": {
    "chinese": "尊重",
    "note": "Il rispetto è necessario."
  },
  "fiducia": {
    "chinese": "信任",
    "note": "La fiducia cresce lentamente."
  },
  "comunicazione": {
    "chinese": "沟通 / 传播",
    "note": "La comunicazione è chiara."
  },
  "tecnologia": {
    "chinese": "技术",
    "note": "La tecnologia aiuta lo studio."
  },
  "innovazione": {
    "chinese": "创新",
    "note": "L'innovazione cambia il lavoro."
  },
  "tradizione": {
    "chinese": "传统",
    "note": "La tradizione è forte."
  },
  "memoria": {
    "chinese": "记忆",
    "note": "La memoria è importante."
  },
  "identità": {
    "chinese": "身份 / 认同",
    "note": "L'identità è complessa."
  },
  "valore": {
    "chinese": "价值",
    "note": "Questo progetto ha valore."
  },
  "obiettivo": {
    "chinese": "目标",
    "note": "Ho un obiettivo chiaro."
  },
  "metodo": {
    "chinese": "方法",
    "note": "Uso un metodo efficace."
  },
  "strumento": {
    "chinese": "工具",
    "note": "Questo strumento è utile."
  },
  "funzione": {
    "chinese": "功能",
    "note": "Questa funzione è nuova."
  },
  "servizio": {
    "chinese": "服务",
    "note": "Il servizio è veloce."
  },
  "cliente": {
    "chinese": "客户",
    "note": "Il cliente aspetta."
  },
  "utente": {
    "chinese": "用户",
    "note": "L'utente usa l'app."
  },
  "accesso": {
    "chinese": "访问 / 入口",
    "note": "Ho accesso al sito."
  },
  "contenuto": {
    "chinese": "内容",
    "note": "Il contenuto è interessante."
  },
  "risorsa": {
    "chinese": "资源",
    "note": "Questa è una risorsa utile."
  },
  "vantaggio": {
    "chinese": "优点 / 优势",
    "note": "È un grande vantaggio."
  },
  "svantaggio": {
    "chinese": "缺点 / 劣势",
    "note": "C'è anche uno svantaggio."
  },
  "conseguenza": {
    "chinese": "后果",
    "note": "Ogni scelta ha una conseguenza."
  },
  "causa": {
    "chinese": "原因",
    "note": "Qual è la causa?"
  },
  "effetto": {
    "chinese": "效果 / 影响",
    "note": "Questo metodo ha un buon effetto."
  },
  "effetti": {
    "chinese": "效果 / 影响，复数",
    "note": "Gli effetti sono evidenti."
  },
  "fenomeno": {
    "chinese": "现象",
    "note": "È un fenomeno interessante."
  },
  "argomento": {
    "chinese": "话题 / 论点",
    "note": "Questo argomento è difficile."
  },
  "opinione": {
    "chinese": "意见",
    "note": "Secondo la mia opinione, è utile."
  },
  "punto di vista": {
    "chinese": "观点",
    "note": "Dal mio punto di vista, funziona."
  },
  "accordo": {
    "chinese": "同意 / 协议",
    "note": "Sono d'accordo con te."
  },
  "disaccordo": {
    "chinese": "不同意",
    "note": "Sono in disaccordo."
  },
  "vantaggioso": {
    "chinese": "有利的",
    "note": "È vantaggioso per tutti."
  },
  "efficace": {
    "chinese": "有效的",
    "note": "Il metodo è efficace."
  },
  "adeguato": {
    "chinese": "合适的",
    "note": "Serve una soluzione adeguata."
  },
  "adatto": {
    "chinese": "适合的",
    "note": "Questo libro è adatto a me."
  },
  "consapevole": {
    "chinese": "有意识的 / 知情的",
    "note": "Sono consapevole del problema."
  },
  "attuale": {
    "chinese": "当前的",
    "note": "La situazione attuale è chiara."
  },
  "precedente": {
    "chinese": "之前的",
    "note": "La lezione precedente era difficile."
  },
  "successivo": {
    "chinese": "接下来的 / 随后的",
    "note": "Il capitolo successivo è breve."
  },
  "generale": {
    "chinese": "一般的 / 总体的",
    "note": "È una regola generale."
  },
  "particolare": {
    "chinese": "特别的 / 细节",
    "note": "C'è un caso particolare."
  },
  "principale": {
    "chinese": "主要的",
    "note": "Il problema principale è questo."
  },
  "secondario": {
    "chinese": "次要的",
    "note": "È un aspetto secondario."
  },
  "pubblico": {
    "chinese": "公共的 / 公众",
    "note": "È un servizio pubblico."
  },
  "privato": {
    "chinese": "私人的",
    "note": "È una questione privata."
  },
  "locale": {
    "chinese": "当地的 / 场所",
    "note": "La cultura locale è interessante."
  },
  "globale": {
    "chinese": "全球的",
    "note": "È un problema globale."
  },
  "digitale": {
    "chinese": "数字的",
    "note": "Uso strumenti digitali."
  },
  "sociale": {
    "chinese": "社会的",
    "note": "È un tema sociale."
  },
  "culturale": {
    "chinese": "文化的",
    "note": "È un evento culturale."
  },
  "personale": {
    "chinese": "个人的",
    "note": "È una scelta personale."
  },
  "professionale": {
    "chinese": "职业的 / 专业的",
    "note": "È un percorso professionale."
  },
  "creativo": {
    "chinese": "有创造力的",
    "note": "Il lavoro creativo mi piace."
  },
  "visivo": {
    "chinese": "视觉的",
    "note": "Il linguaggio visivo è forte."
  },
  "sonoro": {
    "chinese": "声音的",
    "note": "L'effetto sonoro è importante."
  },
  "emotivo": {
    "chinese": "情感的",
    "note": "È un momento emotivo."
  },
  "mentale": {
    "chinese": "心理的 / 精神的",
    "note": "La salute mentale è importante."
  },
  "fisico": {
    "chinese": "身体的 / 物理的",
    "note": "Il movimento fisico aiuta."
  },
  "naturale": {
    "chinese": "自然的",
    "note": "È un materiale naturale."
  },
  "artificiale": {
    "chinese": "人工的",
    "note": "È una luce artificiale."
  },
  "profondo": {
    "chinese": "深的 / 深刻的",
    "note": "Il tema è profondo."
  },
  "superficiale": {
    "chinese": "表面的 / 浅薄的",
    "note": "È una risposta superficiale."
  },
  "concreto": {
    "chinese": "具体的",
    "note": "Serve un esempio concreto."
  },
  "astratto": {
    "chinese": "抽象的",
    "note": "Il concetto è astratto."
  }
};


let words = loadWords();
let currentQuestion = null;
let quizMode = "zhToIt";
let quizScope = "all";
let answeredCount = 0;
let editingIndex = null;

const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll(".nav-btn");
const wordForm = document.getElementById("wordForm");
const italianInput = document.getElementById("italianInput");
const chineseInput = document.getElementById("chineseInput");
const noteInput = document.getElementById("noteInput");
const duplicateMessage = document.getElementById("duplicateMessage");
const autoTranslateMessage = document.getElementById("autoTranslateMessage");
const quizBox = document.getElementById("quizBox");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");
const wordList = document.getElementById("wordList");
const wrongList = document.getElementById("wrongList");
const clearAllBtn = document.getElementById("clearAllBtn");
const clearWrongBtn = document.getElementById("clearWrongBtn");
const quizCounter = document.getElementById("quizCounter");
const exportBackupBtn = document.getElementById("exportBackupBtn");
const importBackupBtn = document.getElementById("importBackupBtn");
const backupFileInput = document.getElementById("backupFileInput");
const backupStatus = document.getElementById("backupStatus");
const libraryCloudStatus = document.getElementById("libraryCloudStatus");

const openAuthBtn = document.getElementById("openAuthBtn");
const closeAuthBtn = document.getElementById("closeAuthBtn");
const authModal = document.getElementById("authModal");
const authButtonText = document.getElementById("authButtonText");
const authEmailInput = document.getElementById("authEmailInput");
const authPasswordInput = document.getElementById("authPasswordInput");
const signInBtn = document.getElementById("signInBtn");
const signUpBtn = document.getElementById("signUpBtn");
const signOutBtn = document.getElementById("signOutBtn");
const syncLocalBtn = document.getElementById("syncLocalBtn");
const cloudStatus = document.getElementById("cloudStatus");
const authLoggedOut = document.getElementById("authLoggedOut");
const authLoggedIn = document.getElementById("authLoggedIn");
const userEmailText = document.getElementById("userEmailText");
const authMessage = document.getElementById("authMessage");
const syncMessage = document.getElementById("syncMessage");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const searchResults = document.getElementById("searchResults");

const toggleBatchBtn = document.getElementById("toggleBatchBtn");
const batchWordForm = document.getElementById("batchWordForm");
const batchInput = document.getElementById("batchInput");
const batchMessage = document.getElementById("batchMessage");
const backupReminder = document.getElementById("backupReminder");
const wordDetailModal = document.getElementById("wordDetailModal");
const wordDetailContent = document.getElementById("wordDetailContent");
const closeDetailBtn = document.getElementById("closeDetailBtn");
const dateFilterButtons = document.querySelectorAll(".date-filter-btn");
let currentDateFilter = "all";
let currentDetailIndex = null;


const editModal = document.getElementById("editModal");
const editWordForm = document.getElementById("editWordForm");
const editItalianInput = document.getElementById("editItalianInput");
const editChineseInput = document.getElementById("editChineseInput");
const editNoteInput = document.getElementById("editNoteInput");
const closeEditBtn = document.getElementById("closeEditBtn");
const generateExampleBtn = document.getElementById("generateExampleBtn");

function loadWords() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterWords));
    return [...starterWords];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [...starterWords];
  } catch {
    return [...starterWords];
  }
}

function saveWords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

function switchView(targetId) {
  views.forEach((view) => view.classList.toggle("active", view.id === targetId));
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.target === targetId));
  document.querySelector(".view-stack").scrollTop = 0;
  render();
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.target));
});

function updateStats() {
  document.getElementById("totalWords").textContent = words.length;
  document.getElementById("todayWords").textContent = words.filter((word) => word.createdAt === today()).length;
  document.getElementById("wrongWords").textContent = words.filter((word) => (word.wrongCount || 0) > 0).length;
}


function mapCloudWord(row) {
  return {
    id: row.id,
    italian: row.italian || "",
    chinese: row.chinese || "",
    note: row.note || "",
    wrongCount: row.wrong_count || 0,
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : today()
  };
}

function mapWordToCloud(word) {
  return {
    user_id: currentUser.id,
    italian: word.italian,
    chinese: word.chinese,
    note: word.note || "",
    wrong_count: word.wrongCount || 0
  };
}


function updateLibraryCloudStatus(text, type = "") {
  if (!libraryCloudStatus) return;
  libraryCloudStatus.textContent = text;
  libraryCloudStatus.classList.remove("success", "error", "local");
  if (type) libraryCloudStatus.classList.add(type);
}


function setMessage(element, text, type = "") {
  if (!element) return;
  element.textContent = text || "";
  element.classList.remove("success", "error");
  if (type) element.classList.add(type);
}

function updateAuthUI() {
  const online = !!currentUser;

  if (cloudStatus) {
    cloudStatus.classList.toggle("online", online);
    cloudStatus.classList.toggle("offline", !online);
  }

  if (openAuthBtn) {
    openAuthBtn.classList.toggle("cloud", online);
  }

  if (authButtonText) {
    authButtonText.textContent = online ? "Cloud" : "Accesso";
  }

  if (openAuthBtn) {
    openAuthBtn.title = currentUser ? `已登录：${currentUser.email}` : "登录 / 注册";
  }

  if (authLoggedOut) authLoggedOut.hidden = online;
  if (authLoggedIn) authLoggedIn.hidden = !online;
  if (userEmailText) userEmailText.textContent = currentUser ? currentUser.email : "";

  if (!online) {
    updateLibraryCloudStatus("未登录 Cloud，当前使用本地词库。", "local");
  }
}


function preserveLocalWordsBeforeCloud() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      localStorage.setItem(LOCAL_BEFORE_CLOUD_KEY, saved);
    }
  } catch {
    // ignore invalid local data
  }
}

function loadLocalWordsForMigration() {
  const backup = localStorage.getItem(LOCAL_BEFORE_CLOUD_KEY);
  const current = localStorage.getItem(STORAGE_KEY);

  for (const saved of [backup, current]) {
    if (!saved) continue;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      // try next source
    }
  }

  return [];
}



function openAuthModal() {
  if (!authModal) return;
  authModal.hidden = false;
  if (!currentUser && authEmailInput) authEmailInput.focus();
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.hidden = true;
}


async function initAuth() {
  if (!supabaseClient) {
    setMessage(authMessage, "Supabase 没有加载成功，请检查网络。", "error");
    updateAuthUI();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  currentUser = data.session ? data.session.user : null;
  updateAuthUI();

  if (currentUser) {
    preserveLocalWordsBeforeCloud();
    await loadCloudWords();
  }

  supabaseClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session ? session.user : null;
    updateAuthUI();

    if (currentUser) {
      preserveLocalWordsBeforeCloud();
      await loadCloudWords();
    } else {
      words = loadWords();
      render();
      createQuestion();
    }
  });
}

async function signUp() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!email || !password) {
    setMessage(authMessage, "请输入邮箱和密码。", "error");
    return;
  }

  setMessage(authMessage, "正在注册……");
  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    setMessage(authMessage, error.message, "error");
    return;
  }

  setMessage(authMessage, "注册成功。如果邮箱需要确认，请先去邮箱点击确认链接。", "success");
}

async function signIn() {
  const email = authEmailInput.value.trim();
  const password = authPasswordInput.value.trim();

  if (!email || !password) {
    setMessage(authMessage, "请输入邮箱和密码。", "error");
    return;
  }

  setMessage(authMessage, "正在登录……");
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    setMessage(authMessage, error.message, "error");
    return;
  }

  currentUser = data.user;
  setMessage(authMessage, "登录成功。", "success");
  updateAuthUI();
  await loadCloudWords();
}

async function signOut() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  updateAuthUI();
  setMessage(syncMessage, "");
}

async function loadCloudWords() {
  if (!currentUser || !supabaseClient) return;

  isCloudLoading = true;
  setMessage(syncMessage, "正在读取云端词库……");
  updateLibraryCloudStatus("正在读取云端词库……");

  const { data, error } = await supabaseClient
    .from("words")
    .select("id, italian, chinese, note, wrong_count, created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  isCloudLoading = false;

  if (error) {
    setMessage(syncMessage, "读取云端失败：" + error.message, "error");
    updateLibraryCloudStatus("读取云端失败：" + error.message, "error");
    return;
  }

  words = (data || []).map(mapCloudWord);
  saveWords();
  setMessage(syncMessage, `已同步云端词库：${words.length} 个单词。`, "success");
  updateLibraryCloudStatus(`已同步云端词库：${words.length} 个单词。`, "success");
  render();
  createQuestion();
}

async function insertCloudWord(word) {
  if (!currentUser || !supabaseClient) return word;

  const { data, error } = await supabaseClient
    .from("words")
    .insert(mapWordToCloud(word))
    .select("id, italian, chinese, note, wrong_count, created_at")
    .single();

  if (error) {
    alert("云端保存失败：" + error.message);
    return word;
  }

  return mapCloudWord(data);
}

async function updateCloudWord(word) {
  if (!currentUser || !supabaseClient || !word.id) return;

  const { error } = await supabaseClient
    .from("words")
    .update({
      chinese: word.chinese,
      note: word.note || "",
      wrong_count: word.wrongCount || 0
    })
    .eq("id", word.id)
    .eq("user_id", currentUser.id);

  if (error) {
    console.error("更新云端失败：", error.message);
  }
}

async function deleteCloudWord(word) {
  if (!currentUser || !supabaseClient || !word || !word.id) return;

  const { error } = await supabaseClient
    .from("words")
    .delete()
    .eq("id", word.id)
    .eq("user_id", currentUser.id);

  if (error) {
    alert("云端删除失败：" + error.message);
  }
}

async function clearCloudWords() {
  if (!currentUser || !supabaseClient) return;

  const { error } = await supabaseClient
    .from("words")
    .delete()
    .eq("user_id", currentUser.id);

  if (error) {
    alert("云端清空失败：" + error.message);
  }
}

async function uploadLocalWordsToCloud() {
  if (!currentUser) {
    setMessage(syncMessage, "请先登录。", "error");
    return;
  }

  const localWords = loadLocalWordsForMigration().filter((word) => word.italian && word.chinese);

  if (localWords.length === 0) {
    setMessage(syncMessage, "本地没有可以上传的单词。", "error");
    return;
  }

  setMessage(syncMessage, `正在上传 ${localWords.length} 个本地单词……`);

  const existing = new Set(words.map((word) => normalizeWordText(word.italian)));
  const toUpload = localWords.filter((word) => !existing.has(normalizeWordText(word.italian)));

  if (toUpload.length === 0) {
    setMessage(syncMessage, "云端已经有这些单词了。", "success");
    return;
  }

  const rows = toUpload.map((word) => ({
    user_id: currentUser.id,
    italian: word.italian,
    chinese: word.chinese,
    note: word.note || "",
    wrong_count: word.wrongCount || 0
  }));

  const { error } = await supabaseClient.from("words").insert(rows);

  if (error) {
    setMessage(syncMessage, "上传失败：" + error.message, "error");
    return;
  }

  await loadCloudWords();
  setMessage(syncMessage, `已上传 ${toUpload.length} 个本地单词到云端。`, "success");
  updateLibraryCloudStatus(`已同步云端词库：${words.length} 个单词。`, "success");
}


function renderSearchResults() {
  if (!searchResults || !searchInput) return;

  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword) {
    searchResults.innerHTML = "";
    return;
  }

  const results = words.filter((word) => {
    const italian = String(word.italian || "").toLowerCase();
    const chinese = String(word.chinese || "").toLowerCase();
    const note = String(word.note || "").toLowerCase();
    return italian.includes(keyword) || chinese.includes(keyword) || note.includes(keyword);
  });

  renderList(searchResults, results, "没有找到这个单词。", "readonly");
}


function parseDateOnly(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function startOfWeek(date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = copy.getDay() || 7;
  copy.setDate(copy.getDate() - day + 1);
  return copy;
}

function matchesDateFilter(word) {
  if (currentDateFilter === "all") return true;

  const dateText = parseDateOnly(word.createdAt);
  if (!dateText) return false;

  const wordDate = new Date(dateText + "T00:00:00");
  const now = new Date();
  const todayText = today();

  if (currentDateFilter === "today") {
    return dateText === todayText;
  }

  if (currentDateFilter === "week") {
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return wordDate >= start && wordDate < end;
  }

  if (currentDateFilter === "month") {
    return wordDate.getFullYear() === now.getFullYear() && wordDate.getMonth() === now.getMonth();
  }

  return true;
}

function weightedQuestionPool() {
  const pool = questionPool();

  if (quizScope === "wrong") {
    const weighted = [];
    pool.forEach((word) => {
      const weight = Math.max(1, Math.min(8, word.wrongCount || 1));
      for (let i = 0; i < weight; i += 1) weighted.push(word);
    });
    return weighted.length ? weighted : pool;
  }

  return pool;
}

function updateBackupReminder() {
  if (!backupReminder) return;

  const lastBackup = localStorage.getItem(BACKUP_TIME_KEY);
  const total = words.length;
  const shouldRemindByCount = total > 0 && total % 200 === 0;
  let shouldRemindByTime = false;

  if (lastBackup) {
    const last = new Date(lastBackup);
    const diffDays = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    shouldRemindByTime = diffDays >= 7;
  } else {
    shouldRemindByTime = total >= 50;
  }

  if (shouldRemindByCount) {
    backupReminder.hidden = false;
    backupReminder.textContent = `你已经累计 ${total} 个单词，建议现在导出一次备份。`;
    return;
  }

  if (shouldRemindByTime) {
    backupReminder.hidden = false;
    backupReminder.textContent = "距离上次备份已经比较久，建议导出一次备份。";
    return;
  }

  backupReminder.hidden = true;
  backupReminder.textContent = "";
}

function parseBatchLines(text) {
  return String(text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      let italian = "";
      let chinese = "";

      // 兼容旧格式：fuggire = 逃跑 / fuggire: 逃跑
      const explicitParts = line.split(/\s*=\s*|\s*：\s*|\s*:\s*|\s*-\s*|\s*—\s*/);
      if (explicitParts.length >= 2) {
        italian = (explicitParts[0] || "").trim();
        chinese = explicitParts.slice(1).join(" / ").trim();
      } else {
        // 新格式：fuggire 逃跑 / 逃走
        // 第一段拉丁字母/重音字母/空格/撇号识别为意大利语，后面识别为中文翻译
        const match = line.match(/^([A-Za-zÀ-ÖØ-öø-ÿ'’\s]+?)\s+(.+)$/);
        if (match) {
          italian = match[1].trim();
          chinese = match[2].trim();
        }
      }

      if (!italian || !chinese) return null;

      const dictEntry = lookupBuiltInDictionary(italian);
      return {
        italian,
        chinese,
        note: dictEntry && dictEntry.note ? dictEntry.note : "",
        wrongCount: 0,
        createdAt: today()
      };
    })
    .filter(Boolean);
}

async function saveWordsToCloudAndLocal(newWords) {
  const saved = [];
  for (const word of newWords) {
    const duplicate = findDuplicateWord(word.italian);
    if (duplicate) continue;
    const savedWord = await insertCloudWord(word);
    words.unshift(savedWord);
    saved.push(savedWord);
  }
  saveWords();
  render();
  createQuestion();
  return saved.length;
}

function openWordDetail(index) {
  if (index < 0 || !words[index] || !wordDetailModal || !wordDetailContent) return;
  currentDetailIndex = index;
  const word = words[index];

  wordDetailContent.innerHTML = `
    <div class="detail-line">
      <span class="detail-label">Italiano</span>
      <p class="detail-value detail-word">${escapeHtml(word.italian)}</p>
    </div>
    <div class="detail-line">
      <span class="detail-label">Cinese</span>
      <p class="detail-value">${escapeHtml(word.chinese)}</p>
    </div>
    <div class="detail-line">
      <span class="detail-label">Nota / Esempio</span>
      <p class="detail-value">${escapeHtml(word.note || "还没有例句 / 备注。")}</p>
    </div>
    <div class="detail-line">
      <span class="detail-label">Statistiche</span>
      <p class="detail-value">错题次数：${word.wrongCount || 0}<br>添加时间：${escapeHtml(parseDateOnly(word.createdAt) || "未知")}</p>
    </div>
    <div class="detail-actions">
      <button class="secondary-btn" type="button" onclick="editFromDetail()">编辑</button>
      <button class="text-btn danger" type="button" onclick="deleteFromDetail()">删除</button>
    </div>
  `;

  wordDetailModal.hidden = false;
}

function closeWordDetail() {
  if (!wordDetailModal) return;
  wordDetailModal.hidden = true;
  currentDetailIndex = null;
}

function editFromDetail() {
  if (currentDetailIndex === null) return;
  const index = currentDetailIndex;
  closeWordDetail();
  openEditWord(index);
}

async function deleteFromDetail() {
  if (currentDetailIndex === null) return;
  const index = currentDetailIndex;
  closeWordDetail();
  await deleteWord(index);
}


function renderWordList() {
  const filteredWords = words.filter(matchesDateFilter);
  renderList(wordList, filteredWords, "这个时间范围里还没有生词。", "library");

  const wrongWords = words
    .filter((word) => (word.wrongCount || 0) > 0)
    .sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0));

  renderList(wrongList, wrongWords, "现在还没有错题。答错的单词会自动出现在这里。", "readonly");
}

function renderList(container, list, emptyText, mode) {
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<p class="empty">${emptyText}</p>`;
    return;
  }

  container.innerHTML = list
    .map((word) => {
      const originalIndex = words.indexOf(word);
      const actions = mode === "library"
        ? `
          <div class="word-actions">
            <button class="edit-btn" type="button" onclick="event.stopPropagation(); openEditWord(${originalIndex})">编辑</button>
            <button class="delete-btn" type="button" onclick="event.stopPropagation(); deleteWord(${originalIndex})">删除</button>
          </div>
        `
        : "";

      return `
        <article class="word-card" onclick="openWordDetail(${originalIndex})">
          <div>
            <h3>${escapeHtml(word.italian)} <span>— ${escapeHtml(word.chinese)}</span></h3>
            ${word.note ? `<p class="word-note">${escapeHtml(word.note)}</p>` : ""}
            <p class="word-meta">错题次数：${word.wrongCount || 0}</p>
          </div>
          ${actions}
        </article>
      `;
    })
    .join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function deleteWord(index) {
  if (index < 0 || !words[index]) return;
  const word = words[index];
  await deleteCloudWord(word);
  words.splice(index, 1);
  saveWords();
  render();
  createQuestion();
}


function lookupBuiltInDictionary(italianText) {
  const normalized = normalizeWordText(italianText);
  if (!normalized) return null;
  return builtInDictionary[normalized] || null;
}

function applyBuiltInTranslation() {
  const entry = lookupBuiltInDictionary(italianInput.value);
  if (!autoTranslateMessage) return;

  if (!entry) {
    autoTranslateMessage.textContent = "";
    return;
  }

  const filled = [];

  if (!chineseInput.value.trim()) {
    chineseInput.value = entry.chinese;
    filled.push("中文翻译");
  }

  if (!noteInput.value.trim() && entry.note) {
    noteInput.value = entry.note;
    filled.push("例句");
  }

  if (filled.length > 0) {
    autoTranslateMessage.textContent = `已自动填入：${filled.join("、")}`;
  } else {
    autoTranslateMessage.textContent = "词典中有这个词，你也可以手动修改翻译和例句。";
  }
}


function normalizeWordText(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .normalize("NFC");
}

function findDuplicateWord(italianText) {
  const normalized = normalizeWordText(italianText);
  if (!normalized) return null;
  return words.find((word) => normalizeWordText(word.italian) === normalized) || null;
}

function showDuplicateMessage(word) {
  if (!duplicateMessage) return;

  if (word) {
    duplicateMessage.textContent = `这个单词已添加：${word.italian} = ${word.chinese}`;
    italianInput.classList.add("duplicate-input");
  } else {
    duplicateMessage.textContent = "";
    italianInput.classList.remove("duplicate-input");
  }
}

function openEditWord(index) {
  if (index < 0 || !words[index]) {
    alert("没有找到这个单词，请刷新后再试。");
    return;
  }

  const word = words[index];
  editingIndex = index;

  editItalianInput.value = word.italian || "";
  editChineseInput.value = word.chinese || "";
  editNoteInput.value = word.note || "";
  editModal.hidden = false;
  editChineseInput.focus();
}

function closeEditModal() {
  editModal.hidden = true;
  editingIndex = null;
  editWordForm.reset();
}

function generateLocalExample(italianText, chineseText) {
  const word = String(italianText || "").trim();
  const meaning = String(chineseText || "").trim();

  const specialExamples = {
    "fuggire": "Non puoi fuggire dai tuoi problemi.",
    "a beneficio di": "Questa iniziativa è a beneficio degli studenti.",
    "litigare": "Non voglio litigare con te.",
    "trasloco": "Il trasloco è stato faticoso.",
    "nostalgia": "Ho nostalgia di casa.",
    "colloquio": "Domani ho un colloquio.",
    "presenza": "La tua presenza è importante."
  };

  const key = word.toLowerCase();
  if (specialExamples[key]) return specialExamples[key];

  if (key.endsWith("are") || key.endsWith("ere") || key.endsWith("ire")) {
    return `Devo imparare a usare il verbo “${word}” in una frase.`;
  }

  if (word.includes(" ")) {
    return `Questa espressione, “${word}”, è utile nella vita quotidiana.`;
  }

  if (meaning) {
    return `La parola “${word}” significa “${meaning}”.`;
  }

  return `La parola “${word}” è importante per me.`;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function questionPool() {
  return quizScope === "wrong" ? words.filter((word) => (word.wrongCount || 0) > 0) : words;
}

function createQuestion() {
  const pool = questionPool();
  quizCounter.textContent = `${answeredCount}/${Math.max(pool.length, 0)}`;

  if (pool.length < 4) {
    quizBox.className = "quiz-box empty";
    quizBox.innerHTML = quizScope === "wrong"
      ? `<p>错题至少需要 4 个，才能生成选择题。你可以先用全部词库测试。</p>`
      : `<p>至少添加 4 个生词后，就可以开始选择题测试。</p>`;
    return;
  }

  const weightedPool = weightedQuestionPool();
  const answer = weightedPool[Math.floor(Math.random() * weightedPool.length)];
  const wrongSource = words.filter((word) => word !== answer);
  const wrongOptions = shuffle(wrongSource).slice(0, 3);
  const options = shuffle([answer, ...wrongOptions]);

  currentQuestion = { answer, options, answered: false };

  const questionText = quizMode === "zhToIt"
    ? `“${answer.chinese}” 对应哪个意大利语？`
    : `“${answer.italian}” 是什么意思？`;

  quizBox.className = "quiz-box";
  quizBox.innerHTML = `
    <div class="quiz-question">${escapeHtml(questionText)}</div>
    ${options.map((option, index) => {
      const optionText = quizMode === "zhToIt" ? option.italian : option.chinese;
      const label = String.fromCharCode(65 + index);
      return `<button class="option" data-label="${label}" onclick="checkAnswer(${index})">${escapeHtml(optionText)}</button>`;
    }).join("")}
    <div id="feedback" class="feedback"></div>
  `;
}

function checkAnswer(selectedIndex) {
  if (!currentQuestion || currentQuestion.answered) return;

  currentQuestion.answered = true;
  answeredCount += 1;

  const selected = currentQuestion.options[selectedIndex];
  const isCorrect = selected === currentQuestion.answer;
  const optionButtons = document.querySelectorAll(".option");

  optionButtons.forEach((button, index) => {
    const option = currentQuestion.options[index];
    if (option === currentQuestion.answer) button.classList.add("correct");
    if (index === selectedIndex && !isCorrect) button.classList.add("wrong");
  });

  const feedback = document.getElementById("feedback");
  const answer = currentQuestion.answer;

  if (isCorrect) {
    feedback.textContent = `回答正确！“${answer.italian}” 意为 “${answer.chinese}”。`;
    render();

    setTimeout(() => {
      createQuestion();
    }, 450);
  } else {
    answer.wrongCount = (answer.wrongCount || 0) + 1;
    saveWords();
    updateCloudWord(answer);
    feedback.textContent = `回答错误。正确答案：${answer.italian} = ${answer.chinese}`;
    render();
  }
}

function formatDateTime(isoText) {
  if (!isoText) return "还没有导出过备份";

  const date = new Date(isoText);
  if (Number.isNaN(date.getTime())) return "还没有导出过备份";

  return `最近一次导出：${date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })}`;
}

function updateBackupStatus() {
  if (!backupStatus) return;
  backupStatus.textContent = formatDateTime(localStorage.getItem(BACKUP_TIME_KEY));
}

function exportBackup() {
  const now = new Date().toISOString();
  const backup = {
    app: "Diario delle Parole di Lina",
    version: 32,
    exportedAt: now,
    words
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `salvataggio-parole-lina-${today()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  localStorage.setItem(BACKUP_TIME_KEY, now);
  updateBackupStatus();
}

function normalizeImportedWords(data) {
  const importedWords = Array.isArray(data) ? data : data && Array.isArray(data.words) ? data.words : null;
  if (!importedWords) return null;

  return importedWords
    .filter((word) => word && typeof word === "object")
    .map((word) => ({
      italian: String(word.italian || "").trim(),
      chinese: String(word.chinese || "").trim(),
      note: String(word.note || "").trim(),
      wrongCount: Number.isFinite(Number(word.wrongCount)) ? Math.max(0, Number(word.wrongCount)) : 0,
      createdAt: word.createdAt || today()
    }))
    .filter((word) => word.italian && word.chinese);
}


async function uploadWordsArrayToCloud(wordArray, replaceCloud = false) {
  if (!currentUser || !supabaseClient) {
    return { uploaded: 0, skipped: 0, error: null };
  }

  const cleaned = wordArray
    .filter((word) => word && word.italian && word.chinese)
    .map((word) => ({
      italian: String(word.italian || "").trim(),
      chinese: String(word.chinese || "").trim(),
      note: String(word.note || "").trim(),
      wrongCount: Number.isFinite(Number(word.wrongCount)) ? Math.max(0, Number(word.wrongCount)) : 0,
      createdAt: word.createdAt || today()
    }));

  if (replaceCloud) {
    const { error: deleteError } = await supabaseClient
      .from("words")
      .delete()
      .eq("user_id", currentUser.id);

    if (deleteError) {
      return { uploaded: 0, skipped: 0, error: deleteError.message };
    }
  }

  const { data: existingData, error: existingError } = await supabaseClient
    .from("words")
    .select("italian")
    .eq("user_id", currentUser.id);

  if (existingError) {
    return { uploaded: 0, skipped: 0, error: existingError.message };
  }

  const existingSet = new Set((existingData || []).map((row) => normalizeWordText(row.italian)));
  const uniqueRows = [];
  let skipped = 0;

  cleaned.forEach((word) => {
    const key = normalizeWordText(word.italian);
    if (!key || existingSet.has(key)) {
      skipped += 1;
      return;
    }

    existingSet.add(key);
    uniqueRows.push({
      user_id: currentUser.id,
      italian: word.italian,
      chinese: word.chinese,
      note: word.note || "",
      wrong_count: word.wrongCount || 0
    });
  });

  if (uniqueRows.length === 0) {
    return { uploaded: 0, skipped, error: null };
  }

  const { error } = await supabaseClient.from("words").insert(uniqueRows);

  if (error) {
    return { uploaded: 0, skipped, error: error.message };
  }

  return { uploaded: uniqueRows.length, skipped, error: null };
}


function importBackupFile(file) {
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedWords = normalizeImportedWords(parsed);

      if (!importedWords || importedWords.length === 0) {
        alert("这个备份文件里没有可导入的单词。");
        return;
      }

      const shouldReplace = confirm(
        `找到 ${importedWords.length} 个单词。\n\n点“确定”：覆盖当前词库。\n点“取消”：追加到当前词库。`
      );

      words = shouldReplace ? importedWords : [...importedWords, ...words];
      saveWords();

      let cloudNotice = "";
      if (currentUser) {
        const result = await uploadWordsArrayToCloud(importedWords, shouldReplace);
        if (result.error) {
          cloudNotice = `\n\n但是上传云端失败：${result.error}`;
        } else {
          await loadCloudWords();
          cloudNotice = `\n\n已同步到云端：新增 ${result.uploaded} 个，跳过重复 ${result.skipped} 个。`;
        }
      } else {
        cloudNotice = "\n\n你目前还没有登录 Cloud，所以这次只导入到本地。登录后可以点 Carica dati locali 上传到云端。";
      }

      answeredCount = 0;
      render();
      createQuestion();
      switchView("libraryView");
      alert("导入成功！" + cloudNotice);
    } catch {
      alert("导入失败：请选择本 App 导出的 .json 备份文件。");
    } finally {
      backupFileInput.value = "";
    }
  };

  reader.readAsText(file);
}

wordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const newWord = {
    italian: italianInput.value.trim(),
    chinese: chineseInput.value.trim(),
    note: noteInput.value.trim(),
    wrongCount: 0,
    createdAt: today()
  };

  if (!newWord.italian || !newWord.chinese) return;

  const duplicate = findDuplicateWord(newWord.italian);
  if (duplicate) {
    showDuplicateMessage(duplicate);
    italianInput.focus();
    return;
  }

  const savedWord = await insertCloudWord(newWord);
  words.unshift(savedWord);
  saveWords();
  wordForm.reset();
  showDuplicateMessage(null);
  if (autoTranslateMessage) autoTranslateMessage.textContent = "";
  render();
  createQuestion();
});

italianInput.addEventListener("input", () => {
  const duplicate = findDuplicateWord(italianInput.value);
  showDuplicateMessage(duplicate);
  applyBuiltInTranslation();
});

document.querySelectorAll(".mode-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    quizMode = button.dataset.mode;
    createQuestion();
  });
});

document.querySelectorAll(".scope-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".scope-btn").forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    quizScope = button.dataset.scope;
    createQuestion();
  });
});

closeEditBtn.addEventListener("click", closeEditModal);

editModal.addEventListener("click", (event) => {
  if (event.target === editModal) closeEditModal();
});

generateExampleBtn.addEventListener("click", () => {
  editNoteInput.value = generateLocalExample(editItalianInput.value, editChineseInput.value);
  editNoteInput.focus();
});

editWordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (editingIndex === null || !words[editingIndex]) {
    alert("没有找到这个单词，请重新打开词库编辑。");
    closeEditModal();
    return;
  }

  const chinese = editChineseInput.value.trim();
  const note = editNoteInput.value.trim();

  if (!chinese) return;

  words[editingIndex] = {
    ...words[editingIndex],
    chinese,
    note
  };

  saveWords();
  await updateCloudWord(words[editingIndex]);
  closeEditModal();
  render();
  createQuestion();
});

if (searchInput) {
  searchInput.addEventListener("input", renderSearchResults);
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderSearchResults();
    searchInput.focus();
  });
}



if (openAuthBtn) openAuthBtn.addEventListener("click", openAuthModal);
if (closeAuthBtn) closeAuthBtn.addEventListener("click", closeAuthModal);
if (authModal) {
  authModal.addEventListener("click", (event) => {
    if (event.target === authModal) closeAuthModal();
  });
}


if (signInBtn) signInBtn.addEventListener("click", signIn);
if (signUpBtn) signUpBtn.addEventListener("click", signUp);
if (signOutBtn) signOutBtn.addEventListener("click", signOut);
if (syncLocalBtn) syncLocalBtn.addEventListener("click", uploadLocalWordsToCloud);



if (toggleBatchBtn && batchWordForm) {
  toggleBatchBtn.addEventListener("click", () => {
    const isHidden = batchWordForm.hidden;
    batchWordForm.hidden = !isHidden;
    toggleBatchBtn.textContent = isHidden ? "− Aggiunta multipla" : "+ Aggiunta multipla";
  });
}


if (batchWordForm) {
  batchWordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const parsedWords = parseBatchLines(batchInput.value);

    if (parsedWords.length === 0) {
      setMessage(batchMessage, "没有识别到可添加的单词。请使用：fuggire 逃跑", "error");
      return;
    }

    setMessage(batchMessage, `正在添加 ${parsedWords.length} 个单词……`);
    const addedCount = await saveWordsToCloudAndLocal(parsedWords);
    batchInput.value = "";
    setMessage(batchMessage, `已添加 ${addedCount} 个单词，跳过 ${parsedWords.length - addedCount} 个重复词。`, "success");
  });
}

dateFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    dateFilterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentDateFilter = button.dataset.filter;
    renderWordList();
  });
});

if (closeDetailBtn) {
  closeDetailBtn.addEventListener("click", closeWordDetail);
}

if (wordDetailModal) {
  wordDetailModal.addEventListener("click", (event) => {
    if (event.target === wordDetailModal) closeWordDetail();
  });
}


nextQuestionBtn.addEventListener("click", createQuestion);
exportBackupBtn.addEventListener("click", exportBackup);

importBackupBtn.addEventListener("click", () => {
  backupFileInput.click();
});

backupFileInput.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  importBackupFile(file);
});

clearAllBtn.addEventListener("click", async () => {
  if (!confirm("确定要清空全部生词吗？这个操作不能恢复。")) return;
  await clearCloudWords();
  words = [];
  answeredCount = 0;
  saveWords();
  render();
  createQuestion();
});

clearWrongBtn.addEventListener("click", async () => {
  words = words.map((word) => ({ ...word, wrongCount: 0 }));
  saveWords();
  if (currentUser) {
    for (const word of words) await updateCloudWord(word);
  }
  render();
  createQuestion();
});

function render() {
  updateStats();
  renderWordList();
  renderSearchResults();
  updateBackupStatus();
  updateBackupReminder();
  quizCounter.textContent = `${answeredCount}/${Math.max(questionPool().length, 0)}`;
}

if (authModal) authModal.hidden = true;
initAuth();
render();
createQuestion();
