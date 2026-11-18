import type { Book, DictionaryEntry, ReaderPreferences } from '@/lib/types'

export const defaultPreferences: ReaderPreferences = { font: 'Georgia', fontSize: 20, lineHeight: 1.8, width: 660, theme: 'warm' }
export const books: Book[] = [
  { id: 'pride', title: 'Pride and Prejudice', author: 'Jane Austen', subtitle: '傲慢与偏见', cover: '/covers/pride.jpg', chapters: [
    { id: 'one', title: 'Chapter One', paragraphs: [
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
      'However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.',
      '“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”',
      'Mr. Bennet replied that he had not.',
      '“But it is,” returned she; “for Mrs. Long has just been here, and she told me all about it.”',
      'Mr. Bennet made no answer.',
      '“Do not you want to know who has taken it?” cried his wife impatiently.',
      '“You want to tell me, and I have no objection to hearing it.”',
      'This was invitation enough.',
      '“Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it, that he agreed with Mr. Morris immediately; that he is to take possession before Michaelmas, and some of his servants are to be in the house by the end of next week.”',
      '“What is his name?”', '“Bingley.”', '“Is he married or single?”',
      '“Oh! Single, my dear, to be sure! A single man of large fortune; four or five thousand a year. What a fine thing for our girls!”',
      '“How so? How can it affect them?”',
      '“My dear Mr. Bennet,” replied his wife, “how can you be so tiresome! You must know that I am thinking of his marrying one of them.”',
      '“Is that his design in settling here?”',
      '“Design! Nonsense, how can you talk so! But it is very likely that he may fall in love with one of them, and therefore you must visit him as soon as he comes.”',
      '“I see no occasion for that. You and the girls may go, or you may send them by themselves, which perhaps will be still better, for as you are as handsome as any of them, Mr. Bingley might like you the best of the party.”',
      '“My dear, you flatter me. I certainly have had my share of beauty, but I do not pretend to be anything extraordinary now. When a woman has five grown-up daughters, she ought to give over thinking of her own beauty.”',
      '“In such cases, a woman has not often much beauty to think of.”',
    ] },
    { id: 'two', title: 'Chapter Two', paragraphs: [
      'Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.',
      'It was then disclosed in the following manner. Observing his second daughter employed in trimming a hat, he suddenly addressed her with:',
      '“I hope Mr. Bingley will like it, Lizzy.”',
      '“We are not in a way to know what Mr. Bingley likes,” said her mother resentfully, “since we are not to visit.”',
      '“But you forget, mamma,” said Elizabeth, “that we shall meet him at the assemblies, and that Mrs. Long promised to introduce him.”',
      '“I do not believe Mrs. Long will do any such thing. She has two nieces of her own. She is a selfish, hypocritical woman, and I have no opinion of her.”',
      '“No more have I,” said Mr. Bennet; “and I am glad to find that you do not depend on her serving you.”',
      'Mrs. Bennet deigned not to make any reply, but, unable to contain herself, began scolding one of her daughters.',
      '“Don’t keep coughing so, Kitty, for Heaven’s sake! Have a little compassion on my nerves. You tear them to pieces.”',
      '“Kitty has no discretion in her coughs,” said her father; “she times them ill.”',
      '“I do not cough for my own amusement,” replied Kitty fretfully. “When is your next ball to be, Lizzy?”',
    ] },
    { id: 'three', title: 'Chapter Three · 交互体验', paragraphs: [
      'He runs every morning. She runs a business. The children were running through the garden, carrying books and laughing together.',
      'In the quiet of the library, Elizabeth acknowledged the extraordinary influence that books could have upon the imagination, remembering how a single sentence, encountered by chance on an ordinary afternoon, had once changed the way she thought about the people she loved and the life she hoped to lead.',
      'The word timeout demonstrates a dictionary request that fails once. Select it again or choose retry to see the result.',
      'The word mystery demonstrates a missing dictionary entry. Its original sentence remains available even when the dictionary has no result.',
      'The storm gathered above the garden. This sentence demonstrates a translation that fails once; try again to continue.',
      'The archive keeps every sentence safe. Select archive to demonstrate a collection save failure, then retry.',
    ] },
  ] },
  { id: 'garden', title: 'The Secret Garden', author: 'Frances Hodgson Burnett', subtitle: '秘密花园', cover: '/covers/garden.jpg', chapters: [
    { id: 'one', title: 'There Is No One Left', paragraphs: [
      'When Mary Lennox was sent to Misselthwaite Manor to live with her uncle everybody said she was the most disagreeable-looking child ever seen. It was true, too.',
      'She had a little thin face and a little thin body, thin light hair and a sour expression. Her hair was yellow, and her face was yellow because she had been born in India and had always been ill in one way or another.',
      'Her father had held a position under the English Government and had always been busy and ill himself, and her mother had been a great beauty who cared only to go to parties and amuse herself with gay people.',
      'She had not wanted a little girl at all, and when Mary was born she handed her over to the care of an Ayah, who was made to understand that if she wished to please the Mem Sahib she must keep the child out of sight as much as possible.',
      'So when she was a sickly, fretful, ugly little baby she was kept out of the way, and when she became a sickly, fretful, toddling thing she was kept out of the way also.',
      'One frightfully hot morning, when she was about nine years old, she awakened feeling very cross, and she became crosser still when she saw that the servant who stood by her bedside was not her Ayah.',
      '“Why did you come?” she said to the strange woman. “I will not let you stay. Send my Ayah to me.”',
      'The woman looked frightened, but she only stammered that the Ayah could not come and when Mary threw herself into a passion and beat and kicked her, she looked only more frightened and repeated that it was not possible for the Ayah to come to Missie Sahib.',
    ] },
    { id: 'two', title: 'Mistress Mary Quite Contrary', paragraphs: [
      'Mary had liked to look at her mother from a distance and she had thought her very pretty, but as she knew very little of her she could scarcely have been expected to love her or to miss her very much when she was gone.',
      'She did not miss her at all, in fact, and as she was a self-absorbed child she gave her entire thought to herself, as she had always done.',
      'She runs through the garden. The children run beside the old stone wall. In the morning light the garden seemed full of quiet promise.',
    ] },
  ] },
]

