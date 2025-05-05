export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
  webViewLink: string;
}

export interface DriveFilesResponse {
  files: DriveFile[];
}

export interface RecordingResponse {
  id: string;
  name: string;
  createdTime: string;
  webViewLink: string;
  thumbnailLink: string;
}

export interface TranscriptResponse {
  id: string;
  name: string;
  createdTime: string;
  webViewLink: string;
}