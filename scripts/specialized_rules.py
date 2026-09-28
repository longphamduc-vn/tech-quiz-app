# Specialized Engineering Rules with Bilingual Terminology

SPECIALIZED_CASES = {
    # Q1520: Khoảng cách giữa 2 bản cực tụ điện
    1520: """**Đáp án chính xác:** **D. d (Distance)**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Công thức điện dung của tụ điện phẳng (Parallel-plate Capacitor):**
   $$C = \\frac{\\varepsilon \\cdot \\varepsilon_0 \\cdot S}{d}$$
   Trong đó:
   - $C$: Điện dung của tụ điện (Capacitance), đơn vị Farad (F).
   - $\\varepsilon$: Hằng số điện môi tương đối của chất cách điện giữa hai bản cực (Relative Permittivity / Dielectric Constant).
   - $\\varepsilon_0$: Hằng số điện môi chân không (Permittivity of Free Space, $\\varepsilon_0 \\approx 8.854 \\times 10^{-12}\\,\\text{F/m}$).
   - $S$: Diện tích bề mặt đối diện của hai bản cực (Plate Area), đơn vị $\\text{m}^2$.
   - $d$: Khoảng cách giữa hai bản điện cực (Distance / Separation between plates), đơn vị mét (m).

2. **Ý nghĩa kỹ thuật (Engineering Principle):**
   - Khoảng cách $d$ tỉ lệ nghịch với điện dung $C$. Khi khoảng cách giữa hai bản cực càng nhỏ thì điện dung $C$ càng lớn và cường độ điện trường ($E = \\frac{V}{d}$) càng cao.
   - Ký hiệu tiêu chuẩn quốc tế cho khoảng cách giữa hai bản điện cực là ký tự **$d$** (viết tắt của từ tiếng Anh *Distance*).

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Tụ điện phẳng: *Parallel-plate Capacitor*
- Khoảng cách bản cực: *Plate Separation / Distance ($d$)*
- Hằng số điện môi: *Dielectric Constant / Permittivity ($\\varepsilon$)*
- Điện dung: *Capacitance ($C$)*
- Cường độ điện trường: *Electric Field Strength ($E$)*""",

    # Q1288: Ampe kìm đo dòng
    1288: """**Đáp án chính xác:** **B. Ampe kìm đo dòng (Clamp Meter)**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Nguyên lý máy biến dòng (Current Transformer - CT):**
   - Ampe kìm hoạt động như một máy biến dòng đo lường (CT). Khi mở ngàm kẹp và kẹp vào một sợi dây dẫn mang dòng điện tải xoay chiều (AC), sợi dây dẫn đó đóng vai trò là cuộn sơ cấp (Primary Winding) với số vòng dây $N_1 = 1$.
   - Ngàm kẹp bằng vật liệu từ tính đóng vai trò là lõi thép dẫn từ thông. Bên trong thân ampe kìm có cuộn dây thứ cấp (Secondary Winding) với số vòng dây $N_2$ rất lớn.
   - Theo định luật cảm ứng điện từ: $I_2 = I_1 \\times \\frac{N_1}{N_2}$. Dòng điện cảm ứng ở cuộn thứ cấp tỉ lệ thuận với dòng điện trong dây dẫn và được mạch điện tử xử lý, chuyển đổi hiển thị lên màn hình đo mà không cần ngắt mạch điện.

2. **Phân biệt thiết bị đo:**
   - *Đồng hồ vạn năng (Digital Multimeter):* Khi đo dòng điện cần đấu nối tiếp que đo vào mạch.
   - *Đồng hồ đo điện trở cách điện (Megohmmeter):* Sử dụng điện áp cao để kiểm tra độ cách điện của dây dẫn và vỏ máy.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Ampe kìm đo dòng: *Clamp Meter / Current Clamp*
- Máy biến dòng đo lường: *Current Transformer (CT)*
- Cuộn sơ cấp / thứ cấp: *Primary / Secondary Winding*
- Đo lường không tiếp xúc: *Non-invasive Current Measurement*""",

    # Q1550: Áp suất khí quyển tiêu chuẩn
    1550: """**Đáp án chính xác:** **C. 1.033kgf / 1cm²**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Định nghĩa áp suất khí quyển tiêu chuẩn (Standard Atmospheric Pressure - $P_{atm}$):**
   - Khí quyển có khối lượng nên chịu sức hút của trọng trường Trái Đất, tạo nên áp suất lên bề mặt Trái Đất.
   - Ở điều kiện tiêu chuẩn (mực nước biển, nhiệt độ $0^\\circ\\text{C}$), áp suất khí quyển chuẩn có giá trị:
     $$1\\,\\text{atm} = 1.033\\,\\text{kgf/cm}^2 = 101.325\\,\\text{kPa} = 1013.25\\,\\text{mbar} = 760\\,\\text{mmHg}$$
2. **Ý nghĩa trong kỹ thuật khí nén:**
   - Trong tính toán công nghiệp, áp suất tuyệt đối (Absolute Pressure) bằng áp suất đồng hồ (Gauge Pressure) cộng với áp suất khí quyển: $P_{abs} = P_{gauge} + 1.033\\,\\text{kgf/cm}^2$.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Áp suất khí quyển tiêu chuẩn: *Standard Atmospheric Pressure ($P_{atm}$)*
- Áp suất tuyệt đối: *Absolute Pressure ($P_{abs}$)*
- Áp suất đồng hồ: *Gauge Pressure ($P_{gauge}$)*
- Hệ đo lường kỹ thuật: *Engineering Units System ($kgf/cm^2$)*""",

    # Q1653: Ngưỡng dòng điện co cơ giải thoát (5~30mA)
    1653: """**Đáp án chính xác:** **A. 5~30mA**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Tác động sinh lý của dòng điện (Electrical Safety & Physiological Effects):**
   - Theo tiêu chuẩn an toàn điện quốc tế **IEC 60479-1**:
     - Dưới $1\\,\\text{mA}$: Ngưỡng cảm nhận (Perception Threshold), người bắt đầu thấy tê nhẹ.
     - **$5\\,\\text{mA} \\sim 30\\,\\text{mA}$ (Ngưỡng tự thoát / Let-go Current):** Dòng điện kích thích thần kinh vận động gây co cứng cơ bắp (Muscular Tetanization). Nếu dòng điện vượt quá $15 - 30\\,\\text{mA}$, bàn tay nắm chặt dây điện sẽ bị co cứng không thể tự buông ra khỏi nguồn điện.
     - Trên $50\\,\\text{mA} \\sim 100\\,\\text{mA}$ qua ngực: Gây rung thất tim (Ventricular Fibrillation), ngừng tuần hoàn máu và nguy hiểm tính mạng.
2. **Quy định thiết bị bảo vệ:**
   - Rơ le chống dòng rò (ELCB / RCCB) trong công nghiệp luôn có ngưỡng ngắt bảo vệ con người là $30\\,\\text{mA}$ trong thời gian $< 0.1\\,\\text{s}$.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Dòng điện giải thoát (tự thoát): *Let-go Current (Freeing Current)*
- Co cứng cơ bắp: *Muscular Tetanization*
- Rung thất tim: *Ventricular Fibrillation*
- Rơ le chống dòng rò: *Earth Leakage Circuit Breaker (ELCB / RCD)*""",

    # Q1354: Khổ giấy A0 gấp bao nhiêu lần A4
    1354: """**Đáp án chính xác:** **D. 16 lần**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Tiêu chuẩn khổ giấy vẽ kỹ thuật ISO 216 (ISO Paper Formats):**
   - Theo chuẩn **ISO 216**, diện tích khổ $A_0$ là $1\\,\\text{m}^2$ ($1189 \\times 841\\,\\text{mm}$).
   - Tỉ lệ cạnh dài và cạnh ngắn luôn là $\\sqrt{2} \\approx 1.414$.
   - Mỗi lần cắt đôi một khổ giấy theo cạnh dài, ta được 2 tờ khổ nhỏ hơn liền kề:
     - $A_0 = 2 \\times A_1 = 4 \\times A_2 = 8 \\times A_3 = 16 \\times A_4$ ($2^4 = 16$).
2. **Kết luận:**
   - Một tờ khổ $A_0$ có diện tích bằng đúng **16 tờ khổ $A_4$** ($210 \\times 297\\,\\text{mm}$).

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Tiêu chuẩn khổ giấy quốc tế: *ISO 216 Paper Sizes*
- Bản vẽ kỹ thuật: *Engineering Drawing Sheet*
- Khổ giấy cơ sở $A_0$: *Base Paper Size $A_0$ ($1\\,m^2$)*""",

    # Q1612: Đổi số thập phân 458 sang mã BCD
    1612: """**Đáp án chính xác:** **B. 0100 0101 1000**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Nguyên tắc chuyển đổi mã BCD 8421 (Binary Coded Decimal):**
   - Mã BCD mã hóa từng chữ số thập phân ($0 \\sim 9$) độc lập thành 1 nhóm 4 bit nhị phân (Nibble) có trọng số $8-4-2-1$:
     - Chữ số hàng trăm $4 \\to 0100_2$
     - Chữ số hàng chục $5 \\to 0101_2$
     - Chữ số hàng đơn vị $8 \\to 1000_2$
2. **Kết quả ghép chuỗi:**
   - Ghép các nhóm 4 bit theo đúng thứ tự: **$0100\\;0101\\;1000$**.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Mã nhị phân thập phân: *Binary Coded Decimal (BCD)*
- Cụm 4-bit nhị phân: *Nibble / 4-bit Field*
- Trọng số vị trí: *Positional Weight ($8-4-2-1$)*"""
}

