# Modern Optician Public Portal - API Documentation

Welcome to the **Modern Optician Public Portal API Guide**. This document provides detailed information about the endpoints available for guests and non-authenticated users to browse courses, read blog posts, and access platform configurations.

---

## 🚀 API Overview

| Attribute | Value |
| :--- | :--- |
| **Base URL** | `http://localhost:5000` |
| **Portal Base Path** | `/web/public` |
| **Full Base Path** | `http://localhost:5000/web/public` |
| **Version** | v1.0.0 |
| **Response Format** | JSON |

### Modules Covered
- 🎓 **Course**: Public course catalog and lesson previews.
- 📝 **Blog**: Public articles and news.
- ⚙️ **Config**: System configurations (e.g., PayPal).

---

## 🔐 Authentication

Public portal APIs **do not require** a JWT token.

- **Header**: `Authorization` is not required.
- **Access**: Accessible by any client without login.

---

## 🛠 Common Request/Response Formats

### Request Headers
- **All APIs**: `Content-Type: application/json`

### Pagination & Search
List endpoints (Courses/Blogs) support the following query parameters:
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `20`, max: `100`)
- `search`: Keyword search across titles/descriptions.
- `category`: (Course only) Filter by course category.

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
  "code": 404
}
```

---

## 📂 Endpoint Details

### 🎓 Course Module

#### 1. List Published Courses
`GET /web/public/course`
- **Purpose**: Retrieve a list of all published and non-trashed courses.
- **Query Params**: `page`, `limit`, `search`, `category`.
- **Response Data Schema**:
  ```json
  {
    "courses": [{
      "_id": string,
      "name": string,
      "price": number,
      "currency": string,
      "category": string,
      "thumbnail": string,
      "features": [string],
      "totalDuration": number,
      "lessons": number,
      "createdAt": ISO-Date
    }],
    "totalCount": number,
    "nextPage": number | null
  }
  ```
- **Success**: `200 OK`

#### 2. Get Course Detail
`GET /web/public/course/:id`
- **Purpose**: Retrieve full details for a specific published course.
- **Path Params**: `id` (min length: 4, required).
- **Success**: `200 OK`

#### 3. Public Video Playback
`GET /web/public/course/play/:lessonId`
- **Purpose**: Generate a signed playback URL for free preview lessons.
- **Path Params**: `lessonId` (min length: 4, required).
- **Note**: Returns `403 Forbidden` if the lesson is not marked as `isFreePreview`.
- **Success**: `200 OK`

---

### 📝 Blog Module

#### 4. List Published Blogs
`GET /web/public/blog`
- **Purpose**: Retrieve a list of published blog posts.
- **Query Params**: `page`, `limit`, `search`.
- **Response Data Schema**:
  ```json
  {
    "blogs": [{
      "_id": string,
      "title": string,
      "author": string,
      "thumbnail": string,
      "content": string,
      "category": [string],
      "createdAt": ISO-Date
    }],
    "totalCount": number,
    "nextPage": number | null
  }
  ```
- **Success**: `200 OK`

#### 5. Get Blog Detail
`GET /web/public/blog/:id`
- **Purpose**: Retrieve full content of a specific blog post.
- **Success**: `200 OK`

---

### ⚙️ Config Module

#### 6. Get PayPal Configuration
`GET /web/public/config/paypal`
- **Purpose**: Retrieve the PayPal client configuration for the platform.
- **Response Data Schema**:
  ```json
  {
    "clientId": string
  }
  ```
- **Success**: `200 OK`

---

## 📋 Business Rules

1. **Visibility**: Public course/blog lists only return records where `isPublished=true` and `isTrashed=false`.
2. **Access Control**: Public lesson playback is strictly limited to lessons with `isFreePreview=true`.
3. **Restricted Content**: Requesting a non-preview lesson via the public play API will return a `403 purchase required` error.
4. **Security**: Playback URLs are time-limited, tokenized URLs generated via the Bunny.net API.
5. **Configuration**: The PayPal config endpoint is used by the frontend to initialize payment gateways dynamically.

---

## 💻 cURL Examples

### List Courses
```bash
curl --request GET "http://localhost:5000/web/public/course?page=1&limit=20&category=Optometry"
```

### Lesson Playback (Free Preview)
```bash
curl --request GET "http://localhost:5000/web/public/course/play/69ceb4fc3f36c4cc6905b26a"
```

### PayPal Config
```bash
curl --request GET "http://localhost:5000/web/public/config/paypal"
```

---

> [!IMPORTANT]
> The Public Portal APIs are the gateway for search engine crawlers and guest users. Ensure fast response times and accurate "published" status checks.
