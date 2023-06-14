'use strict';

import {JSONfn} from "jsonfn";

let tasks = 0;

export class Thread {
    constructor(task, errorCallback, priority = 'background') {
        tasks++
        let scheduler = new Arbeiter('task-' + tasks, new URL('scheduler.js', import.meta.url));
        let taskString = JSONfn.stringify(task);
        return new Promise((resolve) => {
            scheduler.send({
                id: tasks,
                action: 'task',
                priority: priority,
                task: taskString
            });
            scheduler.receive((data) => {
                resolve(data);
            })
            scheduler.handleErrors(errorCallback)
        })
    }
}

class Arbeiter {
    constructor(name, path, type = 'module') {
        if (!window.Worker) {
            log.error('Web workers are not supported by this browser.');
            return;
        }
        this.name = name;
        this.path = path;
        this.type = type;
        this.worker = new Worker(this.path, {name: this.name, type: this.type});
        log.info(`Dispatched worker "${this.name}" (${this.path}) of type "${this.type}".`);
    }

    send(data) {
        this.worker.postMessage(data);
    }

    receive(callback) {
        this.worker.onmessage = (e) => {
            let data = e.data;
            if (!e.data.multiJS) {
                log.warning(`Worker "${this.name}" (${this.path}) does not appear to be using the worker API. Features of this API will be unavailable for this worker.`);
                this.stop();
            }
            if (e.data.message) {
                data = e.data.message;
            }
            callback(data);
        };
    }

    handleErrors(callback) {
        this.worker.onmessageerror = callback;
        this.worker.onerror = callback;
    }

    stop() {
        this.send({
            internal: {
                action: 'close'
            }
        });
        this.worker.terminate();
        log.info(`Stopped worker "${this.name}" (${this.path})`);
        delete this;
    }
}

const log = {
    message: (message, type) => {
        message = '[multi-js]: ' + message
        switch (type) {
            case 'info':
                console.info(message);
                break;
            case 'warning':
                console.warn(message);
                break;
            case 'error':
                console.error(message);
                break;
            default:
                console.log(message);
        }
    },
    info: (...message) => {
        log.message(...message, 'info')
    },
    error: (...message) => {
        log.message(...message, 'error');
    },
    warning: (...message) => {
        log.message(...message, 'warning');
    }
};
