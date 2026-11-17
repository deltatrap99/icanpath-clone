/* Browser-local assessment demo. No assessment, audio, name or writing is sent to a server. */
(function () {
  'use strict';
  const D = window.ICanDemo;
  const KEYS = ['U', 'L', 'R', 'S', 'W'];
  const SKILL = { U: 'Từ vựng & Ngữ pháp', L: 'Nghe', R: 'Đọc', S: 'Nói', W: 'Viết' };
  const MINUTES = { U: 3, L: 7, R: 6, S: 7, W: 7 };
  const MAX = { U: 6, L: 8, R: 6, S: 2, W: 1 };
  const LEVELS = ['Pre-A1', 'A1', 'A2', 'B1', 'B2', 'C1'];
  const bandOf = (g) => g <= 5 ? '3-5' : g <= 8 ? '6-8' : '9-11';
  const copy = (x) => JSON.parse(JSON.stringify(x));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const cefr = (n) => n == null ? null : LEVELS[[0.5, 1.5, 2.5, 3.5, 4.5].filter((v) => n >= v).length];
  const header = (hs, key) => Object.entries(hs || {}).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1];
  const response = (data, status) => D.ok(data, status || 200);
  const fail = (status, message, error) => D.fail(status, message, error);
  const countWords = (text) => (String(text || '').match(/[A-Za-z'’-]+/g) || []).length;

  // Each row has a stem, four choices, the correct index and a difficulty. The
  // runner selects unattempted items nearest the current estimated difficulty.
  const GRAMMAR = {
    '3-5': [
      ['I ___ a student.', ['am', 'is', 'are', 'be'], 0, 0.3],
      ['Look! It is a 🐱. What is it?', ['a dog', 'a cat', 'a bird', 'a fish'], 1, 0.2],
      ['There are two ___ on the table.', ['book', 'a book', 'books', 'booking'], 2, 0.6],
      ['She ___ a red school bag.', ['have', 'has', 'having', 'to have'], 1, 0.8],
      ['We play football ___ Sunday.', ['in', 'at', 'on', 'to'], 2, 1.0],
      ['My brother ___ milk every morning.', ['drink', 'drinks', 'drinking', 'is drink'], 1, 1.2],
      ['The elephant is ___ than the mouse.', ['big', 'bigger', 'biggest', 'more big'], 1, 1.3],
      ['What ___ you doing? — I am reading.', ['am', 'is', 'are', 'be'], 2, 1.4],
      ['Yesterday, we ___ to the park.', ['go', 'goes', 'going', 'went'], 3, 1.6],
      ['There isn’t ___ water in my bottle.', ['some', 'any', 'many', 'a'], 1, 1.7],
      ['You ___ run in the school library.', ['must', 'mustn’t', 'can to', 'are'], 1, 1.8],
      ['I am going ___ my grandmother tomorrow.', ['visit', 'visiting', 'to visit', 'visited'], 2, 2.0],
    ],
    '6-8': [
      ['She usually ___ to school by bike.', ['go', 'goes', 'going', 'gone'], 1, 1.0],
      ['They ___ dinner when I called.', ['have', 'had', 'were having', 'are having'], 2, 1.7],
      ['There are ___ apples left in the basket.', ['a little', 'much', 'a few', 'any'], 2, 1.4],
      ['My town is ___ than it was ten years ago.', ['busy', 'busier', 'busiest', 'more busy'], 1, 1.6],
      ['I have lived in this city ___ 2020.', ['for', 'since', 'during', 'from'], 1, 2.0],
      ['If it rains tomorrow, we ___ at home.', ['stay', 'stayed', 'will stay', 'would stay'], 2, 2.2],
      ['The book ___ you lent me was fascinating.', ['who', 'where', 'that', 'whose'], 2, 2.5],
      ['This bridge ___ more than fifty years ago.', ['built', 'is building', 'was built', 'has building'], 2, 2.6],
      ['I wish I ___ more time to practise English.', ['have', 'had', 'will have', 'am having'], 1, 2.8],
      ['He suggested ___ a school recycling club.', ['start', 'to start', 'starting', 'started'], 2, 3.0],
      ['You won’t improve ___ you practise regularly.', ['unless', 'although', 'because', 'while'], 0, 3.2],
      ['Despite ___ tired, she finished the project.', ['be', 'was', 'being', 'to be'], 2, 3.4],
    ],
    '9-11': [
      ['We need to ___ a decision before Friday.', ['do', 'make', 'take up', 'get'], 1, 2.1],
      ['By the time we arrived, the film ___.', ['starts', 'has started', 'had started', 'was starting'], 2, 2.7],
      ['If I had known about the event, I ___ you.', ['would join', 'will join', 'would have joined', 'joined'], 2, 3.2],
      ['The teacher encouraged us ___ more widely.', ['read', 'reading', 'to read', 'reads'], 2, 2.5],
      ['The project was completed ___ the tight deadline.', ['although', 'despite', 'because', 'even'], 1, 3.0],
      ['I am looking forward ___ from you soon.', ['hear', 'to hear', 'to hearing', 'hearing'], 2, 3.3],
      ['The new policy will have a significant ___ on students.', ['affect', 'effect', 'effort', 'event'], 1, 3.5],
      ['Not only ___ the test, but she also won a scholarship.', ['she passed', 'did she pass', 'she did pass', 'has passed she'], 1, 3.8],
      ['Had I been informed earlier, I ___ the arrangements.', ['change', 'will change', 'would change', 'would have changed'], 3, 4.0],
      ['The evidence is far from ___; further research is needed.', ['conclusive', 'concluding', 'concluded', 'conclusion'], 0, 4.2],
      ['It is essential that every applicant ___ the form.', ['completes', 'complete', 'completed', 'is completing'], 1, 4.4],
      ['The proposal was met with considerable ___ from residents.', ['resistant', 'resistance', 'resist', 'resisting'], 1, 4.7],
    ],
  };

  const LISTENING = {
    '3-5': [
      ['A: What is your favourite colour? B: I like blue. My bag is blue too.', 'What is the child’s favourite colour?', ['Red', 'Blue', 'Green', 'Yellow'], 1, 0.3],
      ['A: How many pets have you got? B: I have two cats and one dog.', 'How many cats has the child got?', ['One', 'Two', 'Three', 'Four'], 1, 0.6],
      ['A: Where is Lucy? B: She is in the garden with her dad.', 'Where is Lucy?', ['In the kitchen', 'At school', 'In the garden', 'In the bedroom'], 2, 0.8],
      ['A: What would you like for lunch? B: Some rice and chicken, please.', 'What would the child like?', ['Rice and chicken', 'Bread and milk', 'Fish and soup', 'Cake and juice'], 0, 1.0],
      ['A: Shall we play tennis? B: It is raining. Let’s read a story inside.', 'What will the children do?', ['Play tennis', 'Read a story', 'Go swimming', 'Fly a kite'], 1, 1.2],
      ['A: What time do you get up? B: At half past six. I leave home at seven.', 'What time does the child get up?', ['Six o’clock', 'Half past six', 'Seven o’clock', 'Half past seven'], 1, 1.4],
      ['A: Did you go to the zoo yesterday? B: No, it was closed. We went to the museum.', 'Where did they go yesterday?', ['The zoo', 'The park', 'The museum', 'The beach'], 2, 1.7],
      ['A: Is your new teacher tall? B: Yes. She has short brown hair and wears glasses.', 'What does the teacher look like?', ['Short with long hair', 'Tall with short brown hair', 'Tall with long black hair', 'Short with glasses'], 1, 1.9],
      ['A: When is your birthday party? B: On Saturday afternoon. Please come at three.', 'When does the party start?', ['Saturday at three', 'Sunday at three', 'Saturday at four', 'Friday at three'], 0, 2.1],
    ],
    '6-8': [
      ['A: Do we have maths first today? B: No, the timetable changed. English is first, then science.', 'What is the first lesson today?', ['Maths', 'English', 'Science', 'History'], 1, 1.1],
      ['A: How are you going to the sports centre? B: I usually cycle, but my bike is broken, so I’ll take the bus today.', 'How will the speaker travel today?', ['By bike', 'By train', 'By bus', 'On foot'], 2, 1.6],
      ['A: How much is the club membership? B: It is twelve pounds a month, but students pay only eight.', 'How much do students pay each month?', ['Four pounds', 'Eight pounds', 'Twelve pounds', 'Twenty pounds'], 1, 1.8],
      ['A: Is the library open until six? B: On weekdays, yes. But today is Saturday, so it closes at four.', 'When does the library close today?', ['At two', 'At four', 'At six', 'At eight'], 1, 2.0],
      ['A: Shall we meet outside the cinema? B: It’s too crowded there. Let’s meet at the café next door at half past five.', 'Where will they meet?', ['Inside the cinema', 'At the bus stop', 'At the café', 'At school'], 2, 2.3],
      ['A: Did you enjoy the camping trip? B: The weather was awful, but sharing stories around the fire made it worthwhile.', 'What did the speaker enjoy most?', ['The weather', 'The food', 'The stories', 'The journey'], 2, 2.6],
      ['Our school is collecting used books this week. Please bring them to room twelve before Thursday afternoon. The books will go to a village school.', 'What should students bring?', ['New notebooks', 'Used books', 'Money', 'School uniforms'], 1, 2.8],
      ['A: I thought the exhibition would be dull. B: So did I, but the interactive displays completely changed my mind.', 'What do both speakers think about the exhibition now?', ['It is too expensive', 'It is disappointing', 'It is interesting', 'It is difficult to find'], 2, 3.1],
      ['The football match has been postponed because of heavy rain. Tickets remain valid for next Tuesday. Anyone unable to attend may request a refund by Friday.', 'What can people who cannot attend do?', ['Use the ticket on Friday', 'Request a refund by Friday', 'Buy another ticket', 'Attend a different sport'], 1, 3.3],
    ],
    '9-11': [
      ['A: Have you chosen a university course? B: I was considering economics, but the open day convinced me that environmental science suits my interests better.', 'Which course is the speaker most likely to choose?', ['Economics', 'Environmental science', 'History', 'Computer science'], 1, 2.2],
      ['The workshop begins at nine thirty rather than ten as originally advertised. Participants should arrive fifteen minutes early to register.', 'When should participants arrive?', ['Nine o’clock', 'Nine fifteen', 'Nine thirty', 'Ten o’clock'], 1, 2.5],
      ['A: How did the interview go? B: Better than expected. They seemed more interested in my volunteering than my exam results.', 'What particularly interested the interviewers?', ['Exam results', 'Work experience abroad', 'Volunteering', 'Sporting achievements'], 2, 2.8],
      ['A: Shall we submit our report tonight? B: I would rather check the references one more time. A small delay is better than an inaccurate report.', 'What does the second speaker suggest?', ['Submitting immediately', 'Checking references first', 'Removing the references', 'Writing a shorter report'], 1, 3.0],
      ['The speaker argues that technology can widen access to education, provided schools invest equally in teacher training. Equipment alone rarely changes learning outcomes.', 'What does the speaker consider essential?', ['More expensive equipment', 'Smaller school buildings', 'Teacher training alongside technology', 'Replacing teachers with technology'], 2, 3.4],
      ['A: The city’s cycle lanes are controversial. B: Perhaps, but judging them after only a fortnight seems premature. We need evidence over a longer period.', 'What is the speaker’s attitude?', ['Strongly opposed', 'Cautiously open-minded', 'Completely indifferent', 'Immediately enthusiastic'], 1, 3.7],
      ['Although the research team initially attributed the decline to climate conditions, subsequent analysis revealed that habitat loss was the predominant factor.', 'What was the main cause of the decline?', ['Climate conditions', 'Habitat loss', 'Inaccurate analysis', 'A shortage of researchers'], 1, 4.0],
      ['A: Was the documentary persuasive? B: Its personal stories were compelling, though the absence of opposing viewpoints somewhat undermined its credibility.', 'What criticism does the speaker make?', ['The stories were uninteresting', 'It was too long', 'It lacked balanced viewpoints', 'It used too much technical language'], 2, 4.3],
      ['The lecturer questions the assumption that urban density necessarily diminishes wellbeing. With thoughtful planning, compact neighbourhoods may actually strengthen social ties.', 'What does the lecturer suggest?', ['Density always reduces wellbeing', 'Compact areas can support communities', 'Planning has little impact', 'People should leave cities'], 1, 4.6],
    ],
  };

  const READING = {
    '3-5': [
      ['My school bag', 'My name is Ben. My school bag is green. In my bag, I have three books, a pencil and an apple.', 'What colour is Ben’s bag?', ['Red', 'Green', 'Blue', 'Black'], 1, 0.3],
      ['At the park', 'It is Sunday. Lucy is at the park with her brother. Lucy rides her bike. Her brother plays football.', 'What does Lucy do?', ['Plays football', 'Swims', 'Rides her bike', 'Reads a book'], 2, 0.7],
      ['A birthday party', 'Tom is ten today. His friends come to his house at three o’clock. They play games and eat a chocolate cake.', 'What do they eat?', ['Ice cream', 'A chocolate cake', 'Fruit salad', 'Sandwiches'], 1, 1.0],
      ['A message', 'Hi Anna! Please bring your swimming costume tomorrow. We are going to the pool after lunch. Mum will take us there.', 'Where will they go tomorrow?', ['To school', 'To the zoo', 'To the pool', 'To a restaurant'], 2, 1.3],
      ['The lost puppy', 'Mia found a puppy near the school gate. It had a blue collar. She took it to her teacher, who called the owner. The owner was very happy.', 'How did the puppy get home?', ['Mia kept it', 'The teacher called the owner', 'It ran away', 'The owner was at school'], 1, 1.6],
      ['Our class garden', 'Our class planted beans in March. We watered them every morning. By May, the plants were taller than our rulers. We picked the beans and cooked them for lunch.', 'Why did the children water the beans?', ['To help them grow', 'To make lunch colder', 'To clean the rulers', 'To stop the rain'], 0, 1.9],
      ['A useful umbrella', 'It was sunny when Jack left home, but his mother asked him to take an umbrella. Later, heavy rain started. Jack shared his umbrella with his friend on the way home.', 'Why was Jack glad he had an umbrella?', ['It was very hot', 'His friend was lost', 'It started to rain', 'He wanted to play'], 2, 2.1],
    ],
    '6-8': [
      ['School notice', 'The school science club meets every Wednesday at 3:30 p.m. in room 12. New members are welcome. Please bring a notebook, but all experiment materials are provided.', 'What should new members bring?', ['Experiment materials', 'A notebook', 'A school uniform', 'A laptop'], 1, 1.2],
      ['A message from Mai', 'Hi Sam, I can’t meet you at the library at four because my music lesson finishes later than usual. Could we meet at five instead? I will bring the history notes you asked for.', 'Why is Mai writing?', ['To cancel her music lesson', 'To change the meeting time', 'To ask for history notes', 'To invite Sam to a concert'], 1, 1.7],
      ['A greener school', 'Students at River School used to throw away hundreds of plastic bottles each week. After the school installed water refill stations, most students started bringing reusable bottles. The amount of plastic waste has fallen by nearly half.', 'What helped reduce plastic waste?', ['Selling cheaper drinks', 'Installing refill stations', 'Closing the school shop', 'Collecting more rubbish bins'], 1, 2.1],
      ['Learning through mistakes', 'When Minh first joined the drama club, he was afraid of forgetting his lines. His teacher explained that mistakes were part of learning. After several rehearsals, Minh became more confident and even helped younger students.', 'What is the main message of the text?', ['Only talented students should act', 'Teachers should learn every line', 'Practice and accepting mistakes build confidence', 'Drama is easier than other subjects'], 2, 2.5],
      ['The reading challenge', 'Our library introduced a reading challenge to encourage pupils to try unfamiliar genres. Participants did not have to finish a fixed number of books. Instead, they wrote short reviews explaining what they had discovered. The librarian valued thoughtful responses more than speed.', 'What mattered most in the challenge?', ['Reading quickly', 'Finishing many books', 'Choosing only familiar books', 'Reflecting on the books'], 3, 2.9],
      ['A new bus service', 'A survey found that many students were driven to school because the bus timetable was unreliable. The council introduced more frequent morning services. Although some parents remained doubtful, bus use doubled over the next term.', 'What can be inferred from the text?', ['All parents supported the change immediately', 'Better reliability encouraged more students to use buses', 'Driving became less expensive', 'The council stopped morning services'], 1, 3.2],
      ['Different ways to learn', 'Online lessons can be convenient, but convenience does not guarantee effective learning. Students benefit when they plan regular study periods, ask questions and discuss ideas with others. The most successful learners treat online lessons as active participation rather than passive watching.', 'According to the text, successful online learners should…', ['Watch as many videos as possible', 'Avoid asking questions', 'Take an active role in learning', 'Study only when convenient'], 2, 3.5],
    ],
    '9-11': [
      ['Volunteering at a food bank', 'When Linh began volunteering at a food bank, she expected mainly to pack boxes. Instead, she spent much of her time listening to visitors and helping them find other local services. The experience challenged her assumptions about what practical support involves.', 'What did Linh discover?', ['Packing boxes was unnecessary', 'Support includes listening and connecting people to services', 'Visitors preferred to work alone', 'Local services were closing'], 1, 2.3],
      ['An exchange programme', 'Applicants for the exchange programme must submit a personal statement by 15 March. Academic references may arrive up to one week later, but incomplete applications will not be considered after 22 March. Interviews will take place in April.', 'Which statement is correct?', ['All documents are due on 15 March', 'References may arrive after the personal statement deadline', 'Interviews take place in March', 'Late personal statements are accepted until April'], 1, 2.7],
      ['Rethinking productivity', 'The assumption that longer working hours lead to greater productivity has been questioned by recent studies. Employees given greater control over their schedules often produce more, partly because they can work when their concentration is strongest. However, flexibility requires clear communication rather than the absence of structure.', 'What is the writer’s main point?', ['Longer hours always reduce output', 'Flexible schedules can help when supported by clear communication', 'Workplaces should remove all structure', 'Employees should work only in the morning'], 1, 3.1],
      ['Urban green spaces', 'Urban parks are frequently valued for recreation, yet their benefits extend beyond leisure. Trees moderate summer temperatures, absorb rainfall and provide habitats for wildlife. When planners treat green space as essential infrastructure rather than decoration, cities become more resilient.', 'The phrase “essential infrastructure” suggests parks should be…', ['Considered a necessary part of city planning', 'Built only for tourists', 'Replaced by new roads', 'Managed exclusively by volunteers'], 0, 3.5],
      ['Evaluating information', 'A striking statistic can give an argument the appearance of authority. Readers should nevertheless ask how the data were collected, whether the sample represents the wider population, and what has been omitted. Critical evaluation does not mean rejecting every claim; it means matching confidence to the quality of evidence.', 'Which attitude does the writer recommend?', ['Reject all statistics', 'Accept claims from confident speakers', 'Evaluate evidence before deciding how much to trust a claim', 'Focus only on the size of numbers'], 2, 3.9],
      ['The limits of prediction', 'Forecasts are often judged solely by whether a predicted event occurs. Yet a forecast assigning a twenty percent probability to an event is not necessarily wrong when that event happens. A sound assessment requires examining many predictions and asking whether their probabilities correspond to observed frequencies.', 'Why can a single outcome be a poor measure of forecast quality?', ['Probabilities have no practical meaning', 'A low-probability event may still occur', 'Forecasters never use data', 'All forecasts are equally reliable'], 1, 4.3],
      ['Preserving cultural heritage', 'Digitising historic manuscripts broadens access while reducing the handling of fragile originals. Nevertheless, digital copies cannot capture every material feature, and the technology used to store them may itself become obsolete. Preservation therefore demands an ongoing commitment to both physical conservation and digital maintenance.', 'What is implied about digitisation?', ['It eliminates the need to conserve originals', 'It is a complete and permanent solution', 'It offers benefits but requires continued care', 'It makes manuscripts less accessible'], 2, 4.6],
    ],
  };

  function bank(section, band) {
    const source = section === 'U' ? GRAMMAR[band] : section === 'L' ? LISTENING[band] : READING[band];
    return source.map((row, i) => {
      let payload, correct, difficulty;
      if (section === 'U') {
        const [stem, options, c, diff] = row; correct = c; difficulty = diff;
        payload = { stem, options, cert_task: band === '9-11' ? 'Cambridge B2 First · Use of English' : band === '6-8' ? 'Cambridge A2 Key · Use of English' : 'Cambridge Young Learners' };
      } else if (section === 'L') {
        const [audio_script, stem, options, c, diff] = row; correct = c; difficulty = diff;
        payload = { audio_script, stem, options, cert_task: band === '9-11' ? 'Cambridge B2 First · Listening' : band === '6-8' ? 'Cambridge A2 Key · Listening' : 'Cambridge Young Learners · Listening' };
        if (D.audio?.[audio_script]) payload.audio_url = D.audio[audio_script];
      } else {
        const [title, passage, stem, options, c, diff] = row; correct = c; difficulty = diff;
        payload = { title, passage, stem, options, cert_task: band === '9-11' ? 'Cambridge B1 Preliminary · Reading' : band === '6-8' ? 'Cambridge A2 Key · Reading' : 'Cambridge Young Learners · Reading' };
        if (i === 5 && band !== '3-5') payload.image = { alt: 'Số học sinh sử dụng xe buýt tăng sau khi cải thiện lịch chạy', chart: { type: 'bar', title: 'Students travelling by bus', labels: ['Before', 'After'], series: [{ name: 'Students', values: [40, 80] }] } };
      }
      return { id: `${band}-${section}-${i + 1}`, format: section === 'U' ? 'mcq' : section === 'L' ? 'listening_mcq' : 'reading_mcq', payload, correct, difficulty };
    });
  }

  const SPEAKING = {
    '3-5': [
      { format: 'read_aloud', payload: { text: 'My favourite animal is a cat. It is small and very friendly.' } },
      { format: 'speaking', payload: { question: 'Tell us about your favourite animal.', hint_vi: 'Em thích con gì? Nó có màu gì? Nó có thể làm gì?', seconds: 30 } },
    ],
    '6-8': [
      { format: 'read_aloud', payload: { text: 'Learning a new language helps us understand different people and discover the world.' } },
      { format: 'speaking', payload: { question: 'Describe an activity you enjoy doing after school.', bullets: ['what the activity is', 'when and where you do it', 'who you do it with', 'why you enjoy it'], hint_vi: 'Nói về một hoạt động sau giờ học mà em yêu thích.', seconds: 60, cert_task: 'Cambridge B1 Preliminary · Speaking' } },
    ],
    '9-11': [
      { format: 'read_aloud', payload: { text: 'Although technology has transformed the way we communicate, face-to-face conversations remain essential for building meaningful relationships.' } },
      { format: 'speaking', payload: { question: 'Describe a person who has had a positive influence on your life.', bullets: ['who this person is', 'how you know this person', 'what this person has done', 'and explain why this person has influenced you'], hint_vi: 'Nói về một người có ảnh hưởng tích cực đến cuộc sống của em.', seconds: 60, cert_task: 'IELTS Speaking · Part 2' } },
    ],
  };
  const WRITING = {
    '3-5': { prompt: 'Write 3–5 sentences about your best friend. Say their name, what they look like and what you like doing together.', prompt_vi: 'Viết 3–5 câu về người bạn thân: tên, ngoại hình và hoạt động hai em thích làm cùng nhau.', min_words: 25, max_words: 50 },
    '6-8': { prompt: 'Your English friend wants to know about your school. Write an email describing your school, your favourite subject and one activity you enjoy. Write about 60–80 words.', prompt_vi: 'Viết email cho bạn người Anh, giới thiệu trường, môn học yêu thích và một hoạt động em thích ở trường.', min_words: 60, max_words: 80, cert_task: 'Cambridge A2 Key · Writing' },
    '9-11': { prompt: 'Your school food magazine is looking for articles. Write an article about a Vietnamese dish you enjoy. Explain how to prepare it and how to make it nutritious. Write about 80–120 words.', prompt_vi: 'Viết bài cho tạp chí ẩm thực của trường về một món ăn Việt Nam: cách chế biến và cách làm món ăn bổ dưỡng hơn.', min_words: 80, max_words: 120, cert_task: 'Cambridge B1 Preliminary · Writing Part 2', genre: 'article' },
  };

  function campaignByCode(code) {
    const c = D.db.campaigns.find((x) => String(x.join_code).toUpperCase() === String(code || '').trim().toUpperCase());
    if (!c) return fail(404, 'Mã tham gia không tồn tại. Em hãy kiểm tra lại mã do thầy cô cung cấp.', 'invalid_join_code');
    if (c.status !== 'open') return fail(403, 'Đợt kiểm tra đã đóng. Em vui lòng liên hệ thầy cô.', 'campaign_closed');
    return c;
  }
  function getSession(options) {
    const token = String(header(options.headers, 'authorization') || '').replace(/^Bearer\s+/i, '');
    const s = D.db.sessions[token];
    if (!s) return fail(401, 'Phiên làm bài không còn hiệu lực. Em hãy nhập lại mã tham gia.', 'unauthorized');
    s.answers ||= []; s.speaking ||= []; s.progress ||= {};
    return s;
  }
  function taskList(s, section) {
    if (section === 'S') return SPEAKING[bandOf(s.student.grade)].map((t, i) => ({ ...copy(t), id: `${s.token}-S-${i + 1}`, status: (s.speaking || []).some((r) => r.item_id === `${s.token}-S-${i + 1}`) ? 'scored' : 'open' }));
    if (section === 'W') return [{ id: `${s.token}-W-1`, format: 'writing', payload: copy(WRITING[bandOf(s.student.grade)]), status: s.writing ? 'scored' : 'open' }];
    return [];
  }
  function selectItem(s) {
    if (!['U', 'L', 'R'].includes(s.section)) return null;
    const rows = bank(s.section, bandOf(s.student.grade));
    if (s.current_item) { const existing = rows.find((x) => x.id === s.current_item); if (existing) return existing; }
    const past = s.answers.filter((x) => x.section === s.section);
    const baseline = bandOf(s.student.grade) === '3-5' ? 0.8 : bandOf(s.student.grade) === '6-8' ? 2.0 : 3.2;
    const target = clamp(baseline + past.reduce((n, a) => n + (a.correct ? 0.35 : -0.3), 0), 0, 5);
    const used = new Set(past.map((x) => x.item_id));
    const next = rows.filter((x) => !used.has(x.id)).sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target))[0];
    s.current_item = next?.id || null;
    return next || null;
  }
  function advance(s) {
    if (s.section === 'done') return;
    s.progress[s.section] = { ...(s.progress[s.section] || {}), end: Date.now() };
    const next = KEYS[KEYS.indexOf(s.section) + 1] || 'done';
    s.section = next; s.current_item = null;
    s.deadline = next === 'done' ? null : Date.now() + MINUTES[next] * 60000;
    if (next === 'done') s.ready_to_finish = true;
    D.save();
  }
  function view(s, expire = true) {
    if (expire && s.status !== 'completed' && s.deadline && s.deadline <= Date.now()) advance(s);
    const section = s.status === 'completed' ? 'done' : s.section;
    const sections = KEYS.map((key) => ({ key, max: MAX[key], answered: key === 'S' ? s.speaking.length : key === 'W' ? (s.writing ? 1 : 0) : s.answers.filter((a) => a.section === key).length, end: s.progress[key]?.end || (s.status === 'completed' ? s.completed_at || 1 : null) }));
    const result = { server_now: Date.now(), deadline: s.deadline, band: bandOf(s.student.grade), status: s.status, section, sections };
    if (['U', 'L', 'R'].includes(section)) { const item = selectItem(s); result.item = item ? { id: item.id, format: item.format, payload: copy(item.payload) } : null; }
    if (['S', 'W'].includes(section)) result.tasks = taskList(s, section);
    D.save();
    return result;
  }
  function ensureCurrent(s, itemId) {
    if (s.status === 'completed') return fail(409, 'Bài làm đã hoàn thành.', 'session_completed');
    if (s.deadline && s.deadline <= Date.now()) { advance(s); return fail(409, 'Hết thời gian phần này.', 'section_time_over'); }
    const item = selectItem(s);
    if (!item || item.id !== itemId) return fail(409, 'Câu hỏi đã thay đổi. Em vui lòng thử lại.', 'not_current_item');
    return item;
  }

  const UNITS = [
    {
      code: 'A2-U01', level: 'ICAN A2', cefr: 'A2', title: 'My daily life', grammar: 'Present simple · Adverbs of frequency',
      lesson: {
        summary_vi: 'Nói về thói quen hằng ngày và sắp xếp một ngày học tập cân bằng.',
        vocab: [
          { word: 'routine', meaning_vi: 'thói quen hằng ngày', example: 'My morning routine starts at six thirty.' },
          { word: 'usually', meaning_vi: 'thường xuyên', example: 'I usually walk to school with my friends.' },
          { word: 'prepare', meaning_vi: 'chuẩn bị', example: 'I prepare my school bag in the evening.' },
          { word: 'healthy', meaning_vi: 'lành mạnh, tốt cho sức khỏe', example: 'A healthy breakfast helps me study well.' },
        ],
        grammar_vi: 'Dùng thì hiện tại đơn để nói về thói quen. Với he/she/it, thêm -s hoặc -es vào động từ. Trạng từ tần suất đứng trước động từ thường.',
        grammar_examples: ['I usually get up at six.', 'She walks to school every day.', 'We do not watch TV before school.'],
        can_do_vi: ['Mô tả một ngày đi học bằng 4–5 câu.', 'Dùng usually, sometimes và never đúng vị trí.', 'Đặt câu hỏi về thói quen của bạn.'],
        speaking_practice: ['I usually get up at half past six.', 'My favourite part of the day is the afternoon.', 'I prepare my school bag before I go to bed.'],
      },
    },
    {
      code: 'A2-U02', level: 'ICAN A2', cefr: 'A2', title: 'A memorable weekend', grammar: 'Past simple · Sequencing words',
      lesson: {
        summary_vi: 'Kể lại một cuối tuần đáng nhớ với các từ nối chỉ trình tự.',
        vocab: [
          { word: 'memorable', meaning_vi: 'đáng nhớ', example: 'We had a memorable weekend by the sea.' },
          { word: 'explore', meaning_vi: 'khám phá', example: 'We explored the old town on foot.' },
          { word: 'afterwards', meaning_vi: 'sau đó', example: 'Afterwards, we had lunch in a small café.' },
          { word: 'experience', meaning_vi: 'trải nghiệm', example: 'It was an exciting experience for everyone.' },
        ],
        grammar_vi: 'Dùng quá khứ đơn cho sự việc đã kết thúc. Động từ có quy tắc thêm -ed; động từ bất quy tắc cần học riêng, ví dụ go → went và see → saw.',
        grammar_examples: ['Last Saturday, I visited my grandparents.', 'First, we cooked lunch. Then, we played a game.', 'We went home at five o’clock.'],
        can_do_vi: ['Kể lại một trải nghiệm trong quá khứ.', 'Dùng first, then, after that và finally.', 'Nhận biết động từ quá khứ thường gặp.'],
        speaking_practice: ['Last weekend, I visited my grandparents.', 'First, we explored the town. Then, we had lunch.', 'It was a wonderful experience that I will always remember.'],
      },
    },
    {
      code: 'B1-U03', level: 'ICAN B1', cefr: 'B1', title: 'Food and healthy choices', grammar: 'Countable nouns · Quantifiers · Giving instructions',
      lesson: {
        summary_vi: 'Giới thiệu món ăn Việt Nam và giải thích cách chế biến cân bằng dinh dưỡng.',
        vocab: [
          { word: 'ingredient', meaning_vi: 'nguyên liệu', example: 'Fresh vegetables are an important ingredient in this dish.' },
          { word: 'nutritious', meaning_vi: 'bổ dưỡng', example: 'A nutritious meal includes different food groups.' },
          { word: 'steam', meaning_vi: 'hấp', example: 'Steam the vegetables for five minutes.' },
          { word: 'balanced', meaning_vi: 'cân bằng', example: 'A balanced diet helps us stay healthy.' },
        ],
        grammar_vi: 'Dùng some, a few với danh từ đếm được; a little với danh từ không đếm được. Khi hướng dẫn nấu ăn, dùng động từ nguyên mẫu và các từ nối trình tự.',
        grammar_examples: ['Add a few slices of carrot.', 'Use a little oil and some fresh herbs.', 'First, wash the vegetables. Finally, serve the dish warm.'],
        can_do_vi: ['Giới thiệu nguyên liệu và cách nấu một món ăn.', 'Phân biệt a few và a little.', 'Viết đoạn hướng dẫn ngắn có trình tự rõ ràng.'],
        speaking_practice: ['My favourite Vietnamese dish is fresh spring rolls.', 'First, prepare the vegetables and cook the noodles.', 'You can make this dish healthier by adding more vegetables.'],
      },
    },
    {
      code: 'B1-U04', level: 'ICAN B1', cefr: 'B1', title: 'Making a difference', grammar: 'First conditional · Giving reasons and opinions',
      lesson: {
        summary_vi: 'Nêu ý kiến và đề xuất hành động giúp trường học, cộng đồng xanh hơn.',
        vocab: [
          { word: 'community', meaning_vi: 'cộng đồng', example: 'Small actions can make our community a better place.' },
          { word: 'reduce', meaning_vi: 'giảm', example: 'We can reduce waste by reusing bottles.' },
          { word: 'volunteer', meaning_vi: 'tình nguyện viên; làm tình nguyện', example: 'I volunteer at the local library on Saturdays.' },
          { word: 'responsibility', meaning_vi: 'trách nhiệm', example: 'Protecting the environment is everyone’s responsibility.' },
        ],
        grammar_vi: 'Câu điều kiện loại 1 diễn tả điều có thể xảy ra: If + hiện tại đơn, will + động từ nguyên mẫu. Dùng because, so và in my opinion để giải thích ý kiến.',
        grammar_examples: ['If we recycle more, we will produce less waste.', 'In my opinion, every school should have a green club.', 'I bring a reusable bottle because it reduces plastic waste.'],
        can_do_vi: ['Đưa ra một đề xuất giúp cộng đồng.', 'Giải thích lý do và kết quả có thể xảy ra.', 'Nói một phút về một vấn đề gần gũi.'],
        speaking_practice: ['In my opinion, small actions can make a big difference.', 'If we work together, we will create a greener school.', 'I would like to volunteer because I enjoy helping other people.'],
      },
    },
  ];

  function sampleSession(s) { return !!(s.fixture || s.sample || s.token === 'session-demo' || (!s.created_at && s.status === 'completed' && !(s.answers || []).length)); }
  function skillScore(s, key, fixture) {
    if (fixture) {
      const scores = s.demo_scores || { U: 2.8, L: 3.1, R: 2.7, S: 2.4, W: 2.0 };
      const theta = scores[key] ?? scores.overall ?? 2.5;
      return { theta, cefr: cefr(theta), status: 'scored', illustrative: true };
    }
    if (['U', 'L', 'R'].includes(key)) {
      const rows = (s.answers || []).filter((a) => a.section === key && a.choice >= 0);
      if (!rows.length) return { theta: null, cefr: null, status: 'insufficient' };
      const accuracy = rows.filter((a) => a.correct).length / rows.length;
      const avgDifficulty = rows.reduce((n, a) => n + a.difficulty, 0) / rows.length;
      const theta = Math.round(clamp(avgDifficulty + (accuracy - 0.5) * 1.6, 0.1, 4.9) * 100) / 100;
      return { theta, cefr: cefr(theta), status: 'scored', answered: rows.length, correct: rows.filter((a) => a.correct).length, illustrative: true };
    }
    if (key === 'S') {
      const submitted = (s.speaking || []).filter((x) => x.duration_ms >= 1200);
      if (!submitted.length) return { theta: null, cefr: null, status: 'insufficient' };
      const theta = bandOf(s.student.grade) === '3-5' ? 1.2 : bandOf(s.student.grade) === '6-8' ? 2.1 : 2.6;
      return { theta, cefr: cefr(theta), status: 'scored', illustrative: true };
    }
    const words = countWords(s.writing?.text);
    if (!words) return { theta: null, cefr: null, status: 'insufficient' };
    const target = WRITING[bandOf(s.student.grade)].min_words;
    const theta = Math.round(clamp((bandOf(s.student.grade) === '3-5' ? 0.8 : bandOf(s.student.grade) === '6-8' ? 1.5 : 2.0) + Math.min(1, words / target) * 0.7, 0.1, 4.0) * 100) / 100;
    return { theta, cefr: cefr(theta), status: 'scored', illustrative: true };
  }

  D.makeResult = function makeResult(s) {
    const fixture = sampleSession(s);
    const sk = Object.fromEntries(['L', 'R', 'S', 'W'].map((k) => [k, skillScore(s, k, fixture)]));
    const scored = Object.keys(sk).filter((k) => sk[k].theta != null).sort((a, b) => sk[b].theta - sk[a].theta);
    const overallTheta = scored.length ? Math.round(scored.reduce((n, k) => n + sk[k].theta, 0) / scored.length * 100) / 100 : null;
    const strongest = scored[0] || 'L', focus = scored[scored.length - 1] || 'W';
    const totalAnswered = (s.answers || []).filter((a) => a.choice >= 0).length;
    const confidence = fixture ? 'medium' : scored.length < 4 || totalAnswered < 12 ? 'low' : 'medium';
    const labels = { L: 'Nghe thông tin chính', R: 'Đọc hiểu nội dung', S: 'Diễn đạt bằng lời nói', W: 'Trình bày ý bằng văn bản' };
    const abilities = { L: 'Nhận biết thông tin chính và chi tiết quen thuộc trong hội thoại ngắn.', R: 'Hiểu ý chính của đoạn văn về chủ đề học tập và đời sống.', S: 'Trình bày ý tưởng về một chủ đề gần gũi bằng câu đơn giản.', W: 'Viết đoạn ngắn có ý chính và một số chi tiết hỗ trợ.' };
    const result = {
      id: s.result_token || 'demo-result', student: copy(s.student),
      overall: { theta: overallTheta, cefr: cefr(overallTheta), estimated: true, note_vi: 'BẢN DEMO: dữ liệu được xử lý và lưu riêng trong trình duyệt này. Điểm Nói, Viết và nhận xét phát âm chỉ minh họa giao diện, không được chấm bằng AI. Điểm trắc nghiệm được tính từ câu trả lời trong bộ câu hỏi mẫu. Kết quả không thay thế đánh giá chính thức hay chứng chỉ CEFR.' },
      skills: sk, use_of_english: skillScore(s, 'U', fixture),
      confidence: { level: confidence, score: fixture ? 78 : Math.min(82, Math.round(totalAnswered / 20 * 70) + scored.length * 5) },
      scoring_issues: [],
      abilities: ['L', 'R', 'S', 'W'].map((skill) => ({ skill, status: sk[skill].theta == null ? 'insufficient' : 'can_do', text_vi: sk[skill].theta == null ? 'Chưa có câu trả lời để nhận xét kỹ năng này. Em có thể luyện tập và làm lại.' : (skill === 'S' || skill === 'W') && !fixture ? 'Đã ghi nhận bài làm trên thiết bị. Nhận xét năng lực trong bản demo chỉ mang tính minh họa.' : abilities[skill] })),
      next_steps: [
        { text_vi: `Luyện ${SKILL[focus].toLowerCase()} 10–15 phút mỗi ngày với chủ đề quen thuộc.` },
        { text_vi: 'Ghi lại 5 từ mới và sử dụng mỗi từ trong một câu có nghĩa.' },
        { text_vi: 'Làm lại bài đánh giá đầy đủ và trao đổi với giáo viên để xác nhận trình độ.' },
      ],
      strengths: scored.slice(0, 3).map((skill) => ({ skill, label_vi: labels[skill], evidence_vi: fixture ? `Dữ liệu mẫu minh họa mức ${sk[skill].cefr}.` : ['S', 'W'].includes(skill) ? 'Đã hoàn thành thao tác nộp bài trong bản demo; chưa có chấm AI thực tế.' : `Trả lời đúng ${sk[skill].correct}/${sk[skill].answered} câu đã làm trong bộ mẫu.` })),
      improvements: [focus, ...['W', 'S', 'R', 'L'].filter((k) => k !== focus)].slice(0, 3).map((skill) => ({ skill, label_vi: `Củng cố kỹ năng ${SKILL[skill].toLowerCase()}`, evidence_vi: sk[skill].theta == null ? 'Cần hoàn thành phần này để có đủ dữ liệu.' : skill === 'W' ? 'Luyện viết đoạn có mở ý, ví dụ và câu kết.' : skill === 'S' ? 'Nghe mẫu và luyện nói rõ từng cụm từ mỗi ngày.' : 'Luyện nhận biết ý chính trước khi tìm thông tin chi tiết.' })),
      self_vs_actual: ['L', 'R', 'S', 'W'].map((skill) => {
        const self = s.profile?.self?.[skill] || (fixture ? 3 : null), actual = sk[skill].theta;
        const delta = actual == null || self == null ? null : actual - self;
        const verdict = delta == null ? 'unknown' : delta > 0.8 ? 'underestimate' : delta < -0.8 ? 'overestimate' : 'match';
        return { skill, skill_vi: SKILL[skill], self_level: self, self_label_vi: self ? ['Mới bắt đầu', 'Có thể làm với trợ giúp', 'Khá tự tin', 'Rất tự tin'][clamp(self - 1, 0, 3)] : '', actual_cefr: sk[skill].cefr, verdict, verdict_vi: verdict === 'unknown' ? 'Chưa đủ dữ liệu để so sánh' : verdict === 'match' ? 'Tự đánh giá khá gần kết quả mẫu' : verdict === 'underestimate' ? 'Em đã làm tốt hơn mức tự đánh giá' : 'Em cần luyện thêm để đạt mức tự tin mong muốn' };
      }),
      learning_path: { purpose: confidence === 'low' ? 'confirm' : 'practice', focus_skill: focus, focus_skill_vi: SKILL[focus], units: UNITS.map((u, i) => ({ step: i + 1, unit: u.code, title: u.title, level: u.level, cefr: u.cefr, focus_vi: i === 0 ? 'Xây nền từ vựng và câu cơ bản' : i === 1 ? 'Kể chuyện có trình tự' : i === 2 ? 'Luyện viết và diễn đạt rõ ý' : 'Nêu ý kiến và giải thích lý do' })) },
      feedback: { speaking: [], writing: [] },
      products: [{ name: 'ICAN Practice / AI Tutor', reason: 'Gợi ý minh họa: luyện tập hằng ngày theo chủ đề và kỹ năng cần củng cố.' }, { name: 'EasyPass', reason: 'Gợi ý minh họa: củng cố kiến thức tiếng Anh ở trường và luyện bài có hướng dẫn.' }],
      sample: fixture,
    };
    if (fixture || (s.speaking || []).length) {
      result.feedback.speaking = (fixture ? taskList(s, 'S') : taskList(s, 'S').filter((t) => s.speaking.some((x) => x.item_id === t.id))).map((t) => ({ format: t.format, prompt: t.payload.text || t.payload.question, criteria: { pronunciation: 3, fluency: 2, language: 3 }, weak_words: [], feedback_vi: 'Nhận xét mẫu: luyện ngắt câu theo cụm ý và nhấn trọng âm của từ. Bản demo chưa phân tích chất lượng giọng nói; các điểm hiển thị chỉ để minh họa báo cáo.' }));
    }
    if (fixture || countWords(s.writing?.text)) {
      result.feedback.writing = [{ word_count: fixture ? 92 : countWords(s.writing.text), criteria: { task: 3, organisation: 3, vocabulary: 2, grammar: 2 }, feedback_vi: 'Nhận xét minh họa: sử dụng câu chủ đề rõ ràng, thêm ví dụ và kiểm tra thì động từ. Bản demo đếm số từ nhưng không chấm chất lượng bài viết bằng AI.', improvements_vi: ['Sắp xếp ý theo mở đoạn, nội dung chính và kết đoạn.', 'Thêm từ nối như first, because, however và finally.', 'Đọc lại để kiểm tra chính tả, chủ ngữ và động từ.'], corrected_sample: '' }];
    }
    return result;
  };

  D.bank = { items: Object.keys(GRAMMAR).flatMap(band => ['U', 'L', 'R'].flatMap(section => bank(section, band))) };

  D.assessmentRequest = async function assessmentRequest(rawPath, options = {}) {
    const url = new URL(rawPath, 'https://demo.local');
    const path = url.pathname;
    const method = String(options.method || 'GET').toUpperCase();
    const b = options.body || {};
    let match;
    if ((match = path.match(/^\/api\/join\/([^/]+)$/)) && method === 'GET') {
      const c = campaignByCode(decodeURIComponent(match[1]));
      const school = D.db.schools.find((x) => x.id === c.school_id);
      return response({ school_name: school?.name || c.school_name || 'Galaxy Education', test_date: c.test_date, grades: copy(c.grades), campaign_id: c.id, join_code: c.join_code });
    }
    if (path === '/api/sessions' && method === 'POST') {
      const c = campaignByCode(b.join_code);
      if (String(b.full_name || '').trim().length < 2) return fail(400, 'Em hãy nhập họ và tên.', 'invalid_name');
      const grade = Number(b.grade);
      if (!(c.grades || []).map(Number).includes(grade)) return fail(400, 'Khối lớp không thuộc đợt kiểm tra này.', 'invalid_grade');
      const token = D.uid('session'), school = D.db.schools.find((x) => x.id === c.school_id);
      const s = { token, student: { student_id: D.uid('student'), full_name: String(b.full_name).trim().slice(0, 80), grade, class_name: String(b.class_name || '').trim().slice(0, 20), school_id: c.school_id, campaign_id: c.id, school_name: school?.name || c.school_name || 'Galaxy Education', test_date: c.test_date }, profile: copy(b.profile || {}), consent_assessment: true, consent_marketing: b.consent_marketing === true, status: 'active', section: 'U', deadline: Date.now() + MINUTES.U * 60000, created_at: Date.now(), progress: {}, answers: [], speaking: [], writing: null, result_token: null };
      D.db.sessions[token] = s; D.save();
      return response({ session_token: token }, 201);
    }
    if (path === '/api/session' && method === 'GET') return response(view(getSession(options)));
    if (path === '/api/session/advance' && method === 'POST') {
      const s = getSession(options);
      if (b.section && s.section !== b.section && s.section !== 'done') return fail(409, 'Phần kiểm tra đã thay đổi.', 'not_current_item');
      advance(s); return response(view(s));
    }
    if (path === '/api/session/answer' && method === 'POST') {
      const s = getSession(options);
      if (s.section === 'W') {
        const task = taskList(s, 'W')[0];
        if (task.id !== b.item_id) return fail(409, 'Bài viết không thuộc phần hiện tại.', 'not_current_item');
        const text = String(b.text || '').slice(0, 12000);
        s.writing = { item_id: task.id, text, word_count: countWords(text), submitted_at: Date.now() };
        advance(s); return response({ ...view(s), scoring_status: 'scored' });
      }
      const item = ensureCurrent(s, b.item_id);
      const choice = Number(b.choice);
      if (!Number.isInteger(choice) || choice < -1 || choice >= item.payload.options.length) return fail(400, 'Đáp án không hợp lệ.', 'invalid_choice');
      s.answers.push({ section: s.section, item_id: item.id, choice, correct: choice === item.correct, difficulty: item.difficulty, plays: Number(b.plays || 0), answered_at: Date.now() });
      s.current_item = null;
      if (s.answers.filter((a) => a.section === s.section).length >= MAX[s.section]) advance(s);
      D.save(); return response(view(s));
    }
    if (path === '/api/session/speaking' && method === 'POST') {
      const s = getSession(options);
      if (!taskList(s, 'S').some((t) => t.id === b.item_id)) return fail(400, 'Không tìm thấy phần nói này.', 'invalid_task');
      if (s.status === 'completed') return fail(409, 'Bài làm đã hoàn thành.', 'session_completed');
      if (Number(b.duration_ms) < 1200 || !b.audio_base64) return fail(400, 'Bản ghi quá ngắn. Em hãy thử nói ít nhất 2 giây.', 'audio_too_short');
      // Audio is intentionally not kept in localStorage; even demo recordings can
      // be large. Only submission metadata remains on this device.
      s.speaking = s.speaking.filter((x) => x.item_id !== b.item_id);
      s.speaking.push({ item_id: b.item_id, duration_ms: Number(b.duration_ms), audio_format: b.audio_format || 'webm', status: 'scored', submitted_at: Date.now(), illustrative: true });
      D.save(); return response({ scoring_status: 'scored', illustrative: true });
    }
    if (path === '/api/session/finish' && method === 'POST') {
      const s = getSession(options);
      if (s.section !== 'done' && s.status !== 'completed') return fail(409, 'Bài kiểm tra còn phần chưa hoàn thành.', 'sections_remaining');
      if (!s.result_token) s.result_token = D.uid('result');
      s.status = 'completed'; s.section = 'done'; s.completed_at ||= Date.now();
      D.db.results[s.result_token] = D.makeResult(s); D.save();
      return response({ result_token: s.result_token });
    }
    if (path === '/api/results' && method === 'GET') {
      const token = header(options.headers, 'x-result-token');
      let result = D.db.results[token];
      if (!result) {
        const s = Object.values(D.db.sessions).find((x) => x.result_token === token || (token === 'demo-result' && x.token === 'session-demo'));
        if (s) { result = D.makeResult(s); D.db.results[token] = result; D.save(); }
      }
      if (!result) return fail(404, 'Không tìm thấy kết quả trong trình duyệt này. Em có thể làm bài bằng mã E8YYZD.', 'result_not_found');
      return response({ result: copy(result) });
    }
    if ((match = path.match(/^\/api\/units\/([^/]+)$/)) && method === 'GET') {
      const code = decodeURIComponent(match[1]);
      const unit = UNITS.find((u) => u.code.toLowerCase() === code.toLowerCase());
      if (!unit) return fail(404, 'Bài học này không có trong bộ nội dung dùng thử.', 'unit_not_found');
      return response({ unit: { ...copy(unit), audio: D.audio || {} } });
    }
    if (path === '/api/practice/pronounce' && method === 'POST') {
      const token = header(options.headers, 'x-result-token');
      if (!token || (!D.db.results[token] && !Object.values(D.db.sessions).some((s) => s.result_token === token))) return fail(401, 'Em cần mở bài học từ báo cáo của mình.', 'unauthorized');
      if (!b.audio_base64) return fail(400, 'Chưa nhận được bản ghi âm.', 'missing_audio');
      const words = String(b.text || '').split(/\s+/).filter(Boolean).map((word) => ({ word, score: 80 }));
      return response({ result: { overall: 80, words, weak_phonemes: [], illustrative: true, note_vi: 'Điểm 80/100 là dữ liệu minh họa, chưa phân tích phát âm bằng AI.' } });
    }
    return undefined;
  };
})();
