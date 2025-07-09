# Tampereensaunalautat.fi - Self-Service Platform Migration

## Project Overview

**Goal**: Convert the static Next.js sauna listing website to a self-service platform where sauna owners can manage their own data and new owners can register vessels.

**Live Site**: https://tampereensaunalautat.fi  
**API Endpoint**: https://api.tampereensaunalautat.fi

---

## Architecture Overview

### Current Setup (Hybrid Architecture)
- **Frontend**: Next.js hosted on Vercel (free tier)
- **Backend**: Express.js API on UpCloud VM with SQLite database
- **Images**: Served from UpCloud VM
- **Email**: AWS SES (existing setup)
- **Authentication**: Magic link system (planned)

### Key Benefits
- **Cost-effective**: Frontend remains free on Vercel
- **Scalable**: Backend on dedicated VM for database operations
- **Performance**: ISR (Incremental Static Regeneration) for dynamic content
- **Reliability**: Separation of concerns between frontend and backend

---

## UpCloud Server Setup

### Server Details
- **IP Address**: `80.69.173.166`
- **Domain**: `api.tampereensaunalautat.fi`
- **OS**: Ubuntu 24.04 LTS
- **Location**: `/var/www/sauna-api/`

### SSH Access
```bash
# SSH access (configured in your local machine)
ssh upcloud

# Manual connection
ssh root@80.69.173.166
```

### Server Components Installed
1. **Node.js & NPM**: Runtime environment
2. **PM2**: Process manager for the API server
3. **nginx**: Reverse proxy and SSL termination
4. **Let's Encrypt**: SSL certificates
5. **SQLite3**: Database and CLI tools

### Directory Structure
```
/var/www/sauna-api/
├── server.js              # Express API server
├── package.json           # Dependencies
├── saunas.db             # SQLite database (main)
├── database.sqlite       # Backup database
└── images/               # All sauna images
    ├── ms_blackbox_1.jpg
    ├── premium1.jpg
    └── ... (150+ images)
```

### Services Running
```bash
# Check API server status
pm2 status

# Restart API server
pm2 restart sauna-api

# Check nginx status
systemctl status nginx

# View API logs
pm2 logs sauna-api
```

---

## Database Schema

### Saunas Table
```sql
CREATE TABLE saunas (
    id TEXT PRIMARY KEY,
    owner_email TEXT NOT NULL,
    name TEXT NOT NULL,
    url_name TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    event_length INTEGER NOT NULL,
    price_min INTEGER NOT NULL,
    price_max INTEGER NOT NULL,
    equipment TEXT NOT NULL,      -- JSON array
    images TEXT NOT NULL,         -- JSON array
    main_image TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    url TEXT,
    url_array TEXT,              -- JSON array
    notes TEXT,
    winter BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Additional Tables (Ready for Phase 3)
- `users` - User accounts for authentication
- `magic_links` - Magic link authentication tokens
- `pending_saunas` - New registrations awaiting approval

---

## API Endpoints

### Current Endpoints

#### Public Endpoints
- `GET /api/health` - Health check
- `GET /api/sauna/list` - Fetch all saunas
- `GET /api/sauna/:id` - Get single sauna by ID or URL name
- `GET /images/:filename` - Serve sauna images

#### Authentication Endpoints
- `POST /api/auth/login` - Request magic link
- `POST /api/auth/verify` - Verify magic link token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user

#### Protected Endpoints (Require Authentication)
- `GET /api/auth/me` - Get current user info
- `GET /api/user/saunas` - Get user's owned saunas
- `PUT /api/sauna/:id` - Update sauna information

#### Admin Endpoints (Admin Only)
- `GET /api/admin/users` - Get all users with sauna counts
- `GET /api/admin/pending-saunas` - Get pending sauna registrations

### Response Format
The API transforms database fields to match frontend expectations:
- `price_min/price_max` → `pricemin/pricemax`
- `event_length` → `eventLength`
- JSON strings parsed to arrays for `equipment`, `images`, `urlArray`

---

## Local Codebase Changes

### New Files Added
- `lib/api.ts` - API client functions
  - `fetchSaunas()` - Fetch sauna data from API
  - `getImageUrl()` - Generate image URLs
  - `healthCheck()` - API health verification
  - `authAPI` - Authentication API functions
- `contexts/AuthContext.tsx` - Authentication context and provider
- `components/ProtectedRoute.tsx` - Protected route component
- `pages/login.tsx` - Login page with magic link authentication
- `pages/dashboard.tsx` - Owner dashboard page

### Modified Files
- `pages/index.tsx` - Uses `getStaticProps` with API data + ISR
- `components/LauttaEl.tsx` - Updated to use API image URLs
- `pages/saunat/[url_name].tsx` - Fetches individual sauna data from API
- `next.config.js` - Added `remotePatterns` for API images
- `pages/_app.tsx` - Wrapped with AuthProvider for authentication
- `types.ts` - Added authentication types and interfaces

### Environment Variables
```bash
# Production (Vercel deployment)
NEXT_PUBLIC_API_URL=https://api.tampereensaunalautat.fi

