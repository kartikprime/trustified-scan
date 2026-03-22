"use client"
import { useState, useEffect, useRef } from "react"
import { TRUSTIFIED_CATEGORIES, getCategoryLabel } from "@/lib/categories"

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "products", label: "Products", icon: "📦" },
  { id: "brands", label: "Brands", icon: "🏭" },
  { id: "settings", label: "Settings", icon: "⚙️" },
]

const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", fontSize: "14px", color: "#0d1117", background: "white", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }
const labelStyle = { display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", marginBottom: "4px", letterSpacing: "0.5px", textTransform: "uppercase" }

const emptyAiForm = { driveUrl: "", productName: "", brandName: "", category: "whey_protein", test_date: "", barcode: "", affiliate_link: "", amazon_link: "", flipkart_link: "", product_image_url: "", price: "", discounted_price: "", is_gold_certified: false, is_featured: false, short_description: "", offer_text: "", youtube_url: "", batch_number: "", expiry_date: "", testing_status: "passed" }

function CategorySelect({ value, onChange }) {
  return (
    <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
      {Object.entries(TRUSTIFIED_CATEGORIES).map(([group, cats]) => (
        <optgroup key={group} label={"── " + group + " ──"}>
          {cats.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
        </optgroup>
      ))}
    </select>
  )
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ background: "white", borderRadius: "16px", padding: "20px 24px", border: "1px solid rgba(0,200,83,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: color }}/>
      <div style={{ fontSize: "28px", marginBottom: "4px" }}>{icon}</div>
      <div style={{ fontSize: "32px", fontWeight: "900", color: color, marginBottom: "2px" }}>{value}</div>
      <div style={{ fontSize: "13px", fontWeight: "700", color: "#0d1117" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{sub}</div>}
    </div>
  )
}

function CompletenessBar({ value }) {
  const color = value >= 80 ? "#00c853" : value >= 50 ? "#ff8f00" : "#ff3d57"
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: value + "%", background: color, borderRadius: "3px" }}/>
      </div>
      <span style={{ fontSize: "11px", fontWeight: "800", color, minWidth: "32px" }}>{value}%</span>
    </div>
  )
}

