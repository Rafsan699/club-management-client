import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, Search, ArrowRight, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import PageShell, { PageHero, Spinner } from '../components/PageShell';

const MeetingHome = () => {
  const [meetings, setMeetings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const meetingsPerPage = 12;

  const navigate = useNavigate();

  useEffect(() => {
    API.get('/api/meetings')
      .then(res => {
        const meetingList = Array.isArray(res.data) ? res.data : [];

        // Only published meetings
        const published = meetingList.filter(m =>
          m.isPublished === true || m.isPublished === "true"
        );

        setMeetings(published);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching meetings:", err);
        setLoading(false);
      });
  }, []);

  const filteredMeetings = meetings.filter(m =>
    m.meetingDate && m.meetingDate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to first page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleMeetingClick = (id) => {
    const isVerified = sessionStorage.getItem(`verified_meeting_${id}`);
    if (isVerified) {
      navigate(`/activities/meetings/view?id=${id}`);
    } else {
      navigate(`/activities/meetings/entry?id=${id}`);
    }
  };

  const indexOfLastMeeting = currentPage * meetingsPerPage;
  const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
  const currentMeetings = filteredMeetings.slice(indexOfFirstMeeting, indexOfLastMeeting);
  const totalPages = Math.ceil(filteredMeetings.length / meetingsPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Meeting archive"
        title="Meeting archive & schedules"
        desc="Explore all official club meetings, access session details, and review attendance securely."
      >
        <div className="rise relative max-w-xl mt-8" style={{ animationDelay: '.24s' }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 t-acc pointer-events-none" />
          <input
            type="text"
            aria-label="Search meetings"
            placeholder="Search meeting by date (e.g. August)…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pg-input !pl-12 !min-h-[3.25rem] shadow-sm"
          />
        </div>
      </PageHero>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="flex justify-center py-24"><Spinner label="Loading meetings…" /></div>
        ) : filteredMeetings.length === 0 ? (
          <div className="pg-card text-center py-16 px-6 max-w-lg mx-auto space-y-3">
            <div className="flex justify-center"><span className="pg-iconbox"><Calendar className="w-5 h-5" /></span></div>
            <h3 className="fd text-lg font-extrabold">No meetings found</h3>
            <p className="text-sm t-mute">No published meetings match your search criteria right now.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm t-mute">
                {filteredMeetings.length} {filteredMeetings.length === 1 ? 'meeting' : 'meetings'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentMeetings.map((m) => (
                <div
                  key={m._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleMeetingClick(m._id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleMeetingClick(m._id)}
                  className="group pg-card pg-card-hover cursor-pointer p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5">
                      <span className="pg-iconbox group-hover:bg-[var(--acc)] group-hover:text-white transition-colors">
                        <Calendar className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <span className="pg-badge">Scheduled date</span>
                        <h3 className="fd text-lg font-extrabold mt-2 group-hover:text-[var(--acc)] transition-colors">
                          {m.meetingDate}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed bg-soft border bd-line rounded-xl p-3.5 line-clamp-3">
                      {m.description && m.description.trim() !== ""
                        ? m.description
                        : "Click to enter secret code & view comprehensive details of this meeting session."}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t bd-line text-sm font-semibold">
                    <span className="flex items-center gap-2 t-mute group-hover:text-[var(--acc)] transition-colors">
                      <Lock className="w-4 h-4 t-acc" /> View attendance
                    </span>
                    <span className="w-9 h-9 rounded-full bg-[var(--tint)] text-[var(--acc)] grid place-items-center group-hover:bg-[var(--acc)] group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Pagination" className="flex flex-wrap justify-center items-center gap-2 pt-12">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pg-btn"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1 pg-noscroll">
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        aria-current={currentPage === pageNumber ? 'page' : undefined}
                        className={`pg-btn !px-0 w-10 shrink-0 ${currentPage === pageNumber ? 'pg-btn-primary' : ''}`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pg-btn"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </PageShell>
  );
};

export default MeetingHome;