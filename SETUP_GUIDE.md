# Setup Guide - Smart Expense Tracker

## Fixed Issues ✅

### 1. **Registration & Login Issues Fixed**
   - Added proper `.env` file configuration
   - Configured Supabase client with validation
   - Fixed environment variable checking

### 2. **Animations Added** 🎨
   - **Page animations**: Fade-in effects on page load
   - **Card animations**: Slide and scale animations on load
   - **Form animations**: Staggered slide-in animations for form fields
   - **Button animations**: Lift effect on hover with smooth transitions
   - **Summary cards**: Cascade animation on dashboard
   - **Interactive transitions**: Smooth scale on focus for inputs

## Setup Instructions

### Step 1: Setup Environment Variables
1. Open the `.env` file in the project root
2. Set your configuration:

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_secret_key_min_32_chars
NODE_ENV=development
```

### Step 2: Get Supabase Credentials
1. Go to [Supabase](https://app.supabase.com)
2. Create a new project or select existing one
3. Go to **Settings > API**
4. Copy **Project URL** → Set as `SUPABASE_URL`
5. Copy **Anon Public Key** → Set as `SUPABASE_ANON_KEY`

### Step 3: Generate JWT Secret
Run this command to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as your `JWT_SECRET`

### Step 4: Install Dependencies
```bash
npm install
```

### Step 5: Run the Server
```bash
npm start
```

Server will run on `http://localhost:3000`

## Testing Registration & Login

### Register New Account:
1. Go to http://localhost:3000
2. Click on **Register** tab
3. Fill in:
   - Full Name
   - Email
   - Password (min 6 characters)
   - Confirm Password
4. Click **Create Account**
5. Success message appears → Switch to Login tab

### Login:
1. Click on **Login** tab
2. Enter your email and password
3. Click **Login**
4. Redirects to Dashboard

## Animation Features

The app now includes smooth animations:

| Element | Animation | Trigger |
|---------|-----------|---------|
| Page Background | Fade In | Page Load |
| Auth Card | Scale In | Page Load |
| Form Fields | Slide In (staggered) | Panel Show |
| Buttons | Lift + Shadow | Hover |
| Summary Cards | Slide Up (cascade) | Dashboard Load |
| Input Focus | Scale + Shadow | Focus |
| Links | Slide Right | Hover |

## Troubleshooting

### "Missing Supabase configuration" Error
- Check `.env` file exists in project root
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- Restart the server

### Registration/Login Fails
- Check network tab in browser DevTools (F12)
- Verify Supabase project is running
- Check console logs on both client and server

### Animations Not Showing
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh page (Ctrl+F5)
- Check CSS file is loaded (F12 > Network tab)

## Files Modified

✅ Created `.env` - Environment configuration
✅ Created `.env.example` - Template for env variables
✅ Modified `lib/supabase.js` - Added validation
✅ Modified `public/css/style.css` - Added animations

## Next Steps

1. Database migrations (Supabase SQL)
2. Add dashboard functionality
3. Implement transaction features
4. Add charts and analytics

---
**Happy Tracking! 💰**
