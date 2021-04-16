import React from "react";
import Files from "./stash/Files.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
localStorage.setItem(
  "authToken",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiOTMwYzJhOWZjMTc0LWQ1YjEtMDJiNi01NWYxLTAwM2Q5YmUxIiwidXNlcm5hbWUiOiJkdW5lbWFzayIsImlhdCI6MTYxODQxMTUwOCwiZXhwIjoxNjIxMDAzNTA4fQ.VC7OM904sCRTFabU-qHOFFh52itO6dQIbmp93biqXDc"
);
export default class App extends React.Component {
  render() {
    return (
      <div className="dunestash">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
        />
        <Files />
      </div>
    );
  }
}
