import React, { Component } from 'react';
import './App.css';
import Test from './components/test/test';

class App extends Component {

  render() {
    return (
      <div className="App">
        <h1>Hello World</h1>
        <Test />
      </div>
    );
  }
}

export default App;
