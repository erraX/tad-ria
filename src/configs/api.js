export const api = {
  getUser: 'POST|/user/get'
};

export const apiHooks = {
    afterCreateAxios(...args) {
        console.log('afterCreateAxios', args);
    },
    afterCreateApi: [
        api => {
            console.log('afterCreateApi1', api);
            return 'hahaha';
        },
        (api, prev) => {
            console.log('afterCreateApi2', api);
            console.log('prev', prev);
        }
    ],
    beforeRequest(...args) {
        console.log('beforeRequest', args);
    },
    afterFailure(...args) {
        console.log('afterFailure', args);
    },
    afterResponse(...args) {
        console.log('afterResponse', args);
    },
    afterSuccess(...args) {
        console.log('afterSuccess', args);
    }
};
