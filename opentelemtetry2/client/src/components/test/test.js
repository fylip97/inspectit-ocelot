import React, { Component } from 'react';
import axios from 'axios';
//import { monkeyTest2 } from './monkeyPatching';
//import { monkeyTest} from './monkeyPatching';
import { monkeyTest3 } from './monkeyPatching';
import { monkeyTest4} from './monkeyPatching';
import { testWebtracer } from './setup';



//monkeyTest();
//monkeyTest2();
//monkeyTest3();
monkeyTest4();

class Test extends Component {

  render() {
    return (
      <div>
        <h1>Hello World3</h1>
        <button onClick={this.click}>make GET</button>
        <button onClick={this.click2}>make POST</button>
        <button onClick={this.click3}>test webTracer</button>
      </div>
    );
  }

  click() {

    /* ************************** AXIOS ***************************************************
    *********************************************************************************** */
    /*
    axios.get(`http://localhost:5000/getTest`)
      .then(res => {
        console.log(res.data);
      })
  */

    fetch('http://localhost:5000/getTest',{
      mode:"no-cors",
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        console.log(res);
      })
  }

  click2() {
    axios.post('http://localhost:5000/postTest', {
      firstName: "Hello",
      secondName: "World"
    })
      .then((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }

  click3() {
    testWebtracer();

  }


}

export default Test;
