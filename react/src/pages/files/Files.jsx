import DriveBar from "./components/DriveBar";
import FileDrive from "./components/FileDrive";
import "../../scss/pages/Upload.scss";

/*localStorage.setItem(
  "authToken",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNzM5YTlkY2UtYjA4Yy00NmY5LTg1OTUtY2M4ZjVhYWUyODQ4IiwidXNlcm5hbWUiOiJkdW5lbWFzayIsImlhdCI6MTYxODMzNzExOSwiZXhwIjoxNjIwOTI5MTE5fQ.qjc_dDefBbh9z2uJ9UVeBZEuTlEBN2F1yqzGr162hGw"
);*/
function Files() {
  return (
    <div className="file-drive">
      <DriveBar></DriveBar>
      <div className="user-files" id="file-drop-area">
        <FileDrive />
      </div>
    </div>
  );
}
export default Files;
