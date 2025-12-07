# PDF Merger - Dedicated Server Setup Guide

Complete guide to set up a Windows PC as a dedicated server for the PDF merger application.

---

## 📋 Required Software

### 1. **Node.js (LTS Version)**
- Download: https://nodejs.org/
- Version: 18.x or 20.x LTS
- Installation: Run installer, check "Add to PATH"
- Verify: `node --version` and `npm --version`

### 2. **MongoDB Community Server**
- Download: https://www.mongodb.com/try/download/community
- Version: Latest stable (7.x)
- Installation: 
  - Choose "Complete" installation
  - Check "Install MongoDB as a Service"
  - Check "Run service as Network Service user"
  - Install MongoDB Compass (optional GUI)

### 3. **Git (Optional, for updates)**
- Download: https://git-scm.com/download/win
- Useful for pulling code updates

---

## 🖥️ Server PC Requirements

### Minimum Specs:
- **CPU**: Dual-core 2.0 GHz
- **RAM**: 4 GB
- **Storage**: 50 GB free space
- **OS**: Windows 10/11 or Windows Server 2016+
- **Network**: Ethernet connection (recommended)

### Recommended Specs:
- **CPU**: Quad-core 2.5 GHz+
- **RAM**: 8 GB+
- **Storage**: 100 GB+ SSD
- **Network**: Gigabit Ethernet

---

## 🚀 Installation Steps

### Step 1: Install Node.js
```cmd
# Download and install from nodejs.org
# Verify installation
node --version
npm --version
```

### Step 2: Install MongoDB
```cmd
# Download and install MongoDB Community Server
# Start MongoDB service
net start MongoDB

# Verify MongoDB is running
mongo --eval "db.version()"
```

### Step 3: Install Application
```cmd
# Navigate to project directory
cd d:\coding\merger

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Build production frontend
npm run build
```

### Step 4: Install PM2 (Process Manager)
```cmd
# Install PM2 globally
npm install -g pm2

# Install PM2 Windows service
npm install -g pm2-windows-service

# Setup PM2 as Windows service
pm2-service-install
```

---

## ⚙️ Configuration

### 1. Configure Windows Firewall
```cmd
# Allow Node.js through firewall
netsh advfirewall firewall add rule name="PDF Merger Server" dir=in action=allow protocol=TCP localport=5000

# Allow MongoDB (if needed)
netsh advfirewall firewall add rule name="MongoDB" dir=in action=allow protocol=TCP localport=27017
```

### 2. Set Static IP Address
1. Open Network Settings
2. Change adapter settings
3. Right-click network adapter → Properties
4. Select IPv4 → Properties
5. Set static IP: **172.17.101.30**
6. Set subnet mask: **255.255.255.0**
7. Set default gateway: **172.17.101.1** (or your router IP)

### 3. Disable Sleep/Hibernation
```cmd
# Disable sleep
powercfg -change -standby-timeout-ac 0

# Disable hibernation
powercfg -h off

# Set high performance power plan
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
```

---

## 🏃 Running the Server

### Option 1: Using PM2 (Recommended for Production)

```cmd
# Navigate to project directory
cd d:\coding\merger

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on Windows boot
pm2 startup

# View status
pm2 status

# View logs
pm2 logs pdf-merger

# Restart server
pm2 restart pdf-merger

# Stop server
pm2 stop pdf-merger
```

### Option 2: Direct Node (For Testing)

```cmd
cd d:\coding\merger
npm start
```

---

## 📊 Monitoring & Maintenance

### Check Server Status
```cmd
# PM2 status
pm2 status

# View logs
pm2 logs pdf-merger --lines 100

# Monitor resources
pm2 monit

# Check MongoDB
net start MongoDB
```

### View Application Logs
- Location: `d:\coding\merger\logs\`
- `output.log` - Application logs
- `error.log` - Error logs

### Health Check
Open browser: `http://localhost:5000/api/health`

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "mongodb": "connected",
  "serverIP": "192.168.0.105",
  "uptime": 12345
}
```

---

## 🔧 Maintenance Tasks

### Daily
- Check PM2 status: `pm2 status`
- Monitor disk space

### Weekly
- Review logs: `pm2 logs pdf-merger --lines 500`
- Check MongoDB logs
- Verify backups

### Monthly
- Update Node.js (if needed)
- Update npm packages: `npm update`
- Rebuild frontend: `npm run build`
- Restart server: `pm2 restart pdf-merger`

### Backup MongoDB Data
```cmd
# Create backup directory
mkdir d:\backups\mongodb

# Backup database
mongodump --db pdfmerger --out d:\backups\mongodb\backup-%date%

