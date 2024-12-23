"use client"
import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Upload as UploadIcon, FileText, Clock, Plus, MessageSquare } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Document Chat</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <label className="w-full h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div className="space-y-2">
                  <div className="text-blue-500">
                    <Plus className="mx-auto h-12 w-12" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-500">Upload a PDF file</span> or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">PDF up to 10MB</p>
                </div>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileSelection} 
                  className="hidden" 
                />
              </label>
            </div>

            {progress !== null && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {responseMessage && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 text-blue-700 text-sm">
                {responseMessage}
              </div>
            )}
          </div>

          {/* Files List Section */}
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Your Documents</h2>
              <div className="space-y-2">
                {existingFiles.length > 0 ? (
                  existingFiles.map((file, index) => (
                    <div 
                      key={index}
                      className={`group relative p-4 rounded-lg transition-all ${
                        selectedFile === file.filename 
                          ? 'bg-blue-50 ring-2 ring-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedFile(file.filename)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <FileText className={`w-6 h-6 ${
                              selectedFile === file.filename ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {file.filename}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(file.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateTimestampAndChat(file.filename);
                          }}
                          className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                            selectedFile === file.filename
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'text-gray-400 hover:text-blue-500'
                          } transition-colors`}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                    <p className="mt-1 text-sm text-gray-500">Upload a PDF to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* File Exists Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">File Already Exists</h3>
              <p className="mt-2 text-sm text-gray-500">
                This document is already in your library. What would you like to do?
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => handleExistingFile(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Chat with Existing
              </button>
              <button 
                onClick={() => handleExistingFile(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Upload New Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Upload;