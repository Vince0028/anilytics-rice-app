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

    // Retailer inventory section (only present for retailers)
    const riForm = document.getElementById('retailerInventoryForm')
    if (riForm) {
      riForm.addEventListener('submit', handleRetailerInventorySubmit)
      initRetailerInventoryMultiRow()
      loadRetailerInventory()
    }
  }

  // Consumer inventory page initialization
  const consumerResultsBody = document.getElementById('inventoryResultsBody')
  if (consumerResultsBody) {
    const apply = document.getElementById('invApply')
    const reset = document.getElementById('invReset')
    if (apply) apply.addEventListener('click', loadConsumerInventory)
    if (reset) reset.addEventListener('click', () => {
      const latestSel = document.getElementById('invLatest')
      const date = document.getElementById('invDate')
      const variety = document.getElementById('invVariety')
      const area = document.getElementById('invArea')
      const minP = document.getElementById('invMinPrice')
      const maxP = document.getElementById('invMaxPrice')
      if (latestSel) latestSel.value = '1'
      if (date) date.value = ''
      if (variety) variety.value = ''
      if (area) area.value = ''
      if (minP) minP.value = ''
      if (maxP) maxP.value = ''
      loadConsumerInventory()
    })
    loadConsumerInventory()
  }

  // Company page initialization
  if (window.location.pathname.startsWith('/company/')) {
    initCompanyPage()
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
    try {
      if (pendingDeleteId) {
        await safeFetchJson(`/api/sales/${pendingDeleteId}`, { method: "DELETE" });
        location.reload();
        return;
      }
      if (pendingInventoryDeleteId) {
        await safeFetchJson(`/api/retailer/inventory/${pendingInventoryDeleteId}`, { method: "DELETE" });
        pendingInventoryDeleteId = null;
        if (typeof loadRetailerInventory === 'function') {
          loadRetailerInventory();
        }
      }
    } catch (error) {
      alert("Error deleting entry. Please try again.");
    } finally {
      hideDeleteModal();
    }
  };
})

// Removed global spinner utilities

// Safe JSON parsing helpers to harden fetch handlers against non-JSON responses
async function safeParseJson(response) {
  try {
    const ct = (response.headers && response.headers.get && response.headers.get('content-type')) || ''
    if (ct && ct.includes('application/json')) {
      return await response.json()
    }
    const text = await response.text()
    try { return JSON.parse(text) } catch (_) { return { message: text } }
  } catch (e) {
    return { error: 'Failed to parse response body' }
  }
}

async function safeFetchJson(input, init) {
  const res = await fetch(input, init)
  const data = await safeParseJson(res)
  if (!res.ok) {
    if (data && typeof data === 'object') {
      if (!('error' in data)) data.error = `HTTP ${res.status}`
      data.status = res.status
    }
    return data
  }
  return data
}