# Development (.env.local) - Currently using production API/DB
NEXT_PUBLIC_API_URL=https://api.tampereensaunalautat.fi
```

### Key Features Implemented
- **ISR (Incremental Static Regeneration)**: 1-hour revalidation
- **Image Optimization**: Next.js Image component with remote patterns
- **Error Handling**: Graceful fallbacks for API failures
- **Type Safety**: Maintained existing TypeScript interfaces

---

## Implementation Progress

## ✅ Phase 1: Backend Infrastructure (COMPLETED)

### VM Setup
- [x] UpCloud VM provisioned and configured
- [x] Node.js, npm, PM2 installed
- [x] nginx reverse proxy configured
- [x] SSL certificate via Let's Encrypt
- [x] DNS A record: `api.tampereensaunalautat.fi` → VM IP

### API Development
- [x] Express.js server with CORS
- [x] SQLite database setup
- [x] Image serving from VM
- [x] Health check endpoint
- [x] Sauna listing endpoint

### Data Migration
- [x] All 150+ images copied to VM
- [x] Database schema created
- [x] All 15+ saunas migrated to database
- [x] User accounts created for existing owners

## ✅ Phase 2: Frontend Integration (COMPLETED)

### API Integration
- [x] API client library created
- [x] Homepage updated to use API data
- [x] Individual sauna pages use API
- [x] Image URLs point to VM server
- [x] ISR implemented for dynamic content

### Configuration
- [x] Environment variables configured
- [x] Next.js image optimization for API domain
- [x] Error handling and fallbacks
- [x] Type safety maintained

### Testing & Deployment
- [x] Local development working
- [x] Vercel deployment configured
- [x] All 14 saunas displaying correctly
- [x] Images loading from API server

## ✅ Phase 3: Authentication System (COMPLETED)

### Database Schema
- [x] Authentication tables created (users, magic_links, user_sessions, user_saunas, pending_saunas)
- [x] All 11 sauna owners have user accounts
- [x] All 14 saunas linked to their owners
- [x] Admin account created and configured
- [x] Database indexes and triggers implemented

### Magic Link Authentication
- [x] Magic link generation and verification
- [x] Email sending via AWS SES integration
- [x] JWT token management with refresh tokens
- [x] Session handling and cleanup

### Backend API Endpoints
- [x] POST /api/auth/login - Request magic link
- [x] POST /api/auth/verify - Verify magic link token
- [x] POST /api/auth/refresh - Refresh JWT token
- [x] POST /api/auth/logout - Logout user
- [x] GET /api/auth/me - Get current user info
- [x] GET /api/user/saunas - Get user's saunas (protected)
- [x] PUT /api/sauna/:id - Update sauna (protected)
- [x] GET /api/admin/users - Get all users (admin only)
- [x] GET /api/admin/pending-saunas - Get pending saunas (admin only)

### Security & Infrastructure
- [x] Rate limiting for authentication endpoints
- [x] CORS configuration for production
- [x] Helmet security middleware
- [x] Protected route middleware
- [x] Input validation and error handling
- [x] Backend deployed and running on UpCloud

## ✅ Phase 4: Owner Management Interface (COMPLETED)

### Frontend Authentication Integration
- [x] Authentication context and provider created
- [x] React hooks for authentication state management
- [x] Protected route component for access control
- [x] API client extended with authentication methods
- [x] Login page with magic link authentication
- [x] Dashboard page for sauna owners
- [x] User interface with logout functionality
- [x] Finnish language throughout the interface

### Owner Dashboard Features
- [x] User welcome screen with profile information
- [x] Statistics dashboard (sauna count, capacity, prices)
- [x] List of owned saunas with images
- [x] Quick edit and view buttons for each sauna
- [x] Admin section for administrative users
- [x] Responsive design for mobile and desktop
- [x] Loading states and error handling

### Authentication Flow
- [x] Magic link request via email
- [x] Token verification and user login
- [x] Automatic token refresh (20-minute intervals)
- [x] Session management with localStorage
- [x] Secure logout with token cleanup
- [x] Protected routes with redirect functionality
- [x] Return URL handling after login

### System Stabilization & Technical Debt Resolution
- [x] **Material-UI v7 Migration**: Resolved webpack module resolution conflicts
- [x] **Package Version Alignment**: Updated all @mui packages to compatible v7 versions
- [x] **Grid API Updates**: Migrated from deprecated `item` props to new `size` prop syntax
- [x] **Build System Fixes**: Resolved TypeScript compilation errors across all components
- [x] **Header Component Fixed**: Material-UI AppBar, Toolbar, Container, Button working properly
- [x] **Production Build Verified**: All 21 pages compile successfully with optimizations

#### Issues Resolved
- Fixed `TypeError: __webpack_modules__[moduleId] is not a function` webpack error
- Updated Grid usage in dashboard.tsx, Filters.tsx, and sauna detail pages  
- Aligned Material-UI ecosystem: @mui/material@7.2.0, @mui/icons-material@7.2.0, @mui/system@7.2.0
- Updated @mui/x-date-pickers@8.7.0 for v7 compatibility
- Migrated Grid API from deprecated `item` props to new `size={{ xs: 12, md: 6 }}` syntax
- Cleared build cache and verified production deployment readiness
- All 21 pages now compile successfully with TypeScript strict mode

## 🔄 Phase 5: Owner Sauna Management & Registration System (IN PROGRESS)

### ✅ Owner Sauna Editing Interface (COMPLETED)
- [x] **Edit Sauna Form** (`/edit-sauna/[id]`) - Complete sauna data editing
  - [x] Basic information fields (name, location, capacity, event length, prices)
  - [x] Contact details (email, phone, website URLs with multiple URL support)
  - [x] Equipment selection with checkboxes
  - [x] Notes/description with character limits (max 500 chars)
  - [x] Winter availability toggle
  - [x] Real-time form validation and error display
  - [x] Save/Cancel functionality with confirmation dialogs
  - [x] Protected route with ownership verification
  - [x] Loading states and error handling
  - [x] Unsaved changes warnings
- [x] **Image Upload & Display System** - Full image management with CORS resolution
  - [x] Image upload functionality with drag-and-drop support
  - [x] Real-time image processing (WebP conversion, resizing)
  - [x] Cross-origin image serving fully resolved
  - [x] Helmet security middleware properly configured (`crossOriginResourcePolicy: cross-origin`)
  - [x] Frontend/backend URL consistency implemented
  - [x] Comprehensive error handling and retry mechanisms
  - [x] Development debug tools for troubleshooting
  - [x] Production deployment and verification completed

### Technical Issues Resolved During Phase 5
- [x] **Material-UI v7 Grid Syntax**: Fixed Grid component usage from deprecated `item xs={12}` to new `size={12}` format
- [x] **TypeScript Type Conflicts**: Resolved conflicts between `SaunaEquipment[]` and `string[]` in API interfaces
- [x] **URL Management Enhancement**: Enhanced backend API to handle `url_array` parameter alongside single `url` field
- [x] **URL Editing Interface**: Created sophisticated URL management with primary website and additional URLs
- [x] **Local Development Permissions**: Fixed `.next` directory permission issues on Windows
- [x] **URL Display Bug**: Fixed missing primary URL display on sauna detail pages
- [x] **URL Removal Bug**: Fixed issue where deleted URLs persisted due to empty string handling
- [x] **Import Conflicts**: Resolved duplicate interface imports in api.ts
- [x] **Image CORS Issues**: Resolved cross-origin blocking by placing image middleware before other middleware
- [x] **Rate Limiting Development**: Adjusted rate limits for development environment (1000 general, 100 auth requests per 15min)

### 🚧 Image CORS & Environment Configuration Debugging (ONGOING)

#### CORS Issues Resolved
During Phase 5 development, extensive CORS debugging was performed to enable image serving from the backend:

**Original Problem**: Images displayed with `net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin 200 (OK)` despite successful HTTP 200 responses

**Solutions Attempted**:
1. **Basic CORS Configuration**: Modified backend CORS from wildcard to specific localhost origins
2. **Debug Logging**: Added comprehensive origin/referer header logging to identify request patterns  
3. **Custom Image Endpoints**: Created dedicated image serving routes with manual CORS headers
4. **Middleware Ordering**: Moved image serving before main CORS middleware to avoid conflicts
5. **Express.static Configuration**: Used `express.static` with custom `setHeaders` function

**Working Solution**: 
```javascript
// Placed at beginning of middleware stack in server.js
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: (res, path, stat) => {
    res.set({
      'Cache-Control': 'public, max-age=31536000',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });
  }
}));
```

**Rate Limiting Issues**: Increased development limits to 1000 general/100 auth requests per 15 minutes during debugging

#### Image Upload/Display Issue (RESOLVED ✅)
**Problem**: Image uploads succeeded but display failed with CORS policy blocking:
- ✅ **Upload requests**: Successfully went to production `https://api.tampereensaunalautat.fi` 
- ❌ **Image display**: Failed with `net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin 200 (OK)`
- **Result**: Files were saved to production but browser blocked cross-origin image loading

