import React, { useState } from 'react'

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simple password check (replace with secure backend check for production)
    if (password === 'Success1101') {
      localStorage.setItem('adminMode', 'true')
      setError('')
      if (onSuccess) onSuccess()
      window.location.reload()
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-xl shadow-2xl flex flex-col gap-4 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="px-4 py-3 rounded-lg bg-slate-800 text-white border border-cyan-500 focus:ring-2 focus:ring-cyan-400"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 rounded-lg">Login</button>
      </form>
    </div>
  )
}