SPECIALIZED_CASES.update({
    # Q1672: 1 SCAN TIME PLC
    1672: """**Đáp án chính xác:** **B. 1 SCAN TIME**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Khái niệm Chu kỳ quét PLC (PLC Scan Time):**
   - Bộ xử lý PLC vận hành theo phương thức tính toán lặp tuần hoàn (Cyclic Scan). Thời gian để CPU thực hiện trọn vẹn một vòng lặp từ đọc dữ liệu ngõ vào (Input Refresh), xử lý toàn bộ logic chương trình từ đầu đến lệnh END, và cập nhật tín hiệu ra cơ cấu chấp hành (Output Refresh) được gọi là **1 SCAN TIME** (Thời gian 1 chu kỳ quét).
2. **Ý nghĩa vận hành:**
   - Scan Time thông thường từ $1\\,\\text{ms} \\sim 20\\,\\text{ms}$. Nếu chương trình quá dài hoặc có vòng lặp vô tận vượt quá thời gian cài đặt của bộ giám sát Watchdog Timer (WDT), PLC sẽ báo lỗi và dừng hệ thống để đảm bảo an toàn.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Thời gian 1 chu kỳ quét: *1 Scan Time*
- Phương thức quét tuần hoàn: *Cyclic Execution Method*
- Bộ định thời giám sát: *Watchdog Timer (WDT)*
- Đọc ngõ vào / Cập nhật ngõ ra: *Input Scan / Output Refresh*""",

    # Q1463: Đâu không phải là Word Device? Đáp án: B
    1463: """**Đáp án chính xác:** **A. B (Link Relay)**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Phân loại Device trong PLC Mitsubishi (MELSEC Architecture):**
   - **Thiết bị dạng Bit (Bit Device):** Chỉ mang 1 trong 2 trạng thái $0$ (OFF) hoặc $1$ (ON):
     - $X$: Ngõ vào số (Digital Input)
     - $Y$: Ngõ ra số (Digital Output)
     - $M$: Rơ le phụ nội bộ (Internal Relay)
     - $L$: Rơ le tự giữ (Latch Relay)
     - **$B$**: Rơ le liên kết mạng MELSECNET/CC-Link (**Link Relay - Bit Device**)
   - **Thiết bị dạng Từ (Word Device):** Lưu trữ giá trị số nguyên $16$-bit:
     - $D$: Thanh ghi dữ liệu (Data Register)
     - $W$: Thanh ghi liên kết mạng (Link Register)
     - $R / ZR$: Thanh ghi tập tin (File Register)
2. **Kết luận:**
   - Ký hiệu **$B$** là thiết bị Bit (Link Relay), không phải là Word Device.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Thiết bị dạng bit: *Bit Device*
- Thiết bị dạng từ: *Word Device (16-bit)*
- Rơ le liên kết mạng: *Link Relay (B)*
- Thanh ghi dữ liệu: *Data Register (D)*""",

    # Q1669: Đâu không thuộc tín hiệu đầu vào PLC? Đáp án: Van điện (Solenoid Valve)
    1669: """**Đáp án chính xác:** **C. Van điện (Solenoid Valve)**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Phân biệt Thiết bị đầu vào (Input) và Đầu ra (Output) của PLC:**
   - **Thiết bị đầu vào (Input Devices - cấp tín hiệu vào Module X):** Cảm biến quang, cảm biến tiệm cận, nút nhấn (Push Button), công tắc hành trình (Limit Switch), công tắc áp suất. Chúng biến đổi trạng thái cơ khí/quang học thành tín hiệu điện đưa vào PLC.
   - **Cơ cấu chấp hành đầu ra (Output Actuators - nhận lệnh từ Module Y):** **Van điện từ (Solenoid Valve)**, cuộn hút contactor, đèn báo, còi báo động, biến tần. Van điện từ nhận điện áp từ ngõ ra PLC để đóng/mở luồng khí nén hoặc dầu thủy lực, do đó nó là cơ cấu chấp hành đầu ra (Output Actuator).

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Tín hiệu đầu vào: *PLC Input Signal (X)*
- Cơ cấu chấp hành đầu ra: *Output Actuator (Y)*
- Van điện từ: *Solenoid Valve*
- Cảm biến tiệm cận / quang: *Proximity / Photoelectric Sensor*""",

    # Q1308: Đổi $(1001)_2$ sang hệ thập phân
    1308: """**Đáp án chính xác:** **B. 9**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Công thức chuyển đổi từ hệ nhị phân (Binary) sang hệ thập phân (Decimal):**
   $$(b_n b_{n-1} ... b_1 b_0)_2 = \\sum_{i=0}^{n} b_i \\times 2^i$$
2. **Các bước tính toán cụ thể với số $(1001)_2$:**
   $$(1001)_2 = (1 \\times 2^3) + (0 \\times 2^2) + (0 \\times 2^1) + (1 \\times 2^0)$$
   $$= (1 \\times 8) + (0 \\times 4) + (0 \\times 2) + (1 \\times 1) = 8 + 0 + 0 + 1 = 9_{10}$$
   Như vậy, giá trị trong hệ thập phân là **$9$**.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Hệ số nhị phân: *Binary Number System (Base-2)*
- Hệ số thập phân: *Decimal Number System (Base-10)*
- Trọng số cơ số 2: *Powers of Two ($2^0, 2^1, 2^2, 2^3...$)*""",

    # Q1477: Đổi $(\text{F14})_{16}$ thành hệ nhị phân
    1477: """**Đáp án chính xác:** **D. 1111 0001 0100**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Quy tắc chuyển đổi từ hệ thập lục phân (Hexadecimal) sang hệ nhị phân (Binary):**
   - Mỗi ký số thập lục phân ($0 \\sim \\text{F}$) tương đương với đúng 4 bit nhị phân (Nibble):
     - Ký số $\\text{F}_{16} = 15_{10} = (1111)_2$
     - Ký số $1_{16} = 1_{10} = (0001)_2$
     - Ký số $4_{16} = 4_{10} = (0100)_2$
2. **Ghép các cụm 4 bit:**
   - Ghép theo đúng thứ tự từ trái sang phải: **$1111\\;0001\\;0100_2$**.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Hệ thập lục phân: *Hexadecimal System (Base-16)*
- Hệ nhị phân: *Binary System (Base-2)*
- Biểu diễn cụm 4 bit: *4-bit Binary Representation*""",

    # Q1510: Đâu không phải là đặc tính Ball Screw?
    1510: """**Đáp án chính xác:** **D. Khả năng chống lăn cao (Lực cản lăn lớn)**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Đặc tính cơ học của Vít me bi (Ballscrew Characteristics):**
   - Ballscrew sử dụng các viên bi thép cầu chuyển động lăn giữa rãnh trục vít và đai ốc, do đó lực cản lăn cực kỳ nhỏ (hệ số ma sát lăn $\\mu \\approx 0.002 - 0.005$).
   - Nhờ lực cản lăn rất thấp, Ballscrew đạt hiệu suất truyền động vượt trội từ **$90\\% - 95\\%$**, vận hành êm ái, mômen xoắn khởi động nhỏ và không có hiện tượng giật cục (Stick-slip).
   - Vì vậy, khẳng định "khả năng chống lăn cao" (hay lực cản lăn lớn) là **hoàn toàn sai** về mặt kỹ thuật.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Vít me bi: *Ballscrew Assembly*
- Lực cản lăn / Ma sát lăn: *Rolling Resistance / Rolling Friction*
- Hiệu suất truyền động cao: *High Mechanical Efficiency ($90-95\\%$)*
- Hiện tượng dính trượt: *Stick-slip Phenomenon*"""
})

