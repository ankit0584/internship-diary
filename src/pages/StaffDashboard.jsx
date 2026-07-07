import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function StaffDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const [internships, setInternships] = useState([])
  const [selectedInternship, setSelectedInternship] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [reviewForm, setReviewForm] = useState({
    entryId: null,
    staffStatus: 'approved',
    staffRemarks: ''
  })
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'staff') { navigate('/student/dashboard'); return }
    fetchInternships()
  }, [])

  const fetchInternships = async () => {
    try {
      const res = await axios.get('/api/internship/all')
      setInternships(res.data)
    } catch (err) {
      setError('Failed to load internships.')
    } finally {
      setLoading(false)
    }
  }

  const fetchEntries = async (internship) => {
    setSelectedInternship(internship)
    setEntries([])
    setError('')
    setSuccess('')
    try {
      const internshipId = internship.Id || internship.id
      const res = await axios.get(`/api/diary/internship/${internshipId}`)
      setEntries(res.data)
    } catch (err) {
      setError('Failed to load diary entries.')
    }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await axios.put(`/api/diary/${reviewForm.entryId}/review`, {
        staffStatus: reviewForm.staffStatus,
        staffRemarks: reviewForm.staffRemarks,
        reviewedBy: user.id
      })
      setSuccess('Entry reviewed successfully!')
      setShowReviewForm(false)
      setReviewForm({ entryId: null, staffStatus: 'approved', staffRemarks: '' })
      fetchEntries(selectedInternship)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review entry.')
    }
  }

  const formatDate = (date) => {
    if (!date) return '—'
    if (typeof date === 'string') return date.split('T')[0]
    if (date.year) return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
    return '—'
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) return <div className="dashboard"><p>Loading...</p></div>

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>👨‍🏫 Staff Dashboard — {user.name}</h1>
        <button
          className="btn btn-danger"
          style={{ width: 'auto', padding: '0.4rem 1rem' }}
          onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>

        {/* Left — Students List */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h3>👥 All Students</h3>
          {internships.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No internships registered yet.</p>
          ) : (
            internships.map((i, index) => (
              <div
                key={i.Id || i.id || index}
                onClick={() => fetchEntries(i)}
                style={{
                  padding: '0.8rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  background: selectedInternship?.Id === i.Id ? '#eef2ff' : '#f9fafb',
                  border: selectedInternship?.Id === i.Id ? '1px solid #4f46e5' : '1px solid #e5e7eb',
                  transition: 'all 0.2s'
                }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{i.StudentName || i.studentName}</p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{i.OrgName || i.orgName}</p>
                <span className={`status-badge status-${i.OverallStatus || i.overallStatus}`}>
                  {i.OverallStatus || i.overallStatus}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Right — Internship Details + Entries */}
        <div>
          {!selectedInternship ? (
            <div className="card">
              <p style={{ color: '#6b7280' }}>← Select a student from the left to view their diary.</p>
            </div>
          ) : (
            <>
              {/* Internship Profile */}
              <div className="card">
                <h3>🏢 {selectedInternship.OrgName || selectedInternship.orgName}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <p><strong>Student:</strong> {selectedInternship.StudentName || selectedInternship.studentName}</p>
                  <p><strong>Email:</strong> {selectedInternship.StudentEmail || selectedInternship.studentEmail}</p>
                  <p><strong>Mentor:</strong> {selectedInternship.MentorName || selectedInternship.mentorName}</p>
                  <p><strong>Designation:</strong> {selectedInternship.MentorDesignation || selectedInternship.mentorDesignation || '—'}</p>
                  <p><strong>Mentor Contact:</strong> {selectedInternship.MentorContact || selectedInternship.mentorContact || '—'}</p>
                  <p><strong>Mentor Email:</strong> {selectedInternship.MentorEmail || selectedInternship.mentorEmail || '—'}</p>
                  <p><strong>Start:</strong> {formatDate(selectedInternship.StartDate || selectedInternship.startDate)}</p>
                  <p><strong>End:</strong> {formatDate(selectedInternship.EndDate || selectedInternship.endDate)}</p>
                </div>

                {/* Mentor Video */}
                {(selectedInternship.MentorVideoPath || selectedInternship.mentorVideoPath) ? (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🎥 Mentor Verification Video:</p>
                    <video
                      controls
                      width="100%"
                      style={{ borderRadius: '8px', maxHeight: '300px' }}
                      src={`http://localhost:5283/Uploads/Videos/${(selectedInternship.MentorVideoPath || selectedInternship.mentorVideoPath).split('\\').pop()}`}
                    />
                  </div>
                ) : (
                  <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
                    ⚠️ Mentor verification video not uploaded yet.
                  </p>
                )}
              </div>

              {/* Diary Entries */}
              <div className="card">
                <h3>📔 Diary Entries ({entries.length})</h3>

                {entries.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No diary entries yet.</p>
                ) : (
                  entries.map(entry => (
                    <div key={entry.id || entry.Id} className="diary-entry">
                      <div className="dates">
                        📅 {entry.periodStartDate || entry.PeriodStartDate} — {entry.periodEndDate || entry.PeriodEndDate}
                      </div>
                      <div className="description" style={{ margin: '0.5rem 0' }}>
                        {entry.workDescription || entry.WorkDescription}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span className={`status-badge status-${entry.staffStatus || entry.StaffStatus}`}>
                          {entry.staffStatus || entry.StaffStatus}
                        </span>

                        {(entry.staffStatus === 'pending' || entry.StaffStatus === 'pending') && (
                          <button
                            className="btn"
                            style={{ width: 'auto', padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => {
                              setReviewForm({ entryId: entry.id || entry.Id, staffStatus: 'approved', staffRemarks: '' })
                              setShowReviewForm(true)
                            }}>
                            Review
                          </button>
                        )}
                      </div>

                      {(entry.staffRemarks || entry.StaffRemarks) && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                          💬 Remarks: {entry.staffRemarks || entry.StaffRemarks}
                        </p>
                      )}
                    </div>
                  ))
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <div style={{
                    marginTop: '1rem', padding: '1rem',
                    background: '#f9fafb', borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <h4 style={{ marginBottom: '1rem' }}>Review Entry</h4>
                    <form onSubmit={handleReview}>
                      <div className="form-group">
                        <label>Status</label>
                        <select
                          value={reviewForm.staffStatus}
                          onChange={e => setReviewForm({ ...reviewForm, staffStatus: e.target.value })}>
                          <option value="approved">Approved</option>
                          <option value="needs_revision">Needs Revision</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Remarks (optional)</label>
                        <textarea
                          rows="3"
                          placeholder="Add feedback for the student..."
                          value={reviewForm.staffRemarks}
                          onChange={e => setReviewForm({ ...reviewForm, staffRemarks: e.target.value })}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-success" type="submit"
                          style={{ width: 'auto', padding: '0.4rem 1rem' }}>
                          Submit Review
                        </button>
                        <button className="btn btn-danger" type="button"
                          style={{ width: 'auto', padding: '0.4rem 1rem' }}
                          onClick={() => setShowReviewForm(false)}>
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard