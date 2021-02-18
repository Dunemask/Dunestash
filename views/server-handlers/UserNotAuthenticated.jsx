import React from 'react';
import Navbar from '../components/Navbar';
const title="Permission Error";
module.exports = class UserNotAuthenticatedPage extends React.Component{
  render(){
    return (
    <div classname='not-authenticated-content'>
      <h1>You do not have permission to access this!</h1>
      <form action="/logout" method="POST" id="logit">
        <input type="submit" value="Logout"></input>
      </form>
    </div>
  );
  }

}
