import DriveBar from "./components/DriveBar";
import FileDrive from "./components/FileDrive";
import "../../scss/pages/Upload.scss";
function Files() {
  return (
    <div className="file-drive">
      <DriveBar></DriveBar>
      <div className="user-files" id="file-drop-area">
        <FileDrive/>
      </div>
    </div>
  );
}
export default Files;
