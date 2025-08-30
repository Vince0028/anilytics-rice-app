from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, session, send_from_directory
import json
import os
from datetime import datetime, timedelta
import uuid
import statistics
from collections import defaultdict
from functools import wraps
from dotenv import load_dotenv
from supabase import create_client, Client
import secrets
import psycopg2
from werkzeug.security import generate_password_hash, check_password_hash
import decimal
import datetime as dt
import traceback
import time

load_dotenv()

app = Flask(__name__, 
            static_folder='static',
            template_folder='templates')

# Secret key from env with safe fallback
_sk = os.getenv('SECRET_FLASK_KEY')
if not _sk or _sk.strip() == '':
    _sk = secrets.token_urlsafe(64)
    print('[WARN] SECRET_FLASK_KEY not set in .env. Using a temporary in-memory key. Set SECRET_FLASK_KEY in .env to persist sessions.')
app.secret_key = _sk

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('SUPABASE_ANON_KEY')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
FORCE_ADMIN_SIGNUP = os.getenv('FORCE_ADMIN_SIGNUP', 'false').lower() == 'true'
USERNAME_EMAIL_SUFFIX = os.getenv('USERNAME_EMAIL_SUFFIX', '@local.local')

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    print("[WARN] SUPABASE_URL or SUPABASE_ANON_KEY missing from environment. Auth and database features will not work until configured.")
print(f"[INFO] Supabase config: url={'set' if SUPABASE_URL else 'missing'}, anon={'set' if SUPABASE_ANON_KEY else 'missing'}, service_role={'set' if SUPABASE_SERVICE_ROLE_KEY else 'missing'}, force_admin_signup={FORCE_ADMIN_SIGNUP}, username_suffix={USERNAME_EMAIL_SUFFIX}")

def get_supabase_client(as_user: bool = True) -> Client:
    """Create a Supabase client. If a user session is available and as_user is True,
    attach it so that Row Level Security applies per user.
    """
    client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    if as_user:
        access_token = session.get('sb_access_token')
        refresh_token = session.get('sb_refresh_token')
        if access_token and refresh_token:
            try:
                client.auth.set_session(access_token, refresh_token)
            except Exception:
                pass
    return client

def get_supabase_admin_client() -> Client:
    """Create a Supabase admin client using the service role key (server-side only)."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError('Admin client requires SUPABASE_SERVICE_ROLE_KEY')
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def to_auth_email(identifier: str) -> str:
    """Map a username to an email when no '@' is present so Supabase Email auth accepts it.
    Example: 'alice' -> 'alice@local.local' (configurable via USERNAME_EMAIL_SUFFIX).
    """
    s = (identifier or '').strip()
    if '@' not in s:
        return (s + USERNAME_EMAIL_SUFFIX).lower()
    return s.lower()

def login_required(view_func):
    @wraps(view_func)
    def _wrapped(*args, **kwargs):
        if not session.get('sb_user'):
            # For API routes, return JSON 401 to avoid breaking fetch()
            if request.path.startswith('/api') or request.accept_mimetypes.best == 'application/json':
                return jsonify({"error": "Unauthorized"}), 401
            return redirect(url_for('login', next=request.path))
        return view_func(*args, **kwargs)
    return _wrapped

def role_required(*roles):
    @wraps(roles[0] if roles else (lambda x: x))
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped(*args, **kwargs):
            user = session.get('sb_user')
            if not user:
                if request.path.startswith('/api') or request.accept_mimetypes.best == 'application/json':
                    return jsonify({"error": "Unauthorized"}), 401
                return redirect(url_for('login', next=request.path))
            if roles and user.get('role') not in roles:
                if request.path.startswith('/api') or request.accept_mimetypes.best == 'application/json':
                    return jsonify({"error": "Forbidden"}), 403
                flash('You do not have access to this page', 'error')
                if user.get('role') == 'consumer':
                    return redirect(url_for('consumer_dashboard'))
                return redirect(url_for('dashboard'))
            return view_func(*args, **kwargs)
        return _wrapped
    return decorator

def load_data():
    """Load sales data for the current user from Postgres (direct SQL)."""
    try:
        user = session.get('sb_user')
        if not user:
            return []
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM sales WHERE user_id = %s ORDER BY timestamp DESC", (user['id'],))
        columns = [desc[0] for desc in cur.description]
        rows = [dict(zip(columns, row)) for row in cur.fetchall()]
        cur.close()
        conn.close()
        return rows
    except Exception as e:
        print(f"Error loading data from Postgres: {e}")
        return []

def filter_data_by_time(data, year=None, month=None, week=None, strict=False):
    """Filter data by time period with optional hierarchical fallback.

    Preference order for specificity: weekly > monthly > yearly.
    When strict=True, do not fall back; return only strictly matched entries
    (possibly empty) for the provided filters.
    """
    if not data:
        return data

    def week_from_day(day):
        try:
            d = int(day)
            return (d - 1) // 7 + 1
        except Exception:
            return None

    # Start with year filtering if provided
    filtered_by_year = data
    if year is not None:
        filtered_by_year = [e for e in data if e.get('year') == year]

    # Strict filtering first
    strict_filtered = filtered_by_year
    if month is not None:
        strict_filtered = [e for e in strict_filtered if e.get('month') == month]
    if week is not None:
        strict_filtered = [
            e for e in strict_filtered
            if (e.get('week') == week) or (e.get('day') is not None and week_from_day(e.get('day')) == week)
        ]

    # If strict mode, return as-is (may be empty)
    if strict:
        return strict_filtered

    if strict_filtered:
        return strict_filtered

    # Fallbacks when strict filtering produced no results
    if week is not None:
        # Fallback to monthly-level data for the month if available
        if month is not None:
            monthly = [
                e for e in filtered_by_year
                if e.get('month') == month and e.get('data_level') == 'monthly'
            ]
            if monthly:
                return monthly
        # Fallback to yearly-level data for the year
        if year is not None:
            yearly = [e for e in filtered_by_year if e.get('data_level') == 'yearly']
            if yearly:
                return yearly

    if month is not None:
        # Fallback to yearly-level if month-level data absent
        if year is not None:
            yearly = [e for e in filtered_by_year if e.get('data_level') == 'yearly']
            if yearly:
                return yearly

    # If only year provided or nothing matched, return year-filtered set (or original data)
    return filtered_by_year

def insert_data_entry(data_entry: dict):
    """Insert a single sales data entry into Postgres (direct SQL)."""
    try:
        user = session.get('sb_user')
        if not user:
            raise RuntimeError('Not authenticated')
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO sales (
                id, user_id, timestamp, week_date, data_level, year, month, week, day,
                rice_sold, rice_unsold, price_per_kg, population, avg_consumption,
                purchasing_power, competitors, customer_demand, predicted_demand,
                waste_percentage, total_revenue
            ) VALUES (
                %s, %s, now(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """,
            (
                data_entry.get('id'), user['id'], data_entry.get('week_date'), data_entry.get('data_level'),
                data_entry.get('year'), data_entry.get('month'), data_entry.get('week'), data_entry.get('day'),
                data_entry.get('rice_sold'), data_entry.get('rice_unsold'), data_entry.get('price_per_kg'),
                data_entry.get('population'), data_entry.get('avg_consumption'), data_entry.get('purchasing_power'),
                data_entry.get('competitors'), data_entry.get('customer_demand'), data_entry.get('predicted_demand'),
                data_entry.get('waste_percentage'), data_entry.get('total_revenue')
            )
        )
        conn.commit()
        cur.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error inserting data into Postgres: {e}")
        return False

