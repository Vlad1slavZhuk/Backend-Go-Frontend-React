import { Modal, Button, Form, Alert } from 'react-bootstrap';
import React from 'react';
import { USERNAME_VALID_ERROR_RESPONSE_CODE, DISPLAY_SIGN_UP_MODAL, OK_RESPONSE_CODE } from '../../constants';
import { signUp } from '../../services/account';

const initialState = {
    isWaitingForResponse: false,
    isUsernameValidError: false,
    isSubmitPasswordError: false,
    username: '',
    password: '',
    submitPassword: ''
};

class SignUpModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;
    }

    handleUsernameChange = ({ target: { value } }) => this.setState({ username: value });
    handlePasswordChange = ({ target: { value } }) => this.setState({ password: value });
    handleSubmitPasswordChange = ({ target: { value } }) => this.setState({ submitPassword: value });

    handleRegister = () => {
        this.setState({
            isUsernameValidError: false,
            isSubmitPasswordError: false
        });

        if (this.state.password !== this.state.submitPassword) {
            this.setState({
                isSubmitPasswordError: true,
                password: '',
                submitPassword: ''
            });
            return;
        }

        this.setState({ isWaitingForResponse: true });
        signUp(this.state.username, this.state.password).then(({ responseCode }) => {
            switch (responseCode) {
                case OK_RESPONSE_CODE:
                    this.closeModal();
                    break;

                case USERNAME_VALID_ERROR_RESPONSE_CODE:
                    this.setState({ isUsernameValidError: true, isWaitingForResponse: false });
                    break;

                default:
                    break;
            }
        });
    }

    closeModal() {
        this.props.onModalClose();
        this.setState(initialState);
    }

    render() {
        const {
            isWaitingForResponse,
            isUsernameValidError,
            isSubmitPasswordError
        } = this.state;

        const {
            displayModalType
        } = this.props;

        return (
            <Modal show={displayModalType === DISPLAY_SIGN_UP_MODAL} onHide={this.closeModal.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Sign Up</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group controlId="username">
                            <Form.Label>Username</Form.Label>
                            <Form.Control type="text" onChange={this.handleUsernameChange} />
                        </Form.Group>

                        <Form.Group controlId="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" onChange={this.handlePasswordChange} />
                        </Form.Group>

                        <Form.Group controlId="submitPassword">
                            <Form.Label>Submit password</Form.Label>
                            <Form.Control type="password" onChange={this.handleSubmitPasswordChange} />
                        </Form.Group>
                    </Form>
                    <Alert show={isWaitingForResponse} variant="primary">
                        Account is registering, please wait
                    </Alert>
                    <Alert show={isSubmitPasswordError} variant="danger">
                        Submit password is wrong
                    </Alert>
                    <Alert show={isUsernameValidError} variant="danger">
                        Username is invalid
                    </Alert>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleRegister} disabled={isWaitingForResponse}>Login</Button>
                </Modal.Footer>
            </Modal>
        )
    }
}

export default SignUpModal;