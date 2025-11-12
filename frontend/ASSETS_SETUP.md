# Assets Setup

## Images Copied

✅ `cdc_logo.jpg` - Copied to `src/assets/images/`

## Image Usage

The following files use the logo:
- `src/pages/stays/Dashboard.jsx`
- `src/components/stays/StaysNavbar.jsx`

## If Import Errors Persist

If you still see import errors after restarting the dev server:

1. **Restart Vite dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Verify file exists:**
   ```bash
   ls -la src/assets/images/cdc_logo.jpg
   ```

## Alternative: Use Public Folder

If imports still don't work, you can move images to `public/` folder and reference them directly:

```jsx
// Instead of:
import logo from '../../assets/images/cdc_logo.jpg';

// Use:
<img src="/images/cdc_logo.jpg" alt="Logo" />
```

Then move the file:
```bash
mkdir -p public/images
cp src/assets/images/cdc_logo.jpg public/images/
```