def calculate_rice_demand(population, avg_consumption, purchasing_power, competitors):
    """Rice Demand Formula: (Population × Avg Consumption × Purchasing Power) ÷ (1 + Competitors)"""
    try:
        return (population * avg_consumption * purchasing_power) / (1 + competitors)
    except (ZeroDivisionError, TypeError):
        return 0

def calculate_waste_percentage(sold, unsold):
    """Calculate waste percentage"""
    try:
        total = sold + unsold
        return (unsold / total) * 100 if total > 0 else 0
    except (ZeroDivisionError, TypeError):
        return 0

def weeks_in_month(year, month):
    """Return the number of reporting weeks in a month (4 or 5)."""
    last_day = (datetime(int(year), int(month), 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
    return 5 if last_day.day >= 29 else 4

def calculate_trend_analysis(data):
    """Calculate trend analysis for rice sales and demand"""
    if len(data) < 2:
        return {"error": "Insufficient data for trend analysis"}
    
    # Helper: parse flexible date based on stored fields
    def parse_entry_datetime(entry):
        try:
            year = entry.get('year')
            month = entry.get('month')
            day = entry.get('day')
            week = entry.get('week')
            if year and month and day:
                return datetime(int(year), int(month), int(day))
            if year and month and week:
                # Approximate week as starting day of that week within month
                last_day = (datetime(int(year), int(month), 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                approx_day = min((int(week) - 1) * 7 + 1, last_day.day)
                return datetime(int(year), int(month), approx_day)
            if year and month:
                return datetime(int(year), int(month), 1)
            if year:
                return datetime(int(year), 1, 1)
            # Fallback to parsing known formats in week_date
            wd = entry.get('week_date', '')
            for fmt in ('%Y-%m-%d', '%Y-%m', '%Y'):
                try:
                    return datetime.strptime(wd, fmt)
                except Exception:
                    continue
            # Weekly pattern like YYYY-MM-Www
            if '-W' in wd:
                try:
                    ym, w = wd.split('-W')
                    y, m = ym.split('-')
                    y = int(y); m = int(m); w = int(w)
                    last_day = (datetime(y, m, 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                    approx_day = min((w - 1) * 7 + 1, last_day.day)
                    return datetime(y, m, approx_day)
                except Exception:
                    return None
        except Exception:
            return None
    
    # Sort by parsed date, fallback to earliest
    sorted_data = sorted(data, key=lambda x: parse_entry_datetime(x) or datetime.min)
    
    # Extract time series data
    weeks = [entry.get('week_date', '') for entry in sorted_data]
    sold_values = [entry.get('rice_sold', 0) for entry in sorted_data]
    unsold_values = [entry.get('rice_unsold', 0) for entry in sorted_data]
    prices = [entry.get('price_per_kg', 0) for entry in sorted_data]
    waste_percentages = [entry.get('waste_percentage', 0) for entry in sorted_data]
    
    # Calculate trends (simple linear regression)
    def calculate_trend(values):
        if len(values) < 2:
            return 0
        x = list(range(len(values)))
        y = values
        n = len(x)
        
        if n == 0:
            return 0
            
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))
        
        try:
            slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x ** 2)
            return slope
        except ZeroDivisionError:
            return 0
    
    trends = {
        "sales_trend": calculate_trend(sold_values),
        "unsold_trend": calculate_trend(unsold_values),
        "waste_trend": calculate_trend(waste_percentages),
        "price_trend": calculate_trend(prices),
        "efficiency_trend": calculate_trend([100 - w for w in waste_percentages]),
        # Expose labels for consumers that want to align charts with actual entry order
        "labels": weeks
    }
    
    # Calculate moving averages
    def moving_average(values, window=3):
        if len(values) < window:
            return values
        return [sum(values[i:i+window]) / window for i in range(len(values) - window + 1)]
    
    trends["sales_moving_avg"] = moving_average(sold_values)
    trends["waste_moving_avg"] = moving_average(waste_percentages)
    
    # Calculate seasonality (weekly patterns)
    weekly_patterns = defaultdict(list)
    for entry in data:
        # Prefer daily-level entries for day-of-week pattern
        if entry.get('day') and entry.get('month') and entry.get('year'):
            try:
                week_day = datetime(int(entry['year']), int(entry['month']), int(entry['day'])).strftime('%A')
                weekly_patterns[week_day].append(entry.get('rice_sold', 0))
            except Exception:
                continue
    trends["weekly_patterns"] = {
        day: statistics.mean(values) if values else 0 
        for day, values in weekly_patterns.items()
    }

    # Additionally, provide week-of-month patterns when users enter weekly data
    week_number_patterns = defaultdict(list)
    for entry in data:
        if entry.get('week') and entry.get('month') and entry.get('year'):
            try:
                week_number_patterns[int(entry['week'])].append(entry.get('rice_sold', 0))
            except Exception:
                continue
    if week_number_patterns:
        trends["week_of_month_patterns"] = {
            f"Week {wk}": statistics.mean(values) if values else 0
            for wk, values in sorted(week_number_patterns.items())
        }
    
    return trends

def calculate_correlation_analysis(data):
    """Calculate correlation between different variables"""
    if len(data) < 3:
        return {"error": "Insufficient data for correlation analysis"}
    
    # Extract variables, convert to float
    sold = [float(entry.get('rice_sold', 0)) for entry in data]
    unsold = [float(entry.get('rice_unsold', 0)) for entry in data]
    prices = [float(entry.get('price_per_kg', 0)) for entry in data]
    population = [float(entry.get('population', 0)) for entry in data]
    competitors = [float(entry.get('competitors', 0)) for entry in data]
    waste_percentages = [float(entry.get('waste_percentage', 0)) for entry in data]
    
    def correlation_coefficient(x, y):
        if len(x) != len(y) or len(x) < 2:
            return 0
        
        n = len(x)
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(x[i] * y[i] for i in range(n))
        sum_x2 = sum(x[i] ** 2 for i in range(n))
        sum_y2 = sum(y[i] ** 2 for i in range(n))
        
        try:
            numerator = n * sum_xy - sum_x * sum_y
            denominator = float(((n * sum_x2 - sum_x ** 2) * (n * sum_y2 - sum_y ** 2))) ** 0.5
            return numerator / denominator if denominator != 0 else 0
        except ZeroDivisionError:
            return 0
    
    correlations = {
        "price_vs_demand": correlation_coefficient(prices, sold),
        "population_vs_demand": correlation_coefficient(population, sold),
        "competition_vs_demand": correlation_coefficient(competitors, sold),
        "price_vs_waste": correlation_coefficient(prices, waste_percentages),
        "demand_vs_waste": correlation_coefficient(sold, waste_percentages)
    }
    
    # Interpret correlations
    def interpret_correlation(corr):
        if abs(corr) >= 0.7:
            strength = "Strong"
        elif abs(corr) >= 0.5:
            strength = "Moderate"
        elif abs(corr) >= 0.3:
            strength = "Weak"
        else:
            strength = "Very Weak"
        
        direction = "Positive" if corr > 0 else "Negative"
        return f"{strength} {direction}"
    
    correlations["interpretations"] = {
        key: interpret_correlation(value) for key, value in correlations.items()
    }
    
    return correlations

def calculate_market_comparison(data):
    """Compare performance across different market sizes based on population"""
    if not data:
        return {"error": "No data available for market comparison"}
    
    # Group by population ranges as proxy for market size
    market_groups = {
        "Small Market (<1000)": [],
        "Medium Market (1000-2000)": [],
        "Large Market (>2000)": []
    }
    
    for entry in data:
        pop = entry.get('population', 0)
        if pop < 1000:
            market_groups["Small Market (<1000)"].append(entry)
        elif pop < 2000:
            market_groups["Medium Market (1000-2000)"].append(entry)
        else:
            market_groups["Large Market (>2000)"].append(entry)
    
    comparison = {}
    for market_name, market_data in market_groups.items():
        if market_data:
            total_sold = sum(entry.get('rice_sold', 0) for entry in market_data)
            total_waste = sum(entry.get('rice_unsold', 0) for entry in market_data)
            avg_price = statistics.mean([entry.get('price_per_kg', 0) for entry in market_data])
            avg_waste_percentage = statistics.mean([entry.get('waste_percentage', 0) for entry in market_data])
            
            comparison[market_name] = {
                "total_sold": total_sold,
                "total_waste": total_waste,
                "avg_price": avg_price,
                "avg_waste_percentage": avg_waste_percentage,
                "efficiency_score": "Excellent" if avg_waste_percentage < 10 else "Good" if avg_waste_percentage < 20 else "Needs Improvement"
            }
    
    return comparison

def generate_ai_recommendations(data_entry, historical_data):
    """Generate AI-powered recommendations based on sales data and historical patterns"""
    recommendations = []
    
    # Normalize incoming values to float to avoid Decimal/float issues
    waste_percentage = float(data_entry.get('waste_percentage', 0) or 0)
    customer_demand = data_entry.get('customer_demand', '')
    competitors = float(data_entry.get('competitors', 0) or 0)
    price_per_kg = float(data_entry.get('price_per_kg', 0) or 0)
    
    # Historical analysis
    if historical_data:
        # Use floats because DB numeric types may come back as Decimal
        avg_waste = statistics.mean([float(entry.get('waste_percentage', 0) or 0) for entry in historical_data])
        avg_price = statistics.mean([float(entry.get('price_per_kg', 0) or 0) for entry in historical_data])
        avg_sold = statistics.mean([float(entry.get('rice_sold', 0) or 0) for entry in historical_data])
        
        # Waste-based recommendations with historical context
        if waste_percentage > avg_waste + 5:
            recommendations.append(f"Waste is {waste_percentage - avg_waste:.1f}% higher than average. Consider reducing next week's order by 15-20%")
        elif waste_percentage < avg_waste - 5:
            recommendations.append(f"Waste is {avg_waste - waste_percentage:.1f}% lower than average. You might be understocking. Consider increasing order by 10%")
        else:
            recommendations.append("Waste levels are within normal range. Maintain current ordering levels")
        
        # Price optimization recommendations
        if price_per_kg > avg_price * 1.1:
            recommendations.append("Price is significantly higher than average. Consider competitive pricing to increase sales")
        elif price_per_kg < avg_price * 0.9:
            recommendations.append("Price is lower than average. You might be underpricing. Consider increasing price by 5-10%")
    
    # Demand-based recommendations
    if customer_demand == "High":
        recommendations.append("High demand expected - consider increasing stock by 10-15% and maintaining competitive pricing")
    elif customer_demand == "Low":
        recommendations.append("Low demand period - reduce stock to minimize waste and consider promotional pricing")
    
    # Competition-based recommendations
    if competitors > 3:
        recommendations.append("High competition area - focus on competitive pricing, quality, and customer service")
    elif competitors < 2:
        recommendations.append("Low competition - you have pricing power. Consider optimizing for profit margins")
    
    # Seasonal recommendations (if we have enough data)
    if len(historical_data) >= 4:
        current_month = datetime.now().month
        # Robustly determine the month of an entry (supports daily/weekly/monthly/yearly)
        def _entry_month(entry):
            try:
                y = entry.get('year'); m = entry.get('month'); d = entry.get('day'); w = entry.get('week')
                if y and m and d:
                    return int(m)
                if y and m and w:
                    return int(m)
                if y and m:
                    return int(m)
                s = (entry.get('week_date', '') or '').strip()
                # Try common formats
                for fmt in ('%Y-%m-%d', '%Y-%m'):
                    try:
                        return datetime.strptime(s, fmt).month
                    except Exception:
                        continue
                # Weekly pattern like YYYY-MM-Www -> month is the MM
                if '-W' in s:
                    try:
                        ym, _wk = s.split('-W')
                        y2, m2 = ym.split('-')
                        return int(m2)
                    except Exception:
                        return None
            except Exception:
                return None
            return None
        seasonal_data = [entry for entry in historical_data if _entry_month(entry) == current_month]
        if seasonal_data:
            seasonal_avg = statistics.mean([float(entry.get('rice_sold', 0) or 0) for entry in seasonal_data])
            current_sold = float(data_entry.get('rice_sold', 0) or 0)
            if current_sold < seasonal_avg * 0.8:
                recommendations.append("Sales below seasonal average. Check if there are local events or holidays affecting demand")
    
    return recommendations

def validate_data_quality(data):
    """Validate data quality and completeness"""
    validation_results = {
        "total_records": len(data),
        "complete_records": 0,
        "incomplete_records": 0,
        "data_quality_score": 0,
        "issues": []
    }
    
    required_fields = ['week_date', 'rice_sold', 'rice_unsold', 'price_per_kg', 'population']
    
    for entry in data:
        is_complete = all(entry.get(field) is not None and entry.get(field) != '' for field in required_fields)
        if is_complete:
            validation_results["complete_records"] += 1
        else:
            validation_results["incomplete_records"] += 1
            missing_fields = [field for field in required_fields if entry.get(field) is None or entry.get(field) == '']
            validation_results["issues"].append(f"Record {entry.get('id', 'unknown')} missing: {', '.join(missing_fields)}")
    
    if validation_results["total_records"] > 0:
        validation_results["data_quality_score"] = (validation_results["complete_records"] / validation_results["total_records"]) * 100
    
    return validation_results

def to_serializable(val):
    if isinstance(val, decimal.Decimal):
        return float(val)
    if isinstance(val, datetime):
        return val.isoformat()
    if isinstance(val, dt.date):
        return val.isoformat()
    return val

def serialize_entry(entry):
    return {k: to_serializable(v) for k, v in entry.items()}

@app.route('/')
@login_required
def dashboard():
    """Main dashboard with statistics and charts"""
    user = session.get('sb_user')
    if user and user.get('role') == 'consumer':
        return redirect(url_for('consumer_dashboard'))
    return render_template('dashboard.html', user=user)

@app.route('/input')
@login_required
@role_required('retailer')
def data_input():
    """Data input form"""
    return render_template('data_input.html')

@app.route('/data_input', methods=['POST'])
@login_required
@role_required('retailer')
def submit_data():
    """Handle form submission with flexible time periods"""
    try:
        year = int(request.form['year'])
        month = request.form.get('month', '')  # Optional
        week = request.form.get('week', '')    # Optional
        day = request.form.get('day', '')      # Optional
        
        # Determine data level and create appropriate date representation
        if month and month != '':
            month = int(month)
            if week and week != '':
                week = int(week)
                # Clamp week into valid range for the month
                try:
                    max_weeks_for_month = weeks_in_month(year, month)
                    if week < 1:
                        week = 1
                    if week > max_weeks_for_month:
                        week = max_weeks_for_month
                except Exception:
                    pass
                if day and day != '':
                    day = int(day)
                    # Clamp day into valid range for the selected week within the month
                    try:
                        # Compute allowed day range for the selected week
                        days_in_month = (datetime(year, month, 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                        days_in_month = days_in_month.day
                        start_day = (int(week) - 1) * 7 + 1
                        end_day = min(int(week) * 7, days_in_month)
                        if day < start_day:
                            day = start_day
                        if day > end_day:
                            day = end_day
                    except Exception:
                        pass
                    # Daily data
                    week_date = datetime(year, month, day).strftime('%Y-%m-%d')
                    data_level = 'daily'
                    description = f"Day {day} of {month}/{year}"
                else:
                    # Weekly data
                    week_date = f"{year}-{month:02d}-W{week:02d}"
                    data_level = 'weekly'
                    description = f"Week {week} of {month}/{year}"
            else:
                # Monthly data
                week_date = f"{year}-{month:02d}"
                data_level = 'monthly'
                description = f"Month {month} of {year}"
        else:
            # Yearly data
            week_date = f"{year}"
            data_level = 'yearly'
            description = f"Year {year}"
        
        rice_sold = float(request.form['rice_sold'])
        rice_unsold = float(request.form['rice_unsold'])
        price_per_kg = float(request.form['price_per_kg'])
        population = int(request.form['population'])
        avg_consumption = float(request.form['avg_consumption'])
        purchasing_power = float(request.form['purchasing_power'])
        competitors = int(request.form['competitors'])
        customer_demand = request.form['customer_demand']
        
        # Calculate predicted demand using the rice demand model
        predicted_demand = calculate_rice_demand(population, avg_consumption, purchasing_power, competitors)
        
        # Calculate waste percentage
        waste_percentage = calculate_waste_percentage(rice_sold, rice_unsold)
        
        # Store data with flexible date information
        data_entry = {
            'id': str(uuid.uuid4()),
            'timestamp': datetime.now().isoformat(),
            'week_date': week_date,
            'data_level': data_level,
            'year': year,
            'month': month if month != '' else None,
            'week': week if week != '' else None,
            'day': day if day != '' else None,
            'rice_sold': rice_sold,
            'rice_unsold': rice_unsold,
            'price_per_kg': price_per_kg,
            'population': population,
            'avg_consumption': avg_consumption,
            'purchasing_power': purchasing_power,
            'competitors': competitors,
            'customer_demand': customer_demand,
            'predicted_demand': round(predicted_demand, 2),
            'waste_percentage': round(waste_percentage, 2),
            'total_revenue': round(rice_sold * price_per_kg, 2)
        }
        
        # Insert to Supabase
        ok = insert_data_entry(data_entry)
        print(f"Added new {data_level} entry: {description} - Sold: {data_entry['rice_sold']}kg, Unsold: {data_entry['rice_unsold']}kg (Supabase insert ok={ok})")
        
        flash(f'{data_level.capitalize()} data saved successfully!', 'success')
        return redirect(url_for('dashboard'))
        
    except Exception as e:
        flash(f'Error saving data: {str(e)}', 'error')
        return redirect(url_for('data_input'))

@app.route('/analytics')
@login_required
def analytics():
    """Analytics page with detailed charts"""
    return render_template('analytics.html')

@app.route('/history')
@login_required
def history():
    """History and progress overview page"""
    return render_template('history.html')

@app.route('/api/predict', methods=['POST'])
@login_required
def api_predict():
    """Calculate rice demand prediction for dashboard form"""
    try:
        payload = request.get_json(silent=True) or {}
        population = float(payload.get('population', 0) or 0)
        avg_consumption = float(payload.get('avgConsumption', 0) or 0)
        purchasing_power = float(payload.get('purchasingPower', 0) or 0)
        competitors = float(payload.get('competitors', 0) or 0)

        # Clamp to valid ranges
        if purchasing_power < 0:
            purchasing_power = 0.0
        if purchasing_power > 1:
            purchasing_power = 1.0
        if competitors < 0:
            competitors = 0.0

        predicted = calculate_rice_demand(population, avg_consumption, purchasing_power, competitors)

        # Optional: generate simple recommendations from historical data
        historical = load_data()
        # Include optional demand level if provided by the client
        demand_level = payload.get('demandLevel') or payload.get('customer_demand') or 'Medium'
        sample_data = {
            'competitors': int(competitors),
            'customer_demand': demand_level,
            # price_per_kg and waste_percentage omitted intentionally for dashboard prediction input
        }
        recs = generate_ai_recommendations(sample_data, historical) or []

        return jsonify({
            'predicted_demand': round(predicted, 2),
            'formula_used': '(Population × Avg Consumption × Purchasing Power) ÷ (1 + Competitors)',
            'recommendations': recs
        })
    except Exception as e:
        print('Error in /api/predict:', e)
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to calculate prediction'}), 400

@app.route('/api/progress', methods=['GET'])
@login_required
def get_progress():
    """Compute data entry progress for a given year across months and weeks.

    Fallback rules:
      - A monthly entry marks the entire month as 100% complete regardless of weekly data.
      - Weekly (or daily with corresponding week) entries contribute to month completion.
      - A yearly entry marks the entire year as 100% complete.
    """
    try:
        year = request.args.get('year', type=int)
        data = load_data()

        # Determine default year if not provided
        if year is None:
            years = sorted(list(set(e.get('year') for e in data if e.get('year') is not None)))
            year = years[-1] if years else datetime.now().year

        # Filter to selected year for efficiency
        year_entries = [e for e in data if e.get('year') == year]

        # Check for year-level shortcut
        has_year_entry = any(e.get('data_level') == 'yearly' for e in year_entries)

        month_names = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]

        months_info = []
        months_complete = 0
        weeks_present_year = 0
        weeks_total_year = 0
        for m in range(1, 13):
            month_entries = [e for e in year_entries if e.get('month') == m]
            monthly_present = any(e.get('data_level') == 'monthly' for e in month_entries)
            total_w = weeks_in_month(year, m)

            # Weeks present from weekly or daily entries
            weeks_present = set()
            for e in month_entries:
                w = e.get('week')
                if w is not None:
                    try:
                        weeks_present.add(int(w))
                    except Exception:
                        pass
                elif e.get('day') is not None:
                    try:
                        d = int(e.get('day'))
                        weeks_present.add((d - 1) // 7 + 1)
                    except Exception:
                        pass

            # If there is a monthly entry and no weekly/daily entries, treat all weeks as present.
            # If weekly/daily entries exist, progress is based strictly on those weeks.
            has_weekly_or_daily = len(weeks_present) > 0
            valid_weeks = {w for w in weeks_present if 1 <= int(w) <= int(total_w)}
            if monthly_present and not has_weekly_or_daily:
                valid_weeks = set(range(1, int(total_w) + 1))

            is_complete = len(valid_weeks) >= int(total_w)
            progress = int(round((len(valid_weeks) / total_w) * 100)) if int(total_w) > 0 else 0

            # Accumulate year-level week coverage
            weeks_total_year += int(total_w)
            weeks_present_year += len(valid_weeks)

            if is_complete:
                months_complete += 1

            months_info.append({
                'month': m,
                'label': month_names[m - 1],
                'complete': is_complete,
                'progress': progress,
                'weeks_present': sorted(list(valid_weeks)),
                'total_weeks': total_w,
                'records': len(month_entries)
            })

        year_complete = has_year_entry or (months_complete == 12)
        # Year progress is based on total weeks covered across all months for better granularity
        year_progress = 100 if has_year_entry else (
            int(round((weeks_present_year / weeks_total_year) * 100)) if weeks_total_year > 0 else 0
        )

        return jsonify({
            'year': year,
            'year_progress': year_progress,
            'year_complete': year_complete,
            'months': months_info,
            'has_year_entry': has_year_entry
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/sales', methods=['GET'])
@login_required
def get_sales_data():
    """Get all sales data"""
    try:
        data = load_data()
        # Allow optional filter by year
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        week = request.args.get('week', type=int)
        strict = bool(request.args.get('strict', default=0, type=int))
        if year is not None or month is not None or week is not None:
            data = filter_data_by_time(data, year, month, week, strict=strict)
        # Ensure JSON serializable output
        data = [serialize_entry(e) for e in data]
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/analytics', methods=['GET'])
@login_required
def get_analytics():
    """Get analytics summary"""
    start_ts = time.perf_counter()
    # Defaults to avoid NameError in finally
    year = month = week = None
    period = None
    strict = 0
    entries_count = 0
    try:
        # Get time filter parameters
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        week = request.args.get('week', type=int)
        period = request.args.get('period', type=str)  # optional aggregation hint: week|month|year
        strict = bool(request.args.get('strict', default=0, type=int))
        
        sales_data = load_data()
        
        # Apply time filtering
        if year is not None or month is not None or week is not None:
            sales_data = filter_data_by_time(sales_data, year, month, week, strict=strict)
        
        if not sales_data:
            return jsonify({
                "total_entries": 0,
                "total_sold": 0,
                "total_revenue": 0,
                "total_waste": 0,
                "avg_price": 0,
                "efficiency_score": "No data",
                "waste_percentage": 0,
                "chart_data": []
            })
        
        # Calculate totals
        total_sold = sum(float(entry.get('rice_sold', 0)) for entry in sales_data)
        total_waste = sum(float(entry.get('rice_unsold', 0)) for entry in sales_data)
        total_revenue = sum(float(entry.get('total_revenue', 0)) for entry in sales_data)
        avg_price = sum(float(entry.get('price_per_kg', 0)) for entry in sales_data) / len(sales_data)
        entries_count = len(sales_data)
        
        # Calculate efficiency score
        overall_waste_percentage = calculate_waste_percentage(total_sold, total_waste)
        if overall_waste_percentage < 10:
            efficiency_score = "Excellent"
        elif overall_waste_percentage < 20:
            efficiency_score = "Good"
        else:
            efficiency_score = "Needs Improvement"
        
        # Prepare chart data with optional aggregation granularity
        def aggregate(entries, period_key: str):
            buckets = {}
            for e in entries:
                if period_key == 'year':
                    label = str(e.get('year') or 'Unknown')
                elif period_key == 'month':
                    y = e.get('year'); m = e.get('month')
                    label = f"{y}-{int(m):02d}" if y and m else e.get('week_date', '')
                else:
                    label = e.get('week_date', '')
                if label not in buckets:
                    buckets[label] = {
                        'sold': 0.0,
                        'unsold': 0.0,
                        'revenue': 0.0,
                        'price_sum': 0.0,
                        'price_count': 0,
                    }
                b = buckets[label]
                b['sold'] += float(e.get('rice_sold', 0) or 0)
                b['unsold'] += float(e.get('rice_unsold', 0) or 0)
                b['revenue'] += float(e.get('total_revenue', 0) or 0)
                price = float(e.get('price_per_kg', 0) or 0)
                if price:
                    b['price_sum'] += price
                    b['price_count'] += 1
            def sort_key(label):
                try:
                    if period_key == 'year':
                        return int(label)
                    if period_key == 'month':
                        y, m = label.split('-')
                        return (int(y), int(m))
                except Exception:
                    pass
                return label
            result = []
            for label, b in sorted(buckets.items(), key=lambda kv: sort_key(kv[0])):
                total = b['sold'] + b['unsold']
                waste_pct = (b['unsold'] / total * 100) if total > 0 else 0
                avg_price_ = (b['price_sum'] / b['price_count']) if b['price_count'] > 0 else 0
                result.append({
                    'week': label,
                    'sold': round(b['sold'], 2),
                    'unsold': round(b['unsold'], 2),
                    'revenue': round(b['revenue'], 2),
                    'price': round(avg_price_, 2),
                    'waste_percentage': round(waste_pct, 2),
                })
            return result
        
        if period in ('year', 'month'):
            chart_data = aggregate(sales_data, period)
        else:
            chart_data = aggregate(sales_data, 'week')
        
        # Serialize all entries for chart_data if needed
        chart_data = [serialize_entry(d) for d in chart_data]
        
        return jsonify({
            "total_entries": entries_count,
            "total_sold": round(total_sold, 2),
            "total_revenue": round(total_revenue, 2),
            "total_waste": round(total_waste, 2),
            "avg_price": round(avg_price, 2),
            "efficiency_score": efficiency_score,
            "waste_percentage": round(overall_waste_percentage, 2),
            "chart_data": chart_data
        })
        
    except Exception as e:
        print('Error in /api/analytics:', e)
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 400
    finally:
        try:
            duration_ms = (time.perf_counter() - start_ts) * 1000.0
            print(f"[TIMING] /api/analytics duration_ms={duration_ms:.1f} params year={year} month={month} week={week} strict={strict} period={period} entries={entries_count}")
        except Exception:
            pass

@app.route('/api/trends', methods=['GET'])
@login_required
def get_trend_analysis():
    """Get trend analysis data"""
    try:
        # Get time filter parameters
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        week = request.args.get('week', type=int)
        strict = bool(request.args.get('strict', default=0, type=int))
        
        sales_data = load_data()
        # Apply time filtering
        if year is not None or month is not None or week is not None:
            sales_data = filter_data_by_time(sales_data, year, month, week, strict=strict)
        trends = calculate_trend_analysis(sales_data)
        # --- PATCH: Ensure moving averages are lists of floats, not strings ---
        if 'sales_moving_avg' in trends:
            trends['sales_moving_avg'] = [float(x) for x in trends['sales_moving_avg']]
        if 'waste_moving_avg' in trends:
            trends['waste_moving_avg'] = [float(x) for x in trends['waste_moving_avg']]
        # Serialize all values in trends dict
        trends = {k: to_serializable(v) if not isinstance(v, dict) else {ik: to_serializable(iv) for ik, iv in v.items()} for k, v in trends.items()}
        return jsonify(trends)
    except Exception as e:
        print('Error in /api/trends:', e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400

@app.route('/api/correlations', methods=['GET'])
@login_required
def get_correlation_analysis():
    """Get correlation analysis data"""
    start_ts = time.perf_counter()
    year = month = week = None
    strict = 0
    entries_count = 0
    try:
        # Get time filter parameters
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        week = request.args.get('week', type=int)
        strict = bool(request.args.get('strict', default=0, type=int))
        
        sales_data = load_data()
        # Apply time filtering
        if year is not None or month is not None or week is not None:
            sales_data = filter_data_by_time(sales_data, year, month, week, strict=strict)
        entries_count = len(sales_data) if sales_data else 0
        correlations = calculate_correlation_analysis(sales_data)
        # Serialize all values in correlations dict
        correlations = {k: to_serializable(v) if not isinstance(v, dict) else {ik: to_serializable(iv) for ik, iv in v.items()} for k, v in correlations.items()}
        return jsonify(correlations)
    except Exception as e:
        print('Error in /api/correlations:', e)
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400
    finally:
        try:
            duration_ms = (time.perf_counter() - start_ts) * 1000.0
            print(f"[TIMING] /api/correlations duration_ms={duration_ms:.1f} params year={year} month={month} week={week} strict={strict} entries={entries_count}")
        except Exception:
            pass

@app.route('/api/market-comparison', methods=['GET'])
@login_required
def get_market_comparison():
    """Get market comparison data"""
    try:
        # Get time filter parameters
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        week = request.args.get('week', type=int)
        strict = bool(request.args.get('strict', default=0, type=int))
        
        sales_data = load_data()
        
        # Apply time filtering
        if year is not None or month is not None or week is not None:
            sales_data = filter_data_by_time(sales_data, year, month, week, strict=strict)
        
        comparison = calculate_market_comparison(sales_data)
        # Ensure JSON serializable nested values
        serial = {k: {ik: to_serializable(iv) for ik, iv in v.items()} for k, v in comparison.items()}
        return jsonify(serial)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/data-quality', methods=['GET'])
@login_required
def get_data_quality():
    """Get data quality validation results"""
    try:
        # Get time filter parameters
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)
        week = request.args.get('week', type=int)
        strict = bool(request.args.get('strict', default=0, type=int))
        
        sales_data = load_data()
        
        # Apply time filtering
        if year is not None or month is not None or week is not None:
            sales_data = filter_data_by_time(sales_data, year, month, week, strict=strict)
        
        quality = validate_data_quality(sales_data)
        return jsonify(quality)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/forecast', methods=['POST'])
@login_required
def generate_forecast():
    """Generate demand forecast based on historical data and trends"""
    try:
        data = request.json
        forecast_weeks = data.get('weeks', 4)  # Default to 4 weeks
        
        sales_data = load_data()
        if len(sales_data) < 2:
            return jsonify({"error": "Insufficient historical data for forecasting"})
        
        # Calculate trends
        trends = calculate_trend_analysis(sales_data)
        
        # Get latest data point
        latest_data = max(sales_data, key=lambda x: x.get('timestamp', '') or x.get('week_date', ''))
        
        # Determine a usable datetime for the latest entry (supports daily/weekly/monthly/yearly)
        def _parse_entry_date(entry):
            try:
                y = entry.get('year'); m = entry.get('month'); d = entry.get('day'); w = entry.get('week')
                if y and m and d:
                    return datetime(int(y), int(m), int(d))
                if y and m and w:
                    last_day = (datetime(int(y), int(m), 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                    approx_day = min((int(w) - 1) * 7 + 1, last_day.day)
                    return datetime(int(y), int(m), approx_day)
                if y and m:
                    return datetime(int(y), int(m), 1)
                if y:
                    return datetime(int(y), 1, 1)
                s = entry.get('week_date', '')
                for fmt in ('%Y-%m-%d', '%Y-%m', '%Y'):
                    try:
                        return datetime.strptime(s, fmt)
                    except Exception:
                        continue
                if '-W' in s:
                    try:
                        ym, wk = s.split('-W'); yy, mm = ym.split('-')
                        yy = int(yy); mm = int(mm); wk = int(wk)
                        last_day = (datetime(yy, mm, 1) + timedelta(days=32)).replace(day=1) - timedelta(days=1)
                        approx_day = min((wk - 1) * 7 + 1, last_day.day)
                        return datetime(yy, mm, approx_day)
                    except Exception:
                        pass
            except Exception:
                pass
            return datetime.now()
        
        # Generate forecast
        forecast = []
        current_date = _parse_entry_date(latest_data)
        
        # Use sales and unsold trends (kg), not waste% slope, for projection
        sales_trend = trends.get('sales_trend', 0) or 0
        unsold_trend = trends.get('unsold_trend', 0) or 0
        
        for week in range(1, forecast_weeks + 1):
            forecast_date = current_date + timedelta(weeks=week)
            
            # Simple trend-based forecast
            forecast_sold = max(0, (latest_data.get('rice_sold', 0) or 0) + (sales_trend * week))
            forecast_unsold = max(0, (latest_data.get('rice_unsold', 0) or 0) + (unsold_trend * week))
            
            forecast.append({
                "week": forecast_date.strftime('%Y-%m-%d'),
                "predicted_sold": round(forecast_sold, 2),
                "predicted_unsold": round(forecast_unsold, 2),
                "predicted_waste_percentage": round(calculate_waste_percentage(forecast_sold, forecast_unsold), 2),
                "confidence_level": "High" if len(sales_data) >= 8 else "Medium" if len(sales_data) >= 4 else "Low"
            })
        
        return jsonify({
            "forecast": forecast,
            "trends": trends,
            "last_updated": latest_data.get('week_date', ''),
            "forecast_method": "Trend-based linear projection"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/available-years', methods=['GET'])
@login_required
def get_available_years():
    """Get list of available years in the dataset"""
    try:
        sales_data = load_data()
        if not sales_data:
            return jsonify({"years": []})
        
        # Extract unique years
        years = sorted(list(set(entry.get('year') for entry in sales_data if entry.get('year'))))
        return jsonify({"years": years})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/defaults', methods=['GET'])
@login_required
def get_defaults():
    """Return last known Market Analysis and Demand fields for a given period.

    Optional query params:
      - year: int
      - month: int (1-12)
    Falls back to latest available record if none match.
    """
    try:
        year = request.args.get('year', type=int)
        month = request.args.get('month', type=int)

        sales_data = load_data()
        if not sales_data:
            return jsonify({
                "population": None,
                "avg_consumption": None,
                "purchasing_power": None,
                "competitors": None,
                "customer_demand": None
            })

        candidates = sales_data
        if year is not None:
            candidates = [e for e in candidates if e.get('year') == year]
        if month is not None:
            candidates = [e for e in candidates if e.get('month') == month]

        # If no candidates after filtering, fall back to any
        if not candidates:
            candidates = sales_data

        # Pick the latest by timestamp
        latest = max(
            candidates,
            key=lambda x: x.get('timestamp', '')
        )

        return jsonify({
            "population": to_serializable(latest.get('population')),
            "avg_consumption": to_serializable(latest.get('avg_consumption')),
            "purchasing_power": to_serializable(latest.get('purchasing_power')),
            "competitors": to_serializable(latest.get('competitors')),
            "customer_demand": latest.get('customer_demand')
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/sales/<sales_id>', methods=['DELETE'])
@login_required
def delete_sales_data(sales_id):
    """Delete a sales data entry"""
    try:
        user = session.get('sb_user')
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM sales WHERE id = %s AND user_id = %s", (sales_id, user['id']))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Sales data deleted successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------------------
# Retailer Inventory Endpoints
# ---------------------------
@app.route('/api/retailer/inventory', methods=['GET'])
@login_required
@role_required('retailer')
def retailer_inventory_list():
    """List current retailer's inventory with optional filters."""
    try:
        user = session.get('sb_user')
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        params = [user['id']]
        where = ["retailer_id = %s"]
        date_exact = request.args.get('date')  # YYYY-MM-DD
        date_from = request.args.get('from')
        date_to = request.args.get('to')
        variety = request.args.get('variety')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        if date_exact:
            where.append("date_posted = %s")
            params.append(date_exact)
        else:
            if date_from:
                where.append("date_posted >= %s")
                params.append(date_from)
            if date_to:
                where.append("date_posted <= %s")
                params.append(date_to)
        if variety:
            where.append("LOWER(rice_variety) LIKE %s")
            params.append(f"%{variety.lower()}%")
        if min_price is not None:
            where.append("price_per_kg >= %s")
            params.append(min_price)
        if max_price is not None:
            where.append("price_per_kg <= %s")
            params.append(max_price)
        sql = (
            "SELECT id, retailer_id, date_posted, rice_variety, stock_kg, price_per_kg, created_at "
            "FROM retailer_inventory WHERE " + " AND ".join(where) + " ORDER BY date_posted DESC, created_at DESC"
        )
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(sql, tuple(params))
        columns = [d[0] for d in cur.description]
        rows = [dict(zip(columns, r)) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify([serialize_entry(r) for r in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/retailer/inventory', methods=['POST'])
@login_required
@role_required('retailer')
def retailer_inventory_create():
    """Create a new inventory entry for the current retailer."""
    try:
        user = session.get('sb_user')
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
        data = request.get_json(force=True) if request.is_json else request.form
        rice_variety = (data.get('rice_variety') or '').strip() or None
        stock_kg = data.get('stock_kg')
        price_per_kg = data.get('price_per_kg')
        date_posted = data.get('date_posted')  # optional YYYY-MM-DD
        if stock_kg is None or price_per_kg is None:
            return jsonify({"error": "stock_kg and price_per_kg are required"}), 400
        try:
            stock_kg = float(stock_kg)
            price_per_kg = float(price_per_kg)
        except Exception:
            return jsonify({"error": "stock_kg and price_per_kg must be numeric"}), 400
        inv_id = str(uuid.uuid4())
        conn = get_db_connection()
        cur = conn.cursor()
        if date_posted:
            cur.execute(
                """
                INSERT INTO retailer_inventory (id, retailer_id, date_posted, rice_variety, stock_kg, price_per_kg, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, now())
                """,
                (inv_id, user['id'], date_posted, rice_variety, stock_kg, price_per_kg)
            )
        else:
            cur.execute(
                """
                INSERT INTO retailer_inventory (id, retailer_id, rice_variety, stock_kg, price_per_kg, created_at)
                VALUES (%s, %s, %s, %s, %s, now())
                """,
                (inv_id, user['id'], rice_variety, stock_kg, price_per_kg)
            )
        conn.commit()
        cur.execute("SELECT id, retailer_id, date_posted, rice_variety, stock_kg, price_per_kg, created_at FROM retailer_inventory WHERE id = %s", (inv_id,))
        columns = [d[0] for d in cur.description]
        row = dict(zip(columns, cur.fetchone()))
        cur.close()
        conn.close()
        return jsonify(serialize_entry(row)), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/retailer/inventory/<inv_id>', methods=['GET'])
@login_required
@role_required('retailer')
def retailer_inventory_get(inv_id):
    """Get a single inventory entry for the current retailer."""
    try:
        user = session.get('sb_user')
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, retailer_id, date_posted, rice_variety, stock_kg, price_per_kg, created_at FROM retailer_inventory WHERE id = %s AND retailer_id = %s",
            (inv_id, user['id'])
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return jsonify({"error": "Not found"}), 404
        cols = ['id','retailer_id','date_posted','rice_variety','stock_kg','price_per_kg','created_at']
        return jsonify(serialize_entry(dict(zip(cols, row))))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/retailer/inventory/<inv_id>', methods=['PUT','PATCH'])
@login_required
@role_required('retailer')
def retailer_inventory_update(inv_id):
    """Update an existing inventory entry for the current retailer."""
    try:
        user = session.get('sb_user')
        data = request.get_json(force=True)
        fields = []
        values = []
        if data.get('date_posted'):
            fields.append('date_posted = %s')
            values.append(data.get('date_posted'))
        if 'rice_variety' in data:
            fields.append('rice_variety = %s')
            values.append((data.get('rice_variety') or '').strip() or None)
        if 'stock_kg' in data:
            try:
                values.append(float(data.get('stock_kg')))
                fields.append('stock_kg = %s')
            except Exception:
                return jsonify({"error": "stock_kg must be numeric"}), 400
        if 'price_per_kg' in data:
            try:
                values.append(float(data.get('price_per_kg')))
                fields.append('price_per_kg = %s')
            except Exception:
                return jsonify({"error": "price_per_kg must be numeric"}), 400
        if not fields:
            return jsonify({"error": "No updatable fields provided"}), 400
        values.extend([inv_id, user['id']])
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(f"UPDATE retailer_inventory SET {', '.join(fields)} WHERE id = %s AND retailer_id = %s", tuple(values))
        if cur.rowcount == 0:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({"error": "Not found"}), 404
        conn.commit()
        cur.execute("SELECT id, retailer_id, date_posted, rice_variety, stock_kg, price_per_kg, created_at FROM retailer_inventory WHERE id = %s", (inv_id,))
        columns = [d[0] for d in cur.description]
        row = dict(zip(columns, cur.fetchone()))
        cur.close()
        conn.close()
        return jsonify(serialize_entry(row))
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/retailer/inventory/<inv_id>', methods=['DELETE'])
@login_required
@role_required('retailer')
def retailer_inventory_delete(inv_id):
    """Delete an inventory entry belonging to the current retailer."""
    try:
        user = session.get('sb_user')
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("DELETE FROM retailer_inventory WHERE id = %s AND retailer_id = %s", (inv_id, user['id']))
        if cur.rowcount == 0:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({"error": "Not found"}), 404
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Inventory item deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ---------------------------
# Consumer Inventory Browse
# ---------------------------
@app.route('/api/inventory', methods=['GET'])
@login_required
@role_required('consumer')
def consumer_inventory_browse():
    """Browse live inventory across retailers.
    Query params:
      - latest: 1|0 (default 1) -> latest per retailer/variety
      - date: YYYY-MM-DD (when latest=0, default = today)
      - variety: text contains
      - area: text contains (from profiles.retailer_area)
      - min_price, max_price: numeric filters
    """
    try:
        latest = bool(request.args.get('latest', default=1, type=int))
        date_exact = request.args.get('date')
        variety = request.args.get('variety')
        area = request.args.get('area')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        retailer_id_filter = request.args.get('retailer_id')
        conn = get_db_connection()
        cur = conn.cursor()
        if latest:
            sql = (
                """
                SELECT DISTINCT ON (ri.retailer_id, COALESCE(ri.rice_variety, ''))
                    ri.id, ri.retailer_id, ri.date_posted, ri.rice_variety, ri.stock_kg, ri.price_per_kg, ri.created_at,
                    p.retailer_company, p.retailer_area, p.retailer_location
                FROM retailer_inventory ri
                JOIN profiles p ON p.id = ri.retailer_id
                """
            )
            where = []
            params = []
            if variety:
                where.append("LOWER(ri.rice_variety) LIKE %s")
                params.append(f"%{variety.lower()}%")
            if area:
                where.append("LOWER(p.retailer_area) LIKE %s")
                params.append(f"%{area.lower()}%")
            if min_price is not None:
                where.append("ri.price_per_kg >= %s")
                params.append(min_price)
            if max_price is not None:
                where.append("ri.price_per_kg <= %s")
                params.append(max_price)
            if retailer_id_filter:
                where.append("ri.retailer_id = %s")
                params.append(retailer_id_filter)
            if date_exact:
                where.append("ri.date_posted = %s")
                params.append(date_exact)
            if where:
                sql += " WHERE " + " AND ".join(where)
            sql += " ORDER BY ri.retailer_id, COALESCE(ri.rice_variety, ''), ri.date_posted DESC, ri.created_at DESC"
            cur.execute(sql, tuple(params))
        else:
            sql = (
                """
                SELECT ri.id, ri.retailer_id, ri.date_posted, ri.rice_variety, ri.stock_kg, ri.price_per_kg, ri.created_at,
                       p.retailer_company, p.retailer_area, p.retailer_location
                FROM retailer_inventory ri
                JOIN profiles p ON p.id = ri.retailer_id
                """
            )
            where = []
            params = []
            if date_exact:
                where.append("ri.date_posted = %s")
                params.append(date_exact)
            else:
                where.append("ri.date_posted = current_date")
            if variety:
                where.append("LOWER(ri.rice_variety) LIKE %s")
                params.append(f"%{variety.lower()}%")
            if area:
                where.append("LOWER(p.retailer_area) LIKE %s")
                params.append(f"%{area.lower()}%")
            if min_price is not None:
                where.append("ri.price_per_kg >= %s")
                params.append(min_price)
            if max_price is not None:
                where.append("ri.price_per_kg <= %s")
                params.append(max_price)
            if retailer_id_filter:
                where.append("ri.retailer_id = %s")
                params.append(retailer_id_filter)
            if where:
                sql += " WHERE " + " AND ".join(where)
            sql += " ORDER BY ri.date_posted DESC, ri.created_at DESC"
            cur.execute(sql, tuple(params))
        columns = [d[0] for d in cur.description]
        rows = [dict(zip(columns, r)) for r in cur.fetchall()]
        cur.close()
        conn.close()
        return jsonify([serialize_entry(r) for r in rows])
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/company/<retailer_id>', methods=['GET'])
@login_required
def api_company_profile(retailer_id):
    """Fetch basic retailer profile info for a company page."""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT id, retailer_company, retailer_area, retailer_location
            FROM profiles
            WHERE id = %s AND (role = 'retailer' OR role IS NULL)
            """,
            (retailer_id,)
        )
        row = cur.fetchone()
        cur.close()
        conn.close()
        if not row:
            return jsonify({"error": "Company not found"}), 404
        return jsonify({
            "id": row[0],
            "retailer_company": row[1],
            "retailer_area": row[2],
            "retailer_location": row[3],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/login', methods=['GET', 'POST'])
def login():
    # If already authenticated, go to dashboard
    if request.method == 'GET' and session.get('sb_user'):
        user = session.get('sb_user')
        if user and user.get('role') == 'consumer':
            return redirect(url_for('consumer_dashboard'))
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email_raw = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("SELECT id, email, password_hash, first_name, last_name, role, retailer_company, retailer_area, retailer_location FROM profiles WHERE email = %s", (email_raw,))
            user = cur.fetchone()
            cur.close()
            conn.close()
            if not user or not check_password_hash(user[2], password):
                flash('Invalid email or password', 'error')
                return redirect(url_for('login'))
            user_obj = {
                'id': user[0],
                'email': user[1],
                'first_name': user[3],
                'last_name': user[4],
                'role': user[5] or 'consumer',
                'retailer_company': user[6],
                'retailer_area': user[7],
                'retailer_location': user[8],
            }
            session['sb_user'] = user_obj
            flash('Logged in successfully', 'success')
            next_url = request.args.get('next')
            if not next_url:
                if user_obj.get('role') == 'consumer':
                    next_url = url_for('consumer_dashboard')
                else:
                    next_url = url_for('dashboard')
            return redirect(next_url)
        except Exception as e:
            print(f"[login] Login failed for {email_raw}: {e}")
            flash(f'Login failed: {e}', 'error')
    # Discover images in the local `image/` folder for the login carousel
    try:
        image_dir = os.path.join(os.path.dirname(__file__), 'image')
        carousel_images = []
        if os.path.isdir(image_dir):
            for name in sorted(os.listdir(image_dir)):
                lower = name.lower()
                if lower.endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
                    carousel_images.append(name)
    except Exception:
        carousel_images = []
    return render_template('login.html', carousel_images=carousel_images)

@app.route('/register', methods=['GET', 'POST'])
def register():
    # If already authenticated, go to dashboard
    if request.method == 'GET' and session.get('sb_user'):
        user = session.get('sb_user')
        if user and user.get('role') == 'consumer':
            return redirect(url_for('consumer_dashboard'))
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email_raw = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        role = (request.form.get('role') or 'consumer').strip().lower()
        if role not in ('consumer', 'retailer'):
            role = 'consumer'
        retailer_company = request.form.get('retailer_company')
        retailer_area = request.form.get('retailer_area')
        retailer_location = request.form.get('retailer_location')
        if role == 'retailer':
            # Basic validation for retailer-specific fields
            missing = []
            if not retailer_company or retailer_company.strip() == '':
                missing.append('Company name')
            if not retailer_area or retailer_area.strip() == '':
                missing.append('Area')
            if not retailer_location or retailer_location.strip() == '':
                missing.append('Location')
            if missing:
                flash('Missing required retailer fields: ' + ', '.join(missing), 'error')
                return redirect(url_for('register'))
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            # Check for duplicate email
            cur.execute("SELECT id FROM profiles WHERE email = %s", (email_raw,))
            if cur.fetchone():
                flash('Email already registered', 'error')
                cur.close()
                conn.close()
                return redirect(url_for('register'))
            user_id = str(uuid.uuid4())
            password_hash = generate_password_hash(password)
            cur.execute(
                """
                INSERT INTO profiles (
                    id, first_name, last_name, email, password_hash, role,
                    retailer_company, retailer_area, retailer_location,
                    created_at, updated_at
                ) VALUES (
                    %s, %s, %s, %s, %s, %s,
                    %s, %s, %s,
                    now(), now()
                )
                """,
                (
                    user_id, first_name, last_name, email_raw, password_hash, role,
                    retailer_company if role == 'retailer' else None,
                    retailer_area if role == 'retailer' else None,
                    retailer_location if role == 'retailer' else None,
                )
            )
            conn.commit()
            cur.close()
            conn.close()
            # Do not auto-login; require explicit login after registration
            flash('Account created successfully. Please log in.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            print(f"[register] Registration failed for {email_raw}: {e}")
            flash(f'Registration failed: {e}', 'error')
    try:
        image_dir = os.path.join(os.path.dirname(__file__), 'image')
        carousel_images = []
        if os.path.isdir(image_dir):
            for name in sorted(os.listdir(image_dir)):
                lower = name.lower()
                if lower.endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
                    carousel_images.append(name)
    except Exception:
        carousel_images = []
    return render_template('register.html', carousel_images=carousel_images)

@app.route('/image/<path:filename>')
def serve_image(filename: str):
    """Serve files from the `image/` directory so they can be used in templates."""
    return send_from_directory('image', filename)

@app.route('/consumer')
@login_required
def consumer_dashboard():
    user = session.get('sb_user')
    if user and user.get('role') == 'retailer':
        return redirect(url_for('dashboard'))
    return render_template('consumer_dashboard.html', user=user)

@app.route('/company/<retailer_id>')
@login_required
def company_page(retailer_id):
    """Company detail page for consumers to view retailer-specific inventory and stats."""
    user = session.get('sb_user')
    # Retailers can be redirected to their dashboard or allowed; here we allow view for simplicity
    return render_template('company.html', retailer_id=retailer_id, user=user)

@app.route('/logout')
def logout():
    try:
        client = get_supabase_client()
        try:
            client.auth.sign_out()
        except Exception:
            pass
    finally:
        session.pop('sb_access_token', None)
        session.pop('sb_refresh_token', None)
        session.pop('sb_user', None)
    flash('Logged out', 'success')
    return redirect(url_for('login'))

DATABASE_URL = os.getenv("SUPABASE_DB_URL")  # Set this in your environment or .env file

def get_db_connection():
    if not DATABASE_URL or not DATABASE_URL.strip():
        raise RuntimeError("SUPABASE_DB_URL is not set. Create a .env with SUPABASE_DB_URL=postgresql://user:pass@host:port/db")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"[DB] Connection failed: {e}")
        raise

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
