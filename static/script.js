let salesChartInstance = null;
let wasteChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
  // Set default date to current Monday for convenience
  const dateInput = document.getElementById("week_date")
  if (dateInput) {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    dateInput.value = monday.toISOString().split("T")[0]
  }

  // Mobile menu toggle
  const navToggle = document.getElementById("navToggle")
  const navMenu = document.getElementById("navMenu")

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active")
    })
  }

  // Form validation helpers
  const forms = document.querySelectorAll("form")
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      const requiredFields = form.querySelectorAll("[required]")
      let isValid = true

      requiredFields.forEach((field) => {
        if (!field.value.trim()) {
          isValid = false
          field.classList.add("error")
        } else {
          field.classList.remove("error")
        }
      })

      if (!isValid) {
        e.preventDefault()
        alert("Please fill in all required fields")
      }
    })
  })

  // Auto-calculate waste percentage preview
  const riceSoldInput = document.getElementById("rice_sold")
  const riceUnsoldInput = document.getElementById("rice_unsold")
  const wastePreview = document.getElementById("wastePreview")
  const wasteText = document.getElementById("wasteText")

  if (riceSoldInput && riceUnsoldInput && wastePreview && wasteText) {
    const calculateWastePreview = () => {
      const sold = Number.parseFloat(riceSoldInput.value) || 0
      const unsold = Number.parseFloat(riceUnsoldInput.value) || 0
      const total = sold + unsold

      if (total > 0) {
        const wastePercentage = ((unsold / total) * 100).toFixed(1)
        const priceInput = document.getElementById("price_per_kg")
        const revenue = sold * (Number.parseFloat(priceInput ? priceInput.value : 0) || 0)

        wasteText.innerHTML = `
          <strong>Waste Percentage:</strong> ${wastePercentage}%<br>
          <strong>Total Stock:</strong> ${total.toFixed(1)} kg<br>
          <strong>Estimated Revenue:</strong> ₱${revenue.toFixed(2)}
        `
        wastePreview.style.display = "block"
      } else {
        wastePreview.style.display = "none"
      }
    }

    riceSoldInput.addEventListener("input", calculateWastePreview)
    riceUnsoldInput.addEventListener("input", calculateWastePreview)
    const priceInput = document.getElementById("price_per_kg")
    if (priceInput) {
      priceInput.addEventListener("input", calculateWastePreview)
    }
  }

  // Load dashboard data
  if (window.location.pathname === "/" || window.location.pathname.includes("dashboard")) {
    // If dashboard has filters, wire them up
    const yearSel = document.getElementById('dashboardYear')
    const monthSel = document.getElementById('dashboardMonth')
    const periodSel = document.getElementById('dashboardPeriod')
    const applyBtn = document.getElementById('dashboardApply')
    const resetBtn = document.getElementById('dashboardReset')

    const refresh = () => {
      const params = new URLSearchParams()
      if (yearSel && yearSel.value) params.append('year', yearSel.value)
      if (monthSel && monthSel.value) {
        params.append('month', monthSel.value)
        // Enforce strict filter when a specific month is chosen to avoid fallback totals
        params.append('strict', '1')
      }
      if (periodSel && periodSel.value) params.append('period', periodSel.value) // period: year|month|week
      loadDashboardData(params)
    }

    if (applyBtn) applyBtn.addEventListener('click', refresh)
    if (resetBtn) resetBtn.addEventListener('click', () => {
      if (yearSel) yearSel.value = ''
      if (monthSel) monthSel.value = ''
      if (periodSel) periodSel.value = 'week'
      loadDashboardData()
    })

    loadDashboardData()
  }

  // Removed auto-loader for analytics page to avoid double fetch and function collisions
  // (analytics.html includes its own loader and functions)

  // Prediction form handler
  const predictionForm = document.getElementById("predictionForm")
  if (predictionForm) {
    predictionForm.addEventListener("submit", handlePrediction)
  }

  // Attach modal button listeners after DOM is ready
  const cancelBtn = document.getElementById('cancelDeleteBtn');
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (cancelBtn) cancelBtn.onclick = hideDeleteModal;
  if (confirmBtn) confirmBtn.onclick = async function() {
    if (pendingDeleteId) {
      try {
        await fetch(`/api/sales/${pendingDeleteId}`, { method: "DELETE" });
        location.reload();
      } catch (error) {
        alert("Error deleting entry. Please try again.");
      }
    }
    hideDeleteModal();
  };
})

