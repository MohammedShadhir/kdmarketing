import { MediaFile } from '@/types/domain';

interface Props {
  mediaFiles: MediaFile[];
  onDelete?: (fileId: string) => void;
  readOnly?: boolean;
}

export function MediaFileList({ mediaFiles, onDelete, readOnly = false }: Props) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type === 'application/pdf') return '📄';
    return '📎';
  };

  const isImage = (type: string) => type.startsWith('image/');
  const isVideo = (type: string) => type.startsWith('video/');

  if (mediaFiles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium">No media files uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {mediaFiles.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          {}
          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {isImage(file.type) ? (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            ) : isVideo(file.type) ? (
              <video
                src={file.url}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl">{getFileIcon(file.type)}</span>
            )}
          </div>

          {}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {file.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">
                {new Date(file.uploadedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {}
          <div className="flex items-center gap-2">
            {}
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View/Download"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </a>

            {}
            {!readOnly && onDelete && (
              <button
                onClick={() => onDelete(file.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete file"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
