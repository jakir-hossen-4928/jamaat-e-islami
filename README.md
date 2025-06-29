# 🇧🇩 জামায়াতে ইসলামী ভোটার ব্যবস্থাপনা সিস্টেম

## 📦 প্রকল্প পরিচিতি

**লাইভ ডেমো:** [jammat-e-islami](https://jamaat-e-islami.netlify.app/)

বাংলাদেশ জামায়াতে ইসলামী (কাকৈর খোলা, চৌদ্দগ্রাম শাখা) - আধুনিক ভোটার তথ্য সংগ্রহ, বিশ্লেষণ ও প্রচারণা সিস্টেম।

---

## 🚀 প্রযুক্তি

- **React 18 + TypeScript**
- **Vite** (Fast build tool)
- **Tailwind CSS** (UI Styling)
- **shadcn/ui** (UI Components)
- **Firebase** (Authentication & Firestore)
- **Framer Motion** (Animation)
- **Lovable** (AI-powered code editing)

---

## ⚙️ কনফিগারেশন ও নিরাপত্তা

### .env ফাইল ব্যবস্থাপনা

**.env এবং .env.example ফাইল অবশ্যই গিটে কমিট করবেন না!**

আপনার `.gitignore` ফাইলে নিচের লাইন দুটি যোগ করুন:

```
# .env files
.env
.env.*
.env.example
```

### পরিবেশ ভেরিয়েবল সেটআপ

1. `.env.example` ফাইলটি কপি করে `.env` নাম দিন。
2. আপনার প্রকৃত Firebase ও অন্যান্য কনফিগারেশন মান বসান。
3. কখনোই `.env` বা `.env.example` গিটে কমিট করবেন না।

#### .env ফাইলের নমুনা

```
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_API_BASE_URL=https://your-api-domain.com
VITE_SMS_API_BASE_URL=https://your-sms-api-domain.com
```

---

## 🛡️ নিরাপত্তা ফিচার

- 🔒 **Rate Limiting**: বারবার লগইন/রেজিস্ট্রেশন চেষ্টায় ব্রুট ফোর্স প্রতিরোধ
- 🔑 **Strong Password Validation**: শক্তিশালী পাসওয়ার্ড বাধ্যতামূলক
- 🕵️ **Generic Error Messages**: তথ্য ফাঁস রোধে জেনেরিক বার্তা
- 📋 **Security Logging**: সন্দেহজনক কার্যক্রম মনিটরিং
- 🔐 **Firebase Security Rules**: ডেটা নিরাপত্তা ও অ্যাক্সেস কন্ট্রোল

---





### 3️⃣ GitHub-এ সরাসরি এডিট

- ফাইল ওপেন করুন, Edit (✏️) বাটনে ক্লিক করুন, পরিবর্তন করুন ও কমিট করুন।

### 4️⃣ GitHub Codespaces

- "Code" > "Codespaces" > "New codespace" > কোড এডিট করুন ও কমিট করুন।

---

---

## 📚 ডকুমেন্টেশন

- অ্যাপে `/docs` রুটে যান।

---

## 🧑‍💻 ডেভেলপার

- Developed with ❤️ by [Jakir Hossen](https://www.facebook.com/jakir.hossen.4928)

---

## ⚠️ নিরাপত্তা টিপস

1. **.env ও .env.example গিটে রাখবেন না**
2. **Firebase Security Rules আপডেট রাখুন**
3. **নিয়মিত ডিপেন্ডেন্সি আপডেট করুন**
4. **HTTPS ব্যবহার করুন**
5. **সন্দেহজনক লগ মনিটর করুন**

---

> ✨ সফল ভোটার ব্যবস্থাপনা ও নিরাপদ ডেটা সুরক্ষার জন্য আমাদের সিস্টেম ব্যবহার করুন!
