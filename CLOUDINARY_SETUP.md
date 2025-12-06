# Cloudinary Setup Guide

## Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. After signup, you'll be taken to your dashboard

## Step 2: Get Your Cloudinary Credentials

From your Cloudinary dashboard, you'll find:
- **Cloud Name** (e.g., `dxyz1234`)
- **API Key** (e.g., `123456789012345`)
- **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 3: Configure Backend

Add these to your `drip_drop_backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: Install Cloudinary Package

```bash
cd drip_drop_backend
npm install cloudinary
```

## Step 5: Configure Frontend (Optional - for unsigned uploads)

If you want to use unsigned uploads (easier setup), add to `drip_drop_frontend/.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
```

### Create Upload Preset in Cloudinary:

1. Go to Cloudinary Dashboard → Settings → Upload
2. Click "Add upload preset"
3. Set:
   - **Preset name**: `drip_drop_unsigned` (or any name)
   - **Signing mode**: `Unsigned`
   - **Folder**: `drip_drop/products`
   - **Format**: `Auto`
   - **Eager transformations**: `w_1000,h_1000,c_limit,q_auto`
4. Save the preset

## Step 6: Restart Servers

```bash
# Backend
cd drip_drop_backend
npm run dev

# Frontend
cd drip_drop_frontend
npm run dev
```

## Usage

In the Admin Products page:
1. Click "Upload" button next to any image field
2. Select image from your computer
3. Image will be uploaded to Cloudinary
4. URL will be automatically filled in the field

You can also manually enter image URLs if preferred.

## Troubleshooting

### Error: "Cloudinary widget not loaded"
- Make sure the Cloudinary script is loaded in `_document.js`
- Check browser console for script loading errors

### Error: "Failed to initialize image upload"
- Check that Cloudinary credentials are set in `.env`
- Verify the credentials are correct
- For unsigned uploads, make sure upload preset exists

### Images not uploading
- Check Cloudinary dashboard for upload errors
- Verify API key and secret are correct
- Check network tab in browser for API errors

