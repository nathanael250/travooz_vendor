# Uploads Configuration

## Overview

Uploads are now stored **outside the project directory** to prevent data loss during deployments. This ensures that uploaded images and files persist even when you deploy new versions of the application.

## Configuration

### Default Location

By default, uploads are stored in: `/var/www/travooz-uploads`

### Custom Location

To use a custom location, set the `UPLOADS_BASE_PATH` environment variable in your `.env` file:

```bash
UPLOADS_BASE_PATH=/path/to/your/uploads/directory
```

### Directory Structure

The uploads directory will automatically create the following structure:

```
/var/www/travooz-uploads/
├── stays/
│   ├── property-images/
│   └── room-images/
├── tours/
│   ├── packages/
│   └── (other tour files)
├── restaurants/
├── menu-items/
└── cars/
```

## Setup Instructions

### 1. Create the Uploads Directory

```bash
sudo mkdir -p /var/www/travooz-uploads
sudo chown -R $USER:$USER /var/www/travooz-uploads
sudo chmod -R 755 /var/www/travooz-uploads
```

### 2. Set Environment Variable (Optional)

If you want to use a different location, add to your `.env` file:

```bash
UPLOADS_BASE_PATH=/your/custom/path
```

### 3. Verify Permissions

Ensure the Node.js process has read/write permissions to the uploads directory:

```bash
# Check current user
whoami

# Set ownership (replace 'your-user' with your actual user)
sudo chown -R your-user:your-user /var/www/travooz-uploads

# Set permissions
chmod -R 755 /var/www/travooz-uploads
```

## Migration from Old Location

If you have existing uploads in the project directory (`backend/uploads/`), you can migrate them:

```bash
# Stop the server
# Copy existing uploads
sudo cp -r /path/to/project/backend/uploads/* /var/www/travooz-uploads/

# Verify files were copied
ls -la /var/www/travooz-uploads/
```

## Important Notes

1. **Backup**: Always backup the uploads directory before deployments
2. **Permissions**: Ensure the web server user has write permissions
3. **Disk Space**: Monitor disk space on the uploads directory
4. **Backup Strategy**: Include `/var/www/travooz-uploads` in your backup strategy

## Troubleshooting

### Permission Denied Errors

```bash
# Check permissions
ls -la /var/www/travooz-uploads

# Fix ownership
sudo chown -R $USER:$USER /var/www/travooz-uploads
```

### Directory Not Found

The application will automatically create the directory structure, but if it fails:

```bash
# Manually create with proper permissions
sudo mkdir -p /var/www/travooz-uploads/{stays/property-images,stays/room-images,tours/packages,tours,restaurants,menu-items,cars}
sudo chown -R $USER:$USER /var/www/travooz-uploads
```

## Files Updated

The following files have been updated to use the external uploads directory:

- `src/config/uploads.config.js` - Centralized configuration
- `src/server.js` - Static file serving
- `src/routes/stays.routes.js` - Stays image uploads
- `src/routes/restaurant.routes.js` - Restaurant image uploads
- `src/routes/tours.routes.js` - Tour image uploads
- `src/routes/carRental.routes.js` - Car image uploads
- `src/routes/images.routes.js` - General image routes
- `src/controllers/stays/staysProperty.controller.js` - Property image handling
- `src/controllers/tours/toursPackage.controller.js` - Tour package images