// A8 — Better delete confirmation component
function DeleteConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "white", borderRadius: "20px", padding: "32px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", animation: "fadeIn 0.2s ease" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🗑️</div>
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>Are you sure?</h3>
          <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>{message}</p>
        </div>
        <div style={{ background: "rgba(255,61,87,0.06)", border: "1px solid rgba(255,61,87,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px" }}>
          <p style={{ color: "#c62828", fontSize: "13px", fontWeight: "600" }}>⚠️ This action cannot be undone.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", background: "white", color: "#6b7280", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#ff3d57,#c62828)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [authToken, setAuthToken] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [message, setMessage] = useState("")
  const [dashData, setDashData] = useState(null)
  const [dashLoading, setDashLoading] = useState(false)
  const [productFilter, setProductFilter] = useState("all")
  const [productSearch, setProductSearch] = useState("")
  const [openProductId, setOpenProductId] = useState(null)
  const [productDashboard, setProductDashboard] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(false)
  const [editingComp, setEditingComp] = useState(null)
  const [editingSafety, setEditingSafety] = useState(null)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [publishChecks, setPublishChecks] = useState({ reviewed: false, accurate: false, score: false, image: false, link: false })
  const [showAddComp, setShowAddComp] = useState(false)
  const [showAddSafety, setShowAddSafety] = useState(false)
  const [showAiAnalyze, setShowAiAnalyze] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiSaving, setAiSaving] = useState(false)
  const [detectingCategory, setDetectingCategory] = useState(false)
  const [detectedCategory, setDetectedCategory] = useState(null)
  const [brands, setBrands] = useState([])
  const [brandsLoading, setBrandsLoading] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [showAddBrand, setShowAddBrand] = useState(false)
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" })
  const [pwMessage, setPwMessage] = useState("")
  const [aiFormSaved, setAiFormSaved] = useState(false)

  // A8 — Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({ show: false, message: "", onConfirm: null })

  const detectTimer = useRef(null)

  // A4 — Load saved AI form from sessionStorage on mount
  const [aiForm, setAiForm] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("trustified_ai_form")
      if (saved) {
        try { return { ...emptyAiForm, ...JSON.parse(saved) } }
        catch {}
      }
    }
    return emptyAiForm
  })

  const [addCompForm, setAddCompForm] = useState({ parameter_name: "", label_claim: "", lab_result: "", status: "accurate", loq: "", unit: "", parameter_type: "general" })
  const [addSafetyForm, setAddSafetyForm] = useState({ parameter_name: "", result: "", status: "safe", safe_limit: "", details: "" })
  const emptyBrandForm = { name: "", logo_url: "", website_url: "", shop_url: "", description: "", certification_date: "", certification_type: "standard", is_gold_partner: false, is_active: true, contact_email: "" }
  const [brandForm, setBrandForm] = useState(emptyBrandForm)

  // A4 — Auto-save AI form to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasData = aiForm.productName || aiForm.brandName || aiForm.driveUrl
      if (hasData) {
        sessionStorage.setItem("trustified_ai_form", JSON.stringify(aiForm))
        setAiFormSaved(true)
        const timer = setTimeout(() => setAiFormSaved(false), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [aiForm])

  const updateAiForm = (updates) => {
    setAiForm(prev => ({ ...prev, ...updates }))
  }

  const clearAiForm = () => {
    setAiForm(emptyAiForm)
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("trustified_ai_form")
    }
  }

  // A8 — Show delete confirmation instead of browser confirm()
  const showDeleteConfirm = (message, onConfirm) => {
    setDeleteModal({ show: true, message, onConfirm })
  }

  const hideDeleteConfirm = () => {
    setDeleteModal({ show: false, message: "", onConfirm: null })
  }

  // ===== AUTH =====
  const adminFetch = async (url, options = {}) => {
    const headers = { "Content-Type": "application/json", "x-admin-token": authToken, ...(options.headers || {}) }
    return fetch(url, { ...options, headers })
  }

  useEffect(() => {
    const savedToken = sessionStorage.getItem("trustified_admin_token")
    if (savedToken) verifyToken(savedToken)
  }, [])

  const verifyToken = async (token) => {
    try {
      const res = await fetch("/api/admin/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      const data = await res.json()
      if (data.valid) { setAuthToken(token); setLoggedIn(true); fetchDashboard(token) }
      else sessionStorage.removeItem("trustified_admin_token")
    } catch {}
  }

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginLoading(true); setLoginError("")
    try {
      const res = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (data.success) {
        setAuthToken(data.token)
        sessionStorage.setItem("trustified_admin_token", data.token)
        setLoggedIn(true); fetchDashboard(data.token)
      } else { setLoginError("Wrong password. Access denied.") }
    } catch { setLoginError("Server error. Please try again.") }
    setLoginLoading(false)
  }

  const handleLogout = () => {
    sessionStorage.removeItem("trustified_admin_token")
    setLoggedIn(false); setAuthToken(""); setPassword(""); setDashData(null)
  }

  const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(""), 5000) }

  const fetchDashboard = async (token) => {
    setDashLoading(true)
    try {
      const res = await fetch("/api/admin/dashboard", { headers: { "x-admin-token": token || authToken } })
      const data = await res.json()
      if (data.error?.includes("Unauthorized")) { handleLogout(); return }
      setDashData(data)
    } catch {}
    setDashLoading(false)
  }

  const fetchBrands = async () => {
    setBrandsLoading(true)
    try { const res = await adminFetch("/api/admin/brands"); const data = await res.json(); setBrands(data.brands || []) }
    catch { setBrands([]) }
    setBrandsLoading(false)
  }

  const openProductDashboard = async (productId) => {
    if (openProductId === productId) { setOpenProductId(null); setProductDashboard(null); return }
    setOpenProductId(productId); setDashboardLoading(true)
    setEditingProduct(false); setShowPublishConfirm(false)
    setShowAddComp(false); setShowAddSafety(false)
    setPublishChecks({ reviewed: false, accurate: false, score: false, image: false, link: false })
    try { const res = await adminFetch("/api/admin/review?id=" + productId); const data = await res.json(); setProductDashboard(data) }
    catch { showMessage("Error loading product") }
    setDashboardLoading(false)
  }

  const refreshDashboard = async () => {
    if (!openProductId) return
    try { const res = await adminFetch("/api/admin/review?id=" + openProductId); const data = await res.json(); setProductDashboard(data) }
    catch {}
    fetchDashboard()
  }

  const handleAddComp = async (e) => {
    e.preventDefault()
    try {
      const res = await adminFetch("/api/admin/composition", { method: "POST", body: JSON.stringify({ ...addCompForm, product_id: openProductId }) })
      const data = await res.json()
      if (data.success) { showMessage("Added!"); setAddCompForm({ parameter_name: "", label_claim: "", lab_result: "", status: "accurate", loq: "", unit: "", parameter_type: "general" }); refreshDashboard() }
      else showMessage("Error: " + data.error)
    } catch { showMessage("Error") }
  }

  const handleAddSafety = async (e) => {
    e.preventDefault()
    try {
      const res = await adminFetch("/api/admin/safety", { method: "POST", body: JSON.stringify({ ...addSafetyForm, product_id: openProductId }) })
      const data = await res.json()
      if (data.success) { showMessage("Added!"); setAddSafetyForm({ parameter_name: "", result: "", status: "safe", safe_limit: "", details: "" }); refreshDashboard() }
      else showMessage("Error: " + data.error)
    } catch { showMessage("Error") }
  }

  const handleEditComp = async (comp) => {
    try {
      const res = await adminFetch("/api/admin/edit", { method: "POST", body: JSON.stringify({ type: "composition", id: comp.id, data: { parameter_name: comp.parameter_name, label_claim: comp.label_claim, lab_result: comp.lab_result, status: comp.status, loq: comp.loq, unit: comp.unit, parameter_type: comp.parameter_type } }) })
      const data = await res.json()
      if (data.success) { showMessage("Updated!"); setEditingComp(null); refreshDashboard() }
    } catch { showMessage("Error") }
  }

  const handleEditSafety = async (safety) => {
    try {
      const res = await adminFetch("/api/admin/edit", { method: "POST", body: JSON.stringify({ type: "safety", id: safety.id, data: { parameter_name: safety.parameter_name, result: safety.result, status: safety.status, safe_limit: safety.safe_limit, details: safety.details } }) })
      const data = await res.json()
      if (data.success) { showMessage("Updated!"); setEditingSafety(null); refreshDashboard() }
    } catch { showMessage("Error") }
  }

  const handleEditProductDetails = async () => {
    // A20 — Validate trust score before saving
    const score = parseInt(productDashboard.product.trust_score)
    if (isNaN(score) || score < 1 || score > 100) {
      showMessage("Error: Trust score must be between 1 and 100")
      return
    }
    try {
      const res = await adminFetch("/api/admin/edit", { method: "POST", body: JSON.stringify({ type: "product", id: productDashboard.product.id, data: { name: productDashboard.product.name, brand: productDashboard.product.brand, trust_score: score, category: productDashboard.product.category, test_date: productDashboard.product.test_date, affiliate_link: productDashboard.product.affiliate_link, product_image_url: productDashboard.product.product_image_url, price: productDashboard.product.price, discounted_price: productDashboard.product.discounted_price, is_gold_certified: productDashboard.product.is_gold_certified, short_description: productDashboard.product.short_description, youtube_url: productDashboard.product.youtube_url, batch_number: productDashboard.product.batch_number, expiry_date: productDashboard.product.expiry_date, testing_status: productDashboard.product.testing_status } }) })
      const data = await res.json()
      if (data.success) { showMessage("Updated!"); setEditingProduct(false); refreshDashboard() }
      else showMessage("Error: " + data.error)
    } catch { showMessage("Error") }
  }

  // A8 — Use modal instead of browser confirm
  const handleDeleteComp = (id) => {
    showDeleteConfirm("Delete this composition parameter?", async () => {
      hideDeleteConfirm()
      try {
        const res = await adminFetch("/api/admin/delete", { method: "POST", body: JSON.stringify({ type: "composition", id }) })
        const data = await res.json()
        if (data.success) { showMessage("Deleted!"); refreshDashboard() }
      } catch { showMessage("Error") }
    })
  }

  const handleDeleteSafety = (id) => {
    showDeleteConfirm("Delete this safety parameter?", async () => {
      hideDeleteConfirm()
      try {
        const res = await adminFetch("/api/admin/delete", { method: "POST", body: JSON.stringify({ type: "safety", id }) })
        const data = await res.json()
        if (data.success) { showMessage("Deleted!"); refreshDashboard() }
      } catch { showMessage("Error") }
    })
  }

  const handleDeleteProduct = (id) => {
    showDeleteConfirm("Delete this entire product including all composition and safety data?", async () => {
      hideDeleteConfirm()
      try {
        const res = await adminFetch("/api/admin/delete", { method: "POST", body: JSON.stringify({ type: "product", id }) })
        const data = await res.json()
        if (data.success) { showMessage("Product deleted!"); setOpenProductId(null); setProductDashboard(null); fetchDashboard() }
      } catch { showMessage("Error") }
    })
  }

  const handlePublish = async (publish) => {
    if (publish && !Object.values(publishChecks).every(v => v)) { showMessage("Error: Tick all checklist boxes first"); return }
    try {
      const res = await adminFetch("/api/admin/publish", { method: "POST", body: JSON.stringify({ id: productDashboard.product.id, is_published: publish }) })
      const data = await res.json()
      if (data.success) { showMessage(publish ? "Product is LIVE!" : "Unpublished"); setShowPublishConfirm(false); refreshDashboard() }
    } catch { showMessage("Error") }
  }

  const autoDetectCategory = async (productName, brandName) => {
    if (!productName || productName.length < 3 || !brandName || brandName.length < 2) return
    setDetectingCategory(true); setDetectedCategory(null)
    try {
      const res = await adminFetch("/api/admin/detect-category", { method: "POST", body: JSON.stringify({ productName, brandName }) })
      const data = await res.json()
      if (data.success) { updateAiForm({ category: data.category }); setDetectedCategory(data) }
    } catch {}
    setDetectingCategory(false)
  }

  // A9 — Updated analyze to auto-tag parameter types
  const handleAnalyze = async (e) => {
    e.preventDefault(); setAiLoading(true); setAiResult(null)
    try {
      const res = await adminFetch("/api/admin/analyze", { method: "POST", body: JSON.stringify({ driveUrl: aiForm.driveUrl, productName: aiForm.productName, brandName: aiForm.brandName, category: aiForm.category }) })
      const data = await res.json()
      if (data.success) {
        // A9 — Auto-tag parameter types based on parameter name
        const taggedData = {
          ...data.data,
          composition: data.data.composition.map(comp => ({
            ...comp,
            parameter_type: autoTagParameterType(comp.parameter_name),
          }))
        }
        setAiResult(taggedData)
        showMessage("AI analyzed! All parameters auto-tagged.")
      } else {
        // A4 — Show error but keep form data
        showMessage("Error: " + data.error + " — Your form data is saved.")
      }
    } catch {
      // A4 — Form data preserved in sessionStorage
      showMessage("Error analyzing — Your form data is saved. Try again.")
    }
    setAiLoading(false)
  }

  // A9 — Auto-tag function
  const autoTagParameterType = (parameterName) => {
    if (!parameterName) return "general"
    const name = parameterName.toLowerCase()

    const macroKeywords = ["protein", "carbohydrate", "carbs", "fat", "calorie", "sodium", "sugar", "fiber", "moisture", "energy", "saturated", "trans fat", "cholesterol"]
    const aminoKeywords = ["alanine", "arginine", "aspartic", "cysteine", "glutamic", "glycine", "histidine", "isoleucine", "leucine", "lysine", "methionine", "phenylalanine", "proline", "serine", "threonine", "tyrosine", "valine", "tryptophan", "amino", "bcaa", "eaa"]
    const heavyMetalKeywords = ["lead", "cadmium", "arsenic", "mercury", "chromium", "nickel", "copper", "zinc", "heavy metal", "metal"]

    if (macroKeywords.some(k => name.includes(k))) return "macro"
    if (aminoKeywords.some(k => name.includes(k))) return "amino_acid"
    if (heavyMetalKeywords.some(k => name.includes(k))) return "heavy_metal"
    return "general"
  }

  const handleSaveAiReport = async () => {
    if (!aiResult) return
    // A20 — Validate trust score
    const score = parseInt(aiResult.trust_score)
    if (isNaN(score) || score < 1 || score > 100) {
      showMessage("Error: Invalid trust score. Must be 1-100.")
      return
    }
    setAiSaving(true)
    try {
      const productRes = await adminFetch("/api/admin/products", { method: "POST", body: JSON.stringify({ name: aiForm.productName, brand: aiForm.brandName, category: aiForm.category, barcode: aiForm.barcode || null, test_date: aiForm.test_date, trust_score: score, lab_report_url: aiForm.driveUrl, affiliate_link: aiForm.affiliate_link || null, amazon_link: aiForm.amazon_link || null, flipkart_link: aiForm.flipkart_link || null, product_image_url: aiForm.product_image_url || null, price: aiForm.price ? parseFloat(aiForm.price) : null, discounted_price: aiForm.discounted_price ? parseFloat(aiForm.discounted_price) : null, is_gold_certified: aiForm.is_gold_certified, is_featured: aiForm.is_featured, short_description: aiForm.short_description || null, offer_text: aiForm.offer_text || null, youtube_url: aiForm.youtube_url || null, batch_number: aiForm.batch_number || null, expiry_date: aiForm.expiry_date || null, testing_status: aiForm.testing_status, verification_status: "verified" }) })
      const productData = await productRes.json()
      if (!productData.success) { showMessage("Error: " + productData.error); setAiSaving(false); return }
      const pid = productData.product.id
      for (const comp of aiResult.composition) {
        await adminFetch("/api/admin/composition", { method: "POST", body: JSON.stringify({ ...comp, product_id: pid }) })
      }
      for (const safety of aiResult.safety) {
        await adminFetch("/api/admin/safety", { method: "POST", body: JSON.stringify({ ...safety, product_id: pid }) })
      }
      showMessage("Saved! Code: " + productData.product.product_code)
      setAiResult(null)
      clearAiForm() // A4 — Clear saved form after successful save
      setDetectedCategory(null); setShowAiAnalyze(false); fetchDashboard()
    } catch { showMessage("Error saving — Your form data is preserved.") }
    setAiSaving(false)
  }

  const handleAddBrand = async (e) => {
    e.preventDefault()
    try {
      const res = await adminFetch("/api/admin/brands", { method: "POST", body: JSON.stringify(brandForm) })
      const data = await res.json()
      if (data.success) { showMessage("Brand added!"); setBrandForm(emptyBrandForm); setShowAddBrand(false); fetchBrands() }
      else showMessage("Error: " + data.error)
    } catch { showMessage("Error") }
  }

  const handleEditBrand = async () => {
    if (!editingBrand) return
    try {
      const res = await adminFetch("/api/admin/brands", { method: "PUT", body: JSON.stringify(editingBrand) })
      const data = await res.json()
      if (data.success) { showMessage("Brand updated!"); setEditingBrand(null); fetchBrands() }
      else showMessage("Error: " + data.error)
    } catch { showMessage("Error") }
  }

  const handleDeleteBrand = (id) => {
    showDeleteConfirm("Delete this brand? All brand data will be removed.", async () => {
      hideDeleteConfirm()
      try {
        const res = await adminFetch("/api/admin/brands", { method: "DELETE", body: JSON.stringify({ id }) })
        const data = await res.json()
        if (data.success) { showMessage("Brand deleted!"); fetchBrands() }
      } catch { showMessage("Error") }
    })
  }

  const handleChangePassword = async (e) => {
    e.preventDefault(); setPwMessage("")
    if (pwForm.newPw.length < 8) { setPwMessage("error:Minimum 8 characters"); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwMessage("error:Passwords do not match"); return }
    const res = await fetch("/api/admin/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pwForm.current }) })
    const data = await res.json()
    if (!data.success) { setPwMessage("error:Current password is incorrect"); return }
    setPwMessage("success:To change password, update ADMIN_MASTER_PASSWORD in your .env.local file and restart the server.")
    setPwForm({ current: "", newPw: "", confirm: "" })
  }

  const getStatusColor = (status) => {
    if (!status) return "#9ca3af"
    const s = status.toLowerCase()
    if (s === "safe" || s === "accurate") return "#00c853"
    if (s === "borderline" || s === "mismatch" || s === "not_tested") return "#ff8f00"
    return "#ff3d57"
  }

  const filteredProducts = (dashData?.allProducts || []).filter(p => {
    const matchesFilter = productFilter === "all" || (productFilter === "live" && p.is_published) || (productFilter === "draft" && !p.is_published) || (productFilter === "gold" && p.is_gold_certified)
    const matchesSearch = !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase()) || p.brand?.toLowerCase().includes(productSearch.toLowerCase()) || p.product_code?.toLowerCase().includes(productSearch.toLowerCase())
    return matchesFilter && matchesSearch
  })

  useEffect(() => {
    if (activeTab === "brands" && brands.length === 0) fetchBrands()
  }, [activeTab])

  const BrandForm = ({ form, setForm, onSubmit, onCancel, title }) => (
    <div style={{ background: "#f8faf8", borderRadius: "16px", padding: "24px", border: "1px solid rgba(0,200,83,0.1)", marginBottom: "16px" }}>
      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>{title}</h3>
      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "12px", marginBottom: "16px" }}>
          <div><label style={labelStyle}>Brand Name *</label><input style={inputStyle} value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. MuscleBlaze" required/></div>
          <div><label style={labelStyle}>Logo URL</label><input style={inputStyle} value={form.logo_url || ""} onChange={e => setForm({...form, logo_url: e.target.value})} placeholder="https://... brand logo"/></div>
          <div><label style={labelStyle}>Website URL</label><input style={inputStyle} value={form.website_url || ""} onChange={e => setForm({...form, website_url: e.target.value})} placeholder="https://muscleblaze.com"/></div>
          <div><label style={labelStyle}>Trustified Shop URL</label><input style={inputStyle} value={form.shop_url || ""} onChange={e => setForm({...form, shop_url: e.target.value})} placeholder="https://shop.trustified.in/..."/></div>
          <div><label style={labelStyle}>Contact Email</label><input type="email" style={inputStyle} value={form.contact_email || ""} onChange={e => setForm({...form, contact_email: e.target.value})} placeholder="brand@email.com"/></div>
          <div><label style={labelStyle}>Certification Date</label><input type="date" style={inputStyle} value={form.certification_date || ""} onChange={e => setForm({...form, certification_date: e.target.value})}/></div>
          <div><label style={labelStyle}>Certification Type</label><select style={inputStyle} value={form.certification_type || "standard"} onChange={e => setForm({...form, certification_type: e.target.value})}><option value="standard">Standard Certified</option><option value="gold">Gold Certified</option></select></div>
          <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Description</label><textarea style={{...inputStyle, height: "80px", resize: "vertical"}} value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief brand description..."/></div>
          <div style={{ gridColumn: "1/-1", display: "flex", gap: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_gold_partner || false} onChange={e => setForm({...form, is_gold_partner: e.target.checked})} style={{ width: "16px", height: "16px", accentColor: "#f59e0b" }}/>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#f59e0b" }}>🏆 Gold Partner</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_active !== false} onChange={e => setForm({...form, is_active: e.target.checked})} style={{ width: "16px", height: "16px", accentColor: "#00c853" }}/>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0a5c36" }}>🟢 Active</span>
            </label>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>Save Brand</button>
          <button type="button" onClick={onCancel} style={{ background: "white", color: "#6b7280", border: "1px solid rgba(0,0,0,0.1)", padding: "12px 20px", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
        </div>
      </form>
    </div>
  )

  if (!loggedIn) return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f8faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "48px 40px", width: "100%", maxWidth: "420px", boxShadow: "0 20px 60px rgba(0,0,0,0.08)", border: "1px solid rgba(0,200,83,0.12)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg,#0a5c36,#00c853)", borderRadius: "18px", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "900", color: "white" }}>T</div>
          <h1 style={{ fontSize: "24px", fontWeight: "900", color: "#0d1117", marginBottom: "6px" }}>Trustified Admin</h1>
          <p style={{ color: "#9ca3af", fontSize: "14px" }}>Restricted Access — Server Verified</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}><label style={labelStyle}>Admin Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" style={inputStyle} autoFocus/></div>
          {loginError && <div style={{ background: "rgba(255,61,87,0.08)", border: "1px solid rgba(255,61,87,0.2)", borderRadius: "10px", padding: "12px 16px", color: "#c62828", fontSize: "14px", fontWeight: "600", marginBottom: "16px" }}>{loginError}</div>}
          <button type="submit" disabled={loginLoading} style={{ width: "100%", padding: "14px", background: loginLoading ? "#9ca3af" : "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: "800", cursor: loginLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            {loginLoading ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }}/> Verifying...</> : "Login to Admin Panel"}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>
        </form>
        <div style={{ marginTop: "20px", padding: "12px 16px", background: "rgba(0,200,83,0.04)", border: "1px solid rgba(0,200,83,0.12)", borderRadius: "10px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "#9ca3af" }}>🔒 Password verified by server · Session expires when browser closes</p>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ paddingTop: "70px", minHeight: "100vh", background: "#f0f4f0" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}} @keyframes slideIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}} @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* A8 — Delete confirmation modal */}
      {deleteModal.show && (
        <DeleteConfirmModal
          message={deleteModal.message}
          onConfirm={deleteModal.onConfirm}
          onCancel={hideDeleteConfirm}
        />
      )}

      {message && <div style={{ position: "fixed", top: "80px", right: "24px", zIndex: 9999, background: message.startsWith("Error") ? "#ff3d57" : "#00c853", color: "white", padding: "14px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: "700", boxShadow: "0 8px 30px rgba(0,0,0,0.2)", maxWidth: "400px", animation: "fadeIn 0.3s ease" }}>{message}</div>}

      {/* A4 — Autosave indicator */}
      {aiFormSaved && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9998, background: "rgba(0,200,83,0.9)", color: "white", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", animation: "fadeIn 0.3s ease" }}>
          ✓ Form auto-saved
        </div>
      )}

      <div style={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>
        {/* SIDEBAR */}
        <div style={{ width: "240px", background: "linear-gradient(180deg,#0a5c36,#0d7a48)", flexShrink: 0, padding: "24px 0", display: "flex", flexDirection: "column", position: "sticky", top: "70px", height: "calc(100vh - 70px)", overflowY: "auto" }}>
          <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "15px", fontWeight: "900", color: "white", marginBottom: "2px" }}>Admin Panel</div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00c853", display: "inline-block" }}/>
              Server Verified Session
            </div>
          </div>
          <nav style={{ padding: "16px 12px", flex: 1 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === "dashboard") fetchDashboard() }} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "12px", border: "none", background: activeTab === tab.id ? "rgba(255,255,255,0.15)" : "transparent", color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.65)", fontSize: "14px", fontWeight: activeTab === tab.id ? "700" : "500", cursor: "pointer", marginBottom: "4px", textAlign: "left" }}>
                <span style={{ fontSize: "18px" }}>{tab.icon}</span>
                {tab.label}
                {tab.id === "products" && dashData && <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", borderRadius: "100px", padding: "2px 8px", fontSize: "11px", fontWeight: "800" }}>{dashData.stats?.total || 0}</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <a href="/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "13px", marginBottom: "4px" }}>🌐 View Website</a>
            <button onClick={handleLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", border: "none", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: "13px", cursor: "pointer", textAlign: "left" }}>🚪 Logout</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, padding: "28px", overflowX: "hidden" }}>

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div>
              <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0d1117", marginBottom: "4px" }}>Dashboard</h1>
                <p style={{ color: "#9ca3af", fontSize: "14px" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              {dashLoading ? (
                <div style={{ textAlign: "center", padding: "60px" }}><div style={{ width: "40px", height: "40px", border: "3px solid rgba(0,200,83,0.2)", borderTop: "3px solid #00c853", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }}/></div>
              ) : dashData && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "16px", marginBottom: "24px" }}>
                    <StatCard icon="📦" label="Total Products" value={dashData.stats.total} color="#0a5c36" sub="In database"/>
                    <StatCard icon="🟢" label="Live Products" value={dashData.stats.live} color="#00c853" sub="Visible to users"/>
                    <StatCard icon="🟡" label="Draft Products" value={dashData.stats.draft} color="#ff8f00" sub="Needs review"/>
                    <StatCard icon="🏆" label="Gold Certified" value={dashData.stats.gold} color="#f59e0b" sub="Top quality"/>
                    <StatCard icon="🏭" label="Brands" value={dashData.stats.brands} color="#6366f1" sub={dashData.stats.activeBrands + " active"}/>
                    <StatCard icon="🧪" label="Parameters" value={dashData.stats.totalComposition + dashData.stats.totalSafety} color="#ec4899" sub="Total tested"/>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)" }}>
                      <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        ⚠️ Pending Actions
                        {dashData.pendingActions.length > 0 && <span style={{ background: "#ff3d57", color: "white", borderRadius: "100px", padding: "2px 8px", fontSize: "11px", fontWeight: "800" }}>{dashData.pendingActions.length}</span>}
                      </h2>
                      {dashData.pendingActions.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "20px", color: "#00c853", fontSize: "14px", fontWeight: "700" }}>✅ All good!</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {dashData.pendingActions.map((action, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: action.type === "error" ? "rgba(255,61,87,0.06)" : action.type === "warning" ? "rgba(255,143,0,0.06)" : "rgba(99,102,241,0.06)" }}>
                              <span>{action.type === "error" ? "🔴" : action.type === "warning" ? "🟡" : "🔵"}</span>
                              <span style={{ fontSize: "13px", color: "#0d1117", flex: 1 }}>{action.message}</span>
                              <span style={{ fontSize: "11px", fontWeight: "800", color: action.type === "error" ? "#ff3d57" : action.type === "warning" ? "#ff8f00" : "#6366f1", background: "rgba(0,0,0,0.05)", borderRadius: "6px", padding: "2px 8px" }}>{action.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)" }}>
                      <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>🕐 Recently Added</h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {dashData.recentProducts.map(product => (
                          <div key={product.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                            {product.product_image_url ? <img src={product.product_image_url} alt="" loading="lazy" style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "contain", background: "#f8faf8" }} onError={e => e.target.style.display = "none"}/> : <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "rgba(0,200,83,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>💊</div>}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0d1117", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</div>
                              <div style={{ fontSize: "11px", color: "#9ca3af" }}>{product.product_code} · {product.is_published ? "🟢 Live" : "🟡 Draft"}</div>
                            </div>
                            <CompletenessBar value={product.completeness}/>
                          </div>
                        ))}
                        {dashData.recentProducts.length === 0 && <p style={{ color: "#9ca3af", fontSize: "14px", textAlign: "center", padding: "20px" }}>No products yet</p>}
                      </div>
                    </div>
                  </div>
                  <div style={{ background: "white", borderRadius: "20px", padding: "24px", border: "1px solid rgba(0,200,83,0.08)" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>⚡ Quick Actions</h2>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {[
                        { label: "Add Product via AI", icon: "🤖", action: () => { setActiveTab("products"); setShowAiAnalyze(true) }, color: "linear-gradient(135deg,#0a5c36,#00c853)" },
                        { label: "Add Brand", icon: "🏭", action: () => { setActiveTab("brands"); setShowAddBrand(true) }, color: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
                        { label: "View Website", icon: "🌐", action: () => window.open("/", "_blank"), color: "linear-gradient(135deg,#0ea5e9,#06b6d4)" },
                        { label: "Refresh", icon: "🔄", action: fetchDashboard, color: "linear-gradient(135deg,#ec4899,#f43f5e)" },
                      ].map(action => (
                        <button key={action.label} onClick={action.action} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", borderRadius: "12px", border: "none", background: action.color, color: "white", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                          <span>{action.icon}</span> {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* PRODUCTS */}
          {activeTab === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0d1117", marginBottom: "4px" }}>Products</h1>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>{(dashData?.allProducts || []).length} total</p>
                </div>
                <button onClick={() => setShowAiAnalyze(!showAiAnalyze)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>
                  🤖 {showAiAnalyze ? "Close AI" : "Add via AI"}
                </button>
              </div>

              {showAiAnalyze && (
                <div style={{ background: "white", borderRadius: "20px", padding: "28px", border: "2px solid rgba(0,200,83,0.2)", marginBottom: "24px", animation: "slideIn 0.3s ease" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "44px", height: "44px", background: "linear-gradient(135deg,#0a5c36,#00c853)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>🤖</div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117" }}>AI Lab Report Analyzer</h2>
                      <p style={{ color: "#9ca3af", fontSize: "13px" }}>Auto Product Code · Auto Category Detection · Auto Parameter Tagging</p>
                    </div>
                    {/* A4 — Show saved indicator */}
                    {(aiForm.productName || aiForm.driveUrl) && (
                      <div style={{ background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", color: "#0a5c36", fontWeight: "600", flexShrink: 0 }}>
                        💾 Form data saved
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleAnalyze}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "14px", marginBottom: "16px" }}>
                      <div>
                        <label style={labelStyle}>Product Name *</label>
                        <input style={inputStyle} value={aiForm.productName} onChange={e => { updateAiForm({ productName: e.target.value }); if (detectTimer.current) clearTimeout(detectTimer.current); if (e.target.value.length >= 3 && aiForm.brandName.length >= 2) detectTimer.current = setTimeout(() => autoDetectCategory(e.target.value, aiForm.brandName), 1200) }} placeholder="e.g. Nakpro Gold Whey" required/>
                      </div>
                      <div>
                        <label style={labelStyle}>Brand Name *</label>
                        <input style={inputStyle} value={aiForm.brandName} onChange={e => { updateAiForm({ brandName: e.target.value }); if (detectTimer.current) clearTimeout(detectTimer.current); if (e.target.value.length >= 2 && aiForm.productName.length >= 3) detectTimer.current = setTimeout(() => autoDetectCategory(aiForm.productName, e.target.value), 1200) }} placeholder="e.g. Nakpro" required/>
                      </div>
                      <div>
                        <label style={labelStyle}>Category * {detectingCategory && <span style={{ color: "#0a5c36", fontWeight: "700", marginLeft: "6px" }}>detecting...</span>}</label>
                        <CategorySelect value={aiForm.category} onChange={v => { updateAiForm({ category: v }); setDetectedCategory(null) }}/>
                        {detectedCategory && <div style={{ marginTop: "6px", background: "rgba(0,200,83,0.06)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "6px", padding: "6px 10px", fontSize: "12px", color: "#0a5c36", fontWeight: "600" }}>✓ AI detected: {getCategoryLabel(detectedCategory.category)}</div>}
                      </div>
                      <div><label style={labelStyle}>Test Date *</label><input type="date" style={inputStyle} value={aiForm.test_date} onChange={e => updateAiForm({ test_date: e.target.value })} required/></div>
                      <div><label style={labelStyle}>Batch Number</label><input style={inputStyle} value={aiForm.batch_number} onChange={e => updateAiForm({ batch_number: e.target.value })} placeholder="e.g. WAH010320201"/></div>
                      <div><label style={labelStyle}>Expiry Date</label><input type="date" style={inputStyle} value={aiForm.expiry_date} onChange={e => updateAiForm({ expiry_date: e.target.value })}/></div>
                      <div><label style={labelStyle}>Price (₹)</label><input type="number" style={inputStyle} value={aiForm.price} onChange={e => updateAiForm({ price: e.target.value })} placeholder="2499"/></div>
                      <div><label style={labelStyle}>Sale Price (₹)</label><input type="number" style={inputStyle} value={aiForm.discounted_price} onChange={e => updateAiForm({ discounted_price: e.target.value })} placeholder="1999"/></div>
                      <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Product Image URL</label><input style={inputStyle} value={aiForm.product_image_url} onChange={e => updateAiForm({ product_image_url: e.target.value })} placeholder="https://..."/></div>
                      <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Trustified Shop / Affiliate Link</label><input style={inputStyle} value={aiForm.affiliate_link} onChange={e => updateAiForm({ affiliate_link: e.target.value })} placeholder="https://shop.trustified.in/..."/></div>
                      <div><label style={labelStyle}>Amazon Affiliate Link</label><input style={inputStyle} value={aiForm.amazon_link} onChange={e => updateAiForm({ amazon_link: e.target.value })} placeholder="https://amazon.in/..."/></div>
                      <div><label style={labelStyle}>Flipkart Affiliate Link</label><input style={inputStyle} value={aiForm.flipkart_link} onChange={e => updateAiForm({ flipkart_link: e.target.value })} placeholder="https://flipkart.com/..."/></div>
                      <div><label style={labelStyle}>Offer Text</label><input style={inputStyle} value={aiForm.offer_text} onChange={e => updateAiForm({ offer_text: e.target.value })} placeholder="e.g. Buy 2 Get 1 Free"/></div>
                      <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>YouTube Video Link</label><input style={inputStyle} value={aiForm.youtube_url} onChange={e => updateAiForm({ youtube_url: e.target.value })} placeholder="https://youtube.com/watch?v=..."/></div>
                      <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Short Description</label><input style={inputStyle} value={aiForm.short_description} onChange={e => updateAiForm({ short_description: e.target.value })} placeholder="e.g. 25g protein per serving, no amino spiking"/></div>
                      <div style={{ gridColumn: "1/-1", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                          <input type="checkbox" checked={aiForm.is_gold_certified} onChange={e => updateAiForm({ is_gold_certified: e.target.checked })} style={{ width: "16px", height: "16px", accentColor: "#f59e0b" }}/>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#f59e0b" }}>🏆 Gold Certified</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                          <input type="checkbox" checked={aiForm.is_featured} onChange={e => updateAiForm({ is_featured: e.target.checked })} style={{ width: "16px", height: "16px", accentColor: "#0a5c36" }}/>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "#0a5c36" }}>⭐ Featured in Shop</span>
                        </label>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <label style={{ fontSize: "13px", fontWeight: "700", color: "#6b7280" }}>Status:</label>
                          <select style={{...inputStyle, width: "auto", padding: "6px 12px"}} value={aiForm.testing_status} onChange={e => updateAiForm({ testing_status: e.target.value })}>
                            <option value="passed">✅ Passed</option>
                            <option value="failed">❌ Failed</option>
                            <option value="partial">⚠️ Partial</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ gridColumn: "1/-1", background: "rgba(0,200,83,0.04)", border: "1px solid rgba(0,200,83,0.15)", borderRadius: "10px", padding: "14px" }}>
                        <label style={labelStyle}>Google Drive PDF Link *</label>
                        <input style={inputStyle} value={aiForm.driveUrl} onChange={e => updateAiForm({ driveUrl: e.target.value })} placeholder="https://drive.google.com/file/d/..." required/>
                        <p style={{ fontSize: "11px", color: "#9ca3af", marginTop: "6px" }}>Set to "Anyone with link can view" in Google Drive</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button type="submit" disabled={aiLoading} style={{ background: aiLoading ? "#9ca3af" : "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px 36px", borderRadius: "12px", fontSize: "15px", fontWeight: "800", cursor: aiLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                        {aiLoading ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }}/> Analyzing...</> : "🤖 Analyze with AI"}
                      </button>
                      {(aiForm.productName || aiForm.driveUrl) && (
                        <button type="button" onClick={clearAiForm} style={{ padding: "14px 20px", borderRadius: "12px", border: "1px solid rgba(255,61,87,0.3)", background: "white", color: "#ff3d57", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                          Clear Form
                        </button>
                      )}
                    </div>
                  </form>

                  {aiResult && (
                    <div style={{ marginTop: "20px", borderTop: "2px solid rgba(0,200,83,0.1)", paddingTop: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117" }}>AI Analysis Complete ✅</h3>
                          <p style={{ color: "#9ca3af", fontSize: "13px" }}>Parameters auto-tagged — Product Code generated on save</p>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ textAlign: "center" }}>
                            {/* A20 — Editable trust score */}
                            <input
                              type="number" min="1" max="100"
                              value={aiResult.trust_score}
                              onChange={e => setAiResult({...aiResult, trust_score: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))})}
                              style={{ ...inputStyle, width: "80px", textAlign: "center", fontSize: "28px", fontWeight: "900", color: aiResult.trust_score >= 75 ? "#00c853" : aiResult.trust_score >= 50 ? "#ff8f00" : "#ff3d57", border: "2px solid rgba(0,200,83,0.2)", padding: "4px 8px" }}
                            />
                            <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "700", marginTop: "2px" }}>TRUST SCORE (editable)</div>
                          </div>
                          <span style={{ padding: "8px 16px", borderRadius: "100px", background: aiResult.overall_verdict === "SAFE" ? "rgba(0,200,83,0.1)" : "rgba(255,143,0,0.1)", color: aiResult.overall_verdict === "SAFE" ? "#0a5c36" : "#e65100", fontSize: "13px", fontWeight: "800" }}>{aiResult.overall_verdict}</span>
                        </div>
                      </div>
                      <div style={{ background: "#f8faf8", borderRadius: "10px", padding: "14px", marginBottom: "14px", borderLeft: "4px solid #00c853" }}>
                        <p style={{ color: "#0d1117", fontSize: "14px", lineHeight: "1.7" }}>{aiResult.product_summary}</p>
                      </div>
                      {aiResult.missing_fssai_params?.length > 0 && (
                        <div style={{ background: "rgba(255,143,0,0.06)", border: "1px solid rgba(255,143,0,0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "14px" }}>
                          <div style={{ fontSize: "12px", fontWeight: "800", color: "#e65100", marginBottom: "8px" }}>⚠️ Missing Parameters</div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {aiResult.missing_fssai_params.map((p, i) => <span key={i} style={{ background: "rgba(255,143,0,0.1)", borderRadius: "100px", padding: "3px 10px", fontSize: "11px", color: "#e65100" }}>{p}</span>)}
                          </div>
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        <div>
                          <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>Composition ({aiResult.composition.length}) — Auto-tagged</h4>
                          <div style={{ maxHeight: "200px", overflowY: "auto", borderRadius: "8px", border: "1px solid rgba(0,200,83,0.08)" }}>
                            {aiResult.composition.map((row, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid rgba(0,0,0,0.03)", fontSize: "12px", alignItems: "center" }}>
                                <div>
                                  <span style={{ fontWeight: "600" }}>{row.parameter_name}</span>
                                  <span style={{ marginLeft: "6px", fontSize: "9px", fontWeight: "700", color: "#9ca3af", background: "#f3f4f6", borderRadius: "3px", padding: "1px 4px", textTransform: "uppercase" }}>{(row.parameter_type || "general").replace("_", " ")}</span>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <span style={{ color: "#6b7280" }}>{row.lab_result}</span>
                                  <span style={{ color: getStatusColor(row.status), fontWeight: "700", fontSize: "10px", textTransform: "uppercase" }}>{row.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>Safety ({aiResult.safety.length})</h4>
                          <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "4px" }}>
                            {aiResult.safety.map((p, i) => (
                              <div key={i} style={{ background: "#f8faf8", borderRadius: "6px", padding: "8px 10px", borderLeft: "3px solid " + getStatusColor(p.status), display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "12px", fontWeight: "600" }}>{p.parameter_name}</span>
                                <span style={{ color: getStatusColor(p.status), fontSize: "10px", fontWeight: "800" }}>{p.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button onClick={handleSaveAiReport} disabled={aiSaving} style={{ background: aiSaving ? "#9ca3af" : "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "14px 36px", borderRadius: "12px", fontSize: "15px", fontWeight: "800", cursor: aiSaving ? "not-allowed" : "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        {aiSaving ? <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 1s linear infinite" }}/> Saving...</> : "💾 Save as Draft"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Product filters */}
              <div style={{ background: "white", borderRadius: "16px", padding: "16px 20px", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Search by name, brand or code..." style={{ flex: 1, minWidth: "200px", padding: "8px 14px", border: "1px solid rgba(0,200,83,0.2)", borderRadius: "8px", fontSize: "14px", outline: "none" }}/>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[{ id: "all", label: "All" }, { id: "live", label: "🟢 Live" }, { id: "draft", label: "🟡 Draft" }, { id: "gold", label: "🏆 Gold" }].map(f => (
                    <button key={f.id} onClick={() => setProductFilter(f.id)} style={{ padding: "8px 14px", borderRadius: "8px", border: "none", background: productFilter === f.id ? "linear-gradient(135deg,#0a5c36,#00c853)" : "#f3f4f6", color: productFilter === f.id ? "white" : "#6b7280", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>{f.label}</button>
                  ))}
                </div>
                <button onClick={fetchDashboard} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(0,200,83,0.2)", background: "white", color: "#0a5c36", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>🔄</button>
              </div>

              {filteredProducts.length === 0 ? (
                <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid rgba(0,200,83,0.08)" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>📦</div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>No Products Found</h3>
                  <p style={{ color: "#9ca3af" }}>Use AI Analyzer above to add products</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredProducts.map(product => (
                    <div key={product.id}>
                      <div style={{ background: "white", borderRadius: openProductId === product.id ? "16px 16px 0 0" : "16px", border: "1px solid " + (openProductId === product.id ? "rgba(0,200,83,0.3)" : "rgba(0,200,83,0.08)"), borderBottom: openProductId === product.id ? "none" : undefined, padding: "16px 20px", display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                        {product.product_image_url ? (
                          <img src={product.product_image_url} alt="" loading="lazy" style={{ width: "52px", height: "52px", borderRadius: "10px", objectFit: "contain", background: "#f8faf8", border: "1px solid rgba(0,200,83,0.1)", flexShrink: 0 }} onError={e => e.target.style.display = "none"}/>
                        ) : (
                          <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "rgba(0,200,83,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>💊</div>
                        )}
                        <div style={{ flex: 1, minWidth: "180px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                            {product.is_gold_certified && <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px" }}>🏆 GOLD</span>}
                            <span style={{ fontSize: "11px", color: "#00c853", fontWeight: "800", fontFamily: "monospace" }}>{product.product_code}</span>
                            <span style={{ fontSize: "11px", color: "#9ca3af" }}>· {getCategoryLabel(product.category)}</span>
                          </div>
                          <div style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117", marginBottom: "2px" }}>{product.name}</div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>{product.brand} · <span style={{ color: product.trust_score >= 75 ? "#00c853" : "#ff8f00", fontWeight: "700" }}>{product.trust_score}/100</span>{product.discounted_price ? " · ₹" + product.discounted_price : ""}</div>
                        </div>
                        <div style={{ minWidth: "120px" }}>
                          <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600", marginBottom: "4px" }}>COMPLETENESS</div>
                          <CompletenessBar value={product.completeness}/>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "700", background: product.product_image_url ? "rgba(0,200,83,0.08)" : "rgba(255,61,87,0.08)", color: product.product_image_url ? "#0a5c36" : "#ff3d57" }}>{product.product_image_url ? "✓ Img" : "✗ Img"}</span>
                          <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "700", background: product.affiliate_link ? "rgba(0,200,83,0.08)" : "rgba(255,61,87,0.08)", color: product.affiliate_link ? "#0a5c36" : "#ff3d57" }}>{product.affiliate_link ? "✓ Buy" : "✗ Buy"}</span>
                          <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "700", background: product.is_published ? "rgba(0,200,83,0.08)" : "rgba(255,143,0,0.08)", color: product.is_published ? "#0a5c36" : "#e65100" }}>{product.is_published ? "🟢 Live" : "🟡 Draft"}</span>
                          <button onClick={() => openProductDashboard(product.id)} style={{ padding: "8px 14px", borderRadius: "8px", border: "none", background: openProductId === product.id ? "linear-gradient(135deg,#0a5c36,#00c853)" : "rgba(0,200,83,0.1)", color: openProductId === product.id ? "white" : "#0a5c36", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                            {openProductId === product.id ? "Close ▲" : "Manage ▼"}
                          </button>
                        </div>
                      </div>

                      {openProductId === product.id && (
                        <div style={{ background: "white", border: "1px solid rgba(0,200,83,0.3)", borderTop: "2px dashed rgba(0,200,83,0.2)", borderRadius: "0 0 16px 16px", padding: "24px", animation: "slideIn 0.2s ease" }}>
                          {dashboardLoading ? (
                            <div style={{ textAlign: "center", padding: "32px" }}><div style={{ width: "32px", height: "32px", border: "3px solid rgba(0,200,83,0.2)", borderTop: "3px solid #00c853", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }}/></div>
                          ) : productDashboard && (
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", padding: "6px 16px", borderRadius: "8px", fontSize: "16px", fontWeight: "900", letterSpacing: "2px", fontFamily: "monospace" }}>{productDashboard.product.product_code}</div>
                                  <div>
                                    <div style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117" }}>{productDashboard.product.name}</div>
                                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>{productDashboard.product.brand} · Score: {productDashboard.product.trust_score}</div>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                  <button onClick={() => setEditingProduct(!editingProduct)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(0,200,83,0.3)", background: editingProduct ? "rgba(0,200,83,0.08)" : "white", color: "#0a5c36", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>✏️ Edit</button>
                                  {productDashboard.product.is_published
                                    ? <button onClick={() => handlePublish(false)} style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(255,61,87,0.3)", background: "white", color: "#ff3d57", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Unpublish</button>
                                    : <button onClick={() => setShowPublishConfirm(!showPublishConfirm)} style={{ padding: "8px 18px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", fontSize: "13px", fontWeight: "800", cursor: "pointer" }}>🚀 Publish</button>
                                  }
                                  <a href={"/product/" + productDashboard.product.id} target="_blank" rel="noopener noreferrer" style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(0,200,83,0.2)", background: "white", color: "#0a5c36", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}>👁️ Preview</a>
                                  <button onClick={() => handleDeleteProduct(productDashboard.product.id)} style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(255,61,87,0.3)", background: "white", color: "#ff3d57", fontSize: "13px", cursor: "pointer" }}>🗑️</button>
                                </div>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: "10px", marginBottom: "20px" }}>
                                {[
                                  { label: "Composition", value: productDashboard.composition.length, icon: "🧪", color: "#0a5c36" },
                                  { label: "Safety", value: productDashboard.safety.length, icon: "🛡️", color: "#6366f1" },
                                  { label: "Trust Score", value: productDashboard.product.trust_score, icon: "⭐", color: productDashboard.product.trust_score >= 75 ? "#00c853" : "#ff8f00" },
                                  { label: "Status", value: productDashboard.product.is_published ? "LIVE" : "DRAFT", icon: productDashboard.product.is_published ? "🟢" : "🟡", color: productDashboard.product.is_published ? "#00c853" : "#ff8f00" },
                                ].map(stat => (
                                  <div key={stat.label} style={{ background: "#f8faf8", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                                    <div style={{ fontSize: "18px" }}>{stat.icon}</div>
                                    <div style={{ fontSize: "16px", fontWeight: "900", color: stat.color }}>{stat.value}</div>
                                    <div style={{ fontSize: "10px", color: "#9ca3af", fontWeight: "600" }}>{stat.label}</div>
                                  </div>
                                ))}
                              </div>

                              {editingProduct && (
                                <div style={{ background: "#f8faf8", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                                  <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0d1117", marginBottom: "14px" }}>Edit Product Details</h4>
                                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "12px" }}>
                                    <div><label style={labelStyle}>Name</label><input style={inputStyle} value={productDashboard.product.name || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, name: e.target.value}})}/></div>
                                    <div><label style={labelStyle}>Brand</label><input style={inputStyle} value={productDashboard.product.brand || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, brand: e.target.value}})}/></div>
                                    <div>
                                      {/* A20 — Trust score with min 1 validation */}
                                      <label style={labelStyle}>Trust Score (1-100)</label>
                                      <input type="number" min="1" max="100" style={{ ...inputStyle, borderColor: (parseInt(productDashboard.product.trust_score) < 1 || parseInt(productDashboard.product.trust_score) > 100) ? "rgba(255,61,87,0.4)" : "rgba(0,200,83,0.2)" }} value={productDashboard.product.trust_score || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, trust_score: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))}})}/>
                                    </div>
                                    <div><label style={labelStyle}>Category</label><CategorySelect value={productDashboard.product.category} onChange={v => setProductDashboard({...productDashboard, product: {...productDashboard.product, category: v}})}/></div>
                                    <div><label style={labelStyle}>Test Date</label><input type="date" style={inputStyle} value={productDashboard.product.test_date || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, test_date: e.target.value}})}/></div>
                                    <div><label style={labelStyle}>Batch Number</label><input style={inputStyle} value={productDashboard.product.batch_number || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, batch_number: e.target.value}})}/></div>
                                    <div><label style={labelStyle}>Expiry Date</label><input type="date" style={inputStyle} value={productDashboard.product.expiry_date || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, expiry_date: e.target.value}})}/></div>
                                    <div><label style={labelStyle}>Testing Status</label><select style={inputStyle} value={productDashboard.product.testing_status || "passed"} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, testing_status: e.target.value}})}><option value="passed">✅ Passed</option><option value="failed">❌ Failed</option><option value="partial">⚠️ Partial</option></select></div>
                                    <div><label style={labelStyle}>Price (₹)</label><input type="number" style={inputStyle} value={productDashboard.product.price || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, price: e.target.value}})}/></div>
                                    <div><label style={labelStyle}>Sale Price (₹)</label><input type="number" style={inputStyle} value={productDashboard.product.discounted_price || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, discounted_price: e.target.value}})}/></div>
                                    <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Image URL</label><input style={inputStyle} value={productDashboard.product.product_image_url || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, product_image_url: e.target.value}})}/></div>
                                    <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Buy / Affiliate Link</label><input style={inputStyle} value={productDashboard.product.affiliate_link || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, affiliate_link: e.target.value}})}/></div>
                                    <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>YouTube Link</label><input style={inputStyle} value={productDashboard.product.youtube_url || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, youtube_url: e.target.value}})}/></div>
                                    <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Short Description</label><input style={inputStyle} value={productDashboard.product.short_description || ""} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, short_description: e.target.value}})}/></div>
                                    <div style={{ gridColumn: "1/-1" }}>
                                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                                        <input type="checkbox" checked={productDashboard.product.is_gold_certified || false} onChange={e => setProductDashboard({...productDashboard, product: {...productDashboard.product, is_gold_certified: e.target.checked}})} style={{ width: "16px", height: "16px", accentColor: "#f59e0b" }}/>
                                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#f59e0b" }}>🏆 Gold Certified</span>
                                      </label>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                                    <button onClick={handleEditProductDetails} style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Save Changes</button>
                                    <button onClick={() => setEditingProduct(false)} style={{ background: "white", color: "#6b7280", border: "1px solid rgba(0,0,0,0.1)", padding: "10px 18px", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                                  </div>
                                </div>
                              )}

                              {showPublishConfirm && !productDashboard.product.is_published && (
                                <div style={{ background: "rgba(0,200,83,0.04)", border: "2px solid rgba(0,200,83,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
                                  <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117", marginBottom: "14px" }}>✅ Final Checklist</h4>
                                  {[
                                    { key: "reviewed", label: "All composition parameters reviewed" },
                                    { key: "accurate", label: "Safety parameters accurately extracted" },
                                    { key: "score", label: "Trust score correctly reflects safety" },
                                    { key: "image", label: "Product image added and correct" },
                                    { key: "link", label: "Buy link added and working" },
                                  ].map(check => (
                                    <label key={check.key} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                                      <input type="checkbox" checked={publishChecks[check.key]} onChange={e => setPublishChecks({...publishChecks, [check.key]: e.target.checked})} style={{ accentColor: "#00c853", width: "16px", height: "16px" }}/>
                                      <span style={{ fontSize: "14px", color: "#0d1117" }}>{check.label}</span>
                                    </label>
                                  ))}
                                  <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                                    <button onClick={() => handlePublish(true)} style={{ background: Object.values(publishChecks).every(v => v) ? "linear-gradient(135deg,#0a5c36,#00c853)" : "#9ca3af", color: "white", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: "800", cursor: Object.values(publishChecks).every(v => v) ? "pointer" : "not-allowed" }}>Publish Live 🚀</button>
                                    <button onClick={() => setShowPublishConfirm(false)} style={{ background: "white", color: "#6b7280", border: "1px solid rgba(0,0,0,0.1)", padding: "12px 18px", borderRadius: "10px", fontSize: "14px", cursor: "pointer" }}>Cancel</button>
                                  </div>
                                </div>
                              )}

                              {/* COMPOSITION */}
                              <div style={{ marginBottom: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                  <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117" }}>🧪 Composition ({productDashboard.composition.length})</h3>
                                  <button onClick={() => { setShowAddComp(!showAddComp); setShowAddSafety(false) }} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: showAddComp ? "rgba(255,61,87,0.1)" : "rgba(0,200,83,0.1)", color: showAddComp ? "#ff3d57" : "#0a5c36", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>{showAddComp ? "Cancel" : "+ Add"}</button>
                                </div>
                                {showAddComp && (
                                  <form onSubmit={handleAddComp} style={{ background: "rgba(0,200,83,0.04)", border: "1px solid rgba(0,200,83,0.15)", borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "8px", marginBottom: "10px" }}>
                                      <div><label style={labelStyle}>Type</label><select style={inputStyle} value={addCompForm.parameter_type} onChange={e => setAddCompForm({...addCompForm, parameter_type: e.target.value})}><option value="general">General</option><option value="macro">Macro</option><option value="amino_acid">Amino Acid</option><option value="heavy_metal">Heavy Metal</option></select></div>
                                      <div><label style={labelStyle}>Parameter *</label><input style={inputStyle} value={addCompForm.parameter_name} onChange={e => setAddCompForm({...addCompForm, parameter_name: e.target.value})} required/></div>
                                      <div><label style={labelStyle}>Label Claim</label><input style={inputStyle} value={addCompForm.label_claim} onChange={e => setAddCompForm({...addCompForm, label_claim: e.target.value})}/></div>
                                      <div><label style={labelStyle}>Lab Result *</label><input style={inputStyle} value={addCompForm.lab_result} onChange={e => setAddCompForm({...addCompForm, lab_result: e.target.value})} required/></div>
                                      <div><label style={labelStyle}>LOQ</label><input style={inputStyle} value={addCompForm.loq} onChange={e => setAddCompForm({...addCompForm, loq: e.target.value})}/></div>
                                      <div><label style={labelStyle}>Unit</label><input style={inputStyle} value={addCompForm.unit} onChange={e => setAddCompForm({...addCompForm, unit: e.target.value})}/></div>
                                      <div><label style={labelStyle}>Status</label><select style={inputStyle} value={addCompForm.status} onChange={e => setAddCompForm({...addCompForm, status: e.target.value})}><option value="accurate">Accurate</option><option value="mismatch">Mismatch</option><option value="borderline">Borderline</option></select></div>
                                    </div>
                                    <button type="submit" style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Add to {productDashboard.product.product_code}</button>
                                  </form>
                                )}
                                {productDashboard.composition.length === 0 ? (
                                  <div style={{ background: "#f8faf8", borderRadius: "8px", padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>No composition data.</div>
                                ) : (
                                  <div style={{ overflowX: "auto", borderRadius: "10px", border: "1px solid rgba(0,200,83,0.08)" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                      <thead><tr style={{ background: "#f8faf8" }}>{["Type","Parameter","Label","Result","LOQ","Unit","Status",""].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "10px", fontWeight: "800", color: "#6b7280", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(0,200,83,0.08)", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                                      <tbody>
                                        {productDashboard.composition.map(row => (
                                          <tr key={row.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                                            {editingComp && editingComp.id === row.id ? (
                                              <>
                                                <td style={{ padding: "6px 8px" }}><select style={{...inputStyle, padding: "4px 8px", fontSize: "11px"}} value={editingComp.parameter_type || "general"} onChange={e => setEditingComp({...editingComp, parameter_type: e.target.value})}><option value="general">Gen</option><option value="macro">Macro</option><option value="amino_acid">Amino</option><option value="heavy_metal">Metal</option></select></td>
                                                <td style={{ padding: "6px 8px" }}><input style={{...inputStyle, padding: "4px 8px", fontSize: "12px"}} value={editingComp.parameter_name} onChange={e => setEditingComp({...editingComp, parameter_name: e.target.value})}/></td>
                                                <td style={{ padding: "6px 8px" }}><input style={{...inputStyle, padding: "4px 8px", fontSize: "12px"}} value={editingComp.label_claim || ""} onChange={e => setEditingComp({...editingComp, label_claim: e.target.value})}/></td>
                                                <td style={{ padding: "6px 8px" }}><input style={{...inputStyle, padding: "4px 8px", fontSize: "12px"}} value={editingComp.lab_result} onChange={e => setEditingComp({...editingComp, lab_result: e.target.value})}/></td>
                                                <td style={{ padding: "6px 8px" }}><input style={{...inputStyle, padding: "4px 8px", fontSize: "12px"}} value={editingComp.loq || ""} onChange={e => setEditingComp({...editingComp, loq: e.target.value})}/></td>
                                                <td style={{ padding: "6px 8px" }}><input style={{...inputStyle, padding: "4px 8px", fontSize: "12px"}} value={editingComp.unit || ""} onChange={e => setEditingComp({...editingComp, unit: e.target.value})}/></td>
                                                <td style={{ padding: "6px 8px" }}><select style={{...inputStyle, padding: "4px 8px", fontSize: "11px"}} value={editingComp.status} onChange={e => setEditingComp({...editingComp, status: e.target.value})}><option value="accurate">Accurate</option><option value="mismatch">Mismatch</option><option value="borderline">Borderline</option></select></td>
                                                <td style={{ padding: "6px 8px" }}><div style={{ display: "flex", gap: "4px" }}><button onClick={() => handleEditComp(editingComp)} style={{ padding: "4px 10px", background: "#00c853", color: "white", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "700" }}>Save</button><button onClick={() => setEditingComp(null)} style={{ padding: "4px 8px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}>×</button></div></td>
                                              </>
                                            ) : (
                                              <>
                                                <td style={{ padding: "8px 12px" }}><span style={{ fontSize: "9px", fontWeight: "700", color: "#6b7280", background: "#f3f4f6", borderRadius: "4px", padding: "2px 5px", textTransform: "uppercase" }}>{(row.parameter_type || "gen").replace("_", " ")}</span></td>
                                                <td style={{ padding: "8px 12px", fontSize: "13px", fontWeight: "700" }}>{row.parameter_name}</td>
                                                <td style={{ padding: "8px 12px", fontSize: "12px", color: "#6b7280" }}>{row.label_claim || "—"}</td>
                                                <td style={{ padding: "8px 12px", fontSize: "13px", fontWeight: "700", color: row.lab_result === "NOT_IN_REPORT" ? "#ff8f00" : "#0d1117" }}>{row.lab_result}</td>
                                                <td style={{ padding: "8px 12px", fontSize: "12px", color: "#9ca3af" }}>{row.loq || "—"}</td>
                                                <td style={{ padding: "8px 12px", fontSize: "12px", color: "#9ca3af" }}>{row.unit || "—"}</td>
                                                <td style={{ padding: "8px 12px" }}><span style={{ color: getStatusColor(row.status), fontSize: "10px", fontWeight: "800", textTransform: "uppercase" }}>{row.status}</span></td>
                                                <td style={{ padding: "8px 12px" }}><div style={{ display: "flex", gap: "4px" }}><button onClick={() => setEditingComp({...row})} style={{ padding: "4px 10px", background: "rgba(0,200,83,0.1)", color: "#0a5c36", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "700" }}>Edit</button><button onClick={() => handleDeleteComp(row.id)} style={{ padding: "4px 8px", background: "rgba(255,61,87,0.1)", color: "#ff3d57", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}>Del</button></div></td>
                                              </>
                                            )}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* SAFETY */}
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                  <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#0d1117" }}>🛡️ Safety ({productDashboard.safety.length})</h3>
                                  <button onClick={() => { setShowAddSafety(!showAddSafety); setShowAddComp(false) }} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: showAddSafety ? "rgba(255,61,87,0.1)" : "rgba(0,200,83,0.1)", color: showAddSafety ? "#ff3d57" : "#0a5c36", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>{showAddSafety ? "Cancel" : "+ Add"}</button>
                                </div>
                                {showAddSafety && (
                                  <form onSubmit={handleAddSafety} style={{ background: "rgba(0,200,83,0.04)", border: "1px solid rgba(0,200,83,0.15)", borderRadius: "10px", padding: "14px", marginBottom: "10px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "8px", marginBottom: "10px" }}>
                                      <div><label style={labelStyle}>Parameter *</label><input style={inputStyle} value={addSafetyForm.parameter_name} onChange={e => setAddSafetyForm({...addSafetyForm, parameter_name: e.target.value})} placeholder="e.g. Heavy Metals - Lead" required/></div>
                                      <div><label style={labelStyle}>Result</label><input style={inputStyle} value={addSafetyForm.result} onChange={e => setAddSafetyForm({...addSafetyForm, result: e.target.value})} placeholder="0.02 mg/kg"/></div>
                                      <div><label style={labelStyle}>Status</label><select style={inputStyle} value={addSafetyForm.status} onChange={e => setAddSafetyForm({...addSafetyForm, status: e.target.value})}><option value="safe">Safe</option><option value="borderline">Borderline</option><option value="unsafe">Unsafe</option><option value="not_tested">Not Tested</option></select></div>
                                      <div><label style={labelStyle}>Safe Limit</label><input style={inputStyle} value={addSafetyForm.safe_limit} onChange={e => setAddSafetyForm({...addSafetyForm, safe_limit: e.target.value})} placeholder="Max 0.5 mg/kg"/></div>
                                      <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Details</label><input style={inputStyle} value={addSafetyForm.details} onChange={e => setAddSafetyForm({...addSafetyForm, details: e.target.value})} placeholder="Health explanation"/></div>
                                    </div>
                                    <button type="submit" style={{ background: "linear-gradient(135deg,#0a5c36,#00c853)", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>Add to {productDashboard.product.product_code}</button>
                                  </form>
                                )}
                                {productDashboard.safety.length === 0 ? (
                                  <div style={{ background: "#f8faf8", borderRadius: "8px", padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>No safety parameters.</div>
                                ) : (
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {productDashboard.safety.map(param => (
                                      <div key={param.id} style={{ background: "#f8faf8", borderRadius: "8px", padding: "12px 14px", borderLeft: "3px solid " + getStatusColor(param.status) }}>
                                        {editingSafety && editingSafety.id === param.id ? (
                                          <div>
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "8px", marginBottom: "8px" }}>
                                              <div><label style={labelStyle}>Parameter</label><input style={inputStyle} value={editingSafety.parameter_name} onChange={e => setEditingSafety({...editingSafety, parameter_name: e.target.value})}/></div>
                                              <div><label style={labelStyle}>Result</label><input style={inputStyle} value={editingSafety.result || ""} onChange={e => setEditingSafety({...editingSafety, result: e.target.value})}/></div>
                                              <div><label style={labelStyle}>Status</label><select style={inputStyle} value={editingSafety.status} onChange={e => setEditingSafety({...editingSafety, status: e.target.value})}><option value="safe">Safe</option><option value="borderline">Borderline</option><option value="unsafe">Unsafe</option><option value="not_tested">Not Tested</option></select></div>
                                              <div><label style={labelStyle}>Safe Limit</label><input style={inputStyle} value={editingSafety.safe_limit || ""} onChange={e => setEditingSafety({...editingSafety, safe_limit: e.target.value})}/></div>
                                              <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Details</label><input style={inputStyle} value={editingSafety.details || ""} onChange={e => setEditingSafety({...editingSafety, details: e.target.value})}/></div>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px" }}><button onClick={() => handleEditSafety(editingSafety)} style={{ padding: "6px 16px", background: "#00c853", color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Save</button><button onClick={() => setEditingSafety(null)} style={{ padding: "6px 12px", background: "white", color: "#6b7280", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>Cancel</button></div>
                                          </div>
                                        ) : (
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                                            <div style={{ flex: 1 }}>
                                              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "2px" }}>
                                                <span style={{ fontSize: "13px", fontWeight: "800", color: "#0d1117" }}>{param.parameter_name}</span>
                                                <span style={{ fontSize: "10px", fontWeight: "800", color: getStatusColor(param.status), textTransform: "uppercase" }}>{param.status}</span>
                                              </div>
                                              <div style={{ fontSize: "12px", color: "#6b7280" }}>{param.result === "NOT_IN_REPORT" ? <span style={{ color: "#ff8f00" }}>Not tested</span> : param.result}{param.safe_limit && " · Limit: " + param.safe_limit}</div>
                                              {param.details && <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>{param.details}</div>}
                                            </div>
                                            <div style={{ display: "flex", gap: "4px" }}>
                                              <button onClick={() => setEditingSafety({...param})} style={{ padding: "4px 10px", background: "rgba(0,200,83,0.1)", color: "#0a5c36", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "700" }}>Edit</button>
                                              <button onClick={() => handleDeleteSafety(param.id)} style={{ padding: "4px 8px", background: "rgba(255,61,87,0.1)", color: "#ff3d57", border: "none", borderRadius: "4px", fontSize: "11px", cursor: "pointer" }}>Del</button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BRANDS */}
          {activeTab === "brands" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0d1117", marginBottom: "4px" }}>Certified Brands</h1>
                  <p style={{ color: "#9ca3af", fontSize: "14px" }}>{brands.length} brands</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={fetchBrands} style={{ padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(0,200,83,0.2)", background: "white", color: "#0a5c36", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>🔄</button>
                  <button onClick={() => setShowAddBrand(!showAddBrand)} style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" }}>
                    {showAddBrand ? "× Close" : "+ Add Brand"}
                  </button>
                </div>
              </div>
              {showAddBrand && <BrandForm form={brandForm} setForm={setBrandForm} onSubmit={handleAddBrand} onCancel={() => setShowAddBrand(false)} title="Add New Certified Brand"/>}
              {brandsLoading ? (
                <div style={{ textAlign: "center", padding: "60px" }}><div style={{ width: "36px", height: "36px", border: "3px solid rgba(99,102,241,0.2)", borderTop: "3px solid #6366f1", borderRadius: "50%", margin: "0 auto", animation: "spin 1s linear infinite" }}/></div>
              ) : brands.length === 0 ? (
                <div style={{ background: "white", borderRadius: "20px", padding: "60px", textAlign: "center", border: "1px solid rgba(0,200,83,0.08)" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏭</div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>No Brands Yet</h3>
                  <button onClick={() => setShowAddBrand(true)} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", padding: "12px 28px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginTop: "12px" }}>+ Add First Brand</button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "16px" }}>
                  {brands.map(brand => (
                    <div key={brand.id} style={{ background: "white", borderRadius: "20px", border: "1px solid " + (brand.is_gold_partner ? "rgba(245,158,11,0.3)" : "rgba(0,200,83,0.1)"), overflow: "hidden" }}>
                      <div style={{ height: "4px", background: brand.is_gold_partner ? "linear-gradient(90deg,#f59e0b,#d97706)" : "linear-gradient(90deg,#0a5c36,#00c853)" }}/>
                      <div style={{ padding: "20px" }}>
                        {editingBrand && editingBrand.id === brand.id ? (
                          <BrandForm form={editingBrand} setForm={setEditingBrand} onSubmit={e => { e.preventDefault(); handleEditBrand() }} onCancel={() => setEditingBrand(null)} title={"Edit: " + brand.name}/>
                        ) : (
                          <>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                {brand.logo_url ? (
                                  <img src={brand.logo_url} alt={brand.name} loading="lazy" style={{ width: "52px", height: "52px", borderRadius: "12px", objectFit: "contain", background: "#f8faf8", border: "1px solid rgba(0,0,0,0.06)", padding: "4px" }} onError={e => e.target.style.display = "none"}/>
                                ) : (
                                  <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: brand.is_gold_partner ? "linear-gradient(135deg,#fef3c7,#fde68a)" : "rgba(0,200,83,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>{brand.is_gold_partner ? "🏆" : "🏭"}</div>
                                )}
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                    <h3 style={{ fontSize: "16px", fontWeight: "900", color: "#0d1117" }}>{brand.name}</h3>
                                    {brand.is_gold_partner && <span style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "white", fontSize: "9px", fontWeight: "800", padding: "2px 6px", borderRadius: "4px" }}>GOLD</span>}
                                  </div>
                                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <span style={{ fontSize: "22px", fontWeight: "900", color: brand.avgScore >= 80 ? "#00c853" : brand.avgScore >= 60 ? "#ff8f00" : "#ff3d57" }}>{brand.grade || "—"}</span>
                                    <div>
                                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280" }}>Avg: {brand.avgScore || 0}/100</div>
                                      <div style={{ fontSize: "11px", color: "#9ca3af" }}>{brand.productCount || 0} tested</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button onClick={() => setEditingBrand({...brand})} style={{ padding: "6px 12px", background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>Edit</button>
                                <button onClick={() => handleDeleteBrand(brand.id)} style={{ padding: "6px 10px", background: "rgba(255,61,87,0.1)", color: "#ff3d57", border: "none", borderRadius: "6px", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
                              </div>
                            </div>
                            {brand.description && <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px", lineHeight: "1.5" }}>{brand.description}</p>}
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                              <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "600", background: brand.is_active ? "rgba(0,200,83,0.08)" : "rgba(255,61,87,0.08)", color: brand.is_active ? "#0a5c36" : "#ff3d57" }}>{brand.is_active ? "🟢 Active" : "🔴 Inactive"}</span>
                              <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "600", background: "rgba(99,102,241,0.08)", color: "#6366f1" }}>{brand.certification_type === "gold" ? "🏆 Gold" : "✅ Certified"}</span>
                              {brand.publishedCount > 0 && <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", fontWeight: "600", background: "rgba(0,200,83,0.08)", color: "#0a5c36" }}>{brand.publishedCount} live</span>}
                            </div>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              {brand.website_url && <a href={brand.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#6b7280", textDecoration: "none", padding: "5px 10px", borderRadius: "6px", background: "#f8faf8" }}>🌐 Website</a>}
                              {brand.shop_url && <a href={brand.shop_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "12px", color: "#0a5c36", textDecoration: "none", padding: "5px 10px", borderRadius: "6px", background: "rgba(0,200,83,0.06)" }}>🛒 Shop</a>}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: "640px" }}>
              <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#0d1117", marginBottom: "24px" }}>Settings</h1>
              <div style={{ background: "white", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "8px" }}>🔐 Admin Password</h2>
                <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px" }}>
                  <p style={{ fontSize: "13px", color: "#6366f1", fontWeight: "600", lineHeight: "1.6" }}>
                    🔒 Password is server-verified via <code>ADMIN_MASTER_PASSWORD</code> in <code>.env.local</code>. To change it, update the env variable and restart the server.
                  </p>
                </div>
                <form onSubmit={handleChangePassword}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "16px" }}>
                    <div><label style={labelStyle}>Verify Current Password</label><input type="password" value={pwForm.current} onChange={e => setPwForm({...pwForm, current: e.target.value})} style={inputStyle} required/></div>
                    <div><label style={labelStyle}>New Password (Reference)</label><input type="password" value={pwForm.newPw} onChange={e => setPwForm({...pwForm, newPw: e.target.value})} style={inputStyle}/></div>
                    <div><label style={labelStyle}>Confirm</label><input type="password" value={pwForm.confirm} onChange={e => setPwForm({...pwForm, confirm: e.target.value})} style={inputStyle}/></div>
                  </div>
                  {pwMessage && <div style={{ background: pwMessage.startsWith("error:") ? "rgba(255,61,87,0.08)" : "rgba(99,102,241,0.08)", border: "1px solid " + (pwMessage.startsWith("error:") ? "rgba(255,61,87,0.2)" : "rgba(99,102,241,0.2)"), borderRadius: "10px", padding: "12px 16px", color: pwMessage.startsWith("error:") ? "#c62828" : "#6366f1", fontSize: "13px", fontWeight: "600", marginBottom: "16px" }}>{pwMessage.replace(/^(error:|success:)/, "")}</div>}
                  <button type="submit" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", padding: "12px 32px", borderRadius: "10px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}>Verify Password</button>
                </form>
              </div>
              <div style={{ background: "white", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,200,83,0.08)", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>📊 Database Summary</h2>
                {dashData && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { label: "Total Products", value: dashData.stats.total },
                      { label: "Live on Website", value: dashData.stats.live },
                      { label: "Draft Pending", value: dashData.stats.draft },
                      { label: "Gold Certified", value: dashData.stats.gold },
                      { label: "Certified Brands", value: dashData.stats.brands },
                      { label: "Total Lab Parameters", value: dashData.stats.totalComposition + dashData.stats.totalSafety },
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8faf8", borderRadius: "8px" }}>
                        <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>{item.label}</span>
                        <span style={{ fontSize: "14px", color: "#0d1117", fontWeight: "800" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ background: "white", borderRadius: "20px", padding: "28px", border: "1px solid rgba(0,200,83,0.08)" }}>
                <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#0d1117", marginBottom: "16px" }}>🔗 Quick Links</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { label: "Trustified Official Website", url: "https://www.trustified.in", icon: "🌐" },
                    { label: "YouTube Channel", url: "https://www.youtube.com/@Trustified-Certification", icon: "▶️" },
                    { label: "Trustified Shop", url: "https://shop.trustified.in", icon: "🛒" },
                    { label: "View Live Website", url: "/", icon: "🚀" },
                  ].map(link => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", background: "#f8faf8", borderRadius: "10px", textDecoration: "none", color: "#0d1117", fontSize: "14px", fontWeight: "600" }}>
                      <span>{link.icon}</span> {link.label} <span style={{ marginLeft: "auto", color: "#9ca3af" }}>→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}