import DriveBar from "./components/DriveBar";
import FileDrive from "./components/FileDrive";
import "../scss/Files.scss";

localStorage.setItem(
  "authToken",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiOTMwYzJhOWZjMTc0LWQ1YjEtMDJiNi01NWYxLTAwM2Q5YmUxIiwidXNlcm5hbWUiOiJkdW5lbWFzayIsImlhdCI6MTYxODQxMTUwOCwiZXhwIjoxNjIxMDAzNTA4fQ.VC7OM904sCRTFabU-qHOFFh52itO6dQIbmp93biqXDc"
);
function Files() {
  return (
    <>
      <div className="stashbar"></div>
      <div className="file-drive">
        <DriveBar></DriveBar>
        <div className="user-files" id="file-drop-area">
          <FileDrive />
        </div>
      </div>
    </>
  );
}
export default Files;
