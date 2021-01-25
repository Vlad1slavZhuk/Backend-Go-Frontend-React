import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import React from 'react';
import { carsDataChanged, getAllCars } from '../services/cars';
import { DISPLAY_CREATING_CAR_MODAL, DISPLAY_EDITING_CAR_MODAL, DISPLAY_REMOVING_CAR_MODAL } from '../constants';
import CreatingCarModal from './modals/CreatingCarModal';
import EditingCarModal from './modals/EditingCarModal';
import DeletingCarModal from './modals/RemovingCarModal';

class CarsTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cars: [],
            selectedCar: {}
        }
    }

    handleModalClose = () => {
        this.setState({ selectedCar: {} });
        this.props.onModalClose();
    };

    openCreatingModal () {        
        this.props.onDisplayModalTypeChaged(DISPLAY_CREATING_CAR_MODAL);
    }

    openEditingModal (car) {        
        this.setState({ selectedCar: car });
        this.props.onDisplayModalTypeChaged(DISPLAY_EDITING_CAR_MODAL);
    }

    openRemovingModal (car) {        
        this.setState({ selectedCar: car });
        this.props.onDisplayModalTypeChaged(DISPLAY_REMOVING_CAR_MODAL);
    }

    updateCarsTable () {
        getAllCars().then(cars => this.setState({ cars }));
    }

    getCarString (car) {
        return `${car.brand} ${car.model} ${car.price}`;
    }

    componentDidMount () {
        this.carsDataChangedSubscriber = carsDataChanged.subscribe(() => {
            this.setState({ selectedCar: {} });
            this.updateCarsTable();
        });
        this.updateCarsTable();
    }

    componentWillUnmount() {
        this.carsDataChangedSubscriber.unsubscribe();
    }

    render () {
        const {
            cars,
            selectedCar
        } = this.state;

        const {
            displayModalType
        } = this.props;

        return(
            <>
            <Container>
                <Row>
                    <Col>
                        <Button  onClick={() => this.openCreatingModal()} variant="primary" className="cars-body-adding-button">Add a new car</Button>
                        <Table striped bordered  className="cars-body-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Brand</th>
                                    <th>Model</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cars.map((car, index) => <tr key={index}>
                                    <td>{car.id}</td>
                                    <td>{car.brand}</td>
                                    <td>{car.model}</td>
                                    <td>{car.price}</td>
                                    <td>
                                        <Button onClick={() => this.openEditingModal(car)} variant="success">Edit</Button>{' '}
                                        <Button onClick={() => this.openRemovingModal(car)} variant="danger">Delete</Button>
                                    </td>
                                </tr>)}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>

            { displayModalType === DISPLAY_CREATING_CAR_MODAL && <CreatingCarModal displayModalType={displayModalType} onModalClose={this.handleModalClose}></CreatingCarModal>}
            { displayModalType === DISPLAY_EDITING_CAR_MODAL && <EditingCarModal selectedCarId={selectedCar.id} displayModalType={displayModalType} onModalClose={this.handleModalClose}></EditingCarModal>}
            { displayModalType === DISPLAY_REMOVING_CAR_MODAL && <DeletingCarModal selectedCarId={selectedCar.id} description={this.getCarString(selectedCar)} displayModalType={displayModalType} onModalClose={this.handleModalClose}></DeletingCarModal>}
            </>
        )
    }
}

export default CarsTable;