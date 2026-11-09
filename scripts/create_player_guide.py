from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether,
)

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'pdf' / 'HUONG_DAN_CHOI_MEKONG.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
for name, filename in [('Segoe', 'segoeui.ttf'), ('SegoeBold', 'segoeuib.ttf'), ('SegoeItalic', 'segoeuii.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts') / filename)))
pdfmetrics.registerFontFamily('Segoe', normal='Segoe', bold='SegoeBold', italic='SegoeItalic', boldItalic='SegoeBold')

GREEN = colors.HexColor('#24543a')
INK = colors.HexColor('#294535')
MUTED = colors.HexColor('#687a62')
GOLD = colors.HexColor('#af9149')
PALE = colors.HexColor('#f0f4e7')
BORDER = colors.HexColor('#dce4d1')
WIDTH = A4[0] - 100
styles = {
    'body': ParagraphStyle('body', fontName='Segoe', fontSize=9.8, leading=14, textColor=INK, spaceAfter=6),
    'small': ParagraphStyle('small', fontName='Segoe', fontSize=8.4, leading=12, textColor=MUTED, spaceAfter=5),
    'title': ParagraphStyle('title', fontName='SegoeBold', fontSize=24, leading=30, textColor=GREEN, spaceAfter=8),
    'subtitle': ParagraphStyle('subtitle', fontName='Segoe', fontSize=11, leading=16, textColor=MUTED, spaceAfter=12),
    'h2': ParagraphStyle('h2', fontName='SegoeBold', fontSize=12.5, leading=17, textColor=GREEN, spaceBefore=9, spaceAfter=6),
    'kicker': ParagraphStyle('kicker', fontName='SegoeBold', fontSize=8, leading=12, textColor=GOLD, spaceAfter=8),
    'cell': ParagraphStyle('cell', fontName='Segoe', fontSize=9, leading=13, textColor=INK),
    'th': ParagraphStyle('th', fontName='SegoeBold', fontSize=9, leading=13, textColor=colors.white),
    'code': ParagraphStyle('code', fontName='Segoe', fontSize=9.5, leading=16, textColor=GREEN, spaceAfter=5),
}

def p(text, style='body'):
    return Paragraph(text, styles[style])

def heading(number, title, subtitle):
    return [p(f'CẨM NANG NGƯỜI CHƠI  /  {number:02}', 'kicker'), p(title, 'title'), p(subtitle, 'subtitle')]

def note(text):
    table = Table([[p(text, 'small')]], colWidths=[WIDTH])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), PALE),
        ('BOX', (0,0), (-1,-1), .5, BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 12), ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 10), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    return table

def table(headers, rows, widths):
    content = [[p(escape(str(c)), 'th') for c in headers]] + [[p(str(c), 'cell') for c in row] for row in rows]
    result = Table(content, colWidths=widths, repeatRows=1, hAlign='LEFT')
    result.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), GREEN),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f5f7ef')]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 9), ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LINEBELOW', (0,1), (-1,-1), .35, BORDER),
    ]))
    return result

def step(n, title, text):
    return p(f'<b>{n}. {title}</b> {text}')

def frame(canvas, doc):
    canvas.saveState()
    w,h=A4
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(.5)
    canvas.line(44, h-37, w-44, h-37)
    canvas.setFont('SegoeBold', 7.8)
    canvas.setFillColor(GREEN)
    canvas.drawString(44,h-27,'MEKONG BUSINESS SIMULATOR')
    canvas.setFont('Segoe', 7.8)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(w-44,h-27,'HƯỚNG DẪN CHƠI - BẢN ĐỒ 2.5D')
    canvas.line(44,43,w-44,43)
    canvas.setFont('Segoe',7.3)
    canvas.drawString(44,29,'Mô phỏng giáo dục. Toàn bộ số liệu và điều kiện thị trường là giả định.')
    canvas.setFont('SegoeBold',8)
    canvas.drawRightString(w-44,29,f'{doc.page:02} / 05')
    canvas.restoreState()

