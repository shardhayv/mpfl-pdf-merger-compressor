# PDF Merger - LAN Office Application

A full-stack MERN application for merging multiple PDF files, designed for internal office use across LAN.

## Features

- ✅ Upload and merge 2+ PDF files
- ✅ Automatic download of merged PDF
- ✅ MongoDB logging (files count, size, IP, timestamp, branch)
- ✅ Multi-user support
- ✅ Automatic file cleanup after merge
- ✅ LAN accessible (0.0.0.0 binding)
- ✅ Clean, responsive UI

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Database**: MongoDB (local)
- **PDF Processing**: pdf-lib

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation)
- Windows OS

## Installation

### 1. Install MongoDB

Download and install MongoDB Community Server from:
https://www.mongodb.com/try/download/community

Start MongoDB service:
```cmd
net start MongoDB
```

### 2. Install Dependencies

```cmd
cd d:\coding\merger
npm install
cd client
npm install
cd ..
```

## Running the Application

### Development Mode (Both servers)

```cmd
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

### Production Mode

```cmd
npm run build
npm start
```

Access at: http://localhost:5000

## LAN Access

1. Find your machine's IP address:
```cmd
ipconfig
```

Look for "IPv4 Address" (e.g., 192.168.1.100)

2. Access from any device on the LAN:
```
http://192.168.1.100:5000
```

## Project Structure

```
merger/
├── server.js              # Express backend
├── package.json           # Backend dependencies
├── uploads/               # Temporary PDF storage (auto-created)
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styles
│   │   ├── index.js       # React entry
│   │   └── index.css      # Global styles
│   └── package.json       # Frontend dependencies
└── README.md
```

## API Endpoints

### POST /api/merge
Merge multiple PDFs
- **Body**: FormData with 'pdfs' files and optional 'branch' field
- **Response**: Merged PDF file (application/pdf)

### GET /api/logs
Retrieve merge logs
- **Response**: JSON array of log entries

### GET /api/health
Health check
- **Response**: { status: 'OK', timestamp: Date }

## MongoDB Schema

```javascript
{
  filesCount: Number,      // Number of PDFs merged
  totalSize: Number,       // Total size in bytes
  timestamp: Date,         // Merge timestamp
  userIP: String,          // User's IP address
  branch: String           // Optional branch name
}
```

## Usage

1. Open the web app in browser
2. Click "Select PDF Files" and choose 2+ PDFs
3. (Optional) Enter branch name
4. Click "Merge PDFs"
5. Merged PDF downloads automatically
6. All temporary files are deleted from server

## Security Notes

- Only PDF files are accepted
- Files are stored temporarily and deleted after merge
- MongoDB stores only metadata, not actual files
- Designed for trusted LAN environment

## Troubleshooting

### MongoDB Connection Error
Ensure MongoDB service is running:
```cmd
net start MongoDB
```

### Port Already in Use
Change PORT in server.js (default: 5000)

### Cannot Access from LAN
- Check Windows Firewall settings
- Ensure port 5000 is allowed
- Verify all devices are on same network

## Firewall Configuration

Allow Node.js through Windows Firewall:
```cmd
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=5000
```

## License

Internal office use only.
