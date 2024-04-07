import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import axios from "axios";
import { useDarkMode } from "../context/darkModeContext";
import RecentFiles from "./RecentFiles";
import { useAuth } from "../context/authContext";
import AddFilesInsideFolder from "./AddFilesInsideFolder";

const FilesInsideFolder = () => {
  const { formatFileSize } = useAuth();
  const [files, setFiles] = useState([]);
  const { darkMode } = useDarkMode();
  const { folderName, folderId } = useParams();

  useEffect(() => {
    const listFilesInFolder = async (folder_id) => {
      let token = JSON.parse(secureLocalStorage.getItem("token"));
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_BASE_URL}/file/folder/listFiles/${folder_id}`,
          {
            headers: {
              Authorization: `Bearer ${token.session.access_token}`,
            },
          }
        );
        console.log("files", response.data);

        if (response) {
          const mappedFiles = response.data.map((file) => {
            // destucture and extract dept name of every file
            try {
              const [{ depts }, ...extra] = file.file_info;
              const [{ name }, ...more] = depts;
              file.department = name;
            } catch (err) {
              // if department {depts:[]} is empty
              // console.log(err);
              file.department = "";
            }
            // console.log("department : ", file.department);

            return {
              id: file.id,
              name: file.name.substring(0, 80),
              profilePic: file.profile_pic,
              size: formatFileSize(file.metadata.size),
              dept: file.department,
              owner: file.owner_email,
              mimetype: file.metadata.mimetype,
              status: "Team",
              security: "Enhanced",
              lastUpdate: new Date(file.metadata.lastModified).toLocaleString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                }
              ),
            };
          });

          // Sort the mappedFiles array based on the lastUpdate property
          mappedFiles.sort((a, b) => {
            return new Date(b.lastUpdate) - new Date(a.lastUpdate);
          });
          setFiles(mappedFiles);
        }
      } catch (error) {
        console.log("error occured while fetching files inside folders", error);
      }
    };

    listFilesInFolder(folderId);
  }, []);

  return (
    <div className="p-4">
      {/* <button onClick={openDialog} className="">
        <img src={FolderImg} alt="" className="w-full" />
      </button> */}

      <div className="flex flex-row justify-between items-center my-2">
        {" "}
        <h2 className="text-2xl font-semibold my-2">{folderName} :</h2>
        <AddFilesInsideFolder folderId={folderId} />
      </div>

      <RecentFiles filteredData={files} />
    </div>
  );
};

export default FilesInsideFolder;