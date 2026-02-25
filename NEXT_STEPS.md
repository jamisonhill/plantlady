# Next Steps: Phase 5+ Planning

**Updated**: 2026-02-25
**Current Phase**: 4 of 7 complete
**Ready For**: Testing today, Phase 5 design tomorrow

---

## Tomorrow's Testing Plan

### Manual Testing (30 min)

**PIN Login Flow**:
- [ ] Enter 1017 → Jamison home
- [ ] Enter 0304 → Amy home
- [ ] Invalid PIN shows error
- [ ] Refresh doesn't lose state

**Home Dashboard**:
- [ ] Plant batches display with variety names
- [ ] Correct season shown
- [ ] FAB button visible and tappable

**Event Logging**:
- [ ] Tap plant → LogEventPage loads
- [ ] All 10 event types display
- [ ] Can add notes
- [ ] Can add photo (camera access)
- [ ] Can submit event
- [ ] Success screen appears

**Add Plant**:
- [ ] FAB → AddPlantPage
- [ ] Variety picker searchable
- [ ] Can select variety
- [ ] Can set location
- [ ] Can submit
- [ ] New plant appears on home

**Session & Caching**:
- [ ] Refresh home → state persists
- [ ] Private browser tab → clean start
- [ ] No console errors

**Mobile (if available)**:
- [ ] Buttons thumb-reachable
- [ ] No horizontal scroll
- [ ] Tap targets large enough
- [ ] Keyboard doesn't overlap buttons

---

## Feature Requests Tracking

Use this section to capture feature requests from testing:

```markdown
### Feature Requests (To Be Completed)

1. **[PRIORITY] Feature Name**
   - Description
   - User value
   - Estimated effort (1-2-3 points)
   - Blocking other work: Yes/No

2. ...
```

---

## Phase 5: Frontend — Detail Views (Next Sprint)

### Goal
Show plant details, cost tracking, and distribution history

### Scope

**Plant Detail Page** (`/plant/:batchId`)
- Header: Variety name + color + location
- Timeline: All events for this batch (chronological, with emoji icons)
- Photos: Gallery of all photos for this batch
- Stats:
  - Days since seeded
  - Germination date (if available)
  - Current status (seeded/germinated/mature/harvested/etc.)
  - Events count
- Edit location/notes (inline)
- Delete batch (with confirmation)

**Season Cost Tracker** (`/costs`)
- Breakdown by category (seed, soil, tool, fertilizer, etc.)
- Running total
- Cost per plant calculation
- Per-user filter (if both users have contributions)

**Distribution Log** (`/distributions`)
- List of gifts/trades
- Recipient name, plant, date, quantity
- Can add new distribution
- Can mark complete

**User Settings** (`/settings`)
- Current user display
- Switch user (shortcut to login)
- Clear session
- About/version info

### Implementation Plan

1. Create new page components (4 files)
2. Add routes to App.tsx
3. Write API calls in client.ts
4. Style with existing Tailwind system
5. Add navigation links from HomePage

### Estimated Effort: 8-10 hours

---

## Phase 6: Dashboard & Analytics (Future)

### Goal
Provide seasonal overview and insights

### Features

- **Season Summary**:
  - Cards: Total batches, germinated, mature, harvested
  - Cost total, cost per plant
  - Distributed count

- **Variety Stats**:
  - Top planted varieties
  - Success rate by variety
  - Favorites for next season

- **User Comparison** (if tracking both):
  - Activity by user
  - Cost by user
  - Plants by user

- **Timeline**:
  - All events across season
  - Filter by event type
  - Filter by variety

### Estimated Effort: 6-8 hours

---

## Phase 7: Year-End Review (Future)

### Goal
Generate beautiful season summary for planning next year

### Features

- **PDF/HTML Report Generation**:
  - Season title and year
  - Summary stats
  - Category breakdown
  - Cost analysis
  - Best/worst performers

- **Photo Gallery**:
  - Best photo per plant
  - Organized by category
  - Thumbnails with captions

- **Next Season Planning**:
  - "Grow again?" list
  - Variety notes
  - Seed savings tracker

- **Year-over-Year Comparison**:
  - 2025 vs 2026 side-by-side
  - Trends

### Estimated Effort: 10-15 hours (including report generation library)

---

## Known Issues & Bugs

### Current Issues (If Any)

```markdown
- [ ] Issue #1: [describe]
  - Workaround: [if available]
  - Root cause: [if known]

- [ ] Issue #2: ...
```

### Resolved Issues (Phase 4)

✅ Database validation errors (created_at NULL)
✅ Nginx path rewriting (/api not stripped)
✅ CORS blocking API calls (192.168.0.9:3010 not in allow_origins)
✅ Seasons endpoint redirect (no trailing slash)
✅ UserSelectPage hanging (combined with seasons endpoint fix)

---

## Documentation TODO

- [ ] Update README.md with Phase 4 completion
- [ ] Create QUICK_START.md for new developers
- [ ] Add troubleshooting section to DEPLOYMENT.md
- [ ] Document PIN reset procedure
- [ ] Add browser compatibility matrix