# Restore if needed
mongorestore --db pdfmerger d:\backups\mongodb\backup-YYYY-MM-DD\pdfmerger
```

---

## 🌐 Network Access

### Server IP Address
**Static IP: 172.17.101.30**

```cmd
ipconfig
```
Verify IPv4 Address shows: 172.17.101.30

### Access URLs
- **Local**: http://localhost:5000
- **LAN**: http://172.17.101.30:5000
- **Health Check**: http://172.17.101.30:5000/api/health
- **Logs API**: http://172.17.101.30:5000/api/logs

### Branch Access
- 001 Janakpur (Local): http://172.17.101.30:5000
- 002 Gaushala: http://172.17.101.30:5000
- 003-009 All branches: http://172.17.101.30:5000

---

## 🛠️ Troubleshooting

### Server Won't Start
```cmd
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <PID> /F

# Restart MongoDB
net stop MongoDB
net start MongoDB

# Restart PM2
pm2 restart pdf-merger
```

### MongoDB Connection Error
```cmd
# Check MongoDB service
net start MongoDB

# Check MongoDB logs
type "C:\Program Files\MongoDB\Server\7.0\log\mongod.log"
```

### Can't Access from Other PCs
1. Check firewall rules
2. Verify static IP is set
3. Ping server from client PC
4. Check if server is running: `pm2 status`

### High Memory Usage
```cmd
# Check PM2 memory
pm2 status

# Restart if needed
pm2 restart pdf-merger

# Clear old uploads manually
del /q d:\coding\merger\uploads\*
```

---

## 🔒 Security Recommendations

1. **Keep Windows Updated**
   - Enable automatic updates
   - Install security patches

2. **Restrict Network Access**
   - Only allow LAN access (already configured)
   - Don't expose to internet

3. **Regular Backups**
   - Backup MongoDB weekly
   - Backup application code

4. **Monitor Logs**
   - Check for suspicious activity
   - Review error logs regularly

5. **User Access**
   - Use strong Windows password
   - Limit physical access to server PC

---

## 📞 Quick Reference Commands

```cmd
# Start server
pm2 start ecosystem.config.js

# Stop server
pm2 stop pdf-merger

# Restart server
pm2 restart pdf-merger

# View logs
pm2 logs pdf-merger

# Check status
pm2 status

# MongoDB status
net start MongoDB

# View server IP
ipconfig

# Test health
curl http://localhost:5000/api/health
```

---

## 📈 Performance Optimization

### For Better Performance:
1. Use SSD for storage
2. Allocate more RAM (8GB+)
3. Close unnecessary applications
4. Use wired Ethernet connection
5. Keep only essential Windows services running

### MongoDB Optimization:
```cmd
# Compact database monthly
mongo pdfmerger --eval "db.runCommand({compact: 'mergelogs'})"
```

---

## 🆘 Emergency Recovery

### If Server Crashes:
1. Restart Windows
2. Verify MongoDB is running: `net start MongoDB`
3. Start PM2: `pm2 resurrect`
4. Check logs: `pm2 logs pdf-merger`

### Complete Reset:
```cmd
# Stop everything
pm2 stop all
pm2 delete all

# Restart MongoDB
net stop MongoDB
net start MongoDB

# Restart application
cd d:\coding\merger
pm2 start ecosystem.config.js
pm2 save
```

---

## ✅ Post-Installation Checklist

- [ ] Node.js installed and verified
- [ ] MongoDB installed and running as service
- [ ] Application dependencies installed
- [ ] Frontend built successfully
- [ ] PM2 installed and configured
- [ ] Firewall rules added
- [ ] Static IP configured
- [ ] Sleep/hibernation disabled
- [ ] Server accessible from LAN
- [ ] Health check returns OK
- [ ] All branches can access server
- [ ] Logs directory created
- [ ] Backup strategy in place

---

## 📝 Server Information Template

Fill this out and keep it safe:

```
Server PC Name: _______________
Server IP Address: 172.17.101.30
Subnet Mask: 255.255.255.0
Default Gateway: 172.17.101.1
MongoDB Port: 27017
Application Port: 5000
Branch Location: 001 Janakpur
Windows Username: _______________
Installation Date: _______________
Node.js Version: _______________
MongoDB Version: _______________
Last Backup Date: _______________
```

---

## 🎯 Success Indicators

Your server is properly set up when:
- ✅ PM2 shows "online" status
- ✅ Health check returns "connected" for MongoDB
- ✅ All branches can access the application
- ✅ PDFs merge successfully
- ✅ Logs are being recorded in MongoDB
- ✅ Server survives Windows restart
- ✅ No errors in PM2 logs

---

**For support or issues, check the logs first:**
```cmd
pm2 logs pdf-merger --lines 100
```
