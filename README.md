# ICan Path, bản clone

Bản clone giao diện website https://icanpath.duckmind.ai/#/ và các luồng trong video tham chiếu. Giữ nguyên HTML tạo từ JavaScript, CSS, font Nunito, hình linh vật và các bố cục responsive từ website gốc. Phần dịch vụ được dựng độc lập bằng JavaScript chạy trên trình duyệt.

## Chạy trên máy

Yêu cầu Node.js 20 trở lên. Không cần cài package.

```sh
npm run dev
```

Mở http://localhost:4173. Đóng gói bản tĩnh bằng `npm run build`, kiểm tra bằng `npm run check`, và chạy bản đã đóng gói bằng `npm start`.

Khi triển khai trên Vercel, cấu hình trong `vercel.json` sẽ chạy lệnh build và xuất bản thư mục `dist`. Repository GitHub dùng nhánh `main` cho bản production, còn các nhánh khác có thể tạo bản xem trước qua kết nối Git của Vercel.

## Phương án nhận diện thứ hai

Mở `/option-2/` để xem phương án ICANPath Open Horizons theo bảng nhận diện được cung cấp. Phương án này có logo vector, hình cánh cửa 3D, màu xanh `#0057A5`, màu giao diện `#3155D9`, điểm nhấn san hô và nền xanh nhạt. Trang chủ, khai báo thông tin, bài đánh giá, báo cáo, bài học và khu GE dùng chung bộ nhận diện mới.

Phương án đầu tiên vẫn ở `/`. Hai phương án dùng chung dịch vụ demo và dữ liệu đã lưu trên cùng trình duyệt. Đường dẫn chia sẻ và mã QR giữ đúng phương án đang sử dụng. Mã học sinh dùng thử là `E8YYZD`, áp dụng cho khối 3 đến khối 11.

`src/option-2/identity.js` cung cấp giao diện trang chủ và các điểm tích hợp nhận diện, `identity.css` chỉ áp dụng cho body có lớp `identity-option2`. Các tài nguyên nằm trong `src/option-2/assets/`, hướng dẫn sử dụng nhận diện được lưu trong `docs/brand-guidelines.md`.

Nhân vật Peri dùng năm tư thế gốc từ bộ hình được cung cấp, xuất hiện ở trang chủ, khai báo thông tin, năm chặng đánh giá, phần luyện nói và báo cáo. `src/option-2/peri.js` chọn tư thế theo hoạt động, còn `peri.css` bố trí nhân vật trên desktop và điện thoại. Các ảnh PNG gốc trong `src/option-2/assets/peri/` được giữ nguyên, không cần tải từ Drive khi chạy website.

Báo cáo option 2 có bốn thẻ nhìn lại kỹ năng cùng nhận xét khích lệ và gợi ý luyện tập. Hành trình Peri nối các bài học thành từng chặng, cho phép học sinh tự đánh dấu hoàn thành ở cuối bài học và quay lại đúng vị trí trên lộ trình. Tiến độ được lưu riêng theo báo cáo, độc lập với điểm kiểm tra. Các module `reflection.js`, `journey.js` và `journey-state.js` phụ trách giao diện và tiến độ này.

Phần bài học option 2 có Peri đồng hành trong từ vựng, ngữ pháp và mục tiêu luyện tập. Toàn bộ 16 từ có IPA Anh-Mỹ, loại từ, nghĩa và ví dụ kèm bản dịch. Người học có thể nghe riêng từng từ, nghe câu ví dụ và tra từ trên Cambridge Dictionary. Ngữ pháp có mẫu câu và 12 ví dụ gốc được giữ nguyên, mỗi ví dụ có bản nghe cục bộ. Tài liệu nguồn là `docs/vocabulary-sources.md`, kiểm tra dữ liệu và âm thanh chạy qua `scripts/check-lessons.mjs`.

## Không gian nhà trường

Phương án 2 có tab **Nhà trường** tại `/option-2/#/school-portal`. Tài khoản trải nghiệm là `chuyenhungyen`, mật khẩu `demo123`. Bộ dữ liệu minh họa của THPT Chuyên Hưng Yên gồm 288 học sinh thuộc chín lớp của khối 10, 11 và 12. Lớp **10 Lí** có 32 học sinh, **Bồ Quốc Tuấn** dẫn đầu với 96,8 điểm tổng thể. Khối 12 chỉ thuộc bộ dữ liệu báo cáo minh họa, phạm vi bài kiểm tra hiện có vẫn là lớp 3 đến lớp 11.

