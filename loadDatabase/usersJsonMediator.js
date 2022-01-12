import SuperJsonMediator from './superJsonMediator'
import usersModel from '../models/usersModel'

export default class UsersJsonMediator extends SuperJsonMediator {

    constructor() {
        super();
        this.equilFields = ['login', 'email'];
        this.model = usersModel;
    }

    //processJson from parent class
    processJson(json) {
        return new Promise((resolve) => { resolve(json) })
    }
}