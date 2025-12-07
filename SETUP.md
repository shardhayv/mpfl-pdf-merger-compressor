# Quick Setup Guide for Windows

## Step-by-Step Installation

### 1. Install Node.js
- Download from: https://nodejs.org/
- Install LTS version (includes npm)
- Verify installation:
  ```cmd
  node --version
  npm --version
  ```

### 2. Install MongoDB
- Download from: https://www.mongodb.com/try/download/community
- Run installer (choose "Complete" installation)
- Install as Windows Service (check the option)
- Start MongoDB:
  ```cmd
  net start MongoDB
  ```

### 3. Install Project Dependencies

Open Command Prompt in project folder:

```cmd
cd d:\coding\merger

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 4. Build Frontend for Production

```cmd
npm run build
```

### 5. Start the Server

```cmd
npm start
```

Server will start on: http://0.0.0.0:5000

### 6. Configure Windows Firewall

Allow incoming connections on port 5000:

```cmd
netsh advfirewall firewall add rule name="PDF Merger Server" dir=in action=allow protocol=TCP localport=5000
```

### 7. Find Your LAN IP Address

```cmd
ipconfig
```

Look for "IPv4 Address" under your active network adapter (e.g., 192.168.1.100)

### 8. Access from Other Computers

On any computer in the same LAN, open browser and go to:
```
http://192.168.1.100:5000
```
(Replace with your actual IP address)

## Running as Development

To run with hot-reload for development:

```cmd
npm run dev
```

This starts:
- Backend on port 5000
- Frontend on port 3000 (with proxy to backend)

## Verify Installation

1. Check MongoDB is running:
   ```cmd
   mongo --eval "db.version()"
   ```

2. Check server health:
   Open browser: http://localhost:5000/api/health

3. Test merge functionality:
   - Open: http://localhost:5000
   - Upload 2+ PDF files
   - Click "Merge PDFs"
   - Merged PDF should download automatically

## Common Issues

### "MongoDB connection error"
**Solution**: Start MongoDB service
```cmd
net start MongoDB
```

### "Port 5000 is already in use"
**Solution**: Change PORT in server.js or kill the process using port 5000

### "Cannot access from other computers"
**Solution**: 
1. Check firewall rule is added
2. Ensure all computers are on same network
3. Verify server is running with 0.0.0.0 binding

### "Module not found" errors
**Solution**: Reinstall dependencies
```cmd
npm install
cd client
npm install
```

## Production Deployment

For permanent office deployment:

1. Install Node.js and MongoDB on a dedicated server/PC
2. Run the build and start commands
3. Use a process manager like PM2 to keep server running:
   ```cmd
   npm install -g pm2
   pm2 start server.js --name pdf-merger
   pm2 startup
   pm2 save
   ```

4. Configure server to start on Windows boot

## Support

For issues, check:
- MongoDB is running: `net start MongoDB`
- Node.js is installed: `node --version`
- All dependencies installed: `npm install` in both root and client folders
- Firewall allows port 5000
