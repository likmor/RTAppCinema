import React, { useState } from "react";
import {
  FullFileBrowser,
  ChonkyActions,
  FileArray,
  FileData,
  setChonkyDefaults,
} from "chonky";
import useFetchFiles from "./hooks/useFetchFiles";
import { ChonkyIconFA } from "chonky-icon-fontawesome";
import {SERVER_FILES_API} from "../config.ts";



interface FileItem {
  id: string;
  name: string;
  isDir: boolean;
  childrenIds: string[];
  childrenCount: number;
  parentId: string;
}

//@ts-ignore
setChonkyDefaults({ iconComponent : ChonkyIconFA });

const mapFilesToChonky = (
  fileMap: { [key: string]: FileItem },
  folderId: string
): FileArray => {
  const folder = Object.values(fileMap).filter(
    (item) => item.parentId == folderId
  );
  if (!folder) return [];

  return folder.map((childId) => {
    return {
      id: childId.id,
      name: childId.name,
      isDir: childId.isDir,
    };
  });
};

const FileViewer: React.FC<any> = ({changeSource}) =>{
  const { rootData, loading, error } = useFetchFiles(
    SERVER_FILES_API
  );
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!rootData) return <div>No data available</div>;

  const rootFolderId = rootData.rootFolderId;
  const fileMap = rootData.fileMap;

  const handleFileAction = (data: any) => {
    if (data.id === ChonkyActions.OpenFiles.id && data.payload.targetFile) {
      const targetFile = data.payload.targetFile as FileData;
      if (targetFile.isDir) {
        setCurrentFolderId(targetFile.id);
      } else {
        changeSource(data.payload.targetFile.id);
      }
    }
  };

  const folderIdToShow = currentFolderId || rootFolderId;
  const chonkyFiles = mapFilesToChonky(fileMap, folderIdToShow);

  return (
    //@ts-ignore
    <FullFileBrowser
      files={chonkyFiles}
      folderChain={[
        { id: "root", name: "Root", isDir: true },
        ...(folderIdToShow === rootFolderId ? [] : [fileMap[folderIdToShow]]),
      ]}
      onFileAction={handleFileAction}
      darkMode={true}
    />
  );
};

export default FileViewer;