<script lang="ts">
  let customers = [
    { id: 1, name: 'PT Konstruksi Jaya', email: 'admin@konstruksijaya.com', phone: '021-5551234', tickets: 12, status: 'Active', since: '2024-01-15' },
    { id: 2, name: 'CV Bangun Sejahtera', email: 'info@bangun.com', phone: '022-4442345', tickets: 8, status: 'Active', since: '2024-03-20' },
    { id: 3, name: 'Budi Santoso', email: 'budi@example.com', phone: '081234567890', tickets: 5, status: 'Active', since: '2024-06-10' },
    { id: 4, name: 'PT Mega Proyek', email: 'cs@mega.com', phone: '031-3334567', tickets: 15, status: 'VIP', since: '2023-11-05' }
  ]

  let searchQuery = ''
  
  $: filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
</script>

<div class="p-6 bg-gray-100 min-h-screen">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">👥 Customers</h1>
    <p class="text-gray-600">Customer database and information</p>
  </div>

  <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="🔍 Search customers..."
      class="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
    />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each filteredCustomers as customer}
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold mb-1">{customer.name}</h3>
            <div class="text-sm text-gray-600">{customer.email}</div>
          </div>
          <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            {customer.status}
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div class="text-sm text-gray-600">Phone</div>
            <div class="font-semibold">{customer.phone}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Total Tickets</div>
            <div class="font-semibold">{customer.tickets}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Customer Since</div>
            <div class="font-semibold">{customer.since}</div>
          </div>
        </div>

        <a href="/customers/{customer.id}" class="text-blue-600 hover:underline font-semibold">
          View Profile →
        </a>
      </div>
    {/each}
  </div>
</div>