async function loadDashboardData(params) {
  try {
    const qs = params && params.toString ? `?${params.toString()}` : ''
    const urlAnalytics = new URL(`/api/analytics${qs}`, window.location.origin)
    const periodSel = document.getElementById('dashboardPeriod')
    if (periodSel && periodSel.value) urlAnalytics.searchParams.set('period', periodSel.value)
    const [salesData, analyticsData] = await Promise.all([
      safeFetchJson(`/api/sales${qs}`),
      safeFetchJson(urlAnalytics.toString()),
    ])
    const totalEntriesEl = document.getElementById("totalEntries")
    const totalSoldEl = document.getElementById("totalSold")
    const totalRevenueEl = document.getElementById("totalRevenue")
    const efficiencyScoreEl = document.getElementById("efficiencyScore")
    if (analyticsData && !analyticsData.error) {
      if (totalEntriesEl) totalEntriesEl.textContent = analyticsData.total_entries
      if (totalSoldEl) totalSoldEl.textContent = `${analyticsData.total_sold} kg`
      if (totalRevenueEl) totalRevenueEl.textContent = `₱${analyticsData.total_revenue}`
      if (efficiencyScoreEl) efficiencyScoreEl.textContent = analyticsData.efficiency_score
    } else {
      if (totalEntriesEl) totalEntriesEl.textContent = '-'
      if (totalSoldEl) totalSoldEl.textContent = '-'
      if (totalRevenueEl) totalRevenueEl.textContent = '-'
      if (efficiencyScoreEl) efficiencyScoreEl.textContent = '-'
    }
    updateRecentDataTable(Array.isArray(salesData) ? salesData.slice(-5) : [])
    if (analyticsData && !analyticsData.error && Array.isArray(analyticsData.chart_data)) {
      createSalesChart(analyticsData.chart_data)
      createWasteChart(analyticsData.chart_data)
    } else {
      // Clear charts to avoid stale visuals
      createSalesChart([])
      createWasteChart([])
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
    const data = await safeFetchJson(url.toString())
    if (data && data.chart_data) {
      createAdvancedCharts(data.chart_data)
      generateInsights(data)
    }
    const params = new URLSearchParams()
    if (y && y.value) params.append('year', y.value)
    if (m && m.value) params.append('month', m.value)
    if (w && w.value) params.append('week', w.value)
    const [trends, correlations, marketComparison] = await Promise.all([
      safeFetchJson('/api/trends' + (params.toString() ? '?' + params.toString() : '')),
      safeFetchJson('/api/correlations' + (params.toString() ? '?' + params.toString() : '')),
      safeFetchJson('/api/market-comparison' + (params.toString() ? '?' + params.toString() : '')),
    ])
    renderCorrelationSection(correlations)
    renderMarketComparisonSection(marketComparison)
    renderTrendsSection(trends)
  } catch (error) {
    console.error("Error loading analytics data:", error)
  }
}

// -------------------------------
// Consumer Inventory (Browse)
// -------------------------------
async function loadConsumerInventory() {
  const body = document.getElementById('inventoryResultsBody')
  if (!body) return
  try {
    const url = new URL('/api/inventory', window.location.origin)
    const latestSel = document.getElementById('invLatest')
    const date = document.getElementById('invDate')
    const variety = document.getElementById('invVariety')
    const area = document.getElementById('invArea')
    const minP = document.getElementById('invMinPrice')
    const maxP = document.getElementById('invMaxPrice')
    if (latestSel && latestSel.value) url.searchParams.set('latest', latestSel.value)
    if (date && date.value) url.searchParams.set('date', date.value)
    if (variety && variety.value) url.searchParams.set('variety', variety.value)
    if (area && area.value) url.searchParams.set('area', area.value)
    if (minP && minP.value) url.searchParams.set('min_price', minP.value)
    if (minP && maxP && maxP.value) url.searchParams.set('max_price', maxP.value)
    const data = await safeFetchJson(url.toString())
    if (Array.isArray(data)) {
      renderConsumerInventoryTable(data)
    } else {
      body.innerHTML = '<tr><td colspan="3">No results</td></tr>'
    }
  } catch (e) {
    console.error('Error loading consumer inventory:', e)
  }
}

function renderConsumerInventoryTable(items) {
  const body = document.getElementById('inventoryResultsBody')
  if (!body) return
  if (!Array.isArray(items) || items.length === 0) {
    body.innerHTML = '<tr><td colspan="3">No results</td></tr>'
    return
  }
  // Build a unique list of retailers
  const byRetailer = new Map()
  items.forEach((it) => {
    const key = it.retailer_id || it.retailer_company || 'unknown'
    if (!byRetailer.has(key)) {
      byRetailer.set(key, {
        id: it.retailer_id,
        company: it.retailer_company,
        area: it.retailer_area,
        location: it.retailer_location,
      })
    }
  })

  // Render simple rows: Retailer | Area | Location
  const rows = Array.from(byRetailer.values()).map((g) => {
    const href = g.id ? `/company/${encodeURIComponent(g.id)}` : ''
    return `
      <tr class="clickable-row" data-href="${href}" role="link" tabindex="0">
        <td>${g.company || '-'}</td>
        <td>${g.area || '-'}</td>
        <td>${g.location || '-'}</td>
      </tr>
    `
  })
  body.innerHTML = rows.join('')

  // Make whole row clickable + keyboard accessible
  body.querySelectorAll('tr.clickable-row').forEach((tr) => {
    const href = tr.getAttribute('data-href')
    if (!href) return
    tr.addEventListener('click', () => { window.location.href = href })
    tr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        window.location.href = href
      }
    })
  })
}