---

## Performance & Optimization

### Current Performance
- Frontend build: 175 KB minified JS, 11.2 KB CSS
- API response time: ~50-100ms (PostgreSQL queries)
- Homepage load: ~200-300ms (plant batches + varieties)

### Optimization Opportunities
- [ ] Add pagination to plant list (Phase 5+)
- [ ] Cache variety list in localStorage
- [ ] Lazy load photos (Phase 5)
- [ ] Compress images on upload
- [ ] Add API response caching headers

---

## Security Review

### Current State
✅ PIN validated on backend
✅ CORS restricted to allowed origins
✅ File upload type validated
✅ SQL injection prevented (SQLAlchemy ORM)
✅ XSS prevented (React auto-escaping)

### For Production
- [ ] Implement HTTPS via Cloudflare
- [ ] Hash PINs with bcrypt
- [ ] Add rate limiting (login attempts)
- [ ] Add session timeout (auto-logout after 30 min inactivity)
- [ ] Implement CSRF protection
- [ ] Regular security audits
- [ ] Backup strategy documented

---

## Deployment Checklist

### Before Going Live
- [ ] Database backups configured
- [ ] Error logging enabled
- [ ] Performance monitoring added
- [ ] HTTPS certificate installed
- [ ] Firewall rules configured
- [ ] Admin/maintenance password changed
- [ ] Terms of service/privacy policy (if sharing)

### Regular Maintenance
- [ ] Weekly backups verified
- [ ] Logs reviewed for errors
- [ ] Database vacuumed monthly
- [ ] Dependencies updated quarterly

---

## Code Quality

### Standards
- TypeScript strict mode enabled ✓
- ESLint configured ✓
- Prettier format on save ✓
- Tests: TODO (Phase 5+)

### Testing Strategy

**Manual Testing** (current):
- Login flows
- User interactions
- Cross-browser compatibility

**Automated Testing** (Phase 5+):
- Unit tests for utilities
- Component tests for complex UI
- Integration tests for API calls
- E2E tests for critical paths

---

## Git & Collaboration

### Current Status
- All code committed to main
- No branches in use yet
- Ready for feature branches starting Phase 5

### Suggested Workflow for Phase 5+
```bash
# Create feature branch
git checkout -b feature/plant-detail-page

# Make changes, commit with good messages
git add .
git commit -m "Add plant detail page with timeline"

# Push to GitHub
git push origin feature/plant-detail-page

# Create PR, get review, merge
```

---

## Technology Decisions

### Why These Choices?

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | React | Mature, great for SPAs |
| State Mgmt | Context API | Simple for 2-user app |
| Styling | Tailwind | Rapid development |
| Backend | FastAPI | Modern Python, auto docs |
| Database | PostgreSQL | Robust, relational data fits |
| Auth | Simple PIN | Low friction for 2 local users |
| Hosting | Docker on NAS | Already available, reliable |

### Future Considerations
- If more users → add proper JWT auth
- If offline needed → add service worker
- If complex logic → consider state machine library
- If need reports → add reporting library (e.g., ReportLab)

---

## Communication & Handoff

### Documentation Files
- **README.md** — Quick start
- **DEPLOYMENT.md** — Deploy instructions
- **DATABASE.md** — Schema reference
- **PHASE_*.md** — Detailed implementation notes
- **PROJECT_STATUS.md** — Current progress
- **NEXT_STEPS.md** — This file

### Key Code Locations
- Frontend pages: `app/src/pages/`
- Reusable components: `app/src/components/`
- API client: `app/src/api/client.ts`
- Auth context: `app/src/context/AuthContext.tsx`
- Backend routes: `api/routers/`
- Models: `api/models.py`, `api/schemas.py`

### How to Get Help
1. Check relevant PHASE_*.md file
2. Search in DATABASE.md for schema questions
3. Look at API docs: `http://192.168.0.9:3010/api/docs`
4. Review code comments (marked with `// Note:` or `// TODO:`)

---

## Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 0.1.0 | 2026-02-25 | Phase 4 Complete | Core flows working on NAS |
| 0.0.3 | 2026-02-24 | Phase 3 Complete | 40+ API endpoints |
| 0.0.2 | 2026-02-14 | Phase 2 Complete | Database schema |
| 0.0.1 | 2026-02-14 | Phase 1 Complete | Docker infrastructure |

---

## Final Notes

### What Works Great
- PIN login is simple and fast
- Direct navigation (no user picker) is better UX
- Plant list loads quickly
- Event logging is intuitive
- SessionStorage persistence works well

### What to Watch For
- Database migration strategy for schema changes
- Photo storage on NAS (monitor disk space)
- Performance if plant list grows large
- CORS issues with future origin changes

### Celebration Points 🎉
- Full stack working end-to-end
- Deployed on NAS
- Database validation issues resolved
- Frontend responsive and fast
- Ready for detailed feature work

---

**Next Action**: Run comprehensive testing tomorrow, gather feature requests, plan Phase 5.
