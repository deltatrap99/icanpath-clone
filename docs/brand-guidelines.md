# ICANPath, Open Horizons

Phương án 2 được triển khai từ bảng nhận diện do người dùng cung cấp ngày 17/11/2026, với tinh thần cởi mở, tích cực và khám phá. Lời hứa thương hiệu là “Hiểu hôm nay, mở ngày mai.”

## Logo và hình ảnh

Logo chính là `src/option-2/assets/icanpath-logo.svg`, gồm biểu tượng con người, chữ CAN với tam giác ba màu, chữ Path màu xanh và nét cong san hô. Logo dùng đường nét vector độc lập với font trên thiết bị. Giữ đúng tỷ lệ và khoảng trống ít nhất bằng chiều cao chữ i quanh logo, không kéo méo hoặc thêm hiệu ứng lên logo.

Biểu tượng ứng dụng nằm trong `path-mark.svg`. Hình 3D `open-horizon.png` được tạo mới từ tham chiếu để dùng ở trang chủ, không phải ảnh chụp của bảng nhận diện. Dải sóng `horizon-waves.svg` tạo chiều sâu nhẹ cho màn hình đánh giá.

## Thông tin thương hiệu ở chân trang

Chân trang phương án 2 nêu rõ ICANPath là một sản phẩm thuộc hệ sinh thái ICAN, đi kèm thông điệp thương hiệu do người dùng cung cấp. `src/option-2/assets/ican-logo.png` là ảnh gốc được lấy từ [website ICAN](https://www.ican.vn/), tại [đường dẫn ảnh nhận diện](https://s3.icankid.io/media/web/ican-v2/ican_logo.png). `galaxy-education-logo.png` giữ nguyên file `Logo-11.png` do người dùng gửi, kèm tên “Công ty Cổ phần Galaxy Education”. Các logo được hiển thị đúng tỷ lệ và không đổi màu, vẽ lại hay thêm hiệu ứng.

Địa chỉ Hồ Chí Minh và Hà Nội được chép theo ảnh người dùng cung cấp ngày 17/11/2026. Trụ sở Hồ Chí Minh là Lầu 3A, tòa nhà 51-53 Võ Văn Tần, Phường Xuân Hòa, Thành phố Hồ Chí Minh, Việt Nam. Văn phòng Hà Nội là Tầng 5, Tòa nhà Diamond Plaza, số 25 Lê Văn Lương, Phường Thanh Xuân, Thành phố Hà Nội. Khi cập nhật về sau, dùng thông tin được xác nhận trong yêu cầu mới thay vì tự thay bằng một địa chỉ khác từ nguồn bên ngoài.

## Nhân vật Peri

Peri là người bạn đồng hành trong các hoạt động. Bộ hình gốc được cung cấp tại [thư mục Peri trên Drive](https://drive.google.com/drive/folders/1Z8VoZPirtq4UYLBPPwBbyV5J2_1HAlcX), gồm năm ảnh PNG nền trong suốt. Các ảnh trong `src/option-2/assets/peri/` giữ nguyên nội dung, màu sắc và độ phân giải của bản gốc, được đặt tên theo tư thế để dùng nhất quán.

| Tư thế | Tệp gốc | Ngữ cảnh sử dụng |
| --- | --- | --- |
| Vẫy tay | Artboard 1.png | Chào đón học sinh, chuẩn bị lắng nghe và đăng nhập GE. |
| Bật nhảy | Artboard 2.png | Khởi động, sẵn sàng làm bài, chuyển chặng và xem kết quả. |
| Bay khám phá | Artboard 3.png | Trang chủ, giới thiệu chặng và luyện tập sau đánh giá. |
| Suy nghĩ | Artboard 4.png | Đọc hiểu, chuẩn bị ý cho bài viết và các trạng thái cần hỗ trợ. |
| Nháy mắt | Artboard 5.png | Tự đánh giá, khích lệ phần Nói, trang bài học và lời mời khám phá. |

`src/option-2/peri.js` quản lý tư thế và lời đồng hành. Ảnh gốc có vùng trong suốt rộng, vì vậy ứng dụng dùng viewBox SVG để tạo khung hiển thị vừa vặn mà không sửa ảnh. Không kéo giãn nhân vật, đổi màu hay lật chữ hoặc chi tiết nhận diện. Peri đứng cạnh nội dung hướng dẫn, không che câu hỏi, đáp án, đồng hồ hoặc nút thao tác. Hình minh họa có mô tả khi đứng độc lập và được ẩn khỏi trình đọc màn hình khi nội dung bên cạnh đã truyền đạt cùng ý nghĩa.

Lời nhắn của Peri cần khích lệ quá trình học, không tiết lộ đáp án và không đưa ra nhận định năng lực khi chưa có dữ liệu. Chuyển động giới thiệu ngắn được tắt khi thiết bị chọn giảm chuyển động.

## Những người đồng hành

Khu vực học sinh, phụ huynh và nhà trường trên trang chủ dùng một khung kết nối chung. Peri và thông điệp đặt học sinh ở trung tâm tạo điểm nhìn chính, ba phần bên cạnh giải thích vai trò và có thao tác tiếp theo rõ ràng. Học sinh được đưa về ô nhập mã, phụ huynh xem báo cáo minh họa, nhà trường và GE mở khu nhân viên. Trên điện thoại, phần minh họa được thu gọn và ba vai trò xếp theo chiều dọc để giữ nội dung dễ đọc. Các biểu tượng quanh Peri chỉ dùng trang trí, không tạo thêm điểm tương tác hay trạng thái dữ liệu.

## Không gian dành cho nhà trường

Tab nhà trường có phần đăng nhập riêng, dùng THPT Chuyên Hưng Yên làm ví dụ. Dữ liệu phải được gắn nhãn minh họa, các số liệu và biểu đồ được tính từ cùng một tập học sinh theo khối, lớp và kỹ năng đang chọn. Không được thay bằng các con số trang trí hoặc gợi ý đây là kết quả thực tế của trường. Bộ mẫu gồm chín lớp với 288 học sinh, riêng lớp 10 Lí có 32 học sinh và Bồ Quốc Tuấn đứng đầu theo yêu cầu minh họa của người dùng.

Biểu đồ CEFR hiển thị số lượng và tỷ lệ theo từng mức, có thể chọn mức để xem danh sách tương ứng. Phổ điểm có năm khoảng bằng nhau trên thang 100, tính từ mốc đầu đến trước mốc tiếp theo và gồm điểm 100 ở khoảng cuối. Điểm tổng thể là trung bình bốn kỹ năng trong bộ dữ liệu mẫu. Các ngưỡng tạo nhãn CEFR của dữ liệu minh họa không phải quy tắc chấm điểm cho bài làm thật. Bảng xếp hạng giữ thứ hạng trong phạm vi đang chọn khi tìm kiếm hoặc lọc CEFR, những học sinh bằng điểm có cùng thứ hạng.

Phiên nhà trường được lưu tách biệt trong khóa `ip_school_session_v1` của `sessionStorage`, giới hạn tám giờ và không lưu mật khẩu. Đây là giao diện và dịch vụ minh họa trong trình duyệt, không cung cấp bảo mật máy chủ cho dữ liệu thật. Báo cáo tổng hợp công khai qua token và các khu vực GE hiện có giữ nguyên dữ liệu và phạm vi truy cập. Peri xuất hiện ở màn hình chào và nội dung ghi nhận kết quả, không che biểu đồ, bộ lọc hay danh sách học sinh.

## Báo cáo và hành trình học

Phần nhìn lại bốn kỹ năng dùng các thẻ riêng, với hai góc nhìn được trình bày rõ ràng: mức tự đánh giá của học sinh và mức tham chiếu CEFR của bài làm. Hai thang này không được vẽ trên cùng một trục hoặc quy đổi thành phần trăm tương đương. Nhận xét cần khích lệ, đồng thời đưa ra một hành động luyện tập cụ thể. Khi thiếu bài làm hoặc dữ liệu chưa đủ rõ, giao diện cần giải thích rằng nên tìm hiểu thêm, không tự tạo kết quả hay khen một năng lực chưa được ghi nhận.

Lộ trình là một con đường nối các chặng, với Peri ở vị trí tiếp theo chưa được học sinh đánh dấu hoàn thành. Mỗi chặng có chủ đề, mục tiêu và đường dẫn tới bài học. Học sinh có thể chọn bất kỳ chặng nào và tự đánh dấu sau khi đã học, tiến độ này được lưu riêng cho từng báo cáo trong khóa `ip_journey_v1:<token>`, không sửa điểm đánh giá. Peri chuyển sang chặng tiếp theo sau khi học sinh hoàn thành thao tác này. Trên điện thoại, con đường thu gọn về một bên để giữ phần nội dung dễ đọc.

Theo yêu cầu biên tập, đoạn dài bắt đầu bằng “BẢN DEMO” đã được bỏ khỏi trang báo cáo cá nhân. Dữ liệu kết quả, cách tính điểm và thông tin tham chiếu hiện có được giữ nguyên.

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
