<script lang="ts">
  let tickets = [
    { id: 'TKT-001', customer: 'PT Konstruksi Jaya', email: 'admin@konstruksijaya.com', subject: 'Order Status Inquiry', priority: 'High', status: 'Open', assignee: 'Agent 1', created: '2025-10-16 09:30', updated: '2025-10-16 10:15' },
    { id: 'TKT-002', customer: 'CV Bangun Sejahtera', email: 'info@banguns ejahtera.com', subject: 'Product Information Request', priority: 'Medium', status: 'Pending', assignee: 'Agent 2', created: '2025-10-16 08:45', updated: '2025-10-16 09:20' },
    { id: 'TKT-003', customer: 'Budi Santoso', email: 'budi@example.com', subject: 'Payment Issue', priority: 'High', status: 'Open', assignee: 'Agent 1', created: '2025-10-16 08:15', updated: '2025-10-16 08:45' },
    { id: 'TKT-004', customer: 'PT Mega Proyek', email: 'cs@megaproyek.com', subject: 'Delivery Delay Complaint', priority: 'Low', status: 'Resolved', assignee: 'Agent 3', created: '2025-10-15 16:30', updated: '2025-10-16 07:20' },
    { id: 'TKT-005', customer: 'Siti Nurhaliza', email: 'siti@example.com', subject: 'Product Defect Report', priority: 'High', status: 'In Progress', assignee: 'Agent 2', created: '2025-10-15 14:20', updated: '2025-10-16 06:45' }
  ]

  let searchQuery = ''
  let filterStatus = 'all'
  let filterPriority = 'all'

  $: filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  function getPriorityColor(priority: string) {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  function getStatusColor(status: string) {
    switch(status) {
      case 'Open': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'In Progress': return 'bg-purple-100 text-purple-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
</script>

<div class="p-6 bg-gray-100 min-h-screen">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">🎫 Support Tickets</h1>
    <p class="text-gray-600">Manage customer support requests</p>
  </div>

  <!-- Filters & Search -->
  <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <div class="flex-1">
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="🔍 Search tickets..."
          class="w-full px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
        />
      </div>

      <select bind:value={filterStatus} class="px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none">
        <option value="all">All Status</option>
        <option value="Open">Open</option>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
      </select>

      <select bind:value={filterPriority} class="px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none">
        <option value="all">All Priority</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <button class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition whitespace-nowrap">
        + New Ticket
      </button>
    </div>
  </div>

  <!-- Stats Summary -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-lg p-4 shadow">
      <div class="text-sm text-gray-600 mb-1">Total Tickets</div>
      <div class="text-2xl font-bold">{tickets.length}</div>
    </div>
    <div class="bg-white rounded-lg p-4 shadow">
      <div class="text-sm text-gray-600 mb-1">Open</div>
      <div class="text-2xl font-bold text-blue-600">{tickets.filter(t => t.status === 'Open').length}</div>
    </div>
    <div class="bg-white rounded-lg p-4 shadow">
      <div class="text-sm text-gray-600 mb-1">In Progress</div>
      <div class="text-2xl font-bold text-purple-600">{tickets.filter(t => t.status === 'In Progress').length}</div>
    </div>
    <div class="bg-white rounded-lg p-4 shadow">
      <div class="text-sm text-gray-600 mb-1">Resolved</div>
      <div class="text-2xl font-bold text-green-600">{tickets.filter(t => t.status === 'Resolved').length}</div>
    </div>
  </div>

  <!-- Tickets Table -->
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Ticket ID</th>
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Customer</th>
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Subject</th>
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Priority</th>
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Assignee</th>
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Updated</th>
            <th class="text-left py-4 px-6 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredTickets as ticket}
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
              <td class="py-4 px-6">
                <a href="/tickets/{ticket.id}" class="text-blue-600 font-mono font-bold hover:underline">
                  {ticket.id}
                </a>
              </td>
              <td class="py-4 px-6">
                <div class="font-semibold">{ticket.customer}</div>
                <div class="text-sm text-gray-500">{ticket.email}</div>
              </td>
              <td class="py-4 px-6">{ticket.subject}</td>
              <td class="py-4 px-6">
                <span class="px-3 py-1 rounded-full text-xs font-semibold {getPriorityColor(ticket.priority)}">
                  {ticket.priority}
                </span>
              </td>
              <td class="py-4 px-6">
                <span class="px-3 py-1 rounded-full text-xs font-semibold {getStatusColor(ticket.status)}">
                  {ticket.status}
                </span>
              </td>
              <td class="py-4 px-6 text-sm">{ticket.assignee}</td>
              <td class="py-4 px-6 text-sm text-gray-600">{ticket.updated}</td>
              <td class="py-4 px-6">
                <button class="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  View →
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      {#if filteredTickets.length === 0}
        <div class="text-center py-12">
          <div class="text-6xl mb-4">🔍</div>
          <div class="text-xl font-semibold text-gray-700 mb-2">No tickets found</div>
          <div class="text-gray-500">Try adjusting your filters or search query</div>
        </div>
      {/if}
    </div>
  </div>
</div>
