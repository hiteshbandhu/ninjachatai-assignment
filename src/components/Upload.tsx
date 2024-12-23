"use client"
import React, { useState } from 'react'
import { Upload as UploadIcon } from 'lucide-react';
import axios from 'axios'; // Import axios for making API requests
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

const Upload = () => {
  const [progress, setProgress] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null); // State to hold the API response
  const [namespace, setNamespace] = useState<string | null>(null); // State to hold the namespace
  const router = useRouter(); // Initialize router for navigation

  const handlePdfFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
      pdfFiles.forEach(async (file) => {
        console.log(`Sending ${file.name} to the server...`);

        // Create FormData to send the file
        const formData = new FormData();
        formData.append('file', file);

        // Hit the API endpoint to save the file
        try {
          const response = await axios.post('/api/fileHandler/saveToServer', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
              setProgress(percentCompleted);
            }
          });
          console.log('File uploaded successfully.');

          // Show that the database is updating
          setResponseMessage('Updating database...');

          // Send the file path to the next API route
          const embedResponse = await axios.post('/api/fileHandler/embedFilesAndIndex', { path: response.data.path });
          setNamespace(embedResponse.data.namespace); // Set the namespace returned
          setResponseMessage(`Database updated. Namespace: ${embedResponse.data.namespace}`); // Show the namespace
        } catch (error) {
          console.error('Error hitting the API:', error);
          setResponseMessage('Error saving file.'); // Show error message
        }
      });
    }
  };

  return (
    <main className='flex flex-col items-center justify-center min-h-screen'>
      <label className='flex flex-col items-center cursor-pointer'>
        <UploadIcon className='w-12 h-12 mb-2' />
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handlePdfFiles} 
          multiple 
          className='hidden' 
        />
        <span className='text-lg'>Upload PDF files only</span>
      </label>
      {progress !== null && (
        <div className='mt-4'>
          <progress value={progress} max="100" />
          <span>{progress.toFixed(0)}%</span>
        </div>
      )}
      {responseMessage && (
        <div className='mt-4 text-center'>
          <span>{responseMessage}</span>
        </div>
      )}
      {namespace && (
        <div className='mt-4 text-center'>
          <span>Your Knowledge Base is ready!</span>
          <button 
            onClick={() => router.push('/chat')} 
            className='mt-2 px-4 py-2 bg-blue-500 text-white rounded'
          >
            Go to Chat
          </button>
        </div>
      )}
    </main>
  )
}

export default Upload