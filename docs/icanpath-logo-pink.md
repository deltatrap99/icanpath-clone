# Logo ICANPath với chữ a màu hồng

Bản màu hồng này được lưu lại để tham khảo lịch sử. Logo đang dùng đã được thay bằng option 1 trong PDF người dùng cung cấp, theo [nguồn logo hiện hành](icanpath-logo-pdf.md).

Người dùng chốt bản chữ Path mềm mại với chữ a màu hồng ICAN, ngôi sao trắng và đường cong nối P tới a ngày 19/11/2026, đồng thời yêu cầu áp dụng cho website option 2 và xuất bản lên Vercel.

## Tài nguyên dùng trên website

- Tệp: `src/option-2/assets/icanpath-logo-pink.svg`.
- Bản được duyệt: `exec-96cf5477-4e0f-463e-bb8b-b72abb1cc0ae.png`, kích thước 2172 × 724 px.
- Bản nền trong suốt: `exec-6696a58d-b85d-4341-a6af-b8aaadab78e5.png`, cùng kích thước, được tạo từ bản đã duyệt bằng công cụ image_gen tích hợp, không dùng CLI.
- Các tệp PNG gốc được giữ nguyên trong thư mục generated_images của phiên làm việc. Tệp SVG trong repository nhúng toàn bộ bản nền trong suốt bằng WebP không mất dữ liệu, đã đối chiếu chính xác từng byte RGBA sau giải mã.
- `viewBox="48 94 2068 498"` thu gọn lề trong suốt bằng khung SVG, không lấy mẫu lại hoặc thay đổi điểm ảnh của logo. Khung này bao gồm hình chính và khoảng đệm quanh các cạnh.
- Đây là ảnh được nhúng trong khung SVG, không phải logo được dựng lại thành các đường vector. Không thay phần chữ bằng font trên máy.
- Đầu trang, chân trang, thẻ báo cáo trên trang chủ và hàm thương hiệu dùng chung cho bài học, bài đánh giá, khu nhân viên đều tham chiếu cùng tài nguyên mới. Logo ICAN và Galaxy Education độc lập ở chân trang giữ nguyên.

## Prompt chỉnh kiểu chữ

```text
Use case: precise-object-edit.
Asset type: refined ICANPath logo typography preview.
Edit target: the supplied blue ICANPath logo image.
The feedback is that the right-hand PATH lettering is too rigid, boxed-in, and heavy. Produce one polished revision with a visibly more open, fluid, warm and expressive typographic voice suitable for an educational learning journey brand.
Keep the left-hand ICAN identity unchanged: the human-shaped blue i with green and pink rays, the thin blue C and N, and the triangular three-color A. Preserve its original proportions and colors.
Redesign ONLY the right-hand word from rigid uppercase PATH into title-case "Path": capital P, lowercase a, t, h. Use refined custom humanist sans-serif lettering, moderately lighter semi-bold strokes, softly rounded terminals, natural curves, spacious open counters and a very subtle forward movement. The shapes should feel relaxed, optimistic, confident, and contemporary rather than corporate and mechanical. Keep it professional and highly legible, not a childish bubble font, not cursive or handwriting. The new Path word should be optically balanced with the ICAN prefix, with comfortable letter spacing.
P, t, h should be ICAN royal blue #0057A5. The lowercase a should retain the turquoise accent of the source. Keep a small clean white five-point star inside its counter as the destination motif. Retain the concept of a smooth upward-sweeping road flowing from the lower P toward the turquoise a; refine that connector to be graceful and lighter so it does not make the lettering look heavy or confusing.
Keep a clean white background, a single horizontal logo in the same wide landscape format, all artwork comfortably within frame. Flat vector-like color with crisp contours. No extra symbols, text, slogan, explanatory labels, borders, shadows, decorative flourishes or mockup. The visible wordmark must read ICANPath immediately.
```

## Prompt bản chữ a màu hồng

```text
Use case: precise-object-edit.
Asset type: ICANPath logo pink-accent color preview.
Edit target: the supplied ICANPath logo with the soft title-case Path lettering, a green lowercase a containing a blue star, and a thin road connector.
Make exactly these palette changes:
1. Recolor the entire GREEN lowercase a in the right-hand word Path to ICAN hot pink #ED2490.
2. Change the existing blue five-point star inside that a to pure WHITE so it remains clearly visible on pink. Preserve the star's shape, position and size.
3. Change the green end of the thin road connector from P toward a into the same ICAN hot pink, using a subtle continuous ICAN-blue-to-pink transition along the existing curve.
Preserve all other artwork closely, especially the full left-hand ICAN identity (human-shaped blue i, green/pink rays, thin blue C and N, three-color triangular A), all original green/pink details within that identity, blue P t h, relaxed slightly leaning soft letterforms, exact spacing, baseline, proportions, road curve and stroke thickness, wide horizontal composition, white background and margins.
Keep title-case Path, not uppercase PATH. The logo must remain immediately readable as ICANPath. Do not redraw or redesign the lettering. No additional graphics, text, caption, slogan, border, shadows, mockup or decorative elements. Clean flat vector-like artwork on white. Output one logo with the pink a as the sole new color emphasis.
```

## Prompt chuẩn bị nền trong suốt

```text
Use case: background-extraction.
Asset type: transparent production website logo.
Edit target: the supplied approved ICANPath wordmark with the relaxed title-case Path, blue P t h, pink lowercase a and white five-point star, a thin blue-to-pink road connector, and the original ICAN identity on the left.
Remove ONLY the white background and export the exact same approved artwork on genuine transparency. Preserve all logo letterforms, proportions, position, colors, spacing, subtle forward lean, road connector, green and pink ICAN accents, and especially the pink a and white star. Keep the white star inside the pink a white and opaque; it is part of the logo artwork. Background and open spaces outside or between letter shapes must be transparent. Do not redraw, restyle, retype or simplify the logo. No shadow, no added text, no checkerboard pattern baked into the pixels. Keep the full logo comfortably within the wide horizontal frame.
```

