import React, {Component} from "react";
import {render} from "react-dom";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import LoginPage from "./LoginPage";
import RegisterCustomerPage from "./RegisterCustomerPage";
import RegisterAdminPage from "./RegisterAdminPage";

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <Routes>
                    <Route path="/" element={<p>This is the home page</p>}/>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/register" element={<RegisterCustomerPage/>}/>
                    <Route path="/register/admin" element={<RegisterAdminPage/>}/>
                </Routes>
            </Router>
        );
    }
}

const appDiv = document.getElementById("app");
render(<App/>, appDiv);