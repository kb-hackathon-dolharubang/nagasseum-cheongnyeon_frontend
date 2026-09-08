const registeredStores = new Map()

export function trackStore({ store }) {
  registeredStores.set(store.$id, store)
}

export function resetOtherStores(keepStoreId) {
  registeredStores.forEach((store, id) => {
    if (id === keepStoreId) return
    store.$dispose()
    registeredStores.delete(id)
  })
}
