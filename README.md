# Fossee Project

This repository contains the source code for the Fossee project, consisting of a Django backend, a React web frontend, and a Python-based desktop application.

## Project Structure

- **backend/**: Django REST API backend.
- **web-frontend/**: React application using Vite.
- **desktop-frontend/**: Python desktop application (PyQt/Tkinter/CustomTkinter).

## Setup Instructions

### Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js & npm](https://nodejs.org/)
- [Git](https://git-scm.com/)

---

### 1. Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (if not already present):
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run database migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```
   The backend will run at `http://127.0.0.1:8000/`.

---

### 2. Web Frontend Setup (React + Vite)

1. Navigate to the web frontend directory:
   ```bash
   cd web-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The web app will be available at `http://localhost:5173/` (or the port shown in the terminal).

---

### 3. Desktop Application Setup

1. Navigate to the desktop frontend directory:
   ```bash
   cd desktop-frontend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the application:
   ```bash
   python main.py
   ```

## Notes

- Ensure the backend is running before using the web or desktop applications if they rely on API calls.
- Check `.env` files (if applicable) for configuration changes.
