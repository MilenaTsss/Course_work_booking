import React, {Component} from "react";
import {render} from "react-dom";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <Routes>
                    <Route exact path="/" element={<h1>This is the home page</h1>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterPage/>}/>
                </Routes>
            </Router>
        );
    }
}

const appDiv = document.getElementById("app");
render(<App/>, appDiv);