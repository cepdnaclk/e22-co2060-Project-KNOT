import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, User, Filter, ChevronLeft, ChevronRight, ClipboardList, RefreshCcw, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, ticketsRes] = await Promise.all([
        fetch('http://localhost:5000/api/tickets/stats'),
        fetch('http://localhost:5000/api/tickets?limit=4') // fetch top 4 as per mockup
      ]);
      const statsData = await statsRes.json();
      const ticketsData = await ticketsRes.json();

      setStats(statsData);
      setTickets(ticketsData.data);
      setPagination(ticketsData.pagination);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    try {
      const res = await fetch(`http://localhost:5000/api/tickets?limit=4&search=${e.target.value}`);
      const data = await res.json();
      setTickets(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loader-container">
        <RefreshCcw className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <>
      <header className="top-nav">
        <div className="nav-left">
          <img src="/knot_logo.png" alt="KNOT" style={{ height: '32px', width: 'auto' }} />
        </div>
        <div className="nav-right">
          <Bell size={20} />
          <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#14b8b3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <User size={16} />
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <h1 className="page-title">Maintenance<br />Management</h1>
        <p className="page-subtitle">Manage and update active service tickets.</p>

        {stats && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="icon-wrapper orange">
                <ClipboardList size={24} />
              </div>
              <div className="summary-info">
                <h3>Open Tickets</h3>
                <p>{stats.open}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="icon-wrapper blue">
                <RefreshCcw size={24} />
              </div>
              <div className="summary-info">
                <h3>In Progress</h3>
                <p>{stats.inProgress}</p>
              </div>
            </div>
            <div className="summary-card">
              <div className="icon-wrapper green">
                <CheckCircle2 size={24} />
              </div>
              <div className="summary-info">
                <h3>Resolved Today</h3>
                <p>{stats.resolvedToday}</p>
              </div>
            </div>
          </div>
        )}

        <section className="section-container">
          <h2 className="section-title">Active Tickets</h2>
          <div className="search-bar-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search locations or issues..."
              value={search}
              onChange={handleSearch}
            />
            <button className="filter-btn">
              <Filter size={14} /> Filters
            </button>
          </div>

          <div className="tickets-list">
            <div className="tickets-header">
              <div className="col-location">Location & Issue</div>
              <div className="col-priority">Priority</div>
              <div className="col-reported">Reported By</div>
            </div>

            {tickets.map(ticket => (
              <Link to={`/ticket/${ticket.id}`} key={ticket.id} className="ticket-row">
                <div className="col-location ticket-info">
                  <span className="ticket-location">{ticket.location}</span>
                  <span className="ticket-issue">{ticket.title}</span>
                </div>
                <div className="col-priority" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4 }}>
                  <span className={`badge ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                </div>
                <div className="col-reported" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: 4 }}>
                  <span className="reporter-info">{ticket.reported_by}</span>
                  <span className="reporter-date">{new Date(ticket.reported_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </Link>
            ))}
          </div>

          {pagination && (
            <div className="pagination">
              <span>Showing {tickets.length} of {pagination.total} tickets</span>
              <div className="page-controls">
                <span style={{ marginRight: 8 }}>Previous</span>
                <button className="page-btn active">1</button>
                <button className="page-btn outline">2</button>
                <span style={{ marginLeft: 8 }}>Next</span>
              </div>
            </div>
          )}
        </section>

        <section className="section-container">
          <h2 className="section-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Quick View: Active Sites</h2>
          <div className="map-placeholder">
            <div className="map-grid"></div>
            <div className="map-pin" style={{ top: '40%', left: '30%', backgroundColor: '#ef4444' }}></div>
            <div className="map-pin" style={{ top: '65%', left: '70%', backgroundColor: '#3b82f6' }}></div>
            <div className="map-pin" style={{ top: '70%', left: '75%', backgroundColor: '#f97316' }}></div>
          </div>
        </section>

        {stats && (
          <section className="section-container">
            <h2 className="section-title"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> Resolution Rate</h2>
            <div style={{ marginTop: 16 }}>
              {stats.resolutionRates.map((rate, idx) => {
                const colors = ['#3b82f6', '#10b981', '#f97316'];
                return (
                  <div key={idx} className="chart-bar-container">
                    <div className="chart-bar-header">
                      <span>{rate.category}</span>
                      <span>{rate.rate}%</span>
                    </div>
                    <div className="chart-bar-bg">
                      <div className="chart-bar-fill" style={{ width: `${rate.rate}%`, backgroundColor: colors[idx] }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="btn-secondary">View Detailed Reports</button>
          </section>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-secondary)', padding: '20px 0 40px' }}>
          © 2024 KNOT Platform - Maintenance Management<br />Portal. All rights reserved.
        </div>
      </main>
    </>
  );
}


