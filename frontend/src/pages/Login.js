import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from 'react-router-dom';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          // Auto login after registration
          const loginResult = await login(formData.email, formData.password);
          result = loginResult;
        }
      }

      if (result.success) {
        history.push('/choose-language');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 max-w-md mx-auto fade-up">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? 'Login' : 'Register'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-lg font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-xl p-3 text-lg"
              required={!isLogin}
            />
          </div>
        )}
        
        <div>
          <label className="block text-lg font-semibold mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 text-lg"
            required
          />
        </div>
        
        <div>
          <label className="block text-lg font-semibold mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border rounded-xl p-3 text-lg"
            required
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-lg text-center">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full btn disabled:opacity-50"
        >
          {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
        </button>
      </form>
      
      <div className="text-center mt-4">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary text-lg font-semibold"
        >
          {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;