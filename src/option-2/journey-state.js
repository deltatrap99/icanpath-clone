/* Journey progress is the learner's own completion checklist, separate from assessment scores. */
(() => {
  'use strict';
  const keyFor = token => 'ip_journey_v1:' + encodeURIComponent(token);
  function progress(token, codes) {
    let saved;
    try { saved = JSON.parse(localStorage.getItem(keyFor(token)) || '{}'); } catch { saved = {}; }
    const completed = codes.filter(code => Array.isArray(saved?.completed) && saved.completed.includes(code));
    const activeIndex = codes.findIndex(code => !completed.includes(code));
    return { completed, activeIndex, total: codes.length, finished: codes.length > 0 && activeIndex === -1 };
  }
  function complete(token, code, codes) {
    if (!token || !codes.includes(code)) throw new Error('Chặng học chưa thuộc hành trình của em.');
    const current = progress(token, codes);
    localStorage.setItem(keyFor(token), JSON.stringify({ version: 1, completed: [...new Set([...current.completed, code])], updatedAt: Date.now() }));
    return progress(token, codes);
  }
  window.ICanJourneyState = { progress, complete };
})();
