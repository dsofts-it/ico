# GitHub Push Instructions

## Step 1: Create the Repository on GitHub (if not done)
1. Go to: https://github.com/dsofts-it
2. Click "New Repository"
3. Name: `ico`
4. Make it Public or Private
5. **DO NOT** initialize with README (we already have one)
6. Click "Create Repository"

## Step 2: Set Up Authentication

### Option A: Using Personal Access Token (Recommended)
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "ICO Backend"
4. Select scopes: `repo` (full control)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### Option B: Using SSH (Alternative)
If you prefer SSH, set up SSH keys first.

## Step 3: Add Remote and Push

Run these commands in your terminal:

```bash
# Add remote with your GitHub username
git remote add origin https://github.com/dsofts-it/ico.git

# Push to GitHub (you'll be prompted for credentials)
git push -u origin main
```

When prompted:
- **Username**: Your GitHub username (or organization name: dsofts-it)
- **Password**: Paste your Personal Access Token (NOT your GitHub password)

## Alternative: Use SSH URL

If you have SSH keys set up:
```bash
git remote add origin git@github.com:dsofts-it/ico.git
git push -u origin main
```

## Troubleshooting

### Error: "Permission denied"
- Make sure you're a member of the `dsofts-it` organization
- Make sure you have write access to the repository
- Use a Personal Access Token instead of password

### Error: "Repository not found"
- Create the repository on GitHub first
- Make sure the repository name is exactly `ico`
- Check if you're using the correct organization name

### Error: "Remote already exists"
```bash
git remote remove origin
git remote add origin https://github.com/dsofts-it/ico.git
```
