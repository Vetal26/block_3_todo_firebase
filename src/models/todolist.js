import {db} from '../firebase';
import {config} from '../config';
import Todo from './todo';

export default class TodoList {
    constructor() {
        this.todos = [];
    }

    get todoList() {
        return this.todos;
    }

    async todoFromFirebase() {
        await db.collection('todos').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let todo = {
                    id: doc.id,
                    ...doc.data()
                }
                this.todos.push(new Todo(todo));
            });
        });
    }

    async addTodo(title) {
        let todo = {
            title,
            isDone: false
        }
        await db.collection('todos').add(todo)
        .then((docRef) => todo.id = docRef.id)
        .catch((error) => {
            console.error("Error adding document: ", error);
        });
        todo = new Todo(todo);
        this.todos.push(todo);
        return todo;
    }

    async removeTodo(id) {
        let todoIdx = this.todos.findIndex(t => t.id === id);
        if (todoIdx === -1) {
            console.log('Nothing to remove!');
            return;
        }
        
        await db.collection('todos').doc(id).delete().then(() => {
            console.log("Document successfully deleted!");
        }).catch((error) => {
            console.error("Error removing document: ", error);
        });
 
        let todo = this.todos[todoIdx];
        this.todos = [...this.todos.slice(0, todoIdx), ...this.todos.slice(todoIdx + 1)];
        return todo;
    }

    async toggleAll(bool) {
        let batch = db.batch();

        for (let todo of this.todos) {
            let td = db.collection('todos').doc(todo.id);
            batch.update(td, { isDone: bool});
        }

        await batch.commit().then(() => {
            console.log("Documents successfully updated!");
        }).catch((error) => {
            console.error("Error updating documents: ", error);
        });

        if (bool) {
            for (let todo of this.todos) {
                todo.markDone();
            }
        } else {
            for (let todo of this.todos) {
                todo.markNotDone();
            }
        }
    }

    async removeCopleted() {
        let batch = db.batch();

        for (let todo of this.getCompletedTodo()) {
            let td = db.collection('todos').doc(todo.id);
            batch.delete(td);
        }

        await batch.commit().then(() => {
            console.log("Documents successfully deleted!");
        }).catch((error) => {
            console.error("Error removing documents: ", error);
        });

        this.todos = this.getActiveTodo();
    }

    async toggleTodo(id) {
        let todoIdx = this.todos.findIndex(t => t.id === id);
        
        await db.collection('todos').doc(id).update({
            isDone: !this.todos[todoIdx].getTodoItem('isDone')
        })
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });

        if (this.todos[todoIdx].isDone) {
            this.todos[todoIdx].markNotDone();
        } else {
            this.todos[todoIdx].markDone();
        }
    }

    filterTodos(filter) {
        if (filter === 'active') {
          return this.getActiveTodo();
        }
        if (filter === 'completed') {
          return this.getCompletedTodo();
        }
        return this.todoList;
    }
    
    getCompletedTodo() {
        return this.todoList.filter((todo) => todo.isDone === true);
    }
    
    getActiveTodo() {
        return this.todoList.filter((todo) => todo.isDone === false);
    }

    async updateList(currentTodoId, prevTodoId) {

        let currentTodoIdx = this.todos.findIndex(t => t.id === currentTodoId);
        let currentTodo = this.todos.splice(currentTodoIdx, 1);
        console.log(currentTodo)
        if (prevTodoId) {
            let prevTodoIdx = this.todos.findIndex(t => t.id === prevTodoId);
            console.log(prevTodoIdx);
            this.todos.splice(prevTodoIdx + 1, 0, currentTodo[0]);
        } else if (!prevTodoId) {
            this.todos.unshift(currentTodo[0]);
        }
    }
}