// Removed global spinner utilities

async function loadDashboardData(params) {
  try {
    const qs = params && params.toString ? `?${params.toString()}` : ''
    const urlAnalytics = new URL(`/api/analytics${qs}`, window.location.origin)
    const periodSel = document.getElementById('dashboardPeriod')
    if (periodSel && periodSel.value) urlAnalytics.searchParams.set('period', periodSel.value)
    const [salesResponse, analyticsResponse] = await Promise.all([
      fetch(`/api/sales${qs}`),
      fetch(urlAnalytics.toString()),
    ])
    const salesData = await salesResponse.json()
    const analyticsData = await analyticsResponse.json()
    const totalEntriesEl = document.getElementById("totalEntries")
    const totalSoldEl = document.getElementById("totalSold")
    const totalRevenueEl = document.getElementById("totalRevenue")
    const efficiencyScoreEl = document.getElementById("efficiencyScore")
    if (totalEntriesEl) totalEntriesEl.textContent = analyticsData.total_entries
    if (totalSoldEl) totalSoldEl.textContent = `${analyticsData.total_sold} kg`
    if (totalRevenueEl) totalRevenueEl.textContent = `₱${analyticsData.total_revenue}`
    if (efficiencyScoreEl) efficiencyScoreEl.textContent = analyticsData.efficiency_score
    updateRecentDataTable(Array.isArray(salesData) ? salesData.slice(-5) : [])
    if (analyticsData && Array.isArray(analyticsData.chart_data)) {
      createSalesChart(analyticsData.chart_data)
      createWasteChart(analyticsData.chart_data)
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error)
  }
}

async function loadAnalyticsData() {
  try {
    const url = new URL(window.location.origin + '/api/analytics')
    const y = document.getElementById('analyticsYear')
    const m = document.getElementById('analyticsMonth')
    const w = document.getElementById('analyticsWeek')
    if (y && y.value) url.searchParams.append('year', y.value)
    if (m && m.value) url.searchParams.append('month', m.value)
    if (w && w.value) url.searchParams.append('week', w.value)
    const response = await fetch(url.toString())
    const data = await response.json()
    if (data && data.chart_data) {
      createAdvancedCharts(data.chart_data)
      generateInsights(data)
    }
    const params = new URLSearchParams()
    if (y && y.value) params.append('year', y.value)
    if (m && m.value) params.append('month', m.value)
    if (w && w.value) params.append('week', w.value)
    const [trendsRes, corrRes, marketRes] = await Promise.all([
      fetch('/api/trends' + (params.toString() ? '?' + params.toString() : '')),
      fetch('/api/correlations' + (params.toString() ? '?' + params.toString() : '')),
      fetch('/api/market-comparison' + (params.toString() ? '?' + params.toString() : '')),
    ])
    const [trends, correlations, marketComparison] = await Promise.all([
      trendsRes.json(), corrRes.json(), marketRes.json()
    ])
    renderCorrelationSection(correlations)
    renderMarketComparisonSection(marketComparison)
    renderTrendsSection(trends)
  } catch (error) {
    console.error("Error loading analytics data:", error)
  }
}

function updateRecentDataTable(data) {
  console.log("Updating recent data table with:", data)
  const tbody = document.getElementById("recentDataBody")
  if (!tbody) {
    console.error("Could not find recentDataBody element")
    return
  }

  tbody.innerHTML = data
    .map(
      (entry) => `
    <tr>
      <td>${entry.week_date}</td>
      <td>${entry.rice_sold} kg</td>
      <td>${entry.rice_unsold} kg</td>
      <td>₱${entry.price_per_kg}</td>
      <td>${entry.waste_percentage}%</td>
      <td>
        <button onclick="deleteEntry('${entry.id}')" class="btn-danger">Delete</button>
      </td>
    </tr>
  `,
    )
    .join("")
}

