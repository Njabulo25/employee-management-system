const API_BASE = '/api/employees';

// Hamburger menu toggle
function toggleMenu() {
    document.getElementById('sidebarNav').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupSearchListeners();
    loadDashboard();

    // Close mobile menu when a nav link is clicked
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', () => {
            document.getElementById('sidebarNav').classList.remove('open');
        });
    });
});

function setupNavigation() {
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const page = link.dataset.page;
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            document.getElementById(`page-${page}`).classList.add('active');
            switch(page) {
                case 'dashboard': loadDashboard(); break;
                case 'employees': loadAllEmployees(); break;
                case 'active': loadActiveEmployees(); break;
                case 'archived': loadArchivedEmployees(); break;
            }
        });
    });
}

async function loadDashboard() {
    try {
        const response = await fetch(API_BASE);
        const employees = await response.json();
        const total = employees.length;
        const active = employees.filter(e => e.employmentStatus === 'active').length;
        const onLeave = employees.filter(e => e.employmentStatus === 'on_leave').length;
        const archived = employees.filter(e => e.employmentStatus === 'archived').length;
        document.getElementById('statTotal').textContent = total;
        document.getElementById('statActive').textContent = active;
        document.getElementById('statLeave').textContent = onLeave;
        document.getElementById('statArchived').textContent = archived;
        const recent = employees.filter(e => e.employmentStatus !== 'archived').slice(0, 5);
        const tbody = document.getElementById('recentTableBody');
        if (recent.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">No employees found</td></tr>';
            return;
        }
        tbody.innerHTML = recent.map(emp => `
            <tr>
                <td><span class="employee-name" onclick="viewEmployee(${emp.id})">${emp.firstName} ${emp.lastName}</span><br><small style="color:#6b7280;">${emp.employeeNumber}</small></td>
                <td>${emp.jobTitle || '-'}</td>
                <td>${emp.location || '-'}</td>
                <td><span class="badge badge-${emp.employmentStatus}">${formatStatus(emp.employmentStatus)}</span></td>
            </tr>
        `).join('');
    } catch (error) {
        showToast('Failed to load dashboard', 'error');
    }
}

async function loadAllEmployees() {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Loading...</td></tr>';
    try {
        const response = await fetch(API_BASE);
        const employees = await response.json();
        renderEmployeeTable(tbody, employees);
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Failed to load employees</td></tr>';
        showToast('Failed to load employees', 'error');
    }
}

async function loadActiveEmployees() {
    const tbody = document.getElementById('activeTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Loading...</td></tr>';
    try {
        const response = await fetch(`${API_BASE}/search?status=active`);
        const employees = await response.json();
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No active employees</td></tr>';
            return;
        }
        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.employeeNumber}</td>
                <td><span class="employee-name" onclick="viewEmployee(${emp.id})">${emp.firstName} ${emp.lastName}</span></td>
                <td>${emp.email}</td>
                <td>${emp.jobTitle || '-'}</td>
                <td>${emp.location || '-'}</td>
                <td><div class="actions-cell">
                    <button class="action-btn view" onclick="viewEmployee(${emp.id})" title="View">👁</button>
                    <button class="action-btn edit" onclick="openEditModal(${emp.id})" title="Edit">✏</button>
                </div></td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">Failed to load</td></tr>';
    }
}

