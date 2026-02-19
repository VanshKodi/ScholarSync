# ScholarSync One University Per User Implementation

## Summary of Changes

This implementation enforces the constraint that users can only be associated with one university at a time.

## Backend Changes

### 1. **backend/services/university_service.py**
- **`become_faculty()`**: Added check to prevent admins from changing roles. Admins are now locked to their university as an admin and cannot become faculty.
  - Returns 403 error if admin tries to become faculty
  - Prevents university deletion when admin role changes (data integrity)

- **`apply_to_join_university()`**: Added validation to enforce single university per user
  - Checks if user already has a university (rejects if they do)
  - Checks if user already has a pending join request (prevents duplicate requests)
  - Returns appropriate error messages

### 2. **backend/services/join_service.py**
- **`approve_join_request()`**: Added verification to prevent duplicate joins
  - Verifies user doesn't already belong to a university before approval
  - Returns error if user already has a university

### 3. **backend/routes/database.py**
- **New endpoint: `GET /auth/profile`**
  - Returns current authenticated user's profile including role and university_id
  - Required by frontend to determine user's university when viewing join requests

## Frontend Changes

### 1. **frontend/js/views/Dashboard/JoinRequests.js** (NEW)
- New component for admins to view and manage university join requests
- Features:
  - Fetches pending and processed join requests
  - Shows requester ID, status, and request date
  - Approve/Reject buttons for pending requests (only visible for pending)
  - Auto-refresh after approving/rejecting
  - Error handling and loading states

### 2. **frontend/js/views/Dashboard/Dashboard.js**
- Imports the new JoinRequests component
- Added route handler for "join-requests" view
- Renders JoinRequests component when user navigates to it

### 3. **frontend/js/components/Sidebar.js**
- Added "Administration" section to sidebar
- Added "Join Requests" menu item with 📋 icon
- Navigation to join requests view

### 4. **frontend/css/views/views.css**
- Added comprehensive styling for join requests view:
  - `.join-requests-section`: Main container styling
  - `.requests-list`: List layout with flex
  - `.request-item`: Individual request card styling with hover effects
  - `.request-info`: Information block layout
  - `.request-actions`: Button group styling
  - `.btn`, `.btn-primary`, `.btn-danger`: Button styling with hover animations
  - `.error`, `.empty-state`, `.loading`: Status message styling

## Business Logic Now Enforced

### User Constraints
1. **Single University Per User**
   - User cannot join if they already have a university_id
   - User cannot submit multiple pending join requests

2. **Admin Role Lock**
   - Once a user becomes an admin (creates a university), they cannot become faculty
   - Admins are locked to their university role

3. **Irreversible Join**
   - Once approved, user belongs to a university permanently
   - No endpoint exists to leave a university

### Data Integrity
- Foreign key constraints in database ensure referential integrity
- RLS policies prevent unauthorized access to join requests
- Only admins of a university can approve/reject requests for that university

## Testing Recommendations

1. **Test Admin Lock**
   - Create a new university (become admin)
   - Try to become faculty → should receive 403 error

2. **Test Single Join Request**
   - Have a student apply to join a university
   - Try to apply again → should receive error about existing pending request
   - Have admin approve the request
   - Try to apply to another university → should receive error about already having a university

3. **Test Join Requests View**
   - Login as admin
   - Navigate to Dashboard → Administration → Join Requests
   - Should see any pending requests
   - Click Approve/Reject buttons
   - List should update after action

4. **Test Authorization**
   - Non-admin users accessing `/auth/profile` should work
   - Non-admin users trying to view `/university-join-requests/{id}` should get 403 error
   - Only university admins can view/approve/reject requests for their university
