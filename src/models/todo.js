import getRandomIntInclusive from '../utils'

export default class Todo {
    constructor(todo) {
        this.title = todo.title;
        this.id = todo?.id ? todo.id : this.newId();
        this.isDone = todo?.isDone ? todo.isDone : false;
    }

    getTodoItem(key) {
        return this[key];
    }

    markDone() {
        this.isDone = true;
    }

    markNotDone() {
        this.isDone = false;
    }

    newId() {
        return (new Date()).getTime() + getRandomIntInclusive(1, 10000);
    }
}