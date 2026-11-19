# ICANPath, Open Horizons

Phương án 2 được triển khai từ bảng nhận diện do người dùng cung cấp ngày 17/11/2026, với tinh thần cởi mở, tích cực và khám phá. Lời hứa thương hiệu là “Hiểu hôm nay, mở ngày mai.” Hệ hình ảnh hiện dùng con đường đi lên qua các cột mốc, thể hiện việc chinh phục Learning Path theo từng bước vừa sức.

## Logo và hình ảnh

Logo chính là `src/option-2/assets/icanpath-logo-option-1.svg`, lấy từ trang 1 của file `Logo - ICANPATH.pdf` do người dùng cung cấp ngày 19/11/2026. Đây là phương án chữ a xanh lá, chữ Path nét thanh, giữ nguyên các đường vector và màu xuất từ PDF. Logo không có ngôi sao hoặc đường cong nối P tới a. Tệp SVG gồm 18 đường vector, không nhúng ảnh và không phụ thuộc font trên thiết bị. Khung SVG thêm khoảng đệm nhỏ quanh hình, không đổi tỷ lệ hoặc vị trí tương đối của các nét. Nguồn và phương pháp xuất được ghi tại [icanpath-logo-pdf.md](icanpath-logo-pdf.md). Không kéo méo, tự đổi màu hoặc thêm hiệu ứng lên logo.

Biểu tượng ứng dụng nằm trong `icanpath-icon-option-1.svg`, dùng chín đường vector của biểu tượng con người và các tia sáng lấy từ cùng logo PDF. Hình `learning-journey-hero.webp` được tạo riêng cho trang chủ, đặt Peri bước trên con đường và hướng về phía trước. Sách và bút, tai nghe và hội thoại, cây lớn dần cùng điểm đến học tập thể hiện quá trình tích lũy kiến thức, rèn kỹ năng và trưởng thành. Peri đã được tích hợp vào cảnh với hướng nhìn và bóng đổ phù hợp, không đặt thêm một hình Peri rời ở góc ảnh. Ba nhãn Hiểu mình, Rèn kỹ năng và Mở tương lai diễn tả ý tưởng hành trình, không phải trạng thái hoàn thành của học sinh.

Biểu tượng `path-destination.svg` dùng đường đi lên và lá cờ ở phần kết lộ trình học. Dải đồi xanh `horizon-waves.svg` tiếp tục tạo chiều sâu nhẹ cho màn hình đánh giá và những khu vực đồng hành. Các hình minh họa cần cho thấy hướng tiến về phía trước, có cột mốc rõ ràng và khoảng trống để Peri đứng cạnh nội dung.

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

## Bài học cùng Peri

Phần từ vựng và ngữ pháp của phương án 2 dùng các khung đọc riêng, với Peri vẫy tay, suy nghĩ và khích lệ ở các ngữ cảnh phù hợp. Mỗi từ có phiên âm Anh-Mỹ, loại từ, nghĩa, câu ví dụ tiếng Anh và bản dịch tiếng Việt. Nút nghe từ riêng lẻ được phân biệt với nút nghe câu ví dụ. Các ký tự IPA được hiển thị bằng font hỗ trợ phiên âm để giữ rõ dấu nhấn và âm đặc biệt. Nguồn đối chiếu được ghi tại [vocabulary-sources.md](vocabulary-sources.md), học sinh cũng có thể mở từ tương ứng trên Cambridge qua liên kết Tra từ.

Ngữ pháp được chia thành từng ý, gồm lời giải thích, mẫu câu và các ví dụ hiện có. Peri giúp gợi mở và khích lệ việc thử vận dụng, không diễn đạt như thể học sinh đã thành thạo chỉ vì mở bài học. Khung mục tiêu giữ những điều học sinh có thể thử sau bài học. Bài kiểm tra, cách tính điểm và tiến độ hành trình giữ nguyên, mọi bản ghi âm trong bài được phát từ tài nguyên cục bộ qua bộ điều khiển âm thanh chung.

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

Sử dụng Nunito từ các file font cục bộ. Tiêu đề có độ đậm 850 đến 900, nội dung từ 600 đến 700. Nút chính có dạng viên thuốc màu xanh, thẻ và biểu mẫu dùng viền mảnh với bóng nhẹ. Biểu tượng có nét tròn đồng nhất, gồm tai nghe, hội thoại, sách, bút, con đường và cột mốc học tập.

Trên điện thoại, logo được đặt giữa phần đầu bài đánh giá, thanh tiến độ thu gọn và nút tiếp tục nằm ở cuối màn hình. Các khu vực tương tác phải đủ lớn để thao tác bằng cảm ứng, có trạng thái focus khi dùng bàn phím và tôn trọng cài đặt giảm chuyển động.

## Giọng văn

Nội dung cần khích lệ bằng câu đầy đủ, nêu rõ điều học sinh sẽ thực hiện và lợi ích của bước tiếp theo. Dùng dấu phẩy hoặc từ nối khi liệt kê, không dùng dấu gạch ngang dài hay dấu chấm giữa các cụm. Tiêu đề, nhãn và nút được phép ngắn để dễ quét mắt. Kết quả demo phải được trình bày là thông tin tham khảo, không diễn đạt như chứng chỉ hay kết quả AI thật.

## Tích hợp và dữ liệu

Phương án 2 ở `/option-2/`, phương án 1 ở `/`. CSS nhận diện được giới hạn trong lớp `identity-option2`, các điểm tích hợp trong ứng dụng chỉ hoạt động khi có `window.ICanIdentity`. Cả hai sử dụng cùng dịch vụ demo cục bộ, không gửi bài làm lên máy chủ. Mã QR và đường dẫn chia sẻ được tạo theo đường dẫn hiện tại để giữ nguyên nhận diện khi mở báo cáo hoặc đợt kiểm tra.

## Báo cáo kỹ năng dành cho nhà trường

Biểu đồ kỹ năng dùng cùng thang 100, tỷ lệ thành phần và tỷ lệ lỗi dùng thang phần trăm cố định. Mỗi tỷ lệ phải có số học sinh gặp biểu hiện và số bài có minh chứng hợp lệ, đồng thời nêu rõ phạm vi toàn trường, khối hoặc lớp đang xem. Minh chứng mẫu và cách hỗ trợ được đặt trong từng mục mở rộng để giữ báo cáo dễ theo dõi. Dữ liệu thiếu không được xem là lỗi, nhận xét lỗi không được suy đoán từ điểm tổng.

Peri xuất hiện bên cạnh phần giới thiệu và gợi ý hoạt động, dùng dáng khác nhau theo kỹ năng. Lời khích lệ cần chỉ ra một bước học cụ thể, ghi nhận điều các em đã làm được và hướng thầy cô đến hoạt động luyện tập tiếp theo. Nền kem dành cho gợi ý giảng dạy, nền xanh nhạt dành cho điểm tựa và phần được chọn. Tỷ lệ lỗi luôn có nhãn và con số đi cùng, không dùng riêng màu sắc để truyền tải mức độ.

Khi mở một lỗi, danh sách phải ghi lại tên lỗi và phạm vi đang xem, đồng thời dùng cùng các mã học sinh đã được tính trong số liệu tổng hợp. Báo cáo cá nhân nêu rõ học sinh, lớp, mã và nguồn danh sách để thầy cô không nhầm những em trùng tên. Các trạng thái đã đáp ứng, cần luyện thêm và chưa có minh chứng đi cùng chữ và biểu tượng. Đường quay lại cần giữ từ khóa tìm kiếm và trang danh sách, còn các nút mở báo cáo phải đủ lớn để thao tác trên điện thoại.
