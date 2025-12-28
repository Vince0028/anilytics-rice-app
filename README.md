<div align="center">
  <h1>🌾 Anilytics: Rice Retail Analytics System</h1>
  <p>
    <strong>Data-Driven Insights for Rice Retailers and Consumers</strong>
  </p>
  
  <p>
    <a href="#about">About</a> •
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a>
  </p>


  <p>
    <img src="https://img.shields.io/badge/-Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
    <img src="https://img.shields.io/badge/-Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask">
    <img src="https://img.shields.io/badge/-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
    <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  </p>
</div>

<br />

## 📖 About <a name="about"></a>

**Anilytics** is a comprehensive analytics platform designed specifically for the rice retail industry. It bridges the gap between complex market data and actionable business insights.

For **Retailers**, it offers a powerful dashboard to track sales, analyze waste, monitor price trends, and receive AI-powered inventory recommendations.
For **Consumers** (and the public), it provides transparency into rice prices and market trends, helping them make informed purchasing decisions.

## ✨ Features <a name="features"></a>

### 🏢 For Retailers
- **Business Intelligence Dashboard**: Visualize tracked sales, revenue, and waste metrics in real-time.
- **Trend Analysis**: Advanced linear regression models to forecast demand, price fluctuations, and sales trends.
- **Smart Recommendations (AI)**: Rule-based AI engine that suggests ordering levels based on historical waste and demand patterns.
- **Market Comparison**: Benchmarking tools to compare performance against anonymized market aggregates (Small, Medium, Large market segments).
- **Data Management**: Easy-to-use input forms for daily, weekly, or monthly sales data.

### 👥 For Consumers
- **Price Monitoring**: View current market prices for different rice varieties.
- **Trend Visibility**: Understand market movements to decide the best time to buy.

## 🛠️ Tech Stack <a name="tech-stack"></a>

The system is built as a hybrid application, leveraging a robust Python backend for analytics and a modern React frontend for the landing experience.

| Component | Technology | Description |
|-----------|------------|-------------|
| **Backend** | ![Python](https://img.shields.io/badge/-Python-3776AB?logo=python&logoColor=white) ![Flask](https://img.shields.io/badge/-Flask-000000?logo=flask&logoColor=white) | Core application logic, API endpoints, and statistical analysis (Linear Regression). |
| **Database** | ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white) | Real-time database, authentication, and user management. |
| **Frontend (App)** | ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white) ![JinJa2](https://img.shields.io/badge/-Jinja2-B41717?logo=jinja&logoColor=white) | Server-side rendered templates for the main dashboard and retailer tools. |
| **Frontend (Landing)** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) | Modern, high-performance landing page component (located in `landingpage/`). |
| **Styling** | ![CSS3](https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white) ![Bootstrap](https://img.shields.io/badge/-Bootstrap-7952B3?logo=bootstrap&logoColor=white) | Responsive design system. |

## 📐 Architecture & System <a name="architecture"></a>

The system operates on a **Model-View-Controller (MVC)** pattern adaptation:
- **Data Layer**: Supabase (PostgreSQL) stores user profiles (`retailer`, `consumer`), sales records, and market data.
- **Logic Layer**: `app.py` handles routing, authentication (via Supabase Auth), and the core analytical computations (trends, correlation analysis, efficiency scores).
- **Presentation Layer**: 
  - Flask Templates (`templates/`) render the authenticated user interface.
  - React (`landingpage/`) serves as the modern entry point for the application.

## 🚀 Getting Started <a name="getting-started"></a>

Follow these instructions to set up the project locally.

### Prerequisites
- **Python** (3.9 or higher)
- **Node.js** (for the landing page)
- **Supabase Account** (for database and auth)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/anilytics-rice-app.git
cd anilytics-rice-app
```

### 2. Backend Setup (Flask)

Create a virtual environment:
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```



Run the Server:
```bash
python app.py
```
The application will be available at `http://localhost:5000`.

### 3. Frontend Setup (React Landing Page)
*Note: The React app is located in the `landingpage` directory.*

```bash
cd landingpage
npm install
npm run dev
```
The landing page will be available at `http://localhost:5173`.

---

<div align="center">
  <p>Made with ❤️ Benben</p>
</div>
