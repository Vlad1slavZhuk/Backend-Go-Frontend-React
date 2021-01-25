import { Modal, Button, Form, Alert } from 'react-bootstrap';
import React from 'react';
import {
    OK_RESPONSE_CODE,
    UNKNOWN_ERROR_RESPONSE_CODE,
    INVALID_ID_ERROR_RESPONSE_CODE,
    DISPLAY_EDITING_CAR_MODAL } from '../../constants';
import { getCarById, updateCar } from '../../services/cars';

const initialState = {
    isUnknownError: false,
    isWrongPrice: false,
    isWaitingForRequest: false,
    isWaitingForResponse: false,
    isInvalidIdError: false,
    brand: '',
    model: '',
    price: 0
};

class EditingCarModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = initialState;
    }

    handleBrandChange = ({ target: { value } }) => this.setState({ brand: value });
    handleModelChange = ({ target: { value } }) => this.setState({ model: value });
    handlePriceChange = ({ target: { value } }) => this.setState({ price: value });
    handleSave = () => {
        const priceNumber = +this.state.price;
        /*eslint-disable */
        if (this.state.price != priceNumber) { 
            this.setState({ isWrongPrice: true });
            return;
        }
        /*eslint-enable */
        this.setState({ isWaitingForResponse: true, isWrongPrice: false });

        const car = {
            id: this.props.selectedCarId,
            brand: this.state.brand,
            model: this.state.model,
            price: priceNumber
        };

        updateCar(car).then(response => {
            if (response.responseCode === UNKNOWN_ERROR_RESPONSE_CODE) {
                this.setState({ isUnknownError: true });
            } else {
                this.closeModal();
            }           
        });
    };

    closeModal() {
        this.props.onModalClose();
    }

    componentDidMount() {
        this.setState({ isWaitingForRequest: true });
        getCarById(this.props.selectedCarId).then(response => {
            switch (response.responseCode) {
                case OK_RESPONSE_CODE:
                    this.setState({
                        isWaitingForRequest: false,
                        brand: response.car.brand,
                        model: response.car.model,
                        price: response.car.price
                    });
                    break;

                case INVALID_ID_ERROR_RESPONSE_CODE:
                    this.setState({
                        isWaitingForRequest: false,
                        isInvalidIdError: true
                    });
                    break;

                default:
                    break;
            }
        });
    }

    render() {
        const {
            isUnknownError,
            isWrongPrice,
            isWaitingForResponse,
            isInvalidIdError,
            brand,
            model,
            price
        } = this.state;

        const {
            displayModalType
        } = this.props;

        return (
            <Modal show={displayModalType === DISPLAY_EDITING_CAR_MODAL} onHide={this.closeModal.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit car</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {isInvalidIdError
                        ? <p>Car is not found from server, please refresh browser</p>
                        : <>
                        <Form>
                            <Form.Group controlId="brand">
                                <Form.Label>Brand</Form.Label>
                                <Form.Control type="text" value={brand} onChange={this.handleBrandChange} />
                            </Form.Group>

                            <Form.Group controlId="model">
                                <Form.Label>Model</Form.Label>
                                <Form.Control type="text" value={model} onChange={this.handleModelChange} />
                            </Form.Group>

                            <Form.Group controlId="price">
                                <Form.Label>Price</Form.Label>
                                <Form.Control type="price" value={price} onChange={this.handlePriceChange} />
                            </Form.Group>
                        </Form>
                        <Alert show={isWaitingForResponse} variant="primary">
                            Car is saving, please wait
                        </Alert>
                        <Alert show={isUnknownError} variant="danger">
                            Unknown error of editing car
                        </Alert>
                        <Alert show={isWrongPrice} variant="danger">
                            Price is wrong, it should be number
                        </Alert>
                        </>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleSave} disabled={isWaitingForResponse}>Save</Button>
                </Modal.Footer>
            </Modal>)
    }
}

export default EditingCarModal;