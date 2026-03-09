# AskMedia Hub

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Q&A Forum: Users can post questions, browse all questions, and admins can post answers
- Media Library: Users can upload images and videos, browse them in a gallery grid
- User authentication with roles (admin, regular user)
- Question detail page showing the question and all answers
- Media upload page with title and description
- Home page with tabs for Q&A and Media sections

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend
- User authorization with admin/user roles
- Questions: create, list, get by id
- Answers: create per question, list by question
- Media items: upload blob (image/video), list, get by id, delete
- Blob storage for media files

### Frontend
- Home page with two tabs: "Q&A" and "Media"
- Q&A tab: list of questions, post new question form, click to view question detail with answers
- Question detail: show question, list answers, post answer form (authenticated users)
- Media tab: grid gallery of uploaded images/videos, upload button
- Upload modal: file picker, title, description fields
- Navigation bar with login/logout
- Responsive layout
