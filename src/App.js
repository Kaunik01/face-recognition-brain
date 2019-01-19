import React, { Component } from 'react';
import Navigation from './Components/Navigation/Navigation';
import Logo from './Components/Logo/Logo';
import Rank from './Components/Rank/Rank';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import SignIn from './Components/SignIn/SignIn';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import './App.css';
import Register from './Components/Register/Register';

const particleOptions = {
  particles: {
    number: {
      value:100,
      density: {
        enbale: true,
        value_area:1000
      }
    }
  }
}

const app = new Clarifai.App({
  apiKey: '9ba15125ce3d4773b2573a4b11a19e57'
});

const initialState ={
  input:'',
      imageurl:'',
      box:{},
      route: 'signin',
      isSignedIn: false,
      user: {
        id:'',
        name:'',
        email: '',
        entries:0,
        joined: ''
      }
}
class App extends Component {
  constructor() {
    super();
    this.state = {
      input:'',
      imageurl:'',
      box:{},
      route: 'signin',
      isSignedIn: false,
      user: {
        id:'',
        name:'',
        email: '',
        entries:0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
        id:data.id,
        name:data.name,
        email:data.email,
        entries:data.entries,
        joined:data.joined
        } 
    })
  }

  componentDidMount(){
    fetch('http://localhost:4000')
      .then(response => response.json())
  }

  calculateFaceLocation = (data) => {
    const face = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = image.width;
    console.log(width);
    const height=image.height;
    console.log(height);
    return {
      leftCol: face.left_col * width,
      topRow: face.top_row * height,
      rightCol: width- (face.left_col * width),
      bottomRow: height-(face.top_row * height)
    }
  }



  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageurl:this.state.input});
    app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
    .then(response =>{
      if(response){
        fetch('http://localhost:4000/image',{
          method:'put',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user,{entries: count}))
            })
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout'){
      this.setState(initialState)
    }else if(route === 'home'){
      this.setState({isSignedIn:true})
    }
    this.setState({route: route});
  }

  render() {
    return (
      <div className="App">
        <Particles className='particles'
              params={particleOptions}
            />
        { this.state.route === 'home' 
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries={this.state.user.entries} />
              <Navigation onRouteChange={this.onRouteChange}/>
              <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition box={this.state.box} imageurl={this.state.imageurl}/>
            </div>
          : ( this.state.route  === 'signin' 
            ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>  
            : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />)
          }
      </div>
    );
  }
}

export default App;
