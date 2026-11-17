# ICANPath, Open Horizons

Phương án 2 được triển khai từ bảng nhận diện do người dùng cung cấp ngày 17/11/2026, với tinh thần cởi mở, tích cực và khám phá. Lời hứa thương hiệu là “Hiểu hôm nay, mở ngày mai.”

## Logo và hình ảnh

Logo chính là `src/option-2/assets/icanpath-logo.svg`, gồm biểu tượng con người, chữ CAN với tam giác ba màu, chữ Path màu xanh và nét cong san hô. Logo dùng đường nét vector độc lập với font trên thiết bị. Giữ đúng tỷ lệ và khoảng trống ít nhất bằng chiều cao chữ i quanh logo, không kéo méo hoặc thêm hiệu ứng lên logo.

Biểu tượng ứng dụng nằm trong `path-mark.svg`. Hình cánh cửa nhỏ trong `portal-orbit.svg` thay thế linh vật ở phần khai báo thông tin, chuyển chặng và các trạng thái trống. Hình 3D `open-horizon.png` được tạo mới từ tham chiếu để dùng ở trang chủ, không phải ảnh chụp của bảng nhận diện. Dải sóng `horizon-waves.svg` tạo chiều sâu nhẹ cho màn hình đánh giá.

## Màu sắc

| Vai trò | Màu | Cách sử dụng |
| --- | --- | --- |
| Màu thương hiệu | `#0057A5` | Logo, liên kết và điểm nhấn thương hiệu. |
| Màu giao diện | `#3155D9` | Nút chính, biểu tượng, trạng thái chọn và tiến độ. |
| Xanh lá ICAN | `#8CC63F` | Chi tiết cố định trong logo. |
| Hồng ICAN | `#ED2490` | Chi tiết cố định trong logo. |
| San hô | `#FF8066` | Bình minh, thanh kỹ năng Nói và điểm nhấn minh họa. |
| Xanh nhạt | `#DFEDFF` | Vùng được chọn, thẻ định hướng và nền phụ. |
| Kem ấm | `#FFF9F0` | Khởi động, lời gợi mở và nội dung khích lệ. |
| Xanh chữ chính | `#092665` | Tiêu đề và nội dung cần nhấn mạnh. |
| Chữ nội dung | `#35496C` | Nội dung đọc dài và biểu mẫu. |

Màu san hô, hồng và xanh lá dùng làm điểm nhấn, không dùng chữ trắng nhỏ trên các màu này. Trạng thái lỗi vẫn dùng đỏ có tương phản rõ, đi cùng câu giải thích để không phụ thuộc hoàn toàn vào màu sắc.

## Kiểu chữ và giao diện

Sử dụng Nunito từ các file font cục bộ. Tiêu đề có độ đậm 850 đến 900, nội dung từ 600 đến 700. Nút chính có dạng viên thuốc màu xanh, thẻ và biểu mẫu dùng viền mảnh với bóng nhẹ. Biểu tượng có nét tròn đồng nhất, gồm tai nghe, hội thoại, sách, bút và cánh cửa mở.

Trên điện thoại, logo được đặt giữa phần đầu bài đánh giá, thanh tiến độ thu gọn và nút tiếp tục nằm ở cuối màn hình. Các khu vực tương tác phải đủ lớn để thao tác bằng cảm ứng, có trạng thái focus khi dùng bàn phím và tôn trọng cài đặt giảm chuyển động.

## Giọng văn

Nội dung cần khích lệ bằng câu đầy đủ, nêu rõ điều học sinh sẽ thực hiện và lợi ích của bước tiếp theo. Dùng dấu phẩy hoặc từ nối khi liệt kê, không dùng dấu gạch ngang dài hay dấu chấm giữa các cụm. Tiêu đề, nhãn và nút được phép ngắn để dễ quét mắt. Kết quả demo phải được trình bày là thông tin tham khảo, không diễn đạt như chứng chỉ hay kết quả AI thật.

## Tích hợp và dữ liệu

Phương án 2 ở `/option-2/`, phương án 1 ở `/`. CSS nhận diện được giới hạn trong lớp `identity-option2`, các điểm tích hợp trong ứng dụng chỉ hoạt động khi có `window.ICanIdentity`. Cả hai sử dụng cùng dịch vụ demo cục bộ, không gửi bài làm lên máy chủ. Mã QR và đường dẫn chia sẻ được tạo theo đường dẫn hiện tại để giữ nguyên nhận diện khi mở báo cáo hoặc đợt kiểm tra.