Các bộ lọc khối, lớp và kỹ năng cập nhật đồng bộ số liệu, phân bố CEFR, phổ điểm và thứ hạng. Người dùng có thể chọn cột CEFR để lọc danh sách, tìm tên không dấu, phân trang và mở kết quả bốn kỹ năng của từng học sinh. Điểm bằng nhau có cùng thứ hạng. Phiên nhà trường lưu riêng trong `sessionStorage`, không thay đổi phiên học sinh hay nhân viên GE. Đây là luồng đăng nhập và dữ liệu minh họa phía trình duyệt, không phải hệ thống xác thực máy chủ cho hồ sơ học sinh thật.

Các module `school-service.js`, `school-charts.js`, `school-rankings.js` và `school-portal.js` quản lý dữ liệu, biểu đồ, bảng xếp hạng và màn hình. `scripts/check-school-portal.mjs` kiểm tra phiên đăng nhập, phạm vi trường, tổng hợp số liệu, tìm kiếm, phân trang và thứ hạng.

Báo cáo kỹ năng có thêm phần so sánh Nghe, Đọc, Nói và Viết, năng lực thành phần, tỷ lệ lỗi, minh chứng mở rộng và gợi ý hoạt động cùng Peri. Bộ lọc khối, lớp và kỹ năng đồng bộ với phổ điểm và thứ hạng. Các module `school-evidence.js`, `school-analysis.js` và `school-insights.js` tách bài làm minh họa, phép tổng hợp và giao diện. Phần lỗi dùng 12 hoạt động mẫu riêng, không suy đoán từ điểm kỹ năng, không thay đổi bài làm hay kết quả đánh giá hiện có. Nghe và Đọc phân loại từ lựa chọn trong câu hỏi mẫu, Nói và Viết dùng phiếu quan sát mẫu. Mẫu số chỉ gồm học sinh có minh chứng hợp lệ ở cùng hoạt động, mỗi học sinh được tính một lần cho mỗi tiêu chí. `scripts/check-school-analysis.mjs` kiểm tra mẫu số, dữ liệu thiếu, lượt trả lời trùng, phạm vi nhóm và tính độc lập với điểm.

## Dùng thử

| Luồng | Đường dẫn / tài khoản |
| --- | --- |
| Trang chủ | `/#/` |
| Học sinh, khối 3–11 | `/#/join/E8YYZD` · mã `E8YYZD` |
| Mã bổ sung | `DEMO01` (khối 6–9), `K7P2QX` (khối 3–5) |
| Báo cáo mẫu | `/#/r/demo-result` |
| Nhân viên | `/#/staff` · user `GE Demo` hoặc `staff` · password `demo123` |
| Quản trị | `/#/staff` · user `admin` · password `demo123` |
| Báo cáo trường | `/#/school/demo-school` |

Luồng học sinh gồm bốn bước nhập thông tin, năm phần kiểm tra có đồng hồ riêng, nghe âm thanh, ghi âm micro, nhập bài viết, kết quả, biểu đồ, QR và bài học gợi ý. Luồng GE gồm tổng quan, trường, đợt kiểm tra, báo cáo trường và xuất CSV; tài khoản admin thêm quản lý người dùng, tìm học sinh và nhật ký.

## Dữ liệu và phạm vi

Dữ liệu mẫu và các thay đổi được lưu trong localStorage của trình duyệt (key `icanpath_clone_v1`). Không kết nối tới máy chủ hay tài khoản gốc. Mật khẩu được người dùng cấp để khảo sát website gốc không nằm trong source.

Điểm trắc nghiệm dựa trên đáp án trong ngân hàng câu hỏi demo. Nhận xét Nói/Viết và phát âm chỉ minh họa, không gọi dịch vụ AI thật. Ghi âm được xử lý trên thiết bị. Link báo cáo cá nhân hoạt động trên trình duyệt đang lưu dữ liệu; báo cáo mẫu hoạt động ở mọi trình duyệt. Để đồng bộ nhiều thiết bị cần bổ sung backend, database và dịch vụ chấm bài thật.

`src/app.js` giữ giao diện từ website gốc. `src/demo-core.js`, `src/demo-assessment.js`, `src/demo-staff.js` cung cấp lớp dịch vụ độc lập. `docs/research` lưu khảo sát/đặc tả; `docs/design-references` chứa ảnh đối chiếu và khung hình video. Build chỉ đưa `src/` vào `dist/`.

## Quy tắc nội dung

Nội dung hiển thị đã được biên tập thành câu đầy đủ, rõ ý, sử dụng dấu phẩy và từ nối để liệt kê thông tin. Các nguyên tắc được lưu trong AGENTS.md để những lần cập nhật sau tiếp tục áp dụng thống nhất. Khi mở báo cáo đã lưu, phần nhận xét sẽ được cập nhật theo cách viết mới, đồng thời giữ nguyên điểm số và dữ liệu bài làm.
