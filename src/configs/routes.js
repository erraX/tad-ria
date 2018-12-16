import HelloWorld from '@/components/HelloWorld'
import NotFound from '@/components/404'

export default [
    {
        path: '/',
        name: 'HelloWorld',
        component: HelloWorld
    },
    {
        path: '/404',
        name: '404',
        component: NotFound
    }
];
