# GoRoutex Mobile App Translation & UI Specification

This specification documents the system flow, API contracts, screen designs, and visual styling guidelines from the GoRoutex web application. It acts as a comprehensive prompting blueprint to build a mobile version (e.g., Flutter, React Native, iOS/Android) that is visually and functionally identical to the web version, tailored for mobile screens.

---

## 1. System Overview & Core Architecture

GoRoutex is a transport management platform featuring two main functional hubs:
1. **Client Platform (End-User)**: Allows customers to search public trips, pick seats, apply promos, and pay via online payment gateways.
2. **Merchant Hub (Operations & Ticket Office)**: Allows merchant staffs and ticket agents to configure fleets, assign drivers/vehicles, manage routes, and perform **Quick Ticket Sales (Bán vé Offline/Call)** for walk-in or phone call bookings.

### Core Architecture Goals for Mobile
- **Visual Parity**: Keep the compact, modern design language (clean slate colors, гармоничные gradients, high-contrast tags, smooth micro-animations).
- **Functional Parity**: Mirror the stepped quick-booking workflow exactly on mobile screens.

---

## 2. UI & Design System Specifications (Visual Blueprint)

To make the mobile app look identical to the web version, apply the following visual specification system.

### 2.1 Color Palette & Theme Tokens

The application supports dynamic Dark/Light theme values. Translate the web styling classes to native mobile styling equivalents:

| Web Utility Class / Token | Light Mode Value | Dark Mode Value | Mobile Translation / HEX |
| :--- | :--- | :--- | :--- |
| **Main Background** | `bg-[#F8FAFC]` | `bg-slate-950` | Light: `#F8FAFC`, Dark: `#090D16` |
| **Surface/Card Background** | `bg-white` | `bg-slate-900` | Light: `#FFFFFF`, Dark: `#151B26` (slate-900) |
| **Brand Primary (Blue)** | `text-brand-primary` | `text-brand-primary` | `#0E9F6E` or brand custom blue: `#2563EB` |
| **Brand Accent (Orange/Coral)**| `text-brand-accent` | `text-brand-accent` | `#F97316` (amber/orange) |
| **Text Primary** | `text-slate-900` | `text-white` | Light: `#0F172A`, Dark: `#FFFFFF` |
| **Text Secondary** | `text-slate-500` | `text-slate-400` | Light: `#64748B`, Dark: `#94A3B8` |
| **Border Slate** | `border-slate-100` | `border-slate-800` | Light: `#F1F5F9`, Dark: `#1E293B` |
| **Occupied Seat** | `bg-slate-200` | `bg-slate-800` | Grey / Disabled state (non-clickable) |
| **Available Seat** | `bg-white` | `bg-slate-900` | Clean bordered clickable surface |
| **Selecting Seat** | `bg-[#FDEDE8]` | `bg-orange-950/20` | Light coral highlight with orange borders |

### 2.2 Global Layout & Card Guidelines
- **Core Screen Container**: `space-y-8` (Vertical list spacing of `20px` to `32px`). Introduce entry slide-up transitions (`animate-in fade-in duration-500`) on screen mount.
- **Stepped Stepper Header**:
  - Horizontal progress bar at the top of booking page.
  - Completed steps: Circle colored in Emerald Green (`#10B981`) with a white checkmark icon.
  - Active step: Circle colored in Brand Blue (`#2563EB`) with a bold white index digit.
  - Inactive steps: Circle with light gray borders (`#CBD5E1`) and text in `#94A3B8`.
  - Connecting lines between circles: `#E2E8F0` (inactive) transitions to `#2563EB` (active/completed).

---

## 3. Screen-by-Screen Visual Layout & Prompt Instructions

### 3.1 Step 1: Trip Filter & Availability Search
- **Search Panel Card (Top)**:
  - Rounded corners: `rounded-2xl` or `border-radius: 24px`.
  - Border: thin gray line with subtle shadow.
  - Content:
    - **Lộ trình**: Text select field showing Origin City $\rightarrow$ Destination City. On click, opens a bottom-sheet select list.
    - **Ngày khởi hành**: Date Selector showing current selected date (e.g. `Thứ Hai, 25/05/2026`). On click, opens a native calendar picker.
    - **Alliance Toggle**: Clean switch labeled `"Hiển thị liên minh"`.
    - **Nút Tìm Kiếm**: Large primary action button with a magnifying glass search icon.
- **Trip Results List**:
  - Renders vertically.
  - **Individual Trip Card**:
    - Left part: Large bold start time (e.g. `08:00`), a tiny arrow icon pointing to arrival time (e.g. `14:00`).
    - Sub-labels underneath: Trip Code (in high-contrast tag), Merchant Name (blue tag), and Vehicle Plate (License Plate tag).
    - Right part: Seat capacity indicator (`40 chỗ trống` in green) and ticket price in large bold orange coral (e.g. `350.000 đ`).
    - Action: Button labeled `Chọn ghế` using brand primary style.

