//Module Imports
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//Local Imports
import Stash from "./Stash";
//Constants
localStorage.setItem(
  "authToken",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiOTMwYzJhOWZjMTc0LWQ1YjEtMDJiNi01NWYxLTAwM2Q5YmUxIiwidXNlcm5hbWUiOiJkdW5lbWFzayIsImlhdCI6MTYxODQxMTUwOCwiZXhwIjoxNjIxMDAzNTA4fQ.VC7OM904sCRTFabU-qHOFFh52itO6dQIbmp93biqXDc"
);
class App extends React.Component {
  render() {
    return (
      <>
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
        <Stash />
      </>
    );
  }
}

export default App;
