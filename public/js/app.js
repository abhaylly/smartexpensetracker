(function () {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    window.location.href = '/index.html';
    return;
  }

  const state = {
    transactions: [],
    editingId: null,
    filters: { type: 'all', category: 'all', startDate: '', endDate: '' }
  };

  document.getElementById('user-name').textContent = 'Hi, ' + (user.name || 'User');

  function formatCurrency(amount) {
    return '\u20B9' + parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
  }

  function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  async function fetchTransactions() {
    const params = new URLSearchParams();
    if (state.filters.type !== 'all') params.set('type', state.filters.type);
    if (state.filters.category !== 'all') params.set('category', state.filters.category);
    if (state.filters.startDate) params.set('startDate', state.filters.startDate);
    if (state.filters.endDate) params.set('endDate', state.filters.endDate);

    try {
      const res = await fetch('/api/transactions?' + params.toString(), {
        headers: authHeaders()
      });

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = '/index.html';
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to load transactions.', 'error');
        return;
      }

      state.transactions = data.transactions;
      renderSummary(data.summary);
      renderTable(data.transactions);
    } catch (err) {
      showToast('Network error. Please refresh.', 'error');
    }
  }

  function renderSummary(summary) {
    document.getElementById('total-income').textContent = formatCurrency(summary.totalIncome);
    document.getElementById('total-expense').textContent = formatCurrency(summary.totalExpense);

    const balanceEl = document.getElementById('balance');
    balanceEl.textContent = formatCurrency(summary.balance);
    balanceEl.style.color = summary.balance < 0 ? 'var(--expense)' : 'var(--balance)';
  }

  function renderTable(transactions) {
    const tbody = document.getElementById('transactions-body');
    const footer = document.getElementById('table-footer');
    const rowCount = document.getElementById('row-count');

    tbody.innerHTML = '';

    if (!transactions.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No transactions found.</td></tr>';
      footer.classList.add('hidden');
      return;
    }

    transactions.forEach(function (t) {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + formatDate(t.date) + '</td>' +
        '<td><span class="type-badge badge-' + t.type + '">' + t.type + '</span></td>' +
        '<td>' + escapeHtml(t.category) + '</td>' +
        '<td>' + (t.description ? escapeHtml(t.description) : '<span style="color:var(--neutral-400)">-</span>') + '</td>' +
        '<td class="amount-' + t.type + '">' + (t.type === 'income' ? '+' : '-') + formatCurrency(t.amount) + '</td>' +
        '<td>' +
          '<div class="action-btns">' +
            '<button class="btn btn-warning btn-sm edit-btn" data-id="' + t.id + '">Edit</button>' +
            '<button class="btn btn-danger btn-sm delete-btn" data-id="' + t.id + '">Delete</button>' +
          '</div>' +
        '</td>';
      tbody.appendChild(tr);
    });

    rowCount.textContent = transactions.length + ' transaction' + (transactions.length !== 1 ? 's' : '');
    footer.classList.remove('hidden');

    tbody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => handleEdit(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDelete(btn.dataset.id));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  function handleEdit(id) {
    const t = state.transactions.find(x => x.id === id);
    if (!t) return;

    state.editingId = id;
    document.getElementById('edit-id').value = id;
    document.getElementById('amount').value = t.amount;
    document.getElementById('category').value = t.category;
    document.getElementById('date').value = t.date;
    document.getElementById('description').value = t.description || '';

    document.querySelectorAll('input[name="type"]').forEach(radio => {
      radio.checked = radio.value === t.type;
    });

    document.getElementById('form-title').textContent = 'Edit Transaction';
    document.getElementById('submit-btn').textContent = 'Update Transaction';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');

    document.getElementById('transaction-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transaction? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/transactions/' + id, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Delete failed.', 'error');
        return;
      }

      showToast('Transaction deleted.', 'success');
      fetchTransactions();
    } catch (err) {
      showToast('Network error.', 'error');
    }
  }

  function resetForm() {
    document.getElementById('transaction-form').reset();
    document.getElementById('edit-id').value = '';
    state.editingId = null;
    document.getElementById('form-title').textContent = 'Add Transaction';
    document.getElementById('submit-btn').textContent = 'Add Transaction';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    document.querySelector('input[name="type"][value="income"]').checked = true;
    setDefaultDate();
  }

  function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
  }

  document.getElementById('transaction-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const btn = document.getElementById('submit-btn');
    const isEditing = !!state.editingId;

    const type = document.querySelector('input[name="type"]:checked').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value.trim();

    if (!type || !amount || !category || !date) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const body = { type, amount: parseFloat(amount), category, date, description };
    const url = isEditing ? '/api/transactions/' + state.editingId : '/api/transactions';
    const method = isEditing ? 'PUT' : 'POST';

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Failed to save.', 'error');
        return;
      }

      showToast(isEditing ? 'Transaction updated.' : 'Transaction added.', 'success');
      resetForm();
      fetchTransactions();
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = isEditing ? 'Update Transaction' : 'Add Transaction';
    }
  });

  document.getElementById('cancel-edit-btn').addEventListener('click', resetForm);

  document.getElementById('apply-filters-btn').addEventListener('click', function () {
    state.filters.type = document.getElementById('filter-type').value;
    state.filters.category = document.getElementById('filter-category').value;
    state.filters.startDate = document.getElementById('filter-start').value;
    state.filters.endDate = document.getElementById('filter-end').value;
    fetchTransactions();
  });

  document.getElementById('reset-filters-btn').addEventListener('click', function () {
    state.filters = { type: 'all', category: 'all', startDate: '', endDate: '' };
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-start').value = '';
    document.getElementById('filter-end').value = '';
    fetchTransactions();
  });

  document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.clear();
    window.location.href = '/index.html';
  });

  setDefaultDate();
  fetchTransactions();
})();
