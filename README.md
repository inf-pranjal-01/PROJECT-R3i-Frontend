# R3i — Intelligent Complaint Management System

---

> ## ⚠️ IMPORTANT: Backend Cold Start Notice
> **The backend is deployed on Render's free tier. On first load, the server may take 1–2 minutes to wake up. Please be patient and wait before retrying. Subsequent requests will be fast.**

---

## 🌐 Deployment

| Layer | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Built with [Lovable](https://lovable.dev) |
| Backend | Render | May cold-start on first request (1–2 min) |
| Cloud and Database | Firebase | Firestore is used to save data |

> UI/UX Design by the R3i team.

---

## 🚀 Getting Started — Demo Setup

Our platform has **two distinct user roles**: **Admin** and **Student**. To experience the full flow, you'll need to simulate both sides simultaneously.

### Step 1 — Open Two Separate Sessions
Use **two different browsers**, or open one **normal tab** and one **incognito/private tab**, so both sessions remain independently logged in.

### Step 2 — Login with Google
Sign in with a Google account on **both** sessions.

### Step 3 — Create Your Accounts
- **Session A (Admin):** Create an **Admin** account and select your department during setup.
- **Session B (Student):** Create a **Student** account and fill in the relevant student details.

### Step 4 — Submit a Complaint
From the **Student** session, write and submit a complaint that is **directly related to the department you chose** when setting up the Admin account. This ensures the LLM routing agent correctly identifies and forwards the complaint to the right admin dashboard.

> **Tip:** The more relevant the complaint is to the admin's department, the better you'll be able to observe the intelligent routing in action.

---

## 🎨 Status Color Legend

The platform uses a traffic-light color scheme to indicate complaint/chat status at a glance:

| Color | Meaning |
|---|---|
| 🔴 **Red** | Action required **by you** |
| 🟡 **Yellow** | Action required by the **other party** / Request submitted & pending |
| 🟢 **Green** | Request **resolved** — chat is now closed |

---

## 🤖 LLM Agent — How It Works

The AI agent built into R3i performs two core functions:

### 1. Intelligent Complaint Routing
The agent analyzes the content of each complaint and automatically identifies the correct department to route it to, eliminating manual triage.

### 2. Complaint Enhancement
The same agent also acts as an **enhancer sub-agent**. It reformats and enriches the raw complaint text submitted by the student — improving clarity, structure, and professional tone — before displaying it on the **Admin Dashboard**.

> In short: the student writes a rough complaint → the agent enhances it → the admin sees a clean, well-formatted version.

---

## 🔍 Complaint Tracking

Every complaint submission generates a unique **Tracking ID**.

To find a specific complaint:
1. Copy the **Tracking ID** provided after submission.
2. Paste it into the **Search Bar** on the platform.
3. Press **Enter** — the corresponding chat thread will open automatically.

---

## 🎬 Demo Video Note

> In the demo video attached to the Google Form, we have **pre-created Admin and Student accounts** to make the walkthrough faster. The video demonstrates the full complaint lifecycle, routing logic, and the enhanced view on the Admin dashboard.

---

## 👥 Team

Project designed and developed by the **Re/CORE**.
