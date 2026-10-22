/**
 * MURUGA MP ACADEMY — APPLICATION CONTROLLER
 * High-performance, Student-First Interactive Engine
 * Data: 529 Verified Lessons, 31 Structured Playlists
 */

(function () {
  'use strict';

  // Application State
  const state = {
    inventory: [],
    playlists: [],
    filteredLessons: [],
    activeTab: 'home',
    filters: {
      search: '',
      classLevel: 'all',
      syllabus: 'all',
      format: 'all',
      sort: 'default',
      playlistId: null
    },
    pagination: {
      page: 1,
      pageSize: 24,
      totalPages: 1
    },
    bookmarks: [],
    currentLesson: null
  };

  // DOM Cache
  const DOM = {
    // Navigation
    navLinks: document.querySelectorAll('.nav-link, .drawer-link'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    mobileToggleBtn: document.getElementById('mobile-toggle-btn'),
    mobileDrawer: document.getElementById('mobile-drawer'),
    mobileDrawerOverlay: document.getElementById('mobile-drawer-overlay'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    
    // Quick Search & Bookmarks Triggers
    searchTrigger: document.getElementById('search-trigger'),
    openBookmarksBtn: document.getElementById('open-bookmarks-btn'),
    bookmarkCount: document.getElementById('bookmark-count'),
    bookmarksDrawer: document.getElementById('bookmarks-drawer'),
    bookmarksOverlay: document.getElementById('bookmarks-overlay'),
    closeBookmarksBtn: document.getElementById('close-bookmarks-btn'),
    bookmarksListContainer: document.getElementById('bookmarks-list-container'),
    bDrawerCount: document.getElementById('b-drawer-count'),
    bookmarksEmpty: document.getElementById('bookmarks-empty'),
    toastContainer: document.getElementById('toast-container'),

    // Hero Section Elements
    heroSearchInput: document.getElementById('hero-search-input'),
    heroSearchBtn: document.getElementById('hero-search-btn'),
    quickChips: document.querySelectorAll('.quick-chip'),
    featuredRecentGrid: document.getElementById('featured-recent-grid'),

    // Study Library Elements
    librarySearchInput: document.getElementById('library-search-input'),
    librarySearchClear: document.getElementById('library-search-clear'),
    sortSelect: document.getElementById('sort-select'),
    classFilterPills: document.getElementById('class-filter-pills'),
    syllabusFilterPills: document.getElementById('syllabus-filter-pills'),
    formatFilterPills: document.getElementById('format-filter-pills'),
    activeFiltersBar: document.getElementById('active-filters-bar'),
    activeTagsContainer: document.getElementById('active-tags-container'),
    resetAllFiltersBtn: document.getElementById('reset-all-filters-btn'),
    lessonsGrid: document.getElementById('lessons-grid'),
    libraryEmptyState: document.getElementById('library-empty-state'),
    emptyResetBtn: document.getElementById('empty-reset-btn'),
    filteredCount: document.getElementById('filtered-count'),
    totalCount: document.getElementById('total-count'),
    paginationWrapper: document.getElementById('pagination-wrapper'),
    prevPageBtn: document.getElementById('prev-page-btn'),
    nextPageBtn: document.getElementById('next-page-btn'),
    pageIndicator: document.getElementById('page-indicator'),

    // Specific Hub Grids
    playlistsGrid: document.getElementById('playlists-grid'),
    examPrepVideosGrid: document.getElementById('exam-prep-videos-grid'),
    neetVideosGrid: document.getElementById('neet-videos-grid'),
    careerVideosGrid: document.getElementById('career-videos-grid'),
    motivationGrid: document.getElementById('motivation-grid'),

    // Lesson Detail Modal
    lessonModal: document.getElementById('lesson-modal'),
    modalBackdrop: document.getElementById('lesson-modal-backdrop'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalVideoIframe: document.getElementById('modal-video-iframe'),
    modalCrumbClass: document.getElementById('modal-crumb-class'),
    modalCrumbChapter: document.getElementById('modal-crumb-chapter'),
    modalClassBadge: document.getElementById('modal-class-badge'),
    modalSyllabusBadge: document.getElementById('modal-syllabus-badge'),
    modalFormatBadge: document.getElementById('modal-format-badge'),
    modalLangBadge: document.getElementById('modal-lang-badge'),
    modalLessonTitle: document.getElementById('modal-lesson-title'),
    modalPlaylistLink: document.getElementById('modal-playlist-link'),
    modalExternalYtBtn: document.getElementById('modal-external-yt-btn'),
    modalBookmarkToggleBtn: document.getElementById('modal-bookmark-toggle-btn'),
    modalBookmarkBtnText: document.getElementById('modal-bookmark-btn-text'),
    modalShareBtn: document.getElementById('modal-share-btn'),
    modalRelatedList: document.getElementById('modal-related-list')
  };

  /* ==========================================================================
     INIT & DATA FETCHING
     ========================================================================== */
  function init() {
    loadBookmarks();
    setupRouting();
    bindEvents();
    initPhysicsCanvas();
    initGlobalClickFX();

    // 1. Instant Synchronous Load from window.MURUGA_DATA (0ms, zero network latency)
    if (typeof window !== 'undefined' && window.MURUGA_DATA && Array.isArray(window.MURUGA_DATA.inventory) && window.MURUGA_DATA.inventory.length > 0) {
      state.inventory = window.MURUGA_DATA.inventory;
      state.playlists = window.MURUGA_DATA.playlists || [];
      initAppWithData();
      return;
    }

    // 2. Asynchronous Fetch Fallback
    fetch('data/playlist-inventory.json')
      .then(res => {
        if (!res.ok) throw new Error('Network error loading inventory');
        return res.json();
      })
      .then(data => {
        state.inventory = data.inventory || [];
        state.playlists = data.playlists || [];
        initAppWithData();
      })
      .catch(err => {
        console.warn('Could not load data/playlist-inventory.json via fetch. Using offline fallback.', err);
        handleOfflineFallback();
      });
  }

  function initAppWithData() {
    if (DOM.totalCount) {
      DOM.totalCount.textContent = state.inventory.length;
    }
    
    // Render dynamic counts for all filter pills
    updatePillCounts();

    // Render components across tabs
    renderRecentUploads();
    renderPlaylistsDirectory();
    renderExamPrepHub();
    renderNeetHub();
    renderCareerHub();
    renderMotivationHub();

    // Apply initial filters & render Library
    applyFilters();
  }

  function updatePillCounts() {
    if (!state.inventory || state.inventory.length === 0) return;

    const countMatches = (testFn) => state.inventory.filter(testFn).length;

    // 1. Class level counts
    const classContainer = document.getElementById('class-filter-pills');
    if (classContainer) {
      classContainer.querySelectorAll('.filter-pill').forEach(pill => {
        const val = pill.getAttribute('data-val');
        let count = state.inventory.length;
        let label = 'All Classes';
        if (val === 'Class 12') {
          count = countMatches(i => (i.class_level || '').includes('12'));
          label = 'Class 12';
        } else if (val === 'Class 11') {
          count = countMatches(i => (i.class_level || '').includes('11'));
          label = 'Class 11';
        } else if (val === 'Class 10') {
          count = countMatches(i => (i.class_level || '').includes('10'));
          label = 'Class 10';
        } else if (val === 'Class 9') {
          count = countMatches(i => (i.class_level || '').includes('9'));
          label = 'Class 9';
        }
        pill.innerHTML = `${label} <span class="pill-cnt">${count}</span>`;
      });
    }

    // 2. Syllabus counts
    const syllabusContainer = document.getElementById('syllabus-filter-pills');
    if (syllabusContainer) {
      syllabusContainer.querySelectorAll('.filter-pill').forEach(pill => {
        const val = pill.getAttribute('data-val');
        let count = state.inventory.length;
        let label = 'All Boards';
        if (val === 'CBSE') {
          count = countMatches(i => {
            const s = (i.syllabus || '').toLowerCase();
            return s.includes('cbse') || s.includes('ncert');
          });
          label = 'CBSE / NCERT';
        } else if (val === 'State') {
          count = countMatches(i => {
            const s = (i.syllabus || '').toLowerCase();
            return s.includes('state') || s.includes('samacheer') || s.includes('tn');
          });
          label = 'TN State Board';
        } else if (val === 'NEET') {
          count = countMatches(i => {
            const s = (i.syllabus || '').toLowerCase();
            return s.includes('neet') || s.includes('jee');
          });
          label = 'NEET / JEE';
        }
        pill.innerHTML = `${label} <span class="pill-cnt">${count}</span>`;
      });
    }

    // 3. Format counts
    const formatContainer = document.getElementById('format-filter-pills');
    if (formatContainer) {
      formatContainer.querySelectorAll('.filter-pill').forEach(pill => {
        const val = pill.getAttribute('data-val');
        let count = state.inventory.length;
        let label = 'All Formats';
        if (val === 'Concept Lesson') {
          count = countMatches(i => (i.content_format || '').toLowerCase().includes('concept'));
          label = 'Concepts';
        } else if (val === 'PYQ Problem Solving') {
          count = countMatches(i => {
            const f = (i.content_format || '').toLowerCase();
            return f.includes('pyq') || f.includes('worked') || f.includes('numerical');
          });
          label = 'PYQ Solving';
        } else if (val === 'One-Shot Revision') {
          count = countMatches(i => {
            const f = (i.content_format || '').toLowerCase();
            return f.includes('one-shot') || f.includes('oneshot');
          });
          label = 'One-Shot';
        } else if (val === 'Formula Tricks') {
          count = countMatches(i => {
            const f = (i.content_format || '').toLowerCase();
            return f.includes('formula') || f.includes('trick') || f.includes('shortcut');
          });
          label = 'Formula Tricks';
        } else if (val === 'Study Plan') {
          count = countMatches(i => {
            const f = (i.content_format || '').toLowerCase();
            return f.includes('plan') || f.includes('challenge');
          });
          label = 'Study Plans';
        }
        pill.innerHTML = `${label} <span class="pill-cnt">${count}</span>`;
      });
    }
  }

  /* ==========================================================================
     ROUTING & TAB SWITCHING
     ========================================================================== */
  function setupRouting() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      switchTab(hash);
    };

    window.addEventListener('hashchange', handleHash);
    if (window.location.hash) {
      handleHash();
    }
  }

  function switchTab(tabId) {
    const targetPane = document.getElementById(`tab-${tabId}`);
    if (!targetPane) return;

    state.activeTab = tabId;

    DOM.tabPanes.forEach(pane => pane.classList.remove('active'));
    targetPane.classList.add('active');

    DOM.navLinks.forEach(link => {
      if (link.getAttribute('data-tab') === tabId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    closeMobileDrawer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ==========================================================================
     FILTERING & SEARCH ENGINE (STUDY LIBRARY)
     ========================================================================== */
  function applyFilters() {
    const { search, classLevel, syllabus, format, sort, playlistId } = state.filters;
    const query = search.trim().toLowerCase();
    const queryWords = query ? query.split(/\s+/).filter(Boolean) : [];

    state.filteredLessons = state.inventory.filter(item => {
      // 1. Text Search across Title, Chapter, Topic, and Playlist Name
      if (queryWords.length > 0) {
        const textToSearch = [
          item.video_title,
          item.chapter,
          item.topic,
          item.playlist_title,
          item.class_level,
          item.syllabus,
          item.content_format
        ].filter(Boolean).join(' ').toLowerCase();

        const allWordsMatch = queryWords.every(word => textToSearch.includes(word));
        if (!allWordsMatch) return false;
      }

      // 2. Class Level Filter
      if (classLevel !== 'all') {
        const itemClass = (item.class_level || '').toLowerCase();
        if (classLevel === 'Class 12' && !itemClass.includes('12')) return false;
        if (classLevel === 'Class 11' && !itemClass.includes('11')) return false;
        if (classLevel === 'Class 10' && !itemClass.includes('10')) return false;
        if (classLevel === 'Class 9' && !itemClass.includes('9')) return false;
      }

      // 3. Syllabus Filter
      if (syllabus !== 'all') {
        const itemSyllabus = (item.syllabus || '').toLowerCase();
        if (syllabus === 'CBSE' && !itemSyllabus.includes('cbse') && !itemSyllabus.includes('ncert')) return false;
        if (syllabus === 'State' && !itemSyllabus.includes('state') && !itemSyllabus.includes('samacheer') && !itemSyllabus.includes('tn')) return false;
        if (syllabus === 'NEET' && !itemSyllabus.includes('neet') && !itemSyllabus.includes('jee')) return false;
      }

      // 4. Format Filter
      if (format !== 'all') {
        const itemFormat = (item.content_format || '').toLowerCase();
        if (format === 'Concept Lesson' && !itemFormat.includes('concept')) return false;
        if (format === 'PYQ Problem Solving' && !itemFormat.includes('pyq') && !itemFormat.includes('worked') && !itemFormat.includes('numerical')) return false;
        if (format === 'One-Shot Revision' && !itemFormat.includes('one-shot') && !itemFormat.includes('oneshot')) return false;
        if (format === 'Formula Tricks' && !itemFormat.includes('formula') && !itemFormat.includes('trick') && !itemFormat.includes('shortcut')) return false;
        if (format === 'Study Plan' && !itemFormat.includes('plan') && !itemFormat.includes('challenge')) return false;
      }

      // 5. Playlist ID Filter (if navigated from Playlists tab)
      if (playlistId && item.playlist_id !== playlistId) {
        return false;
      }

      return true;
    });

    // Apply Sorting
    sortLessons(sort);

    // Update Pagination & Counter
    state.pagination.page = 1;
    state.pagination.totalPages = Math.ceil(state.filteredLessons.length / state.pagination.pageSize) || 1;

    if (DOM.filteredCount) DOM.filteredCount.textContent = state.filteredLessons.length;
    renderActiveFilterTags();
    renderLibraryPage();
  }

  function sortLessons(sortMode) {
    if (sortMode === 'az') {
      state.filteredLessons.sort((a, b) => a.video_title.localeCompare(b.video_title));
    } else if (sortMode === 'za') {
      state.filteredLessons.sort((a, b) => b.video_title.localeCompare(a.video_title));
    } else if (sortMode === 'duration-desc') {
      state.filteredLessons.sort((a, b) => {
        const durA = parseDurationSeconds(a.duration_if_visible);
        const durB = parseDurationSeconds(b.duration_if_visible);
        return durB - durA;
      });
    }
  }

  function parseDurationSeconds(durStr) {
    if (!durStr) return 0;
    const parts = durStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  }

  /* ==========================================================================
     LIBRARY RENDERING
     ========================================================================== */
  function renderLibraryPage() {
    const { page, pageSize } = state.pagination;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageItems = state.filteredLessons.slice(startIndex, endIndex);

    if (DOM.lessonsGrid) {
      DOM.lessonsGrid.innerHTML = '';
    }

    if (pageItems.length === 0) {
      if (DOM.libraryEmptyState) DOM.libraryEmptyState.style.display = 'block';
      if (DOM.paginationWrapper) DOM.paginationWrapper.style.display = 'none';
      return;
    }

    if (DOM.libraryEmptyState) DOM.libraryEmptyState.style.display = 'none';
    if (DOM.paginationWrapper) DOM.paginationWrapper.style.display = (state.pagination.totalPages <= 1) ? 'none' : 'flex';

    if (DOM.lessonsGrid) {
      pageItems.forEach(item => {
        const card = createLessonCard(item);
        DOM.lessonsGrid.appendChild(card);
      });
    }

    // Update pagination indicator
    if (DOM.pageIndicator) {
      DOM.pageIndicator.textContent = `Page ${page} of ${state.pagination.totalPages}`;
    }
    if (DOM.prevPageBtn) DOM.prevPageBtn.disabled = (page <= 1);
    if (DOM.nextPageBtn) DOM.nextPageBtn.disabled = (page >= state.pagination.totalPages);
  }

  function createLessonCard(item) {
    const card = document.createElement('article');
    card.className = 'video-card';
    card.setAttribute('data-video-id', item.video_id);

    const isBookmarked = state.bookmarks.some(b => b.video_id === item.video_id);
    const thumbUrl = `https://i.ytimg.com/vi/${item.video_id}/hqdefault.jpg`;

    card.innerHTML = `
      <div class="card-thumb-wrap">
        <img class="card-thumb-img" src="${thumbUrl}" alt="${escapeHtml(item.video_title)}" loading="lazy">
        ${item.duration_if_visible ? `<span class="card-duration">${escapeHtml(item.duration_if_visible)}</span>` : ''}
        <div class="card-play-overlay">
          <div class="play-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div class="card-tags-row">
          <span class="card-badge class-tag">${escapeHtml(item.class_level || 'General')}</span>
          <span class="card-badge board-tag">${escapeHtml(item.syllabus || 'Physics')}</span>
          <span class="card-badge format-tag">${escapeHtml(item.content_format || 'Lesson')}</span>
        </div>
        <h3 class="card-title">${escapeHtml(item.video_title)}</h3>
        <p class="card-playlist-name">${escapeHtml(item.playlist_title || 'Open Your Mind With Muruga MP')}</p>
        <div class="card-footer-row">
          <span class="card-watch-link">Watch Lesson &rarr;</span>
          <button type="button" class="card-bookmark-btn ${isBookmarked ? 'saved' : ''}" aria-label="Bookmark this lesson" title="${isBookmarked ? 'Saved to bookmarks' : 'Save to bookmarks'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
          </button>
        </div>
      </div>
    `;

    // Click handler to open lesson modal
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-bookmark-btn')) {
        e.stopPropagation();
        toggleBookmark(item);
        return;
      }
      openLessonModal(item);
    });

    return card;
  }

  function renderActiveFilterTags() {
    const { search, classLevel, syllabus, format, playlistId } = state.filters;
    DOM.activeTagsContainer.innerHTML = '';
    let hasActive = false;

    if (search) {
      hasActive = true;
      addActiveChip(`Search: "${search}"`, () => {
        state.filters.search = '';
        DOM.librarySearchInput.value = '';
        DOM.librarySearchClear.style.display = 'none';
        applyFilters();
      });
    }

    if (classLevel !== 'all') {
      hasActive = true;
      addActiveChip(`Class: ${classLevel}`, () => {
        state.filters.classLevel = 'all';
        updatePillSelection(DOM.classFilterPills, 'all');
        applyFilters();
      });
    }

    if (syllabus !== 'all') {
      hasActive = true;
      addActiveChip(`Board: ${syllabus}`, () => {
        state.filters.syllabus = 'all';
        updatePillSelection(DOM.syllabusFilterPills, 'all');
        applyFilters();
      });
    }

    if (format !== 'all') {
      hasActive = true;
      addActiveChip(`Format: ${format}`, () => {
        state.filters.format = 'all';
        updatePillSelection(DOM.formatFilterPills, 'all');
        applyFilters();
      });
    }

    if (playlistId) {
      hasActive = true;
      const pl = state.playlists.find(p => p.playlist_id === playlistId);
      const title = pl ? pl.title.slice(0, 25) + '...' : 'Playlist Filter';
      addActiveChip(`Playlist: ${title}`, () => {
        state.filters.playlistId = null;
        applyFilters();
      });
    }

    DOM.activeFiltersBar.style.display = hasActive ? 'flex' : 'none';
  }

  function addActiveChip(label, onRemove) {
    const chip = document.createElement('span');
    chip.className = 'active-chip';
    chip.innerHTML = `${escapeHtml(label)} <span class="active-chip-remove">&times;</span>`;
    chip.querySelector('.active-chip-remove').addEventListener('click', onRemove);
    DOM.activeTagsContainer.appendChild(chip);
  }

  function updatePillSelection(container, val) {
    if (!container) return;
    container.querySelectorAll('.filter-pill').forEach(pill => {
      if (pill.getAttribute('data-val') === val) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     RECENT UPLOADS & SPECIFIC TAB HUBS
     ========================================================================== */
  function renderRecentUploads() {
    if (!DOM.featuredRecentGrid) return;
    DOM.featuredRecentGrid.innerHTML = '';
    // Take recent high-yield uploads
    const recents = state.inventory.slice(0, 4);
    recents.forEach(item => {
      DOM.featuredRecentGrid.appendChild(createLessonCard(item));
    });
  }

  function renderPlaylistsDirectory() {
    if (!DOM.playlistsGrid) return;
    DOM.playlistsGrid.innerHTML = '';

    state.playlists.forEach(p => {
      const card = document.createElement('div');
      card.className = 'playlist-card';
      const thumb = p.thumbnail_url || (p.videos && p.videos[0] ? `https://i.ytimg.com/vi/${p.videos[0].video_id}/hqdefault.jpg` : 'https://i.ytimg.com/vi/gxss05PxO8c/hqdefault.jpg');
      const badge = p.video_count_badge || `${p.videos ? p.videos.length : ''} Videos`;

      card.innerHTML = `
        <div class="playlist-thumb-wrap">
          <img class="playlist-thumb-img" src="${thumb}" alt="${escapeHtml(p.title)}" loading="lazy">
          <div class="playlist-count-overlay">
            <span class="p-count-num">${badge.split(' ')[0]}</span>
            <span class="p-count-lbl">${badge.split(' ').slice(1).join(' ') || 'Videos'}</span>
          </div>
        </div>
        <div class="playlist-body">
          <h3 class="playlist-title">${escapeHtml(p.title)}</h3>
          <div class="playlist-actions-row">
            <button class="playlist-explore-btn" data-action="explore-playlist" data-pid="${p.playlist_id}">
              Explore Lessons &rarr;
            </button>
            <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="playlist-yt-link">
              YouTube &nearr;
            </a>
          </div>
        </div>
      `;

      card.querySelector('[data-action="explore-playlist"]').addEventListener('click', () => {
        state.filters.playlistId = p.playlist_id;
        state.filters.search = '';
        state.filters.classLevel = 'all';
        state.filters.syllabus = 'all';
        state.filters.format = 'all';
        updatePillSelection(DOM.classFilterPills, 'all');
        updatePillSelection(DOM.syllabusFilterPills, 'all');
        updatePillSelection(DOM.formatFilterPills, 'all');
        applyFilters();
        window.location.hash = '#library';
      });

      DOM.playlistsGrid.appendChild(card);
    });
  }

  function renderExamPrepHub() {
    if (!DOM.examPrepVideosGrid) return;
    DOM.examPrepVideosGrid.innerHTML = '';
    const examVideos = state.inventory.filter(i => 
      (i.chapter || '').includes('Exam') || 
      (i.video_title || '').includes('Quarterly') || 
      (i.video_title || '').includes('Mark') ||
      (i.video_title || '').includes('Centum')
    ).slice(0, 8);

    examVideos.forEach(v => DOM.examPrepVideosGrid.appendChild(createLessonCard(v)));
  }

  function renderNeetHub() {
    if (!DOM.neetVideosGrid) return;
    DOM.neetVideosGrid.innerHTML = '';
    const neetVideos = state.inventory.filter(i => 
      (i.exam_goal || '').includes('NEET') || 
      (i.video_title || '').toLowerCase().includes('neet')
    ).slice(0, 12);

    neetVideos.forEach(v => DOM.neetVideosGrid.appendChild(createLessonCard(v)));
  }

  function renderCareerHub() {
    if (!DOM.careerVideosGrid) return;
    DOM.careerVideosGrid.innerHTML = '';
    const careerVideos = state.inventory.filter(i => 
      (i.subject || '').includes('Career') || 
      (i.video_title || '').toLowerCase().includes('tnea') ||
      (i.video_title || '').toLowerCase().includes('counselling')
    );

    careerVideos.forEach(v => {
      const card = createLessonCard(v);
      // Append time-sensitive badge
      const tagRow = card.querySelector('.card-tags-row');
      if (tagRow) {
        const warnTag = document.createElement('span');
        warnTag.className = 'career-caution-tag';
        warnTag.textContent = 'Admissions Guide • Check Live Notice';
        tagRow.appendChild(warnTag);
      }
      DOM.careerVideosGrid.appendChild(card);
    });
  }

  function renderMotivationHub() {
    if (!DOM.motivationGrid) return;
    DOM.motivationGrid.innerHTML = '';
    const motVideos = state.inventory.filter(i => 
      (i.content_format || '').includes('Strategy') || 
      (i.subject || '').includes('Motivation') ||
      (i.video_title || '').toLowerCase().includes('hero') ||
      (i.video_title || '').toLowerCase().includes('mistake') ||
      (i.video_title || '').toLowerCase().includes('plan')
    ).slice(0, 6);

    motVideos.forEach(v => DOM.motivationGrid.appendChild(createLessonCard(v)));
  }

  /* ==========================================================================
     LESSON DETAIL MODAL
     ========================================================================== */
  function openLessonModal(item) {
    if (!item) return;
    state.currentLesson = item;

    // Breadcrumbs
    if (DOM.modalCrumbClass) DOM.modalCrumbClass.textContent = item.class_level || 'General';
    if (DOM.modalCrumbChapter) DOM.modalCrumbChapter.textContent = item.chapter || item.subject || 'Physics';

    // Video Iframe Embed
    if (DOM.modalVideoIframe) {
      DOM.modalVideoIframe.src = `https://www.youtube.com/embed/${item.video_id}?autoplay=1&rel=0`;
    }

    // Metadata Badges
    if (DOM.modalClassBadge) DOM.modalClassBadge.textContent = item.class_level || 'General';
    if (DOM.modalSyllabusBadge) DOM.modalSyllabusBadge.textContent = item.syllabus || 'CBSE & State';
    if (DOM.modalFormatBadge) DOM.modalFormatBadge.textContent = item.content_format || 'Concept Lesson';
    if (DOM.modalLangBadge) DOM.modalLangBadge.textContent = item.language || 'Tamil';

    // Title & Playlist reference
    if (DOM.modalLessonTitle) DOM.modalLessonTitle.textContent = item.video_title;
    if (DOM.modalPlaylistLink) {
      DOM.modalPlaylistLink.textContent = item.playlist_title || 'Open Your Mind With Muruga MP';
      DOM.modalPlaylistLink.href = item.playlist_url || item.source_url || `https://www.youtube.com/watch?v=${item.video_id}`;
    }

    // External Watch Button
    if (DOM.modalExternalYtBtn) {
      DOM.modalExternalYtBtn.href = `https://www.youtube.com/watch?v=${item.video_id}`;
    }

    // Bookmark status update
    updateModalBookmarkBtn();

    // Related Lessons from same chapter / playlist
    renderModalRelatedLessons(item);

    // Open Modal
    if (DOM.lessonModal) DOM.lessonModal.classList.add('open');
    if (DOM.modalBackdrop) DOM.modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLessonModal() {
    state.currentLesson = null;
    if (DOM.modalVideoIframe) DOM.modalVideoIframe.src = '';
    if (DOM.lessonModal) DOM.lessonModal.classList.remove('open');
    if (DOM.modalBackdrop) DOM.modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderModalRelatedLessons(current) {
    DOM.modalRelatedList.innerHTML = '';
    
    // Find lessons in the same playlist or chapter, excluding current
    const related = state.inventory.filter(i => 
      i.video_id !== current.video_id && 
      (i.playlist_id === current.playlist_id || (i.chapter && i.chapter === current.chapter))
    ).slice(0, 4);

    if (related.length === 0) {
      DOM.modalRelatedList.innerHTML = '<p class="text-dim" style="font-size: 0.85rem;">No other lessons in this immediate sequence.</p>';
      return;
    }

    related.forEach(rel => {
      const itemEl = document.createElement('div');
      itemEl.className = 'related-item';
      itemEl.innerHTML = `
        <span class="r-title">${escapeHtml(rel.video_title)}</span>
        <span class="r-dur">${escapeHtml(rel.duration_if_visible || 'Watch &rarr;')}</span>
      `;
      itemEl.addEventListener('click', () => {
        openLessonModal(rel);
      });
      DOM.modalRelatedList.appendChild(itemEl);
    });
  }

  /* ==========================================================================
     BOOKMARKS SYSTEM
     ========================================================================== */
  function loadBookmarks() {
    try {
      const saved = localStorage.getItem('muruga_mp_bookmarks');
      if (saved) {
        state.bookmarks = JSON.parse(saved);
      }
    } catch (e) {
      state.bookmarks = [];
    }
    updateBookmarkUI();
  }

  function toggleBookmark(item) {
    const idx = state.bookmarks.findIndex(b => b.video_id === item.video_id);
    if (idx >= 0) {
      state.bookmarks.splice(idx, 1);
      showToast('Removed from saved bookmarks');
    } else {
      state.bookmarks.push({
        video_id: item.video_id,
        video_title: item.video_title,
        chapter: item.chapter || 'Physics',
        duration_if_visible: item.duration_if_visible || '',
        class_level: item.class_level || 'Class 12'
      });
      showToast('Saved to your bookmarks! 🔖');
    }

    try {
      localStorage.setItem('muruga_mp_bookmarks', JSON.stringify(state.bookmarks));
    } catch (e) {}

    updateBookmarkUI();
    // Re-render library cards so bookmark icon state syncs
    renderLibraryPage();
    if (state.currentLesson && state.currentLesson.video_id === item.video_id) {
      updateModalBookmarkBtn();
    }
  }

  function updateBookmarkUI() {
    DOM.bookmarkCount.textContent = state.bookmarks.length;
    DOM.bDrawerCount.textContent = state.bookmarks.length;

    // Render in drawer
    DOM.bookmarksListContainer.querySelectorAll('.b-item').forEach(el => el.remove());

    if (state.bookmarks.length === 0) {
      DOM.bookmarksEmpty.style.display = 'block';
    } else {
      DOM.bookmarksEmpty.style.display = 'none';
      state.bookmarks.forEach(bm => {
        const el = document.createElement('div');
        el.className = 'b-item';
        el.innerHTML = `
          <div class="b-item-title">${escapeHtml(bm.video_title)}</div>
          <div class="b-item-actions">
            <span class="card-badge class-tag">${escapeHtml(bm.class_level)}</span>
            <div style="display:flex; gap:0.5rem;">
              <button class="btn-primary small b-play-btn">Watch</button>
              <button class="btn-text-danger b-del-btn">Remove</button>
            </div>
          </div>
        `;
        el.querySelector('.b-play-btn').addEventListener('click', () => {
          closeBookmarksDrawer();
          const fullItem = state.inventory.find(i => i.video_id === bm.video_id) || bm;
          openLessonModal(fullItem);
        });
        el.querySelector('.b-del-btn').addEventListener('click', () => {
          toggleBookmark(bm);
        });
        DOM.bookmarksListContainer.appendChild(el);
      });
    }
  }

  function updateModalBookmarkBtn() {
    if (!state.currentLesson) return;
    const isBookmarked = state.bookmarks.some(b => b.video_id === state.currentLesson.video_id);
    DOM.modalBookmarkBtnText.textContent = isBookmarked ? 'Saved in Bookmarks' : 'Save to Bookmarks';
    DOM.modalBookmarkToggleBtn.style.borderColor = isBookmarked ? 'var(--accent-cyan)' : '';
    DOM.modalBookmarkToggleBtn.style.color = isBookmarked ? 'var(--accent-cyan)' : '';
  }

  function openBookmarksDrawer() {
    DOM.bookmarksDrawer.classList.add('open');
    DOM.bookmarksOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBookmarksDrawer() {
    DOM.bookmarksDrawer.classList.remove('open');
    DOM.bookmarksOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  /* ==========================================================================
     EVENT LISTENERS & BINDINGS
     ========================================================================== */
  function bindEvents() {
    // Mobile Drawer
    DOM.mobileToggleBtn.addEventListener('click', () => {
      DOM.mobileDrawer.classList.add('open');
      DOM.mobileDrawerOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
    DOM.drawerCloseBtn.addEventListener('click', closeMobileDrawer);
    DOM.mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);

    // Bookmarks Drawer
    DOM.openBookmarksBtn.addEventListener('click', openBookmarksDrawer);
    DOM.closeBookmarksBtn.addEventListener('click', closeBookmarksDrawer);
    DOM.bookmarksOverlay.addEventListener('click', closeBookmarksDrawer);

    // Modal
    DOM.modalCloseBtn.addEventListener('click', closeLessonModal);
    DOM.modalBackdrop.addEventListener('click', closeLessonModal);
    DOM.modalBookmarkToggleBtn.addEventListener('click', () => {
      if (state.currentLesson) toggleBookmark(state.currentLesson);
    });
    DOM.modalShareBtn.addEventListener('click', () => {
      if (!state.currentLesson) return;
      const shareUrl = `https://www.youtube.com/watch?v=${state.currentLesson.video_id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('YouTube link copied to clipboard! 📋');
      }).catch(() => {
        showToast(shareUrl);
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (DOM.lessonModal.classList.contains('open')) closeLessonModal();
        if (DOM.bookmarksDrawer.classList.contains('open')) closeBookmarksDrawer();
        if (DOM.mobileDrawer.classList.contains('open')) closeMobileDrawer();
      }
      if (e.key === '/' && document.activeElement !== DOM.librarySearchInput && document.activeElement !== DOM.heroSearchInput) {
        e.preventDefault();
        window.location.hash = '#library';
        DOM.librarySearchInput.focus();
      }
    });

    // Hero Search Box
    DOM.heroSearchBtn.addEventListener('click', () => {
      const q = DOM.heroSearchInput.value.trim();
      state.filters.search = q;
      state.filters.playlistId = null;
      DOM.librarySearchInput.value = q;
      DOM.librarySearchClear.style.display = q ? 'block' : 'none';
      applyFilters();
      window.location.hash = '#library';
    });
    DOM.heroSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') DOM.heroSearchBtn.click();
    });

    // Quick Chips in Hero
    DOM.quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-search');
        state.filters.search = query;
        state.filters.playlistId = null;
        DOM.librarySearchInput.value = query;
        DOM.librarySearchClear.style.display = 'block';
        applyFilters();
        window.location.hash = '#library';
      });
    });

    // Quick Search Trigger in Header
    DOM.searchTrigger.addEventListener('click', () => {
      window.location.hash = '#library';
      DOM.librarySearchInput.focus();
    });

    // Library Search Input
    let searchDebounce = null;
    DOM.librarySearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      const val = e.target.value;
      DOM.librarySearchClear.style.display = val ? 'block' : 'none';
      searchDebounce = setTimeout(() => {
        state.filters.search = val;
        applyFilters();
      }, 200);
    });

    DOM.librarySearchClear.addEventListener('click', () => {
      DOM.librarySearchInput.value = '';
      DOM.librarySearchClear.style.display = 'none';
      state.filters.search = '';
      applyFilters();
      DOM.librarySearchInput.focus();
    });

    // Sort Dropdown
    DOM.sortSelect.addEventListener('change', (e) => {
      state.filters.sort = e.target.value;
      applyFilters();
    });

    // Class Filter Pills
    DOM.classFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      const val = pill.getAttribute('data-val');
      state.filters.classLevel = val;
      updatePillSelection(DOM.classFilterPills, val);
      applyFilters();
    });

    // Syllabus Filter Pills
    DOM.syllabusFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      const val = pill.getAttribute('data-val');
      state.filters.syllabus = val;
      updatePillSelection(DOM.syllabusFilterPills, val);
      applyFilters();
    });

    // Format Filter Pills
    DOM.formatFilterPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;
      const val = pill.getAttribute('data-val');
      state.filters.format = val;
      updatePillSelection(DOM.formatFilterPills, val);
      applyFilters();
    });

    // Reset Filters Buttons
    DOM.resetAllFiltersBtn.addEventListener('click', resetAllFilters);
    DOM.emptyResetBtn.addEventListener('click', resetAllFilters);

    // Pagination
    DOM.prevPageBtn.addEventListener('click', () => {
      if (state.pagination.page > 1) {
        state.pagination.page--;
        renderLibraryPage();
        document.querySelector('.library-filter-panel').scrollIntoView({ behavior: 'smooth' });
      }
    });

    DOM.nextPageBtn.addEventListener('click', () => {
      if (state.pagination.page < state.pagination.totalPages) {
        state.pagination.page++;
        renderLibraryPage();
        document.querySelector('.library-filter-panel').scrollIntoView({ behavior: 'smooth' });
      }
    });

    // Generic Action Delegates across page
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');

      if (action === 'view-tab') {
        const target = btn.getAttribute('data-target');
        window.location.hash = `#${target}`;
      } else if (action === 'filter-track') {
        const cls = btn.getAttribute('data-class');
        const fmt = btn.getAttribute('data-format');
        const srch = btn.getAttribute('data-search');

        if (cls) {
          state.filters.classLevel = cls;
          updatePillSelection(DOM.classFilterPills, cls);
        }
        if (fmt) {
          state.filters.format = fmt;
          updatePillSelection(DOM.formatFilterPills, fmt);
        }
        if (srch) {
          state.filters.search = srch;
          DOM.librarySearchInput.value = srch;
          DOM.librarySearchClear.style.display = 'block';
        }
        applyFilters();
        window.location.hash = '#library';
      }
    });
  }

  function resetAllFilters() {
    state.filters = {
      search: '',
      classLevel: 'all',
      syllabus: 'all',
      format: 'all',
      sort: 'default',
      playlistId: null
    };
    DOM.librarySearchInput.value = '';
    DOM.librarySearchClear.style.display = 'none';
    DOM.sortSelect.value = 'default';
    updatePillSelection(DOM.classFilterPills, 'all');
    updatePillSelection(DOM.syllabusFilterPills, 'all');
    updatePillSelection(DOM.formatFilterPills, 'all');
    applyFilters();
  }

  function closeMobileDrawer() {
    DOM.mobileDrawer.classList.remove('open');
    DOM.mobileDrawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     INTERACTIVE QUANTUM PHYSICS ENGINE (CANVAS)
     Coulomb Force Repulsion, Electrostatic Lattice, and Click Blast Waves
     ========================================================================== */
  function initPhysicsCanvas() {
    const canvas = document.getElementById('physics-canvas');
    if (!canvas) return;

    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let particles = [];
    let shockwaves = [];
    let animFrameId = null;
    let isVisible = true;

    const mouse = {
      x: -9999,
      y: -9999,
      active: false
    };

    const PALETTE = [
      '#38bdf8', // Neon Cyan
      '#fbbf24', // Amber Gold
      '#c084fc', // Electric Violet
      '#34d399', // Emerald Teal
      '#60a5fa'  // Azure Blue
    ];

    function resize() {
      const rect = heroSection.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const targetCount = Math.min(Math.max(Math.floor(width / 24), 28), 54);
      if (particles.length === 0) {
        initParticles(targetCount);
      } else if (particles.length < targetCount) {
        while (particles.length < targetCount) {
          particles.push(createParticle());
        }
      }
    }

    function createParticle(x, y) {
      return {
        x: typeof x === 'number' ? x : Math.random() * width,
        y: typeof y === 'number' ? y : Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: 1.8 + Math.random() * 2.2,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        baseAlpha: 0.35 + Math.random() * 0.45,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseOffset: Math.random() * Math.PI * 2,
        mass: 0.8 + Math.random() * 1.4
      };
    }

    function initParticles(count) {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    }

    // Hero pointer tracking for Coulomb electrostatic force repulsion
    heroSection.addEventListener('pointermove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });

    heroSection.addEventListener('pointerleave', () => {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    });

    // Blast wave function callable from canvas clicks or global clicks
    function triggerBlast(clientX, clientY) {
      const rect = heroSection.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;

      // Only add canvas blast wave if inside or near hero section
      if (localX < -50 || localX > width + 50 || localY < -50 || localY > height + 50) {
        return;
      }

      // Add visual canvas shockwave
      shockwaves.push({
        x: Math.max(0, Math.min(width, localX)),
        y: Math.max(0, Math.min(height, localY)),
        radius: 10,
        maxRadius: Math.min(width * 0.45, 260),
        alpha: 0.9,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
      });

      // Coulomb impulse blast on particles
      const blastRadius = 280;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - localX;
        const dy = p.y - localY;
        const dist = Math.hypot(dx, dy) || 1;

        if (dist < blastRadius) {
          const power = ((blastRadius - dist) / blastRadius) * (14 / p.mass);
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * power;
          p.vy += Math.sin(angle) * power;
        }
      }
    }

    // Expose engine globally for click system
    window.PHYSICS_ENGINE = {
      triggerBlast: triggerBlast
    };

    // Physics Animation Loop
    let lastTime = performance.now();

    function step(now) {
      if (!isVisible) {
        animFrameId = requestAnimationFrame(step);
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // 1. Update and draw Shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 240 * dt;
        sw.alpha *= 0.94;

        if (sw.radius >= sw.maxRadius || sw.alpha < 0.02) {
          shockwaves.splice(s, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 2.5 * (1 - sw.radius / sw.maxRadius) + 0.5;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Physics & Particle Positions
      const repulsionRadius = 135;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Coulomb force from mouse
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < repulsionRadius && mdist > 1) {
            const force = ((repulsionRadius - mdist) / repulsionRadius) * (4.5 / p.mass);
            const angle = Math.atan2(mdy, mdx);
            p.vx += Math.cos(angle) * force * 0.15;
            p.vy += Math.sin(angle) * force * 0.15;
          }
        }

        // Velocity damping & natural Brownian motion
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;

        // Position integration
        p.x += p.vx;
        p.y += p.vy;

        // Soft bounce boundaries
        if (p.x < 10) { p.x = 10; p.vx = Math.abs(p.vx) * 0.8; }
        if (p.x > width - 10) { p.x = width - 10; p.vx = -Math.abs(p.vx) * 0.8; }
        if (p.y < 10) { p.y = 10; p.vy = Math.abs(p.vy) * 0.8; }
        if (p.y > height - 10) { p.y = height - 10; p.vy = -Math.abs(p.vy) * 0.8; }
      }

      // 3. Draw Quantum Lattice (lines between nearby particles)
      const maxConnectDist = 110;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist) {
            const alpha = (1 - dist / maxConnectDist) * 0.28;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 4. Draw Particles with glowing quantum halos
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulse = Math.sin(now * p.pulseSpeed * 0.05 + p.pulseOffset) * 0.3 + 0.7;
        const currentAlpha = Math.min(1, p.baseAlpha * pulse);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = currentAlpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(step);
    }

    // Performance: Pause canvas when scrolled far past hero
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(heroSection);

    // Initial sizing and kick-off
    resize();
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
    animFrameId = requestAnimationFrame(step);
  }

  /* ==========================================================================
     GLOBAL CLICK ANIMATION & SHOCKWAVE SYSTEM
     Triggers dynamic quantum shockwaves and sparks on ANY click anywhere on site
     ========================================================================== */
  function initGlobalClickFX() {
    let fxLayer = document.getElementById('physics-click-fx-layer');
    if (!fxLayer) {
      fxLayer = document.createElement('div');
      fxLayer.id = 'physics-click-fx-layer';
      document.body.appendChild(fxLayer);
    }

    const SHOCK_THEMES = ['cyan', 'amber', 'purple'];
    const SPARK_COLORS = ['#38bdf8', '#fbbf24', '#f59e0b', '#c084fc', '#34d399', '#f43f5e'];

    document.addEventListener('pointerdown', (e) => {
      const x = e.clientX;
      const y = e.clientY;

      // 1. Expanding Quantum Shockwave Ring
      const theme = SHOCK_THEMES[Math.floor(Math.random() * SHOCK_THEMES.length)];
      const ring = document.createElement('div');
      ring.className = `click-shockwave ${theme}`;
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
      fxLayer.appendChild(ring);

      ring.addEventListener('animationend', () => {
        ring.remove();
      });

      // 2. Radial Physics Sparks
      const sparkCount = 8;
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement('div');
        spark.className = 'click-spark';
        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;

        const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.45;
        const dist = 32 + Math.random() * 45;
        const dx = Math.round(Math.cos(angle) * dist);
        const dy = Math.round(Math.sin(angle) * dist);
        const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

        spark.style.setProperty('--dx', `${dx}px`);
        spark.style.setProperty('--dy', `${dy}px`);
        spark.style.backgroundColor = color;
        spark.style.boxShadow = `0 0 8px ${color}, 0 0 16px ${color}`;

        fxLayer.appendChild(spark);
        spark.addEventListener('animationend', () => {
          spark.remove();
        });
      }

      // 3. Elastic Spring Bounce on Clicked Element
      const target = e.target.closest('button, a, input, select, .video-card, .playlist-card, .filter-pill, .quick-chip, .floating-formula-chip, .floating-badge, .motto-primary-slogan, .portrait-image-wrapper, .metric-card');
      if (target) {
        target.classList.remove('physics-clicked');
        // Force reflow
        void target.offsetWidth;
        target.classList.add('physics-clicked');
        setTimeout(() => {
          target.classList.remove('physics-clicked');
        }, 360);
      }

      // 4. Trigger Hero Canvas Blast Wave if active
      if (window.PHYSICS_ENGINE && typeof window.PHYSICS_ENGINE.triggerBlast === 'function') {
        window.PHYSICS_ENGINE.triggerBlast(x, y);
      }
    });

    // 5. Interactive Formula Badges Bonus Delight
    document.querySelectorAll('.floating-formula-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        const formula = chip.textContent.trim();
        const title = chip.getAttribute('title') || 'Physics Principle';
        showToast(`${formula} — ${title} ✨`);
      });
    });
  }

  /* ==========================================================================
     OFFLINE FALLBACK HANDLER
     ========================================================================== */
  function handleOfflineFallback() {
    // If running from file:// without local server, build from inline essentials
    state.inventory = [
      {
        video_id: 'gxss05PxO8c',
        video_title: 'Ray Optics Fundamentals You MUST Know! Sign Convention, Image Formation | Physics 12',
        playlist_title: 'Class 12 Physics Complete Course',
        class_level: 'Class 12',
        syllabus: 'CBSE & State Board',
        content_format: 'Concept Lesson',
        duration_if_visible: '42:15',
        chapter: 'Ray Optics'
      },
      {
        video_id: 'ikUEsTrWFkY',
        video_title: 'Electromagnetic Waves & Maxwell’s Displacement Current | Class 12 Physics',
        playlist_title: 'Class 12 Physics Complete Course',
        class_level: 'Class 12',
        syllabus: 'CBSE & State Board',
        content_format: 'Concept Lesson',
        duration_if_visible: '35:20',
        chapter: 'EM Waves'
      },
      {
        video_id: 'DarDiTgYJwM',
        video_title: 'Power in AC Circuit & Power Factor | Class 12 Physics | Alternating Current',
        playlist_title: 'Class 12 Physics Complete Course',
        class_level: 'Class 12',
        syllabus: 'CBSE / NCERT',
        content_format: 'Concept Lesson',
        duration_if_visible: '28:40',
        chapter: 'Alternating Current'
      },
      {
        video_id: 'Ojz54_xhpqA',
        video_title: 'Series LCR Circuit & Resonance Condition | Class 12 Physics | Complete Derivation',
        playlist_title: 'Class 12 Physics Complete Course',
        class_level: 'Class 12',
        syllabus: 'CBSE / NCERT',
        content_format: 'Worked Derivation',
        duration_if_visible: '38:10',
        chapter: 'Alternating Current'
      },
      {
        video_id: '09M3RakOmGc',
        video_title: 'NEET PYQ Series Solved | Class 11 & 12 Physics Full Chapterwise | Muruga MP',
        playlist_title: 'NEET PYQs Solved',
        class_level: 'Class 11 & 12',
        syllabus: 'NEET / JEE',
        content_format: 'PYQ Problem Solving',
        duration_if_visible: '1:12:05',
        chapter: 'NEET Physics'
      },
      {
        video_id: 'HApmEwaIM6c',
        video_title: 'TNEA 2025 | Counselling Process | Choice Filling Tricks | Tamil | Muruga MP',
        playlist_title: 'Career Guidance & TNEA Counselling',
        class_level: 'Class 12 / College Aspirants',
        syllabus: 'Anna University / TNEA',
        content_format: 'Counselling Walkthrough',
        duration_if_visible: '24:18',
        chapter: 'Engineering Admissions'
      }
    ];

    DOM.totalCount.textContent = state.inventory.length;
    applyFilters();
  }

  // Execute on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
