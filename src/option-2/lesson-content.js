/* Peri guides vocabulary, grammar and achievable lesson goals without changing assessment data. */
(() => {
  'use strict';
  const POS = { noun: 'n.', verb: 'v.', adjective: 'adj.', adverb: 'adv.' };
  function sound(h, play, text, { label, accessibleLabel, className = '' }) {
    let button;
    button = h('button', { type: 'button', class: 'lesson-sound ' + className, 'aria-label': accessibleLabel, title: accessibleLabel, onclick: () => play(text, button) }, window.ICanIdentity.icon('headphones', 18), h('span', { class: 'lesson-sound-label' }, label));
    return button;
  }
  function heading(h, { kicker, title, description, pose, id }) {
    return h('div', { class: 'lesson-section-heading' },
      h('div', {}, h('span', { class: 'identity-kicker' }, kicker), h('h2', { id }, title), h('p', {}, description)),
      window.ICanPeri.figure(h, pose, { class: 'lesson-section-peri', decorative: true }));
  }
  function vocabulary(h, unit, play) {
    return h('section', { class: 'lesson-learning-panel lesson-vocabulary', 'aria-labelledby': 'lesson-vocabulary-title' },
      heading(h, { kicker: 'NGHE TỪ MỚI, THỬ DIỄN ĐẠT', title: 'Từ vựng cùng Peri', description: 'Em hãy nghe cách phát âm, đọc câu ví dụ rồi thử dùng từ để nói về chính mình.', pose: 'wave', id: 'lesson-vocabulary-title' }),
      h('div', { class: 'lesson-word-list' }, (unit.lesson.vocab || []).map((word, index) => h('article', { class: 'lesson-word', 'aria-labelledby': 'lesson-word-' + index },
        h('div', { class: 'lesson-word-heading' }, h('div', {}, h('h3', { id: 'lesson-word-' + index, lang: 'en-US' }, word.word), word.pos_vi ? h('span', { class: 'lesson-word-pos' }, word.pos_vi, POS[word.pos] ? h('small', { lang: 'en' }, POS[word.pos]) : null) : null),
          sound(h, play, word.word, { label: 'Nghe từ', accessibleLabel: 'Nghe từ ' + word.word, className: 'lesson-word-sound' })),
        word.ipa_us ? h('div', { class: 'lesson-word-pronunciation' }, h('span', { class: 'lesson-word-ipa', lang: 'en-US' }, word.ipa_us), h('span', { class: 'lesson-accent-label' }, 'IPA Anh-Mỹ')) : null,
        h('p', { class: 'lesson-word-meaning' }, word.meaning_vi),
        h('div', { class: 'lesson-word-example' }, h('span', { class: 'lesson-example-label' }, 'Dùng từ trong câu'), h('p', { lang: 'en-US' }, word.example), word.example_vi ? h('p', { class: 'lesson-example-translation' }, word.example_vi) : null,
          h('div', { class: 'lesson-example-actions' }, sound(h, play, word.example, { label: 'Nghe ví dụ', accessibleLabel: 'Nghe ví dụ với từ ' + word.word, className: 'lesson-example-sound' }),
            word.dictionary_url ? h('a', { class: 'lesson-dictionary-link', href: word.dictionary_url, target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Tra từ ' + word.word + ' trên Cambridge Dictionary, mở tab mới' }, 'Tra từ', window.ICanIdentity.icon('external', 15)) : null)),
        word.note_vi ? h('p', { class: 'lesson-word-note' }, window.ICanIdentity.icon('book', 16), word.note_vi) : null))),
      h('p', { class: 'lesson-vocabulary-note' }, 'Phiên âm theo giọng Anh-Mỹ, em có thể chọn Tra từ để xem thêm cách dùng trên Cambridge Dictionary.'));
  }
  function grammar(h, unit, play) {
    const lesson = unit.lesson || {};
    const points = lesson.grammar_points?.length ? lesson.grammar_points : [{ title_vi: unit.grammar, explanation_vi: lesson.grammar_vi, patterns: [], example_indices: (lesson.grammar_examples || []).map((_, index) => index) }];
    return h('section', { class: 'lesson-learning-panel lesson-grammar', 'aria-labelledby': 'lesson-grammar-title' },
      heading(h, { kicker: 'HIỂU CÁCH DÙNG, TỰ TIN ĐẶT CÂU', title: 'Ngữ pháp cùng Peri', description: 'Mỗi ý nhỏ sẽ giúp em hiểu một cách dùng, rồi thử vận dụng qua những câu quen thuộc.', pose: 'think', id: 'lesson-grammar-title' }),
      h('div', { class: 'lesson-grammar-topics', 'aria-label': 'Nội dung ngữ pháp' }, unit.grammar.split(',').map(topic => h('span', { lang: 'en' }, topic.trim()))),
      h('div', { class: 'lesson-grammar-points' }, points.map((point, index) => h('article', { class: 'lesson-grammar-point' },
        h('div', { class: 'lesson-grammar-point-heading' }, h('span', { class: 'lesson-point-number', 'aria-hidden': 'true' }, String(index + 1).padStart(2, '0')), h('h3', {}, point.title_vi)),
        h('p', { class: 'lesson-rule-explanation' }, point.explanation_vi),
        point.patterns?.length ? h('div', { class: 'lesson-patterns', 'aria-label': 'Mẫu câu cần nhớ' }, h('span', { class: 'lesson-example-label' }, 'Mẫu câu cần nhớ'), point.patterns.map(pattern => h('p', {}, pattern))) : null,
        h('div', { class: 'lesson-grammar-examples' }, h('span', { class: 'lesson-example-label' }, 'Cùng đọc ví dụ'), (point.example_indices || []).map(exampleIndex => {
          const sentence = lesson.grammar_examples[exampleIndex];
          return h('div', { class: 'lesson-grammar-example' }, h('p', { lang: 'en-US' }, sentence), sound(h, play, sentence, { label: 'Nghe', accessibleLabel: 'Nghe mẫu câu: ' + sentence, className: 'lesson-grammar-sound' }));
        }))))));
  }
  function goals(h, unit) {
    return h('section', { class: 'lesson-learning-panel lesson-goals', 'aria-labelledby': 'lesson-goals-title' },
      h('span', { class: 'identity-kicker' }, 'ĐÍCH NHỎ CỦA BÀI HỌC'), h('h2', { id: 'lesson-goals-title' }, 'Sau bài học, em có thể'),
      h('ul', {}, (unit.lesson.can_do_vi || unit.can_do || []).map(text => h('li', {}, h('span', { class: 'lesson-goal-icon' }, window.ICanIdentity.icon('compass', 18)), h('p', {}, text)))),
      h('div', { class: 'lesson-goal-companion' }, window.ICanPeri.figure(h, 'jump', { decorative: true }), h('p', {}, 'Em hãy chọn một điều trên đây để thử làm sau khi học, Peri sẽ cùng em luyện thêm từng chút một nhé.')));
  }
  function render(h, unit, { play }) {
    return h('div', { class: 'lesson-content-grid' }, vocabulary(h, unit, play), h('div', { class: 'lesson-content-side' }, grammar(h, unit, play), goals(h, unit)));
  }
  window.ICanLessonContent = { render };
})();
