<script lang="ts">
  import { onMount } from 'svelte'

  let stats = {
    openTickets: 24,
    pendingTickets: 12,
    resolvedToday: 45,
    avgResponseTime: '12 min'
  }

  let recentTickets = [
    { id: 'TKT-001', customer: 'PT Konstruksi Jaya', subject: 'Order Status Inquiry', priority: 'High', status: 'Open', time: '5 min ago' },
    { id: 'TKT-002', customer: 'CV Bangun Sejahtera', subject: 'Product Information', priority: 'Medium', status: 'Pending', time: '15 min ago' },
    { id: 'TKT-003', customer: 'Budi Santoso', subject: 'Payment Issue', priority: 'High', status: 'Open', time: '30 min ago' },
    { id: 'TKT-004', customer: 'PT Mega Proyek', subject: 'Delivery Delay', priority: 'Low', status: 'Resolved', time: '1 hour ago' }
  ]

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
      case 'Resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
</script>

<div class="p-6 bg-gray-100 min-h-screen">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">📊 Dashboard</h1>
    <p class="text-gray-600">Customer Service Overview</p>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
      <div class="text-sm opacity-80 mb-2">Open Tickets</div>
      <div class="text-4xl font-bold mb-2">{stats.openTickets}</div>
      <div class="text-sm opacity-90">+3 from yesterday</div>
    </div>

    <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg">
      <div class="text-sm opacity-80 mb-2">Pending Response</div>
      <div class="text-4xl font-bold mb-2">{stats.pendingTickets}</div>
      <div class="text-sm opacity-90">Needs attention</div>
    </div>

    <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
      <div class="text-sm opacity-80 mb-2">Resolved Today</div>
      <div class="text-4xl font-bold mb-2">{stats.resolvedToday}</div>
      <div class="text-sm opacity-90">+8 from yesterday</div>
    </div>

    <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
      <div class="text-sm opacity-80 mb-2">Avg Response Time</div>
      <div class="text-4xl font-bold mb-2">{stats.avgResponseTime}</div>
      <div class="text-sm opacity-90">-2 min improvement</div>
    </div>
  </div>

  <!-- Recent Tickets -->
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold">🎫 Recent Tickets</h2>
      <a href="/tickets" class="text-blue-600 hover:text-blue-700 font-semibold">View All →</a>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-gray-200">
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Ticket ID</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th class="text-left py-3 px-4 font-semibold text-gray-700">Time</th>
          </tr>
        </thead>
        <tbody>
          {#each recentTickets as ticket}
            <tr class="border-b border-gray-100 hover:bg-gray-50 transition">
              <td class="py-3 px-4">
                <a href="/tickets/{ticket.id}" class="text-blue-600 font-mono font-semibold hover:underline">
                  {ticket.id}
                </a>
              </td>
              <td class="py-3 px-4">{ticket.customer}</td>
              <td class="py-3 px-4">{ticket.subject}</td>
              <td class="py-3 px-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold {getPriorityColor(ticket.priority)}">
                  {ticket.priority}
                </span>
              </td>
              <td class="py-3 px-4">
                <span class="px-3 py-1 rounded-full text-xs font-semibold {getStatusColor(ticket.status)}">
                  {ticket.status}
                </span>
              </td>
              <td class="py-3 px-4 text-sm text-gray-600">{ticket.time}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer">
      <div class="text-4xl mb-3">🎫</div>
      <h3 class="text-lg font-bold mb-2">Create New Ticket</h3>
      <p class="text-gray-600 text-sm">Open a new support ticket for customer</p>
    </div>

    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer">
      <div class="text-4xl mb-3">💬</div>
      <h3 class="text-lg font-bold mb-2">Live Chat</h3>
      <p class="text-gray-600 text-sm">Start live chat with customers</p>
    </div>

    <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer">
      <div class="text-4xl mb-3">📚</div>
      <h3 class="text-lg font-bold mb-2">Knowledge Base</h3>
      <p class="text-gray-600 text-sm">Browse help articles and guides</p>
    </div>
  </div>
</div>