story=[]
story += heading(1,'Một hạt gạo. Một hành trình.','Hướng dẫn chơi Mekong Business Simulator - điều hành doanh nghiệp gạo ở Cần Thơ qua 4 quý kinh doanh.')
story += [note('<b>Mục tiêu:</b> Cân đối tiền mặt, đầu tư có chọn lọc, nâng chất lượng và thử sức với thị trường mới. Một lượt chơi phù hợp để trình diễn trong khoảng 3-5 phút.'), Spacer(1,12)]
img = Image(str(ROOT/'docs/world-preview.jpg'))
img.drawHeight = WIDTH * img.imageHeight / img.imageWidth
img.drawWidth = WIDTH
story += [img, Spacer(1,6), p('Bản đồ là màn hình điều hành chính. Nhấn vào công trình để mở bảng thao tác bên cạnh.', 'small')]
story += [p('Bắt đầu trong 6 bước', 'h2')]
story += [step(1,'Tạo công ty.','Nhập tên người chơi và tên doanh nghiệp, chọn <b>Bắt đầu hành trình</b>.'),
          step(2,'Đọc sự kiện.','Mở thẻ trong <b>Nhật ký hành trình</b> hoặc bước <b>Đón nhịp thị trường</b>.'),
          step(3,'Chuẩn bị.','Chọn công trình, xem lợi ích và dự toán trước khi xác nhận đầu tư.'),
          step(4,'Chọn thị trường.','Vào <b>Bến cảng Mekong → Mở bản đồ thị trường</b>.'),
          step(5,'Chốt quý.','Chọn <b>Vận hành quý này → Bắt đầu vận hành</b> sau khi đọc dự toán.'),
          step(6,'Xem mùa gặt.','Đọc kết quả, tiếp tục quý sau. Sau quý 4, chọn <b>Khám phá thành tích</b>.')]
story += [p('<b>Khởi đầu:</b> 700 triệu tiền mặt + 300 triệu nguyên giá thiết bị = 1.000 triệu vốn; công suất 40 tấn/quý, chất lượng 50/100, chu chuyển 60 ngày.', 'small')]

story += [PageBreak()]
story += heading(2,'Đầu tư ở đâu? Bán cho ai?','Mỗi nâng cấp chỉ mua một lần; có hiệu lực ngay và duy trì trong các quý tiếp theo. Tất cả giá tiền dưới đây là triệu đồng.')
story += [table(['Khoản đầu tư / nơi chọn','Giá','Hiệu quả trong game'],[
    ['<b>Máy sấy lúa công nghệ cao</b><br/>Nhà máy chế biến','120','Công suất +10 tấn/quý; chi phí chế biến giảm 0,2 triệu/tấn.'],
    ['<b>Máy tách màu tự động</b><br/>Nhà máy chế biến','150','Chất lượng +15 điểm; bổ sung thiết bị chế biến.'],
    ['<b>Đào tạo lao động</b><br/>Trung tâm nhân sự','40','Chất lượng +5 điểm; chu kỳ chu chuyển giảm 5 ngày.'],
    ['<b>Tối ưu logistics</b><br/>Bến cảng Mekong','100','Vận chuyển giảm 0,4 triệu/tấn; chu kỳ giảm 10 ngày; giảm tác động sự kiện quý 4.'],
    ['<b>Hệ thống truy xuất nguồn gốc</b><br/>Văn phòng điều hành','60','Chất lượng +10 điểm; đáp ứng điều kiện truy xuất để mở EU.'],
    ['<b>Liên kết hợp tác xã</b><br/>Vùng nguyên liệu','50','Nguyên liệu giảm 0,5 triệu/tấn; điểm liên kết HTX xuất hiện trên bản đồ.'],
], [195,43,WIDTH-238]), Spacer(1,12)]
story += [note('<b>Trước khi mua:</b> xem tiền còn lại, số tấn dự kiến và tiền cuối quý. Nếu nút đầu tư bị mờ, hãy đọc trạng thái: đã mua, không đủ tiền hoặc game đã kết thúc. Không có thao tác hoàn tiền khoản đầu tư đã xác nhận.')]
story += [p('Ba thị trường trong trò chơi', 'h2')]
story += [table(['Thị trường','Điều kiện mở','Giá / nhu cầu cơ sở'],[
    ['<b>Nội địa</b>','Mở ngay khi bắt đầu.','22 triệu/tấn<br/>Tối đa 55 tấn/quý'],
    ['<b>RCEP</b>','Chất lượng từ 60/100.','25 triệu/tấn<br/>Tối đa 48 tấn/quý'],
    ['<b>EU - EVFTA</b>','Chất lượng từ 80/100 <b>và</b> đã mua truy xuất.','29 triệu/tấn<br/>Tối đa 45 tấn/quý'],
], [85,235,WIDTH-320]), Spacer(1,9)]
story += [p('Xuất khẩu có thêm chi phí: RCEP 12 triệu/quý + 0,6 triệu/tấn; EU 25 triệu/quý + 1,1 triệu/tấn. Giá bán cao hơn không bảo đảm lợi nhuận cao hơn. Quý 3 tăng nhu cầu xuất khẩu thêm 5 tấn.', 'small'),
          p('<b>Điện thoại:</b> dùng các nút Nguyên liệu, Nhà máy, Nhân sự, Văn phòng, Bến cảng bên dưới bản đồ. Bảng thao tác tự cuộn vào khung nhìn khi chọn công trình.', 'small')]

