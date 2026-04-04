import { useState } from 'react';
import { MediaFile } from '@/types/domain';
import { deleteMediaFile } from '@/services/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  projectId: string;
  projectTitle: string;
  mediaFiles: MediaFile[];
  loading?: boolean;
  onClose: () => void;
  onFileDeleted?: () => void;
}

export function ViewMediaFilesModal({ projectTitle, mediaFiles, loading = false, onClose, onFileDeleted }: Props) {
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    setDeleting(fileId);
    try {
      await deleteMediaFile(fileId);
      if (onFileDeleted) {
        onFileDeleted();
      }
    } catch (error) {
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const renderMediaPreview = (file: MediaFile) => {
    if (file.type.startsWith('video/')) {
      return (
        <video
          controls
          className="w-full max-h-96 rounded-lg"
          src={file.url}
        >
          Your browser does not support the video tag.
        </video>
      );
    } else if (file.type.startsWith('image/')) {
      return (
        <img
          src={file.url}
          alt={file.name}
          className="w-full max-h-96 object-contain rounded-lg"
        />
      );
    } else if (file.type === 'application/pdf') {
      return (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-700 font-medium mb-2">{file.name}</p>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-block"
          >
            Open PDF
          </a>
        </div>
      );
    } else {
      return (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-700 font-medium mb-2">{file.name}</p>
          <a
            href={file.url}
            download={file.name}
            className="btn-primary inline-block"
          >
            Download File
          </a>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-[90vw] h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200">
        {}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Media Files</h2>
              <p className="text-emerald-100 text-sm mt-1">{projectTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {}
        <div className="p-4 sm:p-8 overflow-y-auto h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-600"></div>
                <div className="absolute top-0 left-0 animate-spin rounded-full h-20 w-20 border-t-4 border-emerald-400" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
              </div>
              <p className="text-gray-600 font-medium mt-6 text-lg">Loading media files...</p>
              <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your files</p>
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium">No media files uploaded yet</p>
              <p className="text-sm mt-1">Upload files when editing this project</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {}
              <div className="lg:col-span-2">
                {selectedFile ? (
                  <div className="space-y-4">
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to all files
                    </button>
                    {renderMediaPreview(selectedFile)}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{selectedFile.name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Size:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 text-gray-900 font-medium">{selectedFile.type}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Uploaded:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {formatDistanceToNow(new Date(selectedFile.uploadedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-3">
                        <a
                          href={selectedFile.url}
                          download={selectedFile.name}
                          className="btn-primary flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </a>
                        <button
                          onClick={() => handleDeleteFile(selectedFile.id)}
                          disabled={deleting === selectedFile.id}
                          className="btn-secondary bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                        >
                          {deleting === selectedFile.id ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mediaFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => setSelectedFile(file)}
                        className="cursor-pointer group bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-video bg-gray-200 relative overflow-hidden">
                          {file.type.startsWith('video/') ? (
                            <>
                              <video src={file.url} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            </>
                          ) : file.type.startsWith('image/') ? (
                            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {}
              <div className="lg:border-l lg:pl-6">
                <h3 className="font-semibold text-gray-900 mb-4">All Files ({mediaFiles.length})</h3>
                <div className="space-y-2">
                  {mediaFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedFile?.id === file.id
                          ? 'bg-emerald-50 border-2 border-emerald-500'
                          : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {file.type.startsWith('video/') ? (
                          <svg className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : file.type.startsWith('image/') ? (
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
