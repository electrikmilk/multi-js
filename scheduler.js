import {receiveOrders, sendBack} from "worker-api.js";
import {JSONfn} from 'jsonfn';

if (!"scheduler" in self) {
    throw new Error('[multi-js] Scheduler is not supported!');
}

receiveOrders((e) => {
    if (!e.data.action) {
        console.error('[multi-js]', '[Scheduler]', 'Invalid data received: ', e.data);
        return;
    }
    const action = e.data.action;
    switch (action) {
        case 'task':
            let task = JSONfn.parse(e.data.task);
            task = task.replace('()', `function task${e.data.id}()`);
            task = task.replace('=>', '');
            task += `\ntask${e.data.id}();`;
            const taskFunction = new Function(task);
            let scheduledTask = scheduler.postTask(
                taskFunction,
                {priority: e.data.priority}
            ).then((result) => {
                sendBack({message: result, id: e.data.id});
            });
            console.log('[multi-js]', '[Scheduler]', 'Started task.', scheduledTask);
    }
});