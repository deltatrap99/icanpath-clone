# ICan Path, bản clone

Bản clone giao diện website https://icanpath.duckmind.ai/#/ và các luồng trong video tham chiếu. Giữ nguyên HTML tạo từ JavaScript, CSS, font Nunito, hình linh vật và các bố cục responsive từ website gốc. Phần dịch vụ được dựng độc lập bằng JavaScript chạy trên trình duyệt.

## Chạy trên máy

Yêu cầu Node.js 20 trở lên. Không cần cài package.

```sh
npm run dev
```

Mở http://localhost:4173. Đóng gói bản tĩnh bằng `npm run build`, kiểm tra bằng `npm run check`, và chạy bản đã đóng gói bằng `npm start`.

Khi triển khai trên Vercel, cấu hình trong `vercel.json` sẽ chạy lệnh build và xuất bản thư mục `dist`. Repository GitHub dùng nhánh `main` cho bản production, còn các nhánh khác có thể tạo bản xem trước qua kết nối Git của Vercel.

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
