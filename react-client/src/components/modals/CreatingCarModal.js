import { Modal, Button, Form, Alert } from 'react-bootstrap';
import React from 'react';
import { DISPLAY_CREATING_CAR_MODAL, UNKNOWN_ERROR_RESPONSE_CODE } from '../../constants';
import { createCar } from '../../services/cars';

const initialState = {
    isEmptyData: false,
    isUnknownError: false,
    isWaitingForResponse: false,
    isWrongPrice: false,
    brand: '',
    model: '',
    price: 0
};

class CreatingCarModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = initialState;
    }

    handleBrandChange = ({ target: { value } }) => this.setState({ brand: value });
    handleModelChange = ({ target: { value } }) => this.setState({ model: value });
    handlePriceChange = ({ target: { value } }) => this.setState({ price: value });
    handleCreate = () => {
        if (this.state.brand.length === 0 || this.state.model.length === 0) {
            this.setState({ isEmptyData: true });
            return;
        }
        const priceNumber = +this.state.price;
        /* eslint-disable */
        if (this.state.price != priceNumber) { 
            this.setState({ isWrongPrice: true });
            return;
        }
        /*eslint-enable */
        this.setState({ isWaitingForResponse: true, isWrongPrice: false });

        const car = {
            brand: this.state.brand,
            model: this.state.model,
            price: priceNumber
        };

        createCar(car).then(response => {
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

    render() {
        const {
            isEmptyData,
            isUnknownError,
            isWrongPrice,
            isWaitingForResponse,
            brand,
            model,
            price
        } = this.state;

        const {
            displayModalType
        } = this.props;

        return (
            <Modal show={displayModalType === DISPLAY_CREATING_CAR_MODAL} onHide={this.closeModal.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create car</Modal.Title>
                </Modal.Header>

                <Modal.Body>
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
                        Car is creating, please wait
                    </Alert>
                    <Alert show={isUnknownError} variant="danger">
                        Unknown error of creating car
                    </Alert>
                    <Alert show={isWrongPrice} variant="danger">
                        Price is wrong, it should be number
                    </Alert>
                    <Alert show={isEmptyData} variant="danger">
                        Empty values
                    </Alert>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="primary" onClick={this.handleCreate} disabled={isWaitingForResponse}>Create</Button>
                </Modal.Footer>
            </Modal>)
    }
}

export default CreatingCarModal;