const definitions: Record<string, [string, string, ...string[]]> = {
  acknowledge: ['əkˈnɒlɪdʒ', '承认；认可', '告知收到；确认收到', '致谢；鸣谢', '承认某人的地位或权利', '以微笑或点头向某人致意'],
  truth: ['truːθ', '事实；真相', '真实性', '公认的道理'],
  universally: ['ˌjuːnɪˈvɜːsəli', '普遍地；一致地', '全世界地'],
  single: ['ˈsɪŋɡəl', '单身的', '单一的；仅有一个的', '单程的'],
  possession: ['pəˈzeʃən', '拥有；占有', '所有物；财产', '领地'],
  fortune: ['ˈfɔːtʃuːn', '大笔财产；财富', '运气；机遇', '命运；前途', '未来的际遇'],
  want: ['wɒnt', '想要；需要', '缺少；缺乏', '需求'],
  wife: ['waɪf', '妻子'],
  influence: ['ˈɪnfluəns', '影响；作用', '影响力；感化力', '势力；权势', '对某人行为和思想产生的潜移默化的作用'],
  extraordinary: ['ɪkˈstrɔːdənəri', '非凡的；不同寻常的', '令人惊奇的', '特别安排的；临时的', '超出通常范围、超越一般经验或预期，因而引人注目或令人惊叹的'],
  run: ['rʌn', '跑；奔跑', '经营；管理', '运行；运转', '流动', '一段连续的时间或路程'],
  child: ['tʃaɪld', '儿童；小孩', '子女', '深受某种环境影响的人'],
  book: ['bʊk', '书；书籍', '本子；册子', '预订'],
  garden: ['ˈɡɑːdən', '花园；园子', '公园；庭园'],
  morning: ['ˈmɔːnɪŋ', '早晨；上午'],
  business: ['ˈbɪznəs', '商业；生意', '企业；公司', '事务'],
  library: ['ˈlaɪbrəri', '图书馆', '藏书', '文库'],
  timeout: ['ˈtaɪmaʊt', '超时；暂停'],
  storm: ['stɔːm', '暴风雨', '猛烈的争论', '怒气冲冲地行动'],
  archive: ['ˈɑːkaɪv', '档案；档案馆', '归档；存档'],
  quiet: ['ˈkwaɪət', '安静的；平静的', '寡言的', '使安静'],
  feeling: ['ˈfiːlɪŋ', '感情；情绪', '感觉；感受', '看法'],
  know: ['nəʊ', '知道；了解', '认识', '确信'],
  little: ['ˈlɪtəl', '小的；年幼的', '不多的', '少量'],
  dear: ['dɪə', '亲爱的', '珍贵的', '昂贵的'],
  hear: ['hɪə', '听见', '得知；听说', '审理'],
  reply: ['rɪˈplaɪ', '回答；答复', '回应'],
  property: ['ˈprɒpəti', '财产；所有物', '房产', '性质；特性'],
  family: ['ˈfæməli', '家庭；家人', '家族', '同类事物'],
  neighbourhood: ['ˈneɪbəhʊd', '街区；邻近地区', '附近'],
  however: ['haʊˈevə', '然而；不过', '无论如何'],
}
export const lemmas: Record<string, string> = { acknowledged: 'acknowledge', acknowledges: 'acknowledge', runs: 'run', running: 'run', ran: 'run', children: 'child', books: 'book', feelings: 'feeling', known: 'know', knew: 'know', heard: 'hear', replied: 'reply', families: 'family', gardens: 'garden' }
export function normalize(word: string) { const clean = word.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, ''); return lemmas[clean] ?? clean }
const verbs = new Set(['acknowledge', 'run', 'want', 'hear', 'reply', 'know'])
const adjectives = new Set(['extraordinary', 'single', 'quiet', 'little', 'dear'])
export function getEntry(word: string): DictionaryEntry | null {
  const lemma = normalize(word), value = definitions[lemma]
  if (!value) return null
  return { lemma, ipa: `/${value[0]}/`, source: '示例词典数据', senses: value.slice(1).map((meaning, i) => ({ pos: verbs.has(lemma) ? 'v.' : adjectives.has(lemma) ? 'adj.' : lemma.endsWith('ly') || lemma === 'however' ? 'adv.' : 'n.', meaning: String(meaning), ...(i > 2 && lemma === 'run' ? { pos: 'n.' } : {}) })) }
}

export const translationSamples: Record<string, string> = {
  'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.': '凡是有钱的单身汉，总想娶位太太，这已经成了一条举世公认的道理。',
  'He runs every morning.': '他每天早晨跑步。',
  'She runs a business.': '她经营着一家企业。',
  'The children were running through the garden, carrying books and laughing together.': '孩子们拿着书，笑着跑过花园。',
  'She runs through the garden.': '她跑过花园。',
  'The children run beside the old stone wall.': '孩子们沿着古老的石墙奔跑。',
  'The storm gathered above the garden.': '暴风雨在花园上空酝酿。',
}
