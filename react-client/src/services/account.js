import axios from "axios";
import { Subject } from "rxjs";
import {
    OK_RESPONSE_CODE,
    UNKNOWN_ERROR_RESPONSE_CODE,
    AUTHENTICATION_ERROR_RESPONSE_CODE,
    USERNAME_VALID_ERROR_RESPONSE_CODE } from "../constants";

const PROBLEM_REGISTER_STATUS = 'NO';
const baseUrl = 'http://localhost:8000';

const isLoggedInChangedSubject = new Subject();

export const isLoggedInChanged = isLoggedInChangedSubject.asObservable();

export async function signIn(username, password) {
    let responseCode = OK_RESPONSE_CODE;
    let token = '';
    try {
        const response = await axios.post(baseUrl + "/signin", { username, password });
        token = response.data;
        if (token === '') {
            responseCode = AUTHENTICATION_ERROR_RESPONSE_CODE;
        } else {
            responseCode = OK_RESPONSE_CODE;
        }
    } catch (error) {
        console.log(error);
        responseCode = AUTHENTICATION_ERROR_RESPONSE_CODE;
    }
    
    if (responseCode === OK_RESPONSE_CODE) {
        localStorage.setItem('Token', token);
        isLoggedInChangedSubject.next(true);
    }
    return { responseCode, token };
}

export async function signUp(username, password) {  
    let responseCode = OK_RESPONSE_CODE;
    let status = PROBLEM_REGISTER_STATUS;
    try {
        const response = await axios.post(baseUrl + "/signup", { username, password });
        const status = response.data;
        if (status === PROBLEM_REGISTER_STATUS) {
            responseCode = AUTHENTICATION_ERROR_RESPONSE_CODE;
        } else {
            responseCode = OK_RESPONSE_CODE;
        }
    } catch(error) {
        console.log(error);
        responseCode = USERNAME_VALID_ERROR_RESPONSE_CODE;
    }
    return { responseCode, status };
}

export async function logout() {
    let responseCode = OK_RESPONSE_CODE;
    try {
        await axios.post(`${baseUrl}/logout`, {}, {
            headers: {
                'Token': `${localStorage.getItem('Token')}`
            }
        });    
        if (responseCode === OK_RESPONSE_CODE) {
            localStorage.removeItem('Token');
            isLoggedInChangedSubject.next(false);
        }
    } catch(error) {
        console.log(error);
        responseCode = UNKNOWN_ERROR_RESPONSE_CODE;
    }

    return { responseCode };
}