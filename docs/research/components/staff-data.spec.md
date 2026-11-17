# Staff demo service

Target: src/demo-staff.js. Reuse original src/app.js UI and its exact CSS rather than redesign. Register D.staffRequest(path,options) on window.ICanDemo; D.ok(data,status) returns {status,data}, D.fail(status,message,error) throws compatible API error. D.db, D.save(), D.uid(prefix), D.listStudents() shared. Return undefined for unhandled routes. All operations local demo data only.

Shared db schema: schools array; campaigns array; sessions object keyed token each {token,student:{student_id,full_name,grade,class_name,school_id,campaign_id,school_name,test_date},profile,status,section,result_token}; results object keyed token; users array {id,username,display_name,role,password,active,last_login_at}; me object|null; audit array; shared_login boolean. Seed core provided by root. D.makeResult(session) available by request time, D.listStudents() produces table fields. Do not modify core or app.js.

Credentials fixed demo: admin/demo123, staff/demo123. Do not accept arbitrary passwords; validate created users, lock and role. Reset password may return demo password string. Local authentication persists db.me, not production auth.

Support ALL endpoints consumed by app.js staffPage, staffSchools, staffCampaigns, staffCampaign, staffDashboard, schoolPage, adminPage and descendants:
- POST /api/staff/login returns me; GET /api/staff/me returns {name,role,id}; POST logout clears. Unauthorized ->401.
- GET /api/catalog/provinces ->{provinces:[{code,name}]}, GET wards?province= ->{wards:[{name}]}: seed Hanoi/HCMC/Da Nang at minimum, or use root downloaded public catalog JSON if present.
- GET/POST /api/staff/schools ->{schools} or {school}; validate required values/duplicates. School counts from sessions/campaigns. POST /api/staff/schools/:id/report-link returns {report_token} stored on school.
- GET/POST /api/staff/campaigns and GET/PATCH :id. Filter school_id. Campaign students/completed counts, detail {campaign,students}. Create generates 6-character unique code. Validate school/date/grades; status toggles must affect join API.
- POST /api/staff/sessions/:id/result-link ->{result_token}. Generate missing result with D.makeResult.
- GET /api/staff/dashboard ->{summary:{participants,completed,completion_rate,avg:{overall,L,R,S,W},cefr_distribution},marketing_consent,confidence:{high,medium,low,unknown},by_province,by_grade_band,by_school,goals,products}. Group entries {key,participants,completed,completion_rate,avg}.
- GET /api/school-report x-report-token ->{school,summary,by_grade,by_class,by_campaign,weak_competencies:[{label_vi,students,share}],note_vi}. Summary same as above; totals from matching sessions. Clearly sample data.
- Export D.csvExport() for root to wire direct /api/staff/export.csv link to Blob download, without PII.
- GET /api/admin/overview ->{schools,test_schools,campaigns_open,campaigns_closed,students,sessions_completed,sessions_active,users,admins,shared_login,bank_items,scoring_errors}. PATCH /api/admin/settings.
- GET/POST /api/admin/users; PATCH /api/admin/users/:id (reset_password,role,active). Return {users} (omit passwords), {user,password?}, errors validation, preserve admin route access.
- GET /api/admin/students?q= return {students} matching query, all fields app.js consumes; DELETE /api/admin/students/:id, /api/admin/campaigns/:id, /api/admin/schools/:id require confirm matching ID; cascading delete LOCAL data. School DELETE ->{deleted:{students,...}}. PATCH school ->rename.
- GET /api/admin/audit ->{events:[{at,actor,action,target,detail}]}. Log relevant local edits.

Validation: node --check and meaningful Node VM/localStorage tests for login rejection, admin/staff access, school/campaign creation, counts, reporting, local deletion, CSV. Save test under scripts/check-staff.mjs if useful. Work only demo-staff.js and its tests. Other agents modify student service concurrently. Report remaining gaps.
