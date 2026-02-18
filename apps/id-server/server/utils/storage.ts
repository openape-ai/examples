import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs-lite'

const storage = createStorage({ driver: fsDriver({ base: './.data/id-server-db' }) })

export const useAppStorage = () => storage
