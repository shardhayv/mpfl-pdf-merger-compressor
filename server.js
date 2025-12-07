const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request timeout for large file operations
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000);
  next();
});

// MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/pdfmerger', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
});

// Get server IP with error handling
const getServerIP = () => {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (err) {
    console.error('Error getting server IP:', err);
  }
  return 'localhost';
};

const SERVER_IP = getServerIP();

// Branch IP mapping
const BRANCHES = [
  { code: '001', name: 'Janakpur', subnet: '172.17.101' },
  { code: '002', name: 'Gaushala', subnet: '192.168.131' },
  { code: '003', name: 'Kalyanpur', subnet: '192.168.101' },
  { code: '004', name: 'Rajbiraj', subnet: '192.168.111' },
  { code: '005', name: 'Ramgopalpur', subnet: '192.168.141' },
  { code: '006', name: 'Manara', subnet: '192.168.151' },
  { code: '007', name: 'Kaudena', subnet: '192.168.71' },
  { code: '008', name: 'Godaita', subnet: '192.168.81' },
  { code: '009', name: 'Other', subnet: null }
];

// Detect branch from IP with error handling
const detectBranch = (ip) => {
  try {
    if (!ip) return '009 Other';
    const cleanIP = ip.replace('::ffff:', ''); // Remove IPv6 prefix
    for (const branch of BRANCHES) {
      if (branch.subnet && cleanIP.startsWith(branch.subnet)) {
        return `${branch.code} ${branch.name}`;
      }
    }
  } catch (err) {
    console.error('Error detecting branch:', err);
  }
  return '009 Other';
};

// MongoDB Schemas
const OperationLogSchema = new mongoose.Schema({
  operation: String, // 'merge' or 'compress'
  filesCount: Number,
  originalSize: Number,
  finalSize: Number,
  compressionRatio: Number,
  timestamp: { type: Date, default: Date.now },
  userIP: String,
  serverIP: String,
  branch: String
});

const OperationLog = mongoose.model('OperationLog', OperationLogSchema);
const MergeLog = mongoose.model('MergeLog', OperationLogSchema); // Backward compatibility

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB per file
    files: 100
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Ensure uploads directory exists and cleanup old files
const initUploadsDir = async () => {
  try {
    await fs.mkdir('uploads', { recursive: true });
    // Cleanup orphaned files older than 1 hour
    const files = await fs.readdir('uploads');
    const now = Date.now();
    for (const file of files) {
      try {
        const filePath = path.join('uploads', file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtimeMs > 3600000) { // 1 hour
          await fs.unlink(filePath);
          console.log('Cleaned up old file:', file);
        }
      } catch (fileErr) {
        console.error(`Error processing file ${file}:`, fileErr.message);
      }
    }
  } catch (err) {
    console.error('Error initializing uploads directory:', err.message);
  }
};

initUploadsDir();

// Periodic cleanup every hour
setInterval(initUploadsDir, 3600000);

// Merge PDFs Function with robust error handling
const mergePDFs = async (filePaths) => {
  if (!filePaths || filePaths.length === 0) {
    throw new Error('No files provided for merging');
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    try {
      const pdfBytes = await fs.readFile(filePath);
      if (!pdfBytes || pdfBytes.length === 0) {
        throw new Error(`File ${i + 1} is empty`);
      }
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err) {
      throw new Error(`Failed to process PDF file ${i + 1}: ${err.message}`);
    }
  }

  return await mergedPdf.save();
};

// Compress PDF Function with robust error handling
const compressPDF = async (filePath) => {
  if (!filePath) {
    throw new Error('No file path provided for compression');
  }

  try {
    const pdfBytes = await fs.readFile(filePath);
    
    if (!pdfBytes || pdfBytes.length === 0) {
      throw new Error('PDF file is empty');
    }

    const pdf = await PDFDocument.load(pdfBytes);
    
    // Remove metadata and compress
    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    pdf.setProducer('');
    pdf.setCreator('');
    
    const compressed = await pdf.save({ useObjectStreams: false });
    
    if (!compressed || compressed.length === 0) {
      throw new Error('Compression resulted in empty file');
    }
    
    return compressed;
  } catch (err) {
    if (err.message.includes('encrypted')) {
      throw new Error('Cannot compress encrypted/password-protected PDFs');
    }
    if (err.message.includes('Invalid PDF')) {
      throw new Error('Invalid or corrupted PDF file');
    }
    throw new Error(`Failed to compress PDF: ${err.message}`);
  }
};

// Cleanup Files Function with error handling
const cleanupFiles = async (filePaths) => {
  if (!filePaths || !Array.isArray(filePaths)) return;
  
  for (const filePath of filePaths) {
    try {
      if (filePath) {
        await fs.unlink(filePath);
      }
    } catch (err) {
      // Only log if file exists but couldn't be deleted
      if (err.code !== 'ENOENT') {
        console.error('Error deleting file:', filePath, err.message);
      }
    }
  }
};