story += [PageBreak()]
story += heading(3,'Đi qua bốn quý kinh doanh','Lộ trình dưới đây giúp khám phá đầy đủ chức năng. Đây không phải chiến lược tối ưu điểm số hay lợi nhuận.')
story += [p('Quý 1 - Gieo nền tảng', 'h2'), p('Đọc sự kiện khởi đầu. Vào <b>Trung tâm nhân sự</b> mua đào tạo (40), rồi <b>Văn phòng</b> mua truy xuất (60). Chất lượng đạt 65/100. Vào <b>Bến cảng</b> chọn RCEP, quay về bản đồ và vận hành.'),
          p('Quý 2 - Đổi mới công nghệ', 'h2'), p('Vào <b>Nhà máy</b> mua máy sấy (120) và máy tách màu (150). Công suất đạt 50 tấn/quý, chất lượng đạt 80/100. Chọn EU và vận hành. Lưu ý: tiền mua máy có thể khiến sản lượng thực tế giảm dù công suất tăng.'),
          p('Quý 3 - Chuẩn bị cho chặng cuối', 'h2'), p('Tại <b>Bến cảng</b>, mua tối ưu logistics (100); tại <b>Vùng nguyên liệu</b>, mua liên kết hợp tác xã (50). Giữ EU và vận hành. Sự kiện quý này tăng trần nhu cầu xuất khẩu, nhưng vốn lưu động vẫn có thể giới hạn sản lượng.'),
          p('Quý 4 - Vượt thách thức logistics', 'h2'), p('Đọc thẻ gián đoạn vận chuyển. Nếu đã nâng cấp logistics, phần tăng chi phí chỉ còn 0,2 triệu/tấn và phần tăng chu kỳ còn 5 ngày; nếu chưa, lần lượt là 0,8 triệu/tấn và 15 ngày. Vận hành, xem kết quả rồi mở thành tích.')]
