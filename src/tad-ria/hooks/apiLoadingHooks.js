export default store => ({
    beforeRequest(configs) {
        if (configs.loading !== false) {
            store.commit('startLoading');
        }
        return false;
    },
    afterComplete() {
        console.log('complete loading');
        store.commit('endLoading');
        return false;
    }
});