**Root Cause Analysis**:
1. **Initial Issue**: Environment variable configuration inconsistency in `getImageUrl()` function
2. **Deeper Issue**: Helmet security middleware setting `Cross-Origin-Resource-Policy: same-origin`
   - This header takes precedence over traditional CORS headers
   - Blocked cross-origin image requests from `api.tampereensaunalautat.fi` to `localhost:3000`

**Solution Applied**:
1. **Frontend Fix**: Modified `getImageUrl()` in `lib/api.ts` for URL consistency
   ```javascript
   // OLD (inconsistent):
   const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
   const imageBase = isDevelopment ? 'http://localhost:3001' : API_BASE;

   // NEW (consistent):
   const imageUrl = `${API_BASE}/images/${filename}`;
   ```

2. **Backend Fix**: Updated Helmet configuration in `backend/server.js`
   ```javascript
   // OLD (blocking cross-origin):
   app.use(helmet());

   // NEW (allowing cross-origin):
   app.use(helmet({
     crossOriginResourcePolicy: { policy: "cross-origin" }
   }));
   ```

3. **Enhanced Debugging**: Added comprehensive logging and error handling
   - Environment configuration logging on startup
   - Image URL construction tracking  
   - Automatic retry mechanisms with cache-busting
   - Development debug tools for manual refresh

