import { ActiveUser } from './apiClient';

/**
 * Automatically generates a list of default users matching the compiled roles list.
 * This guarantees that whatever roles the compiler defines, the simulator immediately
 * creates active user profiles for testing.
 */
export function generateMockUsers(roles: string[]): ActiveUser[] {
  if (!roles || roles.length === 0) {
    return [
      { id: 'usr-admin', name: 'System Administrator', role: 'Admin', plan: 'premium' }
    ];
  }

  return roles.map((role, idx) => {
    // Determine plan: Admin and first role are premium, others free for gating demos
    const plan: 'free' | 'premium' = (role.toLowerCase() === 'admin' || idx === 0) ? 'premium' : 'free';
    
    // Nice default names
    let name = `${role} User`;
    if (role.toLowerCase() === 'admin') name = 'Alice Admin';
    else if (role.toLowerCase().includes('manager')) name = 'Bob Manager';
    else if (role.toLowerCase().includes('agent')) name = 'Charlie Agent';
    else if (role.toLowerCase() === 'customer') name = 'David Customer';
    else if (role.toLowerCase() === 'vendor') name = 'Victor Vendor';

    return {
      id: `usr-mock-${role.toLowerCase().replace(/\s+/g, '_')}`,
      name,
      role,
      plan
    };
  });
}
