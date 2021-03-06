var React = require('react');
var connect = require('react-redux').connect;
var router = require('react-router');

var actions = require('../actions/index');


var Form = require('./form');

var SignIn = React.createClass({

	componentDidMount: function(){		

		// Loads the background image
		document.getElementsByTagName('html')[0].style.backgroundImage = 'none';	
		var backCont = document.createElement('DIV');
		backCont.setAttribute('id', 'background');
		var backRoll = document.createElement('DIV');
		backRoll.setAttribute('id', 'background_roll')

		var wallpaper = backCont
		document.getElementsByClassName('signin-container')[0].appendChild(wallpaper);
		document.getElementById('background').appendChild(backRoll)
	},

	signIn: function(e){		// send out credentials for sign in
		e.preventDefault();
		var user = {
			username: document.getElementById('username-signin').value,
			password: document.getElementById('password-signin').value
		}

		this.props.dispatch(actions.getUser(user))
	},

	demo: function(e){		// Demo link credentials
		e.preventDefault();

		var user = {
			username: 'demo',
			password: '123'
		}

		this.props.dispatch(actions.getUser(user))		
	},	

	render: function(props){

		return (
			<div className='signin-container row'>
				<div className="signin col-6">
					<h1 className='signin-h1'>Sign In</h1>
					<form>
						<fieldset>
							<input id='username-signin' pattern="[a-zA-Z0-9]+" type='text' placeholder='User Name' required/>
							<input id='password-signin' pattern="[a-zA-Z0-9]+" type='password' placeholder='*********' required/>
							<input className='input-signin' type='submit' value='Sign In' onClick={this.signIn}  />
							<a href="/Demo" onClick={this.demo}><p className="demo-btn">Demo</p></a>
						</fieldset>
					</form>
				</div>
			</div>
		)
	}
})

var Container = connect()(SignIn);

module.exports = Container;