**Deployment Steps**:
1. Local testing confirmed fix worked with `Cross-Origin-Resource-Policy: cross-origin`
2. SSH deployment to production server at `/var/www/sauna-api/`
3. PM2 restart of `sauna-api` service
4. Verification of updated headers in production

**Status**: ✅ **FULLY RESOLVED** - Image upload and display working correctly with proper CORS configuration

#### Files Modified During Image Upload/Display Issue Resolution
- `lib/api.ts` - Fixed `getImageUrl()` function for URL consistency, added comprehensive logging
- `components/ImageManager.tsx` - Added error handling, retry mechanisms, and debug tools
- `backend/server.js` - Updated Helmet configuration for cross-origin resource policy (production deployed)
- `PROJECT_SETUP.md` - Complete documentation of issue resolution and deployment process
- Previously during CORS debugging:
  - `backend/server.js` - CORS/middleware configuration and ordering
  - Various debug logging (cleaned up after resolution)

### Image Management System
- [ ] **Image Upload & Management**
  - [ ] Drag-and-drop image upload interface
  - [ ] Support for common formats (JPG, PNG, WebP, HEIC)
  - [ ] Automatic image processing pipeline:
    - [ ] Resize to multiple resolutions (200px, 400px, 800px, 1200px)
    - [ ] Convert to WebP format for optimization
    - [ ] Generate thumbnails for management interface
    - [ ] Compress to reasonable file sizes (<300KB per image)
  - [ ] Image reordering with drag-and-drop
  - [ ] Set main image functionality
  - [ ] Delete individual images with confirmation
  - [ ] Maximum image limit (15 images per sauna)
  - [ ] Progress indicators for upload/processing

