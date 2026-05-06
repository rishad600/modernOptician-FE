# Modern Optician User Portal - API Documentation

Welcome to the **Modern Optician User Portal API Guide**. This document provides detailed information about the endpoints available for registered users to manage their profiles, browse and enroll in courses, and handle payments.

---

## 🚀 API Overview

| Attribute | Value |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Portal Base Path** | `/web/user` |
| **Full Base Path** | `http://localhost:5000/web/user` |
| **Version** | v1.0.0 |
| **Response Format** | JSON |

### Modules Covered
- 👤 **Profile**: Personal information management and security.
- 🎓 **Course**: Course catalog, enrollment, and lesson playback.
- 💳 **Payment**: PayPal integration for course purchases.

---

## 🔐 Authentication

Most user routes require a valid JWT token.

- **Header Format**: `Authorization: Bearer <USER_JWT_TOKEN>`
- **Public Routes**: 
  - `POST /profile/register`
  - `POST /profile/login`
  - `POST /profile/forgot-password`
  - `POST /profile/reset-password`
- **Protected Routes**: All other routes starting with `/web/user/` (Profile, Course, Payment).

---

## 🛠 Common Request/Response Formats

### Request Headers
- **Standard APIs**: `Content-Type: application/json`
- **Profile Update**: `Content-Type: multipart/form-data` (to support avatar uploads)

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "code": 200
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Error details",
  "code": 400
}
```

---

## 📂 Endpoint Details

### 👤 Profile Module

#### 1. Register User
`POST /web/user/profile/register`
- **Auth**: None.
- **Body**: `name`, `email`, `password` (min 6).
- **Success**: `201 Created`

#### 2. User Login
`POST /web/user/profile/login`
- **Auth**: None.
- **Body**: `email`, `password`.
- **Success**: `200 OK` (Returns user object and token)

#### 3. Get Profile
`GET /web/user/profile`
- **Purpose**: Retrieve the authenticated user's profile details.
- **Response Data Schema**:
  ```json
  {
    "name": string,
    "lastName": string,
    "email": string,
    "phone": string,
    "avatar": string,
    "role": "user"
  }
  ```
- **Success**: `200 OK`

#### 4. Update Profile
`PUT /web/user/profile`
- **Content-Type**: `multipart/form-data`
- **Body**: `name`, `lastName`, `phone` (at least one) + `avatar` (file, optional).
- **Success**: `200 OK`

#### 5. Change Password
`PUT /web/user/profile/change-password`
- **Body**: `currentPassword`, `newPassword` (min 6).
- **Success**: `200 OK`

#### 6. Forgot Password
`POST /web/user/profile/forgot-password`
- **Purpose**: Trigger a password reset email/OTP.
- **Body**: `email`.
- **Success**: `200 OK`

#### 7. Reset Password
`POST /web/user/profile/reset-password`
- **Body**: `email`, `otp` (6 digits), `newPassword` (min 6).
- **Success**: `200 OK`

---

### 🎓 Course Module

#### 8. List Available Courses
`GET /web/user/course`
- **Purpose**: List courses with enrollment status for the current user.
- **Query Params**: `page`, `limit`.
- **Response Data Schema**:
  ```json
  [{
    "_id": string,
    "name": string,
    "price": number,
    "currency": string,
    "category": string,
    "thumbnail": string,
    "isEnrolled": boolean,
    "features": [string],
    "totalDuration": number,
    "lessons": number
  }]
  ```
- **Success**: `200 OK`

#### 9. List Enrolled Courses
`GET /web/user/course/enrolled`
- **Response Data Schema**:
  ```json
  [{
    "_id": string,
    "name": string,
    "instructorName": string,
    "thumbnail": string,
    "progress": number,
    "totalLessons": number,
    "completedLessons": number,
    "lastAccessed": ISO-Date
  }]
  ```
- **Success**: `200 OK`

#### 10. Get Course Detail
`GET /web/user/course/:id`
- **Path Params**: `id` (24-char ObjectId).
- **Success**: `200 OK`

#### 11. Enroll/Purchase Course
`POST /web/user/course/purchase/:id`
- **Purpose**: Direct enrollment into a course (used for free courses or manual enrollment).
- **Success**: `200 OK`

#### 12. Lesson Video Playback
`GET /web/user/course/play-video/:lessonId`
- **Purpose**: Get a signed URL for lesson video playback.
- **Note**: Checks enrollment for non-free-preview lessons.
- **Success**: `200 OK`

---

### 💳 Payment Module (PayPal)

#### 13. Create PayPal Order
`POST /web/user/payment/create-order`
- **Body**: `courseId`.
- **Success**: `201 Created`

#### 14. Capture PayPal Order
`POST /web/user/payment/capture-order`
- **Body**: `orderId`.
- **Success**: `200 OK`

---

## 📋 Business Rules

1. **Profile Security**: Passwords must be at least 6 characters. Resetting passwords requires a valid 6-digit OTP.
2. **Access Control**: Playback of paid lessons is restricted to enrolled users. Free previews are accessible to all registered users.
3. **Payment Integrity**: `create-order` blocks purchases for already enrolled courses. `capture-order` is idempotent.
4. **Rate Limiting**: Auth and password reset APIs are subject to rate limiting for security.
5. **Soft Deletes**: List APIs exclude trashed courses and lessons.

---

## 💻 cURL Examples

### Update User Profile
```bash
curl --request PUT "http://localhost:5000/web/user/profile" \
--header "Authorization: Bearer <USER_TOKEN>" \
--form "name=Rahul" \
--form "lastName=Sharma" \
--form "phone=+91-9876543210" \
--form "avatar=@/path/to/avatar.png"
```

### Create Payment Order
```bash
curl --request POST "http://localhost:5000/web/user/payment/create-order" \
--header "Authorization: Bearer <USER_TOKEN>" \
--header "Content-Type: application/json" \
--data "{\"courseId\":\"69ceb4fc3f36c4cc6905b26a\"}"
```

---

> [!TIP]
> Always use the `24-character ObjectId` format for `courseId` and `lessonId` parameters to avoid validation errors.
