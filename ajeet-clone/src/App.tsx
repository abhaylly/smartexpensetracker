import { Link, Route, Routes, useParams } from 'react-router-dom'
import './App.css'

function HomePage() {
  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Ajeet Clone</h1>
      <p>Open the product page below:</p>
      <ul>
        <li>
          <Link to="/product/10">Product 10</Link>
        </li>
      </ul>
    </div>
  )
}

function ProductPage() {
  const { id } = useParams()
  const src = `https://www.ajeetseed.co.in/product/get-product/${id ?? '10'}`
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <iframe
        src={src}
        style={{ border: 'none', width: '100%', height: '100%' }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  )
}
