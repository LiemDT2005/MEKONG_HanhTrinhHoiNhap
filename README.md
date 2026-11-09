# Mekong Business Simulator

Trò chơi giáo dục tiếng Việt: điều hành doanh nghiệp chế biến và xuất khẩu gạo tại Cần Thơ qua bốn quý. Giao diện React/Vite; bộ máy tính toán TypeScript độc lập; API ASP.NET Core gọi Gemini từ máy chủ.

**Toàn bộ số liệu là giả định phục vụ học tập. Giá, chất lượng và điều kiện tiếp cận EU/RCEP trong game không phải thống kê hay quy định thực tế. Lợi nhuận kế toán không đồng nhất với giá trị thặng dư.**

Hướng dẫn dành cho người chơi: [Tải cẩm nang PDF 5 trang](HUONG_DAN_CHOI_MEKONG.pdf).

Triển khai online: [Hướng dẫn deploy frontend và backend trên Render](docs/DEPLOY_RENDER.md).

## Chạy trên máy

Đã kiểm tra với Node.js 24, npm 11 và .NET SDK 9.0.308. Cài phụ thuộc lần đầu cần kết nối npm/NuGet.

```powershell
cd D:\MLN_game
npm ci
dotnet restore backend
```

Mở hai terminal tại thư mục dự án:

```powershell
# Terminal 1: backend (http://127.0.0.1:5080)
dotnet run --project backend --no-launch-profile
```

```powershell
# Terminal 2: frontend (http://127.0.0.1:5173)
npm run dev
```

Mở địa chỉ frontend mà Vite hiển thị. Vite chuyển tiếp `/api` sang backend. Nếu cổng 5173 đang dùng, Vite sẽ chọn cổng kế tiếp. Dữ liệu lưu theo origin của trình duyệt, nên các cổng khác nhau có bản lưu riêng.

Không bắt buộc chạy backend để chơi: frontend tự dùng nội dung giáo dục dự phòng khi API không khả dụng. Cố vấn luôn hiển thị rõ chế độ dự phòng; không giả làm phản hồi Gemini.

## Bật Gemini

Đặt biến môi trường **ở terminal chạy backend**, rồi khởi động lại API:

```powershell
$env:GEMINI_API_KEY = '<khóa của bạn>'
$env:GEMINI_MODEL = 'gemini-2.5-flash'
dotnet run --project backend --no-launch-profile
```