```
+-------------------------------------------------------------+
|  [<-] Bán vé Offline & Điện thoại                Step 1/4   |
+-------------------------------------------------------------+
|  Tuyến đường:                                               |
|  [ HCM - Nha Trang                                       v] |
|  Ngày chạy:                                                 |
|  [ 25/05/2026                                            v] |
|  [x] Hiển thị liên minh               [ Nút Tìm Kiếm: Search] |
+-------------------------------------------------------------+
|  CHUYẾN XE KHẢ DỤNG:                                        |
|  +-------------------------------------------------------+  |
|  | (Clock) 08:00 -> 14:00                 30 Chỗ trống   |  |
|  | [Trip-01]  [Nha Xe Routex] [51B-1234]                 |  |
|  |                                         Giá: 350.000đ |  |
|  |                                         [Chọn Ghế: >] |  |
|  +-------------------------------------------------------+  |
+-------------------------------------------------------------+
```

### 3.2 Step 2: Interactive Seat Diagram Grid
- **Seat Diagrams Layout**:
  - For double-decker vehicles, display two columns/tabs: **"Tầng dưới / Sàn đơn"** and **"Tầng trên"**.
  - **Seat Grid**: Map seat listings to a strict `GridView` matrix using the `rowNo` and `colNo` properties fetched from the API. Space the columns (e.g., column 1, aisle, column 3) to represent realistic bus corridor paths.
  - **Visual Seat Icons**:
    - **Available Seat**: Clickable light-blue borders containing seat code (e.g. `A01`) in bold dark blue text.
    - **Selecting Seat**: Border changes to Orange/Coral, fill color changes to light coral cream, text changes to dark orange.
    - **Occupied Seat**: Fills in full light-gray, disables touch clicks, text fades to grey.
- **Summary Bottom Sheet (Footer)**:
  - Sticky container floating at the bottom.
  - Renders selected seat code array (e.g. `Ghế: A01, A02`).
  - Renders total running sum in large bold font.
  - Displays primary checkout button `Tiếp tục`.

```
+-------------------------------------------------------------+
|  [<-] Chọn Ghế Chuyến Xe                         Step 2/4   |
+-------------------------------------------------------------+
|   (Legend) [ ] Trống   [x] Đã Bán   [/] Đang Chọn           |
|                                                             |
|         TẦNG DƯỚI                   TẦNG TRÊN               |
|      +-------------+             +-------------+            |
|      | [A01] [A02] |             | [B01] [B02] |            |
|      |             |             |             |            |
|      | [A03] [A04] |             | [B03] [B04] |            |
|      +-------------+             +-------------+            |
+-------------------------------------------------------------+
|  Ghế đã chọn: A01, A02                 Tạm tính: 700.000đ   |
|  [ NÚT TIẾP TỤC: advance to Step 3                        ] |
+-------------------------------------------------------------+
```

### 3.3 Step 3: Passenger Info & Dropoff/Pickup Form
- **Form Card Layout**:
  - Form fields containing small left icons:
    - **Họ và tên hành khách**: User profile icon, rounded text input.
    - **Số điện thoại**: Smartphone dialer icon, text input.
    - **Email**: Mail icon, text input.
    - **Ghi chú vé**: Memo paper icon, tall text box.
- **Pickup & Dropoff Card Selector**:
  - Visual Radio buttons toggling between "Văn phòng / Chi nhánh" and "Trung chuyển tận nơi".
  - **Branch Selector**: Renders a dropdown picker listing available transit office branches (loaded from the trip details array).
  - **Custom Address Input**: Renders a custom address field with search auto-complete if a transfer is selected.

```
+-------------------------------------------------------------+
|  [<-] Thông tin đón trả                          Step 3/4   |
+-------------------------------------------------------------+
|  Họ và tên *: [ Nguyễn Văn A                             ]  |
|  SĐT khách *: [ 0901234567                               ]  |
|  Email      : [ khachhang@gmail.com                      ]  |
|  Ghi chú    : [ Khách gọi đặt vé xe đêm                  ]  |
+-------------------------------------------------------------+
|  ĐIỂM ĐÓN KHÁCH:                     ĐIỂM TRẢ KHÁCH:         |
|  (o) Văn phòng  ( ) Trung chuyển     (o) Văn phòng  ( ) T.C  |
|  [ Chọn VP Đón bến xe A v ]          [ Chọn VP Trả bến xe B v] |
+-------------------------------------------------------------+
|  Ghế: A01, A02   Tuyến: HCM -> DL    Tổng tiền: 700.000đ    |
|  [ NÚT ĐẶT GHẾ: Gọi API Hold Seat & advance to Step 4     ] |
+-------------------------------------------------------------+
```

### 3.4 Step 4: Booking Confirmation & Dynamic Checkout
- **Top Hold Status Bar**: Highlights a soft red/yellow warning panel showing an active ticking countdown clock: `Thời gian giữ chỗ còn lại: MM:SS`.
- **Vertical Method Selection Cards**:
  - Each method in a rounded border panel. Clicking a method focuses it with a highlighted brand border:
    - **Tiền mặt (Cash at Counter)**: Cash icon, tag labeling `Giao nhận tiền trực tiếp`.
    - **VNPay QR / ZaloPay / MoMo**: Icon of the respective gateway, detailed subtitle.
