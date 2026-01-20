'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from './actions'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        const res = await login(formData)
        if (res?.error) {
            setError(res.error)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>NewsInsight AI</h1>
                <h2>Admin Login</h2>
                <form action={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn-primary">
                        Sign In
                    </button>
                </form>
            </div>
            <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f0f2f5;
        }
        .login-card {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }
        h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }
        h2 {
          color: #666;
          margin-bottom: 2rem;
          font-weight: 400;
        }
        .form-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #555;
        }
        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }
        .error-message {
          color: #d32f2f;
          margin-bottom: 1rem;
        }
        .btn-primary {
          width: 100%;
          padding: 0.75rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #0056b3;
        }
      `}</style>
        </div>
    )
}