// -------------------------------
// Company Page (profile + listings)
// -------------------------------
function initCompanyPage() {
  try {
    const retailerId = getRetailerIdFromPath()
    if (!retailerId) return
    loadCompanyProfile(retailerId)
    loadCompanyInventory(retailerId)
  } catch (e) {
    console.error('Company page init failed:', e)
  }
}

function getRetailerIdFromPath() {
  const m = window.location.pathname.match(/^\/company\/(.+)$/)
  return m && m[1] ? decodeURIComponent(m[1]) : null
}

async function loadCompanyProfile(retailerId) {
  try {
    const data = await safeFetchJson(`/api/company/${encodeURIComponent(retailerId)}`)
    if (!data || data.error) return
    const nameEl = document.getElementById('companyName')
    const areaEl = document.getElementById('companyArea')
    const locEl = document.getElementById('companyLocation')
    if (nameEl) nameEl.textContent = data.retailer_company || 'Company'
    if (areaEl) areaEl.textContent = data.retailer_area || '-'
    if (locEl) locEl.textContent = data.retailer_location || '-'
  } catch (e) {
    console.error('Error loading company profile:', e)
  }
}

async function loadCompanyInventory(retailerId) {
  const tbody = document.getElementById('companyInventoryBody')
  if (!tbody) return
  try {
    const url = new URL('/api/inventory', window.location.origin)
    url.searchParams.set('retailer_id', retailerId)
    url.searchParams.set('latest', '1')
    const data = await safeFetchJson(url.toString())
    renderCompanyInventory(Array.isArray(data) ? data : [])
    renderCompanyStats(Array.isArray(data) ? data : [])
  } catch (e) {
    console.error('Error loading company inventory:', e)
  }
}

function renderCompanyInventory(items) {
  const tbody = document.getElementById('companyInventoryBody')
  if (!tbody) return
  const fmtDate = (d) => {
    if (!d) return '-'
    try { const s = typeof d === 'string' ? d : (d.date || d); return (s || '').substring(0, 10) } catch (_) { return String(d) }
  }
  const fmtNum = (n, dec = 2) => {
    const x = Number.parseFloat(n)
    if (Number.isNaN(x)) return '-'
    return x.toFixed(dec)
  }
  tbody.innerHTML = (items.length ? items.map(it => `
    <tr>
      <td>${it.rice_variety || '-'}</td>
      <td>${fmtNum(it.stock_kg, 2)}</td>
      <td>₱${fmtNum(it.price_per_kg, 2)}</td>
      <td>${fmtDate(it.date_posted || it.created_at)}</td>
    </tr>
  `).join('') : '<tr><td colspan="4">No listings</td></tr>')
}

