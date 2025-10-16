import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Store {
  id: number
  code: string
  name: string
  address: string
  city: string
  manager: string
  phone: string
  status: 'active' | 'inactive'
  icon: string
}

export interface StoreState {
  currentStore: number | null
  stores: Store[]
  setCurrentStore: (storeId: number) => void
  setStores: (stores: Store[]) => void
  isStoreSelected: () => boolean
}

// Sample stores
const sampleStores: Store[] = [
  {
    id: 1,
    code: 'JKT-01',
    name: 'Toko Gajah Nusa Jakarta Pusat',
    address: 'Jl. Raya Industri No. 123',
    city: 'Jakarta',
    manager: 'Budi Santoso',
    phone: '021-12345678',
    status: 'active',
    icon: '🏢'
  },
  {
    id: 2,
    code: 'BDG-01',
    name: 'Toko Gajah Nusa Bandung',
    address: 'Jl. Soekarno-Hatta No. 456',
    city: 'Bandung',
    manager: 'Siti Rahayu',
    phone: '022-87654321',
    status: 'active',
    icon: '🏪'
  },
  {
    id: 3,
    code: 'SBY-01',
    name: 'Toko Gajah Nusa Surabaya',
    address: 'Jl. Ahmad Yani No. 789',
    city: 'Surabaya',
    manager: 'Ahmad Yani',
    phone: '031-11223344',
    status: 'active',
    icon: '🏬'
  },
  {
    id: 4,
    code: 'SMG-01',
    name: 'Toko Gajah Nusa Semarang',
    address: 'Jl. Pandanaran No. 321',
    city: 'Semarang',
    manager: 'Dewi Kusuma',
    phone: '024-55667788',
    status: 'active',
    icon: '🏭'
  }
]

export const useStoreStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentStore: null,
      stores: sampleStores,

      setCurrentStore: (storeId) => set({ currentStore: storeId }),

      setStores: (stores) => set({ stores }),

      isStoreSelected: () => get().currentStore !== null
    }),
    {
      name: 'store-storage'
    }
  )
)
