import { useState } from 'react';
import { deleteDoc, doc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { ensureDefaultAdmin } from '../services/db';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

export default function AdminReset() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const handleResetDatabase = async () => {
    setShowConfirm(true);
  };

  const confirmReset = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Delete all users
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const doc of usersSnap.docs) {
        await deleteDoc(doc.ref);
      }
      console.log('✅ Deleted all users');

      // Create default admin
      await ensureDefaultAdmin();
      console.log('✅ Created default admin user');

      setMessage('✅ Database reset berhasil! Admin user telah dibuat dengan:\n- Username: admin\n- Password: admin123');
      toast.success('Database reset berhasil!');
    } catch (err) {
      console.error('❌ Error:', err);
      setError('❌ Error: ' + err.message);
      toast.error('Gagal reset database');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>🔧 Admin Reset Utility</h1>
      <p>Gunakan tool ini untuk reset database jika login gagal.</p>

      <div style={{ 
        backgroundColor: '#fff3cd', 
        border: '1px solid #ffc107', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>⚠️ Warning:</strong> Ini akan menghapus SEMUA users dari database!
      </div>

      <button 
        onClick={handleResetDatabase}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? 'Processing...' : 'Reset Database & Create Admin'}
      </button>

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#d4edda',
          border: '1px solid #28a745',
          borderRadius: '5px',
          color: '#155724',
          whiteSpace: 'pre-wrap'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          color: '#721c24'
        }}>
          {error}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onConfirm={confirmReset}
        onCancel={() => setShowConfirm(false)}
        title="Reset Database"
        message="⚠️ Ini akan menghapus SEMUA users dari database dan membuat admin user baru. Tindakan ini tidak dapat dibatalkan!"
        confirmText="Ya, Reset Database"
        cancelText="Batal"
        type="danger"
        loading={loading}
      />
    </div>
  );
}
