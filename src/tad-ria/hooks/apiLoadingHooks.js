export default {
    beforeRequest() {
        console.log('loading...');
        return false;
    },
    afterComplete() {
        console.log('complete loading');
        return false;
    }
};
