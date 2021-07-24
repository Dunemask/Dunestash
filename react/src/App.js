//Module Imports
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//Local Imports
import Stash from "./Stash";
//Constants
localStorage.setItem(
  "authToken",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiNGJiMDE4ZWUxYWJhLTE0NjYtMDc3Ni04M2RlLTE0ZWFkYmUxIiwiaWF0IjoxNjI1MTk1ODg2LCJleHAiOjE2Mjc3ODc4ODZ9.wU7F8ykFMJWznxB3MLpZjaQxUtyL7gFf3SlKr6V_P2o"
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