async function loadArchivedEmployees() {
    const tbody = document.getElementById('archivedTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading...</td></tr>';
    try {
        const response = await fetch(`${API_BASE}/search?status=archived`);
        const employees = await response.json();
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">No archived employees</td></tr>';
            return;
        }
        tbody.innerHTML = employees.map(emp => `
            <tr>
                <td>${emp.employeeNumber}</td>
                <td><span class="employee-name" onclick="viewEmployee(${emp.id})">${emp.firstName} ${emp.lastName}</span></td>
                <td>${emp.email}</td>
                <td>${emp.jobTitle || '-'}</td>
                <td><div class="actions-cell">
                    <button class="action-btn view" onclick="viewEmployee(${emp.id})" title="View">👁</button>
                    <button class="action-btn edit" onclick="confirmUnarchive(${emp.id}, '${emp.firstName} ${emp.lastName}')" title="Restore">🔄</button>
                    <button class="action-btn archive" onclick="confirmDelete(${emp.id}, '${emp.firstName} ${emp.lastName}')" title="Delete Forever">🗑</button>
                </div></td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">Failed to load</td></tr>';
    }
}

function renderEmployeeTable(tbody, employees) {
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">No employees found</td></tr>';
        return;
    }
    tbody.innerHTML = employees.map(emp => `
        <tr>
            <td><strong>${emp.employeeNumber}</strong></td>
            <td><span class="employee-name" onclick="viewEmployee(${emp.id})">${emp.firstName} ${emp.lastName}</span></td>
            <td>${emp.email}</td>
            <td>${emp.jobTitle || '-'}</td>
            <td>${formatType(emp.employmentType)}</td>
            <td><span class="badge badge-${emp.employmentStatus}">${formatStatus(emp.employmentStatus)}</span></td>
            <td><div class="actions-cell">
                <button class="action-btn view" onclick="viewEmployee(${emp.id})" title="View">👁</button>
                <button class="action-btn edit" onclick="openEditModal(${emp.id})" title="Edit">✏</button>
                ${emp.employmentStatus !== 'archived' ? `
                    <select class="status-quick-select" onchange="quickStatusChange(${emp.id}, this.value, '${emp.firstName} ${emp.lastName}')" title="Change Status">
                        <option value="">⚡</option>
                        <option value="active" ${emp.employmentStatus === 'active' ? 'selected' : ''}>Active</option>
                        <option value="on_leave" ${emp.employmentStatus === 'on_leave' ? 'selected' : ''}>On Leave</option>
                        <option value="terminated" ${emp.employmentStatus === 'terminated' ? 'selected' : ''}>Terminated</option>
                    </select>
                    <button class="action-btn archive" onclick="confirmArchive(${emp.id}, '${emp.firstName} ${emp.lastName}')" title="Archive">📁</button>
                ` : ''}
            </div></td>
        </tr>
    `).join('');
}

function setupSearchListeners() {
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('statusFilter').addEventListener('change', handleSearch);
    document.getElementById('typeFilter').addEventListener('change', handleSearch);
}

function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const status = document.getElementById('statusFilter').value;
    const type = document.getElementById('typeFilter').value;
    let url = `${API_BASE}/search?`;
    if (query) url += `query=${encodeURIComponent(query)}&`;
    if (status) url += `status=${status}&`;
    if (type) url += `employmentType=${type}&`;
    fetch(url).then(res => res.json()).then(employees => {
        renderEmployeeTable(document.getElementById('employeeTableBody'), employees);
    }).catch(() => showToast('Search failed', 'error'));
}

async function viewEmployee(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        const emp = await response.json();
        const skillsArray = emp.skills ? emp.skills.split(',').map(s => s.trim()) : [];

        document.getElementById('viewDetails').innerHTML = `
            <div class="detail-section">
                <h4>Basic Information</h4>
                <div class="detail-row">
                    <div class="detail-item"><label>Employee Number</label><span>${emp.employeeNumber}</span></div>
                    <div class="detail-item"><label>Full Name</label><span>${emp.firstName} ${emp.lastName}</span></div>
                </div>
                <div class="detail-row">
                    <div class="detail-item"><label>Email</label><span>${emp.email}</span></div>
                    <div class="detail-item"><label>Phone</label><span>${emp.phoneNumber || 'Not provided'}</span></div>
                </div>
            </div>
            <div class="detail-section">
                <h4>Work Information</h4>
                <div class="detail-row">
                    <div class="detail-item"><label>Job Title</label><span>${emp.jobTitle || 'Not assigned'}</span></div>
                    <div class="detail-item"><label>Employment Type</label><span>${formatType(emp.employmentType)}</span></div>
                </div>
                <div class="detail-row">
                    <div class="detail-item"><label>Status</label><span><span class="badge badge-${emp.employmentStatus}">${formatStatus(emp.employmentStatus)}</span></span></div>
                    <div class="detail-item"><label>Location</label><span>${emp.location || 'Not specified'}</span></div>
                </div>
                <div class="detail-row">
                    <div class="detail-item"><label>Date of Hire</label><span>${emp.dateOfHire || 'Not recorded'}</span></div>
                    <div class="detail-item"><label>Created</label><span>${emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                </div>
            </div>
            <div class="detail-section">
                <h4>Skills</h4>
                <div class="skills-container">
                    ${skillsArray.map(skill => `
                        <span class="skill-tag">
                            ${skill}
                            <span class="skill-remove" onclick="removeSkillFromView(${emp.id}, '${skill}')" title="Remove skill">&times;</span>
                        </span>
                    `).join('')}
                    <button class="btn btn-sm btn-secondary" onclick="showAddSkillInput(${emp.id})">+ Add Skill</button>
                </div>
                <div id="addSkillInput-${emp.id}" class="add-skill-row" style="display:none; margin-top:10px;">
                    <input type="text" id="newSkill-${emp.id}" placeholder="Enter skill name" style="flex:1;">
                    <button class="btn btn-sm btn-primary" onclick="addSkill(${emp.id})">Add</button>
                </div>
            </div>
        `;

        const archiveBtn = document.getElementById('archiveFromViewBtn');
        if (emp.employmentStatus === 'archived') {
            archiveBtn.style.display = 'none';
        } else {
            archiveBtn.style.display = 'inline-flex';
        }

        document.getElementById('editFromViewBtn').dataset.empId = id;
        archiveBtn.dataset.empId = id;
        archiveBtn.dataset.empName = `${emp.firstName} ${emp.lastName}`;
        openModal('viewModal');
    } catch (error) {
        showToast('Failed to load employee details', 'error');
    }
}

function editFromView() {
    const id = document.getElementById('editFromViewBtn').dataset.empId;
    closeModal('viewModal');
    openEditModal(id);
}

function archiveFromView() {
    const btn = document.getElementById('archiveFromViewBtn');
    confirmArchive(btn.dataset.empId, btn.dataset.empName);
}

function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Add New Employee';
    document.getElementById('employeeForm').reset();
    document.getElementById('employeeId').value = '';
    document.getElementById('employeeNumber').disabled = false;
    openModal('employeeModal');
}

async function openEditModal(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        const emp = await response.json();
        document.getElementById('modalTitle').textContent = 'Edit Employee';
        document.getElementById('employeeId').value = emp.id;
        document.getElementById('employeeNumber').value = emp.employeeNumber;
        document.getElementById('employeeNumber').disabled = true;
        document.getElementById('firstName').value = emp.firstName;
        document.getElementById('lastName').value = emp.lastName;
        document.getElementById('email').value = emp.email;
        document.getElementById('phoneNumber').value = emp.phoneNumber || '';
        document.getElementById('jobTitle').value = emp.jobTitle || '';
        document.getElementById('employmentType').value = emp.employmentType || 'full_time';
        document.getElementById('employmentStatus').value = emp.employmentStatus || 'active';
        document.getElementById('location').value = emp.location || '';
        document.getElementById('skills').value = emp.skills || '';
        document.getElementById('dateOfHire').value = emp.dateOfHire || '';
        openModal('employeeModal');
    } catch (error) {
        showToast('Failed to load employee for editing', 'error');
    }
}

async function saveEmployee() {
    const id = document.getElementById('employeeId').value;
    const isEdit = id !== '';
    const employee = {
        employeeNumber: document.getElementById('employeeNumber').value.trim(),
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        jobTitle: document.getElementById('jobTitle').value.trim(),
        employmentType: document.getElementById('employmentType').value,
        employmentStatus: document.getElementById('employmentStatus').value,
        location: document.getElementById('location').value.trim(),
        skills: document.getElementById('skills').value.trim(),
        dateOfHire: document.getElementById('dateOfHire').value || null
    };
    if (!employee.employeeNumber || !employee.firstName || !employee.lastName || !employee.email) {
        showToast('Please fill in all required fields (*)', 'warning');
        return;
    }
    try {
        const url = isEdit ? `${API_BASE}/${id}` : API_BASE;
        const method = isEdit ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employee)
        });
        if (!response.ok) throw new Error('Save failed');
        closeModal('employeeModal');
        showToast(isEdit ? 'Employee updated successfully' : 'Employee created successfully', 'success');
        refreshCurrentView();
    } catch (error) {
        showToast('Failed to save employee', 'error');
    }
}

function confirmArchive(id, name) {
    document.getElementById('confirmMessage').textContent = `Archive ${name}? They will be moved to the archive.`;
    document.getElementById('confirmBtn').onclick = () => archiveEmployee(id);
    document.getElementById('confirmBtn').className = 'btn btn-danger';
    document.getElementById('confirmBtn').textContent = 'Yes, Archive';
    openModal('confirmModal');
}

async function archiveEmployee(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}/archive`, { method: 'PATCH' });
        if (!response.ok) throw new Error('Archive failed');
        closeModal('confirmModal');
        closeModal('viewModal');
        showToast('Employee archived successfully', 'success');
        refreshCurrentView();
    } catch (error) {
        closeModal('confirmModal');
        showToast('Failed to archive employee', 'error');
    }
}

function confirmUnarchive(id, name) {
    document.getElementById('confirmMessage').textContent = `Restore ${name} back to active status?`;
    document.getElementById('confirmBtn').onclick = () => unarchiveEmployee(id);
    document.getElementById('confirmBtn').className = 'btn btn-primary';
    document.getElementById('confirmBtn').textContent = 'Yes, Restore';
    openModal('confirmModal');
}

async function unarchiveEmployee(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}/unarchive`, { method: 'PATCH' });
        if (!response.ok) throw new Error('Unarchive failed');
        closeModal('confirmModal');
        showToast('Employee restored successfully', 'success');
        refreshCurrentView();
    } catch (error) {
        closeModal('confirmModal');
        showToast('Failed to restore employee', 'error');
    }
}

function confirmDelete(id, name) {
    document.getElementById('confirmMessage').textContent = `PERMANENTLY DELETE ${name}? This cannot be undone.`;
    document.getElementById('confirmBtn').onclick = () => deleteEmployee(id);
    document.getElementById('confirmBtn').className = 'btn btn-danger';
    document.getElementById('confirmBtn').textContent = 'Yes, Delete Forever';
    openModal('confirmModal');
}

async function deleteEmployee(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');
        closeModal('confirmModal');
        showToast('Employee permanently deleted', 'success');
        refreshCurrentView();
    } catch (error) {
        closeModal('confirmModal');
        showToast('Failed to delete employee', 'error');
    }
}

async function quickStatusChange(id, newStatus, name) {
    if (!newStatus) return;
    try {
        const response = await fetch(`${API_BASE}/${id}/status?status=${newStatus}`, { method: 'PATCH' });
        if (!response.ok) throw new Error('Status change failed');
        showToast(`${name} status changed to ${formatStatus(newStatus)}`, 'success');
        refreshCurrentView();
    } catch (error) {
        showToast('Failed to change status', 'error');
    }
}

async function addSkill(empId) {
    const input = document.getElementById(`newSkill-${empId}`);
    const skill = input.value.trim();
    if (!skill) return;
    try {
        const response = await fetch(`${API_BASE}/${empId}/skills/add?skill=${encodeURIComponent(skill)}`, { method: 'PATCH' });
        if (!response.ok) throw new Error('Add skill failed');
        showToast('Skill added successfully', 'success');
        input.value = '';
        viewEmployee(empId);
    } catch (error) {
        showToast('Failed to add skill', 'error');
    }
}

async function removeSkillFromView(empId, skill) {
    try {
        const response = await fetch(`${API_BASE}/${empId}/skills/remove?skill=${encodeURIComponent(skill)}`, { method: 'PATCH' });
        if (!response.ok) throw new Error('Remove skill failed');
        showToast('Skill removed', 'success');
        viewEmployee(empId);
    } catch (error) {
        showToast('Failed to remove skill', 'error');
    }
}

function showAddSkillInput(empId) {
    document.getElementById(`addSkillInput-${empId}`).style.display = 'flex';
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function refreshCurrentView() {
    const activePage = document.querySelector('.page.active');
    if (activePage.id === 'page-dashboard') loadDashboard();
    else if (activePage.id === 'page-employees') loadAllEmployees();
    else if (activePage.id === 'page-active') loadActiveEmployees();
    else if (activePage.id === 'page-archived') loadArchivedEmployees();
}

function formatStatus(status) {
    if (!status) return '-';
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatType(type) {
    if (!type) return '-';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}