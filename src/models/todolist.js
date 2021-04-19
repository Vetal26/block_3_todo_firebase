import {db} from '../utils/firebase';
import Todo from './todo';

let todosId = [];

export default class TodoList {
    constructor() {
        this.todos = [];
    }

    getTodoList() {
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

        await db.collection('todoListId').doc('todosId').get().then((doc) => {
            if (doc.data().ids) {
                todosId = doc.data().ids;
            }
        });

        this.todos.sort((a,b) => {
            return todosId.indexOf(a.id) - todosId.indexOf(b.id);
        })
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
        todosId.push(todo.id);

        await db.collection('todoListId').doc('todosId').update({ids: todosId})
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
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
        this.updateListIds();
        return todo;
    }

    async toggleAll(bool) {
        let batch = db.batch();

        for (let todo of this.todos) {
            let td = db.collection('todos').doc(todo.getTodoItem('id'));
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
        for (let todo of this.getTodoList().filter(todo => todo.getTodoItem('isDone') === true)) {
            let td = db.collection('todos').doc(todo.id);
            batch.delete(td);
        }

        await batch.commit().then(() => {
            console.log("Documents successfully deleted!");
        }).catch((error) => {
            console.error("Error removing documents: ", error);
        });

        this.todos = this.getTodoList().filter((todo) => todo.getTodoItem('isDone') === false);
        this.updateListIds();
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
          return this.getTodoList().filter((todo) => todo.getTodoItem('isDone') === false);
        }
        if (filter === 'completed') {
          return this.getTodoList().filter((todo) => todo.getTodoItem('isDone') === true);
        }
        if (filter === 'all'){
            return this.getTodoList();
        }
    }

    async updateList(currentTodoId, prevTodoId) {
        let currentTodoIdx = this.todos.findIndex(t => t.id === currentTodoId);
        let currentTodo = this.todos.splice(currentTodoIdx, 1);

        if (prevTodoId) {
            let prevTodoIdx = this.todos.findIndex(t => t.id === prevTodoId);
            this.todos.splice(prevTodoIdx + 1, 0, currentTodo[0]);
        } else if (!prevTodoId) {
            this.todos.unshift(currentTodo[0]);
        }
        this.updateListIds();
    }

    async updateListIds() {
        todosId = [];

        for (let todo of this.getTodoList()) {
            todosId.push(todo.getTodoItem('id'));
        }
        await db.collection('todoListId').doc('todosId').update({ids: todosId})
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
    }
}