function createSalesChart(data) {
  const canvas = document.getElementById("salesChart")
  if (!canvas || !window.Chart) return

  // Destroy previous instance
  if (salesChartInstance) {
    try { salesChartInstance.destroy() } catch (e) {}
    salesChartInstance = null
  }

  // If no data, leave canvas cleared
  if (!Array.isArray(data) || data.length === 0) {
    const c2d = canvas.getContext && canvas.getContext('2d')
    if (c2d) {
      c2d.clearRect(0, 0, canvas.width || canvas.clientWidth, canvas.height || canvas.clientHeight)
    }
    return
  }

  salesChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map((d) => d.week),
      datasets: [
        {
          label: "Rice Sold (kg)",
          data: data.map((d) => d.sold),
          borderColor: "#4a7c59",
          backgroundColor: "rgba(74, 124, 89, 0.1)",
          tension: 0.4,
        },
        {
          label: "Rice Unsold (kg)",
          data: data.map((d) => d.unsold),
          borderColor: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.1)",
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  })
}

function createWasteChart(data) {
  const canvas = document.getElementById("wasteChart")
  if (!canvas || !window.Chart) return

  // Destroy previous instance
  if (wasteChartInstance) {
    try { wasteChartInstance.destroy() } catch (e) {}
    wasteChartInstance = null
  }

  if (!Array.isArray(data) || data.length === 0) {
    const c2d = canvas.getContext && canvas.getContext('2d')
    if (c2d) {
      c2d.clearRect(0, 0, canvas.width || canvas.clientWidth, canvas.height || canvas.clientHeight)
    }
    return
  }

  wasteChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: data.map((d) => d.week),
      datasets: [
        {
          label: "Waste Percentage",
          data: data.map((d) => d.waste_percentage),
          backgroundColor: data.map((d) =>
            d.waste_percentage > 20 ? "#dc3545" : d.waste_percentage > 10 ? "#ffc107" : "#28a745",
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => value + "%",
          },
        },
      },
    },
  })
}

function createAdvancedCharts(data) {
  // Revenue vs Waste Chart
  const revenueWasteCtx = document.getElementById("revenueWasteChart")
  if (revenueWasteCtx && window.Chart) {
    new Chart(revenueWasteCtx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Revenue vs Waste",
            data: data.map((d) => ({ x: d.waste_percentage, y: d.revenue })),
            backgroundColor: "#4a7c59",
            borderColor: "#2c5530",
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: "Waste Percentage (%)",
            },
          },
          y: {
            title: {
              display: true,
              text: "Revenue (₱)",
            },
          },
        },
      },
    })
  }

  // Price Trends Chart
  const priceCtx = document.getElementById("priceChart")
  if (priceCtx && window.Chart) {
    new Chart(priceCtx, {
      type: "line",
      data: {
        labels: data.map((d) => d.week),
        datasets: [
          {
            label: "Price per kg (₱)",
            data: data.map((d) => d.price),
            borderColor: "#4a7c59",
            backgroundColor: "rgba(74, 124, 89, 0.1)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
          },
        },
      },
    })
  }

  // Sales Distribution Chart
  const salesDistCtx = document.getElementById("salesDistributionChart")
  if (salesDistCtx && window.Chart) {
    new Chart(salesDistCtx, {
      type: "doughnut",
      data: {
        labels: ["Sold", "Unsold"],
        datasets: [
          {
            data: [data.reduce((sum, d) => sum + d.sold, 0), data.reduce((sum, d) => sum + d.unsold, 0)],
            backgroundColor: ["#28a745", "#dc3545"],
          },
        ],
      },
      options: {
        responsive: true,
      },
    })
  }
}

function renderTrendsSection(trends) {
  // Moving averages line is already handled in analytics.html script for that page.
  // Here we can update any additional charts if needed using trends.labels as x-axis
}

