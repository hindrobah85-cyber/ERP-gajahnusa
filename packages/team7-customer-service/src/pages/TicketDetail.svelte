<script lang="ts">
  export let id: string
  
  let ticket = {
    id: 'TKT-001',
    customer: 'PT Konstruksi Jaya',
    email: 'admin@konstruksijaya.com',
    subject: 'Order Status Inquiry',
    priority: 'High',
    status: 'Open',
    assignee: 'Agent 1',
    created: '2025-10-16 09:30',
    description: 'Customer inquiring about the status of their order #ORD-12345. They need confirmation on delivery date and tracking information.'
  }

  let conversation = [
    { sender: 'Customer', time: '09:30', message: 'Hello, I need to check the status of my order #ORD-12345' },
    { sender: 'Agent 1', time: '09:35', message: 'Hello! Let me check that for you. One moment please.' },
    { sender: 'Agent 1', time: '09:40', message: 'Your order is currently in transit. Expected delivery: October 18, 2025' },
    { sender: 'Customer', time: '09:42', message: 'Thank you! Can I get the tracking number?' }
  ]

  let newMessage = ''
</script>

<div class="p-6 bg-gray-100 min-h-screen">
  <div class="mb-6">
    <a href="/tickets" class="text-blue-600 hover:underline mb-2 inline-block">← Back to Tickets</a>
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Ticket: {ticket.id}</h1>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Main Content -->
    <div class="lg:col-span-2 space-y-6">
      <!-- Ticket Info -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-xl font-bold mb-4">{ticket.subject}</h2>
        <p class="text-gray-700 mb-4">{ticket.description}</p>
        
        <div class="flex gap-4">
          <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
            {ticket.priority}
          </span>
          <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
            {ticket.status}
          </span>
        </div>
      </div>

      <!-- Conversation -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold mb-4">💬 Conversation</h3>
        
        <div class="space-y-4 mb-4">
          {#each conversation as msg}
            <div class="flex gap-3 {msg.sender.includes('Agent') ? 'justify-end' : ''}">
              <div class="{msg.sender.includes('Agent') ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg p-4 max-w-md">
                <div class="font-semibold text-sm mb-1">{msg.sender} <span class="text-gray-500 font-normal">{msg.time}</span></div>
                <div>{msg.message}</div>
              </div>
            </div>
          {/each}
        </div>

        <div class="flex gap-2">
          <input
            type="text"
            bind:value={newMessage}
            placeholder="Type your message..."
            class="flex-1 px-4 py-3 border-2 rounded-lg focus:border-blue-500 outline-none"
          />
          <button class="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Send
          </button>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold mb-4">Customer Info</h3>
        <div class="space-y-3">
          <div>
            <div class="text-sm text-gray-600">Name</div>
            <div class="font-semibold">{ticket.customer}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Email</div>
            <div class="font-semibold">{ticket.email}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Assigned To</div>
            <div class="font-semibold">{ticket.assignee}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600">Created</div>
            <div class="font-semibold">{ticket.created}</div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold mb-4">Actions</h3>
        <div class="space-y-2">
          <button class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            ✓ Resolve Ticket
          </button>
          <button class="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Assign to Me
          </button>
          <button class="w-full px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Change Priority
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
