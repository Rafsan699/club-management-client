import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Send, Pin, Trash2, X, ArrowLeft, Sun, Moon, Search, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Newsfeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  
  // State for "See Details" Modal/Popup
  const [activeDetailsPost, setActiveDetailsPost] = useState(null);
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Default professional light mode (false = light mode default)
  const [darkMode, setDarkMode] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('clubUser'));
  const adminToken = localStorage.getItem('token') || localStorage.getItem('adminToken');

  const fetchPosts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching newsfeed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Helper function to format date as "4 January, 2026"
  const formatAnnouncementDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleLike = async (postId) => {
    if (!currentUser) {
      alert("Please login first to like posts!");
      return;
    }
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}/like`, {
        userId: currentUser._id || currentUser.id
      });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
    } catch (err) {
      console.error("Error liking post", err);
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentInputs({ ...commentInputs, [postId]: text });
  };

  const handleAddComment = async (postId, e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first to comment!");
      return;
    }
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/posts/${postId}/comment`, {
        userId: currentUser._id || currentUser.id,
        name: currentUser.name || 'Anonymous User',
        text
      });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
      setCommentInputs({ ...commentInputs, [postId]: '' });
      
      if (activeCommentPost && activeCommentPost._id === postId) {
        setActiveCommentPost(res.data);
      }
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${postId}/comment/${commentId}`, {
        userId: currentUser ? (currentUser._id || currentUser.id) : null,
        isAdmin: !!adminToken 
      });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
      if (activeCommentPost && activeCommentPost._id === postId) {
        setActiveCommentPost(res.data);
      }
    } catch (err) {
      console.error("Error deleting comment", err);
      alert("Unauthorized or failed to delete comment.");
    }
  };

  // Filter posts based on search query (title, content, or formatted date like "4 january, 2026", month, year)
  const filteredPosts = posts.filter(post => {
    const query = searchQuery.toLowerCase().trim();
    const titleMatch = post.title.toLowerCase().includes(query);
    const contentMatch = post.content.toLowerCase().includes(query);
    
    // Generate date string representation for searching (e.g., "4 january, 2026", "january", "2026", etc.)
    const formattedDate = formatAnnouncementDate(post.createdAt).toLowerCase();
    const rawDateObject = new Date(post.createdAt);
    const monthNameFull = rawDateObject.toLocaleString('en-US', { month: 'long' }).toLowerCase();
    const monthNameShort = rawDateObject.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const yearNum = rawDateObject.getFullYear().toString();
    const dayNum = rawDateObject.getDate().toString();

    const dateMatch = 
      formattedDate.includes(query) || 
      monthNameFull.includes(query) || 
      monthNameShort.includes(query) || 
      yearNum.includes(query) ||
      (query === `${dayNum} ${monthNameFull}, ${yearNum}`) ||
      (query === `${monthNameFull} ${yearNum}`);

    return titleMatch || contentMatch || dateMatch;
  });

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-semibold text-sm ${darkMode ? 'bg-[#0A0D14] text-slate-400' : 'bg-[#F8FAFC] text-slate-500'}`}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          Loading Announcements...
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-6 sm:py-12 px-3 sm:px-6 lg:px-8 font-sans antialiased transition-colors duration-500 selection:bg-indigo-500 selection:text-white ${darkMode ? 'bg-[#07090E] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'}`}>
      <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Top Header with Back Button & Dark Mode Toggle */}
        <div className={`flex items-center justify-between pb-5 border-b backdrop-blur-md sticky top-0 z-30 pt-2 transition-colors duration-300 ${darkMode ? 'border-slate-800/80 bg-[#07090E]/80' : 'border-slate-200/80 bg-[#F8FAFC]/80'}`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${
                darkMode 
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 shadow-inner' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-sm hover:shadow'
              }`}
              title="Go Back"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Announcements</h1>
              <p className="text-[11px] sm:text-xs font-medium text-slate-400">BRIU Sports Club Updates & News</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full ${darkMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-slate-100 text-slate-600 border border-slate-200/60'}`}>
              {filteredPosts.length} {filteredPosts.length === 1 ? 'Post' : 'Posts'}
            </span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl transition-all duration-200 active:scale-95 ${
                darkMode 
                  ? 'bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-800 shadow-inner' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/80 shadow-sm hover:shadow'
              }`}
              title="Toggle Dark/Light Mode"
              aria-label="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
          <input 
            type="text"
            placeholder="Search by title, content, month or year (e.g., January 2026)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full pl-11 pr-4 py-3.5 sm:py-4 rounded-2xl text-xs sm:text-sm font-medium border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm ${
              darkMode 
                ? 'bg-slate-900/60 border-slate-800/80 text-white placeholder-slate-500 focus:border-indigo-500/50 hover:border-slate-700' 
                : 'bg-white border-slate-200/80 text-slate-900 placeholder-slate-400 focus:border-indigo-500/50 hover:border-slate-300'
            }`}
          />
        </div>

        {filteredPosts.length === 0 ? (
          <div className={`text-center py-16 px-4 rounded-3xl border border-dashed ${darkMode ? 'border-slate-800 bg-slate-900/20 text-slate-400' : 'border-slate-200 bg-white/50 text-slate-500'}`}>
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40 text-indigo-500" />
            <p className="text-sm font-semibold">No announcements found</p>
            <p className="text-xs opacity-70 mt-1">Try searching with different keywords, months, or years.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {currentPosts.map((post, index) => {
              const isLiked = currentUser && post.likes.includes(currentUser._id || currentUser.id);
              const latestComment = post.comments && post.comments.length > 0 ? post.comments[post.comments.length - 1] : null;
              const absoluteIndex = indexOfFirstPost + index;

              // Character limit or length check to trigger "See Details" view
              const characterLimit = 180;
              const isContentLong = post.content && (post.content.length > characterLimit || post.content.split('\n').length > 4);

              return (
                <article 
                  key={post._id} 
                  className={`rounded-3xl border p-4 sm:p-6 space-y-4 sm:space-y-5 transition-all duration-300 shadow-sm hover:shadow-md ${
                    darkMode 
                      ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 shadow-black/20' 
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  
                  {absoluteIndex === 0 && searchQuery === '' && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Pin className="w-3.5 h-3.5 fill-current" /> Pinned announcement
                    </div>
                  )}

                  {/* Admin Header Info with Custom Date Format: "4 January, 2026" */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/20 shrink-0">
                      A
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xs sm:text-sm tracking-tight truncate">BRIU Sports Club Admin</h3>
                      <time className="text-[11px] sm:text-xs font-medium text-slate-400 block mt-0.5">{formatAnnouncementDate(post.createdAt)}</time>
                    </div>
                  </div>

                  {/* Post Title & Fixed-size Content Container */}
                  <div className="space-y-2">
                    <h2 className="font-extrabold text-sm sm:text-base leading-snug tracking-tight">{post.title}</h2>
                    
                    {/* Fixed-size wrapper container to strictly limit height with line breaks */}
                    <div className={`relative ${isContentLong ? 'max-h-20 overflow-hidden' : ''}`}>
                      <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {post.content}
                      </p>
                      
                      {/* Gradient fade effect when content is clipped */}
                      {isContentLong && (
                        <div className={`absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t ${darkMode ? 'from-[#090C13]' : 'from-white'} to-transparent pointer-events-none`} />
                      )}
                    </div>
                    
                    {isContentLong && (
                      <button 
                        onClick={() => setActiveDetailsPost(post)}
                        className="min-h-[36px] inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors focus:outline-none focus:underline pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> See details
                      </button>
                    )}
                  </div>

                  {/* Post Image - object-contain used for full picture view */}
                  {post.image && (
                    <div className={`rounded-2xl overflow-hidden border flex items-center justify-center transition-colors ${darkMode ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-100 bg-slate-50'}`}>
                      <img src={post.image} alt="Announcement media" className="w-full h-auto max-h-[450px] object-contain" loading="lazy" />
                    </div>
                  )}

                  {/* Like & Comment Summary */}
                  <div className={`flex items-center justify-between text-xs font-medium text-slate-400 pt-2 border-t ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <span>👍 {post.likes.length} {post.likes.length === 1 ? 'person' : 'people'}</span>
                    <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className={`grid grid-cols-2 gap-2 pt-1 border-t ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <button 
                      onClick={() => handleLike(post._id)}
                      className={`min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-2xl font-bold text-xs transition-all duration-200 active:scale-95 ${
                        isLiked 
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/25 shadow-sm' 
                          : darkMode 
                            ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50' 
                            : 'bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                      aria-label="React to post"
                    >
                      <Heart className={`w-4 h-4 transition-transform active:scale-125 ${isLiked ? 'fill-current text-rose-500' : ''}`} /> 
                      {isLiked ? 'Liked' : 'React'}
                    </button>

                    <button 
                      onClick={() => setActiveCommentPost(post)}
                      className={`min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-2xl font-bold text-xs transition-all duration-200 active:scale-95 ${
                        darkMode 
                          ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50' 
                          : 'bg-slate-100/80 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                      }`}
                      aria-label="Open comments section"
                    >
                      <MessageCircle className="w-4 h-4" /> Comment ({post.comments.length})
                    </button>
                  </div>

                  {/* Latest Comment Box */}
                  {latestComment && (
                    <div className={`pt-2 border-t ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                      <div className={`p-3.5 rounded-2xl text-xs space-y-1 border flex justify-between items-start gap-3 transition-colors ${darkMode ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50/80 border-slate-100'}`}>
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-indigo-500 block truncate">
                            {latestComment.name}
                          </span>
                          <p className={`mt-0.5 break-words leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{latestComment.text}</p>
                        </div>
                        
                        {((currentUser && (latestComment.userId === currentUser._id || latestComment.userId === currentUser.id)) || adminToken) && (
                          <button 
                            onClick={() => handleDeleteComment(post._id, latestComment._id || latestComment.id)}
                            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-rose-500 rounded-xl transition-colors shrink-0"
                            title="Delete comment"
                            aria-label="Delete comment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Add Comment Input Form */}
                  <form onSubmit={(e) => handleAddComment(post._id, e)} className="flex items-center gap-2 pt-1">
                    <input 
                      type="text" 
                      placeholder={currentUser ? "Write a comment..." : "Login to comment..."}
                      value={commentInputs[post._id] || ''}
                      onChange={(e) => handleCommentChange(post._id, e.target.value)}
                      disabled={!currentUser}
                      className={`flex-1 min-h-[44px] px-3.5 py-2.5 rounded-2xl border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/25 ${
                        darkMode 
                          ? 'border-slate-800 bg-slate-950/60 text-white placeholder-slate-500 focus:border-indigo-500/50' 
                          : 'border-slate-200/80 bg-slate-50/60 text-slate-900 placeholder-slate-400 focus:border-indigo-500/50'
                      }`}
                    />
                    <button 
                      type="submit" 
                      disabled={!currentUser}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
                      aria-label="Send comment"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </article>
              );
            })}
          </div>
        )}

        {/* Pagination Controls (Prev, Numbers, Next) */}
        {totalPages > 1 && (
          <nav aria-label="Pagination Navigation" className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6 pb-10 flex-wrap">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                  : 'bg-white border-slate-200/80 text-slate-700 shadow-sm hover:bg-slate-50'
              }`}
            >
              &lt; Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                  currentPage === number 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-transparent' 
                    : darkMode 
                      ? 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800' 
                      : 'bg-white border border-slate-200/80 text-slate-700 shadow-sm hover:bg-slate-50'
                }`}
                aria-current={currentPage === number ? 'page' : undefined}
              >
                {number}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold border transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                  : 'bg-white border-slate-200/80 text-slate-700 shadow-sm hover:bg-slate-50'
              }`}
            >
              Next &gt;
            </button>
          </nav>
        )}

      </div>

      {/* "See Details" Full Post Modal */}
      {activeDetailsPost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className={`border w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className={`flex items-center justify-between pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-extrabold text-sm sm:text-base">Announcement Details</h3>
              <button 
                onClick={() => setActiveDetailsPost(null)}
                className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-colors active:scale-95 ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                aria-label="Close details modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
              <h2 className="font-extrabold text-base sm:text-lg leading-snug">{activeDetailsPost.title}</h2>
              <time className="text-[11px] sm:text-xs font-medium opacity-60 block">{formatAnnouncementDate(activeDetailsPost.createdAt)}</time>
              
              {activeDetailsPost.image && (
                <div className={`rounded-2xl overflow-hidden border flex items-center justify-center ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-100 bg-slate-50'}`}>
                  <img src={activeDetailsPost.image} alt="Announcement full media" className="w-full h-auto max-h-[400px] object-contain" />
                </div>
              )}

              <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {activeDetailsPost.content}
              </p>
            </div>

            <div className={`pt-3 border-t flex justify-end ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <button 
                onClick={() => setActiveDetailsPost(null)}
                className="min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-500/20 active:scale-95"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Comments Modal / Drawer */}
      {activeCommentPost && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn">
          <div className={`border w-full max-w-lg rounded-3xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl transition-all ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            <div className={`flex items-center justify-between pb-3 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-extrabold text-sm sm:text-base">All Comments ({activeCommentPost.comments.length})</h3>
              <button 
                onClick={() => setActiveCommentPost(null)}
                className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl transition-colors active:scale-95 ${
                  darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                aria-label="Close comments modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {activeCommentPost.comments.length === 0 ? (
                <div className="text-center py-12 opacity-50 text-xs font-medium">
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                activeCommentPost.comments.map((comm, idx) => (
                  <div key={comm._id || idx} className={`p-3.5 rounded-2xl text-xs space-y-1 border flex justify-between items-start gap-3 transition-colors ${
                    darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-indigo-500 block truncate">
                        {comm.name}
                      </span>
                      <p className={`mt-0.5 break-words leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{comm.text}</p>
                    </div>

                    {((currentUser && (comm.userId === currentUser._id || comm.userId === currentUser.id)) || adminToken) && (
                      <button 
                        onClick={() => handleDeleteComment(activeCommentPost._id, comm._id || comm.id)}
                        className="min-w-[36px] min-h-[36px] flex items-center justify-center opacity-60 hover:opacity-100 hover:text-rose-500 rounded-xl transition-colors shrink-0"
                        title="Delete comment"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={(e) => handleAddComment(activeCommentPost._id, e)} className={`flex items-center gap-2 pt-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <input 
                type="text" 
                placeholder={currentUser ? "Write a comment..." : "Login to comment..."}
                value={commentInputs[activeCommentPost._id] || ''}
                onChange={(e) => handleCommentChange(activeCommentPost._id, e.target.value)}
                disabled={!currentUser}
                className={`flex-1 min-h-[44px] px-3.5 py-2.5 rounded-2xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/25 ${
                  darkMode ? 'border-slate-800 bg-slate-950 text-white placeholder-slate-500 focus:border-indigo-500/50' : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500/50'
                }`}
              />
              <button 
                type="submit" 
                disabled={!currentUser}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
                aria-label="Send comment"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export { Newsfeed };
export default Newsfeed;
