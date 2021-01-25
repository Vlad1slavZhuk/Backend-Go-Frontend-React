import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import React from 'react';
import { DISPLAY_SIGN_IN_MODAL, DISPLAY_SIGN_UP_MODAL } from '../constants';
import { logout } from '../services/account';

class Header extends React.Component {
    handleLogOut() {
        logout();
    }

    render() {
        const {
            isLoggedIn,
            onDisplayModalTypeChaged
        } = this.props;

        return (
            <Navbar bg="dark" variant="dark">
                <Container>
                    <Navbar.Brand>Cars App</Navbar.Brand>
                    <Navbar.Collapse>
                        <Nav className="mr-auto"></Nav>
                        <Nav>
                            {isLoggedIn
                                ? <Button variant="danger" className="mr-sm-2" onClick={this.handleLogOut}>Log Out</Button>
                                :
                                <>
                                    <Button variant="primary" className="mr-sm-2" onClick={() => onDisplayModalTypeChaged(DISPLAY_SIGN_UP_MODAL)}>Sign Up</Button>
                                    <Button variant="primary" className="mr-sm-2" onClick={() => onDisplayModalTypeChaged(DISPLAY_SIGN_IN_MODAL)}>Sign In</Button>
                                </>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        )
    }
}

export default Header;