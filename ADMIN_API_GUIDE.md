# Modern Optician Admin Portal - API Documentation

Welcome to the **Modern Optician Admin Portal API Guide**. This document provides detailed information about the endpoints available for administrative tasks, including profile management, course orchestration, dashboard analytics, blogging, student management, and payment tracking.

---

## 🚀 API Overview

| Attribute | Value |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Portal Base Path** | `/web/admin` |
| **Full Base Path** | `http://localhost:5000/web/admin` |
| **Version** | v1.0.0 |
| **Response Format** | JSON |

### Modules Covered
- 👤 **Profile**: Admin authentication and registration.
- 🎓 **Course**: Management of courses, lessons, and video content.
- 📊 **Dashboard**: High-level system analytics.
- 📝 **Blog**: Content management for the platform.
- 👨‍🎓 **Student**: User management and statistics.
- 💳 **Payment**: Transaction logs and financial stats.

---

## 🔐 Authentication

All administrative routes (except login) require a valid JWT token.

- **Header Format**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Public Routes**: `POST /profile/login`
- **Restricted (Super Admin Only)**: `POST /profile/register`
- **Protected Routes**: All other routes starting with `/web/admin/`

---

## 🛠 Common Request/Response Formats

### Request Headers
- **JSON APIs**: `Content-Type: application/json`
- **Upload APIs**: `Content-Type: multipart/form-data`

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

#### 1. Register Admin
`POST /web/admin/profile/register`
- **Purpose**: Create a new admin user.
- **Auth**: Required (Bearer + Super-Admin role).
- **Body**:
  - `name` (string, required)
  - `email` (valid email, required)
  - `password` (string min 6, required)
- **Success**: `201 Created`

#### 2. Admin Login
`POST /web/admin/profile/login`
- **Purpose**: Authenticate admin users.
- **Auth**: None.
- **Body**:
  - `email` (valid email, required)
  - `password` (required)
- **Success**: `200 OK` (Returns admin data and token)

---

### 🎓 Course Module

#### 3. Create Course
`POST /web/admin/course/create`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `name`, `description`, `price`, `category`, `instructorName`, `status` (required)
  - `features` (array, optional)
  - `thumbnail` (file, optional - jpg, jpeg, png, webp, max 5MB)
- **Success**: `201 Created`

#### 4. Prepare Video Upload
`POST /web/admin/course/prepare-video-upload`
- **Purpose**: Generate Bunny.net upload signature for lesson videos.
- **Body**:
  - `courseId` (required)
  - `lessonId` (required)
- **Success**: `200 OK`

#### 5. Add Lesson
`POST /web/admin/course/add-lesson`
- **Body**:
  - `courseId`, `title`, `description`, `order` (required)
  - `isFreePreview` (boolean, optional)
  - `duration` (number, optional)
- **Success**: `201 Created`

#### 6. List Courses
`GET /web/admin/course`
- **Query Params**:
  - `search` (string, optional)
  - `status` (string, optional)
  - `page`, `limit` (number, optional)
- **Response Data Schema**:
  ```json
  [{
    "_id": string,
    "name": string,
    "instructorName": string,
    "price": number,
    "currency": string,
    "totalDuration": number,
    "lessons": number,
    "rating": string,
    "status": string,
    "thumbnail": string
  }]
  ```
- **Success**: `200 OK`

#### 7. Get Course Detail
`GET /web/admin/course/:id`
- **Path Params**: `id` (required)
- **Success**: `200 OK`

#### 8. Generate Playback URL
`GET /web/admin/course/play/:lessonId`
- **Purpose**: Generate a signed URL for video playback.
- **Path Params**: `lessonId` (required)
- **Success**: `200 OK`

#### 9. Update Course
`PUT /web/admin/course/:id`
- **Content-Type**: `multipart/form-data`
- **Path Params**: `id` (required)
- **Body**: Any editable field + `thumbnail` (optional).
- **Success**: `200 OK`

#### 10. Delete Video
`DELETE /web/admin/course/delete-video/:bunnyVideoId`
- **Purpose**: Delete Bunny video and clear lesson references.
- **Path Params**: `bunnyVideoId` (required)
- **Success**: `200 OK`

#### 11. Trash/Restore Lesson
`PATCH /web/admin/course/trash-lesson/:id`
- **Path Params**: `id` (required)
- **Body**: `isTrash` (boolean, required)
- **Success**: `200 OK`

#### 12. Update Lesson Metadata
`PUT /web/admin/course/update-lesson/:id`
- **Body**: `title`, `description`, `duration`, `isFreePreview`, `isPublished` (at least one)
- **Success**: `200 OK`

#### 13. Delete Course
`DELETE /web/admin/course/:id`
- **Success**: `200 OK`

---

### 📊 Dashboard Module

#### 14. Dashboard Summary
`GET /web/admin/dashboard`
- **Query Params**: `startDate`, `endDate`, `category` (optional)
- **Response Data Schema**:
  ```json
  {
    "overview": {
      "totalStudents": { "value": number, "growth": number },
      "totalRevenue": { "value": number, "growth": number },
      "activeCourses": { "value": number, "growth": number },
      "recentEnrollments": { "value": number, "growth": number }
    },
    "revenueTrend": [{ "month": string, "total": number }],
    "enrollmentBreakdown": [{ "category": string, "count": number }],
    "recentActivities": [{ "type": string, "message": string, "createdAt": ISO-Date }]
  }
  ```
