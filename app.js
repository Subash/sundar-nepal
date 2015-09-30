import React, { Component } from 'react';
import 'whatwg-fetch';
import * as util from './util.js';
import 'babel/polyfill';

class App extends Component {

  constructor(...args) {
    super(...args);

    this.state = {};
    this.state.error = false;
    this.state.userImageUrl = null;
    this.state.loggedIn = false;
    this.state.userDetails = {};

    this.generateImage = this.generateImage.bind(this);
    this.onError = this.onError.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.postToFacebook = this.postToFacebook.bind(this);
    this.requestPublishPermissions = this.requestPublishPermissions.bind(this);
  }

  generateImage() {
    this.state.userImageUrl = null;
    this.state.error = false;
    const profileImageUrl = encodeURIComponent(`https://graph.facebook.com/${this.state.userDetails.userID}/picture?width=800&height=800`);
    util.mergeImages(`/proxy-image-app-np?url=${profileImageUrl}&rand=${Math.random()}`, 'flag.png')
      .then((image) => {
        this.state.userImageUrl = image;
        this.setState(this.state);
      })
      .catch(this.onError);
  }

  componentWillMount() {
    FB.init({
      appId      : '519129691585992',
      xfbml      : true,
      version    : 'v2.4'
    });
  }

  onError(err) {
    console.log(err);
    this.state.error = err.message;
    this.setState(this.state);
  }

  postToFacebook() {
    this.requestPublishPermissions()
    .then(() => {
      util.postToFacebook({
        accessToken: this.state.userDetails.accessToken,
        image: util.dataURItoBlob(this.state.userImageUrl),
        message: 'Get your pic with Nepalese flag from http://sundar-nepal.subash.me',
        userID: this.state.userDetails.userID
      }).then(() => {
        alert('Posted Successfully');
      }).catch(this.onError);
    })
    .catch(this.onError)
  }

  requestPublishPermissions() {
    return new Promise((resolve, reject) => {
      FB.login((response) => {
        if (response.authResponse) {
          this.state.userDetails = {
            userID : response.authResponse.userID,
            accessToken: response.authResponse.accessToken
          };
          resolve();
        } else {
          reject(new Error('Failed to request permission'));
        }
      }, { scope: 'publish_actions'});
    });
  }

  onLogin(details) {
    this.state.userDetails = details;
    this.state.loggedIn = true;
    this.generateImage();
    this.setState(this.state);
  }

  render() {
    const userImageUrl = this.state.userImageUrl;
    const error = this.state.error;
    const loggedIn = this.state.loggedIn;
    const defaultImageUrl = 'default.jpg';
    let imageBoxContent = null;

    if(error) {
      imageBoxContent = (
        <div>
          <div className="alert alert-danger">{error.length ? error : 'An error occurred.'}</div>
          <Login onLogin={this.onLogin}/>
        </div>
      );
    } else if(!loggedIn){
      imageBoxContent = <Login onLogin={this.onLogin}/>;
    }  else if(loggedIn && !userImageUrl){
      imageBoxContent = (
        <div className="loading">Please Wait</div>
      );
    } else {
      imageBoxContent = (
        <div className="post">
          <a className="btn btn-default" href={userImageUrl} download="profile-nepal.jpg">Download</a>
        </div>
      );
    }

    return (
      <div className="container">
        <ImageBox src={userImageUrl || defaultImageUrl}>{imageBoxContent}</ImageBox>
        <div className="social">
          <iframe src="https://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fsundar-nepal.subash.me&amp;send=false&amp;layout=button_count&amp;width=120&amp;show_faces=false&amp;font&amp;colorscheme=light&amp;action=like&amp;height=21" scrolling="no" frameBorder="0" style={{ border: 'none', overflow: 'hidden', width: 100, height: 21 }} allowTransparency="true"></iframe>
        </div>
        <div className="alert alert-info footer-info">
          <ul>
            <li>Made by, <a href="http://twitter.com/sbspk"><i className="fa fa-twitter"></i> @sbspk</a>, <a href="https://facebook.com/return.undefined"><i className="fa fa-facebook"></i> Subash Pathak</a></li>
            <li>Tested only in latest version of Chrome and Firefox. </li>
            <li>Code for this app is available on <a href="https://github.com/Subash/Sundar-Nepal" target="_blank">Github</a> </li>
          </ul>
        </div>
      </div>
    )
  }
}

class ImageBox extends Component {
  render() {
    return (
      <div className="ImageBox">
        <div className="ImageBox__image">
          <img src={this.props.src} width="500" height="500"/>
        </div>
        <div className="ImageBox__inner">{this.props.children}</div>
      </div>
    )
  }
}

class Login extends Component {

  login() {
    FB.login((response) => {
      if (response.authResponse) {
        this.props.onLogin({
          userID : response.authResponse.userID,
          accessToken: response.authResponse.accessToken
        });
      } else {
        console.log('Not Logged In');
      }
    });
  }

  checkLogin() {
    FB.getLoginStatus( (response)=> {
      if(response.status === 'connected') {
        this.props.onLogin({
          userID : response.authResponse.userID,
          accessToken: response.authResponse.accessToken
        });
      } else {
        this.login();
      }
    });
  }

  render() {
    return (
      <div>
        <button onClick={this.checkLogin.bind(this)} className="btn btn-default">Create from Facebook</button>
        {' '}
        <a href="http://images.janaklabs.com" className="btn btn-default">Upload</a>
      </div>
    )
  }
}

React.render(<App />, document.getElementById('app'));
