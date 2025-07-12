import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [activeTab, setActiveTab] = useState('link');
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const handleShorten = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/links/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (res.ok) {
      setShortUrl(data.shortUrl);
    } else {
      alert(data.error || 'Failed to shorten URL');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch('/api/uploads/upload', {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    if (res.ok) {
      setDownloadUrl(data.downloadUrl);
      setFileName(data.fileName);
    } else {
      alert(data.error || 'Failed to upload file');
    }
  };

  return (
    <div className="container">
      {/* UI sama seperti sebelumnya, disesuaikan dengan React */}
    </div>
  );
}
