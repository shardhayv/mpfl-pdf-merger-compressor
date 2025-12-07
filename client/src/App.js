import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [compressFile, setCompressFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length < 2) {
      setMessage('Please select at least 2 PDF files');
      setFiles([]);
      return;
    }
    setFiles(selectedFiles);
    setMessage('');
  };

  const handleCompressFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompressFile(file);
      setMessage('');
    }
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setMessage('Please select at least 2 PDF files');
      return;
    }

    setLoading(true);
    setMessage('Merging PDFs...');

    const formData = new FormData();
    files.forEach(file => formData.append('pdfs', file));

    try {
      const response = await axios.post('/api/merge', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Auto download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'merged.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('PDF merged and downloaded successfully!');
      setFiles([]);
      document.getElementById('fileInput').value = '';
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || 'Failed to merge PDFs'));
    } finally {
      setLoading(false);
    }
  };

  const handleCompress = async () => {
    if (!compressFile) {
      setMessage('Please select a PDF file to compress');
      return;
    }

    setLoading(true);
    setMessage('Compressing PDF...');

    const formData = new FormData();
    formData.append('pdf', compressFile);

    try {
      const response = await axios.post('/api/compress', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Auto download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'compressed.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage('PDF compressed and downloaded successfully!');
      setCompressFile(null);
      document.getElementById('compressInput').value = '';
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || 'Failed to compress PDF'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <img src={`${process.env.PUBLIC_URL}/logo-multipurpose.jpg`} alt="Multipurpose Finance Limited" className="logo" />
          <h1 className="company-name">Multipurpose Finance Limited</h1>
        </div>
      </header>
      <div className="container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'merge' ? 'active' : ''}`}
            onClick={() => { setActiveTab('merge'); setMessage(''); }}
          >
            Merge PDFs
          </button>
          <button 
            className={`tab ${activeTab === 'compress' ? 'active' : ''}`}
            onClick={() => { setActiveTab('compress'); setMessage(''); }}
          >
            Compress PDF
          </button>
        </div>

        {activeTab === 'merge' && (
          <>
            <h1>PDF Merger</h1>
            <p className="subtitle">Merge multiple PDF files into one document</p>

            <div className="form-group">
              <label htmlFor="fileInput" className="file-label">
                Select PDF Files (2 or more)
              </label>
              <input
                id="fileInput"
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
                className="file-input"
              />
              {files.length > 0 && (
                <div className="file-list">
                  <p><strong>{files.length} files selected:</strong></p>
                  <ul>
                    {files.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={handleMerge}
              disabled={loading || files.length < 2}
              className="action-button"
            >
              {loading ? 'Merging...' : 'Merge PDFs'}
            </button>
          </>
        )}

        {activeTab === 'compress' && (
          <>
            <h1>PDF Compressor</h1>
            <p className="subtitle">Reduce PDF file size</p>

            <div className="form-group">
              <label htmlFor="compressInput" className="file-label">
                Select PDF File
              </label>
              <input
                id="compressInput"
                type="file"
                accept="application/pdf"
                onChange={handleCompressFileChange}
                className="file-input"
              />
              {compressFile && (
                <div className="file-list">
                  <p><strong>Selected file:</strong></p>
                  <ul>
                    <li>{compressFile.name} ({(compressFile.size / 1024 / 1024).toFixed(2)} MB)</li>
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={handleCompress}
              disabled={loading || !compressFile}
              className="action-button"
            >
              {loading ? 'Compressing...' : 'Compress PDF'}
            </button>
          </>
        )}

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