`GEMINI_MODEL` có thể đổi sang model được tài khoản hỗ trợ. Không đặt khóa trong `VITE_*`, mã frontend hoặc Git. Tích hợp dùng REST `generateContent` và header `x-goog-api-key` theo [tài liệu Google](https://ai.google.dev/api/generate-content). Timeout phía server là 18 giây, client là 22 giây. Thiếu khóa, lỗi mạng/model, phản hồi rỗng hoặc timeout sẽ chuyển về chế độ dự phòng.

Nếu frontend và backend chạy ở hai origin khác nhau: đặt `VITE_API_BASE_URL` khi build frontend và `FRONTEND_ORIGINS` ở môi trường backend. `FRONTEND_ORIGINS` nhận một hoặc nhiều origin phân cách bằng dấu phẩy. Backend đọc `PORT` để lắng nghe trên `0.0.0.0`; nếu không có `PORT`, dùng `ASPNETCORE_URLS` hoặc mặc định loopback 5080. Đã bổ sung Dockerfile cho Render; xem hướng dẫn triển khai ở trên. Chưa tạo dịch vụ hay xuất bản lên tài khoản Render trong quá trình chuẩn bị này.

## Kịch bản trình diễn 3–5 phút

Giao diện chính đã chuyển sang **bản đồ doanh nghiệp 2.5D**. Thanh trên cùng hiển thị tiền mặt, công suất, chất lượng và chu chuyển. Điều hướng bên trái dùng biểu tượng; rê chuột hoặc dùng bàn phím để xem tên. Trên điện thoại, dùng menu và các nút chọn công trình dưới bản đồ.

| Công trình          | Thao tác                                    |
| ------------------- | ------------------------------------------- |
| Vùng nguyên liệu    | Liên kết hợp tác xã                         |
| Nhà máy chế biến    | Máy sấy, máy tách màu; mở kế hoạch sản xuất |
| Trung tâm nhân sự   | Đào tạo lao động                            |
| Văn phòng điều hành | Truy xuất, báo cáo và cố vấn                |
| Bến cảng Mekong     | Tối ưu logistics; chọn thị trường           |

Nhấn công trình để mở bảng thao tác, chọn nâng cấp, xem dự toán rồi xác nhận. Các nâng cấp xuất hiện trực tiếp trên bản đồ: thiết bị sấy, khu chế biến bổ sung, cờ/nhân sự, hệ thống truy xuất, cần cẩu cảng và điểm liên kết HTX.

Đọc thẻ sự kiện ở nhật ký, cân đối đầu tư, chọn thị trường và nhấn **Vận hành quý này**. Màn hình xác nhận hiển thị số tấn, doanh thu, lợi nhuận, tiền cuối quý và cảnh báo vốn. Sau xác nhận có hoạt ảnh ngắn và bảng kết quả mùa gặt; có thể bỏ qua hoạt ảnh. Trang dự toán chi tiết cũng dùng chung luồng này. Số liệu được ghi nhận một lần ngay khi xác nhận, nên tải lại trong hoạt ảnh vẫn giữ đúng quý đã chốt. Các mục tiêu trong nhật ký chỉ là gợi ý, không khóa cách chơi và không cộng điểm ngoài quy tắc engine.

1. Nhập tên, tạo công ty. Giới thiệu vốn ban đầu 1.000 triệu = 700 tiền mặt + 300 nguyên giá thiết bị.
2. Quý 1: chọn Trung tâm nhân sự để đào tạo, Văn phòng để mua truy xuất, Bến cảng để mở thị trường RCEP; xem cảnh báo vốn và vận hành.
3. Quý 2: chọn Nhà máy mua máy sấy, máy tách màu; chất lượng đạt 80, chọn EU và vận hành. Quan sát công trình mới. Công suất tăng nhưng sản lượng có thể giảm vì chi đầu tư.
4. Quý 3: chọn Bến cảng tối ưu logistics, Vùng nguyên liệu liên kết hợp tác xã; vận hành.
5. Quý 4: xem tác động gián đoạn logistics, sản xuất và đọc báo cáo. Mở so sánh A/B, đổi chỉ tiêu tiền mặt/lợi nhuận/chu chuyển; nhấn mạnh không có quy tắc B luôn thắng.
6. Mở Kiến thức Mác để phân biệt lợi nhuận với m, đầu tư với tích lũy từ giá trị thặng dư. Nút bắt đầu lại có xác nhận; tải lại trang giữ tiến trình hợp lệ.

## Quy tắc tài chính

- Đơn vị tiền: triệu VND; sản lượng là số tấn nguyên. Các đơn hàng được xác nhận trước, sản xuất bao nhiêu bán hết bấy nhiêu trong quý. Không tồn kho, công nợ, vay, thuế hoặc cổ tức.
- Tiền sau đầu tư phải đủ lương và chi cố định thị trường. Nếu không đủ, khóa sản xuất; nếu thiếu vốn nguyên liệu, tự giảm sản lượng theo `floor((cash − mandatoryFixedCash) / unitVariableCost)`.
- Doanh thu = sản lượng × giá theo thị trường/sự kiện. Chi biến đổi = sản lượng × (nguyên liệu + chế biến + logistics + chi thị trường/tấn).
- Máy sấy, tách màu, truy xuất là tài sản cố định. Đào tạo, logistics và hợp tác xã được mô hình hóa là chi phí dịch vụ phát sinh một lần, có lợi ích duy trì trong các quý sau.
- Lợi nhuận kế toán = doanh thu − chi biến đổi − lương − chi cố định − khấu hao − chi đào tạo/dịch vụ đầu tư trong quý. Tài sản cố định không trừ toàn bộ vào lợi nhuận.
- Tiền cuối quý = tiền đầu quý − toàn bộ đầu tư đã trả − chi biến đổi − lương − chi cố định + doanh thu. Không trừ khấu hao vào tiền mặt; không trừ lại khoản đầu tư đã trả.
- Khấu hao giả định: 15 triệu/quý cho thiết bị ban đầu + 2,5% nguyên giá tài sản mua thêm/quý. `equipment` lưu nguyên giá, không phải giá trị còn lại. Trò chơi kéo dài bốn quý.
- Máy sấy giảm chi phí chế biến 0,2 triệu/tấn để minh họa giảm hao hụt. Logistics giảm 0,4 triệu/tấn, hợp tác xã giảm nguyên liệu 0,5 triệu/tấn.
- Sự kiện Q2 giảm giá nội địa 0,5 triệu/tấn; Q3 tăng trần nhu cầu xuất khẩu 5 tấn; Q4 tăng logistics 0,8 triệu/tấn và thời gian 15 ngày, hoặc 0,2 triệu/tấn và 5 ngày nếu đã tối ưu logistics. Hiệu ứng chỉ áp dụng ở quý tương ứng.
- `n = 360 / turnoverDays` là chỉ báo lý luận, không nhân doanh thu/sản lượng. Không suy ra c/v hoặc m từ kết quả kế toán.

Điểm tối đa 100: tài chính 30 (1 điểm/20 triệu lợi nhuận lũy kế, chặn 0–30); công nghệ 25 (máy sấy 10, tách màu 10, truy xuất 5); hội nhập 20 (đã bán EU 20, RCEP 12, nội địa 0); thanh khoản 15 (1 điểm/70 triệu tiền cuối kỳ, chặn 0–15); đào tạo 10. Các giá trị lẻ làm tròn xuống khi tính điểm. Xếp loại: 0–39 khó khăn, 40–59 đang phát triển, 60–79 cạnh tranh khá, 80–100 hội nhập thành công.

Kịch bản A không đầu tư và bán nội địa. B đầu tư đào tạo/truy xuất Q1, máy sấy/tách màu Q2, logistics/hợp tác xã Q3; chọn thị trường đủ điều kiện cao nhất. Hai kịch bản khởi đầu giống hệt và dùng cùng sự kiện. Mọi biểu đồ lấy kết quả từ engine.

## Mã nguồn

- `src/data/gameConfig.ts`: cấu hình tài chính, đầu tư, thị trường và sự kiện.
- `src/engine/simulation.ts`: mua nâng cấp, xác thực thị trường, dự toán, chốt quý, điểm và kịch bản.
- `src/store/`: Zustand/LocalStorage và kiểm tra cấu trúc bản lưu.
- `src/components/`: biểu đồ Recharts, cảnh đồng bằng SVG gốc, cố vấn.
- `src/components/world/BusinessMap.tsx`: bản đồ SVG tương tác và các công trình thay đổi theo nâng cấp.
- `src/components/world/GameWorld.tsx`: HUD, nhật ký, bảng công trình, đầu tư trên bản đồ, xác nhận, hoạt ảnh và kết quả quý.
- `src/components/world/GameDialog.tsx`: hộp thoại bàn phím/Escape và giữ focus; `src/game.css`: giao diện game, bản đồ và bố cục điện thoại.
- `src/App.tsx`: các trang và luồng điều hành; `src/styles.css`: thiết kế đáp ứng, hỗ trợ giảm chuyển động.
- `src/data/marxKnowledge.ts` và `backend/Resources/marx_knowledge.md`: nội dung giáo dục tách khỏi kết quả tài chính.
- `backend/`: controllers, prompt builder, Gemini HTTP service, API models. Không có database.

## API và kiểm tra

`GET /api/health`; `GET /openapi/v1.json`; `POST /api/advisor/analyze`; `POST /api/advisor/chat`.

```json
{
  "question": "Giá trị thặng dư khác lợi nhuận thế nào?",
  "state": { "quarter": 1, "cash": 700 }
}
```

Phản hồi: `{"message":"Nội dung tiếng Việt...","mode":"demo"}` hoặc `mode: "gemini"` khi có phản hồi trực tiếp hợp lệ. Frontend cung cấp trạng thái, lịch sử, sự kiện, dự toán và hai kịch bản đã tính. AI chỉ diễn giải, không có công cụ thay đổi state.

```powershell
npm test
npm run build
dotnet build backend
# Hai server đang chạy:
powershell -File scripts/verify-api.ps1
```

Các bài kiểm tra bao gồm tính tiền/lợi nhuận, tất cả nâng cấp, không chi hai lần, thiếu vốn, điều kiện thị trường, sự kiện không cộng dồn, giới hạn bốn quý, tính xác định của kịch bản, bản lưu và dự phòng khi API lỗi.

## Giới hạn được ghi nhận

- Chưa xác minh phản hồi Gemini thật vì không có khóa API trong môi trường; đã kiểm tra đường dự phòng và frontend/backend kết nối thực tế. Không kiểm thử chất lượng của một model trực tiếp.
- Chỉ lưu trên thiết bị/origin hiện tại; không đăng nhập, đồng bộ nhiều thiết bị hoặc lưu máy chủ. Bản lưu sai cấu trúc bị bỏ qua.
- MVP dùng số liệu giáo dục, không mô phỏng pháp luật, thuế, lãi vay, tỷ giá, tồn kho hoặc thị trường thế giới thực.
- Điểm là thước đo nội bộ cho hoạt động học tập, không phải đánh giá doanh nghiệp thực tế. Giải thích offline chỉ bao phủ chủ đề đã chuẩn bị.
