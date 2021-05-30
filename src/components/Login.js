import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import {Tabs, Tab, TabContainer} from "react-bootstrap";
import { postLoginUser } from "../services/postLoginUser";
import { postRegisterUser } from "../services/postRegisterUser";
import { refreshMetadata } from "../services/refreshMetadata";
import { getUserConfig } from "../services/getUserConfig";
// import "./Login.css";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  function validateLoginForm() {
    return email.length > 0 && password.length > 0;
  }
  function validateRegisterForm() {
    return email.length > 0 && password.length > 0 && firstName.length > 0;
  }

  function handleLogin(event) {
    event.preventDefault(); //stop the click catcher
    var loginBody = {"user": {"email": email, "password": password}};
    postLoginUser(loginBody)
        .then(response => {
            props.setUser(response);
            sessionStorage.setItem("user", JSON.stringify(response));
            refreshMetadata(response.user);
            getUserConfig(response.user)
                .then(response => {
                    props.setUserConfig(response.user);
                }
            );
        }
    );
    
  }

  function handleRegister(event) {
    event.preventDefault(); //stop the click catcher
    var registerBody = {"user": {"email": email, "password": password, "config": {"firstname": firstName, "lastname": lastName}}};
    postRegisterUser(registerBody)
        .then(response => {
            props.setUser(response);
            sessionStorage.setItem("user", JSON.stringify(response));
            refreshMetadata(response.user);
            getUserConfig(response.user)
                .then(response => {
                    props.setUserConfig(response.user);
                }
            );
        }
    );
    
  }

  return (
    <>
    <nav class="navbar-dark bg-brand position-fixed w-100 z-100 navbar navbar-expand-xl navbar-light"><div class="navbar-brand">TĀNGATA</div></nav>
    <div className="Login">
      <Tabs defaultActiveKey="login" id="loginOrRegister">
        <Tab eventKey="login" title="Login">
          <Form onSubmit={handleLogin}>
            <Form.Group size="lg" controlId="loginEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button block size="lg" type="submit" disabled={!validateLoginForm()}>
              Login
            </Button>
          </Form>
        </Tab>
        <Tab eventKey="register" title="Sign Up">
          <Form onSubmit={handleRegister}>
            <Form.Group size="lg" controlId="registerEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="registerPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="firstname">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Group>
            <Form.Group size="lg" controlId="lastname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Group>
            <Button block size="lg" type="submit" disabled={!validateRegisterForm()}>
              Sign Up
            </Button>
          </Form>
        </Tab>
      </Tabs>
      <div className="container md-3 text-center col-md-5 mt-3">
        <blockquote>
          <p>“Hutia te rito o te harakeke<br/>
          Kei whea to kōmako e kō?<br/>
          Ki mai ki ahau<br/>
          He aha te mea nui o te Ao?<br/>
          Maku e kī atu,<br/>
          <b>he tāngata, he tāngata, he tāngata</b>..."</p>
        </blockquote>
        <p>
          If the heart of the harakeke <em>(flax plant)</em> was removed,<br/>
          where would the bellbird sing?<br/>
          If I was asked what was the most important thing in the world<br/>
          I would be compelled to reply,<br/>
          it is people, it is people, it is people.<br/>
          <em>Ngaroto</em>
        </p>
        <p>
          In te ao Māori (the Māori world view), Tāngata (<em>TAHNG-uh-tuh</em>) describes something much larger than an addressed group of people: it describes <em>whakapapa</em>, the surrounding network of ancestors and descendants we are connected to.<br/>
          With this work we intend to follow these principles to put our people first: not just the data &amp; analytics engineers, but those around our workplaces that know the deep details of how our businesses actually run.<br/>
          These people are the lifeblood of what we do - and to keep moving forward, we need their context far more than ever.
        </p>
      </div>
    </div>
    </>
  );
}