# Assessment demo service

Target: src/demo-assessment.js. Preserve src/app.js UI exactly. The original JS/CSS/assets are reused rather than reinterpreted. Source: https://icanpath.duckmind.ai/#/ and supplied mobile video, see VIDEO_REFERENCE.md.

Register an async D.assessmentRequest(path, options) handler on window.ICanDemo. Return undefined for unhandled routes, or D.ok(data,status=200). Use D.fail(status,message,error) to throw {status,message,code,data}. All processing is browser-local, no requests to original host, no real AI claims. D.db and D.save() persist data. D.uid(prefix) creates IDs.

Shared schema: db.schools array (id,name,province,ward,ownership,etc), db.campaigns array (id,school_id,school_name,test_date,grades,join_code,status,teacher), db.sessions object keyed by session token, db.results object keyed by result token, db.users array, db.me object|null, db.audit array, db.shared_login boolean.
Sessions contain token, student:{student_id,full_name,grade,class_name,school_id,campaign_id,school_name,test_date}, profile, status active/completed, section U/L/R/S/W/done, result_token, answers array, speaking array; other internal properties free. D.listStudents() maps sessions for staff. Student API should create/update sessions in this format. Existing fixture sessions may have status completed and no answers.

API endpoints:
- GET /api/join/:code resolves exact existing open campaign or returns meaningful invalid/closed error. Accept seeded E8YYZD, DEMO01, K7P2QX.
- POST /api/sessions body as joinPage emits returns {session_token}; validate name, grade, campaign. Do not require legal checkbox (original uses start button consent).
- GET /api/session Authorization:Bearer token returns view, with server_now, deadline, band ('3-5','6-8','9-11'), status, section, sections:[{key,max,answered,end}], item:{id,format,payload} for U/L/R, tasks for S/W. Deadline per section:3,7,6,7,7 minutes. Persist/resume; handle elapsed deadlines.
- POST /api/session/answer: item_id,choice (including -1 skip) or text. Return new view, auto-advance after section max; initial bank >=6 grammar, >=4 listening, >=4 reading with level adjustments by correct count. Appropriate content for 3 age bands. U format mcq payload stem/options; L listening_mcq includes audio_script (speechSynthesis fallback) and options; R reading_mcq title/passage/stem/options. No missing image resources; emoji pictograms optional.
- POST /api/session/advance returns next view. S tasks includes read_aloud {text} and speaking question with bullets, seconds, hint_vi (age appropriate); W task payload prompt,prompt_vi,min_words,max_words. POST /api/session/speaking returns {scoring_status:'scored'}, can retain local blob/base64 for preview but results explicitly illustrative.
- POST /api/session/finish returns {result_token}. Make sure premature finishing returns sections_remaining error. Persist completion + result and allow reload.
- GET /api/results x-result-token returns {result}; unknown token errors. Export D.makeResult(session) generating full app.js resultPage-compatible fields. Seed result demo-result for fixture token session-demo.
- GET /api/units/:code returns {unit} full vocabulary/grammar/can_do/lesson/speaking_practice. At least 4 units linked in learning_path, complete real sample English/Vietnamese content.
- POST /api/practice/pronounce returns {result:{overall,words,weak_phonemes}} explicitly demo feedback.

Result schema must cover all fields app.js resultPage, feedbackCard, learnPage consume: student,overall,skills L/R/S/W, confidence, use_of_english, abilities,next_steps,strengths,improvements,self_vs_actual,learning_path,feedback,products,scoring_issues. Mark result overall.note_vi as local demo/illustrative and not real AI grading. Prefer dynamically calculated U/L/R from actual answer correctness, and no evidence for skipped speaking/writing. Include coherent complete sample demo-result to demonstrate charts and full report. Stable skill scores, no Math.random grades. Unknown endpoints return undefined.

Validation: node --check src/demo-assessment.js and a focused VM/localStorage integration test simulating onboarding, questions, section advancement, writing, completion and result fields. Save test under scripts/check-assessment.mjs if helpful; no dependencies required. Do not modify core, app.js, staff module or build setup. Report implementation and validation.
