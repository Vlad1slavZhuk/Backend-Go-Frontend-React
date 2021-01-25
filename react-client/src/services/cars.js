import axios from "axios";
import { Subject } from "rxjs";
import { OK_RESPONSE_CODE, UNKNOWN_ERROR_RESPONSE_CODE, INVALID_ID_ERROR_RESPONSE_CODE } from "../constants";

const baseUrl = 'http://localhost:8000';

const carsDataChangedSubject = new Subject();

export const carsDataChanged = carsDataChangedSubject.asObservable();

export async function getAllCars() {
    let cars = [];
    try {
        const result = await axios.get(baseUrl+'/api/cars', {
            headers: {
                'Token': `${localStorage.getItem('Token')}`
            }
        });
        cars = result.data;
    } catch(error) {
        console.log(error);
    }
    
    return cars;
}

export async function getCarById(id) {
    let car = {};
    try {
        const result = await axios.get(`${baseUrl}/api/car/${id}`, {
            headers: {
                'Token': `${localStorage.getItem('Token')}`
            }
        });  
        car = result.data;
    } catch(error) {
        console.log(error);
    }

    const responseCode = car.id !== undefined ? OK_RESPONSE_CODE : INVALID_ID_ERROR_RESPONSE_CODE;

    return { responseCode, car }
}

export async function createCar(carToCreate) {
    try {
        await axios.post(`${ baseUrl }/api/car`, carToCreate, {
            headers: {
                'Token': `${localStorage.getItem('Token')}`
            }
        });

        carsDataChangedSubject.next();
        return { responseCode: OK_RESPONSE_CODE };
    } catch(error) {
        console.log(error);
        return { responseCode: UNKNOWN_ERROR_RESPONSE_CODE };
    }
    
    
}

export async function updateCar(carToUpdate) {
    try {
        await axios.put(`${ baseUrl }/api/car/${carToUpdate.id}`, carToUpdate, { // чувствую себя старым...
            headers: {
                'Token': `${localStorage.getItem('Token')}`
            }
        });

        carsDataChangedSubject.next();
        return { responseCode: OK_RESPONSE_CODE };
    } catch(error) {
        console.log(error);
        return { responseCode: UNKNOWN_ERROR_RESPONSE_CODE };
    }
}

export async function deleteCar(carIdToDelete) {
    try {
        await axios.delete(`${ baseUrl }/api/car/${ carIdToDelete }`, { // тут id? Так.
            headers: {
                'Token': `${localStorage.getItem('Token')}`
            }
        });

        carsDataChangedSubject.next();
        return { responseCode: OK_RESPONSE_CODE };
    } catch(error) {
        console.log(error);
        return { responseCode: UNKNOWN_ERROR_RESPONSE_CODE };
    }
}