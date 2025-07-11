import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, orderBy, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

// Dashboard page with full CRUD functionality for internships
function Dashboard() {
  // State for form fields
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [link, setLink] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('Applied');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [internships, setInternships] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('deadline-asc');
  const [userProfile, setUserProfile] = useState(null);
  const [user] = useAuthState(auth);
  // Add a state to force re-render on theme color change
  const [themeVersion, setThemeVersion] = useState(0);

  // Filter and sort internships
  const filteredAndSortedInternships = (() => {
    let filtered = statusFilter === 'All' 
      ? internships 
      : internships.filter(internship => internship.status === statusFilter);
    
    // Sort by deadline
    filtered.sort((a, b) => {
      const dateA = new Date(a.deadline);
      const dateB = new Date(b.deadline);
      return sortBy === 'deadline-asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filtered;
  })();

  // Start editing an internship
  const startEdit = (internship) => {
    setEditingId(internship.id);
    setCompany(internship.company);
    setRole(internship.role);
    setLink(internship.link);
    setDeadline(internship.deadline);
    setStatus(internship.status);
    setNotes(internship.notes);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setCompany('');
    setRole('');
    setLink('');
    setDeadline('');
    setStatus('Applied');
    setNotes('');
  };

  // Delete an internship
  const handleDelete = async (internshipId) => {
    if (window.confirm('Are you sure you want to delete this internship?')) {
      try {
        await deleteDoc(doc(db, 'internships', internshipId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch user profile
  useEffect(() => {
    if (!user) return;
    
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Fetch internships from Firestore (real-time updates)
  useEffect(() => {
    if (!user) return;
    
    console.log('Fetching internships for user:', user.uid);
    
    const q = query(
      collection(db, 'internships'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const internshipsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched internships:', internshipsList);
      setInternships(internshipsList);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Handle form submission (save to Firestore)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!user) throw new Error('User not authenticated');
      
      if (editingId) {
        // Update existing internship
        await updateDoc(doc(db, 'internships', editingId), {
          company,
          role,
          link,
          deadline,
          status,
          notes,
          updated: new Date()
        });
        setEditingId(null);
      } else {
        // Add new internship
        await addDoc(collection(db, 'internships'), {
          userId: user.uid,
          company,
          role,
          link,
          deadline,
          status,
          notes,
          created: new Date()
        });
      }
      
      // Reset form
      setCompany('');
      setRole('');
      setLink('');
      setDeadline('');
      setStatus('Applied');
      setNotes('');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Get theme color from CSS variable (update on every render for live theme switching)
  const themeColor = typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() : '#2563eb';

  function getActionButtonColor(themeColor, index) {
    // Define the theme color palette (should match ThemeSwitcher)
    const palette = [
      { name: 'Red', value: '#E50046' },
      { name: 'Teal', value: '#03A6A1' },
      { name: 'Purple', value: '#B13BFF' },
      { name: 'Blue', value: '#6fcffb' },
      { name: 'Orange', value: '#FF7D29' },
    ];
    // Find the current theme index
    const currentIdx = palette.findIndex(c => c.value.toLowerCase() === themeColor.toLowerCase());
    // Build a list of colors excluding the current theme color
    const available = palette.filter((_, i) => i !== currentIdx);
    // Cycle through the available colors for each button
    return available[index % available.length].value;
  }

  // Effect to force re-render when theme color changes
  useEffect(() => {
    // Observe changes to the style attribute on document.documentElement
    const observer = new MutationObserver(() => {
      setThemeVersion(v => v + 1);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="card w-full max-w-6xl mx-auto">
        {/* Header with user info and logout */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            {userProfile && (
              <p className="text-gray-600 mt-1">Welcome, {userProfile.firstName}!</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
            <button 
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 bg-[#E50046] hover:bg-[#b80036] focus:ring-2 focus:ring-[#E50046] focus:outline-none"
              style={{ color: '#fff', border: 'none' }}
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* Add Internship Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" className="input-field" placeholder="Company Name" value={company} onChange={e => setCompany(e.target.value)} required />
            <input type="text" className="input-field" placeholder="Role" value={role} onChange={e => setRole(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="url" className="input-field" placeholder="Application Link" value={link} onChange={e => setLink(e.target.value)} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deadline Date</label>
              <input type="date" className="input-field" value={deadline} onChange={e => setDeadline(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="input-field" value={status} onChange={e => setStatus(e.target.value)} required>
              <option value="Applied">Applied</option>
              <option value="Interviewing">Interviewing</option>
              <option value="Rejected">Rejected</option>
              <option value="Offer">Offer</option>
            </select>
            <input type="text" className="input-field" placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" className="btn-primary flex-1" style={{ color: '#fff' }}>
              {editingId ? 'Update Internship' : 'Add Internship'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn-secondary">
                Cancel Edit
              </button>
            )}
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </form>
        
        {/* Internships List */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-2xl font-bold text-gray-800">Your Internships</h3>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field sm:w-auto"
              >
                <option value="All">All Status</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Rejected">Rejected</option>
                <option value="Offer">Offer</option>
              </select>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field sm:w-auto"
              >
                <option value="deadline-asc">Earliest Deadline</option>
                <option value="deadline-desc">Latest Deadline</option>
              </select>
            </div>
          </div>
          {filteredAndSortedInternships.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No internships found.</p>
              <p className="text-gray-400 mt-2">Add your first internship using the form above!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium dark:text-gray-100">Company</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium dark:text-gray-100">Role</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium dark:text-gray-100">Deadline</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium dark:text-gray-100">Status</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium dark:text-gray-100">Notes</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium dark:text-gray-100">Actions</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left font-medium dark:text-gray-100">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedInternships.map((internship) => (
                    <tr key={internship.id} className="group transition-colors"
                      onMouseEnter={e => {
                        if (document.body.classList.contains('dark')) {
                          e.currentTarget.style.background = '#353945';
                        } else {
                          e.currentTarget.style.background = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'inherit'; }}
                    >
                      <td className="border border-gray-300 px-4 py-3 font-medium">{internship.company}</td>
                      <td className="border border-gray-300 px-4 py-3">{internship.role}</td>
                      <td className="border border-gray-300 px-4 py-3">{internship.deadline}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: themeColor, color: '#fff' }}
                        >
                          {internship.status}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">{internship.notes || '-'}</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="px-4 py-1 rounded-full font-medium text-white text-sm shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{ background: getActionButtonColor(themeColor, 1) }}
                            onClick={() => startEdit(internship)}
                          >Edit</button>
                          <button
                            className="px-4 py-1 rounded-full font-medium text-white text-sm shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{ background: getActionButtonColor(themeColor, 2) }}
                            onClick={() => handleDelete(internship.id)}
                          >Delete</button>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        {internship.link && (
                          <button
                            onClick={() => window.open(internship.link, '_blank', 'noopener noreferrer')}
                            className="px-4 py-1 rounded-full font-medium text-white text-sm shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{ background: getActionButtonColor(themeColor, 0), marginRight: 4 }}
                          >
                            View Application
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 