function renderCompanyStats(items) {
  const el = document.getElementById('companyStats')
  if (!el) return
  if (!items || !items.length) { el.innerHTML = ''; return }
  const prices = items.map(i => Number.parseFloat(i.price_per_kg)).filter(n => !Number.isNaN(n))
  const avg = prices.length ? (prices.reduce((a,b)=>a+b,0) / prices.length) : 0
  const min = prices.length ? Math.min(...prices) : 0
  const max = prices.length ? Math.max(...prices) : 0
  const varieties = new Set(items.map(i => (i.rice_variety || '').trim() || 'Unknown'))
  el.innerHTML = `
    <div class="stats-grid">
      <div class="stat"><span class="label">Listings:</span><span class="value">${items.length}</span></div>
      <div class="stat"><span class="label">Varieties:</span><span class="value">${varieties.size}</span></div>
      <div class="stat"><span class="label">Avg Price:</span><span class="value">₱${avg.toFixed(2)}</span></div>
      <div class="stat"><span class="label">Min/Max Price:</span><span class="value">₱${min.toFixed(2)} – ₱${max.toFixed(2)}</span></div>
    </div>
  `
}

// ---------------------------------------
// Retailer Inventory (CRUD for dashboard)
// ---------------------------------------
async function loadRetailerInventory() {
  const tbody = document.getElementById('retailerInventoryTableBody')
  if (!tbody) return
  try {
    const data = await safeFetchJson('/api/retailer/inventory')
    renderRetailerInventoryTable(Array.isArray(data) ? data : [])
  } catch (e) {
    console.error('Error loading retailer inventory:', e)
  }
}

function renderRetailerInventoryTable(items) {
  const tbody = document.getElementById('retailerInventoryTableBody')
  if (!tbody) return
  const fmtDate = (d) => {
    if (!d) return '-'
    try { return (typeof d === 'string' ? d : (d.date || d)).substring(0, 10) } catch (_) { return String(d) }
  }
  const fmtNum = (n, dec = 2) => {
    const x = Number.parseFloat(n)
    if (Number.isNaN(x)) return '-'
    return x.toFixed(dec)
  }

  if (!items || items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6">No inventory yet</td></tr>'
    return
  }

  // Group by date (prefer date_posted, fallback to created_at)
  const groups = {}
  items.forEach((it) => {
    const label = fmtDate(it.date_posted || it.created_at)
    const key = label && label !== '-' ? label : 'No date'
    if (!groups[key]) groups[key] = []
    groups[key].push(it)
  })

  // Sort groups by date desc; "No date" last
  const keys = Object.keys(groups).sort((a, b) => {
    const da = a === 'No date' ? -Infinity : new Date(a).getTime()
    const db = b === 'No date' ? -Infinity : new Date(b).getTime()
    return db - da
  })

  let html = ''
  keys.forEach((k) => {
    const id = 'dg-' + k.replace(/[^0-9A-Za-z]+/g, '-')
    const count = groups[k].length
    const safeLabel = k
    html += `
    <tr class="ri-group-header" data-group="${id}">
      <td colspan="6">
        <button type="button" class="ri-group-toggle" data-target="${id}" data-label="${safeLabel}" data-count="${count}" aria-expanded="false" aria-controls="${id}">
          ▸ ${safeLabel} <span class="ri-group-count">(${count} items)</span>
        </button>
      </td>
    </tr>
    `
    groups[k].forEach((it) => {
      html += `
      <tr class="ri-group-item ${id}" data-id="${it.id}" style="display: none;">
        <td class="ri-indent"></td>
        <td>${it.rice_variety || '-'}</td>
        <td>${fmtNum(it.stock_kg)}</td>
        <td>₱${fmtNum(it.price_per_kg)}</td>
        <td>${fmtDate(it.created_at)}</td>
        <td>
          <button type="button" class="btn-secondary ri-edit" data-id="${it.id}">Edit</button>
          <button type="button" class="btn-danger ri-delete" data-id="${it.id}">Delete</button>
        </td>
      </tr>
      `
    })
  })
  tbody.innerHTML = html

  // expand/collapse handlers
  tbody.querySelectorAll('.ri-group-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target')
      const expanded = btn.getAttribute('aria-expanded') === 'true'
      const rows = tbody.querySelectorAll(`.ri-group-item.${target}`)
      rows.forEach(r => { r.style.display = expanded ? 'none' : '' })
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true')
      const label = btn.getAttribute('data-label') || ''
      const count = btn.getAttribute('data-count') || ''
      btn.innerHTML = `${expanded ? '▸' : '▾'} ${label} <span class="ri-group-count">(${count} items)</span>`
    })
  })

  // attach edit/delete handlers
  tbody.querySelectorAll('.ri-edit').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.getAttribute('data-id')
      await editRetailerInventoryItem(id)
    })
  })
  tbody.querySelectorAll('.ri-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id')
      showInventoryDeleteModal(id)
    })
  })
}