function renderCorrelationSection(correlations) {
  const grid = document.getElementById('correlationGrid')
  if (!grid || !correlations || correlations.error) return
  grid.innerHTML = ''
  const interpretations = correlations.interpretations || {}
  Object.keys(interpretations).forEach((key) => {
    const value = correlations[key] || 0
    const card = document.createElement('div')
    card.className = 'correlation-card'
    card.innerHTML = `<h4>${key.replace(/_/g, ' ')}</h4><div class="correlation-value">${value.toFixed(3)}</div><div class="correlation-interpretation">${interpretations[key]}</div>`
    grid.appendChild(card)
  })

  const chartEl = document.getElementById('correlationChart')
  if (chartEl && window.Chart) {
    // For now plot price vs demand (sold)
    // This requires chart_data context; if not available here, skip drawing
    // We leave rendering to the server-provided aggregated analytics chart when possible
  }
}

function renderMarketComparisonSection(comparison) {
  const grid = document.getElementById('marketComparisonGrid')
  if (!grid || !comparison || comparison.error) return
  grid.innerHTML = ''
  Object.entries(comparison).forEach(([market, data]) => {
    const card = document.createElement('div')
    card.className = 'market-card'
    card.innerHTML = `<h4>${market}</h4>
      <div class="market-stats">
        <div class="stat"><span class="label">Total Sold:</span><span class="value">${(data.total_sold || 0).toFixed(1)} kg</span></div>
        <div class="stat"><span class="label">Waste %:</span><span class="value">${(data.avg_waste_percentage || 0).toFixed(1)}%</span></div>
        <div class="stat"><span class="label">Avg Price:</span><span class="value">₱${(data.avg_price || 0).toFixed(2)}</span></div>
        <div class="stat"><span class="label">Efficiency:</span><span class="value">${data.efficiency_score || '-'}</span></div>
      </div>`
    grid.appendChild(card)
  })
}

function generateInsights(data) {
  const insightsGrid = document.getElementById("insightsGrid")
  if (!insightsGrid) return

  const insights = [
    {
      title: "Efficiency Rating",
      content: `Your current efficiency score is ${data.efficiency_score}. ${
        data.waste_percentage < 10
          ? "Excellent waste management!"
          : data.waste_percentage < 20
            ? "Good performance with room for improvement."
            : "Consider optimizing your inventory management."
      }`,
    },
    {
      title: "Revenue Trend",
      content: `Total revenue: ₱${data.total_revenue}. Average price: ₱${data.avg_price} per kg.`,
    },
    {
      title: "Waste Analysis",
      content: `Current waste rate: ${data.waste_percentage}%. ${
        data.waste_percentage > 15 ? "Consider reducing order quantities." : "Waste levels are within acceptable range."
      }`,
    },
  ]

  insightsGrid.innerHTML = insights
    .map(
      (insight) => `
    <div class="insight-card">
      <h4>${insight.title}</h4>
      <p>${insight.content}</p>
    </div>
  `,
    )
    .join("")
}

async function handlePrediction(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const data = {
    population: formData.get("population"),
    avgConsumption: formData.get("avgConsumption"),
    purchasingPower: formData.get("purchasingPower"),
    competitors: formData.get("competitors"),
  }

  try {
    const response = await fetch("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    const predictedDemandEl = document.getElementById("predictedDemand")
    const formulaUsedEl = document.getElementById("formulaUsed")
    const recommendationsDiv = document.getElementById("recommendations")

    if (predictedDemandEl) predictedDemandEl.textContent = result.predicted_demand
    if (formulaUsedEl) formulaUsedEl.textContent = result.formula_used

    if (recommendationsDiv) {
      recommendationsDiv.innerHTML = result.recommendations
        .map((rec) => `<div class="recommendation-item">${rec}</div>`)
        .join("")
    }

    const resultsEl = document.getElementById("predictionResults")
    if (resultsEl) resultsEl.style.display = "block"
  } catch (error) {
    console.error("Error making prediction:", error)
    alert("Error calculating prediction. Please try again.")
  }
}

let pendingDeleteId = null;

function showDeleteModal(id) {
  pendingDeleteId = id;
  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.style.display = 'flex';
}
function hideDeleteModal() {
  pendingDeleteId = null;
  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.style.display = 'none';
}

async function deleteEntry(id) {
  showDeleteModal(id);
}
