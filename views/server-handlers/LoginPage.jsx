import React from 'react';
module.exports = class Loginpage extends React.Component {
	render(){
	  return (
			<div className='login-content'>
				<div id="login-box">
					<div className="login-form-spacer"></div>
					<div className="login-form">
						<div className="formy">
								<form action="/login" method="POST" id="logit">
									<div className="formelm">
										<label htmlFor="username">Username:</label>
										<input id="username" name="username" type="text" required/>
							  	</div>
									<div className="formelm">
										<label id ="plabel" htmlFor="password">Password:</label>
										<input id="password" name="password" type="password" required/>
									</div>
									<div className="formelm">
										<div className="submit-button">
											<input type="submit" value="Login"/>
									 </div>
								 </div>
								</form>
								</div>
				</div>
			</div>
		</div>
);
}}
