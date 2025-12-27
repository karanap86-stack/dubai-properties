// Departmental roles and hierarchy for CRM (AI & Human)
module.exports = {
  departments: [
    'HR', 'Sales', 'Accounts', 'Marketing', 'Support', 'Tech', 'Legal', 'Operations', 'Product', 'Admin', 'Procurement', 'R&D', 'Compliance', 'Analytics', 'Training'
  ],
  roles: [
    'master_admin', 'backup_master_admin', 'department_admin', 'manager', 'agent',
    'ai_master_admin', 'ai_admin', 'ai_manager', 'ai_agent',
    'tech_admin', 'tech_user'
  ],
  // Role access matrix (simplified)
  access: {
    master_admin: 'all',
    backup_master_admin: 'all',
    department_admin: 'department',
    manager: 'team',
    agent: 'self',
    ai_master_admin: 'all',
    ai_admin: 'department',
    ai_manager: 'team',
    ai_agent: 'self',
    tech_admin: 'core',
    tech_user: 'core'
  }
};