// -------------------------------
// Multi-row inventory UI helpers
// -------------------------------
function createRiRow() {
  const row = document.createElement('div')
  row.className = 'ri-row'
  row.innerHTML = `
    <div class="form-group">
      <label>Variety</label>
      <input type="text" class="ri-variety" placeholder="e.g., Jasmine">
    </div>
    <div class="form-group">
      <label>Stock (kg)</label>
      <input type="number" step="0.01" inputmode="decimal" class="ri-stock" required>
    </div>
    <div class="form-group">
      <label>Price per kg (₱)</label>
      <input type="number" step="0.01" inputmode="decimal" class="ri-price" required>
    </div>
    <button type="button" class="remove-row" aria-label="Remove row">Remove</button>
  `
  const btn = row.querySelector('.remove-row')
  if (btn) {
    btn.addEventListener('click', () => {
      const container = document.getElementById('ri_rows')
      row.remove()
      if (container && container.querySelectorAll('.ri-row').length === 0) {
        container.appendChild(createRiRow())
      }
    })
  }
  return row
}

function initRetailerInventoryMultiRow() {
  const container = document.getElementById('ri_rows')
  const addBtn = document.getElementById('ri_add_row')
  if (!container || !addBtn) return

  // Wire existing row(s)
  container.querySelectorAll('.ri-row .remove-row').forEach((btn) => {
    if (!btn.dataset.bound) {
      btn.addEventListener('click', (e) => {
        const row = e.currentTarget.closest('.ri-row')
        if (row) row.remove()
        if (container.querySelectorAll('.ri-row').length === 0) {
          container.appendChild(createRiRow())
        }
      })
      btn.dataset.bound = '1'
    }
  })

  // Add new rows
  addBtn.addEventListener('click', () => {
    container.appendChild(createRiRow())
  })
}
async function handleRetailerInventorySubmit(e) {
  e.preventDefault()
  const dateEl = document.getElementById('ri_date')
  const dateVal = dateEl && dateEl.value ? dateEl.value : null

  const rowsContainer = document.getElementById('ri_rows')
  let entries = []
  if (rowsContainer) {
    const rows = rowsContainer.querySelectorAll('.ri-row')
    rows.forEach((row) => {
      const varietyEl = row.querySelector('.ri-variety')
      const stockEl = row.querySelector('.ri-stock')
      const priceEl = row.querySelector('.ri-price')
      const variety = varietyEl && varietyEl.value ? varietyEl.value.trim() : ''
      const stock = stockEl ? stockEl.value : ''
      const price = priceEl ? priceEl.value : ''
      if (variety || stock || price) {
        if (!stock || !price) {
          entries = null
        } else {
          const p = { rice_variety: variety || null, stock_kg: stock, price_per_kg: price }
          if (dateVal) p.date_posted = dateVal
          entries.push(p)
        }
      }
    })
    if (entries === null) {
      alert('Please complete stock and price for all rows or remove incomplete rows.')
      return
    }
    if (!entries || entries.length === 0) {
      alert('Please add at least one variety row.')
      return
    }
  } else {
    // Legacy single-row fallback
    const variety = document.getElementById('ri_variety')
    const stock = document.getElementById('ri_stock')
    const price = document.getElementById('ri_price')
    const p = {
      rice_variety: variety && variety.value ? variety.value : null,
      stock_kg: stock ? stock.value : null,
      price_per_kg: price ? price.value : null,
    }
    if (dateVal) p.date_posted = dateVal
    entries = [p]
  }

  try {
    const results = await Promise.allSettled(
      entries.map((p) =>
        safeFetchJson('/api/retailer/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).then((body) => ({ ok: !(body && body.error), body }))
      )
    )
    const errors = results.filter((r) => r.status === 'fulfilled' && !r.value.ok)
    if (errors.length) {
      const msg = errors
        .map((e) => (e.value && e.value.body && (e.value.body.error || JSON.stringify(e.value.body))) || 'Unknown error')
        .join('\n')
      alert('Some entries failed to save:\n' + msg)
    }

    // Reset rows to a single empty row, keep date for convenience
    if (rowsContainer) {
      rowsContainer.innerHTML = ''
      rowsContainer.appendChild(createRiRow())
    } else {
      const v = document.getElementById('ri_variety'); if (v) v.value = ''
      const s = document.getElementById('ri_stock'); if (s) s.value = ''
      const p = document.getElementById('ri_price'); if (p) p.value = ''
    }

    loadRetailerInventory()
  } catch (e) {
    console.error('Create inventory error:', e)
    alert('Error creating inventory')
  }
}

async function editRetailerInventoryItem(id) {
  try {
    const item = await safeFetchJson(`/api/retailer/inventory/${id}`)
    if (item && item.error) {
      alert(item.error || 'Item not found')
      return
    }
    const curDate = item.date_posted ? String(item.date_posted).substring(0, 10) : ''
    const newDate = prompt('Date (YYYY-MM-DD) - leave blank to keep', curDate)
    const newVariety = prompt('Variety - leave blank to keep', item.rice_variety || '')
    const newStock = prompt('Stock (kg) - leave blank to keep', item.stock_kg != null ? item.stock_kg : '')
    const newPrice = prompt('Price per kg - leave blank to keep', item.price_per_kg != null ? item.price_per_kg : '')
    const payload = {}
    if (newDate !== null && newDate !== curDate) payload.date_posted = newDate || null
    if (newVariety !== null && newVariety !== (item.rice_variety || '')) payload.rice_variety = newVariety
    if (newStock !== null && newStock !== String(item.stock_kg ?? '')) { if (newStock !== '') payload.stock_kg = newStock }
    if (newPrice !== null && newPrice !== String(item.price_per_kg ?? '')) { if (newPrice !== '') payload.price_per_kg = newPrice }
    if (Object.keys(payload).length === 0) return
    const udata = await safeFetchJson(`/api/retailer/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (udata && udata.error) {
      alert(udata.error || 'Update failed')
      return
    }
    loadRetailerInventory()
  } catch (e) {
    console.error('Edit inventory error:', e)
    alert('Error editing item')
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
  if (!grid) return
  // Always clear previous content to avoid stale UI on errors
  grid.innerHTML = ''
  if (!correlations || correlations.error) {
    return
  }
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
  if (!grid) return
  // Always clear previous content
  grid.innerHTML = ''
  if (!comparison || comparison.error) {
    return
  }
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
    const result = await safeFetchJson("/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!result || result.error) {
      throw new Error((result && result.error) || 'Prediction failed')
    }

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
let pendingInventoryDeleteId = null;

function showDeleteModal(id) {
  pendingInventoryDeleteId = null;
  pendingDeleteId = id;
  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function showInventoryDeleteModal(id) {
  pendingDeleteId = null;
  pendingInventoryDeleteId = id;
  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.style.display = 'flex';
}
function hideDeleteModal() {
  pendingDeleteId = null;
  pendingInventoryDeleteId = null;
  const overlay = document.getElementById('deleteModalOverlay');
  if (overlay) overlay.style.display = 'none';
}

async function deleteEntry(id) {
  showDeleteModal(id);
}
