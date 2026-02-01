# 🚀 Fossee - Smart Data Management Suite

**Fossee** is a powerful full-stack application designed to streamline data management, reporting, and analytics. It seamlessly integrates a robust **Django** backend with a modern **React** frontend and a dedicated **Desktop Client**, providing users with real-time insights and efficient data handling capabilities across platforms.

Built with performance and scalability in mind, Fossee leverages **Firebase** for cloud services and local processing for immediate data visualization.

---

## 🚀 Features

*   **📊 Interactive Dashboard** – Visualize trends and data with dynamic charts and graphs.
*   **📂 Smart Data Management** – Upload, parse, and analyze CSV datasets instantly.
*   **📈 Real-time Reporting** – Generate comprehensive reports on the fly.
*   **🔐 Secure Authentication** – Integrated user verification and management.
*   **🖥️ Cross-Platform Support** – Access via a responsive Web App or a native Desktop Client.
*   **🔥 Firebase Integration** – Reliable cloud storage and real-time database syncing.
*   **🎨 Modern UI/UX** – Built with **Tailwind CSS** for a clean, professional aesthetic.

---

## 🏗️ Project Structure

```bash
Fossee/
│── 📂 backend/              # 🐍 Django REST API & Logic
│   ├── config/              # Project settings
│   ├── core/                # Core application logic
│   ├── manage.py            # Django entry point
│   └── requirements.txt     # Python dependencies
│
│── 📂 web-frontend/         # ⚛️ React + Vite Web Application
│   ├── src/                 # Source code (Components, Pages)
│   ├── public/              # Static assets
│   ├── vite.config.js       # Vite configuration
│   └── package.json         # Node.js dependencies
│
│── 📂 desktop-frontend/     # 🖥️ Python Desktop Application
│   ├── main.py              # Application entry point
│   ├── firebase_service.py  # Firebase integration
│   └── requirements.txt     # Python dependencies
│
└── 📄 README.md             # Project Documentation
```

---

## 🛠️ Setup Instructions

### 🔧 Prerequisites
*   **Python 3.8+** (for Backend & Desktop)
*   **Node.js v16+** (for Web Frontend)
*   **Git** (for version control)

---

### 🟢 1. Backend Setup (Django)

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create a virtual environment (Recommended)
python -m venv venv

# 3. Activate the virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run Migrations
python manage.py migrate

# 6. Start the Server
python manage.py runserver
```
> The backend server will start at `http://127.0.0.1:8000/`.

---

### 🔵 2. Web Frontend Setup (React)

```bash
# 1. Navigate to the web-frontend folder
cd web-frontend

# 2. Install dependencies
npm install

# 3. Start the Development Server
npm run dev
```
> The web application will be accessible at `http://localhost:5173/`.

---

### 🟣 3. Desktop App Setup

```bash
# 1. Navigate to the desktop-frontend folder
cd desktop-frontend

# 2. Create logic virtual environment
python -m venv venv

# 3. Activate the environment
# Windows:
venv\Scripts\activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Launch the Application
python main.py
```

---

## 📜 License
This project is licensed under the **MIT License**.

## 🤝 Contact
For questions or collaboration, feel free to reach out!
