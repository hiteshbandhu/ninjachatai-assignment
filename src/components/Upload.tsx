"use client"
import React, { useState, useEffect } from 'react'
import { Upload as UploadIcon, FileText, Clock } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const Upload = () => {
  const [progress, setProgress] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [showEntries, setShowEntries] = useState(false);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchExistingFiles();
  }, []);

  const fetchExistingFiles = async () => {
    try {
      const response = await axios.get('/api/dbEntries/fetch');
      setExistingFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleExistingFile = async (proceed: boolean) => {
    setShowDialog(false);
    if (!currentFile) return;

    if (proceed) {
      await updateTimestampAndChat(currentFile.name);
    } else {
      await uploadFile(currentFile);
    }
  };

  const updateTimestampAndChat = async (filename: string) => {
    try {
      await axios.post('/api/dbEntries/updateTimestamp', {
        fileName: filename
      });
      router.push('/chat');
    } catch (error) {
      console.error('Error updating timestamp:', error);
      setResponseMessage('Error updating file timestamp.');
    }
  };

  const uploadFile = async (file: File) => {
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await axios.post('/api/fileHandler/saveToServer', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percentCompleted);
        }
      });

      setResponseMessage('Processing file...');
      
      const embedResponse = await axios.post('/api/fileHandler/embedFilesAndIndex', { 
        path: uploadResponse.data.path,
        filename: file.name
      });

      // Add entry to database for new file
      await axios.post('/api/dbEntries/write', {
        filename: file.name,
        namespace: embedResponse.data.namespace.namespace
      });
      
      // Refresh the file list
      await fetchExistingFiles();
      
      setResponseMessage('File processed successfully!');
      router.push('/chat');
    } catch (error) {
      console.error('Error during upload process:', error);
      setResponseMessage('Error processing file.');
    }
};

  const checkFileExistence = async (file: File): Promise<boolean> => {
    try {
      const response = await axios.get('/api/dbEntries/fetch');
      const existingFiles = response.data;
      setExistingFiles(existingFiles);

      const existingFile = existingFiles.find((item: { filename: string }) => 
        item.filename === file.name
      );

      if (existingFile) {
        setCurrentFile(file);
        setShowDialog(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking file existence:', error);
      setResponseMessage('Error checking file existence.');
      return false;
    }
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const file = files[0];
    if (file.type !== 'application/pdf') {
      setResponseMessage('Please select a PDF file.');
      return;
    }

    const fileExists = await checkFileExistence(file);
    if (!fileExists) {
      await uploadFile(file);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <main className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='w-full max-w-4xl'>
        <div className='mb-8 text-center'>
          <label className='flex flex-col items-center cursor-pointer'>
            <UploadIcon className='w-12 h-12 mb-2' />
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handleFileSelection} 
              className='hidden' 
            />
            <span className='text-lg'>Upload PDF file</span>
          </label>
        </div>

        {progress !== null && (
          <div className='mt-4 w-64 mx-auto'>
            <div className='w-full bg-gray-200 rounded-full h-2.5'>
              <div 
                className='bg-blue-600 h-2.5 rounded-full' 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className='mt-1 text-sm text-gray-600'>{progress.toFixed(0)}%</span>
          </div>
        )}
        
        {responseMessage && (
          <div className='mt-4 text-center text-gray-700'>
            <span>{responseMessage}</span>
          </div>
        )}

        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-4'>Your Files</h2>
          <div className='bg-white rounded-lg shadow'>
            {existingFiles.length > 0 ? (
              <div className='divide-y'>
                {existingFiles.map((file, index) => (
                  <div 
                    key={index} 
                    className={`p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      selectedFile === file.filename ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedFile(file.filename)}
                  >
                    <div className='flex items-center space-x-3'>
                      <FileText className='w-5 h-5 text-gray-500' />
                      <div>
                        <p className='font-medium'>{file.filename}</p>
                        <p className='text-sm text-gray-500 flex items-center'>
                          <Clock className='w-4 h-4 mr-1' />
                          {formatDate(file.created_at)}
                        </p>
                      </div>
                    </div>
                    {selectedFile === file.filename && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTimestampAndChat(file.filename);
                        }}
                        className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                      >
                        Chat
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className='p-4 text-center text-gray-500'>
                No files uploaded yet
              </div>
            )}
          </div>
        </div>
      </div>

      {showDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white rounded-lg p-6 max-w-sm mx-4'>
            <h3 className='text-lg font-semibold mb-4'>File Already Exists</h3>
            <p className='mb-6'>Would you like to chat with the existing file?</p>
            <div className='flex justify-end space-x-4'>
              <button 
                onClick={() => handleExistingFile(true)}
                className='px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors'
              >
                Yes, Go to Chat
              </button>
              <button 
                onClick={() => handleExistingFile(false)}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
              >
                No, Upload New File
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Upload;