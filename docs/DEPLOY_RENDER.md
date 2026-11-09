# Deploy Mekong Business Simulator trên Render

Mô hình: một **Web Service (Docker)** chạy ASP.NET API và một **Static Site** chạy React/Vite. Cả hai dùng repo `LiemDT2005/MEKONG_HanhTrinhHoiNhap`, nhánh `main`. Không cần database hoặc cài Docker trên máy để dùng cách này: Render build image từ repo.

Tài liệu chính thức: [Docker](https://render.com/docs/docker), [Static Sites](https://render.com/docs/static-sites), [PORT](https://render.com/docs/web-services#port-binding), [Rewrite](https://render.com/docs/redirects-rewrites).

## 1. Tạo backend trước

1. Đăng nhập [Render Dashboard](https://dashboard.render.com/).
2. Chọn **New → Web Service**.
3. Kết nối tài khoản GitHub và chọn repo `LiemDT2005/MEKONG_HanhTrinhHoiNhap`. Dùng kết nối GitHub để có thể tự deploy khi push code.
4. Điền cấu hình sau:

| Trường                                  | Giá trị                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| Name                                    | Tên bạn chọn, ví dụ `mekong-api` nếu còn trống                                 |
| Branch                                  | `main`                                                                         |
| Region                                  | Chọn khu vực gần người chơi, chẳng hạn Singapore nếu Dashboard có lựa chọn này |
| Root Directory                          | **Để trống**                                                                   |
| Language / Runtime                      | **Docker**                                                                     |
| Dockerfile Path                         | `./backend/Dockerfile`                                                         |
| Docker Build Context Directory (nếu có) | `.`                                                                            |
| Docker Command                          | **Để trống**, dùng ENTRYPOINT trong Dockerfile                                 |
| Instance Type                           | `Free` để dùng thử, hoặc gói trả phí tùy nhu cầu                               |
| Health Check Path                       | `/api/health`                                                                  |

Không nhập npm build hay dotnet run vào Docker Command. Không đặt Root Directory thành `backend`: Dockerfile dùng đường dẫn COPY tính từ gốc repo.

5. Trong **Environment**, thêm:

| Key                      | Value                                                                          |
| ------------------------ | ------------------------------------------------------------------------------ |
| `ASPNETCORE_ENVIRONMENT` | `Production`                                                                   |
| `PORT`                   | `10000`                                                                        |
| `GEMINI_MODEL`           | `gemini-2.5-flash`, hoặc model tài khoản của bạn hỗ trợ                        |
| `GEMINI_API_KEY`         | Khóa Gemini của bạn, chỉ thêm ở backend; có thể bỏ qua để dùng cố vấn dự phòng |

`FRONTEND_ORIGINS` sẽ được thêm ở bước 3, sau khi biết URL frontend thật.

6. Nhấn **Deploy Web Service** hoặc **Create Web Service** tùy giao diện Dashboard. Chờ trạng thái **Live**.
7. Sao chép URL backend do Render cấp. Không suy đoán URL từ tên dịch vụ vì Render có thể thêm hậu tố.
8. Mở `URL_BACKEND/api/health`. Ví dụ cách ghép: nếu URL thật là `https://abc.onrender.com`, mở `https://abc.onrender.com/api/health`.

Kết quả hợp lệ:

```json
{ "status": "ok", "mode": "demo" }
```

Nếu đã đặt khóa, `mode` ở health có thể là `gemini`; điều này chỉ cho biết đã có khóa, chưa chứng minh Gemini trả lời thành công. Cần thử cố vấn trong game ở bước 4.

## 2. Tạo frontend

1. Chọn **New → Static Site** và chọn cùng repo GitHub.
2. Điền:

| Trường            | Giá trị                                         |
| ----------------- | ----------------------------------------------- |
| Name              | Tên bạn chọn, ví dụ `mekong-game` nếu còn trống |
| Branch            | `main`                                          |
| Root Directory    | **Để trống**                                    |
| Build Command     | `npm ci --include=dev && npm run build`         |
| Publish Directory | `dist`                                          |

3. Thêm **Environment Variables** trước khi build:

| Key                 | Value                                                                     |
| ------------------- | ------------------------------------------------------------------------- |
| `NODE_VERSION`      | `24.13.0`                                                                 |
| `SKIP_INSTALL_DEPS` | `true` (build command đã chạy npm ci)                                     |
| `VITE_API_BASE_URL` | URL backend thật ở bước 1, ví dụ dạng `https://YOUR-BACKEND.onrender.com` |

Giá trị `VITE_API_BASE_URL` không thêm `/api`, không dùng địa chỉ localhost. Không đặt API key trong bất kỳ biến `VITE_*` nào: chúng được đưa vào mã trình duyệt. Các URL dạng `YOUR-BACKEND` trong hướng dẫn chỉ là chỗ giữ chỗ, phải thay bằng URL thật của bạn.

4. Nhấn **Deploy Static Site** hoặc **Create Static Site**. Chờ **Live**, rồi sao chép URL frontend do Render cấp.
5. Mở **Redirects/Rewrites** (có thể nằm trong Settings), thêm:

| Source | Destination   | Action      |
| ------ | ------------- | ----------- |
| `/*`   | `/index.html` | **Rewrite** |

Phải chọn Rewrite, không chọn Redirect. Đây là cấu hình để mở trực tiếp hoặc refresh `/game`, `/game/report`... không bị 404.

## 3. Kết nối CORS ở backend

1. Quay về dịch vụ backend → **Environment**.
2. Thêm:

```text
FRONTEND_ORIGINS=https://URL-FRONTEND-THAT-CUA-BAN.onrender.com
```

Chỉ nhập origin thật gồm `https://` và hostname; không thêm `/game`. Nếu có nhiều frontend/domain, phân cách bằng dấu phẩy, không dùng dấu `*`.

3. Chọn **Save and deploy** (hoặc lưu rồi redeploy backend).
4. Nếu sau này đổi domain frontend, cập nhật biến này. Nếu đổi URL backend, cập nhật `VITE_API_BASE_URL` ở Static Site rồi **build/deploy lại frontend**: biến Vite được cố định trong lúc build.

## 4. Kiểm tra trước khi gửi link

- Mở URL frontend, nhập tên và bắt đầu game.
- Chọn công trình, thử đầu tư và chốt một quý; kiểm tra bản đồ và tiền mặt cập nhật.
- Refresh ngay ở `/game`: trang vẫn mở và tiến trình vẫn còn.
- Mở Cố vấn AI. Nếu chưa cấu hình khóa, hiển thị Chế độ dự phòng là bình thường. Nếu đã cấu hình, chỉ coi Gemini hoạt động khi thực sự có phản hồi trực tiếp.
- Trong DevTools → Network, request đến `/api/advisor/analyze` hoặc `/api/advisor/chat` phải đi đến đúng hostname backend, không phải localhost hoặc hostname Static Site. Với chế độ dự phòng từ server, HTTP 200 có `mode: "demo"` vẫn là kết nối API hợp lệ.
- Gửi **URL frontend** cho người chơi; URL backend dành cho API.

Tiến trình lưu trong trình duyệt theo domain/origin. Bản lưu localhost không tự chuyển sang bản online; dùng máy, trình duyệt hoặc domain khác sẽ có bản lưu riêng.

## 5. Các lỗi thường gặp

| Triệu chứng                                | Cách kiểm tra                                                                                                                                  |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend không deploy                       | Kiểm tra Language là Docker, Root Directory trống, Dockerfile Path đúng và build context là gốc repo. Đọc dòng lỗi đầu tiên trong Deploy Logs. |
| Port scan timeout                          | Backend phải đọc PORT và bind `0.0.0.0`; repo đã cấu hình việc này. Giữ `PORT=10000` trừ khi bạn chủ động đổi.                                 |
| Refresh `/game` báo 404                    | Thêm Rewrite `/*` → `/index.html`.                                                                                                             |
| CORS error                                 | `FRONTEND_ORIGINS` phải khớp chính xác URL frontend đang dùng, kể cả http/https và hậu tố hostname. Lưu và redeploy backend.                   |
| Cố vấn luôn dự phòng                       | Kiểm tra health, URL request, CORS và khóa/model. Game vẫn chạy nếu API lỗi.                                                                   |
| Đổi VITE_API_BASE_URL nhưng request vẫn cũ | Redeploy/build lại Static Site; tải lại trình duyệt sau khi build mới Live.                                                                    |
| Lần mở API đầu tiên chậm                   | Backend Free có thể ngủ khi không có truy cập. Mở health và đợi Live trước buổi demo; thử lại cố vấn khi API đã sẵn sàng.                      |

Render Free Web Service ngủ sau 15 phút không có truy cập; khởi động lại có thể khoảng một phút. Static Site không phụ thuộc backend để chạy gameplay. Client hiện timeout cố vấn sau 22 giây và có dự phòng, nên lần gọi AI đầu khi backend đang ngủ có thể về dự phòng. Chi tiết: [Render Free](https://render.com/docs/free).

## Phạm vi kiểm tra cấu hình

Dockerfile dùng SDK/runtime .NET 9 tương ứng với project hiện tại. Bản chuẩn bị được kiểm tra bằng build/publish ASP.NET, build/test frontend và chạy bản publish với PORT/CORS từ biến môi trường. Docker Desktop trên máy chuẩn bị chưa chạy, nên image chưa được build/chạy cục bộ; lần build image thực tế sẽ diễn ra trên Render. Chưa có dịch vụ Render hoặc URL online được tạo tự động bằng hướng dẫn này.