- **Success**: `200 OK`

---

### 📝 Blog Module

#### 15. Create Blog
`POST /web/admin/blog`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `title`, `content`, `author`, `tags`, `contentType`, `excerpt`, `publishDate`, `aboutAuthor`, `status` (required)
  - `thumbnail` (file, optional)
- **Success**: `201 Created`

#### 16. List Blogs
`GET /web/admin/blog`
- **Query Params**: `search`, `status`, `page`, `limit` (optional)
- **Response Data Schema**:
  ```json
  [{
    "_id": string,
    "title": string,
    "author": string,
    "publishDate": ISO-Date,
    "createdAt": ISO-Date,
    "tags": [string],
    "status": string,
    "views": number,
    "contentType": string
  }]
  ```
- **Success**: `200 OK`

#### 17. Get Blog Detail
`GET /web/admin/blog/:id`
- **Success**: `200 OK`

#### 18. Update Blog
`PUT /web/admin/blog/:id`
- **Content-Type**: `multipart/form-data`
- **Body**: Any updatable field + `thumbnail` (optional).
- **Success**: `200 OK`

#### 19. Delete Blog
`DELETE /web/admin/blog/:id`
- **Success**: `200 OK`

---

### 👨‍🎓 Student Module

#### 20. List Students
`GET /web/admin/student`
- **Query Params**: `search`, `status`, `page`, `limit` (optional)
- **Response Data Schema**:
  ```json
  {
    "users": [{
      "studentId": string,
      "_id": string,
      "student": { "name": string, "lastName": string, "email": string },
      "joined": ISO-Date,
      "courses": number,
      "totalSpent": number,
      "status": string
    }],
    "totalCount": number
  }
  ```
- **Success**: `200 OK`

#### 21. Student Statistics
`GET /web/admin/student/stats`
- **Response Data Schema**:
  ```json
  {
    "totalStudents": number,
    "totalStudentsThisWeek": number,
    "activeStudents": number,
    "activeStudentsGrowth": number,
    "completions": number,
    "completionsGrowth": number
  }
  ```
- **Success**: `200 OK`

#### 22. Get Student Detail
`GET /web/admin/student/:id`
- **Success**: `200 OK`

#### 23. Delete Student
`DELETE /web/admin/student/:id`
- **Success**: `200 OK`

---

### 💳 Payment Module

#### 24. Payment Statistics
`GET /web/admin/payment/stats`
- **Response Data Schema**:
  ```json
  {
    "revenue": { "total": number, "growthPercentage": number },
    "successPayment": { "total": number, "growthPercentage": number },
    "pendingPayment": { "total": number, "todaysPending": number }
  }
  ```
- **Success**: `200 OK`

#### 25. List Payments
`GET /web/admin/payment/list`
- **Query Params**: `search`, `status`, `page`, `limit` (optional)
- **Response Data Schema**:
  ```json
  {
    "payments": [{
      "transactionId": string,
      "_id": string,
      "student": { "name": string, "lastName": string, "method": string },
      "course": { "name": string },
      "amount": number,
      "date": ISO-Date,
      "status": string
    }],
    "totalCount": number
  }
  ```
- **Success**: `200 OK`

---

## 📋 Business Rules

1. **Registration**: Admin registration internally sets the `createdBy` field based on the authenticated super-admin.
2. **Storage**: All thumbnails (courses/blogs) are uploaded directly to Bunny.net storage via the backend.
3. **Lesson Management**: The trash API prevents duplicate states (e.g., trashing an already trashed lesson returns a `409 Conflict`).
4. **Soft Deletes**: Course and Student deletions may return `409` if the resource is already in a deleted state.
5. **Pagination & List Responses**: 
   - `page`: 1 (default)
   - `limit`: 20 (default, Max: 100)
   - **Note**: `Student` and `Payment` list APIs return a wrapper object `{ users/payments, totalCount }`, while `Course` and `Blog` lists currently return the array directly in the `data` field.
6. **Data Consistency**: Updating resources requires at least one valid field in the request body.

---

## 💻 cURL Examples

### Admin Login
```bash
curl --request POST "http://localhost:5000/web/admin/profile/login" \
--header "Content-Type: application/json" \
--data "{\"email\":\"admin@example.com\",\"password\":\"password123\"}"
```

### Create Course (Multipart)
```bash
curl --request POST "http://localhost:5000/web/admin/course/create" \
--header "Authorization: Bearer <ADMIN_TOKEN>" \
--form "name=Optics Masterclass" \
--form "description=Course description" \
--form "price=2999" \
--form "category=Optometry" \
--form "instructorName=Dr. Kumar" \
--form "status=Published" \
--form "thumbnail=@/path/to/course.jpg"
```

### Update Blog
```bash
curl --request PUT "http://localhost:5000/web/admin/blog/69ceb4fc3f36c4cc6905b26a" \
--header "Authorization: Bearer <ADMIN_TOKEN>" \
--form "title=Updated blog title"
```

---

> [!NOTE]
> For any issues or feature requests regarding the API, please contact the backend engineering team.
