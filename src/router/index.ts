import { createRouter, createWebHistory } from 'vue-router'
// create async configureRouter
export async function configureRouter(idsrvAuth) {
  const routes = [
    {
      path: '/',
      name: 'Main',
      meta: { authName: idsrvAuth.authName },
      component: () => import('../views/Flows.vue')
    },
    {
      path: '/Models',
      name: 'Models',
      meta: { authName: idsrvAuth.authName },
      component: () => import('../views/Models.vue')
    },
    {
      path: '/Entities/:propcollectionname',
      name: 'EntitiesCollection',
      meta: { authName: idsrvAuth.authName },
      props: true,
      component: () => import('../views/EntitiesView.vue')
    },
    {
      path: '/Entity/:collectionname',
      name: 'EntityView',
      meta: { authName: idsrvAuth.authName },
      props: true,
      component: () => import('../views/EntityView.vue')
    },
    {
      path: '/Entity/:collectionname/:id',
      name: 'EntityViewWithId',
      meta: { authName: idsrvAuth.authName },
      props: true,
      component: () => import('../views/EntityView.vue')
    },
    {
      path: '/Flow',
      name: 'Flow',
      meta: { authName: idsrvAuth.authName },
      component: () => import('../views/Flow.vue')
    },
    {
      path: '/Flow/:id',
      name: 'FlowWithId',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import('../views/Flow.vue')
    },
    {
      path: '/Model',
      name: 'Model',
      meta: { authName: idsrvAuth.authName },
      component: () => import('../views/Model.vue')
    },
    {
      path: '/Model/:id',
      name: 'ModelWithId',
      props: true,
      meta: { authName: idsrvAuth.authName },
      component: () => import('../views/Model.vue')
    },

  ]

  const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })
  return router;
}
export default configureRouter