// API Routes
app.post('/api/merge', upload.array('pdfs', 100), async (req, res) => {
  let filePaths = [];
  const startTime = Date.now();
  
  try {
    const uploadedFiles = req.files;
    
    // Validation
    if (!uploadedFiles || uploadedFiles.length < 2) {
      if (uploadedFiles) {
        filePaths = uploadedFiles.map(f => f.path);
        await cleanupFiles(filePaths);
      }
      return res.status(400).json({ error: 'At least 2 PDF files are required' });
    }

    filePaths = uploadedFiles.map(file => file.path);
    const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    const userIP = req.ip || req.connection.remoteAddress || 'unknown';
    const branch = detectBranch(userIP);

    console.log(`Merging ${uploadedFiles.length} PDFs (${(totalSize / 1024 / 1024).toFixed(2)}MB) from ${branch}`);

    // Merge PDFs
    const mergedPdfBytes = await mergePDFs(filePaths);
    
    if (!mergedPdfBytes || mergedPdfBytes.length === 0) {
      throw new Error('Merged PDF is empty');
    }

    // Save log to MongoDB (non-blocking, don't fail merge if logging fails)
    OperationLog.create({
      operation: 'merge',
      filesCount: uploadedFiles.length,
      originalSize: totalSize,
      finalSize: mergedPdfBytes.length,
      compressionRatio: 0,
      userIP,
      serverIP: SERVER_IP,
      branch
    }).catch(err => console.error('Failed to log merge operation:', err.message));

    // Send merged PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    res.send(Buffer.from(mergedPdfBytes));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Merge completed in ${duration}s`);

    // Cleanup uploaded files after response
    setImmediate(() => cleanupFiles(filePaths));
  } catch (error) {
    console.error('Error merging PDFs:', error.message);
    console.error('Stack:', error.stack);
    
    // Ensure cleanup happens on any error
    if (filePaths.length > 0) {
      await cleanupFiles(filePaths);
    }
    
    if (!res.headersSent) {
      const errorMessage = error.message.includes('process PDF') 
        ? error.message 
        : 'Failed to merge PDFs. Please ensure all files are valid PDFs.';
      res.status(500).json({ error: errorMessage });
    }
  }
});

// Multer error handler
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error.code, error.message);
    // Cleanup any uploaded files on multer errors
    if (req.files) {
      const filePaths = req.files.map(f => f.path);
      cleanupFiles(filePaths);
    }
    if (req.file) {
      cleanupFiles([req.file.path]);
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 200MB per file.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum is 100 files.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit, just log
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Compress PDF endpoint with robust error handling
app.post('/api/compress', upload.single('pdf'), async (req, res) => {
  let filePath = null;
  const startTime = Date.now();
  
  try {
    const uploadedFile = req.file;
    
    // Validation
    if (!uploadedFile) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    filePath = uploadedFile.path;
    const originalSize = uploadedFile.size;
    
    // Check file size
    if (originalSize === 0) {
      await cleanupFiles([filePath]);
      return res.status(400).json({ error: 'Uploaded file is empty' });
    }

    // Check if file is too small to compress
    if (originalSize < 1024) {
      await cleanupFiles([filePath]);
      return res.status(400).json({ error: 'File is too small to compress (minimum 1KB)' });
    }

    const userIP = req.ip || req.connection.remoteAddress || 'unknown';
    const branch = detectBranch(userIP);

    console.log(`Compressing PDF (${(originalSize / 1024 / 1024).toFixed(2)}MB) from ${branch}`);

    // Compress PDF
    const compressedPdfBytes = await compressPDF(filePath);
    
    if (!compressedPdfBytes || compressedPdfBytes.length === 0) {
      throw new Error('Compression resulted in empty file');
    }

    const finalSize = compressedPdfBytes.length;
    const compressionRatio = ((1 - finalSize / originalSize) * 100).toFixed(2);

    // Save log to MongoDB (non-blocking)
    OperationLog.create({
      operation: 'compress',
      filesCount: 1,
      originalSize,
      finalSize,
      compressionRatio: parseFloat(compressionRatio),
      userIP,
      serverIP: SERVER_IP,
      branch
    }).catch(err => console.error('Failed to log compress operation:', err.message));

    // Send compressed PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=compressed.pdf');
    res.send(Buffer.from(compressedPdfBytes));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Compression completed in ${duration}s (${compressionRatio}% reduction)`);

    // Cleanup uploaded file after response
    setImmediate(() => cleanupFiles([filePath]));
  } catch (error) {
    console.error('Error compressing PDF:', error.message);
    console.error('Stack:', error.stack);
    
    // Ensure cleanup happens on any error
    if (filePath) {
      await cleanupFiles([filePath]);
    }
    
    if (!res.headersSent) {
      // Provide specific error messages
      let errorMessage = 'Failed to compress PDF.';
      
      if (error.message.includes('encrypted') || error.message.includes('password')) {
        errorMessage = 'Cannot compress password-protected or encrypted PDFs.';
      } else if (error.message.includes('Invalid') || error.message.includes('corrupted')) {
        errorMessage = 'Invalid or corrupted PDF file. Please check the file and try again.';
      } else if (error.message.includes('empty')) {
        errorMessage = 'The PDF file appears to be empty or invalid.';
      } else if (error.message.includes('process PDF')) {
        errorMessage = error.message;
      }
      
      res.status(500).json({ error: errorMessage });
    }
  }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await OperationLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error.message);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

app.get('/api/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    serverIP: SERVER_IP,
    uptime: process.uptime()
  };
  res.json(health);
});

// Serve React frontend in production
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Graceful shutdown
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Server IP: ${SERVER_IP}`);
  console.log(`Access from LAN: http://${SERVER_IP}:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