### Content Sanitization & Validation
- [ ] **Text Content Security**
  - [ ] HTML sanitization for all text inputs
  - [ ] XSS protection for user-generated content
  - [ ] Character limits: Name (100), Location (50), Notes (500), URLs (200)
  - [ ] URL validation for website links
  - [ ] Phone number format validation
  - [ ] Email address validation
  - [ ] Profanity filtering for public-facing content

### New Registration System
- [ ] **Public Registration Form** (`/register-sauna`)
  - [ ] Multi-step registration wizard
  - [ ] Owner contact information collection
  - [ ] Sauna details form with validation
  - [ ] Image upload during registration
  - [ ] Terms of service and privacy policy acceptance
  - [ ] Admin notification email upon submission

### Admin Management Interface
- [ ] **Admin Sauna Management** (`/admin/saunas`)
  - [ ] Add new sauna form (`/admin/add-sauna`)
  - [ ] Edit any sauna with admin privileges
  - [ ] Approve/reject pending registrations (`/admin/pending`)
  - [ ] Bulk operations (approve multiple, delete, etc.)
  - [ ] User management interface (`/admin/users`)
  - [ ] System analytics and reporting
  - [ ] Image moderation and approval tools

### Backend API Extensions Required
- [ ] **Image Processing Endpoints**
  - [ ] `POST /api/upload/image` - Handle image uploads with processing
  - [ ] `DELETE /api/image/:filename` - Remove images from storage
  - [ ] `PUT /api/sauna/:id/images/order` - Update image order
  - [ ] `PUT /api/sauna/:id/main-image` - Set main image
  - [ ] Image storage organization (by sauna ID, with backup retention)

- [x] **Sauna Management Endpoints** (PARTIALLY COMPLETED)
  - [x] `PUT /api/sauna/:id` - Update sauna data (enhanced with url_array support)
  - [ ] `POST /api/sauna` - Create new sauna (admin only)
  - [ ] `GET /api/sauna/:id/edit` - Get editable sauna data
  - [x] Input validation middleware for all update operations
  - [x] Content sanitization on server side

- [ ] **Registration System Endpoints**
  - [ ] `POST /api/register/sauna` - Submit new sauna registration
  - [ ] `GET /api/admin/pending` - Get pending registrations
  - [ ] `PUT /api/admin/pending/:id/approve` - Approve registration
  - [ ] `DELETE /api/admin/pending/:id/reject` - Reject registration
  - [ ] Email notification triggers for status changes