story += [p('Kết quả đối chiếu khi làm đúng lộ trình trên', 'h2'), p('Các cột doanh thu, lợi nhuận và tiền cuối quý dùng đơn vị triệu đồng.', 'small')]
story += [table(['Quý','Tấn bán','Doanh thu','Lợi nhuận','Tiền cuối quý'],[
    ['1 - RCEP','27','675','34,8','691,3'],
    ['2 - EU','16','464','27,35','471,9'],
    ['3 - EU','11','319','-170,75','324,4'],
    ['4 - EU','11','319','-22,95','324,7'],
],[85,65,105,115,WIDTH-370]), Spacer(1,10)]
story += [note('<b>Đọc đúng kết quả:</b> cuối hành trình có đủ 6 nâng cấp, tiền mặt 324,7 triệu và điểm 59/100. Lợi nhuận lũy kế là -131,55 triệu. Lộ trình này minh họa sức ép vốn do đầu tư dồn dập, không chứng minh càng mua nhiều càng kinh doanh tốt.')]
story += [p('<b>Muốn thử chiến lược riêng?</b> Bạn có thể giữ thị trường nội địa, hoãn một số khoản mua hoặc chỉ chọn vài nâng cấp. Các mục tiêu gợi ý trong nhật ký không bắt buộc hoàn thành.', 'small')]

story += [PageBreak()]
story += heading(4,'Hiểu kết quả, rút ra bài học','Hãy xem đồng thời tiền mặt, lợi nhuận và năng lực phát triển; một con số riêng lẻ chưa đủ để đánh giá doanh nghiệp.')
story += [p('Bốn chỉ số trên thanh tài nguyên', 'h2'),
          p('<b>Tiền mặt:</b> số tiền còn dùng được để mua nâng cấp và vận hành. <b>Công suất:</b> khả năng tối đa của dây chuyền, không phải số tấn chắc chắn bán được. <b>Chất lượng:</b> chỉ số giúp mở thị trường. <b>Chu chuyển:</b> số ngày một vòng tư bản theo mô hình học tập; n = 360 / số ngày, không phải hệ số nhân doanh thu.')]
story += [p('Vì sao công suất 40 nhưng chỉ sản xuất 35 tấn?', 'h2'),
          p('Game chọn sản lượng nhỏ nhất trong ba giới hạn: <b>công suất, nhu cầu và số tấn đủ vốn</b>. Nếu không đầu tư ở quý đầu, 700 triệu tiền mặt phải giữ lại 110 triệu cho lương và chi cố định; phần còn lại đủ mua đầu vào cho 35 tấn. Cảnh báo thiếu vốn là tín hiệu cần cân đối, không phải lỗi game.')]
story += [p('Tiền mặt khác lợi nhuận như thế nào?', 'h2'),
          p('Mua máy làm giảm tiền mặt ngay, nhưng giá máy không bị trừ toàn bộ vào lợi nhuận quý mua. Khấu hao làm giảm lợi nhuận mà không chi thêm tiền. Đào tạo, logistics và liên kết được ghi nhận là chi phí một lần trong quý mua. Vì vậy có thể có lỗ kế toán nhưng tiền mặt cuối quý vẫn tăng.')]
story += [p('Thang điểm 100', 'h2'),table(['Nhóm','Tối đa','Cách nhận điểm'],[
    ['Hiệu quả tài chính','30','1 điểm / 20 triệu lợi nhuận lũy kế; tối thiểu 0.'],
    ['Năng suất, công nghệ','25','Máy sấy: 10; tách màu: 10; truy xuất: 5.'],
    ['Hội nhập','20','Đã bán EU: 20; nếu chưa có EU nhưng đã bán RCEP: 12. Không cộng dồn hai mức.'],
    ['Thanh khoản','15','1 điểm / 70 triệu tiền cuối hành trình.'],
    ['Lao động','10','Đã đào tạo lao động: 10.'],
],[130,52,WIDTH-182]),Spacer(1,8),p('Các điểm lẻ làm tròn xuống và giới hạn ở mức tối đa từng nhóm. Xếp loại: 0-39 gặp khó khăn; 40-59 đang phát triển; 60-79 cạnh tranh khá; 80-100 hội nhập thành công.', 'small')]
story += [p('So sánh chiến lược và kiến thức Mác', 'h2'),
          p('Mở <b>Báo cáo → So sánh hai chiến lược</b>, lần lượt chọn doanh thu, lợi nhuận, tiền mặt, công suất, chất lượng và chu chuyển. A không tái đầu tư; B đầu tư theo lộ trình ở trang 3. Hai bên có cùng điểm khởi đầu và cùng sự kiện. B không mặc định thắng A về tiền hay lợi nhuận.'),
          note('<b>Nhớ ba phân biệt:</b> lợi nhuận kế toán không tự động bằng giá trị thặng dư m; mua máy bằng vốn ban đầu chưa tự động là tích lũy từ giá trị thặng dư; liên kết HTX không tự động là sáp nhập/tập trung tư bản. Mở mục Kiến thức Mác để đọc các ví dụ lý luận riêng.')]

