# 🌸 Re:Bloom
> **일기 작성부터 AI 상담, 감정 요약까지 한 번에 이어지는 AI 감정 케어 플랫폼**

Re:Bloom은 사용자의 하루 감정 흐름을 기록하고, AI 상담 모델을 통해 **심층 분석 및 맞춤형 피드백**을 제공하는 서비스입니다.  
단순한 기록을 넘어, 사용자의 감정을 이해하고 위로하며 해결 방향을 제시합니다.


<br/>

## 📋 Overview
**"오늘 하루, 당신의 마음은 어땠나요?"**

Re:Bloom은 사용자가 일기를 작성하면 AI가 즉시 내용을 분석하여 대화를 시작합니다.  
감정의 패턴을 추적하고 요약하여, 나도 몰랐던 나의 감정 상태를 시각적으로 확인할 수 있습니다.

- **Real-time Counseling:** 일기 작성 직후 AI가 공감형 상담을 시작합니다.
- **Deep Analysis:** 일기 내용을 기반으로 감정 톤을 분석하고 해결책을 제시합니다.
- **Daily Report:** 하루의 감정 흐름을 한 문장으로 요약한 리포트를 제공합니다.
- **Cross Platform:** React Expo를 사용하여 웹(Web)과 모바일(App) 환경을 모두 지원합니다.

<br/>

## 🛠 Tech Stack

### Frontend
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)

### AI & Auth
![OpenAI API](https://img.shields.io/badge/OpenAI_API-412991?style=for-the-badge&logo=openai&logoColor=white)
![Google Login](https://img.shields.io/badge/Google_Login-4285F4?style=for-the-badge&logo=google&logoColor=white)

<br/>

## ✨ Key Features

### 1️⃣ AI 기반 감정 분석 & 상담
- **자동 상담 시작:** 일기 내용을 바탕으로 AI가 먼저 말을 걸어옵니다.
- **감정 톤 분석:** 사용자의 텍스트에서 느껴지는 감정(우울, 기쁨, 불안 등)을 분석합니다.
- **공감 및 해결책:** 단순한 위로를 넘어 실질적인 해결 방향을 제시합니다.
- **자동 저장:** 모든 상담 내역은 자동으로 데이터베이스에 저장됩니다.

### 2️⃣ 감정 요약 기능 (Daily Report)
- **한 줄 요약:** 긴 상담과 일기 내용을 분석해 하루의 감정 흐름을 한 문장으로 요약합니다.
- **UI 리포트:** "오늘의 감정 리포트" 카드를 통해 직관적인 피드백을 제공합니다.
- **API 연동:** `/api/diary/chat/{diaryId}/summary` 엔드포인트를 활용합니다.

### 3️⃣ 유저 상태 프로필 시스템
- **감정 태그 선택:** 우울감, 스트레스, 무기력 등 현재 주요 상태를 태그로 설정합니다.
- **커스텀 상태:** 제공된 태그 외에 기타 이유를 직접 작성할 수 있습니다.
- **유연한 설정:** 초기 가입 시 설정하며, 이후 프로필 페이지에서 언제든 수정 가능합니다.

<br/>

## 📱 UI / UX Screens

| 📘 달력 (일기 조회) | 💬 AI 상담 및 작성 |
| :---: | :---: |
| 본인이 작성한 일기를<br>캘린더 형태로 한눈에 확인 | 일기 작성 후 즉시 이어지는<br>AI와의 심층 상담 페이지 |
<img width="200" height="450" alt="image" src="https://github.com/user-attachments/assets/2afc71dd-17b9-434a-9255-fb2f3113d081" />
<img width="200" height="440" alt="image" src="https://github.com/user-attachments/assets/5efe0fde-f2bd-4677-9571-e89426b7851b" />


| 📊 하루 요약 페이지 | 🧍 프로필 수정 |
| :---: | :---: |
| 하루의 감정을 분석한<br>요약 리포트 제공 | 닉네임, 성별, 감정 상태 태그를<br>수정하는 페이지 |

<br/>

## 📡 API Endpoints
백엔드 서버와 통신하는 주요 API 명세입니다.

### 📔 Diary & Chat
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `POST` | `/api/diary/save-and-chat` | 일기 저장 + 첫 상담 응답 (상담 시작) |
| `POST` | `/api/diary/chat/start` | (예비) 대화 시작 |
| `POST` | `/api/diary/chat/{diaryId}` | 대화 이어가기 |
| `POST` | `/api/diary/chat/{diaryId}/summary` | 상담 및 일기 내용 요약 생성 |
| `GET` | `/api/diary` | 특정 날짜 일기 조회 |
| `GET` | `/api/diary/all` | 전체 일기 조회 (캘린더용) |
| `DELETE` | `/api/admin/reset/today` | 오늘 일기 초기화 (시연/테스트용) |

### 👤 Profile
| Method | Endpoint | 설명 |
| :--- | :--- | :--- |
| `GET` | `/api/profile/me` | 내 프로필 정보 조회 |
| `PUT` | `/api/profile` | 프로필 생성 및 수정 |

<br/>

## 🚀 Installation & Running

**1. Repository Clone**
```bash
git clone [https://github.com/YOUR_GITHUB_ID/re-bloom.git](https://github.com/seongjinss555/re-bloom.git)
cd re-bloom
```

**2. Install Dependencies**
```bash
npm install
# or
yarn install
```

**3. Run App**
```bash
npx expo start
```

### 👨‍💻 Contributors
- Frontend: [안성진/seongjinss555] - UI/UX 구현, AI API 연동, 상태 관리
- Backend: [최원빈] - API 서버 구축, DB 설계
