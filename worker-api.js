export const window = {
    location: location
};

export function receiveOrders(callback) {
    onmessage = (e) => {
        if (!e.data.internal) {
            callback(e);
            return;
        }
        switch (e.data.internal.action) {
            case 'close':
                close();
                break;
        }
    }
}

export function sendBack(data) {
    postMessage({
        multiJS: true,
        message: data
    });
}
