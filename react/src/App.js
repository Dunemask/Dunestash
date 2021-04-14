import React from "react";
import Files from "./stash/Files.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
