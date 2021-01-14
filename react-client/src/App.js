import React from 'react';
import axios from 'axios'
import { Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from 'reactstrap';

const endpoint = "http://localhost:8000";

class App extends React.Component {
  state = {
    cars: [],
    newCarData: {
      brand: '',
      model: '',
      price: 0,
    },
    editCarData: {
      id: '',
      brand: '',
      model: '',
      price: 0,
    },
    newCarModal: false,
    editCarModal: false,
  }

  componentDidMount() {
    this.refresCars();
  }

  toggleNewCarModal() {
    this.setState({
      newCarModal: !this.state.newCarModal
    });
  }

  toggleEditCarModal() {
    this.setState({
      editCarModal: !this.state.editCarModal
    });
  }


  addCar() {
    let url = endpoint + '/api/create/car';

    axios.post(url, this.state.newCarData).then((response) => {
      console.log(response.data);
      let {cars} = this.state;

      cars.push(response.data);
      this.setState({
        cars,
        newCarModal: false,
        newCarData: { brand: '', model: '', price: 0}
      });
    })

  }

  editCarData(id, brand, model, price) {
    this.setState({
      editCarData: { id, brand, model, price },
      editCarModal: !this.state.editCarModal
    });
  }

  updateCar() {
    let url = endpoint + '/api/update/car/' + this.state.editCarData.id;
    let { id, brand, model, price } = this.state.editCarData;

    axios.put(url, {
      id: id, brand, model, price
    }).then((response) => {
      this.refresCars();
      console.log(response);
      this.setState({ 
        editCarModal: false, 
        editCarData: { id: '', brand: '', model: '', price: 0 },
      });
    })
  }

  deleteCar(id) {
    let url = endpoint + '/api/delete/car/' + id;
    console.log(url);
    axios.delete(url).then((response) => {
      console.log(response);
      this.refresCars();
    });
  }

  refresCars() {
    axios.get(endpoint + '/api/cars').then((response) => {
      this.setState({
        cars: response.data
      })
    });
  }
  render() {
    let cars = this.state.cars.map((car) => {
      return (
        <tr key={car.id}>
          <td>{car.id}</td>
          <td>{car.brand}</td>
          <td>{car.model}</td>
          <td>{car.price}</td>
          <td>
            <Button color="success" size="sm" className="mr-2" onClick={
              this.editCarData.bind(
                this,
                car.id,
                car.brand,
                car.model,
                car.price
              )}>Edit</Button>
            <Button color="danger" size="sm" onClick={this.deleteCar.bind(this, car.id)}>Delete</Button>
          </td>
        </tr>
      )
    })
    return (
      <div className="App container">

        <h1>Cars App</h1>

        <Button className="my-3" color="primary" onClick={this.toggleNewCarModal.bind(this)}>Add Car</Button>

        <Modal isOpen={this.state.newCarModal} toggle={this.toggleNewCarModal.bind(this)}>
          <ModalHeader toggle={this.toggleNewCarModal.bind(this)}>Add a new car</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="brand">Brand</Label>
              <Input id="brand" value={this.state.newCarData.brand} onChange={(e) => {
                let { newCarData } = this.state;

                newCarData.brand = e.target.value;

                this.setState({ newCarData });
              }} />
            </FormGroup>
            <FormGroup>
              <Label for="model">Model</Label>
              <Input id="model" value={this.state.newCarData.model} onChange={(e) => {
                let { newCarData } = this.state;

                newCarData.model = e.target.value;

                this.setState({ newCarData });
              }} />
            </FormGroup>
            <FormGroup>
              <Label for="price">Price</Label>
              <Input id="price" type="number" value={this.state.newCarData.price} onChange={(e) => {
                let { newCarData } = this.state;

                newCarData.price = parseInt(e.target.value, 10);

                this.setState({ newCarData });
              }} />
            </FormGroup>


          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.addCar.bind(this)}>Add</Button>
            <Button color="danger" onClick={this.toggleNewCarModal.bind(this)}>Cancel</Button>
          </ModalFooter>
        </Modal>

        <Modal isOpen={this.state.editCarModal} toggle={this.toggleEditCarModal.bind(this)}>
          <ModalHeader toggle={this.toggleEditCarModal.bind(this)}>Edit a car</ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label for="brand">Brand</Label>
              <Input id="brand" value={this.state.editCarData.brand} onChange={(e) => {
                let { editCarData } = this.state;

                editCarData.brand = e.target.value;

                this.setState({ editCarData });
              }} />
            </FormGroup>
            <FormGroup>
              <Label for="model">Model</Label>
              <Input id="model" value={this.state.editCarData.model} onChange={(e) => {
                let { editCarData } = this.state;

                editCarData.model = e.target.value;

                this.setState({ editCarData });
              }} />
            </FormGroup>
            <FormGroup>
              <Label for="price">Price</Label>
              <Input id="price" type="number" value={this.state.editCarData.price} onChange={(e) => {
                let { editCarData } = this.state;

                editCarData.price = parseInt(e.target.value, 10);

                this.setState({ editCarData });
              }} />
            </FormGroup>


          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={this.updateCar.bind(this)}>Update</Button>
            <Button color="danger" onClick={this.toggleEditCarModal.bind(this)}>Cancel</Button>
          </ModalFooter>
        </Modal>


        <Table>
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
            {cars}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default App;
