import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function StudentDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  const [internship, setInternship] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Internship form state
  const [internshipForm, setInternshipForm] = useState({
    orgName: '', orgAddress: '', orgContact: '',
    mentorName: '', mentorDesignation: '', mentorContact: '', mentorEmail: '',
    startDate: '', endDate: ''
  })

  // Diary entry form state
  const [entryForm, setEntryForm] = useState({
    periodStartDate: '', periodEndDate: '', workDescription: ''
  })

  const [showEntryForm, setShowEntryForm] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (user.role !== 'student') { navigate('/staff/dashboard'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await axios.get(`/api/internship/my/${user.id}`)
      setInternship(res.data)
      // Fetch diary entries
      const entriesRes = await axios.get(`/api/diary/internship/${res.data.id}`)
      setEntries(entriesRes.data)
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to load data.')
      }
      // 404 just means no internship yet — that's fine
    } finally {
      setLoading(false)
    }
  }

  const handleInternshipSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await axios.post('/api/internship', {
        studentId: user.id,
        ...internshipForm
      })
      setSuccess('Internship profile created!')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create internship profile.')
    }
  }

  const handleEntrySubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await axios.post('/api/diary', {
        internshipId: internship.id,
        ...entryForm
      })
      setSuccess('Diary entry added!')
      setEntryForm({ periodStartDate: '', periodEndDate: '', workDescription: '' })
      setShowEntryForm(false)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add diary entry.')
    }
  }

  const handleVideoUpload = async () => {
    if (!videoFile) return
    setUploading(true)
    setError(''); setSuccess('')
    try {
      const formData = new FormData()
      formData.append('video', videoFile)
      await axios.post(`/api/internship/${internship.id}/upload-video`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Mentor verification video uploaded successfully!')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload video.')
    } finally {
      setUploading(false)
    }
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
        <h1>🎓 Welcome, {user.name}</h1>
        <button className="btn btn-danger" style={{ width: 'auto', padding: '0.4rem 1rem' }} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {/* No internship yet — show create form */}
      {!internship ? (
        <div className="card">
          <h3>📋 Create Internship Profile</h3>
          <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
            Fill in your organization and mentor details — this is the first page of your diary.
          </p>
          <form onSubmit={handleInternshipSubmit}>
            <div className="form-group">
              <label>Organization Name *</label>
              <input type="text" placeholder="Tech Corp Pvt Ltd"
                value={internshipForm.orgName}
                onChange={e => setInternshipForm({ ...internshipForm, orgName: e.target.value })}
                required />
            </div>
            <div className="form-group">
              <label>Organization Address</label>
              <input type="text" placeholder="123 MG Road, Delhi"
                value={internshipForm.orgAddress}
                onChange={e => setInternshipForm({ ...internshipForm, orgAddress: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Organization Contact</label>
              <input type="text" placeholder="011-12345678"
                value={internshipForm.orgContact}
                onChange={e => setInternshipForm({ ...internshipForm, orgContact: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mentor Name *</label>
              <input type="text" placeholder="Rajesh Kumar"
                value={internshipForm.mentorName}
                onChange={e => setInternshipForm({ ...internshipForm, mentorName: e.target.value })}
                required />
            </div>
            <div className="form-group">
              <label>Mentor Designation</label>
              <input type="text" placeholder="Senior Software Engineer"
                value={internshipForm.mentorDesignation}
                onChange={e => setInternshipForm({ ...internshipForm, mentorDesignation: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mentor Contact</label>
              <input type="text" placeholder="9876543210"
                value={internshipForm.mentorContact}
                onChange={e => setInternshipForm({ ...internshipForm, mentorContact: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Mentor Email</label>
              <input type="email" placeholder="mentor@company.com"
                value={internshipForm.mentorEmail}
                onChange={e => setInternshipForm({ ...internshipForm, mentorEmail: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date"
                value={internshipForm.startDate}
                onChange={e => setInternshipForm({ ...internshipForm, startDate: e.target.value })}
                required />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date"
                value={internshipForm.endDate}
                onChange={e => setInternshipForm({ ...internshipForm, endDate: e.target.value })}
                required />
            </div>
            <button className="btn" type="submit">Create Profile</button>
          </form>
        </div>
      ) : (
        <>
          {/* Internship Profile Card */}
          <div className="card">
            <h3>🏢 Internship Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
              <p><strong>Organization:</strong> {internship.orgName}</p>
              <p><strong>Address:</strong> {internship.orgAddress || '—'}</p>
              <p><strong>Mentor:</strong> {internship.mentorName}</p>
              <p><strong>Designation:</strong> {internship.mentorDesignation || '—'}</p>
              <p><strong>Mentor Contact:</strong> {internship.mentorContact || '—'}</p>
              <p><strong>Mentor Email:</strong> {internship.mentorEmail || '—'}</p>
              <p><strong>Start Date:</strong> {new Date(internship.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(internship.endDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> <span className={`status-badge status-${internship.overallStatus}`}>{internship.overallStatus}</span></p>
            </div>
          </div>

          {/* Mentor Video Upload Card */}
          <div className="card">
            <h3>🎥 Mentor Verification Video</h3>
            {internship.mentorVideoPath ? (
              <p className="success-msg">✅ Video uploaded successfully.</p>
            ) : (
              <>
                <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.9rem' }}>
                  Upload a short 5–10 second video of your mentor verifying your internship work.
                </p>
                <div className="form-group">
                  <input type="file" accept="video/*"
                    onChange={e => setVideoFile(e.target.files[0])} />
                </div>
                <button className="btn" onClick={handleVideoUpload} disabled={uploading || !videoFile}>
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </button>
              </>
            )}
          </div>

          {/* Diary Entries Card */}
          <div className="card">
            <h3>📔 Diary Entries</h3>

            {/* Add Entry Button */}
            <button
              className="btn btn-success"
              style={{ width: 'auto', padding: '0.4rem 1rem', marginBottom: '1rem' }}
              onClick={() => setShowEntryForm(!showEntryForm)}>
              {showEntryForm ? 'Cancel' : '+ Add Entry'}
            </button>

            {/* Add Entry Form */}
            {showEntryForm && (
              <form onSubmit={handleEntrySubmit} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Period Start Date *</label>
                  <input type="date"
                    value={entryForm.periodStartDate}
                    onChange={e => setEntryForm({ ...entryForm, periodStartDate: e.target.value })}
                    required />
                </div>
                <div className="form-group">
                  <label>Period End Date *</label>
                  <input type="date"
                    value={entryForm.periodEndDate}
                    onChange={e => setEntryForm({ ...entryForm, periodEndDate: e.target.value })}
                    required />
                </div>
                <div className="form-group">
                  <label>Work Description *</label>
                  <textarea rows="4" placeholder="Describe what you worked on during this period..."
                    value={entryForm.workDescription}
                    onChange={e => setEntryForm({ ...entryForm, workDescription: e.target.value })}
                    required />
                </div>
                <button className="btn" type="submit">Save Entry</button>
              </form>
            )}

            {/* Entries List */}
            {entries.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No diary entries yet. Add your first entry!</p>
            ) : (
              entries.map(entry => (
                <div key={entry.id} className="diary-entry">
                  <div className="dates">
                    📅 {new Date(entry.periodStartDate).toLocaleDateString()} — {new Date(entry.periodEndDate).toLocaleDateString()}
                  </div>
                  <div className="description">{entry.workDescription}</div>
                  <span className={`status-badge status-${entry.staffStatus}`}>
                    {entry.staffStatus}
                  </span>
                  {entry.staffRemarks && (
                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
                      💬 Remarks: {entry.staffRemarks}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default StudentDashboard   