SPECIALIZED_CASES.update({
    # Q1580: Bôi trơn dầu vs mỡ
    1580: """**Đáp án chính xác:** **B. Phù hợp với sử dụng nhiệt độ thấp hoặc tốc độ thấp hơn là bôi trơn bằng mỡ.**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Đặc tính kỹ thuật của bôi trơn dầu (Oil Lubrication Characteristics):**
   - Dầu bôi trơn dạng lỏng có tính lưu động cao, hệ số ma sát nhớt nhỏ và khả năng đối lưu tản nhiệt cưỡng bức tuyệt vời.
   - Vì vậy, bôi trơn dầu được chỉ định bắt buộc cho các ổ lăn quay **tốc độ cao (High Speed)** và **nhiệt độ làm việc cao (High Operating Temperature)**.
   - Ngược lại, **bôi trơn bằng mỡ (Grease Lubrication)** mới là phương pháp phù hợp với dải tốc độ từ thấp đến trung bình và nhiệt độ thấp, vì mỡ có độ nhớt tĩnh cao và không cần hệ thống tuần hoàn bơm dầu phức tạp.
   - Do đó, phát biểu cho rằng bôi trơn dầu phù hợp tốc độ thấp/nhiệt độ thấp hơn bôi trơn mỡ là **sai**.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Bôi trơn bằng dầu: *Oil Lubrication*
- Bôi trơn bằng mỡ: *Grease Lubrication*
- Khả năng tản nhiệt: *Heat Dissipation Capability*
- Vận tốc quay cao: *High Rotational Speed*""",

    # Q1512: Thước cặp cơ khí (Vernier Caliper) 0.05 mm
    1512: """**Đáp án chính xác:** **B. 0.05 ㎜**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Cấu tạo và độ chia của Thước cặp cơ khí (Vernier Caliper Resolution):**
   - Thước cặp cơ khí gồm thước chính có vạch chia $1\\,\\text{mm}$ và thước phụ du xích (Vernier Scale).
   - Trên thước cặp du xích tiêu chuẩn công nghiệp (JIS B 7507), thang đo du xích dài $19\\,\\text{mm}$ hoặc $39\\,\\text{mm}$ được chia đều thành $20$ hoặc $50$ khoảng chia:
     - Với du xích $20$ vạch chia: Giá trị đo nhỏ nhất (Least Count / Resolution) là:
       $$\\Delta = \\frac{1\\,\\text{mm}}{20} = 0.05\\,\\text{mm}$$
   - Đây là độ chính xác đọc đo tiêu chuẩn của thước cặp cơ khí phổ biến trong các xưởng gia công cơ khí chính xác.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Thước cặp cơ khí: *Vernier Caliper*
- Thang đo du xích: *Vernier Scale*
- Giá trị đo nhỏ nhất (độ phân giải): *Least Count / Resolution ($0.05\\,\\text{mm}$)*
- Tiêu chuẩn thước đo cơ khí: *JIS B 7507 Standard*""",

    # Q1362: Cấu tạo ổ đĩa Harmonic (Harmonic Drive)
    1362: """**Đáp án chính xác:** **D. Flexspline = Phần Input**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Cấu tạo bộ giảm tốc Harmonic (Harmonic Drive Reducer):**
   - Hộp giảm tốc bánh răng sóng Harmonic gồm 3 thành phần cốt lõi:
     1. **Wave Generator (Bộ tạo sóng - Input):** Trục cam hình elip lồng vào vòng bi mỏng đàn hồi, đóng vai trò là **đầu vào (Input)** nối với trục động cơ servo.
     2. **Flexspline (Vành răng đàn hồi mỏng - Output):** Cốc kim loại đàn hồi có răng ngoài ít hơn Circular Spline 2 răng, biến dạng elip ăn khớp theo Wave Generator và đóng vai trò là **đầu ra giảm tốc (Output)**.
     3. **Circular Spline (Vành răng cứng cố định):** Vòng răng trong cứng vững bắt cố định với vỏ máy.
2. **Kết luận:**
   - Khẳng định *Flexspline = Phần Input* là sai, vì Wave Generator mới là phần nhận truyền động đầu vào (Input).

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Bộ giảm tốc Harmonic: *Harmonic Drive (Strain Wave Gearing)*
- Bộ tạo sóng đầu vào: *Wave Generator (Input Component)*
- Vành răng đàn hồi đầu ra: *Flexspline (Output Component)*
- Vành răng cứng cố định: *Circular Spline (Fixed Ring)*""",

    # Q1572: Then bán nguyệt (Woodruff Key)
    1572: """**Đáp án chính xác:** **D. Thường dùng trong trục chính của xe ô tô**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Đặc tính cơ khí của Then bán nguyệt (Woodruff Key Characteristics):**
   - Then bán nguyệt có hình bán nguyệt, rãnh then trên trục được phay bằng dao phay đĩa tròn.
   - **Ưu điểm:** Có khả năng tự lựa theo độ nghiêng của rãnh may-ơ trục nón, lắp ráp và định tâm thuận tiện.
   - **Nhược điểm lớn:** Rãnh phay khoét rất sâu vào thân trục làm giảm mômen chống xoắn và độ bền mỏi của trục nghiêm trọng.
   - Do đó, then bán nguyệt chỉ dùng cho trục nhỏ, tải trọng nhẹ đến trung bình; **tuyệt đối không dùng cho trục chính truyền lực mômen xoắn cực lớn của xe ô tô**.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Then bán nguyệt: *Woodruff Key*
- Rãnh then trên trục: *Keyway / Keyseat*
- Ứng suất xoắn tập trung: *Torsional Stress Concentration*
- Khả năng tự lựa góc: *Self-aligning Capability*""",

    # Q1587: Cấu hình electron nguyên tử Natri (Na, Z=11)
    1587: """**Đáp án chính xác:** **A. Lớp M**

**Cơ sở lý thuyết & Phân tích kỹ thuật (Technical Analysis):**
1. **Cấu hình electron nguyên tử Natri ($_{11}\\text{Na}$):**
   - Số hiệu nguyên tử $Z = 11$, tương ứng có $11$ electron:
     $$1s^2\\;2s^2\\;2p^6\\;3s^1$$
   - Phân bố theo các lớp electron:
     - Lớp thứ nhất ($n = 1$ - Lớp $K$): có $2$ electron ($1s^2$).
     - Lớp thứ hai ($n = 2$ - Lớp $L$): có $8$ electron ($2s^2 2p^6$) - cấu hình bát thế bền vững.
     - Lớp thứ ba ($n = 3$ - Lớp $M$): có **$1$ electron** ($3s^1$).
2. **Ý nghĩa hóa lý & dẫn điện:**
   - Lớp ngoài cùng chính là **lớp $M$**, chứa $1$ electron hóa trị (Valence Electron) liên kết yếu, dễ bứt ra thành electron tự do dẫn điện trong kim loại.

**Thuật ngữ chuyên ngành song ngữ (Bilingual Technical Terms):**
- Lớp electron ngoài cùng: *Outermost Electron Shell (M-shell)*
- Cấu hình electron: *Electron Configuration ($1s^2 2s^2 2p^6 3s^1$)*
- Electron hóa trị: *Valence Electron*
- Độ linh động electron dẫn: *Conduction Electron Mobility*"""
})
