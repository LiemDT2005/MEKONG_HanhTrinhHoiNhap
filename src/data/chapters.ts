import type { MarketId, UpgradeId } from "../types/game";
export interface ChapterChoice {
  id: string;
  title: string;
  benefit: string;
  risk: string;
  upgrades: UpgradeId[];
  market?: MarketId;
}
export const chapters: {
  title: string;
  speaker: string;
  dialogue: string;
  theory: string;
  question: string;
  lesson: string;
  objective: string;
  achievement: string;
  choices: ChapterChoice[];
}[] = [
  {
    title: "Vòng luẩn quẩn của doanh nghiệp nhỏ",
    speaker: "Cô Lan · Kế toán",
    dialogue:
      "Ta có 700 triệu tiền mặt nhưng còn phải mua lúa và trả lương. Mua máy ngay hay tích lũy qua từng đơn hàng?",
    theory:
      "Tái sản xuất giản đơn duy trì quy mô; tái sản xuất mở rộng cần thêm tư liệu sản xuất và sức lao động. Đầu tư từ vốn ban đầu chưa chứng minh tích lũy từ giá trị thặng dư.",
    question:
      "Công suất tăng có tạo thêm sản phẩm khi vốn mua nguyên liệu đang thiếu?",
    lesson:
      "Tích lũy cần cả nguồn vốn và điều kiện vận hành; giữ quy mô có thể bảo vệ thanh khoản.",
    objective: "Bán ít nhất 30 tấn và giữ 700 triệu tiền mặt cuối chương.",
    achievement: "Giữ nhịp tái sản xuất",
    choices: [
      {
        id: "reserve",
        title: "Giữ quy mô, tạo nguồn tích lũy",
        benefit: "Không chi thêm; dành tiền cho nguyên liệu.",
        risk: "Công suất và chất lượng giữ nguyên; khó mở thị trường mới.",
        upgrades: [],
        market: "domestic",
      },
      {
        id: "people",
        title: "Đầu tư vào tay nghề",
        benefit: "Đào tạo: +5 chất lượng, −5 ngày chu kỳ.",
        risk: "Chi phí 40 triệu giảm tiền mặt và lợi nhuận kỳ này.",
        upgrades: ["training"],
      },
      {
        id: "expand",
        title: "Mở rộng bằng máy sấy",
        benefit: "+10 tấn công suất; chế biến giảm 0,2 triệu/tấn.",
        risk: "120 triệu bị rút khỏi vốn lưu động; khấu hao tăng, máy có thể chạy dưới công suất.",
        upgrades: ["dryer"],
      },
    ],
  },
  {
    title: "Cuộc đua công nghệ",
    speaker: "Anh Minh · Quản đốc",
    dialogue:
      "Đối thủ đổi dây chuyền, giá nội địa giảm 0,5 triệu mỗi tấn. Ta cần chất lượng máy móc, kỹ năng hay liên kết nguồn lúa?",
    theory:
      "Công nghệ có thể nâng năng suất lao động; cấu tạo hữu cơ của tư bản phản ánh quan hệ cấu tạo giá trị do cấu tạo kỹ thuật quyết định. Game không lấy thiết bị/tiền lương làm c/v.",
    question:
      "Máy đắt hơn có hữu ích nếu chưa đủ vốn vận hành hoặc chưa có đơn hàng phù hợp?",
    lesson:
      "Đổi mới kỹ thuật cần kỹ năng và hợp tác; chi nhiều không tự động tạo hiệu quả cao.",
    objective: "Đạt chất lượng 60 và bán ít nhất 25 tấn.",
    achievement: "Năng lực sản xuất mới",
    choices: [
      {
        id: "automation",
        title: "Tách màu tự động",
        benefit: "+15 chất lượng, nâng khả năng tiếp cận xuất khẩu.",
        risk: "150 triệu vốn cố định; tăng khấu hao và giảm vốn mua lúa.",
        upgrades: ["sorter"],
      },
      {
        id: "cooperation",
        title: "Tay nghề và hợp tác xã",
        benefit: "+5 chất lượng, −5 ngày; nguyên liệu giảm 0,5 triệu/tấn.",
        risk: "90 triệu chi phí dịch vụ/đào tạo nếu chưa sở hữu; không nâng công suất máy.",
        upgrades: ["training", "cooperative"],
      },
      {
        id: "trace",
        title: "Chuẩn hóa và truy xuất",
        benefit: "+10 chất lượng; chuẩn bị điều kiện EU trong game.",
        risk: "60 triệu; truy xuất riêng lẻ chưa đủ chất lượng 80 để vào EU.",
        upgrades: ["traceability"],
      },
    ],
  },
  {
    title: "Điểm nghẽn logistics",
    speaker: "Chị Hạnh · Điều phối cảng",
    dialogue:
      "Tàu chậm, vận chuyển tăng 0,8 triệu/tấn và chu kỳ kéo dài 15 ngày. Cắt chi phí, rút ngắn lưu thông hay giữ tiền?",
    theory:
      "Chu chuyển gồm thời gian sản xuất và lưu thông. Rút ngắn lưu thông giúp vốn quay lại nhanh hơn; lưu thông không tự tạo giá trị thặng dư.",
    question:
      "Nếu chu kỳ ngắn hơn nhưng đơn hàng không đổi, doanh thu có nhất thiết tăng ngay?",
    lesson:
      "Giảm thời gian và chi phí lưu thông củng cố sức cạnh tranh. Trong mô hình này số vòng/năm chỉ là chỉ báo, không nhân thêm doanh thu.",
    objective: "Chu kỳ không quá 60 ngày và lợi nhuận hoạt động dương.",
    achievement: "Khơi thông dòng vốn",
    choices: [
      {
        id: "route",
        title: "Tối ưu tuyến vận chuyển",
        benefit:
          "−10 ngày nền; giảm cú sốc còn +5 ngày và +0,2 triệu/tấn; giảm phí nền 0,4 triệu/tấn.",
        risk: "100 triệu chi phí kỳ này; lợi nhuận kế toán có thể giảm.",
        upgrades: ["logistics"],
      },
      {
        id: "supply",
        title: "Liên kết vùng nguyên liệu",
        benefit:
          "Giảm nguyên liệu 0,5 triệu/tấn để bù một phần chi phí vận tải.",
        risk: "50 triệu; không xử lý được chậm tàu.",
        upgrades: ["cooperative"],
      },
      {
        id: "wait",
        title: "Giữ tiền, chịu gián đoạn",
        benefit: "Không đầu tư thêm, bảo vệ vốn sản xuất.",
        risk: "Chịu phí vận chuyển và chậm trễ theo năng lực logistics hiện có.",
        upgrades: [],
      },
    ],
  },
  {
    title: "Vươn ra thị trường quốc tế",
    speaker: "Chú Phúc · Đối tác thương mại",
    dialogue:
      "Đơn hàng xuất khẩu tăng 5 tấn. Chọn EU, khu vực RCEP hay tiếp tục củng cố nội địa? Giá cao đi cùng chi phí tuân thủ.",
    theory:
      "Năng lực cạnh tranh quốc tế cần tích lũy, công nghệ, lao động và chu chuyển phối hợp. Hội nhập mở cơ hội, không bảo đảm lợi nhuận cho mọi doanh nghiệp.",
    question:
      "Giá bán EU cao hơn có bù được chi phí tuân thủ và lượng vốn bị ràng buộc?",
    lesson:
      "Tiếp cận thị trường cần năng lực thực tế. EVFTA/RCEP có quy tắc xuất xứ; điểm chất lượng trong game không phải tiêu chuẩn pháp lý.",
    objective:
      "Bán xuất khẩu có lãi hoạt động; giữ ít nhất 300 triệu tiền mặt.",
    achievement: "Đơn hàng vượt biên giới",
    choices: [
      {
        id: "regional",
        title: "Đơn hàng khu vực RCEP",
        benefit: "Giá 25 triệu/tấn; nhu cầu 53 tấn ở chương này.",
        risk: "Cần chất lượng 60; chi tuân thủ 12 triệu và thêm 0,6 triệu/tấn.",
        upgrades: [],
        market: "rcep",
      },
      {
        id: "europe",
        title: "Đơn hàng EU · EVFTA",
        benefit: "Giá 29 triệu/tấn; nhu cầu 50 tấn ở chương này.",
        risk: "Cần chất lượng 80 và truy xuất; chi tuân thủ 25 triệu và thêm 1,1 triệu/tấn.",
        upgrades: [],
        market: "eu",
      },
      {
        id: "home",
        title: "Củng cố thị trường nội địa",
        benefit: "Không thêm chi phí tuân thủ, giữ thị trường quen thuộc.",
        risk: "Giá 22 triệu/tấn; chưa chứng minh khả năng bán quốc tế.",
        upgrades: [],
        market: "domestic",
      },
    ],
  },
];
