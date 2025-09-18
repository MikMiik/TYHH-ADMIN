# TYHH Data Model - Admin Management Guide

## Database Schema Overview

Dự án TYHH có một cấu trúc dữ liệu phức tạp với 18+ bảng dữ liệu chính, tập trung vào việc quản lý khóa học, livestream, người dùng và nội dung giáo dục. Đây là tài liệu chi tiết về cấu trúc dữ liệu để phát triển trang admin.

## 🧑‍💼 User Management System

### Users (`users`)
**Bảng trung tâm quản lý tất cả người dùng trong hệ thống**

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),
  username VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar VARCHAR(191),
  yearOfBirth INT,
  city VARCHAR(50),
  school VARCHAR(100),
  phone VARCHAR(20) UNIQUE,
  facebook VARCHAR(191) UNIQUE,
  status VARCHAR(20),
  role VARCHAR(20) DEFAULT 'user',     -- 'user', 'admin', 'teacher'
  point DECIMAL(10,2) DEFAULT 0,
  googleId VARCHAR(255),               -- Google OAuth ID
  key VARCHAR(255),                    -- Verification key
  activeKey BOOLEAN DEFAULT false,     -- Email verification status
  lastLogin DATETIME,
  verifiedAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME                   -- Soft delete
);
```

**Admin Features cần quản lý:**
- ✅ **User CRUD**: Create, Read, Update, Delete users
- ✅ **Role Management**: Assign roles (admin, teacher, user)
- ✅ **Account Status**: Active/inactive, ban/unban users
- ✅ **Profile Management**: User profile information
- ✅ **Email Verification**: Manage verification status
- ✅ **Points System**: User points/rewards management
- ✅ **Authentication**: OAuth integration management

## 📚 Course Management System

### Courses (`courses`)
**Bảng chính quản lý tất cả khóa học**

```sql
CREATE TABLE courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  teacherId INT,                       -- Foreign key to users
  price DECIMAL(10,2),
  discount DECIMAL(10,2),
  isFree BOOLEAN DEFAULT false,
  purpose VARCHAR(255),                -- Course objective
  thumbnail VARCHAR(191),              -- Course image
  content TEXT,                        -- Course description HTML
  group VARCHAR(255),                  -- Course category/group
  introVideo VARCHAR(255),             -- Introduction video URL
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME                   -- Soft delete
);
```

### Course Outlines (`course-outline`)
**Cấu trúc chương/bài học của khóa học**

```sql
CREATE TABLE course_outline (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  courseId INT NOT NULL,               -- Foreign key to courses
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

### Topics (`topics`)
**Quản lý chủ đề/tags cho khóa học**

```sql
CREATE TABLE topics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

**Admin Features cần quản lý:**
- ✅ **Course CRUD**: Full course management
- ✅ **Content Management**: HTML editor for course content
- ✅ **Media Management**: Thumbnails, intro videos
- ✅ **Pricing Management**: Free/paid courses, discounts
- ✅ **Course Structure**: Outlines và chapters
- ✅ **Topic/Tag Management**: Course categorization
- ✅ **Teacher Assignment**: Assign teachers to courses

## 🎥 Livestream Management System

### Livestreams (`livestreams`)
**Quản lý video bài giảng và livestream**

```sql
CREATE TABLE livestreams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  courseId INT NOT NULL,               -- Foreign key to courses
  courseOutlineId INT NOT NULL,        -- Foreign key to course_outline
  url VARCHAR(255),                    -- Video URL
  view BIGINT DEFAULT 0,               -- View count
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

### View Tracking System
**Hệ thống theo dõi người dùng xem video**

```sql
CREATE TABLE user_livestream (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,                 -- Foreign key to users
  livestreamId INT NOT NULL,           -- Foreign key to livestreams
  createdAt DATETIME NOT NULL,         -- Timestamp when user viewed
  updatedAt DATETIME NOT NULL
);
```

**Admin Features cần quản lý:**
- ✅ **Video CRUD**: Upload, manage livestreams
- ✅ **Video Analytics**: View counts, watch time
- ✅ **Content Organization**: Assign to courses/outlines
- ✅ **URL Management**: Video hosting URLs
- ✅ **View Tracking**: User viewing history

## 📄 Document Management System

### Documents (`documents`)
**Quản lý tài liệu đi kèm bài giảng**

```sql
CREATE TABLE documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  livestreamId INT,                    -- Foreign key to livestreams
  vip BOOLEAN DEFAULT false,           -- VIP-only document
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  downloadCount INT DEFAULT 0,
  thumbnail VARCHAR(255),              -- Document preview image
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

**Admin Features cần quản lý:**
- ✅ **Document CRUD**: Upload, manage documents
- ✅ **VIP Content**: Manage premium documents
- ✅ **Download Analytics**: Track download statistics
- ✅ **Document Association**: Link to specific livestreams

## 📊 Relationship Management

### Course-User Relationships (`course_user`)
**Quản lý học viên đăng ký khóa học**

```sql
CREATE TABLE course_user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  courseId INT NOT NULL,               -- Foreign key to courses
  userId INT NOT NULL,                 -- Foreign key to users
  createdAt DATETIME NOT NULL,         -- Registration timestamp
  updatedAt DATETIME NOT NULL
);
```

### Course-Topic Relationships (`course_topic`)
**Liên kết khóa học với chủ đề**

```sql
CREATE TABLE course_topic (
  id INT PRIMARY KEY AUTO_INCREMENT,
  courseId INT NOT NULL,               -- Foreign key to courses
  topicId INT NOT NULL,                -- Foreign key to topics
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

**Admin Features cần quản lý:**
- ✅ **Enrollment Management**: User course registrations
- ✅ **Course Categorization**: Topic assignments
- ✅ **Bulk Operations**: Mass enrollment/unenrollment

## 🔧 System Configuration

### Site Information (`site-info`)
**Cài đặt hệ thống dạng key-value**

```sql
CREATE TABLE site_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(100) UNIQUE NOT NULL,    -- Setting key
  value TEXT,                          -- Setting value (JSON/text)
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

### Social Links (`socials`)
**Quản lý liên kết mạng xã hội**

```sql
CREATE TABLE socials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  platform VARCHAR(100) NOT NULL,     -- 'facebook', 'youtube', etc.
  url VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

### Cities (`cities`)
**Danh sách thành phố**

```sql
CREATE TABLE cities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### Schools (`schools`)
**Danh sách trường học**

```sql
CREATE TABLE schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  cityId INT,                          -- Foreign key to cities
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

**Admin Features cần quản lý:**
- ✅ **System Settings**: Key-value configuration management
- ✅ **Social Media**: Platform links management
- ✅ **Geographic Data**: Cities and schools management
- ✅ **Site Configuration**: Global site settings

## 📢 Communication System

### Notifications (`notifications`)
**Hệ thống thông báo**

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(191) NOT NULL,
  content TEXT,
  type VARCHAR(50),                    -- 'info', 'warning', 'success', etc.
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

### User Notifications (`user_notification`)
**Thông báo cá nhân cho từng user**

```sql
CREATE TABLE user_notification (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,                 -- Foreign key to users
  notificationId INT NOT NULL,         -- Foreign key to notifications
  isRead BOOLEAN DEFAULT false,
  readAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### Schedules (`schedules`)
**Lịch học và thời khóa biểu**

```sql
CREATE TABLE schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  target VARCHAR(100),                 -- Schedule target/subject
  url VARCHAR(255),                    -- Related URL
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

**Admin Features cần quản lý:**
- ✅ **Notification System**: Create, send notifications
- ✅ **User Notifications**: Personal notification management
- ✅ **Broadcast Messages**: System-wide announcements
- ✅ **Schedule Management**: Class schedules and timetables

## 🚀 Advanced Features

### Queue System (`queue`)
**Hệ thống xử lý background jobs**

```sql
CREATE TABLE queue (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(100) NOT NULL,          -- Job type
  payload TEXT,                        -- Job data (JSON)
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  attempts INT DEFAULT 0,
  maxAttempts INT DEFAULT 3,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### Refresh Tokens (`refresh_token`)
**JWT refresh token management**

```sql
CREATE TABLE refresh_token (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,                 -- Foreign key to users
  token VARCHAR(255) NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

### Slide Notes (`slidenote`)
**Ghi chú slides cho bài giảng**

```sql
CREATE TABLE slidenote (
  id INT PRIMARY KEY AUTO_INCREMENT,
  livestreamId INT,                    -- Foreign key to livestreams
  content TEXT,                        -- Slide content
  order INT DEFAULT 0,                 -- Slide order
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  deletedAt DATETIME
);
```

**Admin Features cần quản lý:**
- ✅ **Background Jobs**: Queue monitoring and management
- ✅ **Token Management**: JWT/refresh token administration
- ✅ **Slide Management**: Presentation slides for lectures
- ✅ **System Monitoring**: Job status and error tracking

## 🏗️ Database Relationships

### Entity Relationship Diagram (ERD) Overview

```
Users (1) ──── (N) Courses [teacherId]
Users (N) ──── (N) Courses [through course_user]
Courses (1) ──── (N) CourseOutlines
Courses (N) ──── (N) Topics [through course_topic]
CourseOutlines (1) ──── (N) Livestreams
Livestreams (1) ──── (N) Documents
Livestreams (N) ──── (N) Users [through user_livestream]
Users (1) ──── (N) UserNotifications
Notifications (1) ──── (N) UserNotifications
Cities (1) ──── (N) Schools
```

### Key Foreign Key Constraints

```sql
-- Course relationships
ALTER TABLE courses ADD FOREIGN KEY (teacherId) REFERENCES users(id);
ALTER TABLE course_outline ADD FOREIGN KEY (courseId) REFERENCES courses(id);
ALTER TABLE livestreams ADD FOREIGN KEY (courseId) REFERENCES courses(id);
ALTER TABLE livestreams ADD FOREIGN KEY (courseOutlineId) REFERENCES course_outline(id);

-- Document relationships
ALTER TABLE documents ADD FOREIGN KEY (livestreamId) REFERENCES livestreams(id);

-- Many-to-many relationships
ALTER TABLE course_user ADD FOREIGN KEY (courseId) REFERENCES courses(id);
ALTER TABLE course_user ADD FOREIGN KEY (userId) REFERENCES users(id);
ALTER TABLE course_topic ADD FOREIGN KEY (courseId) REFERENCES courses(id);
ALTER TABLE course_topic ADD FOREIGN KEY (topicId) REFERENCES topics(id);

-- Tracking relationships
ALTER TABLE user_livestream ADD FOREIGN KEY (userId) REFERENCES users(id);
ALTER TABLE user_livestream ADD FOREIGN KEY (livestreamId) REFERENCES livestreams(id);
```

## 📱 Admin Interface Requirements

### Dashboard Overview
**Key metrics và quick stats**
- Total users, courses, livestreams
- Recent activity feed
- System health status
- Popular content analytics

### User Management Interface
- **User List**: Searchable, filterable table
- **User Profile**: Detailed view với edit capabilities
- **Role Management**: Role assignment interface
- **Bulk Operations**: Mass actions (ban, export, etc.)

### Course Management Interface
- **Course Builder**: WYSIWYG editor for course content
- **Media Library**: Image/video upload và management
- **Course Structure**: Drag-drop outline editor
- **Enrollment Management**: Student registration tracking

### Content Management Interface
- **Video Manager**: Upload, organize livestream content
- **Document Library**: File upload với preview capabilities
- **Analytics Dashboard**: View counts, engagement metrics
- **Content Scheduling**: Publish/unpublish timing

### System Administration Interface
- **Settings Panel**: Site configuration management
- **Notification Center**: Create và send notifications
- **Background Jobs**: Queue monitoring
- **Database Tools**: Backup, migration utilities

## 🔐 Security Considerations

### Data Protection
- **Soft Deletes**: Most tables có `deletedAt` for data recovery
- **Password Security**: Bcrypt hashing với salt rounds
- **JWT Security**: Refresh token rotation
- **Role-based Access**: Admin, teacher, user permissions

### Audit Trail
- **Timestamp Tracking**: All tables có `createdAt`, `updatedAt`
- **User Actions**: Track admin actions for accountability
- **Data Changes**: Log significant data modifications

## 📈 Performance Optimization

### Database Indexing Strategy
```sql
-- Essential indexes for admin queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_courses_teacher ON courses(teacherId);
CREATE INDEX idx_livestreams_course ON livestreams(courseId);
CREATE INDEX idx_documents_livestream ON documents(livestreamId);
CREATE INDEX idx_course_user_composite ON course_user(courseId, userId);
```

### Caching Strategy
- **User Sessions**: Redis caching for active users
- **Course Data**: Cache frequently accessed course information
- **Site Settings**: Memory cache for site configuration
- **View Counts**: Batch update view statistics

## 🎯 Development Priorities

### Phase 1: Core Admin Features
1. **User Management**: CRUD operations, role management
2. **Course Management**: Basic course creation và editing
3. **Content Upload**: Video và document management
4. **System Settings**: Basic site configuration

### Phase 2: Advanced Features
1. **Analytics Dashboard**: User engagement, content performance
2. **Notification System**: Admin-to-user communication
3. **Bulk Operations**: Mass data management tools
4. **Advanced Search**: Full-text search across content

### Phase 3: Enterprise Features
1. **Audit Logs**: Complete admin action tracking
2. **Data Export**: CSV/Excel export capabilities
3. **API Management**: External integrations
4. **Advanced Security**: 2FA, IP restrictions

## 📚 Data Migration & Seeding

### Sample Data Structure
```javascript
// Users seed data
const users = [
  {
    email: 'admin@tyhh.com',
    username: 'admin',
    name: 'System Administrator',
    role: 'admin',
    activeKey: true,
    verifiedAt: new Date()
  },
  // More sample users...
];

// Courses seed data
const courses = [
  {
    title: 'Vận Dụng Cao 9+',
    slug: 'van-dung-cao-9-plus',
    teacherId: 1,
    isFree: false,
    price: 1500000,
    description: 'Khóa học nâng cao...'
  },
  // More sample courses...
];
```

### Migration Scripts
- **Initial Setup**: Create all tables với proper constraints
- **Data Seeding**: Populate với sample data for testing
- **Index Creation**: Add performance indexes
- **Foreign Key Setup**: Establish relationships

---

## 📋 Next Steps

Sau khi hoàn thành việc phân tích data model này, các bước tiếp theo cho TYHH ADMIN sẽ là:

1. **Setup Admin Framework**: Next.js + TypeScript + Prisma/Sequelize
2. **Design Admin UI**: Layout, navigation, responsive design
3. **Implement CRUD Operations**: For each entity mentioned above
4. **Add Authentication**: Admin login với role-based permissions
5. **Create Dashboard**: Overview với key metrics và charts

File này sẽ serve as the single source of truth cho việc phát triển trang admin, ensuring tất cả features được develop theo đúng data structure và business requirements của TYHH platform.