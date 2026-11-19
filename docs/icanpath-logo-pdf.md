# Logo ICANPath option 1 từ PDF

Nguồn là file `Logo - ICANPATH.pdf` người dùng cung cấp ngày 19/11/2026. File gồm hai trang, trang 1 là option 1 với chữ a xanh lá, trang 2 là bản chữ a màu hồng. Yêu cầu hiện hành chọn option 1 và thay toàn bộ vị trí logo ICANPath cũ trong website option 2.

## Tệp và phương pháp xuất

- SHA-256 của PDF nguồn: `f71669890418e18d3c3f262189583e712feac010af90cb431f98a1ec8ed6da1a`.
- Trang nguồn: trang 1, khổ 815.431 × 186.659 pt.
- Logo chính: `src/option-2/assets/icanpath-logo-option-1.svg`, 18 đường vector.
- Favicon: `src/option-2/assets/icanpath-icon-option-1.svg`, chín đường vector của biểu tượng con người và các tia sáng ở đầu logo.

Trang PDF được đọc và xuất bằng PyMuPDF qua `page.get_svg_image(text_as_path=True)`. Tọa độ đường vẽ, phép biến đổi và màu do bộ xuất PDF cung cấp được giữ nguyên; không dùng AI để tạo lại logo, không gõ lại chữ bằng font và không nhúng ảnh bitmap. Bản PDF gốc không bị sửa.

Khung logo dùng `viewBox="-2 -2 819.431 190.659"` để thêm khoảng đệm nhỏ quanh trang nguồn. Các thuộc tính lớp của Illustrator/Inkscape được bỏ khỏi SVG xuất ra vì không ảnh hưởng hiển thị. Phần favicon lấy nguyên các đường vẽ có chỉ số 0 đến 7 và 10 trong danh sách 18 đường của bản xuất, tương ứng với thân, đầu và các tia sáng, rồi đặt trong khung vuông nền trong suốt. Cả hai SVG đều có tiêu đề truy cập và không phụ thuộc tài nguyên ngoài.

## Phạm vi sử dụng

Đầu trang, chân trang, thẻ báo cáo trên trang chủ và hàm thương hiệu dùng chung cho bài đánh giá, bài học, khu GE đều dùng logo mới. Favicon cũng được đồng bộ từ cùng bản PDF. Các thương hiệu ICAN và Galaxy Education riêng ở chân trang vẫn dùng tài nguyên công ty đã được cung cấp.

Phương án chữ a hồng tạo trước đây được giữ làm tài liệu lịch sử, không còn được tham chiếu bởi HTML hoặc JavaScript của giao diện option 2.