- **Dynamic Action Panel (Center)**:
  - Shifts content layout based on selected method:
    - **If Cash**: Displays a secure green dollar container and a prominent action checkout button: `Xác nhận đã thu tiền & Xuất vé`. Clicking calls the update status API.
    - **If E-Wallet / Bank QR**: Renders a centered white canvas card displaying the generated dynamic QR code image, with a background loading spinner if fetching. An optional manual checkout button `Mở cổng thanh toán` opens the transaction redirect link.

```
+-------------------------------------------------------------+
|  [<-] Xác nhận & Thanh toán                      Step 4/4   |
+-------------------------------------------------------------+
|  (Clock) GIỮ GHẾ TRONG VÒNG: 04 : 59                        |
+-------------------------------------------------------------+
|  CHỌN PHƯƠNG THỨC THANH TOÁN:                               |
|  (o) TIỀN MẶT TẠI QUẦY (Nhận tiền mặt & xuất vé trực tiếp)  |
|  ( ) VNPay QR          ( ) ZaloPay          ( ) MoMo        |
+-------------------------------------------------------------+
|  [ BẢNG HIỂN THỊ DÂN DỤNG THEO PHƯƠNG THỨC ĐÃ CHỌN ]        |
|  * Nếu Tiền Mặt:                                            |
|    "Nhân viên vui lòng nhận đúng số tiền: 700.000đ"         |
|    [ NÚT XÁC NHẬN ĐÃ THU TIỀN VÀ XUẤT VÉ ]                  |
|                                                             |
|  * Nếu QR:                                                  |
|    +-----------------------------+                          |
|    |      [ QR CODE IMAGE ]      |                          |
|    +-----------------------------+                          |
|    "Yêu cầu khách quét mã QR để hoàn tất thanh toán"        |
+-------------------------------------------------------------+
```

### 3.5 Step 5: Success Ticket & Invoice Screen
- **Success Visual**: Centered green circular badge with checkmark animation.
- **Ticket Receipt Invoice Card**:
  - Uses invoice card design with dotted horizontal divider lines.
  - Displays Booking Code, Passenger Name, Phone Number, Departure Time, Seat Numbers, Method used, and final Paid Amount.
- **Action buttons**:
  - **In Hóa Đơn / Vé (Print Ticket)**: Standard dark button with a printer icon. In the mobile context, prompt to integrate device print commands or Bluetooth connection managers for thermal printers.
  - **Về Danh Sách**: Button returning back to the ticket management page.

---

## 4. API Contract & Data Schema Specification

Every mobile network request must mirror the exact payload structure of the web client.

### 4.1 Request Headers & Channel
Include metadata envelopes inside POST payloads and GET request headers.
- **Merchant API Headers**:
  - `RT-REQUEST_ID`: UUID string
  - `RT-REQUEST_DATE_TIME`: ISO timestamp
  - `RT-CHANNEL`: `"MOB"` (identifies as mobile channel)

### 4.2 Endpoint Registry & Payloads

#### A. Search Trips
- **Endpoint**: `/api/v1/management/trip-service/search`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "requestId": "uuid-string",
    "requestDateTime": "2026-05-25T08:00:00.000Z",
    "channel": "ONL",
    "data": {
      "origin": "Hồ Chí Minh",
      "destination": "Đà Lạt",
      "departureDate": "yyyy-MM-dd",
      "seat": "1",
      "pageSize": "100",
      "pageNumber": "1"
    }
  }
  ```

#### B. Hold Seat Reservation
- **Endpoint**: `/api/v1/booking-service/trips/hold-seat`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "requestId": "uuid-string",
    "requestDateTime": "timestamp",
    "channel": "ONL",
    "data": {
      "tripId": "trip-uuid",
      "seatNos": ["A01", "A02"],
      "holdBy": "merchant-id-or-customer-phone"
    },
    "info": {
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "customerEmail": "khachhang@gmail.com"
    }
  }
  ```

#### C. Generate Payment Gateway URL & QR
- **Endpoint**: `/api/v1/payment-service/get-payment-url`
- **Method**: `GET`
- **Query Params**: `bookingCode=BK-123&method=VNPAY&amount=700000` (Methods: `VNPAY`, `ZALOPAY`, `MOMO`, `VISA`)
- **Returns**: `qrCodeUrl` and `paymentUrl`.

#### D. Direct Cash Ticket Confirmation (Merchant Only)
- **Endpoint**: `/api/v1/merchant-service/tickets/update`
- **Method**: `POST`
- **Body**: Updates ticket state to PAID directly.
  ```json
  {
    "requestId": "uuid-string",
    "requestDateTime": "timestamp",
    "channel": "ONL",
    "data": {
      "bookingCode": "BK-123456",
      "customerName": "Nguyễn Văn A",
      "customerPhone": "0901234567",
      "customerEmail": "khachhang@gmail.com",
      "status": "PAID"
    }
  }
  ```
