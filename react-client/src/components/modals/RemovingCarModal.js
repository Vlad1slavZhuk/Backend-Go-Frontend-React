import { Modal, Button, Alert } from 'react-bootstrap';
import React from 'react';
import { UNKNOWN_ERROR_RESPONSE_CODE, DISPLAY_REMOVING_CAR_MODAL } from '../../constants';
import { deleteCar } from '../../services/cars';

class DeletingCarModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isUnknownError: false
        };        
    }

    handleDelete = () => {
        deleteCar(this.props.selectedCarId).then(response => {
            if (response.responseCode === UNKNOWN_ERROR_RESPONSE_CODE) {
                this.setState({ isUnknownError: true });
            } else {
                this.props.onModalClose();
            }           
        });        
    }

    render() {
        const {
            isUnknownError
        } = this.state;

        const {
            displayModalType,
            onModalClose,
            description
        } = this.props;

        return (
            <Modal show={displayModalType === DISPLAY_REMOVING_CAR_MODAL} onHide={onModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete car</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Delete car <strong>{description}</strong>?
                    <Alert show={isUnknownError} variant="danger">
                        Unknown error of deleting car
                    </Alert>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="danger" onClick={this.handleDelete}>Yes</Button>
                    <Button variant="success" onClick={onModalClose}>No</Button>
                </Modal.Footer>
            </Modal>)
    }
}

export default DeletingCarModal;