story += [PageBreak()]
story += heading(5,'Mở game và xử lý tình huống','Phần tham khảo khi chơi trên máy cá nhân. Nếu game đã được mở sẵn, bạn có thể bỏ qua phần khởi động.')
story += [p('Mở project trên máy hiện tại', 'h2'),p('Mở hai terminal PowerShell tại thư mục dự án. Giữ các terminal đang chạy trong lúc chơi.'),
          p('<b>Terminal 1 - chạy backend:</b>','small'),note('cd D:\\MLN_game<br/>dotnet run --project backend --no-launch-profile'),Spacer(1,10),
          p('<b>Terminal 2 - chạy frontend:</b>','small'),note('cd D:\\MLN_game<br/>npm run dev'),Spacer(1,10),
          p('Mở <link href="http://127.0.0.1:5173" color="#24543a"><b>http://127.0.0.1:5173</b></link>. Nếu Vite hiện cổng khác, dùng địa chỉ được in trong terminal. Trên máy khác cần cài Node.js và .NET SDK 9, rồi chạy npm ci và dotnet restore backend trước khi khởi động.', 'small')]
story += [p('Các tình huống thường gặp', 'h2'),table(['Tình huống','Bạn nên làm gì?'],[
    ['<b>Không đủ tiền mua nâng cấp</b>','Hoãn đầu tư, chọn khoản khác hoặc vận hành để xem kết quả. Game không có cơ chế vay nợ.'],
    ['<b>Không đủ tiền để vận hành</b>','Thử thị trường ít chi phí hơn. Mức tối thiểu cho lương và chi cố định: nội địa 110, RCEP 122, EU 135 triệu. Đây chưa bao gồm tiền đầu vào theo sản lượng. Nếu vẫn thiếu, cần bắt đầu lại.'],
    ['<b>EU/RCEP bị khóa</b>','Đọc điều kiện trên thẻ thị trường. Kiểm tra chất lượng và truy xuất; nâng cấp đúng khoản cần thiết.'],
    ['<b>Cố vấn báo chế độ dự phòng</b>','Vẫn chơi bình thường. Đây là nội dung giáo dục có sẵn; Gemini trực tiếp cần người vận hành cấu hình khóa API trên backend.'],
    ['<b>Muốn tiếp tục sau khi đóng trang</b>','Dùng cùng trình duyệt, hồ sơ và địa chỉ/cổng. Tiến trình lưu trên thiết bị; xóa dữ liệu trình duyệt hoặc đổi cổng có thể không thấy bản lưu cũ.'],
    ['<b>Muốn chơi lại từ đầu</b>','Nhấn biểu tượng mũi tên tròn Bắt đầu lại ở góc trên, rồi xác nhận. Thao tác xóa tiến trình đã lưu trên origin hiện tại.'],
],[145,WIDTH-145]),Spacer(1,10)]
story += [note('<b>Mẹo điều khiển:</b> rê chuột lên biểu tượng bên trái để xem tên; dùng Tab để chuyển điều khiển và Enter/Space để chọn công trình; Escape để đóng hộp thoại. Trên điện thoại, nhấn menu để mở điều hướng. Có thể bỏ qua hoạt ảnh mà không đổi kết quả tài chính.')]

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=44, leftMargin=44, topMargin=54, bottomMargin=52, title='Hướng dẫn chơi Mekong Business Simulator', author='Mekong Business Simulator', subject='Cẩm nang người chơi - giao diện bản đồ 2.5D')
doc.build(story, onFirstPage=frame, onLaterPages=frame)
print(OUT)
