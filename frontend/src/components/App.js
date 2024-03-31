import React, {Component} from "react";
import {render} from "react-dom";
import RegisterPage from "./RegisterPage";
import LoginPage from "./LoginPage";
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path="/">
                        <p>This is the home page</p>
                    </Route>
                    <Route path="/login" component={LoginPage}/>
                    <Route path="/register" component={RegisterPage}/>
                </Switch>
            </Router>
        );
    }
}

const appDiv = document.getElementById("app");
render(<App/>, appDiv);