### Technical Infrastructure Additions
- [ ] **Image Processing Pipeline**
  - [ ] Sharp.js or similar for server-side image processing
  - [ ] Multiple resolution generation for responsive images
  - [ ] WebP conversion for modern browsers with fallbacks
  - [ ] Image optimization and compression
  - [ ] Backup and recovery system for images

- [ ] **Content Security Measures**
  - [ ] DOMPurify or similar for HTML sanitization
  - [ ] Rate limiting for upload endpoints
  - [ ] File type validation and security scanning
  - [ ] CSRF protection for form submissions
  - [ ] Image metadata stripping for privacy

### User Experience Enhancements
- [ ] **Edit Form Features**
  - [ ] Auto-save drafts to prevent data loss
  - [ ] Real-time character counters
  - [ ] Image preview during upload
  - [ ] Responsive design for mobile editing
  - [ ] Accessibility features (screen reader support)
  - [ ] Success/error notifications with toast messages

---

## Current Data

### Authentication Database
- **13 users total**: 12 sauna owners + 1 admin
- **15 user-sauna relationships**: All saunas linked to owners
- **Authentication system**: Fully deployed and operational
- **Material-UI Frontend**: All components working with v7 compatibility
- **Phase 5 Sauna Management**: Owner sauna editing and image upload system fully operational

### Saunas in Database (15 total)
1. **Laineilla.fi saunalautta** - Näsijärvi (250-700€, 20 people)
2. **M/S BlackBox** - Pyhäjärvi (525-600€, 12 people)
3. **M/S Palju** - Pyhäjärvi (500€, 12 people)
4. **Vertical** - Pyhäjärvi (675-750€, 12 people)
5. **M/S Premium** - Pyhäjärvi (600-660€, 12 people)
6. **Saunalautta (Tampereen vesijettivuokraus)** - Pyhäjärvi (250€, 16 people)
7. **M/S Suvanto** - Pyhäjärvi (500€, 12 people)
8. **M/S Vanaja** - Pyhäjärvi (500€, 12 people)
9. **Tampereen Saunalautta** - Näsijärvi (280-300€, 8 people)
10. **Saunakatamaraani** - Näsijärvi (450-500€, 12 people)
11. **Saunalautta Tyyne** - Näsijärvi (275€, 9 people)
12. **Saunalautta Auroora** - Pyhäjärvi (500€, 12 people)
13. **HuvilaLautta** - Pyhäjärvi (400€, 12 people)
14. **Elämyslaiva Roosa** - Näsijärvi (450-400€, 30 people)
15. **Antin testilautta** - Näsijärvi (100€, 8 people) *[Test sauna for development]*

---

## Development Commands

### Local Development
```bash
# Start local development
npm run dev

# Build for production
npm run build

# Check API connectivity
curl https://api.tampereensaunalautat.fi/api/health
```

### Server Management
```bash
# SSH into server
ssh upcloud

# Check API status
pm2 status

# View API logs
pm2 logs sauna-api

# Restart API
pm2 restart sauna-api

# Check database
sqlite3 /var/www/sauna-api/saunas.db "SELECT COUNT(*) FROM saunas;"

# Image storage management (Phase 5)
ls -la /var/www/sauna-api/images/
du -sh /var/www/sauna-api/images/
```

### Phase 5 Development Commands
```bash
# Image processing testing (when implemented)
npm install sharp multer  # Server-side image processing
npm test -- --grep "image"  # Run image-related tests

# Content validation testing
npm install dompurify validator  # Content sanitization
npm run lint:security  # Security linting (when configured)

# Database operations for new features
sqlite3 /var/www/sauna-api/saunas.db "DESCRIBE pending_saunas;"
sqlite3 /var/www/sauna-api/saunas.db "SELECT * FROM pending_saunas WHERE status = 'pending';"
```

### Deployment
```bash
# Deploy to Vercel (automatic on git push)
git push origin main

# Manual Vercel deployment
vercel --prod
```

