# AniLytics - Rice Distribution Analytics Platform

A comprehensive analytics platform for rice distribution businesses, featuring AI-powered insights, demand forecasting, and waste management optimization.

## 🚀 New Features (Latest Update)

### Enhanced Data Entry System
- **Flexible Time Period Selection**: Choose your level of detail - Year, Month, Week, or Day
- **Optional Fields**: Month, Week, and Day are optional - input data at any level
- **Smart Week Calculation**: Automatically calculates weeks based on month and year
- **Data Level Indicators**: Clear display of what type of data you're entering
- **Date Preview**: Real-time display of selected time period
- **Support for Multiple Years**: 2024-2027

### Advanced Analytics with Time Filtering
- **Multi-Year Analytics**: View data for specific years, months, or weeks
- **Dynamic Filtering**: Filter analytics by time period using dropdown controls
- **Period Information**: Clear display of currently selected time period
- **Responsive Controls**: Mobile-friendly time period selection

### Dashboard Enhancements
- **Year-Based Views**: Switch between different years to compare performance
- **Dynamic Year Loading**: Automatically populates available years from your data
- **Real-Time Updates**: Dashboard statistics update based on selected time period

## 🎯 Key Features

### Data Management
- **Flexible Data Entry**: Enter rice sales data with precise time tracking
- **Data Validation**: Built-in validation for data quality and accuracy
- **Historical Tracking**: Maintain complete history of all transactions

### Analytics & Insights
- **Trend Analysis**: Identify patterns in sales, waste, and pricing
- **Correlation Analysis**: Understand relationships between market factors
- **Market Comparison**: Compare performance across different market sizes
- **Demand Forecasting**: AI-powered predictions for future planning

### Performance Metrics
- **Efficiency Scoring**: Track waste reduction and operational efficiency
- **Revenue Analytics**: Monitor sales performance and pricing strategies
- **Waste Management**: Optimize inventory to minimize waste

## 🛠️ Technical Implementation

### Backend (Flask)
- **Time Filtering API**: All analytics endpoints support year/month/week filtering
- **Enhanced Data Structure**: Stores year, month, week, and day separately
- **Dynamic Year Detection**: Automatically identifies available years in dataset

### Frontend (HTML/CSS/JavaScript)
- **Responsive Design**: Mobile-friendly interface for all devices
- **Dynamic Dropdowns**: Cascading date selection with real-time updates
- **Interactive Controls**: Apply and reset time filters with ease

### Data Storage
- **JSON Format**: Simple, portable data storage
- **Hierarchical Dates**: Structured date information for easy filtering
- **Sample Data**: Includes multi-year sample data for testing

## 📱 User Experience

### Data Entry Flow - Choose Your Level of Detail

#### **Option 1: Yearly Data (Aggregate)**
1. **Select Year**: Choose from available years (2024-2027)
2. **Leave Month/Week/Day empty**: These are optional
3. **Enter Data**: Input total rice sold/unsold for the entire year
4. **Use Case**: Annual overview, yearly comparisons, long-term planning

#### **Option 2: Monthly Data**
1. **Select Year + Month**: Choose specific month
2. **Leave Week/Day empty**: These are optional
3. **Enter Data**: Input total rice sold/unsold for that month
4. **Use Case**: Monthly trends, seasonal analysis, quarterly planning

#### **Option 3: Weekly Data**
1. **Select Year + Month + Week**: Choose specific week
2. **Leave Day empty**: This is optional
3. **Enter Data**: Input total rice sold/unsold for that week
4. **Use Case**: Weekly patterns, short-term trends, operational planning

#### **Option 4: Daily Data (Most Detailed)**
1. **Select Year + Month + Week + Day**: Choose specific day
2. **Enter Data**: Input rice sold/unsold for that specific day
3. **Use Case**: Daily tracking, precise analysis, detailed reporting

**Note**: The system automatically calculates the appropriate number of weeks for each month and shows day ranges for each week.

### Analytics Navigation
1. **Choose Time Period**: Select year, month, or week for analysis
2. **Apply Filters**: Click "Apply Filter" to update analytics
3. **View Results**: See filtered data in all charts and metrics
4. **Reset Filters**: Use "Reset" to return to full dataset view

### Dashboard Usage
1. **Select Year**: Choose specific year from dropdown
2. **View Statistics**: See metrics for selected time period
3. **Compare Years**: Switch between years to analyze trends
4. **Full Dataset**: Select "All Years" for complete overview

## 🔧 Installation & Setup

1. **Clone Repository**
   ```bash
   git clone [repository-url]
   cd anilytics-rice-app
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   Create `.env` in the project root:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SECRET_FLASK_KEY=change_this_to_a_secure_random_value
   ```

4. **Run Application**
   ```bash
   python app.py
   ```

5. **Access Application**
   - Open browser to `http://localhost:5000`
   - Login/Register to start using the app

## 📊 Sample Data

The application includes sample data spanning multiple years (2024-2026) to demonstrate:
- **Time Filtering**: Test year/month/week selection
- **Multi-Year Trends**: Analyze performance across different periods
- **Data Structure**: Understand the enhanced data format

## 🎨 Design Features

- **Modern UI**: Clean, professional interface design
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Color Scheme**: Green theme reflecting agricultural focus
- **Interactive Elements**: Hover effects and smooth transitions

## 🔮 Future Enhancements

- **Export Functionality**: Download filtered data and reports
- **Advanced Charts**: More sophisticated visualization options
- **User Management**: Multi-user support with role-based access
## 🗃️ Supabase Schema & RLS

Run this SQL in your Supabase SQL Editor to create tables and policies:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (optional)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  full_name text,
  company_name text
);

-- Sales table
create table if not exists public.sales (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  week_date text not null,
  data_level text not null check (data_level in ('daily','weekly','monthly','yearly')),
  year int,
  month int,
  week int,
  day int,
  rice_sold numeric,
  rice_unsold numeric,
  price_per_kg numeric,
  population int,
  avg_consumption numeric,
  purchasing_power numeric,
  competitors int,
  customer_demand text,
  predicted_demand numeric,
  waste_percentage numeric,
  total_revenue numeric
);

-- RLS
alter table public.sales enable row level security;
alter table public.profiles enable row level security;

-- Policies: users manage only their rows
create policy "Select own sales" on public.sales for select using (auth.uid() = user_id);
create policy "Insert own sales" on public.sales for insert with check (auth.uid() = user_id);
create policy "Update own sales" on public.sales for update using (auth.uid() = user_id);
create policy "Delete own sales" on public.sales for delete using (auth.uid() = user_id);

create policy "Select own profile" on public.profiles for select using (auth.uid() = id);
create policy "Upsert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Update own profile" on public.profiles for update using (auth.uid() = id);
```

Make sure Email auth is enabled in Supabase Authentication settings.
- **Real-Time Updates**: Live data synchronization
- **Mobile App**: Native mobile application

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**AniLytics** - Empowering rice distribution businesses with data-driven insights and AI-powered recommendations.
#   a n i l y t i c s - r i c e - a p p  
 