# PDF Merger - Deployment Checklist

## 📋 Pre-Deployment

### Software Installation
- [ ] Node.js v18+ installed
- [ ] MongoDB Community Server installed
- [ ] MongoDB running as Windows service
- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] PM2 Windows service installed (`npm install -g pm2-windows-service`)

### Network Configuration
- [ ] Static IP set to: **172.17.101.30**
- [ ] Subnet mask: **255.255.255.0**
- [ ] Default gateway: **172.17.101.1**
- [ ] DNS configured properly
- [ ] Network connection stable

### Firewall Configuration
- [ ] Port 5000 allowed in Windows Firewall
- [ ] Firewall rule created: `netsh advfirewall firewall add rule name="PDF Merger Server" dir=in action=allow protocol=TCP localport=5000`

### Power Settings
- [ ] Sleep disabled: `powercfg -change -standby-timeout-ac 0`
- [ ] Hibernation disabled: `powercfg -h off`
- [ ] High performance power plan active

---

## 🚀 Application Deployment

### Step 1: Install Dependencies
```cmd
cd d:\coding\merger
npm install
cd client
npm install
cd ..
```
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] No installation errors

### Step 2: Build Frontend
```cmd
npm run build
```
- [ ] Build completed successfully
- [ ] `client/build` directory created
- [ ] No build errors

### Step 3: Create Logs Directory
```cmd
mkdir logs
```
- [ ] Logs directory created

### Step 4: Test MongoDB Connection
```cmd
net start MongoDB
mongo --eval "db.version()"
```
- [ ] MongoDB service running
- [ ] Connection successful

### Step 5: Test Application
```cmd
npm start
```
- [ ] Server starts on port 5000
- [ ] No startup errors
- [ ] MongoDB connects successfully
- [ ] Server IP shows: 172.17.101.30
- [ ] Stop with Ctrl+C

### Step 6: Setup PM2
```cmd
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```
- [ ] PM2 starts application
- [ ] Status shows "online"
- [ ] PM2 configuration saved
- [ ] PM2 startup configured

---

## ✅ Verification Tests

### Test 1: Local Access
- [ ] Open: http://localhost:5000
- [ ] Page loads correctly
- [ ] Logo displays
- [ ] "Multipurpose Finance Limited" shows

### Test 2: LAN Access (from another PC)
- [ ] Open: http://172.17.101.30:5000
- [ ] Page loads correctly
- [ ] Can select PDF files
- [ ] Can merge PDFs successfully
- [ ] Merged PDF downloads

### Test 3: Health Check
- [ ] Open: http://172.17.101.30:5000/api/health
- [ ] Returns JSON with status "OK"
- [ ] MongoDB shows "connected"
- [ ] Server IP shows "172.17.101.30"

### Test 4: Branch Detection
From each branch, merge PDFs and verify logs:
- [ ] 001 Janakpur (172.17.101.x) - Detected correctly
- [ ] 002 Gaushala (192.168.131.x) - Detected correctly
- [ ] 003 Kalyanpur (192.168.101.x) - Detected correctly
- [ ] 004 Rajbiraj (192.168.111.x) - Detected correctly
- [ ] 005 Ramgopalpur (192.168.141.x) - Detected correctly
- [ ] 006 Manara (192.168.151.x) - Detected correctly
- [ ] 007 Kaudena (192.168.71.x) - Detected correctly
- [ ] 008 Godaita (192.168.81.x) - Detected correctly
- [ ] 009 Other (any other IP) - Detected correctly

### Test 5: Logging
```cmd
# Check logs API
curl http://localhost:5000/api/logs
```
- [ ] Returns array of merge logs
- [ ] Contains filesCount, totalSize, userIP, serverIP, branch
- [ ] Timestamps are correct

### Test 6: PM2 Monitoring
```cmd
pm2 status
pm2 logs pdf-merger --lines 50
```
- [ ] Status shows "online"
- [ ] CPU and memory usage normal
- [ ] No errors in logs

### Test 7: Restart Survival
```cmd
# Restart Windows PC
shutdown /r /t 0
```
After restart:
- [ ] MongoDB starts automatically
- [ ] PM2 starts automatically
- [ ] Application is accessible
- [ ] No manual intervention needed

---

## 📊 Performance Tests

### Test Large Files
- [ ] Upload 10 PDFs (5MB each)
- [ ] Merge completes successfully
- [ ] Download works
- [ ] Files cleaned up from uploads/

### Test Multiple Users
- [ ] 3+ users merge PDFs simultaneously
- [ ] All operations complete successfully
- [ ] No conflicts or errors

### Test Error Handling
- [ ] Upload non-PDF file → Shows error
- [ ] Upload only 1 PDF → Shows error "At least 2 required"
- [ ] Upload file >50MB → Shows "File too large" error
- [ ] All errors clean up files properly

---

## 🔒 Security Checks

- [ ] Server only accessible on LAN (not internet)
- [ ] MongoDB only accepts local connections
- [ ] No sensitive data in logs
- [ ] Windows firewall active
- [ ] Windows updates enabled
- [ ] Strong Windows password set

---

## 📝 Documentation

- [ ] SERVER-SETUP.md reviewed
- [ ] Server information template filled out
- [ ] Network diagram created (optional)
- [ ] User guide distributed to branches
- [ ] IT contact information documented

---

## 🎯 Go-Live Checklist

### Final Checks
- [ ] All tests passed
- [ ] PM2 running and saved
- [ ] MongoDB service enabled
- [ ] Firewall configured
- [ ] Static IP verified: 172.17.101.30
- [ ] Logs directory exists
- [ ] No errors in PM2 logs

### Communication
- [ ] Notify all branches of server URL: http://172.17.101.30:5000
- [ ] Provide user instructions
- [ ] Share IT support contact
- [ ] Schedule training session (if needed)

### Monitoring Setup
- [ ] Daily check scheduled
- [ ] Weekly log review scheduled
- [ ] Monthly maintenance scheduled
- [ ] Backup strategy in place

---

## 📞 Support Information

**Server Details:**
- IP Address: 172.17.101.30
- Port: 5000
- Location: 001 Janakpur Branch
- URL: http://172.17.101.30:5000

**Quick Commands:**
```cmd
# Check status
pm2 status

# View logs
pm2 logs pdf-merger

# Restart server
pm2 restart pdf-merger

# Check MongoDB
net start MongoDB

# View health
curl http://localhost:5000/api/health
```

**Emergency Contact:**
- IT Admin: _______________
- Phone: _______________
- Email: _______________

---

## ✅ Sign-Off

**Deployed By:** _______________  
**Date:** _______________  
**Verified By:** _______________  
**Date:** _______________  

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## 🔄 Post-Deployment

### Week 1
- [ ] Monitor daily for issues
- [ ] Check logs for errors
- [ ] Verify all branches can access
- [ ] Collect user feedback

### Week 2-4
- [ ] Review usage statistics
- [ ] Optimize if needed
- [ ] Address any issues
- [ ] Document common problems

### Monthly
- [ ] Review logs
- [ ] Check disk space
- [ ] Update dependencies
- [ ] Backup MongoDB
- [ ] Performance review

---

**Deployment Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Completed | ⬜ Verified