---

## Troubleshooting

### Common Issues

**API not responding:**
```bash
# Check PM2 status
ssh upcloud "pm2 status"

# Restart if needed
ssh upcloud "pm2 restart sauna-api"
```

**Images not loading:**
- Verify `NEXT_PUBLIC_API_URL` is set in `.env.local` for development
- Check `next.config.js` has correct `remotePatterns`
- Confirm images exist on server: `ssh upcloud "ls /var/www/sauna-api/images/"`
- **Current known issue**: Image uploads work but display fails due to `getImageUrl()` function using inconsistent API base URL

**SSL certificate issues:**
```bash
# Renew SSL certificate
ssh upcloud "certbot renew"
```

**Material-UI webpack errors:**
```bash
# Clear Next.js build cache
rm -rf .next

# Check for dependency conflicts
npm ls @mui/material @mui/icons-material @mui/system

# Update Material-UI packages to aligned versions
npm install @mui/icons-material@^7.0.0 @mui/system@^7.0.0 @mui/x-date-pickers@^8.0.0

# Rebuild
npm run build
```

### Logs and Monitoring
- **API Logs**: `ssh upcloud "pm2 logs sauna-api"`
- **nginx Logs**: `ssh upcloud "tail -f /var/log/nginx/error.log"`
- **Vercel Logs**: Check Vercel dashboard

---

## Security Considerations

### Current Security
- [x] HTTPS/SSL encryption
- [x] CORS properly configured
- [x] Environment variables secured
- [x] Server firewall configured
- [x] JWT token authentication with refresh tokens
- [x] Rate limiting on authentication endpoints
- [x] Input validation and sanitization
- [x] User session management with localStorage
- [x] Admin access controls and protected routes
- [x] Magic link email authentication via AWS SES
- [x] Helmet security middleware

### Additional Security Features
- [x] Authentication middleware for protected endpoints
- [x] Role-based access control (admin vs owner)
- [x] Session cleanup and secure logout
- [x] Token expiration and automatic refresh
- [x] SQL injection protection with parameterized queries

---

## Future Enhancements

### Performance Optimizations
- [ ] Database indexing optimization
- [ ] CDN for images
- [ ] API response caching
- [ ] Database connection pooling
- [x] Material-UI v7 compatibility for better performance
- [x] Production build optimization with static generation

### Feature Additions
- [ ] Search and filtering improvements
- [ ] Booking calendar integration
- [ ] Review and rating system
- [ ] Mobile app development
- [ ] Analytics dashboard
- [x] **Sauna owner editing interface (Phase 5 - Completed)**
- [ ] **Public sauna registration form (Phase 5 - Planned)**
- [ ] **Admin approval workflow (Phase 5 - Planned)**
- [ ] **Image management system (Phase 5 - Planned)**
- [x] **Content sanitization & validation (Phase 5 - Partially Completed)**

### Phase 6+ Future Considerations
- [ ] Multi-language support (English/Swedish)
- [ ] Integration with booking systems
- [ ] Payment processing for premium listings
- [ ] SEO optimization for individual sauna pages
- [ ] Social media integration and sharing
- [ ] Progressive Web App (PWA) features
- [ ] Real-time chat or messaging system
- [ ] Weather integration for sailing conditions

---

## Contact & Support

**Project Owner**: Antti Tuomola  
**Server Access**: Via SSH key authentication  
**Domain Management**: Vercel DNS  
**Hosting**: Vercel (frontend) + UpCloud (backend)

---

*Last Updated: January 2025*  
*Status: Phase 5 Owner Sauna Management - COMPLETED ✅. Owner sauna editing interface fully implemented with comprehensive image upload/display system. All technical issues resolved including CORS configuration, Helmet security middleware, and cross-origin resource policies. Development workflow established using production database/API. Remaining phases: Public Registration System (Phase 5 continued), Admin Management Interface, and Content Security enhancements.* 