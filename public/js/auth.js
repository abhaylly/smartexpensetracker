(function () {
  if (localStorage.getItem('token')) {
    window.location.href = '/dashboard.html';
    return;
  }

  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  const messageEl = document.getElementById('auth-message');

  function switchTab(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    panels.forEach(p => p.classList.toggle('active', p.id === name + '-panel'));
    hideMessage();
  }

  tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

  document.querySelectorAll('[data-switch]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      switchTab(link.dataset.switch);
    });
  });

  function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'auth-message ' + type;
  }

  function hideMessage() {
    messageEl.className = 'auth-message hidden';
  }

  function setLoading(btn, loading, text) {
    btn.disabled = loading;
    btn.textContent = loading ? 'Please wait...' : text;
  }

  document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }

    setLoading(btn, true, 'Login');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        showMessage(data.error || 'Login failed.', 'error');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/dashboard.html';
    } catch (err) {
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setLoading(btn, false, 'Login');
    }
  });

  document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!name || !email || !password || !confirm) {
      showMessage('Please fill in all fields.', 'error');
      return;
    }

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters.', 'error');
      return;
    }

    if (password !== confirm) {
      showMessage('Passwords do not match.', 'error');
      return;
    }

    setLoading(btn, true, 'Create Account');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        const supabaseMsg =
          data?.supabaseError?.message ||
          data?.supabaseError?.details ||
          data?.supabaseError?.hint;
        showMessage(supabaseMsg || data?.error || 'Registration failed.', 'error');
        return;
      }

      document.getElementById('register-form').reset();
      showMessage('Account created! Please login.', 'success');
      switchTab('login');
    } catch (err) {
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setLoading(btn, false, 'Create Account');
    }
  });
})();
